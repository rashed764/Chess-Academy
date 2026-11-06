/**
 * Core domain types and interfaces for TASK 08: Personalized Learning Engine.
 */

import type { AcademyLevelId } from '../training/types';
import type { MoveQuality } from '../../types/ai';

export type WeaknessSeverity = 'potential' | 'confirmed' | 'repeated';

export type EvidenceConfidence = 'insufficient' | 'low' | 'moderate' | 'high';

export type MasteryStatus =
  | 'insufficient_data'
  | 'developing'
  | 'competent'
  | 'proficient'
  | 'mastered';

export type EducationalTopicCategory =
  | 'tactical_patterns'
  | 'hanging_pieces_blunders'
  | 'checkmate_patterns'
  | 'king_safety'
  | 'opening_principles'
  | 'piece_activity_development'
  | 'positional_understanding'
  | 'endgame_fundamentals'
  | 'calculation_accuracy'
  | 'time_management';

export interface EvidenceSourceReference {
  type: 'training_exercise' | 'test_arena_assessment' | 'quick_match';
  id: string;
  timestamp: string;
  detail: string;
}

export interface DetectedWeakness {
  id: string;
  category: EducationalTopicCategory;
  title: string;
  description: string;
  severity: WeaknessSeverity;
  confidence: EvidenceConfidence;
  evidenceCount: number;
  sampleCount: number;
  recentErrorCount: number;
  firstObservedAt: string;
  lastObservedAt: string;
  relatedLessonIds: string[];
  supportingEvidence: EvidenceSourceReference[];
  pedagogicalRemedy: string;
}

export interface ConfirmedStrength {
  id: string;
  category: EducationalTopicCategory;
  title: string;
  description: string;
  confidence: EvidenceConfidence;
  sampleCount: number;
  accuracyOrSuccessRate: number;
  supportingEvidence: EvidenceSourceReference[];
}

export interface TopicPerformanceMetrics {
  category: EducationalTopicCategory;
  title: string;
  totalAttempts: number;
  successfulAttempts: number;
  failedAttempts: number;
  successRate: number;
  recentTrend: 'improving' | 'stable' | 'regressing' | 'insufficient_evidence';
  confidence: EvidenceConfidence;
  masteryStatus: MasteryStatus;
  masteryExplanation: string;
  associatedLessonIds: string[];
  lastAssessedAt?: string;
}

export type RecommendationType =
  | 'next_canonical_lesson'
  | 'curriculum_revision'
  | 'targeted_weakness_remedy'
  | 'speed_or_tactical_drill'
  | 'arena_assessment_check';

export type RecommendationPriority = 'critical' | 'high' | 'recommended' | 'optional';

export interface PersonalizedRecommendation {
  id: string;
  type: RecommendationType;
  priority: RecommendationPriority;
  title: string;
  reason: string;
  supportingEvidence: string;
  targetCategory: EducationalTopicCategory;
  targetLessonId?: string;
  targetExerciseId?: string;
  targetLevelId?: AcademyLevelId;
  estimatedMinutes?: number;
  actionUrl: string;
  actionLabel: string;
}

export interface PersonalizedLearningPlan {
  currentFocus: string;
  focusCategory: EducationalTopicCategory;
  recommendedNextLessonId: string;
  recommendedNextLessonTitle: string;
  priorityTopics: Array<{
    category: EducationalTopicCategory;
    title: string;
    reason: string;
    priority: RecommendationPriority;
  }>;
  reviewActivities: Array<{
    lessonId: string;
    lessonTitle: string;
    reason: string;
  }>;
  overallHealthSummary: string;
  lastUpdatedAt: string;
  evidenceCounts: {
    trainingAttempts: number;
    arenaGamesAnalyzed: number;
    totalMovesAssessed: number;
  };
}

export interface LearnerPerformanceProfile {
  version: number;
  lastCalculatedAt: string;
  totalEvidencePoints: number;
  hasSufficientData: boolean;
  strengths: ConfirmedStrength[];
  weaknesses: DetectedWeakness[];
  insufficientEvidenceAreas: EducationalTopicCategory[];
  topicMetrics: Record<EducationalTopicCategory, TopicPerformanceMetrics>;
  activePlan: PersonalizedLearningPlan;
  recommendations: PersonalizedRecommendation[];
}
