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

/**
 * Validates position consistency: verifies that playing move in fenBefore produces fenAfter.
 */
export function validatePositionConsistency(
  fenBefore: string,
  move: string,
  fenAfter: string
): ValidationResult<boolean> {
  try {
    const c = new Chess(fenBefore);
    // Play move (supporting both SAN and UCI)
    let moveRes = null;
    try {
      moveRes = c.move(move);
    } catch {
      // Try UCI
      const legalMoves = c.moves({ verbose: true });
      const uciMatch = legalMoves.find(
        (m) => `${m.from}${m.to}${m.promotion || ''}`.toLowerCase() === move.toLowerCase()
      );
      if (uciMatch) {
        moveRes = c.move(uciMatch.san);
      }
    }

    if (!moveRes) {
      return { valid: false, error: `Move "${move}" could not be executed on position "${fenBefore}"` };
    }

    const resultingFen = c.fen();
    // Compare piece placement, side to move, and castling rights (fields 0, 1, 2)
    const resultingParts = resultingFen.split(' ');
    const afterParts = fenAfter.trim().split(' ');

    if (
      resultingParts[0] !== afterParts[0] ||
      resultingParts[1] !== afterParts[1] ||
      resultingParts[2] !== afterParts[2]
    ) {
      return {
        valid: false,
        error: `Position inconsistency: fenAfter ("${afterParts.slice(0, 3).join(' ')}") does not match resulting position ("${resultingParts.slice(0, 3).join(' ')}") after playing "${move}"`,
      };
    }

    return { valid: true, data: true };
  } catch (err) {
    return { valid: false, error: `Position consistency check failed: ${err instanceof Error ? err.message : String(err)}` };
  }
}

export interface PVValidationResult {
  valid: boolean;
  verified: boolean;
  legalMovesSan?: string[];
  rejectedAt?: string;
  error?: string;
}

/**
 * Validates a Principal Variation (PV) by replaying each move on an independent chess.js instance.
 * Returns verified: true only if EVERY move in the PV is legally playable.
 */
export function validatePrincipalVariation(fen: string, pv: unknown): PVValidationResult {
  if (!Array.isArray(pv) || pv.length === 0) {
    return { valid: true, verified: false, error: 'Empty or omitted principal variation' };
  }

  try {
    const c = new Chess(fen);
    const legalSanSequence: string[] = [];

    for (let i = 0; i < pv.length; i++) {
      const moveStr = String(pv[i]).trim();
      let played = null;

      // Try SAN directly
      try {
        played = c.move(moveStr);
      } catch {
        // Try UCI coordinate match
        const legal = c.moves({ verbose: true });
        const match = legal.find(
          (m) => `${m.from}${m.to}${m.promotion || ''}`.toLowerCase() === moveStr.toLowerCase()
        );
        if (match) {
          played = c.move(match.san);
        }
      }

      if (!played) {
        return {
          valid: false,
          verified: false,
          legalMovesSan: legalSanSequence,
          rejectedAt: moveStr,
          error: `Illegal or impossible move "${moveStr}" at ply ${i + 1} in principal variation`,
        };
      }

      legalSanSequence.push(played.san);
    }

    return {
      valid: true,
      verified: true,
      legalMovesSan: legalSanSequence,
    };
  } catch (err) {
    return {
      valid: false,
      verified: false,
      error: `PV replay failed: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}

/**
 * Replays and validates a supplied sequence of moves against a starting FEN.
 */
export function validateMoveHistory(startFen: string, moves: unknown): ValidationResult<string[]> {
  if (!Array.isArray(moves)) {
    return { valid: true, data: [] };
  }

  try {
    const c = new Chess(startFen);
    const validatedSan: string[] = [];

    for (let i = 0; i < moves.length; i++) {
      const m = String(moves[i]).trim();
      if (!m) continue;
      try {
        const res = c.move(m);
        if (res) {
          validatedSan.push(res.san);
        }
      } catch {
        return {
          valid: false,
          error: `Invalid move in history sequence: "${m}" at ply ${i + 1}`,
        };
      }
    }

    return { valid: true, data: validatedSan };
  } catch (err) {
    return { valid: false, error: `Move history validation error: ${err instanceof Error ? err.message : String(err)}` };
  }
}

