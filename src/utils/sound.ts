/**
 * Synthesized audio feedback for Chess Academy interactions.
 * Uses Web Audio API to create authentic, warm wooden piece placement clicks, captures, checks, and victory chimes.
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

/**
 * Plays a warm wooden chess piece click tone.
 */
export function playChessClick(enabled: boolean = true, volume: number = 0.5): void {
  if (!enabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.04);

    gain.gain.setValueAtTime(volume * 0.4, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.045);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  } catch {
    // Fail silently if browser audio policies restrict playback
  }
}

/**
 * Plays a chess move sound with nuances for captures and checks.
 */
export function playMoveSound(
  enabled: boolean = true,
  isCapture: boolean = false,
  isCheck: boolean = false,
  volume: number = 0.5
): void {
  if (!enabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    if (isCheck) {
      // High-register alert tone for check
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(659.25, ctx.currentTime); // E5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.08); // A5
      gain.gain.setValueAtTime(volume * 0.35, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
      return;
    }

    if (isCapture) {
      // Firmer, slightly lower resonant wooden strike for capture
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(420, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.06);
      gain.gain.setValueAtTime(volume * 0.5, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.065);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.07);
      return;
    }

    // Standard piece movement click
    playChessClick(enabled, volume);
  } catch {
    // Fail silently
  }
}

/**
 * Plays a quiet, resonant golden bell chime for academy achievements or mode launches.
 */
export function playChime(enabled: boolean = true, volume: number = 0.5): void {
  if (!enabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5

    gain.gain.setValueAtTime(volume * 0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  } catch {
    // Fail silently if browser audio policies restrict playback
  }
}

/**
 * Plays game result audio tone (triumphant chime on victory, somber descent on defeat).
 */
export function playGameResultSound(
  enabled: boolean = true,
  isWin: boolean = false,
  isDraw: boolean = false,
  volume: number = 0.5
): void {
  if (!enabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    if (isWin) {
      playChime(enabled, volume);
      setTimeout(() => playChime(enabled, volume * 1.1), 160);
      return;
    }

    if (isDraw) {
      playChime(enabled, volume * 0.7);
      return;
    }

    // Defeat: gentle, somber low-frequency decay
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(260, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(130, ctx.currentTime + 0.3);
    gain.gain.setValueAtTime(volume * 0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch {
    // Fail silently
  }
}
