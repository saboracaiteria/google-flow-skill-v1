# A voz

## Na ElevenLabs
1. Crie uma conta em elevenlabs.io. Ela cobra por caractere: um vídeo de 3 minutos tem uns 2.500.
2. A sua voz clonada: em Voices, "Instant Voice Clone", envie uns minutos da sua voz falando. Ou escolha uma voz pronta na biblioteca.
3. O ID da voz: na lista de vozes, abra o menu da voz e clique em "Copy Voice ID".
4. A chave de API: em Developers, API Keys, crie uma chave. Coloque num arquivo `.env` na pasta do vídeo, numa linha assim: `ELEVENLABS_API_KEY=sua_chave`. Não mostre a chave para ninguém.
5. `voz.py roteiro.txt --voz <ID> --custo` mostra quantos caracteres vai gastar antes de gastar.

## De graça, com a sua voz
1. Grave lendo o `roteiro.txt` no celular ou no computador, num lugar quieto. Salve como `voz/voz.wav` (ou qualquer áudio).
2. `transcrever.py voz/voz.wav --saida voz` tira o tempo de cada palavra.
3. Use o `voz/voz.json` no lugar do `tempos.json` no `montar.py`.

## O tempo de cada palavra
É ele que faz tudo entrar na hora certa: a peça entra na palavra que fala dela, a câmera chega na peça nessa palavra, a legenda troca a cada palavra. Por isso a voz vem antes da cena.
