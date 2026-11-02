import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getChessEngine,
  StockfishChessEngineAdapter,
  UnconfiguredChessEngineAdapter,
} from '../../src/services/chess/adapter';
import { getAIProviderAdapter, UnconfiguredAIAdapter } from '../../src/services/ai/adapter';

test('StockfishChessEngineAdapter maintains uninitialized state until init()', async () => {
  const engine = new StockfishChessEngineAdapter();
  assert.equal(engine.status, 'uninitialized');
  assert.equal(await engine.isReady(), false);

  // Verifies that uninitialized engine does not fake evaluations
  await assert.rejects(
    async () => {
      await engine.evaluatePosition('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
    },
    {
      message: /Stockfish engine has not been initialized/,
    }
  );

  // Verifies that uninitialized engine does not fake best moves
  await assert.rejects(
    async () => {
      await engine.findBestMove('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
    },
    {
      message: /Stockfish engine has not been initialized/,
    }
  );
});

test('UnconfiguredChessEngineAdapter correctly enforces boundary constraints', async () => {
  const fallback = new UnconfiguredChessEngineAdapter();
  assert.equal(fallback.status, 'uninitialized');
  assert.equal(await fallback.isReady(), false);

  await assert.rejects(
    async () => {
      await fallback.evaluatePosition('some-fen');
    },
    {
      message: /Stockfish evaluation requires engine initialization/,
    }
  );
});

test('AIProviderAdapter maintains unconfigured state in Task 01', async () => {
  const ai = getAIProviderAdapter();
  assert.equal(await ai.isReady(), false);
  assert.equal(ai.getCapabilities().supportsStreaming, false);

  await assert.rejects(
    async () => {
      await ai.generateCoachAdvice({
        fen: 'startpos',
        moveHistorySan: [],
        userColor: 'w',
        coachPersonality: 'grandmaster',
      });
    },
    {
      message: /AI Coach service is not connected in Task 01 foundation/,
    }
  );
});
