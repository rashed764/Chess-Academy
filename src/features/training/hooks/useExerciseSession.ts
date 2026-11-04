import { useState, useCallback, useMemo, useEffect } from 'react';
import type { Square } from 'chess.js';
import { Chess } from 'chess.js';
import { ExerciseValidator } from '../models/exerciseValidator';
import type { ChessExercise } from '../types';
import { playChessClick, playChime } from '../../../utils/sound';

export interface ExerciseSessionState {
  currentFen: string;
  currentStepIndex: number;
  status: 'ready' | 'correct' | 'incorrect' | 'completed';
  feedbackMessage: string;
  selectedSquare: Square | null;
  legalMovesForSelected: string[];
  lastMove: { from: string; to: string } | null;
  showHint: boolean;
  pendingPromotion: { from: string; to: string } | null;
  attemptsCount: number;
}

export function useExerciseSession(
  exercise: ChessExercise,
  soundEnabled: boolean = true,
  onExerciseComplete?: () => void
) {
  const [fen, setFen] = useState<string>(exercise.initialFen);
  const [stepIndex, setStepIndex] = useState<number>(0);
  const [status, setStatus] = useState<'ready' | 'correct' | 'incorrect' | 'completed'>('ready');
  const [feedback, setFeedback] = useState<string>('');
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [pendingPromotion, setPendingPromotion] = useState<{ from: string; to: string } | null>(null);
  const [attemptsCount, setAttemptsCount] = useState<number>(0);

  // Reset state when exercise changes
  useEffect(() => {
    setFen(exercise.initialFen);
    setStepIndex(0);
    setStatus('ready');
    setFeedback('');
    setSelectedSquare(null);
    setLastMove(null);
    setShowHint(false);
    setPendingPromotion(null);
    setAttemptsCount(0);
  }, [exercise.id, exercise.initialFen]);

  const legalMovesForSelected = useMemo(() => {
    if (!selectedSquare) return [];
    return ExerciseValidator.getLegalMovesForSquare(fen, selectedSquare);
  }, [fen, selectedSquare]);

  const isCheck = useMemo(() => {
    try {
      const c = new Chess(fen);
      return c.inCheck();
    } catch {
      return false;
    }
  }, [fen]);

  const isPlayerTurn = useMemo(() => {
    try {
      const c = new Chess(fen);
      return c.turn() === exercise.playerSide && status !== 'completed';
    } catch {
      return false;
    }
  }, [fen, exercise.playerSide, status]);

  // Execute a verified move
  const commitMove = useCallback(
    (from: string, to: string, promotionPiece?: 'q' | 'r' | 'b' | 'n'): boolean => {
      // Check if this move requires pawn promotion modal
      try {
        const c = new Chess(fen);
        const piece = c.get(from as Square);
        if (
          piece &&
          piece.type === 'p' &&
          piece.color === exercise.playerSide &&
          !promotionPiece
        ) {
          const targetRank = to[1];
          if ((exercise.playerSide === 'w' && targetRank === '8') || (exercise.playerSide === 'b' && targetRank === '1')) {
            setPendingPromotion({ from, to });
            return false;
          }
        }
      } catch {
        // Fall through
      }

      setAttemptsCount((prev) => prev + 1);

      const result = ExerciseValidator.evaluateUserMove(
        exercise,
        fen,
        stepIndex,
        from,
        to,
        promotionPiece
      );

      setSelectedSquare(null);

      if (!result.isValidMove) {
        setStatus('incorrect');
        setFeedback(result.feedbackMessage);
        playChessClick(soundEnabled, 0.5);
        return false;
      }

      if (!result.isCorrectMove) {
        setStatus('incorrect');
        setFeedback(result.feedbackMessage);
        playChessClick(soundEnabled, 0.4);
        return false;
      }

      // Valid and correct!
      setLastMove({ from, to });
      setFen(result.nextFen);
      setStepIndex(result.currentStepIndex);

      if (result.isExerciseComplete) {
        setStatus('completed');
        setFeedback(result.feedbackMessage);
        playChime(soundEnabled, 0.7);
        onExerciseComplete?.();
      } else {
        setStatus('correct');
        setFeedback(result.feedbackMessage);
        playChessClick(soundEnabled, 0.7);
      }

      return true;
    },
    [fen, stepIndex, exercise, soundEnabled, onExerciseComplete]
  );

  // Handle square click for click-to-move
  const handleSquareClick = useCallback(
    (square: Square) => {
      if (status === 'completed') return;

      if (!selectedSquare) {
        // First click: select piece if friendly
        try {
          const c = new Chess(fen);
          const piece = c.get(square);
          if (piece && piece.color === exercise.playerSide) {
            setSelectedSquare(square);
            playChessClick(soundEnabled, 0.3);
          }
        } catch {
          // ignore
        }
      } else {
        // Second click: if clicking same square, deselect
        if (selectedSquare === square) {
          setSelectedSquare(null);
          return;
        }

        // If clicking another friendly piece, switch selection
        try {
          const c = new Chess(fen);
          const piece = c.get(square);
          if (piece && piece.color === exercise.playerSide) {
            setSelectedSquare(square);
            playChessClick(soundEnabled, 0.3);
            return;
          }
        } catch {
          // ignore
        }

        // Try moving from selectedSquare to clicked square
        commitMove(selectedSquare, square);
      }
    },
    [selectedSquare, fen, exercise.playerSide, status, soundEnabled, commitMove]
  );

  const resetExercise = useCallback(() => {
    setFen(exercise.initialFen);
    setStepIndex(0);
    setStatus('ready');
    setFeedback('');
    setSelectedSquare(null);
    setLastMove(null);
    setShowHint(false);
    setPendingPromotion(null);
    playChessClick(soundEnabled, 0.4);
  }, [exercise.initialFen, soundEnabled]);

  const toggleHint = useCallback(() => {
    setShowHint((prev) => !prev);
    playChessClick(soundEnabled, 0.3);
  }, [soundEnabled]);

  return {
    fen,
    stepIndex,
    status,
    feedback,
    selectedSquare,
    legalMovesForSelected,
    lastMove,
    isCheck,
    isPlayerTurn,
    showHint,
    pendingPromotion,
    attemptsCount,
    setPendingPromotion,
    commitMove,
    handleSquareClick,
    resetExercise,
    toggleHint,
  };
}
