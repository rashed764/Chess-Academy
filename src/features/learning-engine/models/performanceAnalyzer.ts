/**
 * Pure evaluation engine for calculating topic performance metrics,
 * detecting confirmed strengths, and diagnosing educational weaknesses.
 */

import type {
  EducationalTopicCategory,
  ConfirmedStrength,
  DetectedWeakness,
  TopicPerformanceMetrics,
  MasteryStatus,
  WeaknessSeverity,
} from '../types';
import { TOPIC_CATEGORY_DEFINITIONS, LESSON_TOPIC_MAPPINGS } from './topicTaxonomy';
import { EvidenceCollector, type NormalizedEvidencePoint } from './evidenceCollector';

export class PerformanceAnalyzer {
  /**
   * Calculates comprehensive topic performance metrics across all 10 educational categories.
   */
  static analyzeTopicMetrics(evidencePoints: NormalizedEvidencePoint[]): Record<EducationalTopicCategory, TopicPerformanceMetrics> {
    const categories = Object.keys(TOPIC_CATEGORY_DEFINITIONS) as EducationalTopicCategory[];
    const result = {} as Record<EducationalTopicCategory, TopicPerformanceMetrics>;

    for (const cat of categories) {
      const def = TOPIC_CATEGORY_DEFINITIONS[cat];
      const points = evidencePoints.filter((p) => p.category === cat);
      const totalAttempts = points.length;

      // Associated lessons for this category
      const associatedLessonIds = Object.values(LESSON_TOPIC_MAPPINGS)
        .filter((m) => m.category === cat)
        .map((m) => m.lessonId);

      if (totalAttempts === 0) {
        result[cat] = {
          category: cat,
          title: def.title,
          totalAttempts: 0,
          successfulAttempts: 0,
          failedAttempts: 0,
          successRate: 0,
          recentTrend: 'insufficient_evidence',
          confidence: 'insufficient',
          masteryStatus: 'insufficient_data',
          masteryExplanation: 'No training or assessment data recorded yet in this discipline.',
          associatedLessonIds,
        };
        continue;
      }

      const successfulAttempts = points.filter((p) => p.isSuccess).length;
      const failedAttempts = totalAttempts - successfulAttempts;
      const successRate = Math.round((successfulAttempts / totalAttempts) * 100);

      const confidence = EvidenceCollector.determineConfidence(totalAttempts, cat);

      // Determine Recent Trend (last 4 samples vs earlier samples)
      let recentTrend: TopicPerformanceMetrics['recentTrend'] = 'insufficient_evidence';
      if (totalAttempts >= 4) {
        const recentPoints = points.slice(-4);
        const olderPoints = points.slice(0, -4);
        const recentSuccessRate = recentPoints.filter((p) => p.isSuccess).length / recentPoints.length;
        const olderSuccessRate = olderPoints.length > 0
          ? olderPoints.filter((p) => p.isSuccess).length / olderPoints.length
          : recentSuccessRate;

        if (recentSuccessRate >= olderSuccessRate + 0.15) {
          recentTrend = 'improving';
        } else if (recentSuccessRate <= olderSuccessRate - 0.2) {
          recentTrend = 'regressing';
        } else {
          recentTrend = 'stable';
        }
      }

      // Determine Mastery Status
      let masteryStatus: MasteryStatus = 'insufficient_data';
      let masteryExplanation = '';

      if (confidence === 'insufficient') {
        masteryStatus = 'insufficient_data';
        masteryExplanation = `Preliminary: ${totalAttempts} sample(s). Minimum ${def.thresholds.minSamplesForConfidence} required for evaluation.`;
      } else if (successRate >= Math.round(def.thresholds.masterySuccessRateThreshold * 100) && confidence === 'high') {
        masteryStatus = 'mastered';
        masteryExplanation = `Demonstrated outstanding consistency (${successRate}% accuracy across ${totalAttempts} verified assessments).`;
      } else if (successRate >= 80 && (confidence === 'moderate' || confidence === 'high')) {
        masteryStatus = 'proficient';
        masteryExplanation = `Sound operational understanding with reliable execution (${successRate}% success rate).`;
      } else if (successRate >= 60) {
        masteryStatus = 'competent';
        masteryExplanation = `Working grasp of foundational concepts, with occasional conversion errors (${successRate}% success rate).`;
      } else {
        masteryStatus = 'developing';
        masteryExplanation = `Active area of learning: ${failedAttempts} errors in ${totalAttempts} verified attempts (${successRate}% success rate).`;
      }

      const lastAssessedAt = points.length > 0 ? points[points.length - 1].timestamp : undefined;

      result[cat] = {
        category: cat,
        title: def.title,
        totalAttempts,
        successfulAttempts,
        failedAttempts,
        successRate,
        recentTrend,
        confidence,
        masteryStatus,
        masteryExplanation,
        associatedLessonIds,
        lastAssessedAt,
      };
    }

    return result;
  }

