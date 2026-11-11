#!/usr/bin/env python3
"""Monta o projeto do vídeo (a cena em código) com o tempo da voz, pronto para o HyperFrames renderizar.

Uso:
  python3 montar.py --tempos voz/tempos.json --voz voz/voz.wav --cena cena
  python3 montar.py --exemplo --cena cena-exemplo          (o exemplo do skill, sem voz, para testar)

Na primeira vez, copia o modelo do skill para a pasta `cena` (depois o Claude edita cena/js/cena.js
com as peças e o cenário do seu vídeo; o montar.py nunca escreve por cima dele). A cada vez, escreve
cena/js/tempos.js (cada frase e cada palavra com o tempo), copia a voz e acerta a duração.
Aceita o tempos.json do voz.py e o .json do transcrever.py (aí ele separa as frases pela pontuação).

Depois, para ver e para renderizar (precisa do Node.js 22 ou mais novo):
  cd cena && npx --yes hyperframes@0.8.181 preview            (abre no navegador)
  cd cena && npx --yes hyperframes@0.8.181 render . --output ../video.mp4
"""
import argparse, json, re, shutil
from pathlib import Path

SKILL = Path(__file__).resolve().parents[1]


def frases_de(t):
    if "frases" in t:
        return t["frases"], t.get("duracao") or t["frases"][-1]["e"] + 0.8
    frases, atual = [], []
    for p in t["palavras"]:
        atual.append(p)
        if re.search(r"[.!?]$", p["w"]):
            frases.append(atual)
            atual = []
    if atual:
        frases.append(atual)
    out = [{"texto": " ".join(p["w"] for p in f), "s": f[0]["s"], "e": f[-1]["e"], "palavras": f} for f in frases]
    return out, out[-1]["e"] + 0.8


def exemplo():
    """Tempos de mentira para o roteiro do exemplo: 2,7 palavras por segundo, 0,35 s entre as frases."""
    frases, t = [], 0.4
    for linha in (SKILL / "exemplo" / "roteiro.txt").read_text().splitlines():
        if not linha.strip():
            continue
        ps = []
        for w in linha.split():
            d = 0.22 + 0.03 * len(w)
            ps.append({"w": w, "s": round(t, 3), "e": round(t + d, 3)})
            t += d + 0.07
        frases.append({"texto": linha.strip(), "s": ps[0]["s"], "e": ps[-1]["e"], "palavras": ps})
        t += 0.35
    return frases, round(t + 0.6, 2)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--tempos")
    ap.add_argument("--voz")
    ap.add_argument("--cena", default="cena")
    ap.add_argument("--exemplo", action="store_true")
    a = ap.parse_args()
    cena = Path(a.cena)
    if not (cena / "js" / "cena.js").exists():
        shutil.copytree(SKILL / "modelo", cena, dirs_exist_ok=True, ignore=shutil.ignore_patterns("index.template.html"))
        print(f"modelo copiado para {cena}/ (edite {cena}/js/cena.js com as peças do seu vídeo)")
    if a.exemplo:
        frases, dur = exemplo()
    else:
        if not a.tempos:
            raise SystemExit("faltou --tempos (o tempos.json do voz.py ou o .json do transcrever.py)")
        frases, dur = frases_de(json.loads(Path(a.tempos).read_text()))
    (cena / "js" / "tempos.js").write_text("// escrito pelo montar.py: cada frase e cada palavra da voz, com o tempo em segundos\nexport default "
                                           + json.dumps({"duracao": dur, "frases": frases}, ensure_ascii=False) + ";\n")
    audio = ""
    if a.voz:
        (cena / "assets").mkdir(exist_ok=True)
        shutil.copy(a.voz, cena / "assets" / "voz.wav")
        audio = f'      <audio id="voz" src="assets/voz.wav" data-start="0" data-duration="{dur}" data-track-index="1" data-volume="1"></audio>'
    html = (SKILL / "modelo" / "index.template.html").read_text().replace("@@DURACAO@@", str(dur)).replace("@@AUDIO@@", audio)
    (cena / "index.html").write_text(html)
    (cena / "hyperframes.json").write_text(json.dumps({"$schema": "https://hyperframes.heygen.com/schema/hyperframes.json", "paths": {"assets": "assets"}}, indent=1))
    print(f"projeto pronto em {cena}/: {len(frases)} frases, {dur:.1f} s{'' if a.voz else ', sem voz'}")


main()
