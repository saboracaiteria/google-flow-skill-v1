# MEMORY.md — Contexto Consolidado do Projeto (CODEX-IDE)

> Última consolidação de contexto: 11/11/2026 14:30

## 📌 Diretrizes e Decisões Arquiteturais
[Sub-agente]
# MEMORY.md — Resumo Consolidado

## 1. Decisões arquiteturais e regras estabelecidas
- Áudios do projeto **Canaã Paradoxo** são armazenados em `assets/projetos/canaa_paradoxo/audios/` (caminho alternativo observado: `floww/assets/projetos/canaa_paradoxo/audios`).
- Os metadados de áudio são expostos ao front via `canaa_audio_data.js`, que define o objeto global `window.CANAA_AUDIO_DATA`.
- Convenção de chaves por cena: `canaa_cena1` … `canaa_cena6`.
- Geração de áudio é orquestrada pelo script `generate_canaa_audio.sh`.
- Validação de exportação deve checar não só existência do arquivo, mas também tamanho/integridade (arquivo vazio/corrompido) e presença da entrada no JS de dados.

## 2. Arquivos e módulos criados, modificados ou inspecionados
- **Inspecionados:**
  - `assets/projetos/canaa_paradoxo/audios/` (listagem)
  - `floww/assets/projetos/canaa_paradoxo/audios/` (listagem)
  - `generate_canaa_audio.sh` (leitura)
  - `canaa_audio_data.js` (scan por `canaa_cena6`)
- **Nenhum arquivo criado ou modificado** nesta sessão.

## 3. Problemas resolvidos e comportamentos validados
- **Validado:** existem 6 arquivos `.mp3` na pasta de áudios (cena 1 a 6 presentes fisicamente).
- **Validado:** `canaa_audio_data.js` contém 1 ocorrência de `canaa_cena6`, indicando que a entrada da cena 6 existe no arquivo de dados.
- **Estrutura inferida do JS:** ~100 linhas; abertura `window.CANAA_AUDIO_DATA = {`; entradas `canaa_cena1`…`canaa_cena6`; fechamento `};`. (Inferência ainda não confirmada por leitura completa.)
- **Incidente:** erro de infraestrutura `Local LLM Error: HTTP 429` (rate limit da conta) interrompeu a primeira verificação; trabalho foi retomado.
- **Observação:** comando `ls -la assets/projetos/canaa_paradoxo/audios/` retornou exit code 0, porém o terminal reportou-se “blocked”, impedindo leitura direta de tamanhos.

## 4. Estado atual e pendências ativas
- **Causa raiz NÃO confirmada** para o áudio da última cena “não exportado”.
- **Pendente:** confirmar tamanho real dos 6 `.mp3` (detectar cena 6 vazia/truncada) — bloqueado por limitação do terminal; alternativa é usar `read_file`/scan ou outro método

## 🕒 Histórico de Atualizações Recentes
- [10/11/2026 23:32] Vídeo "Canaã dos Carajás: O S11D & O Megatrem" (preset canaa_megatrem) foi estendido de 45s para 69s com 6 cenas: 1) Mina S11D, 2) Esteiras Truckless, 3) Megatrem 330 vagões, 4) Serpente de Ferro, 5) A Terra Prometida (assentamento dos colonos), 6) A Cidade que Cresceu (Canaã moderna). Iluminação clareada: céu 0x8ecae6, fog 0xbfe3f2, hemi 1.15, dir 1.55, ambient 0.85 + fillLight, vinheta reduzida para 0.22. Áudios em assets/projetos/canaa_megatrem/audios/megatrem_cena1..6.mp3 e dados em assets/js/canaa_megatrem_audio_data.js.
- [10/11/2026 23:47] Vídeo "Canaã dos Carajás: O S11D & O Megatrem" agora tem 7 cenas / 82s (cena 7 = fechamento reflexivo com monumento "?" em voxels dourados, áudio megatrem_cena7.mp3). Renderer: assets/js/canaa_voxel_renderer.js (scenesGroup com 7 grupos).
- [11/11/2026 14:32] video_editor.html (floww): bug de exportação onde o áudio tocava acelerado e acabava antes do vídeo. Causa: no exportLoop, `dt = Math.min((now-lastExportTs)/1000, 0.5)` clampava o delta de tempo; com frames pesados no Android (>500ms), o currentTime do vídeo avançava mais devagar que o áudio WebAudio (tempo real). Correção: usar dt real sem clamp. Também: preset canaa_paradoxo teve durações ajustadas para o áudio real (10/12.6/10/19.4/10.4/12.5 = 74.9s).
