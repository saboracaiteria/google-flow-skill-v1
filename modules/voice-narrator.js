/**
 * VoiceNarrator - Motor de Narração e Entonação em Português do Brasil
 * Utiliza o motor oficial de voz humana do Android/Chrome (Web Speech API).
 */

class VoiceNarrator {
  constructor(options = {}) {
    this.synth = typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null;
    this.voices = [];
    this.currentUtterance = null;
    this.isPlaying = false;

    this.onStart = options.onStart || null;
    this.onEnd = options.onEnd || null;
    this.onError = options.onError || null;

    // Perfis prontos de entonação calibrados
    this.profiles = {
      young_energetic: { pitch: 1.30, rate: 1.15, label: "⚡ Jovem & Enérgico" },
      adult_professional: { pitch: 0.90, rate: 1.05, label: "👔 Adulto & Profissional" },
      mature_broadcaster: { pitch: 0.70, rate: 0.95, label: "🎙️ Maduro & Radialista" },
      custom: { pitch: 1.0, rate: 1.0, label: "⚙️ Personalizado" }
    };

    if (this.synth) {
      this.loadVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  isSpeechSynthesisSupported() {
    return !!this.synth;
  }

  loadVoices() {
    if (!this.synth) return [];
    this.voices = this.synth.getVoices() || [];
    return this.getPtBrVoices();
  }

  getPtBrVoices() {
    return this.voices.filter(v => v.lang.includes('pt') || v.lang.includes('BR'));
  }

  getAllVoices() {
    return this.voices;
  }

  speak(text, config = {}) {
    if (!text || !text.trim()) return null;
    this.stop();

    const profileKey = config.profile || 'adult_professional';
    const profile = this.profiles[profileKey] || this.profiles.adult_professional;
    const pitch = config.pitch !== undefined ? Number(config.pitch) : profile.pitch;
    const rate = config.rate !== undefined ? Number(config.rate) : profile.rate;
    const volume = config.volume !== undefined ? Number(config.volume) : 1.0;

    // 1. Navegadores com suporte nativo à voz humana (Chrome, Edge, Samsung Internet)
    if (this.synth) {
      const utterance = new SpeechSynthesisUtterance(text.trim());

      const voiceURI = config.voiceURI || null;
      if (voiceURI) {
        const selected = this.voices.find(v => v.voiceURI === voiceURI);
        if (selected) utterance.voice = selected;
      } else {
        const ptBr = this.getPtBrVoices();
        if (ptBr.length > 0) utterance.voice = ptBr[0];
      }

      utterance.pitch = pitch;
      utterance.rate = rate;
      utterance.volume = volume;

      utterance.onstart = () => {
        this.isPlaying = true;
        if (this.onStart) this.onStart();
      };

      utterance.onend = () => {
        this.isPlaying = false;
        this.currentUtterance = null;
        if (this.onEnd) this.onEnd();
      };

      utterance.onerror = (err) => {
        this.isPlaying = false;
        this.currentUtterance = null;
        if (this.onError) this.onError(err);
      };

      this.currentUtterance = utterance;
      this.synth.speak(utterance);
      return utterance;
    }

    // 2. Se estiver na WebView embutida (onde o Google/Android desativa o TTS por segurança)
    if (this.onError) {
      this.onError({
        isWebView: true,
        message: "O preview interno da IDE roda em WebView sem suporte a voz humana. Abra no Chrome do celular para ouvir a voz real em português!"
      });
    }
    return null;
  }

  stop() {
    if (this.synth) {
      this.synth.cancel();
    }
    this.isPlaying = false;
    this.currentUtterance = null;
  }

  pause() {
    if (this.synth && this.isPlaying) {
      this.synth.pause();
    }
  }

  resume() {
    if (this.synth) {
      this.synth.resume();
    }
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = VoiceNarrator;
} else {
  window.VoiceNarrator = VoiceNarrator;
}
