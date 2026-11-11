#!/bin/sh
set -e
UA="Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36"
URL="https://tiktok-tts.weilnet.workers.dev/api/generation"
OUT="assets/projetos/disjuntor_paulista/audios"
JS="assets/js/disjuntor_audio_data.js"
mkdir -p "$OUT"

TEXT1="Você sabia que um simples estalo no painel elétrico pode salvar todos os aparelhos da sua residência e até a sua vida?"
TEXT2="Sem disjuntores adequados, qualquer sobrecarga elétrica aquece a fiação na parede, queima televisores e geladeiras, e pode causar fogo nos cômodos."
TEXT3="O disjuntor moderno é o escudo invisível do seu lar. Quando a corrente sobe além do limite, ele desarma em milissegundos e corta o perigo antes do estrago."
TEXT4="Para proteger quem você ama com materiais certificados, passe na Paulista Materiais para Construção. Só aqui você encontra as melhores marcas com os melhores preços."
TEXT5="Sua casa já tem disjuntores revisados? Proteja sua família, curta este vídeo, compartilhe com seus amigos e comente aqui embaixo!"

printf "window.DISJUNTOR_AUDIO_DATA = {\n" > "$JS"

gerar() {
  idx="$1"
  txt="$2"
  echo "Gerando Cena $idx..."
  json="{\"text\":\"$txt\",\"voice\":\"br_005\"}"
  res=$(curl -s -k -L -X POST "$URL" -H "Content-Type: application/json" -H "User-Agent: $UA" -d "$json")
  b64=$(printf "%s" "$res" | tr -d '\r\n' | awk '{match($0, /"data":"([^"]*)"/, a); if (a[1]) print a[1]; else {split($0,b,"\"data\":\""); split(b[2],c,"\""); print c[1]}}')

  if [ -n "$b64" ] && [ "$b64" != "null" ]; then
    printf '  "disjuntor_cena%s": "data:audio/mpeg;base64,%s",\n' "$idx" "$b64" >> "$JS"
    printf "%s" "$b64" | { which base64 >/dev/null 2>&1 && base64 -d || busybox base64 -d; } > "$OUT/disjuntor_cena$idx.mp3" 2>/dev/null || true
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
echo "Concluído com sucesso! Arquivos em $OUT e $JS prontos."
