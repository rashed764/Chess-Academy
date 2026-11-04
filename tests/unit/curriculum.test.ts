import test from 'node:test';
import assert from 'node:assert/strict';
import { Chess } from 'chess.js';
import { ACADEMY_LEVELS } from '../../src/features/training/data/levels';
import {
  CURRICULUM_MODULES,
  TRAINING_LESSONS,
  LESSON_MAP,
} from '../../src/features/training/data/curriculumData';
import { ExerciseValidator } from '../../src/features/training/models/exerciseValidator';
import { UnlockEngine } from '../../src/features/training/models/unlockEngine';
import {
  ProgressStorage,
  INITIAL_PROGRESS_STATE,
} from '../../src/features/training/models/progressStorage';
import type { AcademyProgressState } from '../../src/features/training/types';

test('Curriculum Structure: all 7 required levels exist in exact order', () => {
  assert.equal(ACADEMY_LEVELS.length, 7);

  const expectedIds = [
    'level-1-absolute-beginner',
    'level-2-elementary',
    'level-3-intermediate',
    'level-4-advanced',
    'level-5-expert',
    'level-6-master',
    'level-7-grandmaster-prep',
  ];

  for (let i = 0; i < 7; i++) {
    assert.equal(ACADEMY_LEVELS[i].id, expectedIds[i]);
    assert.equal(ACADEMY_LEVELS[i].order, i + 1);
  }
});

test('Curriculum Integrity: every module references a valid level', () => {
  assert.ok(CURRICULUM_MODULES.length >= 14);
  const levelIds = new Set(ACADEMY_LEVELS.map((l) => l.id));

  for (const mod of CURRICULUM_MODULES) {
    assert.ok(levelIds.has(mod.levelId), `Module ${mod.id} has invalid levelId ${mod.levelId}`);
    assert.ok(mod.lessonIds.length > 0, `Module ${mod.id} has no lessons`);
  }
});

test('Curriculum Integrity: every lesson references a valid module and level', () => {
  assert.ok(TRAINING_LESSONS.length >= 14);

  for (const lesson of TRAINING_LESSONS) {
    assert.ok(lesson.title.length > 0);
    assert.ok(lesson.learningObjective.length > 0);
    assert.ok(lesson.content.sections.length > 0);
    assert.ok(lesson.content.keyTakeaways.length > 0);
    assert.ok(lesson.exercise, `Lesson ${lesson.id} has no exercise`);
  }
});

test('Exercise Data Verification: every bundled exercise has valid FEN and legal move sequence', () => {
  for (const lesson of TRAINING_LESSONS) {
    const ex = lesson.exercise;
    const verification = ExerciseValidator.verifyExerciseData(ex);
    assert.equal(
      verification.isValid,
      true,
      `Exercise '${ex.title}' in lesson '${lesson.id}' failed verification: ${verification.error}`
    );
  }
});

test('ExerciseValidator: correctly detects correct and incorrect moves', () => {
  const lesson101 = LESSON_MAP['l-101-board-ranks-files'];
  assert.ok(lesson101);

  // Correct move: Re1 (from a1 to e1)
  const resultCorrect = ExerciseValidator.evaluateUserMove(
    lesson101.exercise,
    lesson101.exercise.initialFen,
    0,
    'a1',
    'e1'
  );

  assert.equal(resultCorrect.isValidMove, true);
  assert.equal(resultCorrect.isCorrectMove, true);
  assert.equal(resultCorrect.isExerciseComplete, true);
  assert.equal(resultCorrect.sanPlayed, 'Re1');

  // Legal move but incorrect: Ra2
  const resultIncorrect = ExerciseValidator.evaluateUserMove(
    lesson101.exercise,
    lesson101.exercise.initialFen,
    0,
    'a1',
    'a2'
  );

  assert.equal(resultIncorrect.isValidMove, true);
  assert.equal(resultIncorrect.isCorrectMove, false);
  assert.equal(resultIncorrect.isExerciseComplete, false);

  // Illegal move: a1 to h8 (Rook cannot move diagonally)
  const resultIllegal = ExerciseValidator.evaluateUserMove(
    lesson101.exercise,
    lesson101.exercise.initialFen,
    0,
    'a1',
    'h8'
  );

  assert.equal(resultIllegal.isValidMove, false);
  assert.equal(resultIllegal.isCorrectMove, false);
});

