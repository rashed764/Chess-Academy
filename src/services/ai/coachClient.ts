import type {
  CoachServerStatusResponse,
  ProgressiveHintResponse,
  CoachPositionExplanationResponse,
  CoachMoveExplanationResponse,
  HintStage,
} from '../../types/ai';
import type { EngineEvaluation, ChessColor } from '../../types/chess';


export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly isTransient: boolean = false
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

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
    // Never retry permanent client errors (400, 401, 403, 404, 429)
    if (err instanceof ApiError && !err.isTransient) {
      throw err;
    }
    // Also do not retry client-side aborts / manual cancellations
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw err;
    }
    if (retries <= 0) throw err;
    await new Promise((res) => setTimeout(res, delay));
    return retryWithBackoff(fn, retries - 1, delay * 2);
  }
}

async function handleResponseJson<T>(res: Response, fallbackDesc: string): Promise<T> {
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const message = errorData.error || errorData.message || `${fallbackDesc} failed with status ${res.status}`;
    // Only 502, 503, 504 are transient
    const isTransient = res.status === 502 || res.status === 503 || res.status === 504;
    throw new ApiError(res.status, message, isTransient);
  }
  return res.json();
}

export class CoachApiClient {
  private baseUrl = '/api/coach';

  async getStatus(): Promise<CoachServerStatusResponse> {
    const res = await fetchWithTimeout(`${this.baseUrl}/status`, { method: 'GET' });
    return handleResponseJson<CoachServerStatusResponse>(res, 'Fetch coach status');
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
      return handleResponseJson<ProgressiveHintResponse>(res, 'Hint request');
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
      return handleResponseJson<CoachPositionExplanationResponse>(res, 'Position explanation');
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
      return handleResponseJson<CoachMoveExplanationResponse>(res, 'Move explanation');
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
      const data = await handleResponseJson<{ reply: string }>(res, 'Chat request');
      return data.reply;
    });
  }
}

export const coachApiClient = new CoachApiClient();

