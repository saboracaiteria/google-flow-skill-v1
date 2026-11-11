"""
Creación y navegación de proyectos en Google Flow.
"""
import re
import json
from pathlib import Path

from .browser import get_page, SEL_SETTINGS_TRIGGER
from . import settings

FLOW_BASE_URL = "https://flow.google.com/"
NEW_PROJECT_BUTTON = re.compile(r"Proyecto nuevo|Nuevo proyecto|New project|Novo projeto", re.I)
# Marcador del ultimo proyecto creado (session/last_project.json) para reutilizarlo.
PROJECT_MARKER = Path(settings.FLOW_CHROME_PROFILE).parent / "last_project.json"


def _load_last_project() -> tuple[str | None, str | None]:
    try:
        d = json.loads(PROJECT_MARKER.read_text(encoding="utf-8"))
        return d.get("uuid"), d.get("url")
    except Exception:
        return None, None


def _save_last_project(uuid: str, url: str) -> None:
    try:
        PROJECT_MARKER.parent.mkdir(parents=True, exist_ok=True)
        PROJECT_MARKER.write_text(json.dumps({"uuid": uuid, "url": url}), encoding="utf-8")
    except Exception:
        pass


def _clear_last_project() -> None:
    try:
        PROJECT_MARKER.unlink(missing_ok=True)
    except Exception:
        pass


async def _current_project_uuid(page) -> str | None:
    m = re.search(r"/project/([A-Za-z0-9_-]+)", page.url or "")
    return m.group(1) if m else None


async def ensure_project(force_new: bool = False) -> tuple[str, str]:
    """Reutiliza el proyecto ya abierto o el ultimo creado; solo crea uno nuevo
    si no hay ninguno o si force_new=True. Evita acumular proyectos en Flow."""
    page = await get_page()
    if not force_new:
        uuid = await _current_project_uuid(page)
        if uuid:
            _save_last_project(uuid, page.url)
            return uuid, page.url
        # ¿Hay un proyecto abierto en otra pestana del mismo Chrome?
        from . import browser
        if browser._context:
            for p in list(browser._context.pages):
                try:
                    if p.is_closed():
                        continue
                    u = await _current_project_uuid(p)
                    if u:
                        browser._page = p
                        _save_last_project(u, p.url)
                        return u, p.url
                except Exception:
                    continue
        # ¿Conocemos un ultimo proyecto persistente?
        last_uuid, _ = _load_last_project()
        if last_uuid:
            try:
                await navigate_to_project(last_uuid)
                return last_uuid, page.url
            except Exception:
                _clear_last_project()  # el proyecto ya no existe: crear uno nuevo
    uuid, url = await create_project()
    _save_last_project(uuid, url)
    return uuid, url

async def _dismiss_fullscreen_viewer(page) -> None:
    """Presiona Escape para cerrar cualquier visor/lightbox que se haya abierto accidentalmente."""
    try:
        await page.keyboard.press("Escape")
        await page.wait_for_timeout(1000)
    except Exception:
        pass


PANEL_OVERLAY = '[role="dialog"], [aria-modal="true"]'


async def _await_user_dismisses_panel(page, seconds: int = 15) -> None:
    """Si Flow muestra un panel de novedades o anuncio encima de la interfaz,
    intenta cerrarlo automáticamente o espera."""
    # Primero intentar cerrar con botones comunes como Começar, Entendido, etc.
    try:
        dismiss_btn = page.get_by_role("button", name=re.compile(r"Começar|Comenzar|Entendido|Got it|Dismiss", re.I)).first
        if await dismiss_btn.count() > 0 and await dismiss_btn.is_visible():
            await dismiss_btn.click()
            await page.wait_for_timeout(1000)
            return
    except Exception:
        pass

    panel = page.locator(PANEL_OVERLAY).first
    try:
        await panel.wait_for(state="visible", timeout=3_000)
    except Exception:
        return  # No apareció: entrada normal.

    print("\n>>> Google Flow muestra un panel o anuncio sobre la interfaz.")
    try:
        await page.keyboard.press("Escape")
        await page.wait_for_timeout(1000)
    except Exception:
        pass
    try:
        await panel.wait_for(state="hidden", timeout=seconds * 1_000)
        print(">>> Panel cerrado. Continuando.\n")
    except Exception:
        print(">>> El panel sigue abierto. Continuando de todas formas.\n")
    await page.wait_for_timeout(1_500)