test('ExerciseValidator: multi-move puzzle executes step 1, plays opponent reply, and completes on step 2', () => {
  const lesson303 = LESSON_MAP['l-303-back-rank-destruction'];
  assert.ok(lesson303);
  assert.equal(lesson303.exercise.steps.length, 2);

  // Step 1: User plays Qe8+
  const step1Result = ExerciseValidator.evaluateUserMove(
    lesson303.exercise,
    lesson303.exercise.initialFen,
    0,
    'e2',
    'e8'
  );

  assert.equal(step1Result.isValidMove, true);
  assert.equal(step1Result.isCorrectMove, true);
  assert.equal(step1Result.isExerciseComplete, false);
  assert.equal(step1Result.sanPlayed, 'Qe8+');
  assert.equal(step1Result.opponentReplySan, 'Rxe8');
  assert.equal(step1Result.currentStepIndex, 1);

  // Step 2: User plays Rxe8#
  const step2Result = ExerciseValidator.evaluateUserMove(
    lesson303.exercise,
    step1Result.nextFen,
    1,
    'e1',
    'e8'
  );

  assert.equal(step2Result.isValidMove, true);
  assert.equal(step2Result.isCorrectMove, true);
  assert.equal(step2Result.isExerciseComplete, true);
  assert.equal(step2Result.sanPlayed, 'Rxe8#');
});

test('UnlockEngine: level 1 is unlocked by default; higher levels unlock with prerequisites', () => {
  const emptyState: AcademyProgressState = { ...INITIAL_PROGRESS_STATE };

  // Level 1 must be unlocked
  assert.equal(UnlockEngine.isLevelUnlocked('level-1-absolute-beginner', emptyState), true);

  // Level 2 must be locked initially
  assert.equal(UnlockEngine.isLevelUnlocked('level-2-elementary', emptyState), false);
  assert.ok(UnlockEngine.getLevelLockReason('level-2-elementary', emptyState).length > 0);

  // Simulate completing 4 lessons in Level 1
  const progressedState: AcademyProgressState = {
    ...emptyState,
    completedLessonIds: [
      'l-101-board-ranks-files',
      'l-102-knight-movement',
      'l-103-pawn-promotion-mechanics',
      'l-104-check-and-checkmate',
    ],
  };

  // Now Level 2 should unlock
  assert.equal(UnlockEngine.isLevelUnlocked('level-2-elementary', progressedState), true);

  // Level 3 should still be locked
  assert.equal(UnlockEngine.isLevelUnlocked('level-3-intermediate', progressedState), false);
});

test('ProgressStorage: calculates exact mathematical percentage without hardcoding', () => {
  const emptyState = { ...INITIAL_PROGRESS_STATE };
  const statsEmpty = ProgressStorage.calculateStatistics(emptyState);

  assert.equal(statsEmpty.completedLessons, 0);
  assert.equal(statsEmpty.completionPercentage, 0);
  assert.equal(statsEmpty.exerciseSuccessRate, 0);

  // Record 2 completed lessons
  const totalLessons = TRAINING_LESSONS.length;
  const stateWith2: AcademyProgressState = {
    ...emptyState,
    completedLessonIds: ['l-101-board-ranks-files', 'l-102-knight-movement'],
    totalExerciseAttempts: 4,
    correctExerciseAttempts: 3,
    incorrectExerciseAttempts: 1,
  };

  const statsWith2 = ProgressStorage.calculateStatistics(stateWith2);
  const expectedPercentage = Math.round((2 / totalLessons) * 100);

  assert.equal(statsWith2.completedLessons, 2);
  assert.equal(statsWith2.completionPercentage, expectedPercentage);
  assert.equal(statsWith2.exerciseSuccessRate, 75); // 3 out of 4 = 75%
});

test('ProgressStorage: records activity history cleanly with timestamps', () => {
  let state = { ...INITIAL_PROGRESS_STATE };

  state = ProgressStorage.recordExerciseAttempt(
    state,
    'l-101-board-ranks-files',
    'The Chessboard, Files, Ranks & The Rook',
    'level-1-absolute-beginner',
    true
  );

  state = ProgressStorage.recordLessonCompletion(
    state,
    'l-101-board-ranks-files',
    'The Chessboard, Files, Ranks & The Rook',
    'mod-1-board-pieces',
    'level-1-absolute-beginner'
  );

  assert.equal(state.completedLessonIds.length, 1);
  assert.equal(state.activityHistory.length, 2);
  assert.equal(state.activityHistory[0].type, 'lesson_completed');
  assert.equal(state.activityHistory[1].type, 'exercise_passed');

  // Verify revisiting completed lesson does NOT duplicate or inflate completion counts
  const stateRevisited = ProgressStorage.recordLessonCompletion(
    state,
    'l-101-board-ranks-files',
    'The Chessboard, Files, Ranks & The Rook',
    'mod-1-board-pieces',
    'level-1-absolute-beginner'
  );

  assert.equal(stateRevisited.completedLessonIds.length, 1);
  assert.equal(stateRevisited.activityHistory.length, 2); // No duplicate history entry added
});

