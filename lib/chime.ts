'use client';

// Browsers only let a page play sound after the user has interacted with it,
// so the AudioContext is created lazily and unlocked on the first click/tap.
let ctx: AudioContext | null = null;

function getContext(): AudioContext | null {
  try {
    const Ctor =
      window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx ??= new Ctor();
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

/** Call from a click/tap handler (or the first pointer event) so later chimes are allowed to play. */
export function unlockAudio() {
  getContext();
}

/** A short two-note bell: noticeable in a busy room without being harsh. */
export function playChime() {
  const audio = getContext();
  if (!audio) return;
  const start = audio.currentTime;
  [783.99, 1046.5].forEach((freq, i) => {
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    const t = start + i * 0.22;
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.28, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.1);
    osc.connect(gain).connect(audio.destination);
    osc.start(t);
    osc.stop(t + 1.2);
  });
}
