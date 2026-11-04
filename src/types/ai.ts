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

export type HintStage = 1 | 2 | 3;

export type MoveQuality = 
  | 'brilliant'
  | 'best'
  | 'good'
  | 'inaccuracy'
  | 'mistake'
  | 'blunder'
  | 'unclassified';

export interface ProgressiveHintResponse {
  stage: HintStage;
  title: string;
  hint: string;
  pedagogicalFocus: string;
  source: 'gemini' | 'local_fallback';
  targetSquare?: string;
}

export interface CoachPositionExplanationResponse {
  headline: string;
  positionalBreakdown: string[];
  tacticalOpportunities: string[];
  recommendedPlans: string[];
  strategicAdvice: string;
  evaluationSummary?: string;
  source: 'gemini' | 'local_fallback';
}

export interface CoachMoveExplanationResponse {
  quality: MoveQuality;
  scoreDifferenceCentipawns?: number;
  engineBestMoveSan?: string;
  explanation: string;
  keyTacticalRisk?: string;
  alternativeBetterLines?: string[];
  source: 'gemini' | 'local_fallback';
}

export interface CoachServerStatusResponse {
  configured: boolean;
  model: string;
  provider: string;
  serverTime: string;
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
  getProgressiveHint?(
    fen: string,
    objective: string,
    stage: HintStage,
    expectedMoveSan?: string,
    exerciseCategory?: string
  ): Promise<ProgressiveHintResponse>;
  explainPosition?(
    fen: string,
    evaluation?: EngineEvaluation,
    sideToMove?: ChessColor,
    recentMovesSan?: string[]
  ): Promise<CoachPositionExplanationResponse>;
  explainMove?(
    fenBefore: string,
    fenAfter: string,
    moveSan: string,
    evalBefore?: EngineEvaluation,
    evalAfter?: EngineEvaluation
  ): Promise<CoachMoveExplanationResponse>;
}

