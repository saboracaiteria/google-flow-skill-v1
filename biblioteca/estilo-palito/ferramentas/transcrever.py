#!/usr/bin/env python3
"""Transcreve vídeos ou áudios palavra por palavra, com o tempo de cada palavra, no seu computador
(de graça, sem mandar nada para a internet).

Uso:
  python3 transcrever.py <arquivo ou pasta> [...] --saida transcricoes [--lingua pt]

Escreve, para cada arquivo: <nome>.txt (o texto) e <nome>.json ({"texto", "palavras": [{"w", "s", "e"}]},
com s e e em segundos). É esse tempo de cada palavra que faz o vídeo inteiro acertar no tempo da voz.

Usa o Whisper. No Mac com chip Apple, o mais rápido é o mlx-whisper; em qualquer computador, o
faster-whisper. Instale um dos dois:
  pip install mlx-whisper        (Mac com chip M1, M2, M3...)
  pip install faster-whisper     (Windows, Linux ou Mac com Intel)
Ou rode sem instalar nada, com o uv:  uv run --with mlx-whisper python3 transcrever.py ...
Na primeira vez ele baixa o modelo (uns 1,5 GB) e demora alguns minutos.
"""
import argparse, json, subprocess, sys, tempfile
from pathlib import Path

MIDIA = {".mp4", ".mov", ".m4a", ".mp3", ".wav", ".webm", ".mkv", ".aac", ".flac", ".ogg"}


def audio_16k(src, tmp):
    out = Path(tmp) / (src.stem + ".wav")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(src), "-vn", "-ac", "1", "-ar", "16000", str(out)], check=True)
    return out


def com_mlx(wav, lingua):
    import mlx_whisper
    r = mlx_whisper.transcribe(str(wav), path_or_hf_repo="mlx-community/whisper-large-v3-turbo", word_timestamps=True, language=lingua)
    return [{"w": w["word"].strip(), "s": round(w["start"], 3), "e": round(w["end"], 3)} for seg in r["segments"] for w in seg.get("words", [])]


def com_faster(wav, lingua):
    from faster_whisper import WhisperModel
    m = WhisperModel("large-v3-turbo", compute_type="int8")
    segs, _ = m.transcribe(str(wav), word_timestamps=True, language=lingua)
    return [{"w": w.word.strip(), "s": round(w.start, 3), "e": round(w.end, 3)} for s in segs for w in (s.words or [])]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("entradas", nargs="+")
    ap.add_argument("--saida", default="transcricoes")
    ap.add_argument("--lingua", default=None, help="pt, en, es... (vazio = descobre sozinho)")
    a = ap.parse_args()
    arquivos = []
    for e in a.entradas:
        p = Path(e)
        arquivos += sorted(x for x in p.iterdir() if x.suffix.lower() in MIDIA) if p.is_dir() else [p]
    if not arquivos:
        sys.exit("nenhum vídeo ou áudio encontrado")
    try:
        import mlx_whisper  # noqa: F401
        motor = com_mlx
    except ImportError:
        try:
            import faster_whisper  # noqa: F401
            motor = com_faster
        except ImportError:
            sys.exit("instale um Whisper: pip install mlx-whisper (Mac com chip Apple) ou pip install faster-whisper")
    saida = Path(a.saida)
    saida.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory() as tmp:
        for f in arquivos:
            palavras = motor(audio_16k(f, tmp), a.lingua)
            texto = " ".join(w["w"] for w in palavras)
            (saida / f"{f.stem}.json").write_text(json.dumps({"texto": texto, "palavras": palavras}, ensure_ascii=False, indent=1))
            (saida / f"{f.stem}.txt").write_text(texto + "\n")
            print(f"{f.name}: {len(palavras)} palavras")


main()
