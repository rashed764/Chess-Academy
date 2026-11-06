import { useCallback, useEffect, useRef, useState } from 'react';
import { Chess, type Square } from 'chess.js';
import { getChessEngine } from '../../../services/chess/adapter';
import { useAppStore } from '../../../stores/useAppStore';
import { playMoveSound, playGameResultSound } from '../../../utils/sound';
import { calculateEngineSearchBudget, DIFFICULTY_PRESETS } from '../../quick-match/models/difficulty';
import type { DifficultyConfig, DifficultyLevel } from '../../quick-match/types';
import { useChessClock } from '../../quick-match/hooks/useChessClock';
import type {
  AnalyzedMoveRecord,
  AssessmentFormatId,
  AssessmentGameRecord,
  AssessmentReport,
} from '../types';
import { ARENA_ASSESSMENT_FORMATS } from '../models/formats';
import {
  classifyGamePhase,
  evaluateMoveQuality,
} from '../models/analysisEngine';
import {
  aggregateAssessmentGames,
  calculateGameMetrics,
} from '../models/metrics';
import { TestArenaStorage } from '../models/storage';

export interface UseArenaMatchSessionProps {
  formatId: AssessmentFormatId;
  difficultyLevel: DifficultyLevel;
  initialPlayerColor?: 'w' | 'b';
  existingAssessment?: AssessmentReport | null;
  onAssessmentCompleted?: (report: AssessmentReport) => void;
  onExit?: () => void;
}

