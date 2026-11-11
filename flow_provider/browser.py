"""
Lifecycle del browser Playwright para Google Flow.
startup() → llamado desde FastAPI lifespan al arrancar.
shutdown() → llamado desde FastAPI lifespan al cerrar.
"""
import asyncio
import os
import socket
import subprocess
import sys
import time
from pathlib import Path
from urllib.parse import urlsplit
from playwright.async_api import async_playwright, BrowserContext, Page, Playwright

from . import settings

_playwright: Playwright | None = None
_context: BrowserContext | None = None
_page: Page | None = None
_owns_browser: bool = True  # False = conectado via CDP (Chrome de alguien, no cerrar)
SEL_SETTINGS_TRIGGER = 'button:has(mat-icon:text-is("tune")), button:has(i:text-is("tune")), button[aria-label="Botón de configuración"], button[aria-label="Activador de ajustes"]'
_lock = asyncio.Lock()
_last_project_url: str | None = None


def _cdp_up(host: str, port: int, timeout: float = 0.4) -> bool:
    """True si hay algo escuchando en la puerta de depuración CDP."""
    try:
        with socket.create_connection((host, port), timeout=timeout):
            return True
    except OSError:
        return False


def _find_chrome() -> str | None:
    """Localiza el ejecutable de Google Chrome (Windows/macOS/Linux)."""
    env = os.getenv("FLOW_CHROME_PATH")
    if env and Path(env).exists():
        return env
    candidates: list[Path] = []
    if sys.platform.startswith("win"):
        pf = os.getenv("PROGRAMFILES", r"C:\Program Files")
        pf86 = os.getenv("PROGRAMFILES(X86)", r"C:\Program Files (x86)")
        local = os.getenv("LOCALAPPDATA", "")
        candidates += [Path(pf) / "Google" / "Chrome" / "Application" / "chrome.exe",
                       Path(pf86) / "Google" / "Chrome" / "Application" / "chrome.exe"]
        if local:
            candidates.append(Path(local) / "Google" / "Chrome" / "Application" / "chrome.exe")
    elif sys.platform == "darwin":
        candidates.append(Path("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"))
    else:
        candidates += [Path("/usr/bin/google-chrome"), Path("/usr/bin/google-chrome-stable"),
                       Path("/opt/google/chrome/chrome")]
    for c in candidates:
        try:
            if c.exists():
                return str(c)
        except OSError:
            continue
    return None


async def launch_detached_chrome(url: str = "https://flow.google.com/") -> bool:
    """Arranca un Chrome destacado con depuración remota y el perfil de sesión.
    La ventana queda ABIERTA aunque este proceso Python termine."""
    exe = _find_chrome()
    if not exe:
        print("  [chrome] No encontré Google Chrome (define FLOW_CHROME_PATH). Usando modo Playwright.")
        return False
    profile = Path(settings.FLOW_CHROME_PROFILE)
    profile.mkdir(parents=True, exist_ok=True)
    for lock_name in ["SingletonLock", "lock", "Lock"]:
        try:
            (profile / lock_name).unlink(missing_ok=True)
        except Exception:
            pass
    args = [
        exe,
        f"--remote-debugging-port={settings.FLOW_CDP_PORT}",
        f"--user-data-dir={profile}",
        "--no-first-run",
        "--no-default-browser-check",
        "--no-sandbox",
        "--disable-blink-features=AutomationControlled",
        "--window-size=1280,900",
        url,
    ]
    popen_kwargs: dict = {}
    if sys.platform.startswith("win"):
        popen_kwargs["creationflags"] = 0x00000208  # DETACHED_PROCESS | NEW_PROCESS_GROUP
    else:
        popen_kwargs["start_new_session"] = True
    try:
        subprocess.Popen(args, close_fds=True, **popen_kwargs)
    except Exception as e:
        print(f"  [chrome] No se pudo lanzar Chrome destacado: {e}")
        return False
    for _ in range(40):
        if _cdp_up(settings.FLOW_CDP_HOST, settings.FLOW_CDP_PORT):
            print(f"  [chrome] Chrome persistente en {settings.FLOW_CDP_URL} (queda ABIERTO).")
            return True
        time.sleep(0.5)
    print("  [chrome] Chrome lanzado pero la puerta CDP no respondió a tiempo.")
    return False


