/**
 * Declarative topic classification and taxonomy mapping for all 30 canonical lessons.
 */

import type { EducationalTopicCategory } from '../types';

export interface LessonTopicMapping {
  lessonId: string;
  category: EducationalTopicCategory;
  topicTitle: string;
  tags: string[];
}

export const TOPIC_CATEGORY_DEFINITIONS: Record<
  EducationalTopicCategory,
  {
    title: string;
    description: string;
    thresholds: {
      minSamplesForConfidence: number; // minimum attempts before moving out of 'insufficient'
      moderateConfidenceThreshold: number;
      highConfidenceThreshold: number;
      weaknessErrorRateThreshold: number; // e.g. 0.45 = >45% fail rate indicates weakness
      masterySuccessRateThreshold: number; // e.g. 0.85 = >=85% success indicates mastery
    };
  }
> = {
  tactical_patterns: {
    title: 'Tactical Pattern Recognition',
    description: 'Detection and execution of double attacks, forks, pins, skewers, deflections, and decoys.',
    thresholds: {
      minSamplesForConfidence: 3,
      moderateConfidenceThreshold: 6,
      highConfidenceThreshold: 12,
      weaknessErrorRateThreshold: 0.4,
      masterySuccessRateThreshold: 0.85,
    },
  },
  hanging_pieces_blunders: {
    title: 'Hanging Pieces & Blunder Avoidance',
    description: 'Vigilance against leaving pieces undefended or committing catastrophic one-move blunders.',
    thresholds: {
      minSamplesForConfidence: 3,
      moderateConfidenceThreshold: 6,
      highConfidenceThreshold: 12,
      weaknessErrorRateThreshold: 0.35,
      masterySuccessRateThreshold: 0.9,
    },
  },
  checkmate_patterns: {
    title: 'Checkmate Execution & Defense',
    description: 'Constructing mating nets, back-rank patterns, and defending against enemy mating attacks.',
    thresholds: {
      minSamplesForConfidence: 3,
      moderateConfidenceThreshold: 5,
      highConfidenceThreshold: 10,
      weaknessErrorRateThreshold: 0.35,
      masterySuccessRateThreshold: 0.85,
    },
  },
  king_safety: {
    title: 'King Safety & Castling Hygiene',
    description: 'Castling timing, pawn shield preservation, and recognizing vulnerable king shelter.',
    thresholds: {
      minSamplesForConfidence: 2,
      moderateConfidenceThreshold: 5,
      highConfidenceThreshold: 9,
      weaknessErrorRateThreshold: 0.4,
      masterySuccessRateThreshold: 0.85,
    },
  },
  opening_principles: {
    title: 'Opening Principles & Board Geometry',
    description: 'Control of center files, piece mobility, rapid development, and coordinate literacy.',
    thresholds: {
      minSamplesForConfidence: 3,
      moderateConfidenceThreshold: 6,
      highConfidenceThreshold: 10,
      weaknessErrorRateThreshold: 0.4,
      masterySuccessRateThreshold: 0.85,
    },
  },
  piece_activity_development: {
    title: 'Piece Activity & Outposts',
    description: 'Developing with tempo, occupying strategic outposts, open file infiltration, and piece coordination.',
    thresholds: {
      minSamplesForConfidence: 3,
      moderateConfidenceThreshold: 6,
      highConfidenceThreshold: 10,
      weaknessErrorRateThreshold: 0.4,
      masterySuccessRateThreshold: 0.85,
    },
  },
  positional_understanding: {
    title: 'Positional Strategy & Pawn Structures',
    description: 'Color complexes, weak squares, isolated pawns, minority attacks, and prophylactic restraint.',
    thresholds: {
      minSamplesForConfidence: 3,
      moderateConfidenceThreshold: 6,
      highConfidenceThreshold: 10,
      weaknessErrorRateThreshold: 0.4,
      masterySuccessRateThreshold: 0.8,
    },
  },
  endgame_fundamentals: {
    title: 'Endgame Fundamentals & Conversion',
    description: 'Pawn promotions, Lucena/Philidor positions, king opposition, and technical rook endings.',
    thresholds: {
      minSamplesForConfidence: 3,
      moderateConfidenceThreshold: 6,
      highConfidenceThreshold: 10,
      weaknessErrorRateThreshold: 0.4,
      masterySuccessRateThreshold: 0.8,
    },
  },
  calculation_accuracy: {
    title: 'Calculation Depth & Move Precision',
    description: 'Disciplined candidate move filtering, calculation accuracy, and minimal centipawn loss.',
    thresholds: {
      minSamplesForConfidence: 5,
      moderateConfidenceThreshold: 10,
      highConfidenceThreshold: 20,
      weaknessErrorRateThreshold: 0.35,
      masterySuccessRateThreshold: 0.85,
    },
  },
  time_management: {
    title: 'Time Management & Clock Discipline',
    description: 'Smooth clock pacing, avoiding severe time scrambles, and converting under clock pressure.',
    thresholds: {
      minSamplesForConfidence: 1, // requires full game records with clock metrics
      moderateConfidenceThreshold: 3,
      highConfidenceThreshold: 6,
      weaknessErrorRateThreshold: 0.5,
      masterySuccessRateThreshold: 0.8,
    },
  },
};

