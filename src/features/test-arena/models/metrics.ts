import type { MoveQuality } from '../../../types/ai';
import type {
  AnalyzedMoveRecord,
  AssessmentGameRecord,
  EstimatedSkillRange,
  GamePhase,
  PhaseMetrics,
} from '../types';
import { calculateAccuracyFromAcpl } from './analysisEngine';

export const INITIAL_CLASSIFICATION_COUNTS: Record<MoveQuality, number> = {
  brilliant: 0,
  best: 0,
  good: 0,
  inaccuracy: 0,
  mistake: 0,
  blunder: 0,
  unclassified: 0,
};

/**
 * Calculates phase-specific metrics for opening, middlegame, or endgame moves.
 */
export function calculatePhaseMetrics(moves: AnalyzedMoveRecord[], phase: GamePhase): PhaseMetrics {
  const phaseMoves = moves.filter((m) => m.phase === phase);
  const counts = { ...INITIAL_CLASSIFICATION_COUNTS };

  let totalLoss = 0;
  let validLossCount = 0;

  for (const m of phaseMoves) {
    counts[m.quality] = (counts[m.quality] || 0) + 1;
    if (m.evalLossCp !== undefined && !isNaN(m.evalLossCp)) {
      totalLoss += m.evalLossCp;
      validLossCount++;
    }
  }

  const acpl = validLossCount > 0 ? Math.round((totalLoss / validLossCount) * 10) / 10 : undefined;
  const accuracyPercent = acpl !== undefined ? calculateAccuracyFromAcpl(acpl) : undefined;

  const observations: string[] = [];
  if (phaseMoves.length === 0) {
    observations.push(`No ${phase} moves reached in this game.`);
  } else {
    if (counts.blunder > 0) {
      observations.push(`${counts.blunder} major blunder${counts.blunder > 1 ? 's' : ''} in the ${phase}.`);
    }
    if (counts.mistake > 0) {
      observations.push(`${counts.mistake} mistake${counts.mistake > 1 ? 's' : ''} occurred during the ${phase}.`);
    }
    if (counts.best + counts.good >= Math.ceil(phaseMoves.length * 0.7)) {
      observations.push(`Strong piece coordination and sound play throughout the ${phase}.`);
    }
    if (observations.length === 0) {
      observations.push(`Solid positional handling in the ${phase}.`);
    }
  }

  return {
    movesCount: phaseMoves.length,
    acpl,
    accuracyPercent,
    classificationCounts: counts,
    observations,
  };
}

/**
 * Calculates game-level summary metrics from analyzed player moves.
 */
export function calculateGameMetrics(playerMoves: AnalyzedMoveRecord[]): {
  acpl: number;
  accuracyPercent: number;
  classificationCounts: Record<MoveQuality, number>;
  phaseBreakdown: {
    opening: PhaseMetrics;
    middlegame: PhaseMetrics;
    endgame: PhaseMetrics;
  };
} {
  const counts = { ...INITIAL_CLASSIFICATION_COUNTS };
  let totalLoss = 0;
  let validCount = 0;

  for (const m of playerMoves) {
    counts[m.quality] = (counts[m.quality] || 0) + 1;
    if (m.evalLossCp !== undefined && !isNaN(m.evalLossCp)) {
      totalLoss += m.evalLossCp;
      validCount++;
    }
  }

  const acpl = validCount > 0 ? Math.round((totalLoss / validCount) * 10) / 10 : 0;
  const accuracyPercent = calculateAccuracyFromAcpl(acpl);

  const phaseBreakdown = {
    opening: calculatePhaseMetrics(playerMoves, 'opening'),
    middlegame: calculatePhaseMetrics(playerMoves, 'middlegame'),
    endgame: calculatePhaseMetrics(playerMoves, 'endgame'),
  };

  return {
    acpl,
    accuracyPercent,
    classificationCounts: counts,
    phaseBreakdown,
  };
}

/**
 * Generates transparent estimated skill range.
 *
 * IMPORTANT: Strictly disclosed as an experimental engine-relative estimate,
 * NOT an official FIDE rating or verified human tournament performance.
 */
