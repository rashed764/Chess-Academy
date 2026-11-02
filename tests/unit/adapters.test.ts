import test from 'node:test';
import assert from 'node:assert/strict';
import { getChessEngine, UnconfiguredChessEngineAdapter } from '../../src/services/chess/adapter';
import { getAIProviderAdapter, UnconfiguredAIAdapter } from '../../src/services/ai/adapter';

test('ChessEngineAdapter maintains uninitialized state in Task 01', async () => {
  const engine = getChessEngine();
  assert.equal(engine.status, 'uninitialized');
  assert.equal(await engine.isReady(), false);

  // Verifies that uninitialized engine does not fake evaluations
  await assert.rejects(
    async () => {
      await engine.evaluatePosition('some-fen');
    },
    {
      message: /Stockfish evaluation is scheduled for Task 03 implementation/,
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
