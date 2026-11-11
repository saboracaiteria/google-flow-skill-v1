#!/bin/sh
# Regenera SOMENTE o audio da cena 1 (correcao: canaanense -> canaaense)
set -e
UA="Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36"
URL="https://tiktok-tts.weilnet.workers.dev/api/generation"
OUT="assets/projetos/canaa_paradoxo/audios"
JS="assets/js/canaa_audio_data.js"
mkdir -p "$OUT"

TEXT1="Ei, você, cidadão canãaense... já caiu água na sua torneira hoje? Ou o seu dia começou, mais uma vez, olhando pro fundo de um balde seco?"

echo "Gerando Cena 1 (texto corrigido)..."
json="{\"text\":\"$TEXT1\",\"voice\":\"br_005\"}"
res=$(curl -s -k -L -X POST "$URL" -H "Content-Type: application/json" -H "User-Agent: $UA" -d "$json")

b64=$(printf "%s" "$res" | tr -d '\r\n' | awk '{match($0, /"data":"([^"]*)"/, a); if (a[1]) print a[1]; else {split($0,b,"\"data\":\""); split(b[2],c,"\""); print c[1]}}')

if [ -z "$b64" ] || [ "$b64" = "null" ]; then
  echo "FALHA: $res"
  exit 1
fi

# 1) grava o MP3
printf "%s" "$b64" | { which base64 >/dev/null 2>&1 && base64 -d || busybox base64 -d; } > "$OUT/canaa_cena1.mp3"
echo "  -> MP3 salvo: $OUT/canaa_cena1.mp3 ($(wc -c < "$OUT/canaa_cena1.mp3") bytes)"

# 2) substitui apenas a linha da cena 1 no JS (base64 via arquivo, evita "argument list too long")
TMPB64="$OUT/.cena1.b64"
printf "%s" "$b64" > "$TMPB64"
cp "$JS" "$JS.bak"
awk -v b64file="$TMPB64" '
  BEGIN { b64 = ""; while ((getline line < b64file) > 0) b64 = b64 line; close(b64file) }
  /"canaa_cena1":/ { printf "  \"canaa_cena1\": \"data:audio/mpeg;base64,%s\",\n", b64; next }
  { print }
' "$JS.bak" > "$JS"
rm -f "$TMPB64"

echo "  -> canaa_audio_data.js atualizado (cena 1 substituida)"
echo "Concluido."
