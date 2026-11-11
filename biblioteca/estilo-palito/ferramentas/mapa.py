#!/usr/bin/env python3
"""O mapa de cenas: uma imagem do meio de cada frase, com a frase do lado, antes de renderizar o
vídeo inteiro. É onde você vê se cada peça entra na hora certa e se nada tampa a câmera.

Uso:
  python3 mapa.py --cena cena [--referencia referencia.mp4 --tempos-ref transcricoes/referencia.json]

Tira as imagens com o HyperFrames (não renderiza o vídeo, é rápido) e escreve mapa/mapa.html.
Com --referencia, põe ao lado a imagem da referência no mesmo ponto da frase equivalente.
Precisa do Node.js 22 ou mais novo.
"""
import argparse, html, json, re, subprocess
from pathlib import Path


def ler_tempos(cena):
    txt = (Path(cena) / "js" / "tempos.js").read_text()
    return json.loads(txt[txt.index("{"):txt.rstrip().rstrip(";").rindex("}") + 1])


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--cena", default="cena")
    ap.add_argument("--saida", default="mapa")
    ap.add_argument("--referencia")
    ap.add_argument("--tempos-ref")
    a = ap.parse_args()
    T = ler_tempos(a.cena)
    meios = [round((f["s"] + f["e"]) / 2, 2) for f in T["frases"]]
    saida = Path(a.saida)
    (saida / "quadros").mkdir(parents=True, exist_ok=True)
    subprocess.run(["npx", "--yes", "hyperframes@0.8.181", "snapshot", a.cena, "--at", ",".join(map(str, meios)), "--no-end",
                    "--describe", "false", "-o", str((saida / "quadros").resolve())], check=True)
    fotos = sorted((saida / "quadros").glob("frame-*.png"), key=lambda p: int(re.search(r"frame-(\d+)", p.name).group(1)))
    refs = []
    if a.referencia and a.tempos_ref:
        tr = json.loads(Path(a.tempos_ref).read_text())
        ps, frases, atual = tr["palavras"], [], []
        for p in ps:
            atual.append(p)
            if re.search(r"[.!?]$", p["w"]):
                frases.append(atual)
                atual = []
        for i, f in enumerate(frases[:len(meios)]):
            img = saida / "quadros" / f"ref-{i:02d}.jpg"
            subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", str((f[0]["s"] + f[-1]["e"]) / 2), "-i", a.referencia, "-frames:v", "1",
                            "-vf", "scale=360:-1", str(img)], check=True)
            refs.append(img.name)
    linhas = []
    for i, (f, m) in enumerate(zip(T["frases"], meios)):
        foto = fotos[i].name if i < len(fotos) else ""
        ref = f'<img src="quadros/{refs[i]}" alt="referência">' if i < len(refs) else ""
        linhas.append(f'<div class="f"><div class="imgs"><img src="quadros/{foto}" alt="frase {i + 1}">{ref}</div><div><b>{i + 1} · {f["s"]:.1f} s</b>'
                      f'<p>{html.escape(f["texto"])}</p></div></div>')
    pagina = ('<!doctype html><meta charset="utf-8"><title>Mapa de cenas</title><style>body{font:17px/1.5 -apple-system,sans-serif;margin:32px;background:#f6f5f2;color:#1b1d22}'
              '.f{display:flex;gap:20px;align-items:flex-start;padding:14px 0;border-bottom:1px solid #ddd}.imgs{display:flex;gap:8px}'
              'img{width:180px;border-radius:8px;background:#000}p{margin:6px 0;max-width:60ch}</style><h1>Mapa de cenas</h1>' + "".join(linhas))
    (saida / "mapa.html").write_text(pagina)
    print(f"mapa pronto: {saida}/mapa.html ({len(linhas)} frases)")


main()
