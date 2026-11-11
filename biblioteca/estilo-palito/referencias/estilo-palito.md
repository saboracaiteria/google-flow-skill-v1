# O estilo palito: o que medir e como montar

Estes são os números de um short de 15 segundos nesse estilo, medidos quadro a quadro. Servem de régua: a sua referência pode ser diferente, e é ela que manda.

## O que o short faz
- **Quadros:** 450 em 15 segundos, 30 por segundo.
- **Cortes fortes:** 5, nos segundos 2,4, 3,6, 9,9, 10,5 e 14,2. Entre eles a imagem nunca fica parada.
- **A câmera nunca para.** Cada movimento sai rápido e freia aos poucos, em uns 14 quadros, e emenda num deslize lento até o próximo. Aparecem voos de drone sobre o cenário, aproximações no rosto e travellings de lado.
- **O personagem é plano**, desenhado em 2D (cabeça redonda grande, olhos e boca simples, corpo e membros de palito, uma roupa de cor forte), num mundo em 3D com profundidade, luz e sombra.
- **A legenda:** uma palavra por vez, branca com contorno escuro, no meio da tela.
- **A história começa na primeira frase**, sem apresentação.

## Como montar em Three.js
- **O mundo:** formas simples com cores saturadas (paredes, chão, trilhos, prédios), uma luz de sol forte de um lado e névoa leve no fundo para dar profundidade.
- **O personagem plano:** desenhe cada pose num `canvas` (círculo da cabeça, rosto, traços do corpo) e use como textura de um plano que sempre olha para a câmera. Troque de pose trocando a textura; mexa os braços redesenhando o `canvas` a partir do tempo `t`. Contorno escuro grosso, sem sombra no desenho.
- **A câmera:** pontos-chave com saída rápida e freada lenta (uma curva "expo out"), sempre com algum movimento entre eles. Nunca deixe a câmera parada mais que meio segundo.
- **Os cortes:** troque de câmera ou de cenário exatamente nos segundos medidos.
- **Tudo é função do tempo** (`referencias/render.md`): nada de `Math.random` nem relógio.

## O que conferir no seu
- Nada tampando o que importa (uma parede na frente do cenário, o personagem na frente do trem).
- Os personagens que a referência mostra numa cena também estão na sua.
- O ritmo dos cortes bate com a régua, segundo por segundo.