export function useArenaMatchSession({
  formatId,
  difficultyLevel,
  initialPlayerColor = 'w',
  existingAssessment = null,
  onAssessmentCompleted,
  onExit,
}: UseArenaMatchSessionProps) {
  const { currentProfile } = useAppStore();
  const soundEnabled = currentProfile.settings.soundEnabled;

  const formatConfig = ARENA_ASSESSMENT_FORMATS[formatId];
  const difficultyConfig: DifficultyConfig = DIFFICULTY_PRESETS[difficultyLevel] || DIFFICULTY_PRESETS.intermediate;

  // Active Assessment State
  const [assessment, setAssessment] = useState<AssessmentReport>(() => {
    if (existingAssessment) return existingAssessment;
    return {
      id: `assessment-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      formatId,
      formatName: formatConfig.name,
      createdAt: new Date().toISOString(),
      status: 'in_progress',
      totalGamesScheduled: formatConfig.totalGames,
      gamesCompleted: 0,
      games: [],
      overallResults: {
        wins: 0,
        losses: 0,
        draws: 0,
        totalMoves: 0,
        playerMovesCount: 0,
        acpl: 0,
        accuracyPercent: 100,
        classificationCounts: {
          brilliant: 0,
          best: 0,
          good: 0,
          inaccuracy: 0,
          mistake: 0,
          blunder: 0,
          unclassified: 0,
        },
        bestMovesPercent: 0,
        phaseBreakdown: {
          opening: { movesCount: 0, classificationCounts: { brilliant: 0, best: 0, good: 0, inaccuracy: 0, mistake: 0, blunder: 0, unclassified: 0 }, observations: [] },
          middlegame: { movesCount: 0, classificationCounts: { brilliant: 0, best: 0, good: 0, inaccuracy: 0, mistake: 0, blunder: 0, unclassified: 0 }, observations: [] },
          endgame: { movesCount: 0, classificationCounts: { brilliant: 0, best: 0, good: 0, inaccuracy: 0, mistake: 0, blunder: 0, unclassified: 0 }, observations: [] },
        },
        strengths: [],
        weaknesses: [],
        tacticalObservations: [],
        timeObservations: [],
        recommendations: [],
        methodologyNote: 'Analysis pending.',
      },
    };
  });

  // Calculate current game index and color
  const currentGameIndex = assessment.games.length;
  const currentPlayerColor: 'w' | 'b' =
    formatConfig.colorRule === 'alternating'
      ? (currentGameIndex % 2 === 0 ? initialPlayerColor : (initialPlayerColor === 'w' ? 'b' : 'w'))
      : initialPlayerColor;

  // Chess Game State (chess.js)
  const chessRef = useRef(new Chess());
  const [fen, setFen] = useState(chessRef.current.fen());
  const [rawMoves, setRawMoves] = useState<
    Array<{
      ply: number;
      moveNumber: number;
      color: 'w' | 'b';
      san: string;
      from: string;
      to: string;
      piece: string;
      captured?: string;
      promotion?: string;
      fenBefore: string;
      fenAfter: string;
      spentTimeMs?: number;
    }>
  >([]);

  const [isCheck, setIsCheck] = useState(false);
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);

  // Selection & Promotion
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [legalMovesForSelected, setLegalMovesForSelected] = useState<string[]>([]);
  const [pendingPromotion, setPendingPromotion] = useState<{ from: string; to: string } | null>(null);

  // Engine Opponent State
  const [isEngineThinking, setIsEngineThinking] = useState(false);
  const [engineError, setEngineError] = useState<string | null>(null);
  const activeSearchIdRef = useRef(0);
  const startTimeRef = useRef<number>(Date.now());
  const lastMoveTimestampRef = useRef<number>(Date.now());

  // Post-Game Analysis State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState<{ current: number; total: number }>({ current: 0, total: 0 });
  const [gameResultDetails, setGameResultDetails] = useState<{
    result: '1-0' | '0-1' | '1/2-1/2';
    winner: 'white' | 'black' | 'draw';
    reason: string;
    description: string;
  } | null>(null);

  // Clock Setup
  const handleTimeout = useCallback((expiredSide: 'w' | 'b') => {
    const winner: 'white' | 'black' = expiredSide === 'w' ? 'black' : 'white';
    endGame(winner === 'white' ? '1-0' : '0-1', winner, 'timeout', `${expiredSide === 'w' ? 'White' : 'Black'} ran out of time.`);
  }, []);

  const {
    clockState,
    start: startClock,
    stop: stopClock,
    commitMove: commitClockMove,
    whiteDisplayText,
    blackDisplayText,
  } = useChessClock({
    initialMinutes: formatConfig.timeControl.initialMinutes,
    incrementSeconds: formatConfig.timeControl.incrementSeconds,
    onTimeout: handleTimeout,
  });

  // End Game and Trigger Post-Game Engine Analysis
  const endGame = useCallback(
    async (
      result: '1-0' | '0-1' | '1/2-1/2',
      winner: 'white' | 'black' | 'draw',
      reason: string,
      description: string
    ) => {
      stopClock();
      playGameResultSound(soundEnabled, winner === (currentPlayerColor === 'w' ? 'white' : 'black'), winner === 'draw');

      setGameResultDetails({ result, winner, reason, description });
      setIsAnalyzing(true);

      const movesSnapshot = [...rawMoves];
      const playerMoves = movesSnapshot.filter((m) => m.color === currentPlayerColor);
      setAnalysisProgress({ current: 0, total: playerMoves.length });

      const analyzedMoves: AnalyzedMoveRecord[] = [];
      const engine = getChessEngine();

      try {
        if (engine.status === 'uninitialized' || engine.status === 'error') {
          await engine.init();
        }

        // Run post-game Stockfish WASM evaluation on player moves
        for (let i = 0; i < movesSnapshot.length; i++) {
          const move = movesSnapshot[i];
          const isPlayerMove = move.color === currentPlayerColor;

          if (!isPlayerMove) {
            // Opponent move: basic record without deep evaluation
            analyzedMoves.push({
              ...move,
              piece: move.piece as any,
              captured: move.captured as any,
              promotion: move.promotion as any,
              quality: 'best',
              phase: classifyGamePhase(move.fenBefore, move.ply),
              provenance: 'client_stockfish_wasm',
            });
            continue;
          }

          // Evaluate position before move
          const evalBefore = await engine.evaluatePosition(move.fenBefore, { depth: 8 }).catch(() => null);
          // Evaluate position after move
          const evalAfter = await engine.evaluatePosition(move.fenAfter, { depth: 8 }).catch(() => null);

          const isBestMove = Boolean(
            evalBefore?.bestMoveSan && evalBefore.bestMoveSan.toLowerCase() === move.san.toLowerCase()
          );

          const classification = evaluateMoveQuality(
            evalBefore?.scoreCentipawns,
            evalAfter?.scoreCentipawns,
            currentPlayerColor,
            isBestMove,
            false,
            {
              mateBefore: evalBefore?.mateInMoves,
              mateAfter: evalAfter?.mateInMoves,
              depthBefore: evalBefore?.depth,
              depthAfter: evalAfter?.depth,
            }
          );

          analyzedMoves.push({
            ...move,
            piece: move.piece as any,
            captured: move.captured as any,
            promotion: move.promotion as any,
            scoreBeforeWhiteCp: evalBefore?.scoreCentipawns,
            scoreAfterWhiteCp: evalAfter?.scoreCentipawns,
            mateBefore: evalBefore?.mateInMoves,
            mateAfter: evalAfter?.mateInMoves,
            evalLossCp: classification.evalLossCp,
            quality: classification.quality,
            bestMoveSan: evalBefore?.bestMoveSan,
            bestMoveUci: evalBefore?.bestMoveUci,
            analysisDepth: evalBefore?.depth || 8,
            phase: classifyGamePhase(move.fenBefore, move.ply),
            provenance: 'client_stockfish_wasm',
            boundaryRule: classification.boundaryRule,
          });

          setAnalysisProgress((prev) => ({ ...prev, current: prev.current + 1 }));
        }
      } catch (err) {
        console.warn('[ArenaSession] Engine analysis encountered error, applying safe fallback:', err);
      } finally {
        setIsAnalyzing(false);
      }

      // Calculate Game Metrics
      const analyzedPlayerMoves = analyzedMoves.filter((m) => m.color === currentPlayerColor);
      const metrics = calculateGameMetrics(analyzedPlayerMoves);

      const gameRecord: AssessmentGameRecord = {
        gameId: `game-${Date.now()}-${currentGameIndex}`,
        assessmentId: assessment.id,
        gameIndex: currentGameIndex,
        playerColor: currentPlayerColor,
        timeControl: formatConfig.timeControl,
        opponentDifficulty: difficultyConfig,
        startedAt: new Date(startTimeRef.current).toISOString(),
        completedAt: new Date().toISOString(),
        initialFen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        finalFen: chessRef.current.fen(),
        terminationReason: `${reason}: ${description}`,
        result,
        winner,
        playerWon: winner === (currentPlayerColor === 'w' ? 'white' : 'black'),
        playerLost: winner !== 'draw' && winner !== (currentPlayerColor === 'w' ? 'white' : 'black'),
        isDraw: winner === 'draw',
        totalDurationSeconds: Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000)),
        moves: analyzedMoves,
        analyzedMovesCount: analyzedPlayerMoves.length,
        acpl: metrics.acpl,
        accuracyPercent: metrics.accuracyPercent,
        classificationCounts: metrics.classificationCounts,
        phaseBreakdown: metrics.phaseBreakdown,
      };

      const updatedGames = [...assessment.games, gameRecord];
      const isCompleted = updatedGames.length >= formatConfig.totalGames;
      const aggregatedResults = aggregateAssessmentGames(updatedGames);

      const updatedAssessment: AssessmentReport = {
        ...assessment,
        status: isCompleted ? 'completed' : 'in_progress',
        gamesCompleted: updatedGames.length,
        completedAt: isCompleted ? new Date().toISOString() : undefined,
        games: updatedGames,
        overallResults: aggregatedResults,
      };

      setAssessment(updatedAssessment);

      if (isCompleted) {
        TestArenaStorage.saveReport(updatedAssessment);
        TestArenaStorage.clearActiveAssessment();
        onAssessmentCompleted?.(updatedAssessment);
      } else {
        TestArenaStorage.saveActiveAssessment(updatedAssessment);
      }
    },
    [assessment, currentPlayerColor, currentGameIndex, difficultyConfig, formatConfig, rawMoves, soundEnabled, stopClock, onAssessmentCompleted]
  );

  // Trigger Opponent Move
  const triggerEngineMove = useCallback(async () => {
    const chess = chessRef.current;
    if (chess.isGameOver()) return;

    setIsEngineThinking(true);
    setEngineError(null);
    const searchId = ++activeSearchIdRef.current;

    const remainingTimeMs =
      currentPlayerColor === 'w' ? clockState.blackRemainingMs : clockState.whiteRemainingMs;

    const searchBudget = calculateEngineSearchBudget(
      difficultyConfig,
      remainingTimeMs,
      formatConfig.timeControl.incrementSeconds * 1000
    );

    const engine = getChessEngine();

    try {
      if (engine.status === 'uninitialized' || engine.status === 'error') {
        await engine.init();
      }

      await engine.setSkillLevel(difficultyConfig.skillLevel);

      const bestMoveUci = await engine.findBestMove(chess.fen(), {
        depth: searchBudget.depth,
        timeLimitMs: searchBudget.timeLimitMs,
      });

      if (searchId !== activeSearchIdRef.current) return;

      if (!bestMoveUci || bestMoveUci === '(none)') {
        throw new Error('Stockfish produced no valid move.');
      }

      const from = bestMoveUci.slice(0, 2);
      const to = bestMoveUci.slice(2, 4);
      const promotion = bestMoveUci.length > 4 ? bestMoveUci[4] : undefined;

      const fenBefore = chess.fen();
      const moveResult = chess.move({ from, to, promotion: promotion as any });

      if (!moveResult) {
        throw new Error(`Engine attempted illegal move: ${bestMoveUci}`);
      }

      const fenAfter = chess.fen();
      const spentTimeMs = Date.now() - lastMoveTimestampRef.current;
      lastMoveTimestampRef.current = Date.now();

      playMoveSound(
        soundEnabled,
        Boolean(moveResult.captured),
        chess.inCheck()
      );

      setFen(fenAfter);
      setIsCheck(chess.inCheck());
      setLastMove({ from, to });

      const newRecord = {
        ply: chess.history().length,
        moveNumber: Math.ceil(chess.history().length / 2),
        color: moveResult.color,
        san: moveResult.san,
        from: moveResult.from,
        to: moveResult.to,
        piece: moveResult.piece,
        captured: moveResult.captured,
        promotion: moveResult.promotion,
        fenBefore,
        fenAfter,
        spentTimeMs,
      };

      setRawMoves((prev) => [...prev, newRecord]);
      commitClockMove(moveResult.color, chess.turn());

      // Check game over
      if (chess.isGameOver()) {
        if (chess.isCheckmate()) {
          endGame(currentPlayerColor === 'w' ? '0-1' : '1-0', currentPlayerColor === 'w' ? 'black' : 'white', 'checkmate', 'Checkmate delivered.');
        } else if (chess.isStalemate()) {
          endGame('1/2-1/2', 'draw', 'stalemate', 'Draw by stalemate.');
        } else if (chess.isThreefoldRepetition()) {
          endGame('1/2-1/2', 'draw', 'threefold_repetition', 'Draw by threefold repetition.');
        } else if (chess.isInsufficientMaterial()) {
          endGame('1/2-1/2', 'draw', 'insufficient_material', 'Draw by insufficient material.');
        } else {
          endGame('1/2-1/2', 'draw', 'fifty_move_rule', 'Draw by 50-move rule.');
        }
      }
    } catch (err) {
      if (searchId === activeSearchIdRef.current) {
        setEngineError(err instanceof Error ? err.message : String(err));
      }
    } finally {
      if (searchId === activeSearchIdRef.current) {
        setIsEngineThinking(false);
      }
    }
  }, [clockState.blackRemainingMs, clockState.whiteRemainingMs, commitClockMove, currentPlayerColor, difficultyConfig, endGame, formatConfig.timeControl.incrementSeconds, soundEnabled]);

  // Execute Player Move
  const makePlayerMove = useCallback(
    (from: string, to: string, promotion?: string): boolean => {
      const chess = chessRef.current;
      if (chess.turn() !== currentPlayerColor) return false;
      if (chess.isGameOver() || isEngineThinking || isAnalyzing) return false;

      // Handle promotion check
      const piece = chess.get(from as Square);
      if (
        piece &&
        piece.type === 'p' &&
        piece.color === currentPlayerColor &&
        ((currentPlayerColor === 'w' && from[1] === '7' && to[1] === '8') ||
          (currentPlayerColor === 'b' && from[1] === '2' && to[1] === '1'))
      ) {
        if (!promotion) {
          setPendingPromotion({ from, to });
          return false;
        }
      }

      const fenBefore = chess.fen();
      const moveResult = chess.move({ from, to, promotion: (promotion as any) || 'q' });
      if (!moveResult) return false;

      const fenAfter = chess.fen();
      const spentTimeMs = Date.now() - lastMoveTimestampRef.current;
      lastMoveTimestampRef.current = Date.now();

      playMoveSound(
        soundEnabled,
        Boolean(moveResult.captured),
        chess.inCheck()
      );

      setFen(fenAfter);
      setIsCheck(chess.inCheck());
      setLastMove({ from, to });
      setSelectedSquare(null);
      setLegalMovesForSelected([]);
      setPendingPromotion(null);

      const newRecord = {
        ply: chess.history().length,
        moveNumber: Math.ceil(chess.history().length / 2),
        color: moveResult.color,
        san: moveResult.san,
        from: moveResult.from,
        to: moveResult.to,
        piece: moveResult.piece,
        captured: moveResult.captured,
        promotion: moveResult.promotion,
        fenBefore,
        fenAfter,
        spentTimeMs,
      };

      setRawMoves((prev) => [...prev, newRecord]);
      commitClockMove(moveResult.color, chess.turn());

      // Check game over
      if (chess.isGameOver()) {
        if (chess.isCheckmate()) {
          endGame(currentPlayerColor === 'w' ? '1-0' : '0-1', currentPlayerColor === 'w' ? 'white' : 'black', 'checkmate', 'Checkmate delivered.');
        } else if (chess.isStalemate()) {
          endGame('1/2-1/2', 'draw', 'stalemate', 'Draw by stalemate.');
        } else if (chess.isThreefoldRepetition()) {
          endGame('1/2-1/2', 'draw', 'threefold_repetition', 'Draw by threefold repetition.');
        } else if (chess.isInsufficientMaterial()) {
          endGame('1/2-1/2', 'draw', 'insufficient_material', 'Draw by insufficient material.');
        } else {
          endGame('1/2-1/2', 'draw', 'fifty_move_rule', 'Draw by 50-move rule.');
        }
        return true;
      }

      // Trigger engine response
      setTimeout(triggerEngineMove, 100);
      return true;
    },
    [commitClockMove, currentPlayerColor, endGame, isAnalyzing, isEngineThinking, soundEnabled, triggerEngineMove]
  );

  // Square Click Handler for piece selection
  const handleSquareClick = useCallback(
    (square: Square) => {
      const chess = chessRef.current;
      if (chess.turn() !== currentPlayerColor || chess.isGameOver() || isEngineThinking || isAnalyzing) {
        return;
      }

      if (selectedSquare) {
        if (selectedSquare === square) {
          setSelectedSquare(null);
          setLegalMovesForSelected([]);
          return;
        }

        const isLegal = legalMovesForSelected.includes(square);
        if (isLegal) {
          makePlayerMove(selectedSquare, square);
          return;
        }
      }

      const piece = chess.get(square);
      if (piece && piece.color === currentPlayerColor) {
        setSelectedSquare(square);
        const moves = chess.moves({ square, verbose: true }).map((m) => m.to);
        setLegalMovesForSelected(moves);
      } else {
        setSelectedSquare(null);
        setLegalMovesForSelected([]);
      }
    },
    [currentPlayerColor, isAnalyzing, isEngineThinking, legalMovesForSelected, makePlayerMove, selectedSquare]
  );

  // Resignation Handler
  const handleResign = useCallback(() => {
    endGame(
      currentPlayerColor === 'w' ? '0-1' : '1-0',
      currentPlayerColor === 'w' ? 'black' : 'white',
      'resignation',
      'Player resigned.'
    );
  }, [currentPlayerColor, endGame]);

  // Start match on mount and trigger engine if player is Black
  useEffect(() => {
    startClock('w');
    if (currentPlayerColor === 'b') {
      setTimeout(triggerEngineMove, 400);
    }
    return () => {
      stopClock();
    };
  }, []);

  // Advance to Next Game (for multi-game battery)
  const advanceToNextGame = useCallback(() => {
    chessRef.current = new Chess();
    setFen(chessRef.current.fen());
    setRawMoves([]);
    setLastMove(null);
    setIsCheck(false);
    setSelectedSquare(null);
    setLegalMovesForSelected([]);
    setGameResultDetails(null);
    startTimeRef.current = Date.now();
    lastMoveTimestampRef.current = Date.now();

    startClock('w');

    // Check if new game has engine to move (if player is black)
    const nextGameIndex = assessment.games.length;
    const nextPlayerColor =
      formatConfig.colorRule === 'alternating'
        ? (nextGameIndex % 2 === 0 ? initialPlayerColor : (initialPlayerColor === 'w' ? 'b' : 'w'))
        : initialPlayerColor;

    if (nextPlayerColor === 'b') {
      setTimeout(triggerEngineMove, 400);
    }
  }, [assessment.games.length, formatConfig.colorRule, initialPlayerColor, startClock, triggerEngineMove]);

  return {
    formatConfig,
    difficultyConfig,
    assessment,
    currentGameIndex,
    totalGames: formatConfig.totalGames,
    currentPlayerColor,
    fen,
    rawMoves,
    isCheck,
    lastMove,
    selectedSquare,
    legalMovesForSelected,
    pendingPromotion,
    isEngineThinking,
    engineError,
    clockState,
    whiteDisplayText,
    blackDisplayText,
    isAnalyzing,
    analysisProgress,
    gameResultDetails,
    makePlayerMove,
    handleSquareClick,
    handleResign,
    advanceToNextGame,
    setPendingPromotion,
  };
}
