// Web Audio API - synth-generated sound effects. Zero external dependencies.

let audioCtx = null;

const KEY_SFX_VOLUME = 'mg_sfx_volume';

export const getSfxVolume = () => {
  try {
    const raw = localStorage.getItem(KEY_SFX_VOLUME);
    const v = raw == null ? 1 : Number(raw);
    if (!Number.isFinite(v)) return 1;
    return Math.max(0, Math.min(1, v));
  } catch {
    return 1;
  }
};

export const setSfxVolume = (v) => {
  const n = Number(v);
  const clamped = Number.isFinite(n) ? Math.max(0, Math.min(1, n)) : 1;
  try {
    localStorage.setItem(KEY_SFX_VOLUME, String(clamped));
  } catch {}
  return clamped;
};

const getCtx = () => {
  if (!audioCtx) {
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      return null;
    }
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
};

const playTone = (freq, duration, type = 'sine', volume = 0.12, attack = 0.005, release = 0.08) => {
  const ctx = getCtx();
  if (!ctx) return;
  const master = getSfxVolume();
  if (master <= 0) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(volume * master, ctx.currentTime + attack);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration + release);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + duration + release);
};

const playNoise = (duration = 0.6, volume = 0.25) => {
  const ctx = getCtx();
  if (!ctx) return;
  const master = getSfxVolume();
  if (master <= 0) return;
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
  }
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(volume * master, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(800, ctx.currentTime);
  filter.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + duration);
  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  noise.start(ctx.currentTime);
  noise.stop(ctx.currentTime + duration);
};

export const sfx = {
  click: () => playTone(880, 0.04, 'triangle', 0.08),
  reveal: () => playTone(1200, 0.05, 'sine', 0.06),
  flag: () => {
    playTone(660, 0.05, 'square', 0.08);
    setTimeout(() => playTone(990, 0.05, 'square', 0.06), 40);
  },
  unflag: () => playTone(440, 0.05, 'square', 0.06),
  explosion: () => {
    playNoise(0.7, 0.3);
    playTone(80, 0.4, 'sawtooth', 0.25, 0.005, 0.3);
    setTimeout(() => playTone(55, 0.5, 'sawtooth', 0.15, 0.005, 0.4), 80);
  },
  lifeLost: () => {
    playTone(300, 0.08, 'sawtooth', 0.15);
    setTimeout(() => playTone(200, 0.12, 'sawtooth', 0.12), 80);
  },
  victory: () => {
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C, E, G, C
    notes.forEach((f, i) => setTimeout(() => playTone(f, 0.2, 'triangle', 0.14), i * 110));
    setTimeout(() => {
      playTone(1318.5, 0.4, 'triangle', 0.16, 0.01, 0.3);
    }, 500);
  },
  gameOver: () => {
    const notes = [440, 370, 330, 294];
    notes.forEach((f, i) => setTimeout(() => playTone(f, 0.18, 'sawtooth', 0.14), i * 130));
  },
};
