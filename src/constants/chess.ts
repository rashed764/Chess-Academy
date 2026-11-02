/**
 * Chess game constants and default presets.
 */

import type { TimeControl } from '../types/chess';

export const STANDARD_TIME_CONTROLS: Record<string, TimeControl> = {
  BULLET_1_0: { initialSeconds: 60, incrementSeconds: 0, name: 'bullet' },
  BLITZ_3_0: { initialSeconds: 180, incrementSeconds: 0, name: 'blitz' },
  BLITZ_3_2: { initialSeconds: 180, incrementSeconds: 2, name: 'blitz' },
  BLITZ_5_3: { initialSeconds: 300, incrementSeconds: 3, name: 'blitz' },
  RAPID_10_0: { initialSeconds: 600, incrementSeconds: 0, name: 'rapid' },
  RAPID_15_10: { initialSeconds: 900, incrementSeconds: 10, name: 'rapid' },
  CLASSICAL_30_0: { initialSeconds: 1800, incrementSeconds: 0, name: 'classical' },
};

export const INITIAL_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

export const PIECE_VALUES: Record<string, number> = {
  p: 1,
  n: 3,
  b: 3,
  r: 5,
  q: 9,
  k: 0,
};

export const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] as const;
export const RANKS = ['1', '2', '3', '4', '5', '6', '7', '8'] as const;
