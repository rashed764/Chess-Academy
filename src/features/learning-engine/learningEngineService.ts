/**
 * Coordinator service for building and updating the Learner Performance Profile.
 * Pure deterministic calculation with optional asynchronous explanation enricher.
 */

import { ProgressStorage } from '../training/models/progressStorage';
import { TestArenaStorage } from '../test-arena/models/storage';
import type { AcademyProgressState } from '../training/types';
import type { AssessmentReport } from '../test-arena/types';
import type {
  LearnerPerformanceProfile,
  EducationalTopicCategory,
} from './types';
import { EvidenceCollector } from './models/evidenceCollector';
import { PerformanceAnalyzer } from './models/performanceAnalyzer';
import { RecommendationEngine } from './models/recommendationEngine';
import { LearningEngineStorage, LEARNER_PROFILE_VERSION } from './models/storage';

export class LearningEngineService {
  /**
   * Generates or refreshes the full Learner Performance Profile based on
   * current Training Academy progress and Test Arena assessments.
   */
  static computeProfile(
    customProgress?: AcademyProgressState | null,
    customReports?: AssessmentReport[] | null
  ): LearnerPerformanceProfile {
    const progress = customProgress !== undefined ? customProgress : ProgressStorage.loadProgress();
    const reports = customReports !== undefined ? customReports : TestArenaStorage.getReports();

    // 1. Ingest Evidence
    const evidencePoints = EvidenceCollector.extractEvidence(progress, reports);

    // 2. Calculate Topic Performance Metrics
    const topicMetrics = PerformanceAnalyzer.analyzeTopicMetrics(evidencePoints);

    // 3. Detect Confirmed Strengths
    const strengths = PerformanceAnalyzer.detectStrengths(topicMetrics, evidencePoints);

    // 4. Detect Educational Weaknesses
    const weaknesses = PerformanceAnalyzer.detectWeaknesses(topicMetrics, evidencePoints);

    // 5. Identify Insufficient Evidence Areas
    const insufficientEvidenceAreas = (Object.keys(topicMetrics) as EducationalTopicCategory[]).filter(
      (cat) => topicMetrics[cat].confidence === 'insufficient'
    );

    // 6. Generate Recommendations
    const arenaCompletedCount = reports ? reports.filter((r) => r.status === 'completed').length : 0;
    const recommendations = RecommendationEngine.generateRecommendations(
      progress,
      weaknesses,
      strengths,
      topicMetrics,
      arenaCompletedCount
    );

    // 7. Generate Personalized Learning Plan
    const totalMovesAssessed = reports
      ? reports.reduce(
          (sum, r) => sum + (r.games ? r.games.reduce((gSum, g) => gSum + (g.moves ? g.moves.length : 0), 0) : 0),
          0
        )
      : 0;

    const activePlan = RecommendationEngine.generateLearningPlan(
      progress,
      recommendations,
      weaknesses,
      topicMetrics,
      {
        trainingAttempts: progress?.totalExerciseAttempts || 0,
        arenaGamesAnalyzed: reports ? reports.reduce((s, r) => s + (r.games ? r.games.length : 0), 0) : 0,
        totalMovesAssessed,
      }
    );

    const profile: LearnerPerformanceProfile = {
      version: LEARNER_PROFILE_VERSION,
      lastCalculatedAt: new Date().toISOString(),
      totalEvidencePoints: evidencePoints.length,
      hasSufficientData: evidencePoints.length >= 3,
      strengths,
      weaknesses,
      insufficientEvidenceAreas,
      topicMetrics,
      activePlan,
      recommendations,
    };

    // Save to local storage
    LearningEngineStorage.saveProfile(profile);

    return profile;
  }

  /**
   * Loads cached profile or calculates fresh profile if not yet stored.
   */
  static getOrComputeProfile(): LearnerPerformanceProfile {
    const cached = LearningEngineStorage.getProfile();
    if (cached) {
      return cached;
    }
    return this.computeProfile();
  }
}
