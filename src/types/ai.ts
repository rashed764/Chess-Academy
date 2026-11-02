/**
 * Provider-independent AI coaching, advice models, and service interfaces.
 * Cloud AI providers remain strictly separated from local chess engine logic.
 */

import type { ChessColor, EngineEvaluation, MoveRecord } from './chess';

export type AICoachPersonality = 'grandmaster' | 'patient_tutor' | 'tactician' | 'analytical';

export type AIAdviceCategory = 
  | 'opening_principle'
  | 'tactical_blunder'
  | 'positional_insight'
  | 'endgame_technique'
  | 'psychological'
  | 'praise';

export interface AICoachFeedback {
  id: string;
  category: AIAdviceCategory;
  headline: string;
  summary: string;
  detailedAnalysis?: string;
  recommendedMoveSan?: string;
  alternativeMoveSan?: string;
  keySquareHighlighted?: string;
  scoreSwing?: number;
  coachComment: string;
}

export interface AICoachPromptContext {
  fen: string;
  lastMove?: MoveRecord;
  moveHistorySan: string[];
  evaluation?: EngineEvaluation;
  userRating?: number;
  userColor: ChessColor;
  coachPersonality: AICoachPersonality;
}

export interface AIChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  relatedFen?: string;
  feedbackMetadata?: AICoachFeedback;
}

export interface AIProviderCapabilities {
  supportsStreaming: boolean;
  supportsRealtimeLive: boolean;
  supportsMoveExplanation: boolean;
  modelIdentifier: string;
}

/**
 * Adapter interface for future Cloud AI integrations.
 * Allows seamless switching or mocking without coupling UI to a specific SDK.
 */
export interface IAIProviderAdapter {
  readonly providerName: string;
  getCapabilities(): AIProviderCapabilities;
  isReady(): Promise<boolean>;
  generateCoachAdvice(context: AICoachPromptContext): Promise<AICoachFeedback>;
  sendChatMessage(messages: AIChatMessage[], context?: AICoachPromptContext): Promise<string>;
  streamChatMessage?(
    messages: AIChatMessage[],
    onChunk: (chunk: string) => void,
    context?: AICoachPromptContext
  ): Promise<void>;
}
