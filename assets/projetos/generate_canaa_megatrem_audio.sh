#!/bin/sh
set -e
UA="Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36"
URL="https://tiktok-tts.weilnet.workers.dev/api/generation"
OUT="assets/projetos/canaa_megatrem/audios"
JS="assets/js/canaa_megatrem_audio_data.js"
mkdir -p "$OUT"

TEXT1="Você sabia que no coração do Pará existe uma mina sem caminhões gigantes? Bem-vindo a Canaã dos Carajás, lar do S11D."
TEXT2="Em vez de queimar milhões de litros de diesel, trinta quilômetros de esteiras transportadoras automáticas cruzam a floresta como veias de aço puro."
TEXT3="Elas abastecem o maior comboio ferroviário do planeta. Um megatrem com trezentos e trinta vagões e mais de três quilômetros de comprimento."
TEXT4="Uma verdadeira serpente de ferro que transporta o minério mais puro do planeta até o mar."
TEXT5="Mas antes do minério, Canaã era só um assentamento de colonos. Famílias vindas de todo o Brasil chamaram aquele lugar de Terra Prometida."
TEXT6="Hoje, a cidade que nasceu da poeira virou uma das que mais crescem no país. Isso é Canaã dos Carajás!"
TEXT7="Mas fica a pergunta: quando a última tonelada de ferro descer a serra, o que vai restar? Canaã será lembrada pelo que arrancou da terra, ou pelo que construiu sobre ela?"

printf "window.CANAA_MEGATREM_AUDIO_DATA = {\n" > "$JS"

gerar() {
  idx="$1"
  txt="$2"
  echo "Gerando Cena $idx..."
  json="{\"text\":\"$txt\",\"voice\":\"br_005\"}"
  res=$(curl -s -k -L -X POST "$URL" -H "Content-Type: application/json" -H "User-Agent: $UA" -d "$json")
  b64=$(printf "%s" "$res" | tr -d '\r\n' | awk '{match($0, /"data":"([^"]*)"/, a); if (a[1]) print a[1]; else {split($0,b,"\"data\":\""); split(b[2],c,"\""); print c[1]}}')

  if [ -n "$b64" ] && [ "$b64" != "null" ]; then
    printf '  "megatrem_cena%s": "data:audio/mpeg;base64,%s",\n' "$idx" "$b64" >> "$JS"
    printf "%s" "$b64" | { which base64 >/dev/null 2>&1 && base64 -d || busybox base64 -d; } > "$OUT/megatrem_cena$idx.mp3" 2>/dev/null || true
    echo "  -> Sucesso Cena $idx"
  else
    echo "  -> FALHA na cena $idx: $res"
  fi
}

gerar 1 "$TEXT1"
gerar 2 "$TEXT2"
gerar 3 "$TEXT3"
gerar 4 "$TEXT4"
gerar 5 "$TEXT5"
gerar 6 "$TEXT6"
gerar 7 "$TEXT7"

printf "};\n" >> "$JS"
echo "Concluído com sucesso! Arquivos em $OUT e $JS prontos."