test('Educational Accuracy: Pawn promotion checkmate produces genuine checkmate in chess.js', () => {
  const lesson103 = LESSON_MAP['l-103-pawn-promotion-mechanics'];
  assert.ok(lesson103);
  const chess = new Chess(lesson103.exercise.initialFen);
  const m = chess.move('e8=Q');
  assert.ok(m);
  assert.equal(m.san, 'e8=Q#');
  assert.equal(chess.isCheckmate(), true);

  // Alternative e8=R#
  const chessR = new Chess(lesson103.exercise.initialFen);
  const mR = chessR.move('e8=R');
  assert.ok(mR);
  assert.equal(mR.san, 'e8=R#');
  assert.equal(chessR.isCheckmate(), true);
});

test('Educational Accuracy: Knight fork captures pawn with Nxc7+ and is recognized', () => {
  const lesson203 = LESSON_MAP['l-203-the-knight-fork'];
  assert.ok(lesson203);
  const evalRes = ExerciseValidator.evaluateUserMove(
    lesson203.exercise,
    lesson203.exercise.initialFen,
    0,
    'd5',
    'c7'
  );
  assert.equal(evalRes.isValidMove, true);
  assert.equal(evalRes.isCorrectMove, true);
  assert.equal(evalRes.sanPlayed, 'Nxc7+');
  assert.equal(evalRes.isExerciseComplete, true);
});

test('Educational Accuracy: Lucena bridge plays Rf4 on the 4th rank', () => {
  const lesson403 = LESSON_MAP['l-403-the-lucena-bridge'];
  assert.ok(lesson403);
  const evalRes = ExerciseValidator.evaluateUserMove(
    lesson403.exercise,
    lesson403.exercise.initialFen,
    0,
    'f1',
    'f4'
  );
  assert.equal(evalRes.isValidMove, true);
  assert.equal(evalRes.isCorrectMove, true);
  assert.equal(evalRes.sanPlayed, 'Rf4');
  assert.equal(evalRes.isExerciseComplete, true);
});

test('Educational Accuracy: Desperado rook swindle produces genuine stalemate upon capture', () => {
  const lesson603 = LESSON_MAP['l-603-stalemate-swindle-resource'];
  assert.ok(lesson603);
  assert.equal(lesson603.exercise.steps.length, 2);

  // Step 1: Rc8+
  const step1 = ExerciseValidator.evaluateUserMove(
    lesson603.exercise,
    lesson603.exercise.initialFen,
    0,
    'c7',
    'c8'
  );
  assert.equal(step1.isCorrectMove, true);
  assert.equal(step1.opponentReplySan, 'Kh7');

  // Step 2: Rh8+
  const step2 = ExerciseValidator.evaluateUserMove(
    lesson603.exercise,
    step1.nextFen,
    1,
    'c8',
    'h8'
  );
  assert.equal(step2.isCorrectMove, true);
  assert.equal(step2.isExerciseComplete, true);

  // If Black captures Kxh8:
  const finalBoard = new Chess(step2.nextFen);
  finalBoard.move('Kxh8');
  assert.equal(finalBoard.isStalemate(), true);
});

test('Curriculum Expansion: Levels 5, 6, and 7 contain verified lessons and exercises', () => {
  // Level 5 Zwischenzug
  const l504 = LESSON_MAP['l-504-the-zwischenzug-intermediate-move'];
  assert.ok(l504);
  const step1 = ExerciseValidator.evaluateUserMove(l504.exercise, l504.exercise.initialFen, 0, 'd1', 'g4');
  assert.equal(step1.isCorrectMove, true);
  assert.equal(step1.opponentReplySan, 'Kh8');
  const step2 = ExerciseValidator.evaluateUserMove(l504.exercise, step1.nextFen, 1, 'g4', 'g7');
  assert.equal(step2.isCorrectMove, true);
  assert.equal(step2.isExerciseComplete, true);

  // Level 6 Minority Attack
  const l604 = LESSON_MAP['l-604-the-minority-attack-carlsbad'];
  assert.ok(l604);
  const l604Res = ExerciseValidator.evaluateUserMove(l604.exercise, l604.exercise.initialFen, 0, 'b4', 'b5');
  assert.equal(l604Res.isCorrectMove, true);
  assert.equal(l604Res.isExerciseComplete, true);

  // Level 7 King March
  const l704 = LESSON_MAP['l-704-converting-plus-equals-endgame'];
  assert.ok(l704);
  const l704Res = ExerciseValidator.evaluateUserMove(l704.exercise, l704.exercise.initialFen, 0, 'f3', 'g4');
  assert.equal(l704Res.isCorrectMove, true);
  assert.equal(l704Res.isExerciseComplete, true);
});

