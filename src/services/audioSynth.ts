import { SoundTrack } from '../types';

export const SOUND_TRACKS: SoundTrack[] = [
  { id: 'rain', name: 'Midnight Rain', vibe: 'Melancholic / Cozy', icon: 'CloudRain', synthType: 'rain' },
  { id: 'crackle', name: 'Vinyl Warmth', vibe: 'Nostalgic / Retro', icon: 'Disc', synthType: 'crackle' },
  { id: 'drone', name: 'Deep Space Drone', vibe: 'Cyber-noir / Solitude', icon: 'Radio', synthType: 'drone' },
  { id: 'waves', name: 'Twilight Ocean', vibe: 'Serene / Ethereal', icon: 'Waves', synthType: 'waves' },
  { id: 'warmth', name: 'Hearth Fire', vibe: 'Cozy / Cottagecore', icon: 'Flame', synthType: 'warmth' }
];

class AudioSynthesizer {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private activeNodes: (AudioNode | number)[] = [];
  private isPlaying: boolean = false;
  private currentTrackId: string | null = null;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtxClass();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.15;
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolume(vol: number) {
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(Math.max(0, Math.min(1, vol)), this.ctx.currentTime, 0.1);
    }
  }

  public playTrack(trackId: string) {
    this.stop();
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    this.isPlaying = true;
    this.currentTrackId = trackId;

    const track = SOUND_TRACKS.find((t) => t.id === trackId);
    if (!track) return;

    switch (track.synthType) {
      case 'rain':
        this.createRainSound();
        break;
      case 'crackle':
        this.createVinylSound();
        break;
      case 'drone':
        this.createDroneSound();
        break;
      case 'waves':
        this.createOceanWavesSound();
        break;
      case 'warmth':
        this.createFireplaceSound();
        break;
    }
  }

  public stop() {
    this.activeNodes.forEach((node) => {
      if (typeof node === 'number') {
        window.clearInterval(node);
      } else {
        try {
          if ('stop' in node && typeof (node as AudioScheduledSourceNode).stop === 'function') {
            (node as AudioScheduledSourceNode).stop();
          }
          node.disconnect();
        } catch (e) {
          // ignore
        }
      }
    });
    this.activeNodes = [];
    this.isPlaying = false;
    this.currentTrackId = null;
  }

  public getTrackId(): string | null {
    return this.currentTrackId;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  // Synth Generators
  private createPinkNoiseBuffer(): AudioBuffer {
    if (!this.ctx) throw new Error('No audio context');
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      data[i] *= 0.11;
      b6 = white * 0.115926;
    }
    return buffer;
  }

  private createRainSound() {
    if (!this.ctx || !this.masterGain) return;
    const buffer = this.createPinkNoiseBuffer();
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 800;

    noise.connect(filter);
    filter.connect(this.masterGain);
    noise.start();
    this.activeNodes.push(noise);

    // Random raindrops
    const interval = window.setInterval(() => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const dropGain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200 + Math.random() * 1400, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.08);

      dropGain.gain.setValueAtTime(0.03, this.ctx.currentTime);
      dropGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

      osc.connect(dropGain);
      dropGain.connect(this.masterGain);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    }, 180);

    this.activeNodes.push(interval);
  }

  private createVinylSound() {
    if (!this.ctx || !this.masterGain) return;
    const buffer = this.createPinkNoiseBuffer();
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1500;
    filter.Q.value = 2.0;

    noise.connect(filter);
    filter.connect(this.masterGain);
    noise.start();
    this.activeNodes.push(noise);

    const interval = window.setInterval(() => {
      if (!this.ctx || !this.masterGain) return;
      if (Math.random() > 0.4) return;
      const click = this.ctx.createBufferSource();
      const clickBuf = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.005, this.ctx.sampleRate);
      const data = clickBuf.getChannelData(0);
      for (let i = 0; i < data.length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (data.length * 0.2));
      }
      click.buffer = clickBuf;
      const clickGain = this.ctx.createGain();
      clickGain.gain.value = 0.08 + Math.random() * 0.08;
      click.connect(clickGain);
      clickGain.connect(this.masterGain);
      click.start();
    }, 250);

    this.activeNodes.push(interval);
  }

  private createDroneSound() {
    if (!this.ctx || !this.masterGain) return;
    const freqs = [55, 110, 164.81, 220]; // A1 tone harmonic stack
    freqs.forEach((freq) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.value = freq + (Math.random() * 0.4 - 0.2);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 200 + Math.random() * 100;

      gain.gain.value = 0.04;
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      osc.start();
      this.activeNodes.push(osc);
    });
  }

  private createOceanWavesSound() {
    if (!this.ctx || !this.masterGain) return;
    const buffer = this.createPinkNoiseBuffer();
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 400;

    const lfo = this.ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.12; // 8-second wave pulse cycle

    const lfoGain = this.ctx.createGain();
    lfoGain.gain.value = 350;

    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    noise.connect(filter);
    filter.connect(this.masterGain);

    noise.start();
    lfo.start();
    this.activeNodes.push(noise, lfo);
  }

  private createFireplaceSound() {
    if (!this.ctx || !this.masterGain) return;
    const buffer = this.createPinkNoiseBuffer();
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 350;

    noise.connect(filter);
    filter.connect(this.masterGain);
    noise.start();
    this.activeNodes.push(noise);

    // Warm wood crackles
    const interval = window.setInterval(() => {
      if (!this.ctx || !this.masterGain) return;
      if (Math.random() > 0.5) return;
      const pop = this.ctx.createOscillator();
      const popGain = this.ctx.createGain();
      pop.type = 'triangle';
      pop.frequency.setValueAtTime(80 + Math.random() * 300, this.ctx.currentTime);
      popGain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      popGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

      pop.connect(popGain);
      popGain.connect(this.masterGain);
      pop.start();
      pop.stop(this.ctx.currentTime + 0.05);
    }, 150);

    this.activeNodes.push(interval);
  }
}

export const synthService = new AudioSynthesizer();
