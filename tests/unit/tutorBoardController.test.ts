import test from 'node:test';
import assert from 'node:assert/strict';
import {
  TutorBoardController,
  INITIAL_TUTOR_BOARD_STATE,
  STARTING_FEN,
} from '../../src/features/tutor/models/tutorBoardController';

test('TutorBoardController: isValidSquare validates coordinates', () => {
  assert.equal(TutorBoardController.isValidSquare('e4'), true);
  assert.equal(TutorBoardController.isValidSquare('a1'), true);
  assert.equal(TutorBoardController.isValidSquare('h8'), true);
  assert.equal(TutorBoardController.isValidSquare('z9'), false);
  assert.equal(TutorBoardController.isValidSquare('e9'), false);
  assert.equal(TutorBoardController.isValidSquare(''), false);
});

test('TutorBoardController: isValidFen validates legal FEN strings', () => {
  assert.equal(TutorBoardController.isValidFen(STARTING_FEN), true);
  assert.equal(TutorBoardController.isValidFen('8/8/8/8/4P3/8/8/4K2k w - - 0 1'), true);
  assert.equal(TutorBoardController.isValidFen('invalid fen sequence'), false);
  assert.equal(TutorBoardController.isValidFen(''), false);
});

test('TutorBoardController: set_position applies valid FEN and resets highlights', () => {
  const customFen = 'rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2';
  const res = TutorBoardController.applyAction(INITIAL_TUTOR_BOARD_STATE, {
    type: 'set_position',
    fen: customFen,
    description: 'Sicilian Defense',
  });

  assert.equal(res.error, undefined);
  assert.equal(res.nextState.fen, customFen);
  assert.deepEqual(res.nextState.customHighlights, {});
  assert.deepEqual(res.nextState.customArrows, []);
});

test('TutorBoardController: set_position rejects malformed FEN', () => {
  const res = TutorBoardController.applyAction(INITIAL_TUTOR_BOARD_STATE, {
    type: 'set_position',
    fen: 'not-a-fen',
  });

  assert.ok(res.error);
  assert.equal(res.nextState.fen, STARTING_FEN);
});

test('TutorBoardController: move_piece executes valid legal move', () => {
  const res = TutorBoardController.applyAction(INITIAL_TUTOR_BOARD_STATE, {
    type: 'move_piece',
    from: 'e2',
    to: 'e4',
    explanation: 'King pawn opening',
  });

  assert.equal(res.error, undefined);
  assert.deepEqual(res.nextState.lastMove, { from: 'e2', to: 'e4' });
  assert.equal(res.nextState.moveHistory.length, 1);
  assert.equal(res.nextState.moveHistory[0].san, 'e4');
});

test('TutorBoardController: move_piece rejects illegal moves without breaking state', () => {
  const res = TutorBoardController.applyAction(INITIAL_TUTOR_BOARD_STATE, {
    type: 'move_piece',
    from: 'e2',
    to: 'e5', // Illegal for white pawn on move 1
  });

  assert.ok(res.error);
  assert.equal(res.nextState.fen, STARTING_FEN);
  assert.equal(res.nextState.moveHistory.length, 0);
});

test('TutorBoardController: highlights and arrows manage visual aids', () => {
  let state = INITIAL_TUTOR_BOARD_STATE;

  // Single highlight
  const h1 = TutorBoardController.applyAction(state, {
    type: 'highlight_square',
    square: 'e4',
  });
  state = h1.nextState;
  assert.ok(state.customHighlights['e4']);

  // Multiple highlights
  const h2 = TutorBoardController.applyAction(state, {
    type: 'highlight_squares',
    squares: ['d4', 'c4'],
  });
  state = h2.nextState;
  assert.ok(state.customHighlights['d4']);
  assert.ok(state.customHighlights['c4']);

  // Arrow
  const arr = TutorBoardController.applyAction(state, {
    type: 'show_arrow',
    from: 'g1',
    to: 'f3',
  });
  state = arr.nextState;
  assert.equal(state.customArrows.length, 1);
  assert.equal(state.customArrows[0][0], 'g1');
  assert.equal(state.customArrows[0][1], 'f3');

  // Clear
  const clrH = TutorBoardController.applyAction(state, { type: 'clear_highlights' });
  state = clrH.nextState;
  assert.deepEqual(state.customHighlights, {});

  const clrA = TutorBoardController.applyAction(state, { type: 'clear_arrows' });
  state = clrA.nextState;
  assert.deepEqual(state.customArrows, []);
});

test('TutorBoardController: flip_board toggles orientation', () => {
  const res1 = TutorBoardController.applyAction(INITIAL_TUTOR_BOARD_STATE, {
    type: 'flip_board',
  });
  assert.equal(res1.nextState.boardOrientation, 'black');

  const res2 = TutorBoardController.applyAction(res1.nextState, {
    type: 'flip_board',
    orientation: 'white',
  });
  assert.equal(res2.nextState.boardOrientation, 'white');
});

test('TutorBoardController: handleStudentMove validates exercises with target moves and opponent reply', () => {
  const exerciseState = TutorBoardController.applyAction(INITIAL_TUTOR_BOARD_STATE, {
    type: 'start_position_exercise',
    initialFen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4',
    targetMove: 'f3g5',
    opponentReply: 'd7d5',
    objective: 'Fried Liver setup: Attack f7 with Ng5!',
  }).nextState;

  assert.equal(exerciseState.mode, 'practice');
  assert.ok(exerciseState.activeExercise);

  // Incorrect move attempt
  const wrongAttempt = TutorBoardController.handleStudentMove(exerciseState, 'd2', 'd3');
  assert.equal(wrongAttempt.isValid, true);
  assert.equal(wrongAttempt.isCorrect, false);
  assert.equal(wrongAttempt.isExerciseCompleted, false);

  // Correct move attempt
  const correctAttempt = TutorBoardController.handleStudentMove(exerciseState, 'f3', 'g5');
  assert.equal(correctAttempt.isValid, true);
  assert.equal(correctAttempt.isCorrect, true);
  assert.equal(correctAttempt.isExerciseCompleted, true);
  assert.equal(correctAttempt.nextState.activeExercise?.completed, true);
});
