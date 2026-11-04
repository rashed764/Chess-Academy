/**
 * Provider-independent Cloud AI architecture.
 * Separates local chess rules/evaluations from cloud AI coaching models.
 * Backed by server-side Gemini 3.8 Flash with local fallback.
 */

import type {
  AIChatMessage,
  AICoachFeedback,
  AICoachPromptContext,
  AIProviderCapabilities,
  IAIProviderAdapter,
  HintStage,
  ProgressiveHintResponse,
  CoachPositionExplanationResponse,
  CoachMoveExplanationResponse,
} from '../../types/ai';
import type { EngineEvaluation, ChessColor } from '../../types/chess';
import { coachApiClient } from './coachClient';

export class ServerAICoachAdapter implements IAIProviderAdapter {
  readonly providerName = 'Server AI Coach (Gemini 3.8 Flash)';

  getCapabilities(): AIProviderCapabilities {
    return {
      supportsStreaming: false,
      supportsRealtimeLive: false,
      supportsMoveExplanation: true,
      modelIdentifier: 'gemini-3.8-flash',
    };
  }

  async isReady(): Promise<boolean> {
    try {
      const status = await coachApiClient.getStatus();
      return Boolean(status && status.configured);
    } catch {
      return false;
    }
  }

  async generateCoachAdvice(context: AICoachPromptContext): Promise<AICoachFeedback> {
    const explanation = await coachApiClient.explainPosition(
      context.fen,
      context.evaluation,
      context.userColor,
      context.moveHistorySan
    );

    return {
      id: `coach-advice-${Date.now()}`,
      category: 'positional_insight',
      headline: explanation.headline,
      summary: explanation.strategicAdvice,
      detailedAnalysis: explanation.positionalBreakdown.join(' '),
      coachComment: explanation.strategicAdvice,
    };
  }

  async sendChatMessage(messages: AIChatMessage[], context?: AICoachPromptContext): Promise<string> {
    const formatted = messages.map((m) => ({
      role: m.sender === 'assistant' ? ('assistant' as const) : ('user' as const),
      content: m.content,
    }));
    const fen = context?.fen || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    const userColor = context?.userColor || 'w';
    return coachApiClient.sendChat(formatted, fen, userColor);
  }

  async getProgressiveHint(
    fen: string,
    objective: string,
    stage: HintStage,
    expectedMoveSan?: string,
    exerciseCategory?: string
  ): Promise<ProgressiveHintResponse> {
    return coachApiClient.getHint(fen, objective, stage, expectedMoveSan, exerciseCategory);
  }

  async explainPosition(
    fen: string,
    evaluation?: EngineEvaluation,
    sideToMove?: ChessColor,
    recentMovesSan?: string[]
  ): Promise<CoachPositionExplanationResponse> {
    return coachApiClient.explainPosition(fen, evaluation, sideToMove, recentMovesSan);
  }

  async explainMove(
    fenBefore: string,
    fenAfter: string,
    moveSan: string,
    evalBefore?: EngineEvaluation,
    evalAfter?: EngineEvaluation
  ): Promise<CoachMoveExplanationResponse> {
    return coachApiClient.explainMove(fenBefore, fenAfter, moveSan, evalBefore, evalAfter);
  }
}

export class UnconfiguredAIAdapter implements IAIProviderAdapter {
  readonly providerName = 'Cloud AI Adapter (Pending Configuration)';

  getCapabilities(): AIProviderCapabilities {
    return {
      supportsStreaming: false,
      supportsRealtimeLive: false,
      supportsMoveExplanation: false,
      modelIdentifier: 'none',
    };
  }

  async isReady(): Promise<boolean> {
    return false;
  }

  async generateCoachAdvice(_context: AICoachPromptContext): Promise<AICoachFeedback> {
    throw new Error('AI Coach service is not connected in Task 01 foundation.');
  }

  async sendChatMessage(_messages: AIChatMessage[], _context?: AICoachPromptContext): Promise<string> {
    throw new Error('AI Chat messaging is scheduled for subsequent task implementation.');
  }
}

let activeAIAdapter: IAIProviderAdapter | null = null;

export function getAIProviderAdapter(): IAIProviderAdapter {
  if (!activeAIAdapter) {
    activeAIAdapter = new UnconfiguredAIAdapter();
  }
  return activeAIAdapter;
}

export function registerAIProviderAdapter(adapter: IAIProviderAdapter): void {
  activeAIAdapter = adapter;
}

