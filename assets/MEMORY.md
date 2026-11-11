# MEMORY.md — Contexto Consolidado do Projeto (CODEX-IDE)

> Última consolidação de contexto: 08/11/2026 00:58

## 📌 Diretrizes e Decisões Arquiteturais
# MEMORY.md — CODEX-IDE

## 1. Decisões arquiteturais e regras
- Editor de vídeo é um único arquivo `video_editor.html` (~1825 linhas, 23 símbolos) com cena Three.js embutida.
- Cena Minecraft usa módulos separados: `environment_minecraft.js`, `steve_minecraft.js`, `textures_minecraft.js`.
- Áudio/narração servido de `outputs/narracoes/` e vozes de `vendor/voices/ptbr/` (arquivos MP3, ex.: 78KB, 9.768s, 48kHz mono).
- Ferramentas nativas de inspeção: `read_file`, `jev_scan`, `file_outline`, `list_dir`, `run_terminal`, `browser_action`.

## 2. Arquivos criados/modificados/inspecionados
- `video_editor.html` — inspecionado extensivamente (múltiplas leituras, outline, scans de `audio`).
- `environment_minecraft.js` — lido.
- `steve_minecraft.js` — lido.
- `textures_minecraft.js` — lido.
- `outputs/narracoes/` — listado.
- `vendor/voices/ptbr/` — listado.

## 3. Problemas resolvidos e comportamentos validados
- **Áudio**: confirmado que o MP3 carrega corretamente via browser (`status:200`, `type:audio/mpeg`, `dur:9.768`, `ch:1`, `sr:48000`). A reprodução no navegador funciona; o "mudo" provavelmente é falha de integração/playback no editor, não do arquivo.
- **Cena Minecraft**: inspecionada via browser — 5 clips, câmera em `[1.4,1.25,2.8]`, `stevePos:[0,0,0.55]`, hierarquia de meshes/luzes mapeada (AmbientLight, DirectionalLight, Groups, Meshes com bounding boxes).
- Scans confirmaram presença de referências `audio` (15 ocorrências) em `video_editor.html`.

## 4. Estado atual e pendências ativas
- **Pendente**: corrigir áudio mudo no editor (integração de playback, não o arquivo).
- **Pendente**: corrigir enquadramento do corte de árvore — metade do personagem vai para o canto e a árvore não aparece (problema de câmera/posicionamento na cena).
- Investigação em andamento; nenhuma correção de código aplicada ainda nos logs.
- Tarefa interrompida por cancelamento de geração; retomada pendente.
- [08/11/2026 09:05] Arquitetura modular por projeto concluída: assets/projetos/steve_minecraft (audios, js, roteiro.json) e assets/projetos/xadrez_bolha (audios, js, roteiro.json). video_editor.html consome os scripts e áudios de cada pasta de projeto isolada.
