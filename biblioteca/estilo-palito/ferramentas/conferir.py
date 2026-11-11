#!/usr/bin/env python3
"""Confere cada quadro de um vídeo pronto: quadro em branco, quadro piscando sozinho (um quadro
diferente dos vizinhos), imagem travada por mais de 1 segundo, e a lista de cortes.

Uso:
  python3 conferir.py video.mp4

Isso pega erro de render. O que só o olho pega (algo tampando a câmera, uma peça estranha) precisa
das folhas de quadros: rode quadros.py no vídeo pronto, a 6 por segundo, e olhe tudo.
Precisa de: pip install opencv-python numpy
"""
import sys
try:
    import cv2
    import numpy as np
except ImportError:
    raise SystemExit("falta o OpenCV: rode  pip install opencv-python numpy  (ou use  uv run --with opencv-python --with numpy python3 ...)")

cap = cv2.VideoCapture(sys.argv[1])
fps = cap.get(cv2.CAP_PROP_FPS) or 30
g = []
while True:
    ok, f = cap.read()
    if not ok:
        break
    g.append(cv2.cvtColor(cv2.resize(f, (90, 160)), cv2.COLOR_BGR2GRAY).astype(np.float32))
n = len(g)
dif = [0.0] + [float(np.abs(g[i] - g[i - 1]).mean()) for i in range(1, n)]
branco = [round(i / fps, 2) for i in range(n) if g[i].std() < 6]
pisca = [round(i / fps, 2) for i in range(1, n - 1)
         if dif[i] > 18 and dif[i + 1] > 18 and float(np.abs(g[i + 1] - g[i - 1]).mean()) < 0.35 * min(dif[i], dif[i + 1])]
travado, seguidos = [], 0
for i in range(1, n):
    seguidos = seguidos + 1 if dif[i] < 0.05 else 0
    if seguidos == int(fps):
        travado.append(round((i - seguidos) / fps, 2))
cortes = [round(i / fps, 2) for i in range(1, n) if dif[i] > 22 and dif[i] > 2.5 * max(dif[i - 1], dif[i + 1] if i + 1 < n else 0)]
print(f"{n} quadros conferidos ({n / fps:.1f} s)")
print(f"em branco: {len(branco)} {branco[:10]}")
print(f"piscando sozinho: {len(pisca)} {pisca[:10]}")
print(f"travado mais de 1 s, a partir de: {len(travado)} {travado[:10]}")
print(f"cortes: {len(cortes)} {cortes}")
print("tudo certo" if not (branco or pisca or travado) else "olhe esses tempos nas folhas de quadros")
