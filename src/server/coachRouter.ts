import { Router, type Request, type Response } from 'express';
import {
  isGeminiConfigured,
  getActiveModel,
  listAvailableModels,
  COACH_MODEL,
} from './geminiClient';
import {
  getConfigStatus,
  setApiKey,
  removeApiKey,
  setActiveModelId,
} from './configManager';
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
import { executeTutorTurn } from './tutorService';

export const coachRouter = Router();

// Apply rate limiter to all coach endpoints
coachRouter.use(createRateLimiter(60, 60 / (60 * 1000)));

/**
 * GET /api/coach/status
 * Returns current configuration status and model. Never exposes API key.
 */
coachRouter.get('/status', (_req: Request, res: Response) => {
  const status = getConfigStatus();
  res.json({
    configured: isGeminiConfigured(),
    model: getActiveModel(),
    maskedKey: status.maskedKey,
    isCustomKey: status.isCustomKey,
    provider: 'Google Gemini',
    serverTime: new Date().toISOString(),
  });
});

/**
 * GET /api/coach/config
 * Returns current encrypted storage configuration status.
 */
coachRouter.get('/config', (_req: Request, res: Response) => {
  res.json(getConfigStatus());
});

/**
 * POST /api/coach/config/key
 * Saves and encrypts a user-supplied Gemini API key.
 */
coachRouter.post('/config/key', (req: Request, res: Response): void => {
  const { apiKey } = req.body || {};
  if (typeof apiKey !== 'string' || apiKey.trim() === '') {
    res.status(400).json({ error: 'Invalid API Key', message: 'API key must be a non-empty string.' });
    return;
  }

  try {
    setApiKey(apiKey);
    res.json({
      success: true,
      message: 'API Key saved and encrypted successfully.',
      status: getConfigStatus(),
    });
  } catch (err) {
    res.status(500).json({
      error: 'Failed to save API Key',
      message: err instanceof Error ? err.message : String(err),
    });
  }
});

/**
 * DELETE /api/coach/config/key
 * Removes custom API key from server encrypted storage.
 */
coachRouter.delete('/config/key', (_req: Request, res: Response): void => {
  try {
    removeApiKey();
    res.json({
      success: true,
      message: 'Custom API Key removed.',
      status: getConfigStatus(),
    });
  } catch (err) {
    res.status(500).json({
      error: 'Failed to remove API Key',
      message: err instanceof Error ? err.message : String(err),
    });
  }
});

/**
 * POST /api/coach/config/test
 * Tests connection to Gemini API using current or candidate key.
 */
coachRouter.post('/config/test', async (req: Request, res: Response): Promise<void> => {
  const { apiKey } = req.body || {};
  const testKey = typeof apiKey === 'string' && apiKey.trim() !== '' ? apiKey.trim() : undefined;

  try {
    const models = await listAvailableModels(testKey);
    res.json({
      success: true,
      message: 'Connection to Gemini API verified successfully.',
      modelCount: models.length,
      sampleModel: models[0]?.id || COACH_MODEL,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: 'Gemini Connection Test Failed',
      message: err instanceof Error ? err.message : String(err),
    });
  }
});

/**
 * GET /api/coach/config/models
 * Dynamically fetches available text generation models from Gemini API.
 */
coachRouter.get('/config/models', async (_req: Request, res: Response): Promise<void> => {
  try {
    const models = await listAvailableModels();
    res.json({
      models,
      activeModelId: getActiveModel(),
    });
  } catch (err) {
    res.status(500).json({
      error: 'Failed to list models',
      message: err instanceof Error ? err.message : String(err),
    });
  }
});

/**
 * POST /api/coach/config/model
 * Sets the active Gemini model ID.
 */
coachRouter.post('/config/model', (req: Request, res: Response): void => {
  const { modelId } = req.body || {};
  if (typeof modelId !== 'string' || modelId.trim() === '') {
    res.status(400).json({ error: 'Invalid Model ID', message: 'Model ID must be a non-empty string.' });
    return;
  }

  try {
    setActiveModelId(modelId);
    res.json({
      success: true,
      activeModelId: getActiveModel(),
      message: `Active AI model set to ${modelId}`,
    });
  } catch (err) {
    res.status(500).json({
      error: 'Failed to set active model',
      message: err instanceof Error ? err.message : String(err),
    });
  }
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

/**
 * POST /api/coach/tutor-turn
 * Autonomous AI Tutor conversational turn with structured tool calling & board manipulation.
 */
coachRouter.post('/tutor-turn', async (req: Request, res: Response): Promise<void> => {
  const { messages, boardState, learnerContext } = req.body || {};

  if (!Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: 'Messages must be a non-empty array' });
    return;
  }

  const safeFen = typeof boardState?.fen === 'string' ? boardState.fen : 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
  const fenVal = validateFen(safeFen);

  const cleanRequest = {
    messages: messages.slice(-12).map((m: any) => ({
      role: m.role === 'assistant' ? ('assistant' as const) : m.role === 'system' ? ('system' as const) : ('user' as const),
      content: String(m.content || '').slice(0, 1500),
    })),
    boardState: {
      fen: fenVal.valid && fenVal.data ? fenVal.data : 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      mode: boardState?.mode || 'free_play',
      boardOrientation: boardState?.boardOrientation === 'black' ? ('black' as const) : ('white' as const),
      lastMove: boardState?.lastMove,
      activeLessonId: boardState?.activeLessonId,
      activeExerciseObjective: boardState?.activeExerciseObjective,
    },
    learnerContext: {
      currentLevelId: learnerContext?.currentLevelId || 'level-1-absolute-beginner',
      completedLessonIds: Array.isArray(learnerContext?.completedLessonIds) ? learnerContext.completedLessonIds : [],
      isAssessed: Boolean(learnerContext?.isAssessed),
      assessedLevelId: learnerContext?.assessedLevelId,
      assessmentStage: learnerContext?.assessmentStage,
      userName: learnerContext?.userName,
    },
  };

  try {
    const result = await executeTutorTurn(cleanRequest);
    res.json(result);
  } catch (err) {
    res.status(500).json({
      error: 'Failed to execute tutor turn',
      message: err instanceof Error ? err.message : String(err),
    });
  }
});

