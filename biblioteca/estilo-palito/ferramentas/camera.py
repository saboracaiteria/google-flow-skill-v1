#!/usr/bin/env python3
"""Mede a câmera de um vídeo em todos os quadros: onde tem corte, onde tem zoom ou movimento, e
quanto tempo ela fica parada. Lê o vídeo em ordem, quadro a quadro, e compara cada quadro com o
anterior (pontos que se repetem de um quadro para o outro dizem quanto a imagem cresceu ou andou).

Uso:
  python3 camera.py <video> --saida camera

Escreve camera/<nome>.json (um registro por quadro e a lista de movimentos e cortes) e
camera/<nome>.md (o resumo: cortes, movimentos rápidos por minuto, quanto dura cada um, quanto
tempo a câmera fica parada e a lista com os tempos). Leva uns 30 segundos por minuto de vídeo.
Precisa de: pip install opencv-python numpy
"""
import argparse, json, math
from pathlib import Path
try:
    import cv2
    import numpy as np
except ImportError:
    raise SystemExit("falta o OpenCV: rode  pip install opencv-python numpy  (ou use  uv run --with opencv-python --with numpy python3 ...)")

cv2.setNumThreads(2)
LARG = 360
RAPIDO = 0.006      # zoom ou movimento de mais de 0,6% da imagem por quadro = movimento rápido
LENTO = 0.0012


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("video")
    ap.add_argument("--saida", default="camera")
    a = ap.parse_args()
    cap = cv2.VideoCapture(a.video)
    fps = cap.get(cv2.CAP_PROP_FPS) or 30
    orb = cv2.ORB_create(nfeatures=1200)
    bf = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=True)
    quadros, ant, cinza_ant, mini = [], None, None, []
    while True:
        ok, f = cap.read()
        if not ok:
            break
        h = int(f.shape[0] * LARG / f.shape[1])
        g = cv2.cvtColor(cv2.resize(f, (LARG, h)), cv2.COLOR_BGR2GRAY)
        mascara = np.full(g.shape, 255, np.uint8)
        mascara[int(h * 0.64):int(h * 0.74), :] = 0           # a faixa da legenda não conta como movimento
        k, d = orb.detectAndCompute(g, mascara)
        q = {"q": len(quadros), "t": round(len(quadros) / fps, 3)}
        pequeno = cv2.resize(g, (90, 160)).astype(np.float32)
        mini.append(cv2.resize(g, (18, 32)).astype(np.int16))
        q["dif"] = round(float(np.abs(pequeno - cinza_ant).mean()), 2) if cinza_ant is not None else 0.0
        if ant is not None and d is not None and ant[1] is not None and len(d) > 8 and len(ant[1]) > 8:
            pares = bf.match(ant[1], d)
            if len(pares) >= 12:
                p0 = np.float32([ant[0][m.queryIdx].pt for m in pares])
                p1 = np.float32([k[m.trainIdx].pt for m in pares])
                M, ok_ = cv2.estimateAffinePartial2D(p0, p1, method=cv2.RANSAC, ransacReprojThreshold=2.0)
                if M is not None and ok_ is not None and ok_.sum() >= 12:
                    q.update(zoom=round(math.hypot(M[0, 0], M[1, 0]), 5), dx=round(M[0, 2] / LARG, 5), dy=round(M[1, 2] / h, 5))
        quadros.append(q)
        ant, cinza_ant = (k, d), pequeno
    n = len(quadros)
    dif = [q["dif"] for q in quadros]
    # corte = um salto grande e isolado de um quadro para o outro (um movimento rápido muda vários quadros seguidos)
    for i, q in enumerate(quadros):
        viz = max(dif[i - 1] if i else 0, dif[i + 1] if i + 1 < n else 0)
        # a flash (an explosion, a spark) jumps too, but half a second later the picture is back; a cut is not (a flash during a fast move still counts: check it by eye)
        volta = np.abs(mini[i - 1] - mini[min(n - 1, i + 15)]).mean() if i else 99
        if q["dif"] > 22 and q["dif"] > 2.5 * viz and volta > 30:
            q["tipo"] = "corte"
        elif "zoom" not in q:
            q["tipo"] = "?"
        else:
            z, m = abs(q["zoom"] - 1), math.hypot(q["dx"], q["dy"])
            q["tipo"] = "rapido" if (z > RAPIDO or m > RAPIDO) else "lento" if (z > LENTO or m > LENTO) else "parado"
    movs, i = [], 0
    while i < n:
        if quadros[i]["tipo"] == "rapido":
            j, zoom = i, 1.0
            while j < n and (quadros[j]["tipo"] == "rapido" or (j + 2 < n and quadros[j + 1]["tipo"] == "rapido")):
                zoom *= quadros[j].get("zoom", 1)
                j += 1
            if j - i >= 3:
                movs.append({"t": round(i / fps, 2), "quadros": j - i, "zoom": round(zoom, 3)})
            i = j
        else:
            i += 1
    cortes = [q["t"] for q in quadros if q["tipo"] == "corte"]
    dur = n / fps
    parte = {k: round(sum(1 for q in quadros if q["tipo"] == k) / n * 100) for k in ("parado", "lento", "rapido")}
    duracoes = sorted(m["quadros"] for m in movs)
    mediana = duracoes[len(duracoes) // 2] if duracoes else 0
    saida = Path(a.saida)
    saida.mkdir(parents=True, exist_ok=True)
    nome = Path(a.video).stem
    resumo = {"quadros": n, "fps": fps, "duracao": round(dur, 2), "cortes": cortes, "movimentos": movs,
              "parado_lento_rapido_pct": parte, "movimento_mediano_quadros": mediana}
    (saida / f"{nome}.json").write_text(json.dumps({"resumo": resumo, "quadros": quadros}))
    md = [f"# A câmera de {nome}", "",
          f"- **{n} quadros** ({dur:.1f} s a {fps:.0f} quadros por segundo), todos medidos.",
          f"- **{len(cortes)} cortes** ({len(cortes) / dur * 60:.1f} por minuto).",
          f"- **{len(movs)} movimentos rápidos** ({len(movs) / dur * 60:.1f} por minuto); cada um dura uns {mediana} quadros ({mediana / fps:.2f} s).",
          f"- **A câmera fica parada {parte['parado']}% do tempo**, em movimento lento {parte['lento']}% e em movimento rápido {parte['rapido']}%.",
          f"- **Um evento (corte ou movimento rápido) a cada {dur / max(1, len(cortes) + len(movs)):.1f} s** em média.",
          f"- Aproximações (zoom para dentro): {sum(1 for m in movs if m['zoom'] > 1.03)}; afastamentos: {sum(1 for m in movs if m['zoom'] < 0.97)}.",
          "", "## Cortes", "", ", ".join(f"{c:.2f} s" for c in cortes) or "nenhum", "",
          "## Movimentos rápidos", "", "| Começa | Quadros | Zoom |", "|---|---|---|"]
    md += [f"| {m['t']:.2f} s | {m['quadros']} | {'para dentro' if m['zoom'] > 1.03 else 'para fora' if m['zoom'] < 0.97 else 'lateral'} ({m['zoom']:.2f}x) |" for m in movs]
    md += ["", "Medido por pontos que se repetem de um quadro para o outro. Confira os momentos que importam abrindo as folhas de quadros: a medida às vezes conta como movimento uma tela dividida ou um texto tremendo."]
    (saida / f"{nome}.md").write_text("\n".join(md) + "\n")
    print(f"{n} quadros: {len(cortes)} cortes, {len(movs)} movimentos rápidos, parada {parte['parado']}% do tempo; resumo em {saida}/{nome}.md")


main()
