# A cena em código e o render

## Como funciona
- O vídeo é uma página da web: uma cena 3D em three.js (`cena/js/cena.js`) e os textos por cima (`cena/js/textos.js`).
- O **HyperFrames** abre essa página num navegador escondido, pede cada quadro e grava o vídeo. Precisa do Node.js 22 ou mais novo e roda com `npx`, sem instalar.
- Ver enquanto edita: `cd cena && npx --yes hyperframes@0.8.181 preview` (abre no navegador).
- Uma imagem de um momento, sem renderizar tudo: `npx --yes hyperframes@0.8.181 snapshot cena --at 12.5 --no-end --describe false`.
- O vídeo: `cd cena && npx --yes hyperframes@0.8.181 render . --output ../video.mp4`. Um vídeo de 3 minutos leva uns 2 a 3 minutos num computador recente.

## As regras da cena
1. **Cada quadro é uma função do tempo.** A cena recebe o tempo `t` e desenha tudo a partir dele. Nada de `Math.random`, relógio ou animação que dependa do quadro anterior: o HyperFrames pede os quadros fora de ordem.
2. **Tudo entra numa palavra.** `Wd("palavra")` dá o segundo em que a palavra é falada. Use para a peça entrar, a câmera chegar e a etiqueta aparecer.
3. **A câmera em pontos-chave.** `K(tempo, alvo, giro, inclinação, distância)`: o giro em volta e a inclinação de cima, em graus, e a distância até o alvo; a câmera vai suave de um ponto ao outro. Para a aproximação rápida da receita, ponha dois pontos com uns 0,6 segundo de diferença.
4. **Confira com imagens.** Antes de renderizar tudo, rode o `mapa.py` e olhe cada frase. Depois do render, rode `conferir.py` e olhe as folhas de quadros do vídeo pronto.

## Quando algo dá errado
- Tela preta no render: abra o preview no navegador e veja o erro no console.
- Uma peça aparece antes da hora: a palavra do `Wd` apareceu antes no roteiro; use `Wd("palavra", 1)` para a segunda vez que ela é falada.
- A câmera atravessa uma parede: afaste o alvo ou esconda a parede quando a câmera estiver do lado de fora.
