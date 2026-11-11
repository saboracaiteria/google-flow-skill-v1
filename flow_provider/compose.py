"""
compose.py — Motor de montagem do pipeline `short`.

Funções puras (sem Playwright): usam o ffmpeg embutido em `vendor/bin/ffmpeg.exe`
(fallback para o binário do `imageio-ffmpeg`) e o `edge-tts` para narração pt-BR.

Fluxo: clipes de ~10s do Flow -> extração de último quadro p/ continuidade ->
TTS com cache -> .srt sincronizado -> concat com crossfade + mix de áudio +
legenda queimada + escala 360p.
"""
from __future__ import annotations

import asyncio
import hashlib
import re
import subprocess
from pathlib import Path

# ---------------------------------------------------------------------------
# Caminhos e binário ffmpeg
# ---------------------------------------------------------------------------
BASE_DIR = Path(__file__).resolve().parent.parent
VENDOR_FFMPEG = BASE_DIR / "vendor" / "bin" / "ffmpeg.exe"
VOICE_CACHE = BASE_DIR / "vendor" / "voices" / "cache"

# Resolução final VERTICAL 9:16 (TikTok/Reels) e taxa de quadros alvo.
OUT_W, OUT_H, OUT_FPS = 720, 1280, 30
CROSSFADE = 0.5  # segundos de transição entre clipes


def ffmpeg_exe() -> str:
    """Retorna o ffmpeg do projeto (vendor/bin); se não existir, usa o do imageio-ffmpeg."""
    if VENDOR_FFMPEG.exists():
        return str(VENDOR_FFMPEG)
    try:
        import imageio_ffmpeg
        return imageio_ffmpeg.get_ffmpeg_exe()
    except Exception as err:  # pragma: no cover - ambiente sem nenhum ffmpeg
        raise RuntimeError(
            "FFmpeg não encontrado. Rode 'py setup.py' ou coloque o binário em vendor/bin/ffmpeg.exe."
        ) from err


def _run(cmd: list[str]) -> subprocess.CompletedProcess:
    return subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8", errors="replace")


# ---------------------------------------------------------------------------
# Alvos de duração
# ---------------------------------------------------------------------------
def parse_target(value) -> float:
    """Converte '30s' / '2min' / '3:00' / 180 / '180' em segundos (float)."""
    if value is None:
        raise ValueError("target_duration ausente")
    if isinstance(value, (int, float)):
        return float(value)
    s = str(value).strip().lower()
    m = re.fullmatch(r"(\d+(?:\.\d+)?)\s*(?:s(?:eg(?:undo)?)?)?", s)
    if m:
        return float(m.group(1))
    m = re.fullmatch(r"(\d+(?:\.\d+)?)\s*(?:min(?:uto)?s?)?", s)
    if m and "m" in s:
        return float(m.group(1)) * 60.0
    m = re.fullmatch(r"(\d+)\s*:\s*(\d{1,2})", s)  # mm:ss
    if m:
        return float(m.group(1)) * 60.0 + float(m.group(2))
    raise ValueError(f"target_duration inválida: {value!r}")


