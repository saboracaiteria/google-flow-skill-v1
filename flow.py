#!/usr/bin/env python
"""
flow.py - CLI para manejar Google Flow (labs.google) con Playwright.

Esta es la UNICA puerta de entrada. Un agente de IA NO necesita escribir
codigo de Playwright: solo llama a estos comandos.

Comandos
--------
  python flow.py login
      Abre el navegador para loguearte en Google con tu cuenta. La sesion
      queda guardada de forma PERMANENTE en session/flowbot-profile.
      Solo se hace una vez (o cuando caduque la sesion).

  python flow.py status
      Dice si ya hay sesion guardada.

  python flow.py chrome
      Deja un Chrome real y persistente (CDP, perfil de session/) ABIERTO en
      127.0.0.1:9223. Los comandos image/video/batch/short se conectan a el y NO
      lo cierran al terminar (mas rapido y estable). FLOW_USE_CDP=false lo desactiva.

  python flow.py image --prompt "..." [--ratio 9:16] [--model "Nano Banana 2 Lite"]
                        [--image referencia.png] [--name escena1] [--out outputs]
      Genera UNA imagen (texto->imagen, o imagen+prompt->imagen si das --image).

  python flow.py video --prompt "..." [--ratio 9:16] [--model "Veo 3.1 - Lite"]
                        [--duration 8s]
                        [--start frame.png] [--end frame_final.png]
                        [--name escena1] [--out outputs]
      Genera UN video. Sin --start = texto->video. Con --start = anima esa
      imagen. Con --start y --end = interpola inicio->fin.

  python flow.py batch guion.json [--out outputs]
      Ejecuta una lista de trabajos EN ORDEN dentro de UN solo proyecto Flow.
      Ver examples/guion_ejemplo.json para el formato.

Modelos validos
---------------
  Imagen: "Nano Banana 2 Lite", "Nano Banana 2", "Nano Banana Pro", "Imagen 4"
  Video : "Veo 3.1 - Lite", "Veo 3.1 - Fast", "Veo 3.1 - Quality", "Omni 1.1 Flash"
  Ratios: "9:16", "16:9", "1:1", "4:3", "3:4"
"""
import argparse
import asyncio
import json
import re
import shutil
import sys
from datetime import datetime
from pathlib import Path

from playwright.async_api import async_playwright

import flow_provider as flow
from flow_provider import settings
from flow_provider import compose, policy_guard

# Consola UTF-8 en Windows (acentos/emojis sin romper la salida) y flush inmediato.
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", line_buffering=True)
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", line_buffering=True)

BASE_DIR = Path(__file__).parent.resolve()
DEFAULT_OUT = BASE_DIR / "outputs"
FLOW_URL = "https://flow.google.com/"


# ---------------------------------------------------------------------------
# Utilidades
# ---------------------------------------------------------------------------
def _stamp() -> str:
    return datetime.now().strftime("%Y%m%d_%H%M%S")


def _safe(name: str) -> str:
    return "".join(c for c in name if c.isalnum() or c in ("_", "-", ".")) or _stamp()


def _out_path(out_dir: Path, name: str, ext: str) -> str:
    out_dir.mkdir(parents=True, exist_ok=True)
    return str(out_dir / f"{_safe(name)}.{ext}")


def _resolve_asset(project_dir: Path, ref: str | None) -> str | None:
    """Resuelve una referencia a un asset (start/end/image) dentro del batch.

    Si 'ref' existe tal cual, se usa. Si no, se busca por nombre dentro de la
    carpeta del proyecto (con o sin .png). Asi el guion puede encadenar solo
    con el 'name' de un job anterior, sin rutas largas.
    """
    if not ref:
        return ref
    p = Path(ref)
    if p.exists():
        return str(p)
    cand = project_dir / p.name
    if cand.exists():
        return str(cand)
    if not cand.suffix:
        cand_png = project_dir / f"{p.name}.png"
        if cand_png.exists():
            return str(cand_png)
    return ref  # se deja igual; fallara con error claro si no existe


