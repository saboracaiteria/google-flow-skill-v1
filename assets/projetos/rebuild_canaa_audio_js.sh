#!/bin/sh
# Reconstroi assets/js/canaa_audio_data.js a partir dos MP3 existentes
set -e
OUT="assets/projetos/canaa_paradoxo/audios"
JS="assets/js/canaa_audio_data.js"

printf "window.CANAA_AUDIO_DATA = {\n" > "$JS"

i=1
while [ "$i" -le 6 ]; do
  f="$OUT/canaa_cena$i.mp3"
  if [ ! -s "$f" ]; then
    echo "ERRO: $f ausente ou vazio"
    exit 1
  fi
  b64=$(base64 -w 0 "$f" 2>/dev/null || busybox base64 "$f" | tr -d '\r\n')
  printf '  "canaa_cena%s": "data:audio/mpeg;base64,%s",\n' "$i" "$b64" >> "$JS"
  echo "  -> cena $i embutida ($(wc -c < "$f") bytes)"
  i=$((i + 1))
done

printf "};\n" >> "$JS"
echo "Concluido: $JS reconstruido."
