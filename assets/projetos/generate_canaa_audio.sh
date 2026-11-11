#!/bin/sh
set -e
UA="Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36"
URL="https://tiktok-tts.weilnet.workers.dev/api/generation"
OUT="assets/projetos/canaa_paradoxo/audios"
JS="assets/js/canaa_audio_data.js"
mkdir -p "$OUT"

TEXT1="Ei, você, cidadão canãaense... já caiu água na sua torneira hoje? Ou o seu dia começou, mais uma vez, olhando pro fundo de um balde seco?"
TEXT2="Parece piada de mau gosto, mas estamos falando de Canaã dos Carajás. Uma das cidades mais ricas de todo o Brasil, bilionária pelo minério de ferro e dona de um dos maiores PIBs per capita do país."
TEXT3="Mas aqui vai o que ninguém mostra nas propagandas oficiais: como uma cidade que nada em dinheiro consegue deixar o seu próprio povo sem água pra beber, cozinhar e tomar banho?"
TEXT4="A cena diária não parece a de uma potência mineral; parece um vilarejo esquecido no tempo. Famílias inteiras tendo que se humilhar atrás de caminhão-pipa. O poder público simplesmente lavou as mãos, terceirizou o serviço pro setor privado e a conta sobrou, como sempre, pras torneiras vazias da população."
TEXT5="Cadê os bilhões do minério que entram nos cofres municipais? Se o básico do básico não chega na casa de quem vive aqui, quem realmente está lucrando com a riqueza de Canaã?"
TEXT6="Essa realidade precisa ser ouvida fora daqui. Compartilhe esse vídeo agora pra furar a bolha, deixe sua curtida e siga a nossa página pra não perder nenhuma verdade que tentam esconder de você."

printf "window.CANAA_AUDIO_DATA = {\n" > "$JS"

gerar() {
  idx="$1"
  txt="$2"
  echo "Gerando Cena $idx..."
  json="{\"text\":\"$txt\",\"voice\":\"br_005\"}"
  res=$(curl -s -k -L -X POST "$URL" -H "Content-Type: application/json" -H "User-Agent: $UA" -d "$json")
  b64=$(printf "%s" "$res" | tr -d '\r\n' | awk '{match($0, /"data":"([^"]*)"/, a); if (a[1]) print a[1]; else {split($0,b,"\"data\":\""); split(b[2],c,"\""); print c[1]}}')

  if [ -n "$b64" ] && [ "$b64" != "null" ]; then
    printf '  "canaa_cena%s": "data:audio/mpeg;base64,%s",\n' "$idx" "$b64" >> "$JS"
    printf "%s" "$b64" | { which base64 >/dev/null 2>&1 && base64 -d || busybox base64 -d; } > "$OUT/canaa_cena$idx.mp3" 2>/dev/null || true
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

printf "};\n" >> "$JS"
echo "Concluído com sucesso! Arquivos em $OUT e $JS prontos."