def plan_clips(target_seconds: float, clip: float = 10.0) -> int:
    """Número de clipes de `clip` segundos para cobrir o alvo (arredonda para cima)."""
    if clip <= 0:
        raise ValueError("clip deve ser > 0")
    return max(1, int((target_seconds + clip - 1e-6) // clip))


# ---------------------------------------------------------------------------
# ffmpeg: duração e quadro final
# ---------------------------------------------------------------------------
def media_duration(path) -> float:
    """Duração em segundos via 'ffmpeg -i' (não depende de ffprobe)."""
    p = str(path)
    res = _run([ffmpeg_exe(), "-hide_banner", "-i", p])
    # A duração vem em stderr: "Duration: 00:00:10.02, start: ..."
    m = re.search(r"Duration:\s*(\d+):(\d+):(\d+(?:\.\d+)?)", res.stderr or "")
    if not m:
        raise RuntimeError(f"Não consegui ler duração de {p}")
    h, mi, se = int(m.group(1)), int(m.group(2)), float(m.group(3))
    return h * 3600 + mi * 60 + se


def extract_last_frame(video_path, out_png) -> str:
    """Extrai um quadro perto do fim do clipe (para dar continuidade ao próximo)."""
    out_png = str(out_png)
    Path(out_png).parent.mkdir(parents=True, exist_ok=True)
    cmd = [
        ffmpeg_exe(), "-y", "-hide_banner", "-loglevel", "error",
        "-sseof", "-0.3", "-i", str(video_path),
        "-frames:v", "1", "-update", "1", out_png,
    ]
    res = _run(cmd)
    if not Path(out_png).exists():
        # Fallback: tenta o último quadro sem sseof (clips muito curtos).
        cmd2 = [
            ffmpeg_exe(), "-y", "-hide_banner", "-loglevel", "error",
            "-i", str(video_path), "-vf", "select=eq(n\\,last)",
            "-vsync", "vfr", "-frames:v", "1", out_png,
        ]
        _run(cmd2)
    if not Path(out_png).exists():
        raise RuntimeError(f"Falha ao extrair último quadro de {video_path}: {res.stderr}")
    return out_png


# ---------------------------------------------------------------------------
# TTS (edge-tts) com cache offline
# ---------------------------------------------------------------------------
def _cache_key(text: str, voice: str) -> str:
    return hashlib.sha1(f"{voice}||{text}".encode("utf-8")).hexdigest()


async def tts_scene(text: str, voice: str, out_mp3) -> str:
    """Sintetiza `text` com `voice` (ex. 'pt-BR-AntonioNeural') num mp3.

    Usa cache em vendor/voices/cache: se o mesmo (voz+texto) já foi gerado,
    reaproveita sem internet. Caso contrário, chama o edge-tts (online) e grava
    no cache.
    """
    text = (text or "").strip()
    out_mp3 = str(out_mp3)
    Path(out_mp3).parent.mkdir(parents=True, exist_ok=True)

    if not text:
        # Gera um mp3 silencioso mínimo para não quebrar o mix.
        _run([ffmpeg_exe(), "-y", "-hide_banner", "-loglevel", "error",
              "-f", "lavfi", "-i", "anullsrc=r=44100:cl=mono", "-t", "0.2", out_mp3])
        return out_mp3

    VOICE_CACHE.mkdir(parents=True, exist_ok=True)
    cached = VOICE_CACHE / f"{_cache_key(text, voice)}.mp3"
    if cached.exists():
        Path(out_mp3).write_bytes(cached.read_bytes())
        return out_mp3

    import edge_tts
    tmp = VOICE_CACHE / f".tmp_{_cache_key(text, voice)}.mp3"
    await edge_tts.Communicate(text, voice).save(str(tmp))
    tmp.replace(cached)
    Path(out_mp3).write_bytes(cached.read_bytes())
    return out_mp3


# ---------------------------------------------------------------------------
# Distribuição de narração e legenda
# ---------------------------------------------------------------------------
def distribute_narration(text_total: str, n: int) -> list[str]:
    """Divide o texto em `n` blocos balanceados por número de sentenças."""
    text_total = (text_total or "").strip()
    if not text_total:
        return [""] * n
    sentences = [s.strip() for s in re.split(r"(?<=[.!?])\s+", text_total) if s.strip()]
    if not sentences:
        return [text_total] + [""] * (n - 1)
    if len(sentences) <= n:
        blocos = sentences + [""] * (n - len(sentences))
        return blocos[:n]
    # Distribui sentenças em n baldes buscando equilíbrio por palavras.
    baldes = [[] for _ in range(n)]
    cargas = [0] * n
    for s in sentences:
        i = cargas.index(min(cargas))
        baldes[i].append(s)
        cargas[i] += len(s.split())
    return [" ".join(b).strip() for b in baldes]


def _srt_ts(seconds: float) -> str:
    ms = int(round(max(0.0, seconds) * 1000))
    h, ms = divmod(ms, 3600000)
    mi, ms = divmod(ms, 60000)
    se, ms = divmod(ms, 1000)
    return f"{h:02d}:{mi:02d}:{se:02d},{ms:03d}"


def _wrap(text: str, width: int = 42, max_lines: int = 2) -> str:
    """Quebra o texto em até `max_lines` linhas de `width` caracteres."""
    words = text.split()
    lines, cur = [], ""
    for w in words:
        if len(cur) + len(w) + 1 <= width:
            cur = f"{cur} {w}".strip()
        else:
            lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    if len(lines) > max_lines:
        # Junta o excedente na última linha exibida.
        lines = lines[: max_lines - 1] + [" ".join(lines[max_lines - 1:])]
    return "\n".join(lines)


def build_srt(scenes_with_offsets, out_path, target_seconds: float) -> str:
    """Escreve um .srt a partir de [(start_seconds, texto), ...].

    Cada deixa vai do seu offset até o início da próxima (ou o fim do vídeo).
    """
    out_path = str(out_path)
    Path(out_path).parent.mkdir(parents=True, exist_ok=True)
    cues = [(float(s), t.strip()) for s, t in scenes_with_offsets if t and t.strip()]
    blocks = []
    for i, (start, text) in enumerate(cues):
        end = cues[i + 1][0] if i + 1 < len(cues) else target_seconds
        if end <= start:
            end = start + 1.0
        blocks.append(f"{i+1}\n{_srt_ts(start)} --> {_srt_ts(end)}\n{_wrap(text)}\n")
    Path(out_path).write_text("\n".join(blocks).strip() + "\n", encoding="utf-8")
    return out_path


# ---------------------------------------------------------------------------
# Montagem final
# ---------------------------------------------------------------------------
def _clip_start_times(durations: list[float], crossfade: float) -> list[float]:
    """Instante de início de cada clipe na linha do tempo final (com crossfade)."""
    starts, acc = [0.0], 0.0
    for i in range(1, len(durations)):
        acc += durations[i - 1] - crossfade
        starts.append(acc)
    return starts


def assemble(clips, narration_files, srt_path, out_path, target_seconds: float,
             crossfade: float = CROSSFADE) -> str:
    """Concatena clipes com crossfade, mixa narração + ambiente (15%), queima a
    legenda e exporta em VERTICAL 9:16 (720x1280) H.264/AAC com duração exata `target_seconds`.
    """
    clips = [str(c) for c in clips]
    if not clips:
        raise ValueError("nenhum clipe para montar")
    narration_files = [str(n) for n in narration_files] if narration_files else []
    out_path = str(out_path)
    Path(out_path).parent.mkdir(parents=True, exist_ok=True)

    durations = []
    for c in clips:
        try:
            durations.append(media_duration(c))
        except Exception:
            durations.append(10.0)
    starts = _clip_start_times(durations, crossfade)

    inputs: list[str] = []
    for c in clips:
        inputs += ["-i", c]
    for nf in narration_files:
        inputs += ["-i", nf]

    n = len(clips)
    parts: list[str] = []

    # --- vídeo: normalizar cada clip (mismo tamaño/fps/timebase) y encadenar xfade ---
    # Los clips del Omni vienen con resolucion y timebase distintos; xfade exige
    # entradas identicas, asi que escalamos/padreamos y fijamos fps+timebase primero.
    norm: list[str] = []
    for i in range(n):
        lbl = f"[v{i}]"
        parts.append(
            f"[{i}:v]scale={OUT_W}:{OUT_H}:force_original_aspect_ratio=decrease,"
            f"pad={OUT_W}:{OUT_H}:(ow-iw)/2:(oh-ih)/2,"
            f"fps={OUT_FPS},settb=AVTB,setpts=PTS-STARTPTS,format=yuv420p{lbl}"
        )
        norm.append(lbl)
    if n == 1:
        vlabel = norm[0]
    else:
        prev = norm[0]
        for i in range(1, n):
            offset = starts[i]
            out = f"[vx{i}]"
            parts.append(
                f"{prev}{norm[i]}xfade=transition=fade:duration={crossfade}:offset={offset:.3f}{out}"
            )
            prev = out
        vlabel = prev

    # --- ambiente: normaliza y concatena el audio de los clips, reducido a 15% ---
    aLabels: list[str] = []
    for i in range(n):
        albl = f"[a{i}]"
        parts.append(
            f"[{i}:a]aformat=sample_fmts=fltp:sample_rates=44100:channel_layouts=stereo{albl}"
        )
        aLabels.append(albl)
    amb_in = "".join(aLabels)
    parts.append(f"{amb_in}concat=n={n}:v=0:a=1[ambraw]")
    parts.append("[ambraw]atrim=0:{:.3f},asetpts=PTS-STARTPTS,volume=0.15[amb]".format(target_seconds))

    # --- narração: desloca cada mp3 para o offset da sua cena ---
    narr_labels = []
    for j, nf in enumerate(narration_files):
        idx = n + j  # índice da entrada do mp3
        delay_ms = int(round(starts[j] * 1000)) if j < len(starts) else 0
        lbl = f"[nar{j}]"
        parts.append(f"[{idx}:a]adelay={delay_ms}|{delay_ms},volume=1.0{lbl}")
        narr_labels.append(lbl)

    mix_inputs = narr_labels + ["[amb]"]
    if len(mix_inputs) == 1:
        parts.append(f"{mix_inputs[0]}anull[aout]")
    else:
        parts.append(
            "".join(mix_inputs)
            + f"amix=inputs={len(mix_inputs)}:duration=longest:dropout_transition=0,alimiter=limit=0.95[aout]"
        )

    # --- legenda (la escala/pad ya se aplico al normalizar cada clip) ---
    # Para evitar dor de escape de caminho no Windows, rodamos com cwd = pasta do .srt
    srt_name = Path(srt_path).name
    style = "FontSize=22,PrimaryColour=&H00FFFFFF,OutlineColour=&H80000000,BorderStyle=3,Outline=2,Shadow=0,MarginV=64"
    parts.append(f"{vlabel}subtitles='{srt_name}':force_style='{style}'[vout]")

    filter_complex = ";".join(parts)
    cmd = [
        ffmpeg_exe(), "-y", "-hide_banner", "-loglevel", "error",
        *inputs,
        "-filter_complex", filter_complex,
        "-map", "[vout]", "-map", "[aout]",
        "-c:v", "libx264", "-preset", "veryfast", "-crf", "23",
        "-c:a", "aac", "-b:a", "128k",
        "-t", f"{target_seconds:.3f}",
        out_path,
    ]
    res = subprocess.run(
        cmd, capture_output=True, text=True, encoding="utf-8", errors="replace",
        cwd=str(Path(srt_path).parent),
    )
    if not Path(out_path).exists() or Path(out_path).stat().st_size < 10_000:
        raise RuntimeError(f"Montagem falhou.\nCMD: {' '.join(cmd)}\n{res.stderr}")
    return out_path
