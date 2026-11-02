/**
 * Chess FEN string utilities and validation helpers.
 */

export const STARTING_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

export interface ParsedFen {
  piecePlacement: string;
  activeColor: 'w' | 'b';
  castlingAvailability: string;
  enPassantTarget: string;
  halfmoveClock: number;
  fullmoveNumber: number;
}

/**
 * Validates basic structural FEN rules (6 fields separated by spaces).
 */
export function validateFenStructure(fen: string): { isValid: boolean; error?: string } {
  if (!fen || typeof fen !== 'string') {
    return { isValid: false, error: 'FEN must be a non-empty string.' };
  }

  const parts = fen.trim().split(/\s+/);
  if (parts.length !== 6) {
    return {
      isValid: false,
      error: `Invalid FEN: expected 6 space-separated fields, got ${parts.length}.`,
    };
  }

  const [ranks, activeColor, castling, enPassant, halfmove, fullmove] = parts;

  // Verify 8 ranks
  const rankList = ranks.split('/');
  if (rankList.length !== 8) {
    return {
      isValid: false,
      error: `Invalid piece placement: expected 8 ranks, got ${rankList.length}.`,
    };
  }

  // Verify active color
  if (activeColor !== 'w' && activeColor !== 'b') {
    return {
      isValid: false,
      error: `Invalid active color '${activeColor}': expected 'w' or 'b'.`,
    };
  }

  // Verify castling
  if (!/^([KQkq]+|-)$/.test(castling)) {
    return {
      isValid: false,
      error: `Invalid castling string '${castling}'.`,
    };
  }

  // Verify en passant
  if (!/^([a-h][36]|-)$/.test(enPassant)) {
    return {
      isValid: false,
      error: `Invalid en passant square '${enPassant}'.`,
    };
  }

  // Verify move clocks
  const halfmoveInt = parseInt(halfmove, 10);
  const fullmoveInt = parseInt(fullmove, 10);
  if (Number.isNaN(halfmoveInt) || halfmoveInt < 0) {
    return { isValid: false, error: 'Halfmove clock must be a non-negative integer.' };
  }
  if (Number.isNaN(fullmoveInt) || fullmoveInt < 1) {
    return { isValid: false, error: 'Fullmove number must be a positive integer.' };
  }

  return { isValid: true };
}

/**
 * Parses a valid FEN into its constituent components.
 */
export function parseFen(fen: string): ParsedFen | null {
  const validation = validateFenStructure(fen);
  if (!validation.isValid) return null;

  const parts = fen.trim().split(/\s+/);
  return {
    piecePlacement: parts[0],
    activeColor: parts[1] as 'w' | 'b',
    castlingAvailability: parts[2],
    enPassantTarget: parts[3],
    halfmoveClock: parseInt(parts[4], 10),
    fullmoveNumber: parseInt(parts[5], 10),
  };
}
