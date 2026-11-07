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
  'l-403-the-lucena-bridge': {
    lessonId: 'l-403-the-lucena-bridge',
    category: 'endgame_fundamentals',
    topicTitle: 'The Lucena Position: Building the Rook Bridge',
    tags: ['rook_endgame', 'lucena', 'bridge', 'endgame'],
  },
  'l-404-good-vs-bad-bishops': {
    lessonId: 'l-404-good-vs-bad-bishops',
    category: 'positional_understanding',
    topicTitle: 'Good Bishops vs. Bad Bishops & Endgame Conversion',
    tags: ['minor_pieces', 'bad_bishop', 'color_complex', 'strategy'],
  },

  // Level 5: Expert
  'l-501-candidate-moves-elimination': {
    lessonId: 'l-501-candidate-moves-elimination',
    category: 'calculation_accuracy',
    topicTitle: 'Candidate Move Selection & Calculation Trees',
    tags: ['candidate_moves', 'calculation_tree', 'kotov', 'accuracy'],
  },
  'l-502-positional-exchange-sacrifice': {
    lessonId: 'l-502-positional-exchange-sacrifice',
    category: 'calculation_accuracy',
    topicTitle: 'The Positional Exchange Sacrifice',
    tags: ['exchange_sacrifice', 'calculation', 'long_term_compensation'],
  },
  'l-503-fortress-defensive-resource': {
    lessonId: 'l-503-fortress-defensive-resource',
    category: 'endgame_fundamentals',
    topicTitle: 'Fortress Construction & Stalemate Geometry',
    tags: ['fortress', 'stalemate', 'defense', 'endgame'],
  },
  'l-504-the-zwischenzug-intermediate-move': {
    lessonId: 'l-504-the-zwischenzug-intermediate-move',
    category: 'tactical_patterns',
    topicTitle: 'The Zwischenzug: The In-Between Attack',
    tags: ['zwischenzug', 'intermediate_move', 'tactics', 'in_between'],
  },

  // Level 6: Master
  'l-601-master-prophylaxis-restriction': {
    lessonId: 'l-601-master-prophylaxis-restriction',
    category: 'positional_understanding',
    topicTitle: 'Master Restriction Strategy & The Squeeze',
    tags: ['restriction', 'prophylaxis', 'karpov', 'clamp'],
  },
  'l-602-principle-of-two-weaknesses': {
    lessonId: 'l-602-principle-of-two-weaknesses',
    category: 'positional_understanding',
    topicTitle: 'The Principle of Two Weaknesses in Endgames',
    tags: ['two_weaknesses', 'seventh_rank', 'endgame_strategy'],
  },
  'l-603-stalemate-swindle-resource': {
    lessonId: 'l-603-stalemate-swindle-resource',
    category: 'hanging_pieces_blunders',
    topicTitle: 'The Desperado Rook & Stalemate Swindles',
    tags: ['desperado', 'stalemate', 'swindle', 'blunder_recovery'],
  },
  'l-604-the-minority-attack-carlsbad': {
    lessonId: 'l-604-the-minority-attack-carlsbad',
    category: 'positional_understanding',
    topicTitle: 'The Minority Attack: Carlsbad Structure Mastery',
    tags: ['carlsbad', 'minority_attack', 'pawn_structure', 'strategy'],
  },

  // Level 7: Grandmaster Preparation
  'l-701-najdorf-dynamic-preparation': {
    lessonId: 'l-701-najdorf-dynamic-preparation',
    category: 'opening_principles',
    topicTitle: 'Deep Sicilian Najdorf: The English Attack Dynamics',
    tags: ['najdorf', 'sicilian', 'english_attack', 'opening_preparation'],
  },
  'l-702-grandmaster-multi-ply-calculation': {
    lessonId: 'l-702-grandmaster-multi-ply-calculation',
    category: 'calculation_accuracy',
    topicTitle: 'Grandmaster Multi-Ply Calculation Under Pressure',
    tags: ['calculation_depth', 'piece_tension', 'multi_ply', 'accuracy'],
  },
  'l-703-tournament-pragmatism-simplification': {
    lessonId: 'l-703-tournament-pragmatism-simplification',
    category: 'endgame_fundamentals',
    topicTitle: 'Tournament Pragmatism & Technical Simplification',
    tags: ['simplification', 'pragmatism', 'capablanca', 'endgame'],
  },
  'l-704-converting-plus-equals-endgame': {
    lessonId: 'l-704-converting-plus-equals-endgame',
    category: 'endgame_fundamentals',
    topicTitle: 'Converting Plus-Equals: Master King Centralization',
    tags: ['king_march', 'centralization', 'plus_equals', 'endgame'],
  },
};