def session_exists() -> bool:
    profile = Path(settings.FLOW_CHROME_PROFILE)
    return profile.exists() and any(profile.iterdir())


# ---------------------------------------------------------------------------
# login / status
# ---------------------------------------------------------------------------
async def cmd_login(_args) -> int:
    profile = Path(settings.FLOW_CHROME_PROFILE)
    profile.mkdir(parents=True, exist_ok=True)
    print("=== LOGIN GOOGLE FLOW ===")
    print(f"Perfil persistente: {profile}")
    print("Se abrira Chrome. Inicia sesion con tu cuenta de Google.")
    print("Cuando aparezca el botón de proyecto nuevo, el script guarda y cierra solo.")
    print()

    async with async_playwright() as p:
        ctx = await p.chromium.launch_persistent_context(
            user_data_dir=str(profile),
            headless=False,
            channel="chrome",
            args=["--disable-blink-features=AutomationControlled"],
            viewport={"width": 1280, "height": 900},
        )
        page = ctx.pages[0] if ctx.pages else await ctx.new_page()
        await page.goto(FLOW_URL)

        # Poll hasta detectar que ya estamos dentro de Flow logueados.
        logged = False
        for i in range(80):  # ~240s
            await page.wait_for_timeout(3000)
            url = page.url
            try:
                ready = await page.get_by_role(
                    "button", name=re.compile(r"Proyecto nuevo|Nuevo proyecto|New project|Novo projeto", re.I)
                ).count() > 0
            except Exception:
                ready = False
            if ready and "accounts.google" not in url:
                logged = True
                print("  -> Sesion detectada. Guardando...")
                await page.wait_for_timeout(3000)
                break
            if i % 5 == 0:
                print(f"  esperando login... ({url})")

        await ctx.close()

    if logged:
        print("OK: sesion guardada. Ya puedes generar imagenes/videos.")
        return 0
    print("AVISO: no se detecto login. Vuelve a correr 'python flow.py login'.")
    return 1


async def cmd_status(_args) -> int:
    if session_exists():
        print(f"OK: sesion presente en {settings.FLOW_CHROME_PROFILE}")
        return 0
    print("SIN SESION. Corre primero: python flow.py login")
    return 1


async def cmd_chrome(_args) -> int:
    """Deja un Chrome persistente (CDP) abierto y lo reutiliza en los demas comandos."""
    print("=== CHROME PERSISTENTE (CDP) ===")
    if flow.cdp_up(settings.FLOW_CDP_HOST, settings.FLOW_CDP_PORT):
        print(f"Ya hay un Chrome persistente en {settings.FLOW_CDP_URL}.")
        return 0
    ok = await flow.launch_detached_chrome(FLOW_URL)
    if not ok:
        print("No se pudo dejar un Chrome persistente.")
        print("Comprueba que Google Chrome este instalado o define FLOW_CHROME_PATH.")
        return 1
    print(f"Chrome queda ABIERTO en {settings.FLOW_CDP_URL}.")
    print("Si hace falta, inicia sesion ahi; image/video/batch/short lo reutilizaran sin cerrarlo.")
    return 0


# ---------------------------------------------------------------------------
# Generadores atomicos (asumen proyecto YA abierto)
# ---------------------------------------------------------------------------
async def _gen_image(prompt, ratio, model, count, image, out_path) -> str:
    if count != 1:
        raise ValueError("Esta CLI descarga una imagen por trabajo. Para un lote, usa varios jobs image con count=1.")
    await flow.select_image_mode(aspect_ratio=ratio, count=count, model=model)
    if image:
        await flow.upload_standalone_image(image)
    pre = await flow.get_canvas_count()
    await flow.submit_prompt(prompt)
    await flow.wait_for_image(pre_submit_count=pre)
    return await flow.download_latest(out_path, resolution="1K", is_video=False)


