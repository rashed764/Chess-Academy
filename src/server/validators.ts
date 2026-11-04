import { Chess } from 'chess.js';

export interface ValidationResult<T> {
  valid: boolean;
  data?: T;
  error?: string;
}

/**
 * Validates whether a given string is a valid standard chess FEN.
 */
export function validateFen(fen: unknown): ValidationResult<string> {
  if (typeof fen !== 'string' || fen.trim().length === 0) {
    return { valid: false, error: 'FEN must be a non-empty string' };
  }
  const cleanFen = fen.trim();
  try {
    const c = new Chess();
    c.load(cleanFen);
    return { valid: true, data: cleanFen };
  } catch (err) {
    return { valid: false, error: `Invalid FEN position: ${err instanceof Error ? err.message : String(err)}` };
  }
}

/**
 * Validates Hint Stage (1, 2, or 3).
 */
export function validateHintStage(stage: unknown): ValidationResult<1 | 2 | 3> {
  const num = Number(stage);
  if (num === 1 || num === 2 || num === 3) {
    return { valid: true, data: num as 1 | 2 | 3 };
  }
  return { valid: false, error: 'Hint stage must be 1 (Direction), 2 (Tactical Motif), or 3 (Concrete Idea)' };
}

/**
 * Validates text string with maximum length.
 */
export function validateText(text: unknown, fieldName: string, maxLen: number = 2000): ValidationResult<string> {
  if (typeof text !== 'string') {
    return { valid: false, error: `${fieldName} must be a string` };
  }
  if (text.length > maxLen) {
    return { valid: false, error: `${fieldName} exceeds maximum length of ${maxLen} characters` };
  }
  return { valid: true, data: text.trim() };
}

/**
 * Validates SAN or UCI move against a position.
 */
export function validateMoveInPosition(fen: string, move: unknown): ValidationResult<{ san: string; uci: string }> {
  if (typeof move !== 'string' || move.trim().length === 0) {
    return { valid: false, error: 'Move must be a non-empty string' };
  }
  const cleanMove = move.trim();
  try {
    const c = new Chess(fen);
    // Try as SAN
    try {
      const res = c.move(cleanMove);
      if (res) {
        return { valid: true, data: { san: res.san, uci: `${res.from}${res.to}${res.promotion || ''}` } };
      }
    } catch {
      // Try as UCI
    }

    // Match verbose legal moves
    const legalMoves = c.moves({ verbose: true });
    const uciMatch = legalMoves.find(
      (m) => `${m.from}${m.to}${m.promotion || ''}`.toLowerCase() === cleanMove.toLowerCase()
    );
    if (uciMatch) {
      return { valid: true, data: { san: uciMatch.san, uci: `${uciMatch.from}${uciMatch.to}${uciMatch.promotion || ''}` } };
    }

    return { valid: false, error: `Move "${cleanMove}" is not legal in position "${fen}"` };
  } catch (err) {
    return { valid: false, error: `Failed to validate move: ${err instanceof Error ? err.message : String(err)}` };
  }
}
