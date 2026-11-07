import test from 'node:test';
import assert from 'node:assert/strict';
import {
  SkillAssessmentEngine,
  INITIAL_ASSESSMENT_QUESTIONS,
} from '../../src/features/tutor/models/skillAssessmentEngine';

test('SkillAssessmentEngine: startAssessment initializes complete diagnostic session', () => {
  const session = SkillAssessmentEngine.startAssessment();
  assert.equal(session.isActive, true);
  assert.equal(session.isCompleted, false);
  assert.equal(session.currentQuestionIndex, 0);
  assert.equal(session.totalQuestions, INITIAL_ASSESSMENT_QUESTIONS.length);
  assert.equal(session.results.length, 0);
  assert.ok(session.totalQuestions >= 8);
});

test('SkillAssessmentEngine: evaluates correct and incorrect multiple choice answers', () => {
  let session = SkillAssessmentEngine.startAssessment();
  const q1 = session.questions[0];

  // Submit correct option index
  const correctRes = SkillAssessmentEngine.submitAnswer(session, q1.correctOptionIndex!);
  assert.equal(correctRes.isCorrect, true);
  assert.equal(correctRes.nextState.results.length, 1);
  assert.equal(correctRes.nextState.currentQuestionIndex, 1);

  session = correctRes.nextState;
  const q2 = session.questions[1];

  // Submit incorrect option index
  const wrongRes = SkillAssessmentEngine.submitAnswer(session, 3); // index 3 is wrong
  assert.equal(wrongRes.isCorrect, false);
  assert.equal(wrongRes.nextState.results.length, 2);
  assert.equal(wrongRes.nextState.currentQuestionIndex, 2);
});

test('SkillAssessmentEngine: evaluates board move questions', () => {
  let session = SkillAssessmentEngine.startAssessment();
  // Find a board move question
  const boardQIndex = session.questions.findIndex((q) => q.type === 'board_move');
  assert.ok(boardQIndex >= 0);

  // Set session index to boardQIndex
  session = {
    ...session,
    currentQuestionIndex: boardQIndex,
  };

  const q = session.questions[boardQIndex];
  const correctMove = q.expectedMoveSanOrUci!;

  const res = SkillAssessmentEngine.submitAnswer(session, correctMove);
  assert.equal(res.isCorrect, true);
  assert.equal(res.nextState.results[0].questionId, q.id);
});

test('SkillAssessmentEngine: completes assessment and calculates recommended starting level', () => {
  const perfectResults = INITIAL_ASSESSMENT_QUESTIONS.map((q) => ({
    questionId: q.id,
    category: q.category,
    isCorrect: true,
    studentAnswer: 'correct',
    expectedAnswer: 'correct',
    explanation: q.explanation,
  }));

  const perfectProfile = SkillAssessmentEngine.computeProfileFromResults(perfectResults);
  assert.equal(perfectProfile.recommendedLevelId, 'level-4-advanced');
  assert.ok(perfectProfile.estimatedRating >= 1300);
  assert.ok(perfectProfile.strengths.length > 0);
  assert.equal(perfectProfile.gaps.length, 0);

  const beginnerResults = INITIAL_ASSESSMENT_QUESTIONS.map((q) => ({
    questionId: q.id,
    category: q.category,
    isCorrect: false,
    studentAnswer: 'wrong',
    expectedAnswer: 'correct',
    explanation: q.explanation,
  }));

  const beginnerProfile = SkillAssessmentEngine.computeProfileFromResults(beginnerResults);
  assert.equal(beginnerProfile.recommendedLevelId, 'level-1-absolute-beginner');
  assert.ok(beginnerProfile.estimatedRating <= 600);
  assert.ok(beginnerProfile.gaps.length > 0);
});