async def _gen_video(prompt, ratio, model, count, start, end, out_path, duration=None) -> str:
    if count != 1:
        raise ValueError("Esta CLI descarga un video por trabajo. Para un lote, usa varios jobs video con count=1.")
    # Modo con fotogramas (continuidad) con degradacion graciosa: si adjuntar el frame
    # falla (UI inestable tras la primera generacion), se genera el clip texto->video.
    frame_mode = bool(start or end)
    if frame_mode:
        try:
            await flow.select_video_mode(mode="fotogramas", model=model, aspect_ratio=ratio, count=count, duration=duration)
            if start and end:
                await flow.upload_frame(start, slot="initial")
                await asyncio.sleep(3)
                await flow.upload_frame(end, slot="final")
            elif start:
                await flow.upload_frame(start, slot="initial")
            else:
                await flow.upload_frame(end, slot="final")
        except Exception as e:
            print(f"    [video] No se pudo adjuntar el frame ({e}); continuar texto->video.")
            await flow.select_video_mode(mode="texto", model=model, aspect_ratio=ratio, count=count, duration=duration)
    else:
        await flow.select_video_mode(mode="texto", model=model, aspect_ratio=ratio, count=count, duration=duration)
    pre = await flow.get_canvas_count()
    await flow.submit_prompt(prompt)
    # Paciencia ampliada: Flow puede tardar mas de 3 min bajo carga; esperar evita
    # abandonar un render que iba a concluir y gastar creditos de nuevo.
    await flow.wait_for_video(pre_submit_count=pre, timeout_ms=300000)
    return await flow.download_latest(out_path, resolution="720p", is_video=True)


# ---------------------------------------------------------------------------
# Comandos de generacion
# ---------------------------------------------------------------------------
async def cmd_image(args) -> int:
    if not session_exists():
        print("SIN SESION. Corre primero: python flow.py login")
        return 1
    out_dir = Path(args.out)
    name = args.name or f"imagen_{_stamp()}"
    out_path = _out_path(out_dir, name, "png")
    await flow.startup()
    try:
        await flow.ensure_project(force_new=getattr(args, "new_project", False))
        saved = await _gen_image(args.prompt, args.ratio, args.model, args.count, args.image, out_path)
        print(f"OK imagen -> {saved}")
        return 0
    finally:
        await flow.shutdown()


async def cmd_video(args) -> int:
    if not session_exists():
        print("SIN SESION. Corre primero: python flow.py login")
        return 1
    out_dir = Path(args.out)
    name = args.name or f"video_{_stamp()}"
    out_path = _out_path(out_dir, name, "mp4")
    await flow.startup()
    try:
        await flow.ensure_project(force_new=getattr(args, "new_project", False))
        saved = await _gen_video(args.prompt, args.ratio, args.model, args.count, args.start, args.end, out_path, args.duration)
        print(f"OK video -> {saved}")
        return 0
    finally:
        await flow.shutdown()


