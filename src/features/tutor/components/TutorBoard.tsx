/**
 * Interactive Tutor Chessboard component.
 * Supports drag-and-drop, click-to-move, orientation toggle, custom tutor highlights,
 * custom arrows, check luminescence, move history, and active objective banners.
 */

import React, { useMemo } from 'react';
import { Chessboard } from 'react-chessboard';
import type { Square } from 'chess.js';
import { RotateCcw, RefreshCw, Eye, Sparkles, Target, AlertCircle } from 'lucide-react';
import type { TutorBoardState } from '../types';

interface TutorBoardProps {
  boardState: TutorBoardState;
  onPieceDrop: (from: string, to: string) => boolean;
  onSquareClick: (square: Square) => void;
  onFlipBoard: () => void;
  onResetBoard: () => void;
}

export const TutorBoard: React.FC<TutorBoardProps> = ({
  boardState,
  onPieceDrop,
  onSquareClick,
  onFlipBoard,
  onResetBoard,
}) => {
  const {
    fen,
    mode,
    boardOrientation,
    selectedSquare,
    legalMovesForSelected,
    lastMove,
    isCheck,
    customHighlights,
    customArrows,
    moveHistory,
    activeExercise,
    activeLesson,
  } = boardState;

  // Extract king square in check
  const checkKingSquare = useMemo(() => {
    if (!isCheck) return null;
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

  // Combine square styling
  const customSquareStyles = useMemo(() => {
    const styles: Record<string, React.CSSProperties> = {};

    // 1. Last Move
    if (lastMove) {
      styles[lastMove.from] = {
        backgroundColor: 'rgba(214, 179, 106, 0.22)',
      };
      styles[lastMove.to] = {
        backgroundColor: 'rgba(214, 179, 106, 0.32)',
      };
    }

    // 2. Custom Tutor Highlights (from AI actions)
    for (const [sq, style] of Object.entries(customHighlights)) {
      styles[sq] = {
        backgroundColor: style.backgroundColor,
        boxShadow: style.boxShadow,
      };
    }

    // 3. Selected Square
    if (selectedSquare) {
      styles[selectedSquare] = {
        backgroundColor: 'rgba(214, 179, 106, 0.45)',
        boxShadow: 'inset 0 0 0 2px #D6B36A',
      };
    }

    // 4. Legal Move Target Dots
    for (const sq of legalMovesForSelected) {
      styles[sq] = {
        background:
          'radial-gradient(circle, rgba(214, 179, 106, 0.65) 24%, transparent 26%)',
        cursor: 'pointer',
      };
    }

    // 5. Check Glow
    if (checkKingSquare) {
      styles[checkKingSquare] = {
        backgroundColor: 'rgba(239, 68, 68, 0.65)',
        boxShadow: 'inset 0 0 0 3px #EF4444',
      };
    }

    return styles;
  }, [lastMove, customHighlights, selectedSquare, legalMovesForSelected, checkKingSquare]);

  const canDrag = mode !== 'demonstration';

  // Format custom arrows for react-chessboard
  const formattedArrows = useMemo(() => {
    return customArrows.map(([startSquare, endSquare, color]) => ({
      startSquare,
      endSquare,
      color: color || 'rgb(214, 179, 106)',
    }));
  }, [customArrows]);

  const sideToMove = fen.split(' ')[1] === 'b' ? 'Black' : 'White';

  return (
    <div className="flex flex-col gap-3 w-full max-w-[560px] mx-auto">
      {/* Board Header Bar */}
      <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#171A24] border border-[#242938]">
        <div className="flex items-center gap-2">
          {mode === 'demonstration' && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Eye className="w-3.5 h-3.5" />
              AI Demonstrating
            </span>
          )}
          {mode === 'practice' && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Target className="w-3.5 h-3.5" />
              Your Turn to Move
            </span>
          )}
          {mode === 'assessment' && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Sparkles className="w-3.5 h-3.5" />
              Skill Assessment
            </span>
          )}
          {mode === 'free_play' && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-zinc-800 text-zinc-300 border border-zinc-700">
              Interactive Board
            </span>
          )}
          <span className="text-xs text-zinc-400 hidden sm:inline">
            Turn: <span className="font-semibold text-zinc-200">{sideToMove}</span>
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={onFlipBoard}
            title="Flip Board Orientation"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-amber-400 hover:bg-zinc-800 transition"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={onResetBoard}
            title="Reset Board to Starting Position"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-amber-400 hover:bg-zinc-800 transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Chessboard Container */}
      <div className="relative w-full aspect-square p-2 rounded-2xl bg-[#171A24] border border-[#242938] shadow-2xl shadow-black/80">
        <Chessboard
          options={{
            position: fen,
            boardOrientation,
            allowDragging: canDrag,
            canDragPiece: ({ piece }) => {
              if (!canDrag) return false;
              // Allow student to drag legal piece for sideToMove
              return piece.pieceType.startsWith(sideToMove === 'White' ? 'w' : 'b');
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
            arrows: formattedArrows,
            showNotation: true,
            animationDurationInMs: 200,
            boardStyle: {
              borderRadius: '12px',
              boxShadow: '0 8px 25px -4px rgba(0, 0, 0, 0.7)',
            },
          }}
        />

        {/* Lock overlay during AI demonstration */}
        {mode === 'demonstration' && (
          <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2 pointer-events-none">
            <Sparkles className="w-3.5 h-3.5 animate-pulse text-amber-400" />
            Grandmaster in control
          </div>
        )}
      </div>

      {/* Active Objective / Lesson Banner */}
      {activeExercise && (
        <div className="p-3 rounded-xl bg-gradient-to-r from-amber-500/10 to-transparent border border-amber-500/20 text-xs">
          <div className="flex items-center gap-2 text-amber-400 font-medium mb-1">
            <Target className="w-4 h-4" />
            <span>Active Exercise: {activeLesson?.title || 'Interactive Challenge'}</span>
          </div>
          <p className="text-zinc-300">{activeExercise.objective}</p>
        </div>
      )}

      {/* Move History Strip */}
      {moveHistory.length > 0 && (
        <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#10121B] border border-[#1D2230] overflow-x-auto text-xs font-mono">
          <span className="text-zinc-500 shrink-0 font-sans">Moves:</span>
          {moveHistory.map((m, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700/60 shrink-0"
            >
              {idx % 2 === 0 ? `${Math.floor(idx / 2) + 1}. ` : ''}
              {m.san}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