export function estimateSkillRange(
  acpl: number,
  accuracy: number,
  opponentSkillLevel: number
): EstimatedSkillRange {
  // Approximate engine skill baseline: Stockfish skill level 1 ~ 1100 up to level 20 ~ 2800
  const engineBaseRating = 1000 + opponentSkillLevel * 75;

  let performanceOffset = 0;
  if (accuracy >= 90) performanceOffset += 200;
  else if (accuracy >= 80) performanceOffset += 100;
  else if (accuracy >= 70) performanceOffset += 0;
  else if (accuracy >= 60) performanceOffset -= 100;
  else performanceOffset -= 250;

  const estimatedCenter = Math.max(800, Math.min(2600, engineBaseRating + performanceOffset));
  const rangeMin = Math.max(700, Math.round((estimatedCenter - 100) / 50) * 50);
  const rangeMax = Math.min(2700, Math.round((estimatedCenter + 100) / 50) * 50);

  let label = 'Club Player';
  if (estimatedCenter < 1200) label = 'Novice / Developing';
  else if (estimatedCenter < 1500) label = 'Intermediate Competitor';
  else if (estimatedCenter < 1800) label = 'Club Candidate';
  else if (estimatedCenter < 2100) label = 'Advanced Tactician';
  else label = 'Expert / Master Tier';

  return {
    label,
    rangeMin,
    rangeMax,
    description: `Estimated based on ${acpl} ACPL and ${accuracy}% accuracy against Stockfish Skill Level ${opponentSkillLevel}.`,
    disclaimer:
      'Disclaimer: This is an experimental, engine-relative educational indicator. It is NOT an official FIDE rating and does not guarantee human tournament performance.',
  };
}

/**
 * Derives qualitative strengths, weaknesses, tactical and time observations from analyzed games.
 */
export function deriveObservations(
  games: AssessmentGameRecord[],
  overallAcpl: number,
  overallAccuracy: number,
  counts: Record<MoveQuality, number>
): {
  strengths: string[];
  weaknesses: string[];
  tacticalObservations: string[];
  timeObservations: string[];
  recommendations: string[];
} {
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const tacticalObservations: string[] = [];
  const timeObservations: string[] = [];
  const recommendations: string[] = [];

  const totalPlayerMoves = Object.values(counts).reduce((a, b) => a + b, 0);
  const bestGoodCount = counts.best + counts.good;
  const bestGoodRatio = totalPlayerMoves > 0 ? bestGoodCount / totalPlayerMoves : 0;

  // Strengths
  if (bestGoodRatio >= 0.75) {
    strengths.push('High foundational move discipline: over 75% of moves matched top engine choices.');
  }
  if (counts.brilliant > 0) {
    strengths.push(`Tactical brilliance: successfully executed ${counts.brilliant} verified sacrifice(s) maintaining decisive advantage.`);
  }
  if (overallAcpl <= 40) {
    strengths.push(`Precise calculation: low average centipawn loss of ${overallAcpl} cp demonstrates sharp board control.`);
  }
  if (strengths.length === 0) {
    strengths.push('Demonstrated resilience by completing the full unbiased assessment protocol without assistance.');
  }

  // Weaknesses
  if (counts.blunder >= 2) {
    weaknesses.push(`Tactical oversights: ${counts.blunder} major blunder(s) (>200 cp loss or lost mates) altered the game balance.`);
  }
  if (counts.mistake >= 3) {
    weaknesses.push(`Positional compromises: ${counts.mistake} noticeable mistakes ceded active counterplay to the engine.`);
  }
  if (overallAcpl > 90) {
    weaknesses.push(`High evaluation volatility (ACPL ${overallAcpl} cp): suggests difficulty calculating candidate moves in complex positions.`);
  }
  if (weaknesses.length === 0) {
    weaknesses.push('Minor conversion inaccuracies during quiet transition phases.');
  }

  // Tactical Observations
  if (counts.blunder === 0 && counts.mistake <= 1) {
    tacticalObservations.push('Clean tactical hygiene: avoided major piece hanging and defended against enemy threats.');
  } else {
    tacticalObservations.push('Vulnerability to forcing opponent replies: focus on checking all checks, captures, and threats before committing.');
  }

  // Time observations from spent time in games
  let hasTimeTrouble = false;
  for (const g of games) {
    const timeSpentMoves = g.moves.filter((m) => m.color === g.playerColor && (m.spentTimeMs || 0) > 30000);
    if (timeSpentMoves.length >= 3) {
      hasTimeTrouble = true;
      break;
    }
  }
  if (hasTimeTrouble) {
    timeObservations.push('Significant clock consumption in critical moves: calculate candidate moves systematically to avoid severe time pressure.');
  } else {
    timeObservations.push('Steady pacing: distributed thinking time evenly without severe clock hesitation.');
  }

  // Recommendations
  if (counts.blunder > 0) {
    recommendations.push('Study Training Academy Level 2 Tactical Patterns (Forks, Pins, and Back-Rank Mates) to eliminate hanging pieces.');
  }
  if (overallAcpl > 60) {
    recommendations.push('Review Level 4 Positional Play and Piece Coordination to maintain pressure in equal middlegame structures.');
  }
  recommendations.push('Replay the analyzed game moves in Game Analysis to understand engine candidate lines and defensive resources.');

  return {
    strengths,
    weaknesses,
    tacticalObservations,
    timeObservations,
    recommendations,
  };
}

