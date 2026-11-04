import { useState, useCallback } from 'react';
import { coachApiClient } from '../../../services/ai/coachClient';
import type {
  HintStage,
  ProgressiveHintResponse,
  CoachPositionExplanationResponse,
  CoachMoveExplanationResponse,
} from '../../../types/ai';
import type { EngineEvaluation, ChessColor } from '../../../types/chess';

export function useAICoach() {
  const [loadingHint, setLoadingHint] = useState(false);
  const [hintError, setHintError] = useState<string | null>(null);
  const [currentHint, setCurrentHint] = useState<ProgressiveHintResponse | null>(null);
  const [currentHintStage, setCurrentHintStage] = useState<HintStage>(1);

  const [loadingPosition, setLoadingPosition] = useState(false);
  const [positionError, setPositionError] = useState<string | null>(null);
  const [positionExplanation, setPositionExplanation] = useState<CoachPositionExplanationResponse | null>(null);

  const [loadingMove, setLoadingMove] = useState(false);
  const [moveExplanation, setMoveExplanation] = useState<CoachMoveExplanationResponse | null>(null);

  const [chatMessages, setChatMessages] = useState<Array<{ id: string; role: 'user' | 'assistant'; content: string }>>([]);
  const [chatLoading, setChatLoading] = useState(false);

  const requestHint = useCallback(
    async (
      fen: string,
      objective: string,
      stage: HintStage,
      expectedMoveSan?: string,
      exerciseCategory?: string
    ) => {
      setLoadingHint(true);
      setHintError(null);
      try {
        const hint = await coachApiClient.getHint(fen, objective, stage, expectedMoveSan, exerciseCategory);
        setCurrentHint(hint);
        setCurrentHintStage(stage);
        return hint;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        setHintError(msg);
        return null;
      } finally {
        setLoadingHint(false);
      }
    },
    []
  );

  const requestPositionExplanation = useCallback(
    async (
      fen: string,
      evaluation?: EngineEvaluation,
      sideToMove?: ChessColor,
      recentMovesSan?: string[]
    ) => {
      setLoadingPosition(true);
      setPositionError(null);
      try {
        const explanation = await coachApiClient.explainPosition(fen, evaluation, sideToMove, recentMovesSan);
        setPositionExplanation(explanation);
        return explanation;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        setPositionError(msg);
        return null;
      } finally {
        setLoadingPosition(false);
      }
    },
    []
  );

  const requestMoveExplanation = useCallback(
    async (
      fenBefore: string,
      fenAfter: string,
      moveSan: string,
      evalBefore?: EngineEvaluation,
      evalAfter?: EngineEvaluation
    ) => {
      setLoadingMove(true);
      try {
        const explanation = await coachApiClient.explainMove(fenBefore, fenAfter, moveSan, evalBefore, evalAfter);
        setMoveExplanation(explanation);
        return explanation;
      } catch (err) {
        console.warn('Failed to explain move:', err);
        return null;
      } finally {
        setLoadingMove(false);
      }
    },
    []
  );

  const sendChatMessage = useCallback(
    async (messageText: string, fen: string, userColor: ChessColor = 'w') => {
      if (!messageText.trim()) return;
      const userMsg = { id: `msg-${Date.now()}`, role: 'user' as const, content: messageText.trim() };
      const updatedList = [...chatMessages, userMsg];
      setChatMessages(updatedList);
      setChatLoading(true);

      try {
        const reply = await coachApiClient.sendChat(updatedList, fen, userColor);
        const assistantMsg = { id: `msg-${Date.now() + 1}`, role: 'assistant' as const, content: reply };
        setChatMessages([...updatedList, assistantMsg]);
      } catch (err) {
        const errorMsg = {
          id: `msg-${Date.now() + 1}`,
          role: 'assistant' as const,
          content: 'I encountered a brief connection error. Focus on maintaining control of key squares and calculating forcing variations.',
        };
        setChatMessages([...updatedList, errorMsg]);
      } finally {
        setChatLoading(false);
      }
    },
    [chatMessages]
  );

  const clearHint = useCallback(() => {
    setCurrentHint(null);
    setCurrentHintStage(1);
    setHintError(null);
  }, []);

  return {
    // Hint
    loadingHint,
    hintError,
    currentHint,
    currentHintStage,
    requestHint,
    clearHint,

    // Position
    loadingPosition,
    positionError,
    positionExplanation,
    requestPositionExplanation,

    // Move
    loadingMove,
    moveExplanation,
    requestMoveExplanation,

    // Chat
    chatMessages,
    chatLoading,
    sendChatMessage,
  };
}
