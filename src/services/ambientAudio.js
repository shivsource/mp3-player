/**
 * Procedural Web Audio Ambient Sound Generator
 * Generates realistic wind rush, tire friction, and rain sound effects.
 */

class AmbientAudioEngine {
  constructor() {
    this.ctx = null;
    this.isInitialized = false;
    this.isPlaying = false;
    this.masterGain = null;
    this.windGain = null;
    this.tireGain = null;
    this.rainGain = null;

    this.windSource = null;
    this.windFilter = null;
    
    this.tireSource = null;
    this.tireFilter = null;
    
    this.rainSource = null;
    this.rainFilter = null;

    this.currentMode = 'highway';
    this.isRainEnabled = false;
    this.isMuted = false;
    this.volume = 0.45; // 0 - 1
  }

  ensureContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  // Create a 2-second looped buffer of white/pink noise
  createNoiseBuffer() {
    if (!this.ctx) return null;
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      // Simple pinkish filtering
      data[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = data[i];
      data[i] *= 3.5; // Gain compensation
    }
    return buffer;
  }

  initAudioGraph() {
    if (this.isInitialized || !this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, now);
      this.masterGain.connect(this.ctx.destination);

      // --- Wind Noise ---
      const noiseBuffer = this.createNoiseBuffer();
      if (noiseBuffer) {
        this.windSource = this.ctx.createBufferSource();
        this.windSource.buffer = noiseBuffer;
        this.windSource.loop = true;

        this.windFilter = this.ctx.createBiquadFilter();
        this.windFilter.type = 'bandpass';
        this.windFilter.frequency.setValueAtTime(450, now);
        this.windFilter.Q.setValueAtTime(0.8, now);

        this.windGain = this.ctx.createGain();
        this.windGain.gain.setValueAtTime(0.12, now);

        this.windSource.connect(this.windFilter);
        this.windFilter.connect(this.windGain);
        this.windGain.connect(this.masterGain);
        this.windSource.start();

        // --- Tire Road Friction ---
        this.tireSource = this.ctx.createBufferSource();
        this.tireSource.buffer = noiseBuffer;
        this.tireSource.loop = true;

        this.tireFilter = this.ctx.createBiquadFilter();
        this.tireFilter.type = 'lowpass';
        this.tireFilter.frequency.setValueAtTime(320, now);

        this.tireGain = this.ctx.createGain();
        this.tireGain.gain.setValueAtTime(0.15, now);

        this.tireSource.connect(this.tireFilter);
        this.tireFilter.connect(this.tireGain);
        this.tireGain.connect(this.masterGain);
        this.tireSource.start();

        // --- Rain Sound Layer ---
        this.rainSource = this.ctx.createBufferSource();
        this.rainSource.buffer = noiseBuffer;
        this.rainSource.loop = true;

        this.rainFilter = this.ctx.createBiquadFilter();
        this.rainFilter.type = 'highpass';
        this.rainFilter.frequency.setValueAtTime(1800, now);

        this.rainGain = this.ctx.createGain();
        this.rainGain.gain.setValueAtTime(this.isRainEnabled ? 0.22 : 0, now);

        this.rainSource.connect(this.rainFilter);
        this.rainFilter.connect(this.rainGain);
        this.rainGain.connect(this.masterGain);
        this.rainSource.start();
      }

      this.isInitialized = true;
      this.isPlaying = true;
    } catch (e) {
      console.warn('Ambient Audio Engine init error:', e);
    }
  }

  start() {
    this.ensureContext();
    if (!this.isInitialized) {
      this.initAudioGraph();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    this.isPlaying = true;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime, 0.1);
    }
  }

  updateMode(modeId, speedFactor = 1.0) {
    this.currentMode = modeId;
    if (!this.isInitialized || !this.ctx) return;

    const now = this.ctx.currentTime;

    if (this.windGain) {
      const windTarget = modeId === 'highway' ? 0.22 : modeId === 'city' ? 0.12 : 0.06;
      this.windGain.gain.setTargetAtTime(windTarget, now, 0.4);
    }

    if (this.tireGain) {
      const tireTarget = modeId === 'highway' ? 0.18 : modeId === 'city' ? 0.22 : 0.14;
      this.tireGain.gain.setTargetAtTime(tireTarget, now, 0.4);
    }
  }

  setRain(enabled) {
    this.isRainEnabled = enabled;
    if (!this.isInitialized || !this.ctx || !this.rainGain) return;
    const now = this.ctx.currentTime;
    this.rainGain.gain.setTargetAtTime(enabled ? 0.25 : 0.0, now, 0.5);
  }

  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx && !this.isMuted) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.05);
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime, 0.05);
    }
    return this.isMuted;
  }
}

export const ambientAudioService = new AmbientAudioEngine();
