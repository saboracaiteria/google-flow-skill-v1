# A receita: o que anotar quando você desmonta um vídeo

A receita é o que se repete. Leia todos os vídeos do perfil, não só um: o que aparece em todos é a receita; o que aparece em um só é escolha daquele vídeo.

Escreva `receita.md` com estas partes, sempre com números medidos:

## 1. A fórmula do roteiro
- Como abre (os primeiros 3 segundos: uma pergunta, um problema, uma promessa?).
- O que se repete no meio (a mesma estrutura de frase volta? quantas vezes?).
- Onde tem uma pausa ou uma piada.
- Como termina e qual é o pedido final (comentar uma palavra, seguir, salvar).
- Quantas palavras por minuto.

## 2. A câmera (de `camera/<video>.md` e das folhas de quadros)
- Quantos cortes por minuto, e quando corta (só quando muda de lugar?).
- Quanto tempo a câmera fica parada, e como ela se move (aproximação rápida? deslize lento?).
- Quanto dura um movimento e onde ele termina (na peça que está sendo falada?).
- Tela dividida, câmera girando em volta, câmera tremendo.

## 3. O visual
- O estilo (3D, desenho, foto), as cores, a luz.
- O personagem: o que ele faz e quando aparece.
- O cenário: um só, ou um por assunto?

## 4. Como cada coisa entra
- Uma peça aparece crescendo, voando de longe, ou de repente? Em quantos quadros?
- Ela entra na palavra que fala dela, antes, ou depois?
- Como o nome dela aparece (etiqueta, legenda, cor diferente)?

## 5. Os textos na tela
- A legenda: quantas palavras por vez, a fonte, a cor, onde fica.
- Etiquetas, setas, números, avisos (um X vermelho num erro, um ok verde no acerto).
- Funciona sem som? (Num feed, muita gente assiste sem som.)

## 6. O som
- A voz: ritmo, pausas.
- Música: tem? alta ou baixa?
- Efeitos: em quais ações.
- O volume final (`ffmpeg -i video.mp4 -af ebur128 -f null -` mostra o valor em LUFS; vídeos de redes ficam perto de -14).

`estilo-palito.md` traz os números de um short nesse estilo, para você ter uma régua.
