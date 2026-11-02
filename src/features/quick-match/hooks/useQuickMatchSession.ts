/**
 * Primary game session hook orchestrating chess.js game state,
 * the dedicated Stockfish WASM engine adapter, the chess clock, and end-of-game result logic.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { Chess, type Square } from 'chess.js';
import { getChessEngine } from '../../../services/chess/adapter';
import { useAppStore } from '../../../stores/useAppStore';
import { playMoveSound, playGameResultSound } from '../../../utils/sound';
import { calculateEngineSearchBudget, DIFFICULTY_PRESETS } from '../models/difficulty';
import { QUICK_MATCH_TIME_CONTROLS } from '../models/timeControls';
import type {
  CompletedMatchSummary,
  DifficultyConfig,
  DifficultyLevel,
  GameTerminationReason,
  MatchStatus,
  MoveRecordItem,
  PlayerColorChoice,
  QuickMatchTimeControl,
  TimeControlPresetId,
} from '../types';
import { useChessClock } from './useChessClock';

export function useQuickMatchSession() {
  const { currentProfile } = useAppStore();
  const soundEnabled = currentProfile.settings.soundEnabled;

  // Match Configuration State
  const [matchStatus, setMatchStatus] = useState<MatchStatus>('setup');
  const [selectedDifficultyLevel, setSelectedDifficultyLevel] = useState<DifficultyLevel>('intermediate');
  const [selectedTimeControlId, setSelectedTimeControlId] = useState<TimeControlPresetId>('RAPID_10_0');
  const [customMinutes, setCustomMinutes] = useState<number>(10);
  const [customIncrement, setCustomIncrement] = useState<number>(0);
  const [colorChoice, setColorChoice] = useState<PlayerColorChoice>('white');

  // Resolved in-game configuration
  const [playerSide, setPlayerSide] = useState<'w' | 'b'>('w');
  const [activeDifficulty, setActiveDifficulty] = useState<DifficultyConfig>(DIFFICULTY_PRESETS.intermediate);
  const [activeTimeControl, setActiveTimeControl] = useState<QuickMatchTimeControl>(
    QUICK_MATCH_TIME_CONTROLS.RAPID_10_0
  );

  // Authoritative Chess Game State (chess.js)
  const chessRef = useRef(new Chess());
  const [fen, setFen] = useState(chessRef.current.fen());
  const [moveHistory, setMoveHistory] = useState<MoveRecordItem[]>([]);
  const [isCheck, setIsCheck] = useState(false);
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);

  // UI Selection & Promotion State
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [legalMovesForSelected, setLegalMovesForSelected] = useState<string[]>([]);
  const [pendingPromotion, setPendingPromotion] = useState<{
    from: string;
    to: string;
  } | null>(null);

  // Engine Opponent State
  const [isEngineThinking, setIsEngineThinking] = useState(false);
  const [engineError, setEngineError] = useState<string | null>(null);
  const activeSearchIdRef = useRef(0);
  const startTimeRef = useRef<number | null>(null);

  // Completed Match Result
  const [matchResult, setMatchResult] = useState<CompletedMatchSummary | null>(null);

  // References for stable callback dependencies
  const moveHistoryRef = useRef(moveHistory);
  moveHistoryRef.current = moveHistory;

  // Timeout Handler
  const handleTimeout = useCallback(
    (expiredSide: 'w' | 'b') => {
      const chess = chessRef.current;
      const winner: 'white' | 'black' = expiredSide === 'w' ? 'black' : 'white';
      const playerWon = winner === (playerSide === 'w' ? 'white' : 'black');

      const durationSeconds = startTimeRef.current
        ? Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000))
        : 0;

      const summary: CompletedMatchSummary = {
        id: `match-${Date.now()}`,
        date: new Date().toISOString(),
        result: winner === 'white' ? '1-0' : '0-1',
        winner,
        playerSide,
        playerWon,
        playerLost: !playerWon,
        isDraw: false,
        terminationReason: 'timeout',
        terminationDescription: `${expiredSide === 'w' ? 'White' : 'Black'} ran out of time.`,
        timeControl: activeTimeControl,
        difficulty: activeDifficulty,
        totalMoves: Math.ceil(chess.history().length / 2),
        totalDurationSeconds: durationSeconds,
        finalFen: chess.fen(),
        pgn: chess.pgn(),
        history: moveHistoryRef.current,
      };

      setMatchResult(summary);
      setMatchStatus('ended');
      playGameResultSound(soundEnabled, playerWon, false);
    },
    [playerSide, activeTimeControl, activeDifficulty, soundEnabled]
  );

  // Chess Clock Hook
  const clock = useChessClock({
    initialMinutes: activeTimeControl.initialMinutes,
    incrementSeconds: activeTimeControl.incrementSeconds,
    onTimeout: handleTimeout,
  });

  const clockRef = useRef(clock);
  clockRef.current = clock;

  const stopActiveSearch = useCallback(() => {
    activeSearchIdRef.current++;
    const engine = getChessEngine();
    engine.stopSearch().catch(() => {});
    setIsEngineThinking(false);
  }, []);

  // Finalize Completed Game
  const finalizeGame = useCallback(
    (
      reason: GameTerminationReason,
      winner: 'white' | 'black' | 'draw',
      description: string
    ) => {
      clockRef.current.stop();
      stopActiveSearch();

      const chess = chessRef.current;
      const playerWon = winner === (playerSide === 'w' ? 'white' : 'black');
      const isDraw = winner === 'draw';

      const durationSeconds = startTimeRef.current
        ? Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000))
        : 0;

      const resultStr = winner === 'white' ? '1-0' : winner === 'black' ? '0-1' : '1/2-1/2';

      const summary: CompletedMatchSummary = {
        id: `match-${Date.now()}`,
        date: new Date().toISOString(),
        result: resultStr,
        winner,
        playerSide,
        playerWon,
        playerLost: !playerWon && !isDraw,
        isDraw,
        terminationReason: reason,
        terminationDescription: description,
        timeControl: activeTimeControl,
        difficulty: activeDifficulty,
        totalMoves: Math.ceil(chess.history().length / 2),
        totalDurationSeconds: durationSeconds,
        finalFen: chess.fen(),
        pgn: chess.pgn(),
        history: moveHistoryRef.current,
      };

      setMatchResult(summary);
      setMatchStatus('ended');
      playGameResultSound(soundEnabled, playerWon, isDraw);
    },
    [stopActiveSearch, playerSide, activeTimeControl, activeDifficulty, soundEnabled]
  );

  // Checks for game-ending conditions after every move
  const evaluateEndConditions = useCallback((): boolean => {
    const chess = chessRef.current;

    if (chess.isCheckmate()) {
      const winner: 'white' | 'black' = chess.turn() === 'w' ? 'black' : 'white';
      finalizeGame('checkmate', winner, `Checkmate. ${winner === 'white' ? 'White' : 'Black'} wins.`);
      return true;
    }

    if (chess.isStalemate()) {
      finalizeGame('stalemate', 'draw', 'Draw by stalemate (no legal moves).');
      return true;
    }

    if (chess.isInsufficientMaterial()) {
      finalizeGame('insufficient_material', 'draw', 'Draw by insufficient material.');
      return true;
    }

    if (chess.isThreefoldRepetition()) {
      finalizeGame('threefold_repetition', 'draw', 'Draw by threefold repetition.');
      return true;
    }

    if (chess.isDraw()) {
      finalizeGame('fifty_move_rule', 'draw', 'Draw by 50-move rule or repetition.');
      return true;
    }

    return false;
  }, [finalizeGame]);

  // Executes Stockfish move calculation
  const executeEngineTurn = useCallback(async () => {
    const chess = chessRef.current;
    if (matchStatus !== 'playing' || chess.turn() === playerSide) {
      return;
    }

    const searchId = ++activeSearchIdRef.current;
    setIsEngineThinking(true);
    setEngineError(null);

    const engineSide: 'w' | 'b' = playerSide === 'w' ? 'b' : 'w';
    const engineRemainingMs =
      engineSide === 'w' ? clockRef.current.whiteDisplayMs : clockRef.current.blackDisplayMs;
    const incrementMs = activeTimeControl.incrementSeconds * 1000;

    const budget = calculateEngineSearchBudget(activeDifficulty, engineRemainingMs, incrementMs);

    try {
      const engine = getChessEngine();
      if (engine.status === 'uninitialized' || engine.status === 'error' || engine.status === 'terminated') {
        await engine.init();
      }

      const bestMoveUci = await engine.findBestMove(chess.fen(), {
        skillLevel: activeDifficulty.skillLevel,
        depth: budget.depth,
        timeLimitMs: budget.timeLimitMs,
      });

      // Discard if search was aborted or superseded
      if (searchId !== activeSearchIdRef.current || matchStatus !== 'playing') {
        return;
      }

      const from = bestMoveUci.slice(0, 2);
      const to = bestMoveUci.slice(2, 4);
      const promotion = bestMoveUci.slice(4, 5) || undefined;

      const move = chess.move({ from, to, promotion });
      if (!move) {
        throw new Error(`Engine provided illegal move: ${bestMoveUci}`);
      }

      const isCapture = Boolean(move.captured);
      const isCheckNow = chess.isCheck();

      playMoveSound(soundEnabled, isCapture, isCheckNow);

      setFen(chess.fen());
      setIsCheck(isCheckNow);
      setLastMove({ from, to });

      const newRecord: MoveRecordItem = {
        ply: chess.history().length,
        moveNumber: Math.ceil(chess.history().length / 2),
        color: engineSide,
        san: move.san,
        from,
        to,
        piece: move.piece,
        captured: move.captured,
        promotion: move.promotion,
        fenAfter: chess.fen(),
      };

      setMoveHistory((prev) => [...prev, newRecord]);

      // Clock handover from engine to human
      clockRef.current.commitMove(engineSide, playerSide);

      setIsEngineThinking(false);

      evaluateEndConditions();
    } catch (err) {
      if (searchId === activeSearchIdRef.current) {
        setIsEngineThinking(false);
        const errMsg = err instanceof Error ? err.message : String(err);
        setEngineError(`Engine error: ${errMsg}`);
      }
    }
  }, [
    matchStatus,
    playerSide,
    activeTimeControl,
    activeDifficulty,
    soundEnabled,
    evaluateEndConditions,
  ]);

  // Trigger Stockfish turn when it is engine's turn and match is active
  useEffect(() => {
    if (matchStatus === 'playing' && chessRef.current.turn() !== playerSide && !isEngineThinking) {
      executeEngineTurn();
    }
  }, [matchStatus, playerSide, fen, isEngineThinking, executeEngineTurn]);

  // Execute Human Player Move
  const makeMove = useCallback(
    (from: string, to: string, promotionPiece?: 'q' | 'r' | 'b' | 'n'): boolean => {
      const chess = chessRef.current;

      if (matchStatus !== 'playing') return false;
      if (chess.turn() !== playerSide) return false;
      if (isEngineThinking) return false;

      // Check if this move requires pawn promotion modal
      const piece = chess.get(from as Square);
      const isPawnPromotion =
        piece?.type === 'p' &&
        ((piece.color === 'w' && to.endsWith('8')) || (piece.color === 'b' && to.endsWith('1')));

      if (isPawnPromotion && !promotionPiece) {
        setPendingPromotion({ from, to });
        return false;
      }

      try {
        const move = chess.move({
          from,
          to,
          promotion: promotionPiece || 'q',
        });

        if (!move) return false;

        const isCapture = Boolean(move.captured);
        const isCheckNow = chess.isCheck();

        playMoveSound(soundEnabled, isCapture, isCheckNow);

        setFen(chess.fen());
        setIsCheck(isCheckNow);
        setLastMove({ from, to });
        setSelectedSquare(null);
        setLegalMovesForSelected([]);

        const newRecord: MoveRecordItem = {
          ply: chess.history().length,
          moveNumber: Math.ceil(chess.history().length / 2),
          color: playerSide,
          san: move.san,
          from,
          to,
          piece: move.piece,
          captured: move.captured,
          promotion: move.promotion,
          fenAfter: chess.fen(),
        };

        setMoveHistory((prev) => [...prev, newRecord]);

        const nextSide: 'w' | 'b' = playerSide === 'w' ? 'b' : 'w';
        clockRef.current.commitMove(playerSide, nextSide);

        const ended = evaluateEndConditions();
        if (!ended) {
          // Engine turn will trigger automatically via useEffect
        }

        return true;
      } catch {
        return false;
      }
    },
    [matchStatus, playerSide, isEngineThinking, soundEnabled, evaluateEndConditions]
  );

  // Click-to-move square selection
  const handleSquareClick = useCallback(
    (square: Square) => {
      if (matchStatus !== 'playing' || isEngineThinking) return;
      const chess = chessRef.current;
      if (chess.turn() !== playerSide) return;

      // If a square is already selected, try to move to the clicked square
      if (selectedSquare) {
        if (selectedSquare === square) {
          setSelectedSquare(null);
          setLegalMovesForSelected([]);
          return;
        }

        // Check if clicked square is a legal destination
        const isLegal = legalMovesForSelected.includes(square);
        if (isLegal) {
          makeMove(selectedSquare, square);
          return;
        }
      }

      // Select new piece if it belongs to player
      const piece = chess.get(square);
      if (piece && piece.color === playerSide) {
        setSelectedSquare(square);
        const legalMoves = chess
          .moves({ square, verbose: true })
          .map((m) => m.to);
        setLegalMovesForSelected(legalMoves);
      } else {
        setSelectedSquare(null);
        setLegalMovesForSelected([]);
      }
    },
    [matchStatus, isEngineThinking, playerSide, selectedSquare, legalMovesForSelected, makeMove]
  );

  // Start new match
  const startMatch = useCallback(async () => {
    stopActiveSearch();

    // Resolve color
    const resolvedSide: 'w' | 'b' =
      colorChoice === 'random'
        ? Math.random() < 0.5
          ? 'w'
          : 'b'
        : colorChoice === 'white'
        ? 'w'
        : 'b';

    const diff = DIFFICULTY_PRESETS[selectedDifficultyLevel];

    let tc: QuickMatchTimeControl;
    if (selectedTimeControlId === 'CUSTOM') {
      tc = {
        id: 'CUSTOM',
        name: `${customMinutes}+${customIncrement}`,
        category: 'custom',
        initialMinutes: customMinutes,
        incrementSeconds: customIncrement,
        label: `Custom ${customMinutes}m + ${customIncrement}s`,
      };
    } else {
      tc = QUICK_MATCH_TIME_CONTROLS[selectedTimeControlId];
    }

    setActiveDifficulty(diff);
    setActiveTimeControl(tc);
    setPlayerSide(resolvedSide);

    // Reset chess.js board
    const newChess = new Chess();
    chessRef.current = newChess;
    setFen(newChess.fen());
    setMoveHistory([]);
    setIsCheck(false);
    setLastMove(null);
    setSelectedSquare(null);
    setLegalMovesForSelected([]);
    setPendingPromotion(null);
    setMatchResult(null);
    setEngineError(null);

    // Initialize clock
    clockRef.current.reset(tc.initialMinutes, tc.incrementSeconds);
    clockRef.current.start('w');

    startTimeRef.current = Date.now();
    setMatchStatus('playing');

    // Pre-initialize engine in background
    try {
      const engine = getChessEngine();
      if (engine.status === 'uninitialized' || engine.status === 'error' || engine.status === 'terminated') {
        await engine.init();
      }
      await engine.setSkillLevel(diff.skillLevel);
    } catch {
      // Handled during turn
    }
  }, [
    stopActiveSearch,
    colorChoice,
    selectedDifficultyLevel,
    selectedTimeControlId,
    customMinutes,
    customIncrement,
  ]);

  // Resign active match
  const resignMatch = useCallback(() => {
    if (matchStatus !== 'playing') return;
    const winner: 'white' | 'black' = playerSide === 'w' ? 'black' : 'white';
    finalizeGame('resignation', winner, `Resignation. ${winner === 'white' ? 'White' : 'Black'} wins.`);
  }, [matchStatus, playerSide, finalizeGame]);

  // Clean unmount
  useEffect(() => {
    return () => {
      stopActiveSearch();
      clockRef.current.stop();
    };
  }, [stopActiveSearch]);

  return {
    matchStatus,
    setMatchStatus,
    selectedDifficultyLevel,
    setSelectedDifficultyLevel,
    selectedTimeControlId,
    setSelectedTimeControlId,
    customMinutes,
    setCustomMinutes,
    customIncrement,
    setCustomIncrement,
    colorChoice,
    setColorChoice,
    playerSide,
    activeDifficulty,
    activeTimeControl,
    fen,
    turn: chessRef.current.turn(),
    isPlayerTurn: chessRef.current.turn() === playerSide && matchStatus === 'playing',
    moveHistory,
    isCheck,
    lastMove,
    selectedSquare,
    legalMovesForSelected,
    pendingPromotion,
    setPendingPromotion,
    isEngineThinking,
    engineError,
    matchResult,
    clock,
    startMatch,
    makeMove,
    handleSquareClick,
    resignMatch,
    stopActiveSearch,
  };
}