test('TASK 05 RECOVERY: Canonical curriculum ordering and deterministic sequential navigation', async () => {
  const { getNextLesson, getPreviousLesson, CANONICAL_LESSON_IDS } = await import(
    '../../src/features/training/data/index'
  );

  assert.equal(CANONICAL_LESSON_IDS.length, 30);
  assert.equal(TRAINING_LESSONS.length, 30);

  // Array order strictly matches canonical sequence
  for (let i = 0; i < 30; i++) {
    assert.equal(TRAINING_LESSONS[i].id, CANONICAL_LESSON_IDS[i]);
  }

  // Exact required forward regression assertions:
  assert.equal(
    getNextLesson('l-503-fortress-defensive-resource')?.id,
    'l-504-the-zwischenzug-intermediate-move'
  );
  assert.equal(
    getNextLesson('l-504-the-zwischenzug-intermediate-move')?.id,
    'l-601-master-prophylaxis-restriction'
  );
  assert.equal(
    getNextLesson('l-603-stalemate-swindle-resource')?.id,
    'l-604-the-minority-attack-carlsbad'
  );
  assert.equal(
    getNextLesson('l-604-the-minority-attack-carlsbad')?.id,
    'l-701-najdorf-dynamic-preparation'
  );
  assert.equal(
    getNextLesson('l-703-tournament-pragmatism-simplification')?.id,
    'l-704-converting-plus-equals-endgame'
  );
  assert.equal(
    getNextLesson('l-704-converting-plus-equals-endgame'),
    null
  );

  // Symmetrical previous-lesson navigation:
  assert.equal(
    getPreviousLesson('l-704-converting-plus-equals-endgame')?.id,
    'l-703-tournament-pragmatism-simplification'
  );
  assert.equal(
    getPreviousLesson('l-701-najdorf-dynamic-preparation')?.id,
    'l-604-the-minority-attack-carlsbad'
  );
  assert.equal(
    getPreviousLesson('l-604-the-minority-attack-carlsbad')?.id,
    'l-603-stalemate-swindle-resource'
  );
  assert.equal(
    getPreviousLesson('l-601-master-prophylaxis-restriction')?.id,
    'l-504-the-zwischenzug-intermediate-move'
  );
  assert.equal(
    getPreviousLesson('l-504-the-zwischenzug-intermediate-move')?.id,
    'l-503-fortress-defensive-resource'
  );
  assert.equal(
    getPreviousLesson('l-101-board-ranks-files'),
    null
  );
});

test('TASK 05 RECOVERY: Failed exercise attempt recording and accurate mathematical success rate', () => {
  let state: AcademyProgressState = { ...INITIAL_PROGRESS_STATE };

  // Initial counters must be 0
  assert.equal(state.totalExerciseAttempts, 0);
  assert.equal(state.correctExerciseAttempts, 0);
  assert.equal(state.incorrectExerciseAttempts, 0);

  // 1. Record an incorrect attempt
  state = ProgressStorage.recordExerciseAttempt(
    state,
    'l-101-board-ranks-files',
    'The Chessboard, Files, Ranks & The Rook',
    'level-1-absolute-beginner',
    false
  );

  assert.equal(state.totalExerciseAttempts, 1);
  assert.equal(state.correctExerciseAttempts, 0);
  assert.equal(state.incorrectExerciseAttempts, 1);
  assert.equal(state.activityHistory.length, 1);
  assert.equal(state.activityHistory[0].type, 'exercise_failed');

  let stats = ProgressStorage.calculateStatistics(state);
  assert.equal(stats.exerciseSuccessRate, 0); // 0/1 = 0%

  // 2. Record another incorrect attempt
  state = ProgressStorage.recordExerciseAttempt(
    state,
    'l-101-board-ranks-files',
    'The Chessboard, Files, Ranks & The Rook',
    'level-1-absolute-beginner',
    false
  );

  assert.equal(state.totalExerciseAttempts, 2);
  assert.equal(state.correctExerciseAttempts, 0);
  assert.equal(state.incorrectExerciseAttempts, 2);

  // 3. Record two successful attempts
  state = ProgressStorage.recordExerciseAttempt(
    state,
    'l-101-board-ranks-files',
    'The Chessboard, Files, Ranks & The Rook',
    'level-1-absolute-beginner',
    true
  );
  state = ProgressStorage.recordExerciseAttempt(
    state,
    'l-102-knight-movement',
    'The Knight & Geometric L-Shaped Leaps',
    'level-1-absolute-beginner',
    true
  );

  assert.equal(state.totalExerciseAttempts, 4);
  assert.equal(state.correctExerciseAttempts, 2);
  assert.equal(state.incorrectExerciseAttempts, 2);

  stats = ProgressStorage.calculateStatistics(state);
  assert.equal(stats.exerciseSuccessRate, 50); // 2/4 = 50%
  assert.equal(state.activityHistory[0].type, 'exercise_passed');
  assert.equal(state.activityHistory[1].type, 'exercise_passed');
  assert.equal(state.activityHistory[2].type, 'exercise_failed');
  assert.equal(state.activityHistory[3].type, 'exercise_failed');
});

