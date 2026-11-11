#!/usr/bin/env bash
# =====================================================================
# Gerador de narração TTS (Google Translate pt-BR) para o projeto
# "A Bolha e o Xadrez Mental".
# - Divide o texto em blocos de até 180 caracteres (limite do endpoint)
# - Baixa cada bloco e concatena em um único MP3 por cena
# - Saída: assets/projetos/xadrez_bolha/audios/xadrez_cenaN.mp3
# =====================================================================
set -u

ROOT="$(cd "$(dirname "$0")" && pwd)"
OUT="$ROOT/assets/projetos/xadrez_bolha/audios"
TMP="$ROOT/.tmp_tts"
mkdir -p "$OUT" "$TMP"

UA="Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36"

# ---------------------------------------------------------------- textos
TXT1='Presta muita atenção nisso: você já percebeu que tentar argumentar com certas pessoas parece um teste de paciência sem fim?'
TXT2='É literalmente o clássico xadrez com o pombo. Não importa a sua jogada ou a sua lógica: o adversário vai derrubar as peças, fazer sujeira na mesa e ainda sair estufando o peito como se tivesse vencido.'
TXT3='Mas repara no truque: por trás do medo, do ódio e desse terrorismo emocional todo, sempre tem alguém lucrando com engajamento, visualizações e soluções milagrosas.'
TXT4='E o que acontece quando essa narrativa esbarra na realidade e nas leis? O choque é imediato. Passam vergonha, quebram a cara, mas o orgulho é tão grande que preferem culpar o universo.'
TXT5='Tentar tirar alguém à força de uma ilusão só desgasta você. Quando a pessoa escolheu a própria bolha, sua resposta mais sábia é o silêncio.'
TXT6='Guarde as suas peças e economize a sua paz. Se essa reflexão fez sentido pra você, já toca no botão de seguir a página, deixa o seu like e me conta aqui nos comentários: você ainda perde tempo jogando xadrez com pombo?'

# ------------------------------------------------------- helper: chunks
# Quebra o texto em blocos <= 180 chars respeitando limites de frase/palavra
split_text() {
  local text="$1"
  local max=180
  local out=""
  local line=""
  local word
  for word in $text; do
    if [ $(( ${#line} + ${#word} + 1 )) -gt $max ]; then
      out+="${line}"$'\n'
      line="$word"
    else
      if [ -z "$line" ]; then line="$word"; else line="$line $word"; fi
    fi
  done
  [ -n "$line" ] && out+="${line}"$'\n'
  printf '%s' "$out"
}

# --------------------------------------------------- helper: baixa bloco
fetch_chunk() {
  local text="$1"
  local dest="$2"
  local ok=0
  local try
  for try in 1 2 3 4; do
    curl -s -A "$UA" -G \
      --data-urlencode "ie=UTF-8" \
      --data-urlencode "client=tw-ob" \
      --data-urlencode "tl=pt-BR" \
      --data-urlencode "q=$text" \
      "https://translate.google.com/translate_tts" -o "$dest"
    local size
    size=$(wc -c < "$dest" 2>/dev/null || echo 0)
    if [ "$size" -gt 1200 ]; then ok=1; break; fi
    sleep 1
  done
  [ "$ok" -eq 1 ]
}

# ------------------------------------------------- helper: gera 1 cena
generate_scene() {
  local num="$1"
  local text="$2"
  local final="$OUT/xadrez_cena${num}.mp3"
  local list="$TMP/list_${num}.txt"
  : > "$list"
  local idx=0
  local chunk

  while IFS= read -r chunk; do
    [ -z "$chunk" ] && continue
    idx=$((idx + 1))
    local part="$TMP/c${num}_${idx}.mp3"
    if fetch_chunk "$chunk" "$part"; then
      echo "$part" >> "$list"
      echo "  · cena $num bloco $idx OK ($(wc -c < "$part") bytes)"
    else
      echo "  ✗ cena $num bloco $idx FALHOU"
    fi
    sleep 0.4
  done < <(split_text "$text")

  if [ ! -s "$list" ]; then
    echo "!! Cena $num sem áudio"; return 1
  fi

  : > "$final"
  while IFS= read -r part; do
    cat "$part" >> "$final"
  done < "$list"
  echo "✔ $final ($(wc -c < "$final") bytes)"
}

echo "== Gerando narração completa (texto integral) =="
generate_scene 1 "$TXT1"
generate_scene 2 "$TXT2"
generate_scene 3 "$TXT3"
generate_scene 4 "$TXT4"
generate_scene 5 "$TXT5"
generate_scene 6 "$TXT6"

rm -rf "$TMP"
echo "== Concluído =="
ls -l "$OUT"