async def startup() -> None:
    global _playwright, _context, _page, _owns_browser
    _playwright = await async_playwright().start()

    # 1) CDP: conectarse a un Chrome ya abierto (o lanzarlo). La ventana NO se cierra.
    if settings.FLOW_USE_CDP:
        if not _cdp_up(settings.FLOW_CDP_HOST, settings.FLOW_CDP_PORT) and settings.FLOW_CDP_AUTO_LAUNCH:
            await launch_detached_chrome()
        if _cdp_up(settings.FLOW_CDP_HOST, settings.FLOW_CDP_PORT):
            try:
                browser = await _playwright.chromium.connect_over_cdp(settings.FLOW_CDP_URL)
                _context = browser.contexts[0] if browser.contexts else await browser.new_context(accept_downloads=True)
                _page = _context.pages[0] if _context.pages else await _context.new_page()
                _owns_browser = False
                try:
                    await _page.set_viewport_size({"width": 1280, "height": 900})
                except Exception:
                    pass
                return
            except Exception as e:
                print(f"  [flow-browser] CDP no disponible ({e}); volviendo a Playwright launch.")
                _context = None

    # 2) Fallback: lanza su propio navegador (se cierra al terminar el comando).
    session_file = settings.FLOW_SESSION_FILE
    use_session = bool(session_file and Path(session_file).exists())

    if use_session:
        browser = await _playwright.chromium.launch(
            headless=settings.FLOW_HEADLESS,
            channel="chrome",
            args=["--no-sandbox", "--disable-blink-features=AutomationControlled"],
        )
        _context = await browser.new_context(
            storage_state=session_file,
            accept_downloads=True,
            viewport={"width": 1280, "height": 900},
        )
    else:
        # Limpieza preventiva de archivos de bloqueo (locks) de Chrome antes de arrancar
        profile_path = settings.FLOW_CHROME_PROFILE
        if profile_path:
            p_dir = Path(profile_path)
            if p_dir.exists():
                for lock_name in ["SingletonLock", "lock", "Lock"]:
                    lock_file = p_dir / lock_name
                    if lock_file.exists():
                        try:
                            # En Windows a veces SingletonLock es un archivo, en Unix es un symlink
                            lock_file.unlink(missing_ok=True)
                        except Exception:
                            # Ignorar si no se puede borrar porque está en uso real
                            pass
                            
        profile_dir = Path(settings.FLOW_CHROME_PROFILE) if settings.FLOW_CHROME_PROFILE else Path("/tmp/flow-profile")
        dl_dir = profile_dir.parent / "downloads"
        dl_dir.mkdir(parents=True, exist_ok=True)
        _context = await _playwright.chromium.launch_persistent_context(
            user_data_dir=str(profile_dir),
            headless=settings.FLOW_HEADLESS,
            channel="chrome",
            args=["--no-sandbox", "--disable-blink-features=AutomationControlled"],
            accept_downloads=True,
            downloads_path=str(dl_dir),
            viewport={"width": 1280, "height": 900},
        )

    _owns_browser = True
    _page = _context.pages[0] if _context.pages else await _context.new_page()


async def shutdown() -> None:
    global _playwright, _context, _page, _owns_browser
    # Solo cerramos el navegador si LO LANZAMOS nosotros. Con CDP desconectamos
    # y dejamos la ventana de Chrome abierta para el humano y el siguiente comando.
    if _owns_browser and _context:
        try:
            await _context.close()
        except Exception:
            pass
    if _playwright:
        await _playwright.stop()
    _playwright = _context = _page = None
    _owns_browser = True


def _remember_project(page) -> None:
    """Conservar el proyecto real; no depende del output_dir de cada motor."""
    global _last_project_url
    if page is None:
        return
    parsed = urlsplit(page.url)
    if parsed.scheme == "https" and parsed.hostname in ("flow.google.com", "labs.google") and "/project/" in parsed.path:
        _last_project_url = page.url


async def _restore_project(page) -> None:
    if not _last_project_url:
        raise RuntimeError("Chrome se cerró y no hay un proyecto Flow registrado para reanudar.")
    await page.goto(_last_project_url, wait_until="domcontentloaded", timeout=60_000)
    await page.locator(SEL_SETTINGS_TRIGGER).wait_for(state="visible", timeout=45_000)
    print(f"  [flow-browser] Proyecto restaurado: {page.url}")


async def get_page() -> Page:
    global _page, _context
    # La URL sigue disponible en el objeto Page aunque su ventana se haya cerrado.
    _remember_project(_page)
    if _context is None:
        await startup()
    try:
        project_pages = [p for p in _context.pages if not p.is_closed() and "/project/" in p.url]
        if project_pages:
            _page = project_pages[0]
        elif _page is None or _page.is_closed():
            active = [p for p in _context.pages if not p.is_closed()]
            _page = active[0] if active else await _context.new_page()
        await _page.evaluate("() => true")
    except Exception as err:
        print(f"  [flow-browser] Sesión o página cerrada ({err}). Reanudando proyecto Flow...")
        try:
            await shutdown()
        except Exception:
            pass
        await startup()
        # Propagar el error si la restauración falla, nunca devolver about:blank.
        await _restore_project(_page)
    else:
        if _last_project_url and _page.url == "about:blank":
            await _restore_project(_page)
    _remember_project(_page)
    return _page


def get_lock() -> asyncio.Lock:
    return _lock
