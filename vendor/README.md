# vendor/ — recursos portáveis do pipeline `short`

Esta pasta torna o projeto **autossuficiente**: ao mover a pasta para outro PC,
o ffmpeg já está aqui (não precisa instalar nem baixar nada) e a narração fica
em cache local.

## Conteúdo

- `bin/ffmpeg.exe` — executável estático do FFmpeg (copiado do pacote
  `imageio-ffmpeg`). É o binário usado por `flow_provider/compose.py`.
  Para atualizar: rode `py -m pip install -U imageio-ffmpeg` e copie o novo
  `get_ffmpeg_exe()` para cá, ou baixe um build de https://gyan.dev.
- `voices/cache/` — cada narração gerada pelo edge-tts é salva aqui como `.mp3`,
  indexada por hash do texto + voz. Repetir o mesmo roteiro não regenera
  (funciona offline). Só um texto de narração **novo** consome internet.

## Internet

- FFmpeg: **offline** (está em `bin/`).
- Vozes Antonio/Francisca (edge-tts): serviço online da Microsoft. O modelo de
  voz não pode ser versionado como arquivo offline; por isso o áudio gerado é
  cacheado aqui na primeira síntese.
