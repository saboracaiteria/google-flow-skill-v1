# Módulo de Narração e Voz pt-BR (VoiceNarrator)

Módulo isolado e reutilizável para síntese de voz humana em Português do Brasil com controle de idade, timbre e velocidade para projetos web e mobile.

---

## 📁 Arquivos do Módulo
* **`voice-narrator.js`**: Classe standalone `VoiceNarrator` (sem dependências externas).
* **`exemplo_narrador.html`**: Interface gráfica responsiva com sliders de entonação (pitch), velocidade (rate), volume e perfis comerciais prontos.

---

## 🚀 Como Integrar em Outro Projeto

Basta incluir o script e instanciar o narrador:

```html
<script src="voice-narrator.js"></script>
<script>
  const narrator = new VoiceNarrator({
    onStart: () => console.log("Narração iniciada"),
    onEnd: () => console.log("Narração finalizada")
  });

  // 1. Narração com perfil pré-calibrado (Adulto Profissional):
  narrator.speak("Apresentamos o novo negócio que vai transformar seus resultados!", {
    profile: 'adult_professional'
  });

  // 2. Narração com perfil Jovem & Enérgico (Ideal para Reels e TikTok):
  narrator.speak("Olha só essa novidade incrível para você!", {
    profile: 'young_energetic'
  });

  // 3. Narração personalizada com ajuste fino:
  narrator.speak("Texto customizado", {
    pitch: 0.85,  // 0.5 (muito grave) a 1.7 (muito agudo)
    rate: 1.10,   // velocidade da fala
    volume: 1.0   // 0.0 a 1.0
  });

  // Para interromper a qualquer momento:
  narrator.stop();
</script>
```

---

## 🎙️ Perfis Nativos Disponíveis
| Perfil | Pitch (Tom) | Rate (Velocidade) | Uso Recomendado |
|---|---|---|---|
| `adult_professional` | `0.90` | `1.05` | Apresentações corporativas, novos negócios e pitches de vendas |
| `young_energetic` | `1.30` | `1.15` | Vídeos de alta retenção (Reels, TikTok, Shorts) |
| `mature_broadcaster` | `0.70` | `0.95` | Locução solene, rádio, podcasts ou documentários |
| `custom` | Dinâmico | Dinâmico | Ajuste milimétrico pelos sliders |

---

## 📱 Observação Importante sobre o Android WebView vs Google Chrome
* **No Google Chrome e navegadores completos:** O áudio é reproduzido diretamente pelo motor de alta fidelidade do Google Speech Services em Português do Brasil.
* **No WebView interno:** Como o Android restringe o acesso direto ao TTS em WebViews embutidas, use o botão `🚀 Abrir no Chrome do Celular` ou carregue o endereço local no navegador para audição com qualidade total.
