#!/bin/sh
set -e
UA="Mozilla/5.0"
URL="https://tiktok-tts.weilnet.workers.dev/api/generation"
OUT="assets/projetos/mamao_tres_sexos/audios"
mkdir -p "$OUT"

TEXT1="Três sementes de mamão na mesma cova viram três plantas idênticas."
TEXT2="Crescem juntas, abrem folhas enormes e passam da cintura do agricultor."
TEXT3="Por fora, nenhuma diferença."
TEXT4="Meses depois, as flores revelam tudo. A primeira dá um mamão redondo: é fêmea."
TEXT5="A segunda solta hastes longas de florzinhas e quase nunca dá fruto: é macho."
TEXT6="A terceira tem os dois sexos na mesma flor e dá um mamão alongado."
TEXT7="É hermafrodita: a que mais vende."

printf "window.MAMAO_AUDIO_DATA = {\n" > assets/js/mamao_audio_data.js

gerar() {
  idx="$1"
  txt="$2"
  json="{\"text\":\"$txt\",\"voice\":\"br_005\"}"
  res=$(curl -s -k -L -X POST "$URL" -H "Content-Type: application/json" -H "User-Agent: $UA" -d "$json")
  b64=$(printf "%s" "$res" | tr -d '\r\n' | awk '{match($0, /"data":"([^"]*)"/, a); if (a[1]) print a[1]; else {split($0,b,"\"data\":\""); split(b[2],c,"\""); print c[1]}}')
  
  if [ -n "$b64" ] && [ "$b64" != "null" ]; then
    printf '  "mamao_cena%s": "data:audio/mp3;base64,%s",\n' "$idx" "$b64" >> assets/js/mamao_audio_data.js
    printf "%s" "$b64" | { which base64 >/dev/null 2>&1 && base64 -d || busybox base64 -d; } > "$OUT/mamao_cena$idx.mp3" 2>/dev/null || true
  fi
}

gerar 1 "$TEXT1"
gerar 2 "$TEXT2"
gerar 3 "$TEXT3"
gerar 4 "$TEXT4"
gerar 5 "$TEXT5"
gerar 6 "$TEXT6"
gerar 7 "$TEXT7"

printf "};\n" >> assets/js/mamao_audio_data.js
