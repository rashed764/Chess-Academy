/**
 * Main application hook managing the Autonomous AI Tutor session,
 * interactive chessboard state, conversation history, assessment engine, and orchestrator transitions.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { Square } from 'chess.js';
import { Chess } from 'chess.js';
import type {
  TutorBoardState,
  TutorMessage,
  InitialAssessmentState,
  TutorTurnRequest,
  TutorTurnResponse,
} from '../types';
import {
  TutorBoardController,
  INITIAL_TUTOR_BOARD_STATE,
  STARTING_FEN,
} from '../models/tutorBoardController';
import { SkillAssessmentEngine } from '../models/skillAssessmentEngine';
import { AcademyOrchestrator, type TestArenaTransitionPrompt } from '../models/academyOrchestrator';
import { coachApiClient } from '../../../services/ai/coachClient';
import { getLessonById } from '../../training/data';
import type { AcademyLevelId } from '../../training/types';

const TUTOR_MESSAGES_STORAGE_KEY = 'chess_academy_tutor_chat_v1';
const ASSESSMENT_STORAGE_KEY = 'chess_academy_tutor_assessment_v1';

const INITIAL_WELCOME_MESSAGE: TutorMessage = {
  id: 'msg-welcome',
  role: 'assistant',
  content:
    'Welcome to the Grandmaster Academy. I am your personal AI Chess Tutor.\n\nWhether you are learning the pieces for the very first time, preparing for competitive tournament play, or looking to sharpen your tactical vision, I am here to guide your study.\n\nWould you like to take our Initial Skill Assessment to calibrate your personalized curriculum, or shall we explore a specific lesson on the board?',
  timestamp: new Date().toISOString(),
  suggestedReplies: [
    'Take Initial Skill Assessment',
    'Show me how Knights move',
    'Teach me Castling rules',
    'What should I learn next?',
  ],
  source: 'local_fallback',
};

export function useAITutorSession(initialLessonId?: string | null) {
  // Board state
  const [boardState, setBoardState] = useState<TutorBoardState>(() => {
    if (initialLessonId) {
      const lesson = getLessonById(initialLessonId);
      if (lesson) {
        return {
          ...INITIAL_TUTOR_BOARD_STATE,
          fen: lesson.exercise.initialFen,
          activeLesson: lesson,
          activeExercise: {
            id: lesson.exercise.id,
            initialFen: lesson.exercise.initialFen,
            objective: lesson.exercise.instruction,
            targetMoves: [lesson.exercise.steps[0]?.playerMoveSan || ''],
            completed: false,
            attempts: 0,
          },
        };
      }
    }
    return INITIAL_TUTOR_BOARD_STATE;
  });

  // Chat message stream
  const [messages, setMessages] = useState<TutorMessage[]>(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const raw = localStorage.getItem(TUTOR_MESSAGES_STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch {
        // continue
      }
    }
    return [INITIAL_WELCOME_MESSAGE];
  });

  // Initial skill assessment state
  const [assessmentState, setAssessmentState] = useState<InitialAssessmentState>(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const raw = localStorage.getItem(ASSESSMENT_STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && typeof parsed === 'object') {
            return parsed;
          }
        }
      } catch {
        // continue
      }
    }
    return {
      isActive: false,
      isCompleted: false,
      currentQuestionIndex: 0,
      totalQuestions: 0,
      questions: [],
      results: [],
      strengths: [],
      gaps: [],
    };
  });

  // Test Arena transition prompt modal state
  const [testArenaPrompt, setTestArenaPrompt] = useState<TestArenaTransitionPrompt | null>(null);

  // Status indicators
  const [isThinking, setIsThinking] = useState(false);
  const [tutorStatus, setTutorStatus] = useState<'connected' | 'local' | 'thinking'>('connected');

  // Academy progress snapshot
  const [academyProgress, setAcademyProgress] = useState(() => AcademyOrchestrator.getProgress());

  // Save chat messages to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        // Keep last 40 messages to prevent unbounded growth
        const trimmed = messages.slice(-40);
        localStorage.setItem(TUTOR_MESSAGES_STORAGE_KEY, JSON.stringify(trimmed));
      } catch {
        // ignore storage errors
      }
    }
  }, [messages]);

  // Save assessment state to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem(ASSESSMENT_STORAGE_KEY, JSON.stringify(assessmentState));
      } catch {
        // ignore
      }
    }
  }, [assessmentState]);

  // Load lesson if initialLessonId changes
  useEffect(() => {
    if (initialLessonId) {
      const lesson = getLessonById(initialLessonId);
      if (lesson) {
        setBoardState((prev) => ({
          ...prev,
          fen: lesson.exercise.initialFen,
          activeLesson: lesson,
          activeExercise: {
            id: lesson.exercise.id,
            initialFen: lesson.exercise.initialFen,
            objective: lesson.exercise.instruction,
            targetMoves: [lesson.exercise.steps[0]?.playerMoveSan || ''],
            completed: false,
            attempts: 0,
          },
          lastMove: null,
          customHighlights: {},
          customArrows: [],
          moveHistory: [],
        }));
      }
    }
  }, [initialLessonId]);

  /**
   * Dispatches a message to the AI Tutor backend.
   */
  const sendMessage = useCallback(
    async (userText: string) => {
      const trimmed = userText.trim();
      if (!trimmed || isThinking) return;

      const userMsg: TutorMessage = {
        id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        role: 'user',
        content: trimmed,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setIsThinking(true);
      setTutorStatus('thinking');

      const req: TutorTurnRequest = {
        messages: [...messages, userMsg].map((m) => ({
          role: m.role,
          content: m.content,
        })),
        boardState: {
          fen: boardState.fen,
          mode: boardState.mode,
          boardOrientation: boardState.boardOrientation,
          lastMove: boardState.lastMove,
          activeLessonId: boardState.activeLesson?.id,
          activeExerciseObjective: boardState.activeExercise?.objective,
        },
        learnerContext: {
          currentLevelId: academyProgress.currentLevelId || 'level-1-absolute-beginner',
          completedLessonIds: academyProgress.completedLessonIds,
          isAssessed: assessmentState.isCompleted,
          assessedLevelId: assessmentState.evaluatedLevelId,
        },
      };

      try {
        const response: TutorTurnResponse = await coachApiClient.executeTutorTurn(req);

        // Apply returned board actions sequentially
        if (response.boardActions && response.boardActions.length > 0) {
          setBoardState((prev) => {
            const { finalState } = TutorBoardController.applyActions(prev, response.boardActions);
            return finalState;
          });
        }

        // Process orchestrator actions
        if (response.orchestratorActions && response.orchestratorActions.length > 0) {
          for (const orchAct of response.orchestratorActions) {
            if (orchAct.type === 'start_initial_assessment') {
              const freshAssessment = SkillAssessmentEngine.startAssessment();
              setAssessmentState(freshAssessment);
            } else if (orchAct.type === 'start_lesson') {
              const lesson = getLessonById(orchAct.lessonId);
              if (lesson) {
                setBoardState((prev) => ({
                  ...prev,
                  fen: lesson.exercise.initialFen,
                  activeLesson: lesson,
                  activeExercise: {
                    id: lesson.exercise.id,
                    initialFen: lesson.exercise.initialFen,
                    objective: lesson.exercise.instruction,
                    targetMoves: [lesson.exercise.steps[0]?.playerMoveSan || ''],
                    completed: false,
                    attempts: 0,
                  },
                }));
              }
            } else if (orchAct.type === 'complete_lesson') {
              const { updatedProgress } = AcademyOrchestrator.completeLesson(orchAct.lessonId);
              setAcademyProgress(updatedProgress);
            } else if (orchAct.type === 'prompt_test_arena') {
              setTestArenaPrompt({
                isOpen: true,
                reason: orchAct.reason,
                recommendedFormat: orchAct.recommendedFormat || 'single',
              });
            }
          }
        }

        // Format action summary for UI display
        const actionSummaries = (response.boardActions || []).map((act) => {
          if (act.type === 'move_piece') {
            return {
              type: 'demonstration' as const,
              label: `Demonstrated: ${act.from} -> ${act.to}`,
              detail: act.explanation,
            };
          }
          if (act.type === 'set_position') {
            return {
              type: 'position' as const,
              label: 'Set Position',
              detail: act.description,
            };
          }
          if (act.type === 'start_position_exercise') {
            return {
              type: 'exercise' as const,
              label: 'Exercise Started',
              detail: act.objective,
            };
          }
          return {
            type: 'demonstration' as const,
            label: act.type.replace(/_/g, ' '),
          };
        });

        const assistantMsg: TutorMessage = {
          id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          role: 'assistant',
          content: response.message,
          timestamp: new Date().toISOString(),
          boardActionSummary: actionSummaries.length > 0 ? actionSummaries : undefined,
          suggestedReplies: response.suggestedReplies,
          source: response.source,
        };

        setMessages((prev) => [...prev, assistantMsg]);
        setTutorStatus(response.source === 'gemini' ? 'connected' : 'local');
      } catch (err) {
        console.error('[Chess Academy] Tutor turn error:', err);
        const errorMsg: TutorMessage = {
          id: `msg-${Date.now()}`,
          role: 'assistant',
          content:
            'I encountered a brief disruption while processing your chess query. You can continue interacting with the board, or ask me again!',
          timestamp: new Date().toISOString(),
          source: 'local_fallback',
        };
        setMessages((prev) => [...prev, errorMsg]);
        setTutorStatus('local');
      } finally {
        setIsThinking(false);
      }
    },
    [isThinking, messages, boardState, academyProgress, assessmentState]
  );

  /**
   * Handles interactive piece drop by student on the board.
   */
  const handlePieceDrop = useCallback(
    (from: string, to: string, promotion?: 'q' | 'r' | 'b' | 'n'): boolean => {
      // If AI is in demonstration mode, prevent accidental user interference
      if (boardState.mode === 'demonstration') {
        return false;
      }

      const evalRes = TutorBoardController.handleStudentMove(
        boardState,
        from,
        to,
        promotion
      );

      if (!evalRes.isValid) {
        return false;
      }

      setBoardState(evalRes.nextState);

      // Record exercise attempt if active exercise exists
      if (boardState.activeExercise) {
        const passed = Boolean(evalRes.isCorrect);
        const updated = AcademyOrchestrator.recordExerciseAttempt(passed);
        setAcademyProgress(updated);

        if (evalRes.isExerciseCompleted) {
          // If in lesson, also record lesson completion
          if (boardState.activeLesson) {
            const { updatedProgress } = AcademyOrchestrator.completeLesson(
              boardState.activeLesson.id
            );
            setAcademyProgress(updatedProgress);
          }

          // Send assistant congratulatory reply
          const botReply: TutorMessage = {
            id: `msg-${Date.now()}`,
            role: 'assistant',
            content: `Masterful! You played **${evalRes.playedSan}**, which is the exact tactical solution! Well done. Would you like to review another exercise, or advance to the next lesson?`,
            timestamp: new Date().toISOString(),
            suggestedReplies: [
              'What should I learn next?',
              'Show me another puzzle',
              'Take Skill Assessment',
            ],
            source: 'local_fallback',
          };
          setMessages((prev) => [...prev, botReply]);
        } else if (evalRes.isCorrect === false) {
          const botReply: TutorMessage = {
            id: `msg-${Date.now()}`,
            role: 'assistant',
            content: `You played **${evalRes.playedSan}**. That is a legal move, but not the winning idea here. Look for tactical motifs or ask for a hint!`,
            timestamp: new Date().toISOString(),
            suggestedReplies: ['Give me a hint', 'Show me the solution', 'Reset position'],
            source: 'local_fallback',
          };
          setMessages((prev) => [...prev, botReply]);
        }
      }

      return true;
    },
    [boardState]
  );

  /**
   * Handles square click for click-to-move piece selection.
   */
  const handleSquareClick = useCallback(
    (square: Square) => {
      if (boardState.mode === 'demonstration') return;

      const chess = new Chess(boardState.fen);
      const piece = chess.get(square);

      if (boardState.selectedSquare) {
        if (boardState.selectedSquare === square) {
          // Deselect
          setBoardState((prev) => ({
            ...prev,
            selectedSquare: null,
            legalMovesForSelected: [],
          }));
          return;
        }

        // Attempt move from selectedSquare to square
        const moveSuccess = handlePieceDrop(boardState.selectedSquare, square);
        if (moveSuccess) {
          setBoardState((prev) => ({
            ...prev,
            selectedSquare: null,
            legalMovesForSelected: [],
          }));
          return;
        }
      }

      // Select new piece if friendly piece
      if (piece) {
        const turn = chess.turn();
        const matchesTurn =
          (boardState.boardOrientation === 'white' && piece.color === 'w') ||
          (boardState.boardOrientation === 'black' && piece.color === 'b') ||
          piece.color === turn;

        if (matchesTurn) {
          const legalMoves = chess.moves({ square, verbose: true }).map((m) => m.to);
          setBoardState((prev) => ({
            ...prev,
            selectedSquare: square,
            legalMovesForSelected: legalMoves,
          }));
        }
      } else {
        setBoardState((prev) => ({
          ...prev,
          selectedSquare: null,
          legalMovesForSelected: [],
        }));
      }
    },
    [boardState, handlePieceDrop]
  );

  /**
   * Initiates the Initial Skill Assessment.
   */
  const startAssessment = useCallback(() => {
    const fresh = SkillAssessmentEngine.startAssessment();
    setAssessmentState(fresh);

    // If first question has an initial FEN, set it on the board
    const firstQ = fresh.questions[0];
    if (firstQ?.initialFen) {
      setBoardState((prev) => ({
        ...prev,
        fen: firstQ.initialFen!,
        mode: 'assessment',
      }));
    }

    const startMsg: TutorMessage = {
      id: `msg-${Date.now()}`,
      role: 'assistant',
      content:
        'Starting your Initial Skill Assessment! We will examine 10 essential chess topics ranging from fundamental board geometry and piece values to tactics and endgame techniques. Let us begin with Question 1 below!',
      timestamp: new Date().toISOString(),
      source: 'local_fallback',
    };
    setMessages((prev) => [...prev, startMsg]);
  }, []);

  /**
   * Submits an answer to the active initial assessment question.
   */
  const submitAssessmentAnswer = useCallback(
    (answer: number | string) => {
      const res = SkillAssessmentEngine.submitAnswer(assessmentState, answer);
      setAssessmentState(res.nextState);

      const q = assessmentState.questions[assessmentState.currentQuestionIndex];
      const feedbackText = res.isCorrect
        ? `✅ **Correct!** ${res.explanation}`
        : `❌ **Not quite.** ${res.explanation}`;

      const feedbackMsg: TutorMessage = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: feedbackText,
        timestamp: new Date().toISOString(),
        source: 'local_fallback',
      };

      setMessages((prev) => [...prev, feedbackMsg]);

      if (res.isCompleted) {
        // Assessment finished! Update academy progress with starting level
        const updatedProg = AcademyOrchestrator.applyInitialAssessmentResult(res.nextState);
        setAcademyProgress(updatedProg);

        const summaryMsg: TutorMessage = {
          id: `msg-summary-${Date.now()}`,
          role: 'assistant',
          content: `🎉 **Initial Assessment Complete!**\n\n- **Recommended Starting Level:** Level ${res.nextState.evaluatedLevelId?.replace(/[^0-9]/g, '') || '1'}\n- **Estimated Educational Rating:** ~${res.nextState.evaluatedRating || 500} (Academy Assessment)\n- **Demonstrated Strengths:** ${res.nextState.strengths.join(', ') || 'Foundational dedication'}\n- **Target Knowledge Gaps:** ${res.nextState.gaps.join(', ') || 'Ready for curriculum advancement'}\n\nYour curriculum has been customized! You can begin with our recommended lessons, or ask me any question.`,
          timestamp: new Date().toISOString(),
          suggestedReplies: [
            'What should I learn next?',
            'Show me how Knights move',
            'Teach me Castling',
            'Take Assessment Again',
          ],
          source: 'local_fallback',
        };
        setMessages((prev) => [...prev, summaryMsg]);
      } else {
        // Prepare board for next question if board position is required
        const nextQ = res.nextState.questions[res.nextState.currentQuestionIndex];
        if (nextQ?.initialFen) {
          setBoardState((prev) => ({
            ...prev,
            fen: nextQ.initialFen!,
            mode: 'assessment',
          }));
        }
      }
    },
    [assessmentState]
  );

  /**
   * Resets the entire board position.
   */
  const resetBoard = useCallback(() => {
    setBoardState((prev) => ({
      ...prev,
      fen: STARTING_FEN,
      lastMove: null,
      selectedSquare: null,
      legalMovesForSelected: [],
      customHighlights: {},
      customArrows: [],
      moveHistory: [],
      mode: 'free_play',
    }));
  }, []);

  /**
   * Inverts board orientation.
   */
  const flipBoard = useCallback(() => {
    setBoardState((prev) => ({
      ...prev,
      boardOrientation: prev.boardOrientation === 'white' ? 'black' : 'white',
    }));
  }, []);

  /**
   * Clears tutor chat history.
   */
  const clearChat = useCallback(() => {
    setMessages([INITIAL_WELCOME_MESSAGE]);
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(TUTOR_MESSAGES_STORAGE_KEY);
    }
  }, []);

  return {
    boardState,
    messages,
    assessmentState,
    testArenaPrompt,
    isThinking,
    tutorStatus,
    academyProgress,
    sendMessage,
    handlePieceDrop,
    handleSquareClick,
    startAssessment,
    submitAssessmentAnswer,
    resetBoard,
    flipBoard,
    clearChat,
    setTestArenaPrompt,
  };
}
