/**
 * Academy Orchestrator for the Autonomous AI Chess Tutor.
 * Coordinates between conversational AI, curriculum progression, deterministic unlock rules,
 * assessment history, and Test Arena transitions while keeping rules authoritative.
 */

import { ProgressStorage } from '../../training/models/progressStorage';
import { UnlockEngine } from '../../training/models/unlockEngine';
import {
  CANONICAL_LESSON_IDS,
  LESSON_MAP,
  TRAINING_LESSONS,
  ACADEMY_LEVEL_MAP,
  getNextLesson,
} from '../../training/data';
import type { AcademyLevelId, AcademyProgressState, TrainingLesson } from '../../training/types';
import { TestArenaStorage } from '../../test-arena/models/storage';
import type { AssessmentReport } from '../../test-arena/types';
import type { InitialAssessmentState, TutorOrchestratorAction } from '../types';

export interface TestArenaTransitionPrompt {
  isOpen: boolean;
  reason: string;
  recommendedFormat: 'single' | 'battery' | 'tactical';
}

export class AcademyOrchestrator {
  /**
   * Retrieves active academy progress state.
   */
  static getProgress(): AcademyProgressState {
    return ProgressStorage.loadProgress();
  }

  /**
   * Evaluates if a lesson can be started according to deterministic unlock rules.
   */
  static canStartLesson(lessonId: string): { allowed: boolean; reason?: string } {
    const progress = this.getProgress();
    const lesson = LESSON_MAP[lessonId];
    if (!lesson) {
      return { allowed: false, reason: `Lesson "${lessonId}" does not exist in canonical curriculum.` };
    }

    const isUnlocked = UnlockEngine.isLessonUnlocked(lessonId, progress);
    if (!isUnlocked) {
      const lockReason = UnlockEngine.getLevelLockReason(lesson.levelId, progress);
      return {
        allowed: false,
        reason: lockReason || `Lesson "${lesson.title}" is currently locked. Complete prerequisite lessons first.`,
      };
    }

    return { allowed: true };
  }

  /**
   * Completes a lesson deterministically, updating progress storage and unlocking next items.
   */
  static completeLesson(lessonId: string): {
    success: boolean;
    nextLesson: TrainingLesson | null;
    updatedProgress: AcademyProgressState;
  } {
    const lesson = LESSON_MAP[lessonId];
    if (!lesson) {
      return { success: false, nextLesson: null, updatedProgress: this.getProgress() };
    }

    const prevProgress = this.getProgress();
    const updatedProgress = ProgressStorage.recordLessonCompletion(
      prevProgress,
      lesson.id,
      lesson.title,
      lesson.moduleId,
      lesson.levelId
    );
    ProgressStorage.saveProgress(updatedProgress);

    const next = getNextLesson(lessonId);
    return {
      success: true,
      nextLesson: next,
      updatedProgress,
    };
  }

  /**
   * Records an interactive exercise attempt (passed or failed).
   */
  static recordExerciseAttempt(
    passed: boolean,
    lessonId = 'practice',
    lessonTitle = 'Practice Exercise',
    levelId: AcademyLevelId = 'level-1-absolute-beginner'
  ): AcademyProgressState {
    const prev = this.getProgress();
    const updated = ProgressStorage.recordExerciseAttempt(
      prev,
      lessonId,
      lessonTitle,
      levelId,
      passed
    );
    ProgressStorage.saveProgress(updated);
    return updated;
  }

  /**
   * Recommends the next pedagogical lesson based on canonical order and current unlocks.
   */
  static getNextRecommendedLesson(): TrainingLesson | null {
    const progress = this.getProgress();
    return UnlockEngine.getNextRecommendedLesson(TRAINING_LESSONS, progress);
  }

  /**
   * Determines if student is eligible for formal Test Arena assessment.
   * Requires completion of at least 3 lessons or an initial skill assessment.
   */
  static checkTestArenaEligibility(progress: AcademyProgressState): {
    eligible: boolean;
    reason: string;
    completedCount: number;
    requiredCount: number;
  } {
    const completedCount = progress.completedLessonIds.length;
    const requiredCount = 3;
    const eligible = completedCount >= requiredCount;

    return {
      eligible,
      reason: eligible
        ? 'You have completed the foundational lessons required for an unassisted diagnostic match.'
        : `Complete at least ${requiredCount} lessons to establish candidate baseline before entering Test Arena (Currently ${completedCount}/${requiredCount}).`,
      completedCount,
      requiredCount,
    };
  }