async def cmd_batch(args) -> int:
    if not session_exists():
        print("SIN SESION. Corre primero: python flow.py login")
        return 1

    data = json.loads(Path(args.jobfile).read_text(encoding="utf-8"))
    defaults = data.get("defaults", {})
    d_ratio = defaults.get("ratio", "9:16")
    d_img_model = defaults.get("image_model", "Nano Banana 2 Lite")
    d_vid_model = defaults.get("video_model", "Veo 3.1 - Lite")
    d_vid_duration = defaults.get("video_duration")
    jobs = data.get("jobs", [])

    # Cada proyecto va a su propia subcarpeta: facil de revisar y de borrar.
    project = data.get("project") or f"proyecto_{_stamp()}"
    project_dir = Path(args.out) / _safe(project)
    project_dir.mkdir(parents=True, exist_ok=True)

    print(f"BATCH '{project}': {len(jobs)} trabajos. Salida -> {project_dir}")
    results = []
    await flow.startup()
    try:
        await flow.ensure_project(force_new=getattr(args, "new_project", False))
        for i, job in enumerate(jobs, 1):
            jtype = job.get("type", "image")
            name = job.get("name") or f"{jtype}_{i:02d}"
            prompt = job.get("prompt", "")
            ratio = job.get("ratio", d_ratio)
            print(f"\n--- [{i}/{len(jobs)}] {jtype} :: {name} ---")
            try:
                if jtype == "image":
                    out_path = _out_path(project_dir, name, "png")
                    saved = await _gen_image(
                        prompt, ratio, job.get("model", d_img_model),
                        int(job.get("count", 1)),
                        _resolve_asset(project_dir, job.get("image")), out_path,
                    )
                elif jtype == "video":
                    out_path = _out_path(project_dir, name, "mp4")
                    saved = await _gen_video(
                        prompt, ratio, job.get("model", d_vid_model),
                        int(job.get("count", 1)),
                        _resolve_asset(project_dir, job.get("start")),
                        _resolve_asset(project_dir, job.get("end")), out_path,
                        job.get("duration", d_vid_duration),
                    )
                else:
                    print(f"  tipo desconocido '{jtype}', saltando.")
                    continue
                print(f"  OK -> {saved}")
                results.append({"name": name, "type": jtype, "file": saved, "ok": True})
            except Exception as e:
                print(f"  ERROR en '{name}': {e}")
                debug_dir = project_dir / "_debug"
                try:
                    debug_dir.mkdir(exist_ok=True)
                    page = await flow.get_page()
                    debug_name = f"{i:02d}_{_safe(name)}"
                    await page.screenshot(path=str(debug_dir / f"{debug_name}.png"))
                    (debug_dir / f"{debug_name}.html").write_text(await page.content(), encoding="utf-8")
                    print(f"  Diagnóstico guardado en {debug_dir}")
                except Exception as debug_error:
                    print(f"  No se pudo guardar el diagnóstico: {debug_error}")
                results.append({"name": name, "type": jtype, "ok": False, "error": str(e)})
    finally:
        await flow.shutdown()

    report = project_dir / "batch_report.json"
    report.write_text(json.dumps(results, indent=2, ensure_ascii=False), encoding="utf-8")
    ok = sum(1 for r in results if r.get("ok"))
    print(f"\nBATCH terminado: {ok}/{len(results)} OK. Carpeta: {project_dir}")
    return 0 if ok == len(results) else 1


def _ask_human_approve(decision: dict) -> bool:
    """Pide aprobación explícita al humano para reescribir un prompt bloqueado.

    Sin terminal interactivo (agente/sandbox) se trata como NO aprobado: el
    guardián nunca reenvía por su cuenta.
    """
    if not decision.get("allowed") or decision.get("rewrite") is None:
        print(f"  [guard] Idea sin versión dentro de la política (motivo: {decision['motivo']}). No se reenvía.")
        return False
    print("  [guard] Flow bloqueó este prompt. Sugerencia de reescrita DENTRO de la política:")
    print(f"      antes: {decision['original']}")
    print(f"      después: {decision['rewrite']}")
    if not sys.stdin or not sys.stdin.isatty():
        print("  [guard] Sin terminal interactivo: se marca como bloqueado (no se reenvía solo).")
        return False
    try:
        ans = input("  [guard] ¿Reenviar con esta reescrita? (s/N): ").strip().lower()
    except Exception:
        return False
    return ans in ("s", "sim", "y", "yes")


