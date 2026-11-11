#!/usr/bin/env python3
"""Os dois vídeos lado a lado, para comparar o seu com a referência.

Uso:
  python3 lado_a_lado.py referencia.mp4 seu_video.mp4 --saida lado-a-lado.mp4 [--som esquerda|direita]

Os dois ficam com a mesma altura; o mais curto segura o último quadro até o outro acabar.
"""
import argparse, subprocess


def dur(p):
    return float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", p],
                                capture_output=True, text=True).stdout)


ap = argparse.ArgumentParser()
ap.add_argument("esquerda")
ap.add_argument("direita")
ap.add_argument("--saida", default="lado-a-lado.mp4")
ap.add_argument("--som", default="direita", choices=["esquerda", "direita"])
ap.add_argument("--altura", type=int, default=1280)
a = ap.parse_args()
D = max(dur(a.esquerda), dur(a.direita))
h = a.altura
fc = (f"[0:v]scale=-2:{h},setsar=1,fps=30,tpad=stop_mode=clone:stop_duration={D:.2f}[l];"
      f"[1:v]scale=-2:{h},setsar=1,fps=30,tpad=stop_mode=clone:stop_duration={D:.2f}[r];"
      f"[l][r]hstack=inputs=2,trim=0:{D:.2f}[v]")
som = "0:a?" if a.som == "esquerda" else "1:a?"
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", a.esquerda, "-i", a.direita, "-filter_complex", fc, "-map", "[v]", "-map", som,
                "-c:v", "libx264", "-crf", "20", "-preset", "veryfast", "-pix_fmt", "yuv420p", "-c:a", "aac", "-t", f"{D:.2f}", a.saida], check=True)
print(f"pronto: {a.saida} ({D:.1f} s)")