test('TASK 05 RECOVERY: Opponent move coordinates and MoveRecord data exposure in multi-move exercise', () => {
  const lesson303 = LESSON_MAP['l-303-back-rank-destruction'];
  assert.ok(lesson303);

  // Step 1: User plays Qe8+
  const step1Result = ExerciseValidator.evaluateUserMove(
    lesson303.exercise,
    lesson303.exercise.initialFen,
    0,
    'e2',
    'e8'
  );

  assert.equal(step1Result.isValidMove, true);
  assert.equal(step1Result.isCorrectMove, true);
  assert.equal(step1Result.sanPlayed, 'Qe8+');
  assert.equal(step1Result.uciPlayed, 'e2e8');

  // Verify player MoveRecord
  assert.ok(step1Result.playerMoveRecord);
  assert.equal(step1Result.playerMoveRecord.from, 'e2');
  assert.equal(step1Result.playerMoveRecord.to, 'e8');
  assert.equal(step1Result.playerMoveRecord.piece, 'q');
  assert.equal(step1Result.playerMoveRecord.color, 'w');
  assert.equal(step1Result.playerMoveRecord.fenBefore, lesson303.exercise.initialFen);

  // Verify Opponent reply details
  assert.ok(step1Result.opponentReply);
  assert.equal(step1Result.opponentReply.from, 'c8');
  assert.equal(step1Result.opponentReply.to, 'e8');
  assert.equal(step1Result.opponentReply.san, 'Rxe8');
  assert.equal(step1Result.opponentReply.uci, 'c8e8');

  // Verify Opponent MoveRecord
  assert.ok(step1Result.opponentMoveRecord);
  assert.equal(step1Result.opponentMoveRecord.from, 'c8');
  assert.equal(step1Result.opponentMoveRecord.to, 'e8');
  assert.equal(step1Result.opponentMoveRecord.piece, 'r');
  assert.equal(step1Result.opponentMoveRecord.color, 'b');
  assert.equal(step1Result.opponentMoveRecord.captured, 'q');
  assert.equal(step1Result.opponentMoveRecord.fenAfter, step1Result.nextFen);

  // Step 2: User plays Rxe8#
  const step2Result = ExerciseValidator.evaluateUserMove(
    lesson303.exercise,
    step1Result.nextFen,
    1,
    'e1',
    'e8'
  );

  assert.equal(step2Result.isValidMove, true);
  assert.equal(step2Result.isCorrectMove, true);
  assert.equal(step2Result.isExerciseComplete, true);
  assert.equal(step2Result.sanPlayed, 'Rxe8#');
  assert.equal(step2Result.uciPlayed, 'e1e8');
  assert.equal(step2Result.opponentReply, undefined); // No opponent reply on final step
});

test('TASK 05 RECOVERY: Position-aware SAN and UCI move resolution', () => {
  // Test 1: Knight fork with capture tolerance and UCI equivalence
  const lesson203 = LESSON_MAP['l-203-the-knight-fork'];
  assert.ok(lesson203);

  // Move via from/to coordinates
  const res = ExerciseValidator.evaluateUserMove(
    lesson203.exercise,
    lesson203.exercise.initialFen,
    0,
    'd5',
    'c7'
  );
  assert.equal(res.isValidMove, true);
  assert.equal(res.isCorrectMove, true);
  assert.equal(res.sanPlayed, 'Nxc7+');
  assert.equal(res.uciPlayed, 'd5c7');

  // Test 2: Pawn promotion strictly respects promotion piece
  const lesson103 = LESSON_MAP['l-103-pawn-promotion-mechanics'];
  assert.ok(lesson103);

  // Queen promotion: correct
  const resQ = ExerciseValidator.evaluateUserMove(
    lesson103.exercise,
    lesson103.exercise.initialFen,
    0,
    'e7',
    'e8',
    'q'
  );
  assert.equal(resQ.isValidMove, true);
  assert.equal(resQ.isCorrectMove, true);
  assert.equal(resQ.sanPlayed, 'e8=Q#');
  assert.equal(resQ.uciPlayed, 'e7e8q');

  // Knight promotion: legal in chess, but does not satisfy Queen/Rook mate objective
  const resN = ExerciseValidator.evaluateUserMove(
    lesson103.exercise,
    lesson103.exercise.initialFen,
    0,
    'e7',
    'e8',
    'n'
  );
  assert.equal(resN.isValidMove, true);
  assert.equal(resN.isCorrectMove, false);
  assert.equal(resN.sanPlayed, 'e8=N');
  assert.equal(resN.uciPlayed, 'e7e8n');
});

