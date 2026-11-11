# MEMORY.md — Contexto Consolidado do Projeto

> Última consolidação de contexto: 07/11/2026 20:55

Tool spawn_agent_inline: nenhuma API key configurada

## 📌 Regras Permanentes de Vozes & 3D Procedural (Atualizado em 07/11/2026)
- **NUNCA usar narração do sistema (TTS do celular / SpeechSynthesis)**: A narração é SEMPRE salva como arquivo de áudio real (.mp3) na pasta `outputs/` ou `outputs/narracoes/` na raiz do projeto.
- **NUNCA criar arquivos .glb**: Os gráficos 3D são SEMPRE 100% procedurais gerados por código (Three.js / Python Pillow).
- **Vozes Neurais Realistas no Editor**: As vozes neurais realistas em português brasileiro (Feminina: Francisca / `pt-BR-FranciscaNeural` e Masculina: Antônio / `pt-BR-AntonioNeural`, além de Thalita e Donato) DEVEM SEMPRE aparecer no seletor de vozes do `video_editor.html` para criação e montagem de vídeos.
- **Reprodução por Arquivo Real (.mp3)**: O `video_editor.html` reproduz diretamente os arquivos de áudio embutidos em `outputs/narracoes/`, `vendor/voices/ptbr/` ou `assets_audio/`, garantindo preview fiel sem depender do TTS do sistema.