async def _gen_video_guarded(prompt, ratio, model, start, out_path, duration, blocked_log):
    """Genera un clip de video; si Flow lo bloquea, ofrece reescrita aprobada por humano."""
    # Primer intento con la duración pedida; si el modelo no la ofrece, reintenta sin duración.
    for attempt_dur in (duration, None):
        try:
            return await _gen_video(prompt, ratio, model, 1, start, None, out_path, attempt_dur)
        except Exception as e:
            err = str(e)
            # ¿Fue un bloqueo de contenido o un fallo técnico de duración/UI?
            decision = policy_guard.evaluate_blocked_prompt(prompt, err)
            if decision["motivo"] == "unknown" and attempt_dur is not None:
                print(f"  [short] Sin duración {attempt_dur} en el modelo; reintentando sin duración...")
                continue
            if decision["motivo"] == "unknown":
                raise
            if _ask_human_approve(decision):
                new_prompt = decision["rewrite"]
                try:
                    saved = await _gen_video(new_prompt, ratio, model, 1, start, None, out_path, attempt_dur)
                    blocked_log.append({"prompt": prompt, "decision": decision, "approved": True})
                    return saved
                except Exception as e2:
                    blocked_log.append({"prompt": prompt, "decision": decision, "approved": True, "error": str(e2)})
                    raise
            blocked_log.append({"prompt": prompt, "decision": decision, "approved": False})
            raise RuntimeError(f"Prompt bloqueado por Flow y no aprobado para reescrita (motivo {decision['motivo']}).")
    raise RuntimeError("No se pudo generar el clip.")


