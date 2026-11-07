import test from 'node:test';
import assert from 'node:assert/strict';
import { executeTutorTurn } from '../../src/server/tutorService';
import type { TutorTurnRequest } from '../../src/features/tutor/types';

test('executeTutorTurn: local fallback generates knight movement demonstration and exercise', async () => {
  const req: TutorTurnRequest = {
    messages: [{ role: 'user', content: 'Show me how the knight moves and jumps!' }],
    boardState: {
      fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      mode: 'free_play',
      boardOrientation: 'white',
    },
    learnerContext: {
      currentLevelId: 'level-1-absolute-beginner',
      completedLessonIds: [],
      isAssessed: false,
    },
  };

  const response = await executeTutorTurn(req);
  assert.ok(response.message.length > 20);
  assert.ok(response.boardActions.length >= 3);

  const hasSetPosition = response.boardActions.some((a) => a.type === 'set_position');
  const hasHighlight = response.boardActions.some((a) => a.type === 'highlight_squares');
  const hasMove = response.boardActions.some((a) => a.type === 'move_piece');
  const hasExercise = response.boardActions.some((a) => a.type === 'start_position_exercise');

  assert.equal(hasSetPosition, true);
  assert.equal(hasHighlight, true);
  assert.equal(hasMove, true);
  assert.equal(hasExercise, true);
  assert.ok(response.suggestedReplies.length >= 2);
});

test('executeTutorTurn: local fallback handles castling demonstration', async () => {
  const req: TutorTurnRequest = {
    messages: [{ role: 'user', content: 'Can you teach me castling rules?' }],
    boardState: {
      fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      mode: 'free_play',
      boardOrientation: 'white',
    },
    learnerContext: {
      currentLevelId: 'level-1-absolute-beginner',
      completedLessonIds: [],
      isAssessed: false,
    },
  };

  const response = await executeTutorTurn(req);
  assert.ok(response.message.toLowerCase().includes('castle'));

  const moveAction = response.boardActions.find((a) => a.type === 'move_piece');
  assert.ok(moveAction && moveAction.type === 'move_piece');
  assert.equal(moveAction.from, 'e1');
  assert.equal(moveAction.to, 'g1');
});

test('executeTutorTurn: local fallback handles assessment request', async () => {
  const req: TutorTurnRequest = {
    messages: [{ role: 'user', content: 'I want to assess my chess skill' }],
    boardState: {
      fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      mode: 'free_play',
      boardOrientation: 'white',
    },
    learnerContext: {
      currentLevelId: 'level-1-absolute-beginner',
      completedLessonIds: [],
      isAssessed: false,
    },
  };

  const response = await executeTutorTurn(req);
  assert.ok(response.orchestratorActions.some((a) => a.type === 'start_initial_assessment'));
});

test('executeTutorTurn: local fallback handles Test Arena transition prompt', async () => {
  const req: TutorTurnRequest = {
    messages: [{ role: 'user', content: 'Am I ready for Test Arena?' }],
    boardState: {
      fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      mode: 'free_play',
      boardOrientation: 'white',
    },
    learnerContext: {
      currentLevelId: 'level-2-elementary',
      completedLessonIds: ['l-101', 'l-102', 'l-103'],
      isAssessed: true,
    },
  };

  const response = await executeTutorTurn(req);
  assert.ok(response.orchestratorActions.some((a) => a.type === 'prompt_test_arena'));
});
