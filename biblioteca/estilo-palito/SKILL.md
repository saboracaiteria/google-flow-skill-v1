---
name: estilo-palito
description: >
  Faz um short no estilo palito a partir de um short
  de referência: estuda quadro a quadro, escreve uma
  história sua na mesma fórmula, monta em HyperFrames
  com Three.js e compara lado a lado até bater.
  Use quando pedirem um short animado nesse estilo
  (personagem plano num mundo 3D, câmera sempre andando),
  "faz igual a esse short" ou o próximo de uma série assim.
---

# Estilo palito

## 1. Estudar, só com número
- Baixe o short e veja o fps real (yt-dlp -F).
- Meça quanto a imagem muda a cada quadro.
- Liste os cortes fortes em segundos (ex.: 2,4 s).
- Anote onde a câmera anda e onde ela freia.

## 2. Roteiro
- A mesma fórmula, frase por frase.
- História, idioma e visual seus.
- Confira cada fato antes de escrever.

## 3. Montar
- HyperFrames + Three.js: mundo em 3D,
  personagem plano, câmera sempre andando.
- A voz da pessoa no ElevenLabs.
- Corte nos segundos que você mediu.

## 4. Comparar e corrigir
- O seu do lado do original, quadro a quadro.
- Diga qual cena falta e em que segundo.
- Um pedido por vez, até o ritmo bater.

---

## Começar: o que perguntar

Numa mensagem só, pergunte:

1. O link do short de referência e quantos segundos fazer (comece com 15).
2. O assunto e a língua do vídeo dela.
3. A voz: a voz dela clonada na ElevenLabs, uma voz pronta, ou ela mesma gravando.
4. Se ela tem uma ideia de personagem (uma foto, um desenho) ou se você propõe.

O skill traz as ferramentas e o passo a passo. Ele não traz vídeo, voz, música, história nem personagem: tudo isso é da pessoa.

## O que precisa estar instalado

Confira e diga como resolver o que faltar (no Mac, com o Homebrew):

- **Python 3.10 ou mais novo** e `pip install opencv-python numpy`, mais um Whisper (`pip install mlx-whisper` no Mac com chip Apple, ou `pip install faster-whisper`). Com o `uv`: `uv run --with opencv-python --with numpy python3 ...`.
- **ffmpeg** e **yt-dlp** (`brew install ffmpeg yt-dlp`).
- **Node.js 22 ou mais novo** (`brew install node`) para o HyperFrames, que roda com `npx`, sem instalar.
- **Uma pasta só para o vídeo.** Trabalhe só dentro dela.

## As regras

1. **Número, nunca "ficou bonito".** Toda observação tem o segundo ou o quadro. "Corte no segundo 2,4" a pessoa confere e você consegue repetir.
2. **O fps real.** Leia os formatos (`yt-dlp -F`) e estude no fps que o vídeo tem. Se ele tem 30, estudar em 60 só repete cada quadro.
3. **O custo antes de gastar.** Antes da voz paga, diga quantos caracteres vão ser usados e espere um ok. A chave nunca passa pelo chat: ela fica no `.env` da pasta (`referencias/voz.md`).
4. **Não copie.** Da referência vêm a fórmula, o ritmo, a câmera e o jeito de desenhar. As frases, os personagens, a história e os arquivos são da pessoa. Não use quadros nem áudio da referência no vídeo dela.
5. **Fatos conferidos.** O que for real, confira antes de escrever. O que for inventado, diga que é.
6. **Testes curtos.** Antes do vídeo inteiro, um teste de 5 segundos. Nunca escreva por cima de um render: cada versão tem um número novo.
7. **Abra as imagens você mesmo.** Folhas de quadros, mapa de cenas e comparação são para você olhar, não só para gerar.
8. **Um registro.** Mantenha `registro.md` na pasta: uma linha por passo, com o que foi feito e quanto tempo levou.

## O passo a passo

Nos comandos, `$SKILL` é a pasta deste skill e a pasta atual é a pasta do vídeo.

### 1. Estudar

1. `python3 $SKILL/ferramentas/baixar.py <link> --pasta referencia` (se pedir login, `--cookies chrome`). Rode também `yt-dlp -F <link>` e diga o fps real.
2. `python3 $SKILL/ferramentas/transcrever.py referencia --saida transcricoes`: cada palavra com o tempo.
3. `python3 $SKILL/ferramentas/camera.py referencia/<video>.mp4 --saida camera`: quanto a imagem muda a cada quadro, os cortes e os movimentos.
4. `python3 $SKILL/ferramentas/quadros.py referencia/<video>.mp4 --por-segundo 6 --ate 15 --saida quadros` e abra as folhas. Nos cortes e nos movimentos, rode de novo com `--por-segundo 30 --de <início> --ate <fim>`.
5. Escreva `estudo.md` seguindo `referencias/estilo-palito.md` e `referencias/receita.md`: os cortes fortes em segundos, como a câmera anda e freia, como o personagem é desenhado, a legenda, o som. Tudo com número.

### 2. Roteiro

Siga `referencias/roteiro.md`: a fórmula da referência (como abre, o que se repete, como termina), uma frase da pessoa para cada frase da referência, cabendo no mesmo tempo. Mostre as duas lado a lado e espere o ok. Escreva `roteiro.txt` só com o que vai ser falado.

### 3. Montar

1. **A voz.** ElevenLabs: `python3 $SKILL/ferramentas/voz.py roteiro.txt --voz <ID> --custo`, diga os caracteres, espere o ok e rode sem `--custo`. Gravada: a pessoa grava lendo o roteiro (`voz/voz.wav`) e você roda `transcrever.py voz/voz.wav --saida voz`.
2. **A cena.** `python3 $SKILL/ferramentas/montar.py --tempos voz/tempos.json --voz voz/voz.wav --cena cena`. Depois troque o exemplo de `cena/js/cena.js` pelo mundo do vídeo, seguindo `referencias/estilo-palito.md`: o mundo em 3D com Three.js, os personagens planos virados para a câmera, a câmera sempre andando, os cortes nos segundos medidos, uma palavra de legenda por vez. `referencias/render.md` tem as regras da cena.
3. **Um teste de 5 segundos** antes do resto: `npx --yes hyperframes@0.8.181 snapshot cena --at <segundo> --no-end --describe false` para imagens soltas, e o render inteiro só depois do ok.
4. **O vídeo:** `cd cena && npx --yes hyperframes@0.8.181 render . --output ../video-v1.mp4`. O som: `referencias/som.md`.

### 4. Comparar e corrigir

1. `python3 $SKILL/ferramentas/lado_a_lado.py referencia/<video>.mp4 video-v1.mp4 --saida lado-a-lado-v1.mp4`, e `quadros.py` dos dois nos mesmos segundos. Abra e compare cena por cena.
2. `python3 $SKILL/ferramentas/conferir.py video-v1.mp4`: quadro preto, quadro piscando, imagem travada.
3. Diga à pessoa o que está igual e o que está diferente, com o segundo. Quando ela pedir uma correção ("na hora do drone nos trilhos falta..."), volte na referência nesse segundo, liste o que tem lá e refaça só isso. Cada rodada é uma versão nova (`v2`, `v3`...), até o ritmo bater.