  /**
   * Detects confirmed pedagogical strengths based on verifiable evidence.
   */
  static detectStrengths(
    topicMetrics: Record<EducationalTopicCategory, TopicPerformanceMetrics>,
    evidencePoints: NormalizedEvidencePoint[]
  ): ConfirmedStrength[] {
    const strengths: ConfirmedStrength[] = [];

    for (const cat of Object.keys(topicMetrics) as EducationalTopicCategory[]) {
      const metric = topicMetrics[cat];
      if (metric.confidence === 'insufficient') continue;

      // Strength criterion: >=80% success rate with at least low/moderate confidence
      if (metric.successRate >= 80 && metric.totalAttempts >= TOPIC_CATEGORY_DEFINITIONS[cat].thresholds.minSamplesForConfidence) {
        const catEvidence = evidencePoints
          .filter((p) => p.category === cat && p.isSuccess)
          .slice(-3)
          .map((p) => p.source);

        let desc = '';
        if (metric.masteryStatus === 'mastered') {
          desc = `Exceptional mastery in ${metric.title}: ${metric.successRate}% precision across ${metric.totalAttempts} verified evaluations.`;
        } else {
          desc = `Strong demonstrated competence in ${metric.title} (${metric.successRate}% precision over ${metric.totalAttempts} trials).`;
        }

        strengths.push({
          id: `str-${cat}`,
          category: cat,
          title: `Proficiency: ${metric.title}`,
          description: desc,
          confidence: metric.confidence,
          sampleCount: metric.totalAttempts,
          accuracyOrSuccessRate: metric.successRate,
          supportingEvidence: catEvidence,
        });
      }
    }

    // Sort strengths by accuracy descending
    return strengths.sort((a, b) => b.accuracyOrSuccessRate - a.accuracyOrSuccessRate);
  }

  /**
   * Detects verified educational weaknesses.
   * Never labels an area weak without sufficient evidence or based on a single isolated failure.
   */
  static detectWeaknesses(
    topicMetrics: Record<EducationalTopicCategory, TopicPerformanceMetrics>,
    evidencePoints: NormalizedEvidencePoint[]
  ): DetectedWeakness[] {
    const weaknesses: DetectedWeakness[] = [];

    for (const cat of Object.keys(topicMetrics) as EducationalTopicCategory[]) {
      const metric = topicMetrics[cat];
      const def = TOPIC_CATEGORY_DEFINITIONS[cat];

      // Rule: Do NOT infer a weakness from missing data or insufficient samples
      if (metric.confidence === 'insufficient') continue;

      const failedPoints = evidencePoints.filter((p) => p.category === cat && !p.isSuccess);
      const failCount = failedPoints.length;

      // Rule: A single failed exercise or isolated error is NEVER a permanent weakness
      if (failCount < 2) continue;

      const errorRate = failCount / metric.totalAttempts;

      if (errorRate >= def.thresholds.weaknessErrorRateThreshold) {
        // Classify Severity
        let severity: WeaknessSeverity = 'potential';
        if (failCount >= 4 && errorRate >= 0.5) {
          severity = 'repeated';
        } else if (failCount >= 2 && metric.confidence !== 'low') {
          severity = 'confirmed';
        }

        const supportingSources = failedPoints.slice(-4).map((p) => p.source);
        const firstObservedAt = failedPoints[0].timestamp;
        const lastObservedAt = failedPoints[failedPoints.length - 1].timestamp;

        // Pedagogical Remedy
        const relatedLessons = metric.associatedLessonIds;
        const remedy = `Revisit core principles in ${metric.title} and solve targeted exercise drills before advancing.`;

        weaknesses.push({
          id: `weak-${cat}`,
          category: cat,
          title: `${severity === 'repeated' ? 'Recurring Gap' : 'Target Area'}: ${metric.title}`,
          description: `Observed ${failCount} errors across ${metric.totalAttempts} verified evaluations (${Math.round(errorRate * 100)}% error frequency).`,
          severity,
          confidence: metric.confidence,
          evidenceCount: failCount,
          sampleCount: metric.totalAttempts,
          recentErrorCount: failedPoints.slice(-3).length,
          firstObservedAt,
          lastObservedAt,
          relatedLessonIds: relatedLessons,
          supportingEvidence: supportingSources,
          pedagogicalRemedy: remedy,
        });
      }
    }

    // Sort weaknesses by severity: repeated > confirmed > potential, then evidence count
    const severityWeight: Record<WeaknessSeverity, number> = {
      repeated: 3,
      confirmed: 2,
      potential: 1,
    };

    return weaknesses.sort((a, b) => {
      const diff = severityWeight[b.severity] - severityWeight[a.severity];
      if (diff !== 0) return diff;
      return b.evidenceCount - a.evidenceCount;
    });
  }
}
