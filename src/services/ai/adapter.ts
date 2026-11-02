/**
 * Provider-independent Cloud AI architecture.
 * Separates local chess rules/evaluations from cloud AI coaching models.
 * Ready for future backend/server-side Gemini integration.
 */

import type {
  AIChatMessage,
  AICoachFeedback,
  AICoachPromptContext,
  AIProviderCapabilities,
  IAIProviderAdapter,
} from '../../types/ai';

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
