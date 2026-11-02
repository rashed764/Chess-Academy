/**
 * Pure, high-precision timestamp-based chess clock model.
 * Eliminates timer drift and handles tab suspension cleanly.
 */

export interface ChessClockState {
  whiteRemainingMs: number;
  blackRemainingMs: number;
  initialMs: number;
  incrementMs: number;
  activeSide: 'w' | 'b' | null;
  lastTimestamp: number | null;
  isExpired: boolean;
  expiredSide: 'w' | 'b' | null;
}

export function createChessClock(initialMinutes: number, incrementSeconds: number): ChessClockState {
  const safeMinutes = Math.max(0.5, initialMinutes);
  const safeIncSeconds = Math.max(0, incrementSeconds);
  const initialMs = Math.round(safeMinutes * 60 * 1000);
  const incrementMs = Math.round(safeIncSeconds * 1000);

  return {
    whiteRemainingMs: initialMs,
    blackRemainingMs: initialMs,
    initialMs,
    incrementMs,
    activeSide: null,
    lastTimestamp: null,
    isExpired: false,
    expiredSide: null,
  };
}

export function startChessClock(
  state: ChessClockState,
  side: 'w' | 'b',
  now: number = Date.now()
): ChessClockState {
  if (state.isExpired) return state;

  return {
    ...state,
    activeSide: side,
    lastTimestamp: now,
  };
}

export function tickChessClock(state: ChessClockState, now: number = Date.now()): ChessClockState {
  if (!state.activeSide || !state.lastTimestamp || state.isExpired) {
    return state;
  }

  const elapsed = Math.max(0, now - state.lastTimestamp);

  if (state.activeSide === 'w') {
    const remaining = state.whiteRemainingMs - elapsed;
    if (remaining <= 0) {
      return {
        ...state,
        whiteRemainingMs: 0,
        activeSide: null,
        isExpired: true,
        expiredSide: 'w',
      };
    }
  } else {
    const remaining = state.blackRemainingMs - elapsed;
    if (remaining <= 0) {
      return {
        ...state,
        blackRemainingMs: 0,
        activeSide: null,
        isExpired: true,
        expiredSide: 'b',
      };
    }
  }

  return state;
}

export function commitChessMove(
  state: ChessClockState,
  moverSide: 'w' | 'b',
  nextSide: 'w' | 'b' | null,
  now: number = Date.now()
): ChessClockState {
  if (state.isExpired) return state;

  const elapsed = state.lastTimestamp ? Math.max(0, now - state.lastTimestamp) : 0;

  let newWhite = state.whiteRemainingMs;
  let newBlack = state.blackRemainingMs;

  if (moverSide === 'w') {
    newWhite = Math.max(0, newWhite - elapsed) + state.incrementMs;
    if (newWhite <= 0 && state.lastTimestamp) {
      return {
        ...state,
        whiteRemainingMs: 0,
        activeSide: null,
        isExpired: true,
        expiredSide: 'w',
      };
    }
  } else {
    newBlack = Math.max(0, newBlack - elapsed) + state.incrementMs;
    if (newBlack <= 0 && state.lastTimestamp) {
      return {
        ...state,
        blackRemainingMs: 0,
        activeSide: null,
        isExpired: true,
        expiredSide: 'b',
      };
    }
  }

  return {
    ...state,
    whiteRemainingMs: newWhite,
    blackRemainingMs: newBlack,
    activeSide: nextSide,
    lastTimestamp: nextSide ? now : null,
  };
}

export function stopChessClock(state: ChessClockState, now: number = Date.now()): ChessClockState {
  if (!state.activeSide || !state.lastTimestamp) {
    return {
      ...state,
      activeSide: null,
      lastTimestamp: null,
    };
  }

  const elapsed = Math.max(0, now - state.lastTimestamp);

  const whiteMs = state.activeSide === 'w' ? Math.max(0, state.whiteRemainingMs - elapsed) : state.whiteRemainingMs;
  const blackMs = state.activeSide === 'b' ? Math.max(0, state.blackRemainingMs - elapsed) : state.blackRemainingMs;

  return {
    ...state,
    whiteRemainingMs: whiteMs,
    blackRemainingMs: blackMs,
    activeSide: null,
    lastTimestamp: null,
  };
}

export function getDisplayTimeMs(state: ChessClockState, side: 'w' | 'b', now: number = Date.now()): number {
  if (side === 'w') {
    if (state.activeSide === 'w' && state.lastTimestamp && !state.isExpired) {
      const elapsed = Math.max(0, now - state.lastTimestamp);
      return Math.max(0, state.whiteRemainingMs - elapsed);
    }
    return state.whiteRemainingMs;
  } else {
    if (state.activeSide === 'b' && state.lastTimestamp && !state.isExpired) {
      const elapsed = Math.max(0, now - state.lastTimestamp);
      return Math.max(0, state.blackRemainingMs - elapsed);
    }
    return state.blackRemainingMs;
  }
}

export function formatClockDisplay(ms: number): string {
  if (ms <= 0) return '00:00.0';

  if (ms >= 60000) {
    const mins = Math.floor(ms / 60000);
    const secs = Math.floor((ms % 60000) / 1000);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  if (ms >= 10000) {
    const secs = Math.floor(ms / 1000);
    return `00:${secs.toString().padStart(2, '0')}`;
  }

  // Under 10 seconds: show tenths of a second (FIDE standard)
  const secs = Math.floor(ms / 1000);
  const tenths = Math.floor((ms % 1000) / 100);
  return `00:0${secs}.${tenths}`;
}
