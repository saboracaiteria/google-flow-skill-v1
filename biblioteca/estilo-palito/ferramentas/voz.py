#!/usr/bin/env python3
"""A narração na ElevenLabs, numa tomada só, com o tempo de cada palavra.

Uso:
  python3 voz.py roteiro.txt --voz <ID da voz> --custo        (só mostra quantos caracteres vai gastar)
  python3 voz.py roteiro.txt --voz <ID da voz>                (gera)

roteiro.txt: uma frase por linha, só o que é falado. A chave fica num arquivo .env na pasta do vídeo:
  ELEVENLABS_API_KEY=sua_chave
Escreve voz/voz.mp3, voz/voz.wav e voz/tempos.json ({"duracao", "frases": [{"texto", "s", "e",
"palavras": [{"w", "s", "e"}]}]}). Se o roteiro não mudou, não gera de novo (não gasta duas vezes).

Sem ElevenLabs? Grave você mesmo lendo o roteiro e rode transcrever.py no áudio: sai o mesmo
tempo de cada palavra, de graça.
"""
import argparse, base64, json, os, subprocess, sys, urllib.request
from pathlib import Path


def chave():
    if os.environ.get("ELEVENLABS_API_KEY"):
        return os.environ["ELEVENLABS_API_KEY"]
    env = Path(".env")
    if env.exists():
        for l in env.read_text().splitlines():
            if l.strip().startswith("ELEVENLABS_API_KEY"):
                return l.split("=", 1)[1].strip().strip('"').strip("'")
    sys.exit("faltou a chave: crie um arquivo .env na pasta com ELEVENLABS_API_KEY=sua_chave")


def palavras_do_alinhamento(al):
    out, cur = [], None
    for c, s, e in zip(al["characters"], al["character_start_times_seconds"], al["character_end_times_seconds"]):
        if c.isspace():
            if cur:
                out.append(cur)
            cur = None
        elif cur is None:
            cur = {"w": c, "s": round(s, 3), "e": round(e, 3)}
        else:
            cur["w"] += c
            cur["e"] = round(e, 3)
    if cur:
        out.append(cur)
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("roteiro")
    ap.add_argument("--voz", required=True, help="o ID da voz na ElevenLabs")
    ap.add_argument("--modelo", default="eleven_multilingual_v2")
    ap.add_argument("--custo", action="store_true")
    ap.add_argument("--saida", default="voz")
    a = ap.parse_args()
    frases = [l.strip() for l in Path(a.roteiro).read_text().splitlines() if l.strip()]
    texto = " ".join(frases)
    print(f"{len(frases)} frases, {len(texto)} caracteres")
    if a.custo:
        return
    saida = Path(a.saida)
    saida.mkdir(parents=True, exist_ok=True)
    guardado = saida / "tomada.json"
    if guardado.exists() and json.loads(guardado.read_text()).get("texto") == texto:
        d = json.loads(guardado.read_text())
        print("o roteiro não mudou: usando a tomada que já existe (nada gasto)")
    else:
        corpo = json.dumps({"text": texto, "model_id": a.modelo, "voice_settings": {"stability": 0.5, "similarity_boost": 0.8}}).encode()
        req = urllib.request.Request(f"https://api.elevenlabs.io/v1/text-to-speech/{a.voz}/with-timestamps?output_format=mp3_44100_128",
                                     data=corpo, headers={"xi-api-key": chave(), "Content-Type": "application/json"})
        try:
            r = json.load(urllib.request.urlopen(req, timeout=600))
        except urllib.error.HTTPError as e:
            sys.exit(f"a ElevenLabs recusou ({e.code}): {e.read().decode()[:300]}")
        (saida / "voz.mp3").write_bytes(base64.b64decode(r["audio_base64"]))
        d = {"texto": texto, "alinhamento": r.get("alignment") or r.get("normalized_alignment")}
        guardado.write_text(json.dumps(d, ensure_ascii=False))
        with open("registro.md", "a") as f:
            f.write(f"- narração na ElevenLabs: {len(texto)} caracteres, voz {a.voz}, modelo {a.modelo}\n")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(saida / "voz.mp3"), "-ar", "48000", "-ac", "1", str(saida / "voz.wav")], check=True)
    palavras = palavras_do_alinhamento(d["alinhamento"])
    out, i = [], 0
    for fr in frases:
        n = len(fr.split())
        ws = palavras[i:i + n]
        i += n
        if ws:
            out.append({"texto": fr, "s": ws[0]["s"], "e": ws[-1]["e"], "palavras": ws})
    dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(saida / "voz.wav")],
                               capture_output=True, text=True).stdout)
    (saida / "tempos.json").write_text(json.dumps({"duracao": round(dur, 2), "frases": out}, ensure_ascii=False, indent=1))
    print(f"voz pronta: {dur:.1f} s, {len(palavras)} palavras com tempo, em {saida}/")


main()