async def cmd_short(args) -> int:
    if not session_exists():
        print("SIN SESION. Corre primero: python flow.py login")
        return 1

    data = json.loads(Path(args.jobfile).read_text(encoding="utf-8"))
    title = data.get("title") or f"short_{_stamp()}"
    project_dir = Path(args.out) / _safe(title)
    clips_dir = project_dir / "_clips"
    project_dir.mkdir(parents=True, exist_ok=True)
    clips_dir.mkdir(parents=True, exist_ok=True)

    ratio = data.get("ratio", "9:16")
    voice = args.voice or data.get("voice") or "pt-BR-AntonioNeural"
    target = compose.parse_target(args.duration or data.get("target_duration", "30s"))
    clip_len = compose.parse_target(data.get("clip_duration", "10s"))
    n = compose.plan_clips(target, clip_len)

    scenes = data.get("scenes", [])
    if not scenes:
        print("El roteiro necesita al menos una 'scene' con 'prompt'.")
        return 1

    # Prompts por clip (cicla las escenas definidas hasta cubrir N).
    prompts = [scenes[i % len(scenes)].get("prompt", "") for i in range(n)]

    # Narración: por escena si cada una trae 'narration'; si no, reparte el texto total.
    if any(s.get("narration") for s in scenes) and len(scenes) >= n:
        narration = [scenes[i].get("narration", "") for i in range(n)]
    else:
        narration = compose.distribute_narration(data.get("narration_text", ""), n)

    ref_image = _resolve_asset(project_dir, data.get("reference_image"))
    clip_dur_str = data.get("clip_duration", "10s")

    print(f"SHORT '{title}': alvo {target:.0f}s -> {n} clips de ~{clip_len:.0f}s (Omni 1.1 Flash).")
    print(f"  Voz: {voice} | Ratio: {ratio} | Referencia: {ref_image or '(texto a texto)'}")
    print(f"  Costo: {n} generaciones de video Omni consumen créditos.")

    blocked_log: list = []
    clips: list[str] = []
    await flow.startup()
    try:
        await flow.ensure_project(force_new=getattr(args, "new_project", False))
        last_frame = ref_image
        for i in range(n):
            out_clip = _out_path(clips_dir, f"clip_{i+1:02d}", "mp4")
            print(f"\n--- clip {i+1}/{n} :: {prompts[i][:60]}... ---")
            # Reanudación: si el clip ya existe y es válido, no se regenera (ahorra créditos).
            if Path(out_clip).exists() and Path(out_clip).stat().st_size > 50_000:
                print(f"  [short] Clip ya generado, reutilizando: {out_clip}")
                saved = out_clip
            else:
                # Reintentos ante fallos transitorios de UI (file chooser, render), no de contenido.
                saved = None
                for intento in range(3):
                    try:
                        saved = await _gen_video_guarded(
                            prompts[i], ratio, "Omni 1.1 Flash", last_frame, out_clip, clip_dur_str, blocked_log,
                        )
                        break
                    except Exception as e:
                        # Bloqueo de contenido no aprobado: no reintentar.
                        if "bloqueado" in str(e).lower():
                            raise
                        print(f"  [short] Fallo transitorio en clip {i+1} (intento {intento+1}/3): {e}")
                        await asyncio.sleep(3)
                        last_frame = ref_image if i == 0 else last_frame
                if saved is None:
                    raise RuntimeError(f"Clip {i+1} no se pudo generar tras 3 intentos.")
            clips.append(saved)
            # Continuidad: último cuadro alimenta el fotograma inicial del próximo clip.
            if i < n - 1:
                frame = _out_path(clips_dir, f"frame_{i+1:02d}", "png")
                try:
                    last_frame = compose.extract_last_frame(saved, frame)
                except Exception as e:
                    print(f"  [short] No se pudo extraer último cuadro ({e}); siguiente clip va texto->video.")
                    last_frame = None
    finally:
        if blocked_log:
            (project_dir / "blocked_prompts.json").write_text(
                json.dumps(blocked_log, indent=2, ensure_ascii=False), encoding="utf-8")
        await flow.shutdown()

    if not clips:
        print("Ningún clip generado; no hay nada que montar.")
        return 1

    # Narración (TTS con cache) + SRT sincronizado + montaje 360p.
    print("\n[montage] Generando narración y subtítulos...")
    narr_files = []
    for i, txt in enumerate(narration, 1):
        mp3 = project_dir / f"narr_{i:02d}.mp3"
        await compose.tts_scene(txt, voice, mp3)
        narr_files.append(str(mp3))

    durations = []
    for c in clips:
        try:
            durations.append(compose.media_duration(c))
        except Exception:
            durations.append(clip_len)
    starts = compose._clip_start_times(durations, compose.CROSSFADE)
    srt_path = project_dir / f"{_safe(title)}.srt"
    compose.build_srt(list(zip(starts, narration)), srt_path, target)

    final = project_dir / f"{_safe(title)}_360p.mp4"
    print("[montage] Concatenando, mezclando audio, quemando leyenda y exportando 360p...")
    compose.assemble(clips, narr_files, srt_path, final, target)

    report = {
        "title": title, "target_seconds": target, "clips": n, "voice": voice,
        "model": "Omni 1.1 Flash", "output": str(final), "srt": str(srt_path),
        "blocked_prompts": len(blocked_log),
    }
    (project_dir / "short_report.json").write_text(
        json.dumps(report, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"\nOK video -> {final}")
    return 0


async def cmd_clean(args) -> int:
    out_dir = Path(args.out)
    if args.project:
        target = out_dir / _safe(args.project)
        if not target.exists():
            print(f"No existe: {target}")
            return 0
        shutil.rmtree(target)
        print(f"Borrado proyecto: {target}")
        return 0
    if not out_dir.exists():
        print(f"Nada que limpiar en {out_dir}")
        return 0
    borrados = 0
    for child in out_dir.iterdir():
        if child.name == "LEEME.txt":
            continue
        if child.is_dir():
            shutil.rmtree(child)
        else:
            child.unlink()
        borrados += 1
    print(f"Limpiado {out_dir}: {borrados} elementos borrados.")
    return 0


# ---------------------------------------------------------------------------
# Parser
# ---------------------------------------------------------------------------
def build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(description="CLI Google Flow (Playwright).")
    sub = p.add_subparsers(dest="cmd", required=True)

    sub.add_parser("login", help="Loguearse en Google Flow (una vez).")
    sub.add_parser("status", help="Ver si hay sesion guardada.")
    sub.add_parser("chrome", help="Deja un Chrome persistente (CDP) abierto para reutilizarlo.")

    pi = sub.add_parser("image", help="Generar una imagen.")
    pi.add_argument("--prompt", required=True)
    pi.add_argument("--ratio", default="9:16")
    pi.add_argument("--model", default="Nano Banana 2 Lite")
    pi.add_argument("--count", type=int, default=1)
    pi.add_argument("--image", default=None, help="Imagen de referencia para editar.")
    pi.add_argument("--name", default=None)
    pi.add_argument("--out", default=str(DEFAULT_OUT))
    pi.add_argument("--new-project", dest="new_project", action="store_true", help="Forzar proyecto nuevo en vez de reutilizar el actual.")

    pv = sub.add_parser("video", help="Generar un video.")
    pv.add_argument("--prompt", required=True)
    pv.add_argument("--ratio", default="9:16")
    pv.add_argument("--model", default="Omni 1.1 Flash")
    pv.add_argument("--count", type=int, default=1)
    pv.add_argument("--duration", default=None, help="Duracion del clip, por ejemplo 8s (si el modelo la admite).")
    pv.add_argument("--start", default=None, help="Fotograma inicial (imagen).")
    pv.add_argument("--end", default=None, help="Fotograma final (imagen).")
    pv.add_argument("--name", default=None)
    pv.add_argument("--out", default=str(DEFAULT_OUT))
    pv.add_argument("--new-project", dest="new_project", action="store_true", help="Forzar proyecto nuevo en vez de reutilizar el actual.")

    pb = sub.add_parser("batch", help="Ejecutar guion JSON de varios trabajos.")
    pb.add_argument("jobfile")
    pb.add_argument("--out", default=str(DEFAULT_OUT))
    pb.add_argument("--new-project", dest="new_project", action="store_true", help="Forzar proyecto nuevo en vez de reutilizar el actual.")

    psh = sub.add_parser("short", help="Video corto narrado de duracion libre (pipeline de montaje).")
    psh.add_argument("jobfile", help="Roteiro JSON (title, target_duration, scenes, narration).")
    psh.add_argument("--out", default=str(DEFAULT_OUT))
    psh.add_argument("--voice", default=None, help="Voz edge-tts (ex. pt-BR-AntonioNeural / pt-BR-FranciscaNeural).")
    psh.add_argument("--duration", default=None, help="Duracion-alvo final (ex. 30s, 2min, 3:00).")
    psh.add_argument("--new-project", dest="new_project", action="store_true", help="Forzar proyecto nuevo en vez de reutilizar el actual.")

    pc = sub.add_parser("clean", help="Borrar resultados de outputs.")
    pc.add_argument("project", nargs="?", default=None,
                    help="Nombre del proyecto a borrar. Vacio = limpiar todo outputs.")
    pc.add_argument("--out", default=str(DEFAULT_OUT))

    return p


HANDLERS = {
    "login": cmd_login,
    "status": cmd_status,
    "chrome": cmd_chrome,
    "image": cmd_image,
    "video": cmd_video,
    "batch": cmd_batch,
    "short": cmd_short,
    "clean": cmd_clean,
}


# ---------------------------------------------------------------------------
# :)
# ---------------------------------------------------------------------------
EASTER_EGG = r"""
   _   _ _   _ ____   ___
  | \ | | | | |  _ \ / _ \
  |  \| | | | | |_) | | | |
  | |\  | |_| |  _ <| |_| |
  |_| \_|\___/|_| \_\\___/     x   B R P L

  Google Flow Skill -- forjado por NURO para BRPL.
  El contexto es el verdadero superpoder. Disfruta y crea.
"""


def main() -> int:
    if len(sys.argv) == 2 and sys.argv[1] in ("nuro", "brpl", "--credits"):
        print(EASTER_EGG)
        return 0
    args = build_parser().parse_args()
    return asyncio.run(HANDLERS[args.cmd](args))


if __name__ == "__main__":
    sys.exit(main())