/**
 * Aggregates multiple games for a full assessment report (such as 5-Game Mastery Battery).
 * Aggregates underlying move data directly to prevent unweighted percentage skew.
 */
export function aggregateAssessmentGames(games: AssessmentGameRecord[]): {
  wins: number;
  losses: number;
  draws: number;
  totalMoves: number;
  playerMovesCount: number;
  acpl: number;
  accuracyPercent: number;
  classificationCounts: Record<MoveQuality, number>;
  bestMovesPercent: number;
  phaseBreakdown: {
    opening: PhaseMetrics;
    middlegame: PhaseMetrics;
    endgame: PhaseMetrics;
  };
  strengths: string[];
  weaknesses: string[];
  tacticalObservations: string[];
  timeObservations: string[];
  estimatedSkillRange?: EstimatedSkillRange;
  recommendations: string[];
  methodologyNote: string;
} {
  let wins = 0;
  let losses = 0;
  let draws = 0;
  let totalMoves = 0;
  let totalLoss = 0;
  let validCount = 0;

  const allPlayerMoves: AnalyzedMoveRecord[] = [];
  const counts = { ...INITIAL_CLASSIFICATION_COUNTS };

  for (const g of games) {
    if (g.winner === 'draw') draws++;
    else if (g.playerWon) wins++;
    else losses++;

    totalMoves += g.moves.length;
    const playerMoves = g.moves.filter((m) => m.color === g.playerColor);
    allPlayerMoves.push(...playerMoves);

    for (const m of playerMoves) {
      counts[m.quality] = (counts[m.quality] || 0) + 1;
      if (m.evalLossCp !== undefined && !isNaN(m.evalLossCp)) {
        totalLoss += m.evalLossCp;
        validCount++;
      }
    }
  }

  const acpl = validCount > 0 ? Math.round((totalLoss / validCount) * 10) / 10 : 0;
  const accuracyPercent = calculateAccuracyFromAcpl(acpl);
  const bestMovesPercent =
    allPlayerMoves.length > 0
      ? Math.round((counts.best / allPlayerMoves.length) * 1000) / 10
      : 0;

  const phaseBreakdown = {
    opening: calculatePhaseMetrics(allPlayerMoves, 'opening'),
    middlegame: calculatePhaseMetrics(allPlayerMoves, 'middlegame'),
    endgame: calculatePhaseMetrics(allPlayerMoves, 'endgame'),
  };

  const observations = deriveObservations(games, acpl, accuracyPercent, counts);
  const avgSkillLevel =
    games.length > 0
      ? Math.round(games.reduce((acc, g) => acc + g.opponentDifficulty.skillLevel, 0) / games.length)
      : 6;

  const estimatedSkillRange = estimateSkillRange(acpl, accuracyPercent, avgSkillLevel);

  return {
    wins,
    losses,
    draws,
    totalMoves,
    playerMovesCount: allPlayerMoves.length,
    acpl,
    accuracyPercent,
    classificationCounts: counts,
    bestMovesPercent,
    phaseBreakdown,
    strengths: observations.strengths,
    weaknesses: observations.weaknesses,
    tacticalObservations: observations.tacticalObservations,
    timeObservations: observations.timeObservations,
    estimatedSkillRange,
    recommendations: observations.recommendations,
    methodologyNote:
      'Accuracy calculated using custom educational formula: 100 * exp(-0.004 * ACPL). Centipawn evaluations calculated strictly from mover perspective using client-side Stockfish WASM. Not an official FIDE classification.',
  };
}
