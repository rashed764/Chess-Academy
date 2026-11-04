import { Router, type Request, type Response } from 'express';
import { isGeminiConfigured, COACH_MODEL } from './geminiClient';
import { createRateLimiter } from './rateLimiter';
import {
  validateFen,
  validateHintStage,
  validateText,
  validateMoveInPosition,
  validatePositionConsistency,
} from './validators';
import {
  generateCoachHint,
  explainPosition,
  explainMove,
  chatWithCoach,
} from './coachService';

export const coachRouter = Router();

// Apply rate limiter to all coach endpoints
coachRouter.use(createRateLimiter(60, 60 / (60 * 1000)));

/**
 * GET /api/coach/status
 * Returns current configuration status and model. Never exposes API key.
 */
coachRouter.get('/status', (_req: Request, res: Response) => {
  res.json({
    configured: isGeminiConfigured(),
    model: COACH_MODEL,
    provider: 'Google Gemini',
    serverTime: new Date().toISOString(),
  });
});


/**
 * POST /api/coach/hint
 * Request 3-stage progressive hint for training exercises.
 */
coachRouter.post('/hint', async (req: Request, res: Response): Promise<void> => {
  const { fen, objective, stage, expectedMoveSan, exerciseCategory } = req.body || {};

  const fenVal = validateFen(fen);
  if (!fenVal.valid || !fenVal.data) {
    res.status(400).json({ error: 'Invalid FEN', details: fenVal.error });
    return;
  }

  const stageVal = validateHintStage(stage);
  if (!stageVal.valid || !stageVal.data) {
    res.status(400).json({ error: 'Invalid Stage', details: stageVal.error });
    return;
  }

  const objVal = validateText(objective || 'Solve the exercise', 'objective', 1000);
  if (!objVal.valid || !objVal.data) {
    res.status(400).json({ error: 'Invalid Objective', details: objVal.error });
    return;
  }

  try {
    const hint = await generateCoachHint(
      fenVal.data,
      objVal.data,
      stageVal.data,
      typeof expectedMoveSan === 'string' ? expectedMoveSan.slice(0, 20) : undefined,
      typeof exerciseCategory === 'string' ? exerciseCategory.slice(0, 50) : undefined
    );
    res.json(hint);
  } catch (err) {
    res.status(500).json({
      error: 'Failed to generate hint',
      message: err instanceof Error ? err.message : String(err),
    });
  }
});

/**
 * POST /api/coach/explain-position
 * Request deep strategic & tactical positional breakdown.
 */
coachRouter.post('/explain-position', async (req: Request, res: Response): Promise<void> => {
  const { fen, evaluation, sideToMove, recentMovesSan } = req.body || {};

  const fenVal = validateFen(fen);
  if (!fenVal.valid || !fenVal.data) {
    res.status(400).json({ error: 'Invalid FEN', details: fenVal.error });
    return;
  }

  const cleanSide = sideToMove === 'b' ? 'b' : 'w';
  const cleanMoves = Array.isArray(recentMovesSan)
    ? recentMovesSan.slice(-10).map((m) => String(m).slice(0, 15))
    : [];

  try {
    const explanation = await explainPosition(
      fenVal.data,
      evaluation,
      cleanSide,
      cleanMoves
    );
    res.json(explanation);
  } catch (err) {
    res.status(500).json({
      error: 'Failed to explain position',
      message: err instanceof Error ? err.message : String(err),
    });
  }
});

/**
 * POST /api/coach/explain-move
 * Move quality classification and tactical analysis.
 */
coachRouter.post('/explain-move', async (req: Request, res: Response): Promise<void> => {
  const { fenBefore, fenAfter, moveSan, evalBefore, evalAfter } = req.body || {};

  const fenBVal = validateFen(fenBefore);
  if (!fenBVal.valid || !fenBVal.data) {
    res.status(400).json({ error: 'Invalid fenBefore', details: fenBVal.error });
    return;
  }

  const moveVal = validateMoveInPosition(fenBVal.data, moveSan);
  if (!moveVal.valid || !moveVal.data) {
    res.status(400).json({ error: 'Illegal Move', details: moveVal.error });
    return;
  }

  const fenAVal = validateFen(fenAfter);
  if (!fenAVal.valid || !fenAVal.data) {
    res.status(400).json({ error: 'Invalid fenAfter', details: fenAVal.error });
    return;
  }

  const consistency = validatePositionConsistency(fenBVal.data, moveVal.data.san, fenAVal.data);
  if (!consistency.valid) {
    res.status(400).json({ error: 'Inconsistent Move Sequence', details: consistency.error });
    return;
  }

  try {
    const result = await explainMove(
      fenBVal.data,
      fenAVal.data,
      moveVal.data.san,
      evalBefore,
      evalAfter
    );
    res.json(result);
  } catch (err) {
    res.status(500).json({
      error: 'Failed to explain move',
      message: err instanceof Error ? err.message : String(err),
    });
  }
});

/**
 * POST /api/coach/chat
 * Multi-turn dialogue with AI Coach.
 */
coachRouter.post('/chat', async (req: Request, res: Response): Promise<void> => {
  const { messages, fen, userColor } = req.body || {};

  const fenVal = validateFen(fen);
  if (!fenVal.valid || !fenVal.data) {
    res.status(400).json({ error: 'Invalid FEN', details: fenVal.error });
    return;
  }

  if (!Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: 'Messages must be a non-empty array' });
    return;
  }

  const cleanMessages = messages.slice(-10).map((m) => ({
    role: m.role === 'assistant' ? ('assistant' as const) : ('user' as const),
    content: String(m.content || '').slice(0, 1000),
  }));

  try {
    const reply = await chatWithCoach(
      cleanMessages,
      fenVal.data,
      userColor === 'b' ? 'b' : 'w'
    );
    res.json({ reply });
  } catch (err) {
    res.status(500).json({
      error: 'Failed to process chat message',
      message: err instanceof Error ? err.message : String(err),
    });
  }
});
