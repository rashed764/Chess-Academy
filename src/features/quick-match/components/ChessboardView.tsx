/**
 * Interactive luxury chessboard view wrapping react-chessboard.
 * Supports drag-and-drop and click-to-move, orientation by player color,
 * move hints, last move highlights, check luminescence, and disabled state during engine thought.
 */

import React, { useMemo } from 'react';
import { Chessboard } from 'react-chessboard';
import type { Square } from 'chess.js';

interface ChessboardViewProps {
  fen: string;
  playerSide: 'w' | 'b';
  isPlayerTurn: boolean;
  isEngineThinking: boolean;
  isCheck: boolean;
  selectedSquare: Square | null;
  legalMovesForSelected: string[];
  lastMove: { from: string; to: string } | null;
  onPieceDrop: (from: string, to: string) => boolean;
  onSquareClick: (square: Square) => void;
}

export const ChessboardView: React.FC<ChessboardViewProps> = ({
  fen,
  playerSide,
  isPlayerTurn,
  isEngineThinking,
  isCheck,
  selectedSquare,
  legalMovesForSelected,
  lastMove,
  onPieceDrop,
  onSquareClick,
}) => {
  // Find King square if currently in check
  const checkKingSquare = useMemo(() => {
    if (!isCheck) return null;
    // Derive king position from FEN
    // Format: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
    const parts = fen.split(' ');
    const boardStr = parts[0];
    const turn = parts[1]; // 'w' or 'b'
    const targetKingChar = turn === 'w' ? 'K' : 'k';

    const rows = boardStr.split('/');
    for (let r = 0; r < 8; r++) {
      let col = 0;
      for (const char of rows[r]) {
        if (char >= '1' && char <= '8') {
          col += parseInt(char, 10);
        } else {
          if (char === targetKingChar) {
            const file = String.fromCharCode('a'.charCodeAt(0) + col);
            const rank = (8 - r).toString();
            return `${file}${rank}` as Square;
          }
          col++;
        }
      }
    }
    return null;
  }, [fen, isCheck]);

  // Dynamic square highlights: selected, legal moves, last move, check
  const customSquareStyles = useMemo(() => {
    const styles: Record<string, React.CSSProperties> = {};

    // 1. Last Move Highlights (soft amber/gold)
    if (lastMove) {
      styles[lastMove.from] = {
        backgroundColor: 'rgba(214, 179, 106, 0.22)',
      };
      styles[lastMove.to] = {
        backgroundColor: 'rgba(214, 179, 106, 0.32)',
      };
    }

    // 2. Selected Square (gold border and tint)
    if (selectedSquare) {
      styles[selectedSquare] = {
        backgroundColor: 'rgba(214, 179, 106, 0.45)',
        boxShadow: 'inset 0 0 0 2px #D6B36A',
      };
    }

    // 3. Legal move target indicators
    for (const sq of legalMovesForSelected) {
      // Check if target square has a piece by inspecting fen or using radial gradient
      styles[sq] = {
        background:
          'radial-gradient(circle, rgba(214, 179, 106, 0.65) 24%, transparent 26%)',
        cursor: 'pointer',
      };
    }

    // 4. In Check - King square crimson glow
    if (checkKingSquare) {
      styles[checkKingSquare] = {
        backgroundColor: 'rgba(239, 68, 68, 0.65)',
        boxShadow: 'inset 0 0 0 3px #EF4444',
      };
    }

    return styles;
  }, [lastMove, selectedSquare, legalMovesForSelected, checkKingSquare]);

  const canDrag = isPlayerTurn && !isEngineThinking;

  return (
    <div className="relative w-full max-w-[580px] aspect-square mx-auto p-1.5 sm:p-2 rounded-2xl bg-[#171A24] border border-[#242938] shadow-2xl shadow-black/80">
      <Chessboard
        options={{
          position: fen,
          boardOrientation: playerSide === 'w' ? 'white' : 'black',
          allowDragging: canDrag,
          canDragPiece: ({ piece }) => {
            if (!canDrag) return false;
            // pieceType starts with 'w' or 'b'
            return piece.pieceType.startsWith(playerSide);
          },
          onPieceDrop: ({ sourceSquare, targetSquare }) => {
            if (!targetSquare) return false;
            return onPieceDrop(sourceSquare, targetSquare);
          },
          onSquareClick: ({ square }) => {
            onSquareClick(square as Square);
          },
          darkSquareStyle: { backgroundColor: '#1E2332' },
          lightSquareStyle: { backgroundColor: '#384257' },
          squareStyles: customSquareStyles,
          showNotation: true,
          animationDurationInMs: 200,
          boardStyle: {
            borderRadius: '12px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.7)',
          },
        }}
      />

      {/* Engine Thinking Overlay Banner */}
      {isEngineThinking && (
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/75 backdrop-blur-xs border border-[#D6B36A]/50 text-xs font-mono text-[#D6B36A] shadow-lg animate-pulse">
          <span className="w-2 h-2 rounded-full bg-[#D6B36A] animate-ping" />
          <span>Stockfish calculating...</span>
        </div>
      )}
    </div>
  );
};