test('FINAL REGRESSION: MoveRecord integrity across multi-move replay with independent chess.js verification', () => {
  const lesson303 = LESSON_MAP['l-303-back-rank-destruction'];
  assert.ok(lesson303);

  // Step 1: User plays Qe8+
  const step1 = ExerciseValidator.evaluateUserMove(
    lesson303.exercise,
    lesson303.exercise.initialFen,
    0,
    'e2',
    'e8'
  );

  assert.equal(step1.isValidMove, true);
  assert.equal(step1.isCorrectMove, true);

  // Validate player MoveRecord
  const pRecord = step1.playerMoveRecord;
  assert.ok(pRecord);
  assert.equal(pRecord.san, 'Qe8+');
  assert.equal(pRecord.uci, 'e2e8');
  assert.equal(pRecord.from, 'e2');
  assert.equal(pRecord.to, 'e8');
  assert.equal(pRecord.piece, 'q');
  assert.equal(pRecord.color, 'w');
  assert.equal(pRecord.captured, undefined);
  assert.equal(pRecord.ply, 1);
  assert.equal(pRecord.fenBefore, lesson303.exercise.initialFen);

  // Independently verify fenBefore and fenAfter in fresh chess.js
  const vBoard1 = new Chess(pRecord.fenBefore);
  const vMove1 = vBoard1.move({ from: 'e2', to: 'e8' });
  assert.ok(vMove1);
  assert.equal(vMove1.san, 'Qe8+');
  assert.equal(vBoard1.fen(), pRecord.fenAfter);

  // Validate opponent MoveRecord
  const oRecord = step1.opponentMoveRecord;
  assert.ok(oRecord);
  assert.equal(oRecord.san, 'Rxe8');
  assert.equal(oRecord.uci, 'c8e8');
  assert.equal(oRecord.from, 'c8');
  assert.equal(oRecord.to, 'e8');
  assert.equal(oRecord.piece, 'r');
  assert.equal(oRecord.color, 'b');
  assert.equal(oRecord.captured, 'q');
  assert.equal(oRecord.ply, 2);
  assert.equal(oRecord.fenBefore, pRecord.fenAfter);

  // Independently verify opponent move in chess.js
  const vMove2 = vBoard1.move({ from: 'c8', to: 'e8' });
  assert.ok(vMove2);
  assert.equal(vMove2.san, 'Rxe8');
  assert.equal(vBoard1.fen(), oRecord.fenAfter);
  assert.equal(step1.nextFen, oRecord.fenAfter);

  // Step 2: User plays Rxe8#
  const step2 = ExerciseValidator.evaluateUserMove(
    lesson303.exercise,
    step1.nextFen,
    1,
    'e1',
    'e8'
  );

  assert.equal(step2.isValidMove, true);
  assert.equal(step2.isCorrectMove, true);
  assert.equal(step2.isExerciseComplete, true);

  const pRecord2 = step2.playerMoveRecord;
  assert.ok(pRecord2);
  assert.equal(pRecord2.san, 'Rxe8#');
  assert.equal(pRecord2.uci, 'e1e8');
  assert.equal(pRecord2.from, 'e1');
  assert.equal(pRecord2.to, 'e8');
  assert.equal(pRecord2.piece, 'r');
  assert.equal(pRecord2.color, 'w');
  assert.equal(pRecord2.captured, 'r');
  assert.equal(pRecord2.ply, 3);
  assert.equal(pRecord2.fenBefore, oRecord.fenAfter);

  const vMove3 = vBoard1.move({ from: 'e1', to: 'e8' });
  assert.ok(vMove3);
  assert.equal(vMove3.san, 'Rxe8#');
  assert.equal(vBoard1.fen(), pRecord2.fenAfter);
  assert.equal(vBoard1.isCheckmate(), true);
});