  /**
   * Retrieves latest completed Test Arena diagnostic report if any.
   */
  static getLatestTestArenaReport(): AssessmentReport | null {
    const reports = TestArenaStorage.getReports();
    if (!reports || reports.length === 0) return null;
    const completed = reports.filter((r) => r.status === 'completed');
    if (completed.length === 0) return null;
    return completed.sort(
      (a, b) => new Date(b.completedAt || b.createdAt).getTime() - new Date(a.completedAt || a.createdAt).getTime()
    )[0];
  }

  /**
   * Analyzes the latest Test Arena report and produces targeted learning recommendations.
   */
  static analyzeTestReportAndRecommendLessons(report: AssessmentReport): {
    summary: string;
    targetWeaknesses: string[];
    recommendedLessonIds: string[];
  } {
    const weaknesses: string[] = [];
    const recommendedLessonIds: string[] = [];

    const acpl = report.overallResults?.acpl ?? 0;
    const accuracy = report.overallResults?.accuracyPercent ?? 0;
    const blunders = report.overallResults?.classificationCounts?.blunder ?? 0;
    const endgameAcpl = report.overallResults?.phaseBreakdown?.endgame?.acpl ?? 0;

    // Analyze ACPL (Centipawn Loss)
    if (acpl > 90) {
      weaknesses.push('Calculation accuracy under tactical tension');
      recommendedLessonIds.push('l-203-the-knight-fork', 'l-204-the-absolute-pin');
    }

    // Analyze blunder / mistake count
    if (blunders >= 2) {
      weaknesses.push('Defending against hanging pieces and sudden tactical threats');
      recommendedLessonIds.push('l-104-check-and-checkmate', 'l-201-piece-values-counting');
    }

    // Analyze endgame phase
    if (endgameAcpl > 100) {
      weaknesses.push('Endgame king activity and conversion');
      recommendedLessonIds.push('l-103-pawn-promotion-mechanics', 'l-403-the-lucena-bridge');
    }

    // Fallback if play was solid
    if (recommendedLessonIds.length === 0) {
      recommendedLessonIds.push('l-301-the-linear-skewer', 'l-402-prophylactic-thinking');
    }

    const uniqueLessonIds = Array.from(new Set(recommendedLessonIds)).filter(
      (id) => CANONICAL_LESSON_IDS.includes(id)
    );

    const formatLabel = report.formatName || 'Test Arena';
    const summary = `In your recent ${formatLabel} assessment, you achieved an ACPL of ${acpl.toFixed(1)} with estimated accuracy of ${accuracy}%. The AI Tutor recommends reinforcing ${weaknesses.join(' and ')}.`;

    return {
      summary,
      targetWeaknesses: weaknesses,
      recommendedLessonIds: uniqueLessonIds,
    };
  }

  /**
   * Applies assessment results to update user starting level in academy progress.
   */
  static applyInitialAssessmentResult(
    assessmentState: InitialAssessmentState
  ): AcademyProgressState {
    const progress = this.getProgress();
    const evaluatedLevelId = assessmentState.evaluatedLevelId || 'level-1-absolute-beginner';

    // Unlock levels up to the evaluated level
    const levelOrder: AcademyLevelId[] = [
      'level-1-absolute-beginner',
      'level-2-elementary',
      'level-3-intermediate',
      'level-4-advanced',
      'level-5-expert',
      'level-6-master',
      'level-7-grandmaster-prep',
    ];

    const targetIndex = levelOrder.indexOf(evaluatedLevelId);
    const unlocked = levelOrder.slice(0, Math.max(1, targetIndex + 1));

    const updated: AcademyProgressState = {
      ...progress,
      currentLevelId: evaluatedLevelId,
      unlockedLevelIds: Array.from(new Set([...progress.unlockedLevelIds, ...unlocked])),
      lastActiveAt: new Date().toISOString(),
    };

    ProgressStorage.saveProgress(updated);
    return updated;
  }
}
