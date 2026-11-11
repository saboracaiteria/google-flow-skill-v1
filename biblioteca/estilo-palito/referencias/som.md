# O som: música, efeitos e volume

## Onde achar de graça
- **Biblioteca de áudio do YouTube** (no YouTube Studio): músicas e efeitos. Algumas músicas pedem crédito na descrição: confira.
- **Pixabay** (pixabay.com/sound-effects e /music): efeitos e músicas sem precisar dar crédito.
- **ElevenLabs Sound Effects**: gera um efeito a partir de uma frase (pago).

## O que colocar
- Um "whoosh" curto em cada aproximação rápida da câmera.
- Um "pop" quando uma peça ou etiqueta aparece.
- Uma batida grave numa explosão ou num impacto.
- Uma música calma, sem voz, bem baixa por baixo da narração.

## No projeto
Coloque os arquivos em `cena/assets/` e acrescente no `cena/index.html`, ao lado da voz, uma linha por som:
`<audio src="assets/whoosh.mp3" data-start="12.4" data-duration="0.6" data-track-index="3" data-volume="0.4"></audio>`
O `data-start` é o tempo da palavra (está no `tempos.json`). A música: `data-start="0"`, a duração do vídeo e `data-volume="0.15"`.

## O volume final
Vídeos de redes ficam perto de -14 LUFS. Para acertar o volume do vídeo pronto:
`ffmpeg -i video.mp4 -c:v copy -af loudnorm=I=-14:TP=-1.5:LRA=7 video-final.mp4`
