import type { AssessmentFormatConfig, AssessmentFormatId } from '../types';

export const ARENA_ASSESSMENT_FORMATS: Record<AssessmentFormatId, AssessmentFormatConfig> = {
  single_match: {
    id: 'single_match',
    name: 'Single-Match Diagnostic',
    tagline: 'Deep Classical Rapid Evaluation',
    description:
      'A comprehensive 15+10 classical rapid encounter against a calibrated Stockfish opponent. Measures strategic planning, opening repertoire, positional stability, and endgame technique.',
    timeControl: {
      initialMinutes: 15,
      incrementSeconds: 10,
      label: '15 min + 10s increment',
    },
    totalGames: 1,
    colorRule: 'choice',
    purpose: 'Holistic single-game assessment for identifying core strengths and chronic blunders.',
  },
  five_match_battery: {
    id: 'five_match_battery',
    name: '5-Game Mastery Battery',
    tagline: 'Comprehensive Multi-Game Diagnostic',
    description:
      'Standardized five-game series (10+0) with color balance. Evaluates repertoire consistency, tactical resilience under fatigue, and conversion accuracy across both White and Black perspectives.',
    timeControl: {
      initialMinutes: 10,
      incrementSeconds: 0,
      label: '10 min + 0s increment',
    },
    totalGames: 5,
    colorRule: 'alternating',
    purpose: 'Aggregated statistical sample minimizing single-game variance or opening flukes.',
  },
  tactical_speed: {
    id: 'tactical_speed',
    name: 'Tactical Speed Assessment',
    tagline: 'High-Tempo Blitz Pressure Match',
    description:
      'Fast-paced 5+0 blitz match evaluating instant tactical pattern recognition, time-management discipline, and candidate move filtering under severe clock pressure.',
    timeControl: {
      initialMinutes: 5,
      incrementSeconds: 0,
      label: '5 min + 0s increment',
    },
    totalGames: 1,
    colorRule: 'choice',
    purpose: 'Diagnoses tactical intuition, reflex calculation, and clock panic mistakes.',
  },
};
