#!/usr/bin/env python3
"""Baixa vídeos (Instagram, TikTok, YouTube e outros) com o yt-dlp e escreve os números de cada um.

Uso:
  python3 baixar.py <link> [<link> ...] --pasta referencia
  python3 baixar.py <link> --pasta referencia --cookies chrome     (se o site pedir login)

Escreve na pasta: <id>.mp4, <id>.info.json e numeros.md (uma tabela com duração, visualizações,
curtidas e comentários de cada vídeo, quando o site mostra esses números).

Para pegar os outros vídeos do mesmo perfil, abra o perfil no navegador, copie os links dos
vídeos e passe todos de uma vez. Precisa do yt-dlp (brew install yt-dlp, ou pip install yt-dlp).
"""
import argparse, json, shutil, subprocess, sys
from pathlib import Path


def numero(n):
    return "" if n is None else f"{n:,}".replace(",", ".")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("links", nargs="+")
    ap.add_argument("--pasta", default="referencia")
    ap.add_argument("--cookies", default="", help="navegador de onde ler o login: chrome, safari, firefox")
    a = ap.parse_args()
    if not shutil.which("yt-dlp"):
        sys.exit("yt-dlp não está instalado: brew install yt-dlp (Mac) ou pip install yt-dlp")
    pasta = Path(a.pasta)
    pasta.mkdir(parents=True, exist_ok=True)
    linhas = []
    for link in a.links:
        # -j with --no-simulate: downloads and prints the video's data, so we know exactly which video this was
        cmd = ["yt-dlp", "-q", "--no-warnings", "--no-simulate", "-j", "-f", "bv*[ext=mp4]+ba[ext=m4a]/b[ext=mp4]/b",
               "--merge-output-format", "mp4", "--write-info-json", "-o", str(pasta / "%(id)s.%(ext)s"), link]
        if a.cookies:
            cmd[1:1] = ["--cookies-from-browser", a.cookies]
        r = subprocess.run(cmd, capture_output=True, text=True)
        if r.returncode:
            print(f"não consegui baixar {link}: {r.stderr.strip()[:300]}")
            print("  dica: tente de novo com --cookies chrome (o login do seu navegador)")
            continue
        info = json.loads(r.stdout.strip().splitlines()[-1])
        if not info.get("duration"):          # Instagram does not send it: measured from the file
            arq = pasta / f"{info.get('id')}.mp4"
            d = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(arq)], capture_output=True, text=True).stdout.strip()
            info["duration"] = float(d) if d else 0
        linhas.append(info)
        print(f"baixado: {info.get('id')} ({info.get('duration') or 0:.0f} s)")
    if not linhas:
        sys.exit("nenhum vídeo baixado")
    tab = ["# Os números de cada vídeo", "",
           "Lidos agora pelo yt-dlp. Alguns sites não mostram as visualizações sem login: aí a coluna fica vazia.", "",
           "| Vídeo | Duração | Visualizações | Curtidas | Comentários | Título |", "|---|---|---|---|---|---|"]
    for i in sorted(linhas, key=lambda x: -(x.get("view_count") or x.get("like_count") or 0)):
        titulo = (i.get("description") or i.get("title") or "").split("\n")[0][:70].replace("|", "/")
        tab.append(f"| {i.get('id')} | {i.get('duration') or 0:.0f} s | {numero(i.get('view_count'))} | {numero(i.get('like_count'))} | "
                   f"{numero(i.get('comment_count'))} | {titulo} |")
    (pasta / "numeros.md").write_text("\n".join(tab) + "\n")
    print(f"{len(linhas)} vídeos em {pasta}/; números em {pasta}/numeros.md")


main()
