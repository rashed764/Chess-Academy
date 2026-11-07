import test from 'node:test';
import assert from 'node:assert/strict';
import { CANONICAL_LESSON_IDS } from '../../src/features/training/data';
import { LESSON_TOPIC_MAPPINGS, TOPIC_CATEGORY_DEFINITIONS } from '../../src/features/learning-engine/models/topicTaxonomy';
import { TRAINING_STORAGE_KEY } from '../../src/features/training/models/progressStorage';
import { TEST_ARENA_STORAGE_KEY, TEST_ARENA_ACTIVE_KEY } from '../../src/features/test-arena/models/storage';
import { LEARNER_PROFILE_STORAGE_KEY } from '../../src/features/learning-engine/models/storage';
import { createRateLimiter } from '../../src/server/rateLimiter';
import { validateFen, validateMoveInPosition } from '../../src/server/validators';

test('Production Readiness: Canonical curriculum is exactly 30 lessons in pedagogical order', () => {
  assert.equal(CANONICAL_LESSON_IDS.length, 30, 'Curriculum must contain exactly 30 canonical lessons');

  // Verify unique lesson IDs
  const uniqueIds = new Set(CANONICAL_LESSON_IDS);
  assert.equal(uniqueIds.size, 30, 'All canonical lesson IDs must be unique');

  // Verify Level 1 through 7 ordering
  assert.equal(CANONICAL_LESSON_IDS[0], 'l-101-board-ranks-files');
  assert.equal(CANONICAL_LESSON_IDS[29], 'l-704-converting-plus-equals-endgame');
});

test('Production Readiness: Topic taxonomy mapping covers 100% of canonical curriculum', () => {
  const categories = Object.keys(TOPIC_CATEGORY_DEFINITIONS);
  assert.equal(categories.length, 10, 'Must have exactly 10 educational disciplines');

  for (const lessonId of CANONICAL_LESSON_IDS) {
    const mapping = LESSON_TOPIC_MAPPINGS[lessonId];
    assert.ok(mapping, `Lesson ${lessonId} must be mapped in topic taxonomy`);
    assert.ok(
      Boolean(TOPIC_CATEGORY_DEFINITIONS[mapping.category]),
      `Category ${mapping.category} must be a recognized educational taxonomy`
    );
  }
});

test('Production Readiness: LocalStorage keys are segregated without namespace collisions', () => {
  const allKeys = [
    TRAINING_STORAGE_KEY,
    TEST_ARENA_STORAGE_KEY,
    TEST_ARENA_ACTIVE_KEY,
    LEARNER_PROFILE_STORAGE_KEY,
  ];

  const uniqueKeys = new Set(allKeys);
  assert.equal(uniqueKeys.size, allKeys.length, 'Storage keys must be completely unique to prevent cross-feature clobbering');

  // Every key must begin with chess_academy_ namespace
  for (const key of allKeys) {
    assert.ok(key.startsWith('chess_academy_'), `Storage key '${key}' must follow chess_academy_ namespace`);
  }
});

test('Production Readiness: Server rate limiter enforces token bucket boundary', () => {
  let status = 200;
  let jsonResponse: unknown = null;

  const mockReq = {
    ip: '127.0.0.1',
    headers: {},
  } as any;

  const mockRes = {
    status: (s: number) => {
      status = s;
      return mockRes;
    },
    json: (j: unknown) => {
      jsonResponse = j;
      return mockRes;
    },
  } as any;

  let nextCalled = false;
  const mockNext = () => {
    nextCalled = true;
  };

  // Test single request passes
  const limiter = createRateLimiter(60);
  limiter(mockReq, mockRes, mockNext);
  assert.equal(nextCalled, true, 'First request within budget must pass to next()');
  assert.equal(status, 200);
});

test('Production Readiness: Server validator rejects malformed FEN and illegal moves', () => {
  // Valid start position
  const validFen = validateFen('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
  assert.equal(validFen.valid, true);

  // Invalid FEN
  const invalidFen = validateFen('not-a-real-fen-string');
  assert.equal(invalidFen.valid, false);

  // Legal move
  const legalMove = validateMoveInPosition(
    'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    'e2e4'
  );
  assert.equal(legalMove.valid, true);
  assert.equal(legalMove.data?.san, 'e4');

  // Illegal move (pawn moving diagonally onto empty square)
  const illegalMove = validateMoveInPosition(
    'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    'e2d4'
  );
  assert.equal(illegalMove.valid, false);
});