/**
 * Maps each of the 30 canonical lessons in CHESS ACADEMY to its primary educational category.
 */
export const LESSON_TOPIC_MAPPINGS: Record<string, LessonTopicMapping> = {
  // Level 1: Absolute Beginner
  'l-101-board-ranks-files': {
    lessonId: 'l-101-board-ranks-files',
    category: 'opening_principles',
    topicTitle: 'Board Geometry & Coordinates',
    tags: ['board', 'coordinates', 'files', 'ranks'],
  },
  'l-102-knight-movement': {
    lessonId: 'l-102-knight-movement',
    category: 'piece_activity_development',
    topicTitle: 'Knight Geometry & Trajectory',
    tags: ['knight', 'movement', 'geometry'],
  },
  'l-103-pawn-promotion-mechanics': {
    lessonId: 'l-103-pawn-promotion-mechanics',
    category: 'endgame_fundamentals',
    topicTitle: 'Pawn Promotion Mechanics',
    tags: ['pawn', 'promotion', 'endgame'],
  },
  'l-104-check-and-checkmate': {
    lessonId: 'l-104-check-and-checkmate',
    category: 'checkmate_patterns',
    topicTitle: 'Check, Mate & Escapes',
    tags: ['check', 'checkmate', 'defense'],
  },
  'l-105-castling-king-safety': {
    lessonId: 'l-105-castling-king-safety',
    category: 'king_safety',
    topicTitle: 'Castling Rules & Shelter',
    tags: ['castling', 'king_safety', 'defense'],
  },
  'l-106-en-passant-capture': {
    lessonId: 'l-106-en-passant-capture',
    category: 'opening_principles',
    topicTitle: 'En Passant Pawn Capture',
    tags: ['en_passant', 'pawn', 'rules'],
  },

  // Level 2: Elementary
  'l-201-piece-values-counting': {
    lessonId: 'l-201-piece-values-counting',
    category: 'hanging_pieces_blunders',
    topicTitle: 'Material Values & Piece Trades',
    tags: ['material', 'hanging_pieces', 'counting'],
  },
  'l-202-controlling-the-center': {
    lessonId: 'l-202-controlling-the-center',
    category: 'opening_principles',
    topicTitle: 'Classical Central Occupation',
    tags: ['center', 'opening', 'space'],
  },
  'l-203-the-knight-fork': {
    lessonId: 'l-203-the-knight-fork',
    category: 'tactical_patterns',
    topicTitle: 'The Geometric Knight Fork',
    tags: ['fork', 'tactics', 'knight'],
  },
  'l-204-the-absolute-pin': {
    lessonId: 'l-204-the-absolute-pin',
    category: 'tactical_patterns',
    topicTitle: 'The Absolute Pin',
    tags: ['pin', 'tactics', 'relative_pin'],
  },

  // Level 3: Intermediate
  'l-301-the-linear-skewer': {
    lessonId: 'l-301-the-linear-skewer',
    category: 'tactical_patterns',
    topicTitle: 'Linear Skewers',
    tags: ['skewer', 'tactics', 'linear_attack'],
  },
  'l-302-deflection-and-decoy': {
    lessonId: 'l-302-deflection-and-decoy',
    category: 'tactical_patterns',
    topicTitle: 'Deflection & Decoy Sacrifices',
    tags: ['deflection', 'decoy', 'tactics'],
  },
  'l-303-back-rank-destruction': {
    lessonId: 'l-303-back-rank-destruction',
    category: 'checkmate_patterns',
    topicTitle: 'Back-Rank Weakness & Infiltration',
    tags: ['back_rank', 'checkmate', 'corridor_mate'],
  },
  'l-304-knight-outposts-open-files': {
    lessonId: 'l-304-knight-outposts-open-files',
    category: 'piece_activity_development',
    topicTitle: 'Knight Outposts & File Domination',
    tags: ['outpost', 'open_file', 'rook_lift'],
  },

  // Level 4: Advanced
  'l-401-weak-squares-color-complex': {
    lessonId: 'l-401-weak-squares-color-complex',
    category: 'positional_understanding',
    topicTitle: 'Color Complexes & Weak Squares',
    tags: ['weak_squares', 'color_complex', 'bishop_color'],
  },
  'l-402-prophylactic-thinking': {
    lessonId: 'l-402-prophylactic-thinking',
    category: 'positional_understanding',
    topicTitle: 'Prophylaxis & Threat Prevention',
    tags: ['prophylaxis', 'defense', 'anticipation'],
  },
  'l-403-lucena-and-philidor-rook-endings': {
    lessonId: 'l-403-lucena-and-philidor-rook-endings',
    category: 'endgame_fundamentals',
    topicTitle: 'Theoretical Rook Endgames: Lucena & Philidor',
    tags: ['rook_endgame', 'lucena', 'philidor'],
  },
  'l-404-minor-piece-imbalances': {
    lessonId: 'l-404-minor-piece-imbalances',
    category: 'positional_understanding',
    topicTitle: 'Bishop Pair vs Knight Tandem',
    tags: ['minor_pieces', 'bishop_pair', 'imbalance'],
  },

  // Level 5: Expert
  'l-501-positional-exchange-sacrifice': {
    lessonId: 'l-501-positional-exchange-sacrifice',
    category: 'calculation_accuracy',
    topicTitle: 'The Positional Exchange Sacrifice',
    tags: ['exchange_sacrifice', 'calculation', 'long_term_compensation'],
  },
  'l-502-isolated-queen-pawn-dynamics': {
    lessonId: 'l-502-isolated-queen-pawn-dynamics',
    category: 'positional_understanding',
    topicTitle: 'Isolated Queen Pawn (IQP) Dynamics',
    tags: ['iqp', 'pawn_structure', 'd4_break'],
  },
  'l-503-pawn-structure-transformations': {
    lessonId: 'l-503-pawn-structure-transformations',
    category: 'positional_understanding',
    topicTitle: 'Pawn Structure Liquidations',
    tags: ['pawn_chains', 'transformation', 'structure'],
  },
  'l-504-zwischenzug-intermediate-moves': {
    lessonId: 'l-504-zwischenzug-intermediate-moves',
    category: 'tactical_patterns',
    topicTitle: 'Zwischenzug (Intermediate In-Between Moves)',
    tags: ['zwischenzug', 'intermediate_move', 'tactics'],
  },

  // Level 6: Master
  'l-601-dynamic-piece-sacrifices-initiative': {
    lessonId: 'l-601-dynamic-piece-sacrifices-initiative',
    category: 'calculation_accuracy',
    topicTitle: 'Dynamic Sacrifices for the Initiative',
    tags: ['sacrifice', 'initiative', 'attack'],
  },
  'l-602-complex-opposite-colored-bishops': {
    lessonId: 'l-602-complex-opposite-colored-bishops',
    category: 'endgame_fundamentals',
    topicTitle: 'Opposite-Colored Bishop Endgames',
    tags: ['opposite_bishops', 'endgame', 'drawing_resource'],
  },
  'l-603-defensive-resourcefulness-swindles': {
    lessonId: 'l-603-defensive-resourcefulness-swindles',
    category: 'hanging_pieces_blunders',
    topicTitle: 'Defensive Resilience & Stalemate Swindles',
    tags: ['defense', 'stalemate', 'swindle'],
  },
  'l-604-carlsbad-minority-attack': {
    lessonId: 'l-604-carlsbad-minority-attack',
    category: 'positional_understanding',
    topicTitle: 'The Carlsbad Minority Attack',
    tags: ['carlsbad', 'minority_attack', 'queens_gambit'],
  },

  // Level 7: Grandmaster Preparation
  'l-701-concrete-calculation-candidate-moves': {
    lessonId: 'l-701-concrete-calculation-candidate-moves',
    category: 'calculation_accuracy',
    topicTitle: 'Candidate Moves & Kotov Tree Calculation',
    tags: ['candidate_moves', 'calculation_tree', 'visualization'],
  },
  'l-702-psychological-time-pressure-handling': {
    lessonId: 'l-702-psychological-time-pressure-handling',
    category: 'time_management',
    topicTitle: 'Psychological Time Trouble Management',
    tags: ['time_trouble', 'clock_pressure', 'practical_play'],
  },
  'l-703-elite-preparation-practical-endgames': {
    lessonId: 'l-703-elite-preparation-practical-endgames',
    category: 'endgame_fundamentals',
    topicTitle: 'Elite Practical Endgame Technique',
    tags: ['endgame_technique', 'conversion', 'prophylactic_endgame'],
  },
  'l-704-king-centralization-endgames': {
    lessonId: 'l-704-king-centralization-endgames',
    category: 'endgame_fundamentals',
    topicTitle: 'King Centralization in Technical Endgames',
    tags: ['king_march', 'centralization', 'endgame'],
  },
};
