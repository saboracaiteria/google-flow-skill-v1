// assets/js/procedural_audio_fx.js
// Síntese procedural de efeitos sonoros em WebAudio nativo (inspirado em sfx.py da biblioteca)
// Sem arquivos externos ou downloads — roda 100% offline no navegador/Android.

(function(global) {
  'use strict';

  class ProceduralAudioEngine {
    constructor(audioContext) {
      this.ctx = audioContext || null;
      this.masterGain = null;
      this.volume = 0.35; // Nível padrão equilibrado com a voz (-14 LUFS)
    }

    setContext(ctx, destinationNode) {
      this.ctx = ctx;
      if (this.ctx) {
        try {
          if (this.masterGain) {
            this.masterGain.disconnect();
          }
        } catch(e) {}
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = this.volume;
        if (destinationNode) {
          this.masterGain.connect(destinationNode);
        } else {
          this.masterGain.connect(this.ctx.destination);
        }
      }
    }

    setVolume(vol) {
      this.volume = Math.max(0, Math.min(1, vol));
      if (this.masterGain && this.ctx) {
        this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      }
    }

    // Transição de vento / corte rápido de cena (whoosh)
    playWhoosh(duration = 0.4, startTime = null) {
      if (!this.ctx || !this.masterGain) return;
      const t = startTime !== null ? startTime : this.ctx.currentTime;
      const dur = Math.max(0.15, duration);

      // Noise buffer (ruído branco filtrado)
      const bufferSize = Math.floor(this.ctx.sampleRate * dur);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      // Bandpass dinâmico que sobe e desce rápido
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.Q.value = 3.0;
      filter.frequency.setValueAtTime(200, t);
      filter.frequency.exponentialRampToValueAtTime(1400, t + dur * 0.45);
      filter.frequency.exponentialRampToValueAtTime(120, t + dur);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.7, t + dur * 0.4);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      noise.start(t);
      noise.stop(t + dur);
    }

    // Impacto grave para transições e ênfases (sub_drop)
    playSubDrop(duration = 0.65, startTime = null) {
      if (!this.ctx || !this.masterGain) return;
      const t = startTime !== null ? startTime : this.ctx.currentTime;
      const dur = Math.max(0.3, duration);

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(110, t);
      osc.frequency.exponentialRampToValueAtTime(28, t + dur);

      gain.gain.setValueAtTime(0.9, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t);
      osc.stop(t + dur);
    }

    // Surgimento elástico de títulos e objetos (pop)
    playPop(startTime = null) {
      if (!this.ctx || !this.masterGain) return;
      const t = startTime !== null ? startTime : this.ctx.currentTime;
      const dur = 0.12;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, t);
      osc.frequency.exponentialRampToValueAtTime(780, t + dur * 0.5);
      osc.frequency.exponentialRampToValueAtTime(240, t + dur);

      gain.gain.setValueAtTime(0.6, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t);
      osc.stop(t + dur);
    }

    // Clique sutil de relógio / peças de xadrez (click)
    playClick(startTime = null) {
      if (!this.ctx || !this.masterGain) return;
      const t = startTime !== null ? startTime : this.ctx.currentTime;
      const dur = 0.04;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1400, t);
      osc.frequency.exponentialRampToValueAtTime(300, t + dur);

      gain.gain.setValueAtTime(0.4, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t);
      osc.stop(t + dur);
    }

    // Tensão crescente antes de uma revelação (riser)
    playRiser(duration = 1.0, startTime = null) {
      if (!this.ctx || !this.masterGain) return;
      const t = startTime !== null ? startTime : this.ctx.currentTime;
      const dur = Math.max(0.4, duration);

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(120, t);
      osc.frequency.exponentialRampToValueAtTime(880, t + dur);

      // Lowpass para evitar som estridente
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(300, t);
      filter.frequency.exponentialRampToValueAtTime(1800, t + dur);

      gain.gain.setValueAtTime(0.01, t);
      gain.gain.linearRampToValueAtTime(0.5, t + dur * 0.85);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t);
      osc.stop(t + dur);
    }

    // Disparo por tipo de efeito
    playByName(name, duration = 0.4, startTime = null) {
      switch ((name || '').toLowerCase()) {
        case 'whoosh':
          this.playWhoosh(duration, startTime);
          break;
        case 'sub_drop':
        case 'impact':
          this.playSubDrop(duration, startTime);
          break;
        case 'pop':
          this.playPop(startTime);
          break;
        case 'click':
        case 'tick':
          this.playClick(startTime);
          break;
        case 'riser':
          this.playRiser(duration, startTime);
          break;
        case 'clash':
        case 'sword':
          this.playClash(startTime);
          break;
        case 'slash':
          this.playSlash(startTime);
          break;
        case 'energy_crack':
          this.playEnergyCrack(startTime);
          break;
        default:
          this.playWhoosh(0.3, startTime);
      }
    }

    // ── Clash: impacto metálico de espada ──
    playClash(startTime = null) {
      if (!this.ctx || !this.masterGain) return;
      const t = startTime !== null ? startTime : this.ctx.currentTime;
      // Metal ring
      const ring = this.ctx.createOscillator();
      ring.type = 'triangle';
      ring.frequency.setValueAtTime(1800, t);
      ring.frequency.exponentialRampToValueAtTime(300, t + 0.18);
      const rGain = this.ctx.createGain();
      rGain.gain.setValueAtTime(0.6, t);
      rGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
      ring.connect(rGain); rGain.connect(this.masterGain);
      ring.start(t); ring.stop(t + 0.2);
      // Noise burst
      const buf = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.08, this.ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1);
      const ns = this.ctx.createBufferSource();
      ns.buffer = buf;
      const nGain = this.ctx.createGain();
      nGain.gain.setValueAtTime(0.5, t);
      nGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.08);
      ns.connect(nGain); nGain.connect(this.masterGain);
      ns.start(t);
    }

    // ── Slash: corte de lâmina no ar ──
    playSlash(startTime = null) {
      if (!this.ctx || !this.masterGain) return;
      const t = startTime !== null ? startTime : this.ctx.currentTime;
      const bufSize = this.ctx.sampleRate * 0.12;
      const buf = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
      const ns = this.ctx.createBufferSource();
      ns.buffer = buf;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(2200, t);
      filter.Q.value = 1.5;
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.8, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
      ns.connect(filter); filter.connect(gain); gain.connect(this.masterGain);
      ns.start(t);
    }

    // ── Energy Crack: fenda de energia/neon ──
    playEnergyCrack(startTime = null) {
      if (!this.ctx || !this.masterGain) return;
      const t = startTime !== null ? startTime : this.ctx.currentTime;
      for (let i = 0; i < 3; i++) {
        const osc = this.ctx.createOscillator();
        osc.type = 'sawtooth';
        const freq = 80 + i * 55;
        osc.frequency.setValueAtTime(freq * 4, t + i * 0.04);
        osc.frequency.exponentialRampToValueAtTime(freq, t + i * 0.04 + 0.15);
        const g = this.ctx.createGain();
        g.gain.setValueAtTime(0.4, t + i * 0.04);
        g.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.04 + 0.15);
        osc.connect(g); g.connect(this.masterGain);
        osc.start(t + i * 0.04);
        osc.stop(t + i * 0.04 + 0.18);
      }
    }
  }

  global.ProceduralAudioEngine = ProceduralAudioEngine;
})(window);
