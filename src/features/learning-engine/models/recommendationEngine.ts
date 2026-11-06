/**
 * Recommendation generator and adaptive curriculum sequencing engine.
 * Respects canonical curriculum ordering and unlocking rules while adapting to verified learner needs.
 */

import { TRAINING_LESSONS, LESSON_MAP } from '../../training/data/curriculumData';
import { CANONICAL_LESSON_IDS } from '../../training/data';
import { UnlockEngine } from '../../training/models/unlockEngine';
import type { AcademyProgressState, TrainingLesson } from '../../training/types';
import type {
  DetectedWeakness,
  ConfirmedStrength,
  EducationalTopicCategory,
  PersonalizedRecommendation,
  PersonalizedLearningPlan,
  TopicPerformanceMetrics,
} from '../types';
import { LESSON_TOPIC_MAPPINGS } from './topicTaxonomy';

export class RecommendationEngine {
  /**
   * Generates prioritized, evidence-backed educational recommendations.
   * Never fabricates lesson IDs or bypasses canonical prerequisites.
   */
  static generateRecommendations(
    progressState: AcademyProgressState | null | undefined,
    weaknesses: DetectedWeakness[],
    strengths: ConfirmedStrength[],
    topicMetrics: Record<EducationalTopicCategory, TopicPerformanceMetrics>,
    arenaCompletedCount: number
  ): PersonalizedRecommendation[] {
    const recommendations: PersonalizedRecommendation[] = [];
    const safeProgress: AcademyProgressState = progressState || {
      version: 1,
      currentLevelId: 'level-1-absolute-beginner',
      completedLessonIds: [],
      completedModuleIds: [],
      unlockedLevelIds: ['level-1-absolute-beginner'],
      lessonProgress: {},
      totalExerciseAttempts: 0,
      correctExerciseAttempts: 0,
      incorrectExerciseAttempts: 0,
      activityHistory: [],
      lastActiveAt: new Date().toISOString(),
    };

    // 1. Weakness-Targeted Review Recommendations (Highest Priority)
    // If a repeated or confirmed weakness is detected, recommend reviewing relevant completed lessons or attempting available unlocked lessons in that category
    for (const weakness of weaknesses) {
      if (weakness.severity === 'repeated' || weakness.severity === 'confirmed') {
        // Find suitable lesson in this topic category
        const relevantLessons = weakness.relatedLessonIds
          .map((id) => LESSON_MAP[id])
          .filter((l): l is TrainingLesson => Boolean(l));

        // Prefer an unlocked lesson (either already completed for review, or currently unlocked next)
        const unlockedCandidate = relevantLessons.find((l) => UnlockEngine.isLessonUnlocked(l.id, safeProgress));

        if (unlockedCandidate) {
          const isReview = safeProgress.completedLessonIds.includes(unlockedCandidate.id);
          const priority = weakness.severity === 'repeated' ? 'critical' : 'high';

          recommendations.push({
            id: `rec-weakness-${weakness.category}`,
            type: isReview ? 'curriculum_revision' : 'targeted_weakness_remedy',
            priority,
            title: isReview ? `Review: ${unlockedCandidate.title}` : `Study: ${unlockedCandidate.title}`,
            reason: `Identified ${weakness.severity} weakness in ${weakness.title}.`,
            supportingEvidence: `${weakness.evidenceCount} errors across ${weakness.sampleCount} assessments. ${weakness.pedagogicalRemedy}`,
            targetCategory: weakness.category,
            targetLessonId: unlockedCandidate.id,
            targetLevelId: unlockedCandidate.levelId,
            estimatedMinutes: unlockedCandidate.estimatedMinutes,
            actionUrl: `/training/lesson/${unlockedCandidate.id}`,
            actionLabel: isReview ? 'Revisit Lesson' : 'Start Exercise Drill',
          });
          break; // Keep top 1-2 weakness remedies to avoid overwhelming the learner
        }
      }
    }

    // 2. Next Unlocked Canonical Lesson Recommendation (Core Progression)
    const nextLesson = this.findNextCanonicalLesson(safeProgress);
    if (nextLesson) {
      const mapping = LESSON_TOPIC_MAPPINGS[nextLesson.id];
      const targetCategory = mapping ? mapping.category : 'opening_principles';

      // Check if learner has high mastery in previous prerequisites
      const hasPrecedingGaps = weaknesses.some((w) => w.severity === 'repeated');
      const priority = hasPrecedingGaps ? 'recommended' : 'high';

      recommendations.push({
        id: `rec-next-canonical-${nextLesson.id}`,
        type: 'next_canonical_lesson',
        priority,
        title: `Next Up: ${nextLesson.title}`,
        reason: 'Natural linear curriculum progression.',
        supportingEvidence: `Completed ${safeProgress.completedLessonIds.length} of ${CANONICAL_LESSON_IDS.length} canonical lessons. Meets all prerequisite criteria.`,
        targetCategory,
        targetLessonId: nextLesson.id,
        targetLevelId: nextLesson.levelId,
        estimatedMinutes: nextLesson.estimatedMinutes,
        actionUrl: `/training/lesson/${nextLesson.id}`,
        actionLabel: 'Continue Lesson',
      });
    }

    // 3. Test Arena Diagnostic Recommendation
    // If player has solved multiple training exercises but completed 0 or few Test Arena matches, suggest diagnostic evaluation
    if (safeProgress.completedLessonIds.length >= 4 && arenaCompletedCount === 0) {
      recommendations.push({
        id: 'rec-arena-diagnostic-first',
        type: 'arena_assessment_check',
        priority: 'recommended',
        title: 'Diagnostic: Take Single-Match Assessment',
        reason: 'Measure your unassisted play against calibrated Stockfish WASM.',
        supportingEvidence: `You have completed ${safeProgress.completedLessonIds.length} lessons. An unbiased match provides verified ACPL and phase metrics.`,
        targetCategory: 'calculation_accuracy',
        actionUrl: '/test-arena',
        actionLabel: 'Enter Test Arena',
      });
    } else if (weaknesses.some((w) => w.category === 'time_management')) {
      recommendations.push({
        id: 'rec-arena-tactical-speed',
        type: 'speed_or_tactical_drill',
        priority: 'recommended',
        title: 'Clock Drill: Tactical Speed Assessment',
        reason: 'Practice candidate move execution under severe 5+0 clock pressure.',
        supportingEvidence: 'Observed clock hesitation during rapid play.',
        targetCategory: 'time_management',
        actionUrl: '/test-arena',
        actionLabel: 'Start Blitz Diagnostic',
      });
    }

    // 4. Maintenance / Reinforcement of Confirmed Strengths
    if (strengths.length > 0 && recommendations.length < 4) {
      const topStrength = strengths[0];
      const mapping = Object.values(LESSON_TOPIC_MAPPINGS).find((m) => m.category === topStrength.category);
      if (mapping && LESSON_MAP[mapping.lessonId]) {
        const lesson = LESSON_MAP[mapping.lessonId];
        recommendations.push({
          id: `rec-strength-maintain-${topStrength.category}`,
          type: 'curriculum_revision',
          priority: 'optional',
          title: `Reinforce: ${lesson.title}`,
          reason: `Consolidate your demonstrated proficiency in ${topStrength.title}.`,
          supportingEvidence: `High accuracy of ${topStrength.accuracyOrSuccessRate}% recorded.`,
          targetCategory: topStrength.category,
          targetLessonId: lesson.id,
          targetLevelId: lesson.levelId,
          estimatedMinutes: lesson.estimatedMinutes,
          actionUrl: `/training/lesson/${lesson.id}`,
          actionLabel: 'Review Concepts',
        });
      }
    }

    return recommendations;
  }

