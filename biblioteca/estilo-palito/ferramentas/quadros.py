#!/usr/bin/env python3
"""Folhas de quadros: os quadros de um vídeo lado a lado, cada um com o tempo, para ler o vídeo
inteiro de uma vez (e para o Claude ler, abrindo as imagens).

Uso:
  python3 quadros.py <video> --por-segundo 6 --saida quadros/6-por-segundo
  python3 quadros.py <video> --por-segundo 30 --de 34.5 --ate 35.5 --saida quadros/zoom    (todos os quadros de um trecho)

--por-segundo 1 serve para ler a história; 6 para ler o ritmo; 30 (todos os quadros) para os
momentos que importam: uma peça entrando, um zoom, um corte. Cada folha tem 50 quadros (10 x 5).
Precisa de: pip install opencv-python numpy
"""
import argparse
from pathlib import Path
try:
    import cv2
    import numpy as np
except ImportError:
    raise SystemExit("falta o OpenCV: rode  pip install opencv-python numpy  (ou use  uv run --with opencv-python --with numpy python3 ...)")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("video")
    ap.add_argument("--por-segundo", type=float, default=1)
    ap.add_argument("--de", type=float, default=0)
    ap.add_argument("--ate", type=float, default=None)
    ap.add_argument("--colunas", type=int, default=10)
    ap.add_argument("--linhas", type=int, default=5)
    ap.add_argument("--largura", type=int, default=144, help="largura de cada quadro na folha, em pixels")
    ap.add_argument("--saida", default="quadros")
    a = ap.parse_args()
    cap = cv2.VideoCapture(a.video)
    fps = cap.get(cv2.CAP_PROP_FPS) or 30
    dur = cap.get(cv2.CAP_PROP_FRAME_COUNT) / fps
    fim = min(a.ate or dur, dur)
    saida = Path(a.saida)
    saida.mkdir(parents=True, exist_ok=True)
    tiles, t = [], a.de
    while t < fim - 1e-3:
        cap.set(cv2.CAP_PROP_POS_MSEC, t * 1000)
        ok, f = cap.read()
        if not ok:
            break
        h = int(f.shape[0] * a.largura / f.shape[1])
        f = cv2.resize(f, (a.largura, h))
        rot = f"{t:.2f}" if a.por_segundo > 2 else f"{t:.1f}"
        cv2.rectangle(f, (0, 0), (len(rot) * 11 + 6, 20), (0, 0, 0), -1)
        cv2.putText(f, rot, (3, 15), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 255), 1, cv2.LINE_AA)
        tiles.append(f)
        t += 1 / a.por_segundo
    n = a.colunas * a.linhas
    for i in range(0, len(tiles), n):
        grupo = tiles[i:i + n]
        while len(grupo) < n:
            grupo.append(np.zeros_like(tiles[0]))
        folha = np.vstack([np.hstack(grupo[r * a.colunas:(r + 1) * a.colunas]) for r in range(a.linhas)])
        cv2.imwrite(str(saida / f"folha_{i // n + 1:03d}.jpg"), folha, [cv2.IMWRITE_JPEG_QUALITY, 82])
    print(f"{len(tiles)} quadros em {(len(tiles) + n - 1) // n} folhas, em {saida}/")


main()
