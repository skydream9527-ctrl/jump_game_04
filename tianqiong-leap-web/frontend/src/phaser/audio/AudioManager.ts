import Phaser from 'phaser';

// Chapter BGM melodies (note frequencies, one octave)
const BGM_MELODIES: Record<number, number[][]> = {
  1: [[262, 330, 392, 330], [262, 294, 349, 392]],        // Earth: warm C major
  2: [[220, 277, 330, 277], [220, 262, 294, 330]],        // Moon: airy A minor
  3: [[294, 370, 440, 370], [294, 349, 392, 440]],        // Mars: bold D
  4: [[330, 415, 494, 415], [330, 392, 440, 494]],        // Mercury: bright E
  5: [[262, 311, 370, 311], [262, 294, 349, 370]],        // Ice: cool C minor
  6: [[349, 440, 523, 440], [349, 415, 466, 523]],        // Fire: intense F
  7: [[392, 494, 587, 494], [392, 466, 523, 587]],        // Thunder: electric G
  8: [[330, 392, 494, 392], [330, 370, 440, 494]],        // Jungle: natural E
  9: [[440, 554, 659, 554], [440, 523, 587, 659]],        // Crystal: high A
  10: [[196, 247, 294, 247], [196, 233, 262, 294]],       // Dark: deep G
};

export class AudioManager {
  private ctx: AudioContext | null = null;
  private muted = false;
  private bgmGain: GainNode | null = null;
  private bgmInterval: ReturnType<typeof setInterval> | null = null;
  private bgmChapter = 0;

  constructor(scene: Phaser.Scene) {
    try {
      this.ctx = (scene.sound as any).context ?? null;
    } catch {
      // Phaser sound manager not ready; will create on demand
    }
  }

  private ensureCtx(): AudioContext {
    if (!this.ctx) {
      this.ctx = new AudioContext();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
  }

  private play(fn: (ctx: AudioContext) => void): void {
    if (this.muted) return;
    try {
      fn(this.ensureCtx());
    } catch {
      // Audio unavailable (e.g. autoplay policy)
    }
  }

  jump(): void {
    this.play(ctx => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(280, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(560, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.18);
    });
  }

  private landBuffer: AudioBuffer | null = null;

  land(): void {
    this.play(ctx => {
      if (!this.landBuffer) {
        const bufSize = ctx.sampleRate * 0.1;
        this.landBuffer = ctx.createBuffer(1, bufSize, ctx.sampleRate);
        const data = this.landBuffer.getChannelData(0);
        for (let i = 0; i < bufSize; i++) {
          data[i] = (Math.random() * 2 - 1) * (1 - i / bufSize);
        }
      }
      const source = ctx.createBufferSource();
      source.buffer = this.landBuffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 800;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      source.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      source.start(ctx.currentTime);
    });
  }

  shard(): void {
    this.play(ctx => {
      const gain = ctx.createGain();
      gain.connect(ctx.destination);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);

      for (const freq of [880, 1320]) {
        const osc = ctx.createOscillator();
        osc.connect(gain);
        osc.type = 'sine';
        osc.frequency.value = freq;
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.25);
      }
    });
  }

  gameOver(): void {
    this.play(ctx => {
      const gain = ctx.createGain();
      gain.connect(ctx.destination);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.7);

      for (const [start, end] of [[440, 110], [445, 108]]) {
        const osc = ctx.createOscillator();
        osc.connect(gain);
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(start, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(end, ctx.currentTime + 0.6);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.7);
      }
    });
  }

  levelComplete(): void {
    this.play(ctx => {
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.value = freq;
        const start = ctx.currentTime + i * 0.12;
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(0.12, start + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.4);
        osc.start(start);
        osc.stop(start + 0.4);
      });
    });
  }

  startBGM(chapter: number): void {
    if (chapter === this.bgmChapter && this.bgmInterval) return;
    this.stopBGM();

    const ctx = this.ensureCtx();
    this.bgmChapter = chapter;

    // Master gain for BGM
    this.bgmGain = ctx.createGain();
    this.bgmGain.gain.value = 0.04;
    this.bgmGain.connect(ctx.destination);

    const melody = BGM_MELODIES[chapter] ?? BGM_MELODIES[1];
    let noteIndex = 0;
    let phraseIndex = 0;

    const playNote = () => {
      if (this.muted || !this.bgmGain) return;
      const phrase = melody[phraseIndex % melody.length];
      const freq = phrase[noteIndex % phrase.length];

      const osc = ctx.createOscillator();
      const noteGain = ctx.createGain();
      osc.connect(noteGain);
      noteGain.connect(this.bgmGain);
      osc.type = 'sine';
      osc.frequency.value = freq;

      const now = ctx.currentTime;
      noteGain.gain.setValueAtTime(0, now);
      noteGain.gain.linearRampToValueAtTime(0.8, now + 0.05);
      noteGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.35);

      // Subtle harmony
      const osc2 = ctx.createOscillator();
      const harmGain = ctx.createGain();
      osc2.connect(harmGain);
      harmGain.connect(this.bgmGain);
      osc2.type = 'triangle';
      osc2.frequency.value = freq * 0.5;
      harmGain.gain.setValueAtTime(0, now);
      harmGain.gain.linearRampToValueAtTime(0.3, now + 0.05);
      harmGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc2.start(now);
      osc2.stop(now + 0.3);

      noteIndex++;
      if (noteIndex >= phrase.length) {
        noteIndex = 0;
        phraseIndex++;
      }
    };

    playNote();
    this.bgmInterval = setInterval(playNote, 380);
  }

  shoot(): void {
    this.play(ctx => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'square';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.06);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.08);
    });
  }

  shootSpread(): void {
    this.play(ctx => {
      const gain = ctx.createGain();
      gain.connect(ctx.destination);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      for (const freq of [600, 800, 1000]) {
        const osc = ctx.createOscillator();
        osc.connect(gain);
        osc.type = 'sawtooth';
        osc.frequency.value = freq;
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.1);
      }
    });
  }

  shootLaser(): void {
    this.play(ctx => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(2400, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.18);
    });
  }

  pickupWeapon(): void {
    this.play(ctx => {
      const notes = [523.25, 659.25, 783.99];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.value = freq;
        const start = ctx.currentTime + i * 0.08;
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(0.1, start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.2);
        osc.start(start);
        osc.stop(start + 0.2);
      });
    });
  }

  stopBGM(): void {
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
    if (this.bgmGain) {
      try { this.bgmGain.disconnect(); } catch {}
      this.bgmGain = null;
    }
    this.bgmChapter = 0;
  }

  powerup(): void {
    this.play(ctx => {
      const notes = [440, 554, 659, 880];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.value = freq;
        const start = ctx.currentTime + i * 0.06;
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(0.1, start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.15);
        osc.start(start);
        osc.stop(start + 0.15);
      });
    });
  }

  hit(): void {
    this.play(ctx => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(200, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.2);
    });
  }

  lightningStrike(): void {
    this.play(ctx => {
      const gain = ctx.createGain();
      gain.connect(ctx.destination);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

      // White noise burst for thunder
      const bufSize = Math.floor(ctx.sampleRate * 0.5);
      const buffer = ctx.createBuffer(1, bufSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufSize; i++) {
        data[i] = (Math.random() * 2 - 1) * (1 - i / bufSize);
      }
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 400;
      source.connect(filter);
      filter.connect(gain);
      source.start(ctx.currentTime);
    });
  }
}
