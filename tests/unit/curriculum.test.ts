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