async def ensure_all_media_tab(page) -> None:
    """Asegura que el panel lateral izquierdo esté en 'Todo el contenido multimedia'.
    
    Debe llamarse antes de cualquier operación que necesite encontrar
    imágenes o videos en el canvas principal del proyecto.
    """
    try:
        # El botón tiene un ícono google-symbols "dashboard" y el texto accesible oculto
        all_media_btn = page.locator('button:has(:is(i, mat-icon):text-is("dashboard")), button:has-text("Todas as mídias"), button:has-text("Todo el contenido multimedia")')
        
        if await all_media_btn.count() > 0 and await all_media_btn.first.is_visible():
            await all_media_btn.first.click()
            await page.wait_for_timeout(1500)
    except Exception:
        pass


async def _wait_for_settings(page) -> None:
    try:
        await page.locator('flow-rich-text-editor, div.ProseMirror, flow-base-prompt-box, button:has(:is(i, mat-icon):text-is("tune"))').first.wait_for(state="visible", timeout=15_000)
    except Exception:
        debug_dir = Path(__file__).resolve().parent.parent / "scratch"
        debug_dir.mkdir(exist_ok=True)
        try:
            await page.screenshot(path=str(debug_dir / "project_settings_error.png"))
            (debug_dir / "project_settings_error.html").write_text(await page.content(), encoding="utf-8")
            print(f"  [flow] Captura y HTML de diagnóstico en {debug_dir}")
        except Exception as debug_error:
            print(f"  [flow] No se pudo guardar el diagnóstico: {debug_error}")
        raise


async def create_project() -> tuple[str, str]:
    """Crea un proyecto nuevo en Flow. Retorna (project_uuid, project_url).
    Debe llamarse mientras se sostiene get_lock().
    """
    page = await get_page()
    await page.goto(FLOW_BASE_URL, wait_until="domcontentloaded", timeout=60000)
    await page.wait_for_timeout(3000)

    await _await_user_dismisses_panel(page)

    # La etiqueta cambia según idioma y versión de Flow.
    new_btn = page.get_by_role("button", name=NEW_PROJECT_BUTTON).first
    await new_btn.wait_for(state="visible", timeout=45_000)
    await new_btn.click()

    # Esperar URL de proyecto
    await page.wait_for_url("**/project/**", timeout=15000)
    project_url = page.url
    project_uuid = project_url.rstrip("/").split("/")[-1]

    # Esperar SPA render — CRÍTICO sin esto pantalla negra
    await page.wait_for_timeout(5000)
    await _wait_for_settings(page)

    await _dismiss_fullscreen_viewer(page)
    # No clicar em ensure_all_media_tab ao criar projeto para manter o foco na caixa de prompt
    return project_uuid, project_url


async def navigate_to_project(project_uuid: str) -> None:
    """Navega a un proyecto existente. Debe llamarse con lock."""
    page = await get_page()
    if f"/project/{project_uuid}" not in page.url:
        target_url = f"https://flow.google.com/project/{project_uuid}"
        await page.goto(target_url, wait_until="domcontentloaded", timeout=60000)
        await page.wait_for_timeout(5000)
        await _await_user_dismisses_panel(page)
        await _wait_for_settings(page)

    # Siempre al entrar al proyecto: cerrar visores accidentales y asegurar pestaña correcta
    await _dismiss_fullscreen_viewer(page)
    await ensure_all_media_tab(page)
