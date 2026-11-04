import type {
  CoachServerStatusResponse,
  ProgressiveHintResponse,
  CoachPositionExplanationResponse,
  CoachMoveExplanationResponse,
  HintStage,
} from '../../types/ai';
import type { EngineEvaluation, ChessColor } from '../../types/chess';


const REQUEST_TIMEOUT_MS = 15000;

async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs = REQUEST_TIMEOUT_MS): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(id);
  }
}

async function retryWithBackoff<T>(fn: () => Promise<T>, retries = 2, delay = 500): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    if (retries <= 0) throw err;
    await new Promise((res) => setTimeout(res, delay));
    return retryWithBackoff(fn, retries - 1, delay * 2);
  }
}

export class CoachApiClient {
  private baseUrl = '/api/coach';

  async getStatus(): Promise<CoachServerStatusResponse> {
    const res = await fetchWithTimeout(`${this.baseUrl}/status`, { method: 'GET' });
    if (!res.ok) {
      throw new Error(`Failed to fetch coach status: ${res.statusText}`);
    }
    return res.json();
  }

  async getHint(
    fen: string,
    objective: string,
    stage: HintStage,
    expectedMoveSan?: string,
    exerciseCategory?: string
  ): Promise<ProgressiveHintResponse> {
    return retryWithBackoff(async () => {
      const res = await fetchWithTimeout(`${this.baseUrl}/hint`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fen, objective, stage, expectedMoveSan, exerciseCategory }),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Hint request failed with status ${res.status}`);
      }
      return res.json();
    });
  }

  async explainPosition(
    fen: string,
    evaluation?: EngineEvaluation,
    sideToMove?: ChessColor,
    recentMovesSan?: string[]
  ): Promise<CoachPositionExplanationResponse> {
    return retryWithBackoff(async () => {
      const res = await fetchWithTimeout(`${this.baseUrl}/explain-position`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fen, evaluation, sideToMove, recentMovesSan }),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Position explanation failed with status ${res.status}`);
      }
      return res.json();
    });
  }

  async explainMove(
    fenBefore: string,
    fenAfter: string,
    moveSan: string,
    evalBefore?: EngineEvaluation,
    evalAfter?: EngineEvaluation
  ): Promise<CoachMoveExplanationResponse> {
    return retryWithBackoff(async () => {
      const res = await fetchWithTimeout(`${this.baseUrl}/explain-move`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fenBefore, fenAfter, moveSan, evalBefore, evalAfter }),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Move explanation failed with status ${res.status}`);
      }
      return res.json();
    });
  }

  async sendChat(
    messages: Array<{ role: 'user' | 'assistant'; content: string }>,
    fen: string,
    userColor: ChessColor = 'w'
  ): Promise<string> {
    return retryWithBackoff(async () => {
      const res = await fetchWithTimeout(`${this.baseUrl}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages, fen, userColor }),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Chat request failed with status ${res.status}`);
      }
      const data = await res.json();
      return data.reply;
    });
  }
}

export const coachApiClient = new CoachApiClient();
