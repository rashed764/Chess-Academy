/**
 * Ingestion and normalization of raw learner evidence from Training Academy, Test Arena, and Quick Match.
 */

import type { AcademyProgressState, ActivityHistoryItem } from '../../training/types';
import type { AssessmentReport, AssessmentGameRecord, AnalyzedMoveRecord } from '../../test-arena/types';
import type {
  EducationalTopicCategory,
  EvidenceConfidence,
  EvidenceSourceReference,
} from '../types';
import { LESSON_TOPIC_MAPPINGS, TOPIC_CATEGORY_DEFINITIONS } from './topicTaxonomy';

export interface NormalizedEvidencePoint {
  id: string;
  category: EducationalTopicCategory;
  isSuccess: boolean;
  weight: number; // 1 for training exercise, 1.5 for full assessment game / move
  timestamp: string;
  source: EvidenceSourceReference;
  context: {
    lessonId?: string;
    gameId?: string;
    moveSan?: string;
    evalLossCp?: number;
    quality?: string;
  };
}

export class EvidenceCollector {
  /**
   * Extracts and normalizes all evidence points from available Training progress and Test Arena reports.
   * Guarantees idempotency via unique IDs.
   */
  static extractEvidence(
    progressState: AcademyProgressState | null | undefined,
    arenaReports: AssessmentReport[] | null | undefined
  ): NormalizedEvidencePoint[] {
    const evidence: NormalizedEvidencePoint[] = [];
    const seenIds = new Set<string>();

    // 1. Ingest Training Academy Activity History
    if (progressState && Array.isArray(progressState.activityHistory)) {
      for (const act of progressState.activityHistory) {
        if (!act.lessonId) continue;
        const mapping = LESSON_TOPIC_MAPPINGS[act.lessonId];
        if (!mapping) continue;

        if (act.type === 'exercise_passed' || act.type === 'exercise_failed') {
          const pointId = `train-${act.id}`;
          if (seenIds.has(pointId)) continue;
          seenIds.add(pointId);

          const isSuccess = act.type === 'exercise_passed';
          evidence.push({
            id: pointId,
            category: mapping.category,
            isSuccess,
            weight: 1.0,
            timestamp: act.timestamp,
            source: {
              type: 'training_exercise',
              id: act.lessonId,
              timestamp: act.timestamp,
              detail: `${act.lessonTitle}: ${isSuccess ? 'Solved exercise correctly' : 'Failed attempt on exercise'}`,
            },
            context: {
              lessonId: act.lessonId,
            },
          });
        }
      }

      // Also ingest completed lessons as evidence of competence if not already logged in activity
      for (const lessonId of progressState.completedLessonIds) {
        const mapping = LESSON_TOPIC_MAPPINGS[lessonId];
        if (!mapping) continue;
        const progressRec = progressState.lessonProgress[lessonId];
        const pointId = `train-completed-${lessonId}`;
        if (seenIds.has(pointId)) continue;
        seenIds.add(pointId);

        evidence.push({
          id: pointId,
          category: mapping.category,
          isSuccess: true,
          weight: 1.0,
          timestamp: progressRec?.completedAt || progressState.lastActiveAt,
          source: {
            type: 'training_exercise',
            id: lessonId,
            timestamp: progressRec?.completedAt || progressState.lastActiveAt,
            detail: `Verified lesson mastery on ${mapping.topicTitle}`,
          },
          context: {
            lessonId,
          },
        });
      }
    }

    // 2. Ingest Test Arena Assessments
    if (Array.isArray(arenaReports)) {
      for (const report of arenaReports) {
        if (!report || !Array.isArray(report.games)) continue;

        for (const game of report.games) {
          if (!game || !Array.isArray(game.moves)) continue;

          // Ingest Game-Level Overall Accuracy & ACPL into calculation accuracy
          const gamePointId = `arena-game-${game.gameId}`;
          if (!seenIds.has(gamePointId)) {
            seenIds.add(gamePointId);
            const isSoundGame = game.acpl <= 45 && game.accuracyPercent >= 80;
            evidence.push({
              id: gamePointId,
              category: 'calculation_accuracy',
              isSuccess: isSoundGame,
              weight: 2.0,
              timestamp: game.completedAt || report.createdAt,
              source: {
                type: 'test_arena_assessment',
                id: report.id,
                timestamp: game.completedAt || report.createdAt,
                detail: `Test Arena ${report.formatName} Game: ACPL ${game.acpl} cp, Accuracy ${game.accuracyPercent}%`,
              },
              context: {
                gameId: game.gameId,
                evalLossCp: game.acpl,
              },
            });
          }

          // Ingest Phase-Specific Performance from Game Record
          if (game.phaseBreakdown) {
            // Opening Phase
            if (game.phaseBreakdown.opening && game.phaseBreakdown.opening.movesCount >= 3) {
              const op = game.phaseBreakdown.opening;
              const opErrors = (op.classificationCounts.blunder || 0) + (op.classificationCounts.mistake || 0);
              const opSuccess = opErrors === 0 && (op.acpl ? op.acpl <= 35 : true);
              const opPointId = `arena-op-${game.gameId}`;
              if (!seenIds.has(opPointId)) {
                seenIds.add(opPointId);
                evidence.push({
                  id: opPointId,
                  category: 'opening_principles',
                  isSuccess: opSuccess,
                  weight: 1.5,
                  timestamp: game.completedAt || report.createdAt,
                  source: {
                    type: 'test_arena_assessment',
                    id: report.id,
                    timestamp: game.completedAt || report.createdAt,
                    detail: `Opening phase: ${op.movesCount} moves, ${opErrors} significant errors`,
                  },
                  context: { gameId: game.gameId },
                });
              }
            }

            // Endgame Phase
            if (game.phaseBreakdown.endgame && game.phaseBreakdown.endgame.movesCount >= 3) {
              const eg = game.phaseBreakdown.endgame;
              const egErrors = (eg.classificationCounts.blunder || 0) + (eg.classificationCounts.mistake || 0);
              const egSuccess = egErrors === 0 && (eg.acpl ? eg.acpl <= 40 : true);
              const egPointId = `arena-eg-${game.gameId}`;
              if (!seenIds.has(egPointId)) {
                seenIds.add(egPointId);
                evidence.push({
                  id: egPointId,
                  category: 'endgame_fundamentals',
                  isSuccess: egSuccess,
                  weight: 1.5,
                  timestamp: game.completedAt || report.createdAt,
                  source: {
                    type: 'test_arena_assessment',
                    id: report.id,
                    timestamp: game.completedAt || report.createdAt,
                    detail: `Endgame phase: ${eg.movesCount} moves, ${egErrors} significant errors`,
                  },
                  context: { gameId: game.gameId },
                });
              }
            }
          }

          // Ingest Evaluated Moves of Player
          for (const move of game.moves) {
            if (move.color !== game.playerColor) continue;

            const movePointId = `arena-move-${game.gameId}-ply-${move.ply}`;
            if (seenIds.has(movePointId)) continue;
            seenIds.add(movePointId);

            // Blunder / Hanging Piece Detection
            if (move.quality === 'blunder') {
              evidence.push({
                id: `${movePointId}-blunder`,
                category: 'hanging_pieces_blunders',
                isSuccess: false,
                weight: 1.5,
                timestamp: game.completedAt || report.createdAt,
                source: {
                  type: 'test_arena_assessment',
                  id: report.id,
                  timestamp: game.completedAt || report.createdAt,
                  detail: `Move ${move.san} on move ${move.moveNumber} classified as Blunder (loss ${move.evalLossCp ?? '200+'} cp)`,
                },
                context: {
                  gameId: game.gameId,
                  moveSan: move.san,
                  evalLossCp: move.evalLossCp,
                  quality: move.quality,
                },
              });
            } else if (move.quality === 'best' || move.quality === 'brilliant') {
              evidence.push({
                id: `${movePointId}-sound`,
                category: 'calculation_accuracy',
                isSuccess: true,
                weight: 0.5,
                timestamp: game.completedAt || report.createdAt,
                source: {
                  type: 'test_arena_assessment',
                  id: report.id,
                  timestamp: game.completedAt || report.createdAt,
                  detail: `Move ${move.san} engine top choice (${move.quality})`,
                },
                context: {
                  gameId: game.gameId,
                  moveSan: move.san,
                  quality: move.quality,
                },
              });
            }
          }
        }
      }
    }

    // Sort evidence points by timestamp ascending
    return evidence.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  /**
   * Computes evidence confidence tier based on sample counts.
   */
  static determineConfidence(sampleCount: number, category: EducationalTopicCategory): EvidenceConfidence {
    const config = TOPIC_CATEGORY_DEFINITIONS[category].thresholds;
    if (sampleCount < config.minSamplesForConfidence) {
      return 'insufficient';
    }
    if (sampleCount < config.moderateConfidenceThreshold) {
      return 'low';
    }
    if (sampleCount < config.highConfidenceThreshold) {
      return 'moderate';
    }
    return 'high';
  }
}
