#!/bin/sh
set -e
UA="Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36"
URL="https://tiktok-tts.weilnet.workers.dev/api/generation"
OUT="assets/projetos/moju_pernas_cinzentas/audios"
JS="assets/js/moju_audio_data.js"
mkdir -p "$OUT"

TEXT1="Nas entranhas de Moju, no coração do Pará, existe um ramal de terra que nenhum mapa antigo ousa registrar."
TEXT2="Lá, o chão é feito de cinzas e tabatinga branca. Ao caminhar na estrada, as pernas das moças ficam totalmente cinzentas."
TEXT3="A poeira é tão densa e pálida que qualquer viajante consegue escrever o próprio nome na perna delas com a ponta do dedo."
TEXT4="Mas os ribeirinhos alertam: quem grava seu nome no pó cinzento perde a direção e jamais consegue ir embora de Moju."
TEXT5="A névoa cobre o rio, a poeira sobe ao luar, e os nomes escritos continuam presos para sempre naquela terra sem fim."

printf "window.MOJU_AUDIO_DATA = {\n" > "$JS"

gerar() {
  idx="$1"
  txt="$2"
  echo "Gerando Cena $idx..."
  json="{\"text\":\"$txt\",\"voice\":\"br_005\"}"
  res=$(curl -s -k -L -X POST "$URL" -H "Content-Type: application/json" -H "User-Agent: $UA" -d "$json")
  b64=$(printf "%s" "$res" | tr -d '\r\n' | awk '{match($0, /"data":"([^"]*)"/, a); if (a[1]) print a[1]; else {split($0,b,"\"data\":\""); split(b[2],c,"\""); print c[1]}}')

  if [ -n "$b64" ] && [ "$b64" != "null" ]; then
    printf '  "moju_cena%s": "data:audio/mpeg;base64,%s",\n' "$idx" "$b64" >> "$JS"
    printf "%s" "$b64" | { which base64 >/dev/null 2>&1 && base64 -d || busybox base64 -d; } > "$OUT/moju_cena$idx.mp3" 2>/dev/null || true
    echo "  -> Sucesso Cena $idx (tamanho b64: ${#b64} bytes)"
  else
    echo "  -> FALHA na cena $idx: $res"
  fi
}

gerar 1 "$TEXT1"
gerar 2 "$TEXT2"
gerar 3 "$TEXT3"
gerar 4 "$TEXT4"
gerar 5 "$TEXT5"

printf "};\n" >> "$JS"
echo "Concluído!"
