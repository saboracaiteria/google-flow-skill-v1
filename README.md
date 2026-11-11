# Google Flow Skill v2

Dile a un agente con terminal local: **“Crea tres imágenes y dos clips sobre esta idea; usa Google Flow y entrégame los archivos.”** El agente prepara los prompts, controla Flow en Chrome, espera la generación y descarga los resultados. También puede ejecutar lotes a partir de un JSON.

Funciona con Claude Code, Codex, OpenCode u otros agentes **cuando se ejecutan en tu equipo con escritorio y Chrome visible**. El requisito es el entorno local, no la marca del agente.

## Qué incluye

- Imagen desde texto o con referencia local.
- Video desde texto, fotograma inicial o fotogramas inicial y final.
- Lotes ordenados de imágenes y videos, con encadenamiento imagen → video.
- **Video corto narrado de duración libre** (`short`): clips de ~10s encadenados, narración pt-BR, subtítulos quemados y exportación 360p.
- Selección de modelo, formato y duración de video compatible con Flow.
- Descarga automática a `outputs/` y reporte `batch_report.json`.

Cada trabajo guarda un resultado. Para diez imágenes, crea diez trabajos `image`; consulta [el ejemplo de lote](examples/lote_imagenes.json). La skill pública entrega **assets de Flow**. Para un Short terminado con montaje, voz y subtítulos, conecta después un editor como Remotion o un pipeline aparte.

## Instalación

Necesitas Python 3.10+ y Google Chrome. Abre un agente en esta carpeta, haz que lea `SKILL.md` y pídele instalarla. Los comandos son:

```powershell
python setup.py
python flow.py status
python flow.py login
```

`login` abre Chrome para que **tú** inicies sesión. El perfil queda en `session/flowbot-profile/`; nunca lo subas al repositorio ni lo compartas. `status` solo detecta el perfil, no prueba que la sesión siga autenticada. Si las reglas de tu workspace exigen mostrar o aprobar comandos, el agente debe respetarlas.

Repositorio actual: [BRPLia/google-flow-skill-v1](https://github.com/BRPLia/google-flow-skill-v1). El nombre de la URL conserva “v1”; este código corresponde a la v2.

## Uso rápido

```powershell
python flow.py image --prompt "Three distinct paper flowers on a plain table, vertical 9:16" --name flores
python flow.py video --prompt "A gentle breeze moves the paper flowers" --start outputs/flores.png --model "Veo 3.1 - Lite" --duration 8s --name flores_clip
python flow.py batch examples/lote_imagenes.json
```

Para lotes, el agente debe escribir el JSON y ejecutar `batch`; tú no tienes que copiar prompts uno por uno. Los resultados quedan en `outputs/<project>/`. Revisa el reporte del lote para ver éxitos y errores.

## Video narrado (pipeline `short`)

Para un video de la duración que pidas (ej. 30s, 2min) con **narración en portugués, subtítulos y 360p**, escribe un roteiro y ejecuta:

```powershell
python flow.py short examples/roteiro_casa_praia.json
```

El pipeline genera clips de ~10s con **Omni 1.1 Flash** (tantos como haga falta para cubrir el alvo, encadenados por el último cuadro para no cortar), narra con **edge-tts** (voz `pt-BR-AntonioNeural`, alternativa `pt-BR-FranciscaNeural`) y monta con **ffmpeg** (concat + mezcla de audio + subtítulos + escala 640x360). Resultado: `outputs/<title>/<title>_360p.mp4`.

### Portabilidad y voces

- El **ffmpeg viaja dentro del proyecto** en `vendor/bin/ffmpeg.exe` (offline, sin instalar nada en otro PC). Se prepara con `python setup.py`.
- Las voces Antonio/Francisca son del servicio online edge-tts: la **primera** vez que se sintetiza un texto nuevo se necesita internet; el audio queda **cacheado** en `vendor/voices/cache/` y las repeticiones funcionan offline.
- Cada clip consume créditos de Flow; `short` informa cuántos clips hará antes de empezar.

---

## 🎬 Floww Studio — Editor & Montagem 3D em Tempo Real (`video_editor.html`)

O repositório inclui um **estúdio completo e autônomo** para visualização, animação 3D, narração e exportação de vídeos verticais (9:16 Shorts/Reels/TikTok) diretamente no navegador, sem dependências externas pesadas:

- **Arquivo Principal**: `video_editor.html` (aberto localmente no navegador ou Webview).
- **Projetos Integrados**:
  - `A Bolha e o Xadrez Mental` (`assets/projetos/xadrez_bolha/`): cenas 3D com personagens reflexivos, tabuleiros, peças físicas e animação procedural.
  - `Odisseia do Steve` (`assets/projetos/steve_minecraft/`): Steve procedural, ciclos de dia/noite com iluminação pontual de tocha, cabana de carvalho e castelo medieval.
- **Áudio & Narração**: Web Audio API com pré-carregamento instantâneo, controle de silenciamento (`🔊`/`🔇`) durante exportação e sincronização precisa de legendas dinâmicas.
- **Controles de UI Interativos**:
  - Arrasto vertical com toque/mouse diretamente no canvas para o **balão do título** e para as **legendas**.
  - Sliders manuais de porcentagem para posicionamento em zonas seguras de redes sociais (Safe Zones de Reels/TikTok).
- **Exportação Estável**: Renderização com `MediaRecorder` em formato WebM (VP8/Opus) preservando áudio integral e salvando em `assets/projetos/<slug>/videos/`.

### Guardião de contenido

Cuando Flow bloquea un prompt, `flow_provider/policy_guard.py` propone una **reescrita legítima dentro de la política** y pide tu aprobación; nunca reenvía solo ni intenta burlar la moderación con pretextos.

## Preguntas frecuentes

**¿Crea imágenes por lotes?** Sí. Cada entrada `image` del JSON genera y descarga una imagen. Puedes mezclar imágenes y videos en el mismo lote.

**¿Sirve para contenido de YouTube?** Sí, para crear las imágenes y los clips. Un video completo también requiere guion, voz si corresponde, edición y exportación. Esta skill no hace ese montaje por sí sola.

**¿Cómo conecto Flow con Remotion y Claude?** Claude dirige `flow.py batch` y recibe rutas de MP4/PNG. Un proyecto Remotion usa esos archivos locales como fuentes y renderiza el video final. Remotion se instala y configura por separado; esta skill no lo incluye.

**¿Por qué no aparece la ventana de Chrome en Antigravity?** Si el código corre en un sandbox remoto, la ventana puede abrirse allí y no en tu escritorio. Usa un ejecutor local con acceso a la pantalla. Claude Code, Codex u OpenCode también necesitan ejecución local para mostrarla; el nombre del agente no garantiza visibilidad.

**¿Es gratis?** La automatización no añade una suscripción propia. Google Flow usa créditos para generar medios; puede haber créditos diarios sin suscripción y el costo depende del modelo. Comprueba los [límites y costos actuales](https://support.google.com/flow/answer/16526234?hl=es-419).

## Archivos

- `flow.py`: CLI pública.
- `SKILL.md`: instrucciones para el agente.
- `flow_provider/`: automatización interna de Flow.
- `examples/`: lotes y roteiros de ejemplo.
- `vendor/`: ffmpeg embebido y cache de voces para el pipeline `short` (portable).
- `session/`: perfil privado de Chrome, excluido de Git.
- `outputs/`: descargas locales, excluidas de Git.

La automatización depende de la interfaz web de Flow y puede requerir mantenimiento cuando Google la cambie.