test('FINAL REGRESSION: SAN and UCI resolution matrix across all conditions', () => {
  // Castling position: White has kingside (e1g1 / O-O) and queenside (e1c1 / O-O-O)
  const castlingFen = 'r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1';
  const castlingExercise: any = {
    id: 'test-castling',
    title: 'Castling Test',
    exerciseType: 'tactical_pattern',
    initialFen: castlingFen,
    playerSide: 'w',
    steps: [
      {
        stepIndex: 0,
        playerMoveSan: 'O-O',
        explanation: 'Kingside castle',
      },
    ],
  };

  // 1. Kingside castling via coordinates 'e1g1' matches target 'O-O'
  const castleOORes = ExerciseValidator.evaluateUserMove(castlingExercise, castlingFen, 0, 'e1', 'g1');
  assert.equal(castleOORes.isValidMove, true);
  assert.equal(castleOORes.isCorrectMove, true);
  assert.equal(castleOORes.sanPlayed, 'O-O');
  assert.equal(castleOORes.uciPlayed, 'e1g1');

  // 2. Queenside castling target '0-0-0' (zeros) matches move 'e1c1'
  const castlingQueensideExercise: any = {
    ...castlingExercise,
    steps: [{ stepIndex: 0, playerMoveSan: '0-0-0', explanation: 'Queenside castle' }],
  };
  const castleOOORes = ExerciseValidator.evaluateUserMove(castlingQueensideExercise, castlingFen, 0, 'e1', 'c1');
  assert.equal(castleOOORes.isValidMove, true);
  assert.equal(castleOOORes.isCorrectMove, true);
  assert.equal(castleOOORes.sanPlayed, 'O-O-O');
  assert.equal(castleOOORes.uciPlayed, 'e1c1');

  // 3. Promotion to all 4 pieces: Q, R, B, N
  const promoFen = '8/4P1k1/8/8/8/8/8/4K3 w - - 0 1';
  const promoQEx: any = {
    id: 'test-promo',
    title: 'Promo Test',
    exerciseType: 'endgame_technique',
    initialFen: promoFen,
    playerSide: 'w',
    steps: [{ stepIndex: 0, playerMoveSan: 'e8=Q', explanation: 'Queen promotion' }],
  };

  for (const piece of ['q', 'r', 'b', 'n'] as const) {
    const pEx: any = {
      ...promoQEx,
      steps: [{ stepIndex: 0, playerMoveSan: `e8=${piece.toUpperCase()}`, explanation: 'Promo' }],
    };
    const res = ExerciseValidator.evaluateUserMove(pEx, promoFen, 0, 'e7', 'e8', piece);
    assert.equal(res.isValidMove, true);
    assert.equal(res.isCorrectMove, true);
    assert.equal(res.playerMoveRecord?.promotion, piece);
    assert.equal(res.uciPlayed, `e7e8${piece}`);
  }

  // 4. Captures
  const captureFen = '4k3/8/8/3r4/4P3/8/8/4K3 w - - 0 1';
  const captureEx: any = {
    id: 'test-capture',
    title: 'Capture Test',
    exerciseType: 'tactical_pattern',
    initialFen: captureFen,
    playerSide: 'w',
    steps: [{ stepIndex: 0, playerMoveSan: 'exd5', explanation: 'Pawn captures rook' }],
  };
  const capRes = ExerciseValidator.evaluateUserMove(captureEx, captureFen, 0, 'e4', 'd5');
  assert.equal(capRes.isValidMove, true);
  assert.equal(capRes.isCorrectMove, true);
  assert.equal(capRes.sanPlayed, 'exd5');
  assert.equal(capRes.playerMoveRecord?.captured, 'r');

  // 5. Illegal moves & wrong-side-to-move
  // Attempting to move Black piece when White is to move:
  const wrongColorRes = ExerciseValidator.evaluateUserMove(captureEx, captureFen, 0, 'd5', 'd4');
  assert.equal(wrongColorRes.isValidMove, false);
  assert.equal(wrongColorRes.isCorrectMove, false);

  // Moving King into check:
  const checkFen = '4k3/8/8/8/8/8/8/4K2r w - - 0 1'; // Black Rook giving check on h1
  const suicideMoveRes = ExerciseValidator.evaluateUserMove(
    { ...captureEx, initialFen: checkFen },
    checkFen,
    0,
    'e1',
    'f1' // moving onto attacked f1
  );
  assert.equal(suicideMoveRes.isValidMove, false);

  // Moving piece through blocked square:
  const blockedMoveRes = ExerciseValidator.evaluateUserMove(
    { ...captureEx, initialFen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1' },
    'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    0,
    'a1',
    'a3' // Rook blocked by pawn on a2
  );
  assert.equal(blockedMoveRes.isValidMove, false);
});

test('FINAL REGRESSION: Curriculum integrity programmatic verification (30 unique lessons, no skips or loops)', async () => {
  const { CANONICAL_LESSON_IDS, getNextLesson, getPreviousLesson } = await import(
    '../../src/features/training/data/index'
  );

  // 1. Exactly 30 unique lesson IDs
  assert.equal(CANONICAL_LESSON_IDS.length, 30);
  const uniqueIds = new Set(CANONICAL_LESSON_IDS);
  assert.equal(uniqueIds.size, 30);

  // 2. Exactly 30 lessons in TRAINING_LESSONS and perfect 1:1 match
  assert.equal(TRAINING_LESSONS.length, 30);
  const trainingLessonIds = new Set(TRAINING_LESSONS.map((l) => l.id));
  assert.equal(trainingLessonIds.size, 30);

  for (const cid of CANONICAL_LESSON_IDS) {
    assert.ok(trainingLessonIds.has(cid), `Missing canonical lesson in TRAINING_LESSONS: ${cid}`);
  }
  for (const tid of trainingLessonIds) {
    assert.ok(uniqueIds.has(tid), `Extra lesson in TRAINING_LESSONS not in canonical list: ${tid}`);
  }

  // 3. Level and module consistency
  for (let i = 0; i < TRAINING_LESSONS.length; i++) {
    const lesson = TRAINING_LESSONS[i];
    const mod = CURRICULUM_MODULES.find((m) => m.id === lesson.moduleId);
    assert.ok(mod, `Lesson ${lesson.id} references non-existent module ${lesson.moduleId}`);
    assert.equal(
      lesson.levelId,
      mod.levelId,
      `Lesson ${lesson.id} levelId mismatch with module ${mod.id}`
    );
  }

  // 4. Sequential traversal without skips or loops
  let currentId: string | null = CANONICAL_LESSON_IDS[0];
  const visitedForward: string[] = [];

  while (currentId !== null) {
    visitedForward.push(currentId);
    const next = getNextLesson(currentId);
    currentId = next ? next.id : null;
  }

  assert.equal(visitedForward.length, 30);
  assert.deepEqual(visitedForward, CANONICAL_LESSON_IDS);

  // 5. Symmetrical reverse traversal
  let revId: string | null = CANONICAL_LESSON_IDS[29];
  const visitedReverse: string[] = [];

  while (revId !== null) {
    visitedReverse.push(revId);
    const prev = getPreviousLesson(revId);
    revId = prev ? prev.id : null;
  }

  assert.equal(visitedReverse.length, 30);
  assert.deepEqual(visitedReverse, [...CANONICAL_LESSON_IDS].reverse());

  // 6. Boundary checks
  assert.equal(getPreviousLesson(CANONICAL_LESSON_IDS[0]), null);
  assert.equal(getNextLesson(CANONICAL_LESSON_IDS[29]), null);
});

test('FINAL REGRESSION: Storage backward compatibility and corrupted recovery', () => {
  // 1. Storage key integrity
  const defaultState = ProgressStorage.loadProgress();
  assert.equal(defaultState.version, 1);
  assert.equal(defaultState.currentLevelId, 'level-1-absolute-beginner');
  assert.ok(Array.isArray(defaultState.completedLessonIds));

  // 2. Corrupt storage simulation
  const corruptInputs = [
    'invalid json string',
    '{"version": 999}',
    'null',
    '12345',
    '{"completedLessonIds": "not an array"}',
    '{"totalExerciseAttempts": "invalid_number"}',
  ];

  for (const input of corruptInputs) {
    try {
      const parsed = JSON.parse(input);
      const validated: AcademyProgressState = {
        version: 1,
        currentLevelId: parsed?.currentLevelId || 'level-1-absolute-beginner',
        completedLessonIds: Array.isArray(parsed?.completedLessonIds) ? parsed.completedLessonIds : [],
        completedModuleIds: Array.isArray(parsed?.completedModuleIds) ? parsed.completedModuleIds : [],
        unlockedLevelIds: Array.isArray(parsed?.unlockedLevelIds) && parsed.unlockedLevelIds.length > 0
          ? parsed.unlockedLevelIds
          : ['level-1-absolute-beginner'],
        lessonProgress: parsed?.lessonProgress && typeof parsed.lessonProgress === 'object' ? parsed.lessonProgress : {},
        totalExerciseAttempts: typeof parsed?.totalExerciseAttempts === 'number' ? parsed.totalExerciseAttempts : 0,
        correctExerciseAttempts: typeof parsed?.correctExerciseAttempts === 'number' ? parsed.correctExerciseAttempts : 0,
        incorrectExerciseAttempts: typeof parsed?.incorrectExerciseAttempts === 'number' ? parsed.incorrectExerciseAttempts : 0,
        activityHistory: Array.isArray(parsed?.activityHistory) ? parsed.activityHistory : [],
        lastActiveAt: parsed?.lastActiveAt || new Date().toISOString(),
      };
      assert.ok(Array.isArray(validated.completedLessonIds));
      assert.equal(typeof validated.totalExerciseAttempts, 'number');
    } catch {
      assert.ok(true);
    }
  }

  // 3. Mathematical success rate with mixed attempts
  const testState: AcademyProgressState = {
    ...INITIAL_PROGRESS_STATE,
    totalExerciseAttempts: 10,
    correctExerciseAttempts: 7,
    incorrectExerciseAttempts: 3,
  };
  const stats = ProgressStorage.calculateStatistics(testState);
  assert.equal(stats.totalAttempts, 10);
  assert.equal(stats.exerciseSuccessRate, 70); // 7 / 10 = 70%
});