  /**
   * Finds the exact next unlocked lesson following CANONICAL_LESSON_IDS order.
   * Guarantees zero prerequisite bypass.
   */
  static findNextCanonicalLesson(progressState: AcademyProgressState): TrainingLesson | null {
    for (const lessonId of CANONICAL_LESSON_IDS) {
      if (!progressState.completedLessonIds.includes(lessonId)) {
        if (UnlockEngine.isLessonUnlocked(lessonId, progressState)) {
          return LESSON_MAP[lessonId] || null;
        }
      }
    }
    return null;
  }

  /**
   * Constructs the structured personalized learning plan.
   */
  static generateLearningPlan(
    progressState: AcademyProgressState | null | undefined,
    recommendations: PersonalizedRecommendation[],
    weaknesses: DetectedWeakness[],
    topicMetrics: Record<EducationalTopicCategory, TopicPerformanceMetrics>,
    evidenceCounts: { trainingAttempts: number; arenaGamesAnalyzed: number; totalMovesAssessed: number }
  ): PersonalizedLearningPlan {
    const nextLessonRec = recommendations.find((r) => r.type === 'next_canonical_lesson');
    const primaryWeakness = weaknesses[0];

    // Priority topics
    const priorityTopics = (Object.keys(topicMetrics) as EducationalTopicCategory[])
      .map((cat) => topicMetrics[cat])
      .filter((m) => m.masteryStatus === 'developing' || m.recentTrend === 'regressing')
      .slice(0, 3)
      .map((m) => ({
        category: m.category,
        title: m.title,
        reason: m.masteryExplanation,
        priority: (weaknesses.some((w) => w.category === m.category && w.severity === 'repeated')
          ? 'critical'
          : 'high') as any,
      }));

    // Review activities
    const reviewActivities = recommendations
      .filter((r) => r.type === 'curriculum_revision' && r.targetLessonId)
      .map((r) => ({
        lessonId: r.targetLessonId!,
        lessonTitle: r.title.replace('Review: ', '').replace('Reinforce: ', ''),
        reason: r.reason,
      }));

    const focusCategory: EducationalTopicCategory = primaryWeakness
      ? primaryWeakness.category
      : nextLessonRec?.targetCategory || 'opening_principles';

    const currentFocus = primaryWeakness
      ? `Remedying ${primaryWeakness.title}`
      : nextLessonRec
      ? `Advancing via ${nextLessonRec.title}`
      : 'Comprehensive Grandmaster Revision';

    const overallHealthSummary = primaryWeakness
      ? `Educational priority: resolve recurring gaps in ${primaryWeakness.title} to reinforce calculation stability.`
      : 'Healthy progression: solid foundational accuracy across completed academy modules.';

    return {
      currentFocus,
      focusCategory,
      recommendedNextLessonId: nextLessonRec?.targetLessonId || 'l-101-board-ranks-files',
      recommendedNextLessonTitle: nextLessonRec?.title.replace('Next Up: ', '') || 'The Board, Coordinates & Piece Movement',
      priorityTopics,
      reviewActivities,
      overallHealthSummary,
      lastUpdatedAt: new Date().toISOString(),
      evidenceCounts,
    };
  }
}
