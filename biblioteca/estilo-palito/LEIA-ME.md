# Estilo palito: um short animado a partir de um short de referência

Você manda o link de um short que deu certo no estilo palito (personagem plano num mundo em 3D, câmera sempre andando), e o Claude faz com você, explicando cada passo:

1. **Estuda** o short quadro a quadro e mede tudo em número: o fps real, os cortes, quanto a imagem muda a cada quadro, onde a câmera anda e freia.
2. **Escreve o roteiro** na mesma fórmula, frase por frase, com a sua história.
3. **Monta** o vídeo em código, com Three.js e HyperFrames, e a sua voz.
4. **Compara** com o original lado a lado e corrige uma cena por vez.

## O que você precisa

- **O Claude com acesso às pastas do seu computador:** o Claude Code, ou a aba Code do app do Claude.
- **No computador:** Python 3.10 ou mais novo, ffmpeg, yt-dlp e Node.js 22 ou mais novo. O Claude confere e diz como instalar o que faltar.
- **A voz:** a sua, gravada ou clonada na ElevenLabs, ou uma voz pronta.

## O que você traz

O short de referência, a sua história, a sua voz. O skill traz as ferramentas e o passo a passo, e nenhum vídeo, voz, música, história ou personagem.

## Como instalar

**No Claude Code:** copie a pasta `estilo-palito` para a pasta `.claude/skills` da sua pasta de usuário, abra uma sessão numa pasta vazia só para o vídeo e peça: "Use o skill estilo-palito. Vamos fazer este short: <link>, só os primeiros 15 segundos".

**No app do Claude:** em Configurações, Capacidades, envie o arquivo `.zip`. Use a aba Code, com a pasta do vídeo aberta.

**No Codex, no Gemini ou em outra IA:** cole o conteúdo do `SKILL.md` como instrução e mande as ferramentas junto. Ela precisa conseguir rodar comandos no seu computador.

## O que vem na pasta

- `SKILL.md`: o passo a passo que o Claude segue.
- `ferramentas/`: `baixar.py`, `transcrever.py`, `camera.py`, `quadros.py`, `voz.py`, `montar.py`, `mapa.py`, `conferir.py`, `lado_a_lado.py`.
- `modelo/`: a cena de partida em Three.js, com um exemplo simples (um guarda-chuva montado em três partes) que mostra como tudo entra na palavra certa. O Claude troca o exemplo pelo mundo do seu vídeo.
- `exemplo/roteiro.txt`: o roteiro do exemplo.
- `referencias/`: um guia por etapa (o estilo palito, a receita, o roteiro, a voz, o render, o som).

**Para testar a instalação:** `python3 ferramentas/montar.py --exemplo --cena cena-exemplo` e depois `npx --yes hyperframes@0.8.181 snapshot cena-exemplo --at 5 --no-end --describe false`. Sai uma imagem do exemplo no segundo 5.
