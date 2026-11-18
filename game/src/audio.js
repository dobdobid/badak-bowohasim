// Suara WebAudio murni dari osilator — tanpa file audio dan tanpa network.
// AudioContext baru dibuat saat pemain pertama kali berinteraksi, sesuai
// aturan autoplay browser.
export function createAudio() {
  let context = null;
  let muted = false;

  function ensure() {
    if (context === null) {
      const AC = window.AudioContext ?? window.webkitAudioContext;
      if (!AC) return null;
      context = new AC();
    }
    if (context.state === 'suspended') void context.resume();
    return context;
  }

  function tone({ frequency, frequencyEnd = null, duration = 0.12, type = 'sine', volume = 0.16, delay = 0 }) {
    if (muted) return;
    const ctx = ensure();
    if (ctx === null) return;
    const start = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, start);
    if (frequencyEnd !== null) osc.frequency.exponentialRampToValueAtTime(Math.max(1, frequencyEnd), start + duration);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    osc.connect(gain).connect(ctx.destination);
    osc.start(start);
    osc.stop(start + duration + 0.05);
  }

  return {
    unlock() {
      ensure();
    },
    toggleMute() {
      muted = !muted;
      return muted;
    },
    isMuted() {
      return muted;
    },
    catchFood(combo) {
      const base = 520 + Math.min(combo, 8) * 40;
      tone({ frequency: base, frequencyEnd: base * 1.5, duration: 0.1, type: 'sine' });
    },
    catchGolden() {
      tone({ frequency: 660, duration: 0.1, type: 'triangle', volume: 0.18 });
      tone({ frequency: 880, duration: 0.1, type: 'triangle', volume: 0.18, delay: 0.07 });
      tone({ frequency: 1320, duration: 0.16, type: 'triangle', volume: 0.18, delay: 0.14 });
    },
    ram() {
      tone({ frequency: 220, frequencyEnd: 90, duration: 0.18, type: 'square', volume: 0.18 });
      tone({ frequency: 660, duration: 0.08, type: 'triangle', volume: 0.14, delay: 0.05 });
    },
    dash() {
      tone({ frequency: 300, frequencyEnd: 900, duration: 0.16, type: 'sawtooth', volume: 0.1 });
    },
    bump() {
      tone({ frequency: 140, frequencyEnd: 80, duration: 0.15, type: 'square', volume: 0.12 });
    },
    forestHit() {
      tone({ frequency: 160, frequencyEnd: 50, duration: 0.35, type: 'sawtooth', volume: 0.2 });
    },
    waveStart() {
      tone({ frequency: 392, duration: 0.12, type: 'triangle', volume: 0.16 });
      tone({ frequency: 311, duration: 0.18, type: 'triangle', volume: 0.16, delay: 0.12 });
    },
    waveClear() {
      tone({ frequency: 523, duration: 0.1, type: 'triangle', volume: 0.16 });
      tone({ frequency: 784, duration: 0.16, type: 'triangle', volume: 0.16, delay: 0.09 });
    },
    click() {
      tone({ frequency: 700, duration: 0.06, type: 'sine', volume: 0.1 });
    },
    win() {
      [523, 659, 784, 1047].forEach((f, i) => tone({ frequency: f, duration: 0.22, type: 'triangle', volume: 0.18, delay: i * 0.12 }));
    },
    lose() {
      [392, 330, 262, 196].forEach((f, i) => tone({ frequency: f, duration: 0.25, type: 'triangle', volume: 0.15, delay: i * 0.14 }));
    },
  };
}
