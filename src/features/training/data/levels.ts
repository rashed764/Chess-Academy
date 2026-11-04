import type { AcademyLevel, AcademyLevelId } from '../types';

export const ACADEMY_LEVELS: AcademyLevel[] = [
  {
    id: 'level-1-absolute-beginner',
    order: 1,
    romanNumeral: 'Level 1',
    title: 'Absolute Beginner',
    subtitle: 'From zero knowledge to complete board fluency',
    objective:
      'Introduce chess fundamentals: the board, pieces, legal movement, capturing, checks, checkmate, stalemate, and special rules.',
    targetRating: '0 — 1000 ELO',
    moduleIds: ['mod-1-board-pieces', 'mod-2-rules-mechanics'],
  },
  {
    id: 'level-2-elementary',
    order: 2,
    romanNumeral: 'Level 2',
    title: 'Elementary',
    subtitle: 'Material value, development & foundational tactics',
    objective:
      'Build basic tactical and positional understanding: piece values, center control, king safety, hanging pieces, and fundamental checkmates.',
    targetRating: '1000 — 1300 ELO',
    prerequisiteLevelId: 'level-1-absolute-beginner',
    minCompletedLessonsRequired: 4,
    moduleIds: ['mod-3-piece-values-opening', 'mod-4-basic-tactics'],
  },
  {
    id: 'level-3-intermediate',
    order: 3,
    romanNumeral: 'Level 3',
    title: 'Intermediate',
    subtitle: 'Structured tactical combinations & positional geometry',
    objective:
      'Introduce structured tactical motifs: double attacks, deflection, decoys, removing defenders, back-rank patterns, and basic endgames.',
    targetRating: '1300 — 1600 ELO',
    prerequisiteLevelId: 'level-2-elementary',
    minCompletedLessonsRequired: 3,
    moduleIds: ['mod-5-tactical-motifs', 'mod-6-pawn-structure-endgame'],
  },
  {
    id: 'level-4-advanced',
    order: 4,
    romanNumeral: 'Level 4',
    title: 'Advanced',
    subtitle: 'Positional strategy, prophylaxis & piece coordination',
    objective:
      'Develop deeper strategic understanding: weak squares, outposts, pawn levers, piece coordination, prophylaxis, and theoretical rook endgames.',
    targetRating: '1600 — 1900 ELO',
    prerequisiteLevelId: 'level-3-intermediate',
    minCompletedLessonsRequired: 3,
    moduleIds: ['mod-7-positional-strategy', 'mod-8-advanced-endgames'],
  },
  {
    id: 'level-5-expert',
    order: 5,
    romanNumeral: 'Level 5',
    title: 'Expert',
    subtitle: 'Deep calculation, dynamic imbalances & sacrifices',
    objective:
      'Develop advanced competitive chess understanding: candidate moves, calculation trees, exchange sacrifices, and technical defense.',
    targetRating: '1900 — 2100 ELO',
    prerequisiteLevelId: 'level-4-advanced',
    minCompletedLessonsRequired: 3,
    moduleIds: ['mod-9-deep-calculation', 'mod-10-dynamic-imbalances'],
  },
  {
    id: 'level-6-master',
    order: 6,
    romanNumeral: 'Level 6',
    title: 'Master',
    subtitle: 'Dynamic evaluation, initiative & technical conversion',
    objective:
      'Study high-level master principles: prophylaxis, long-term strategic planning, finding hidden defensive resources, and surgical conversion.',
    targetRating: '2100 — 2300 ELO',
    prerequisiteLevelId: 'level-5-expert',
    minCompletedLessonsRequired: 3,
    moduleIds: ['mod-11-master-strategy', 'mod-12-complex-conversion'],
  },
  {
    id: 'level-7-grandmaster-prep',
    order: 7,
    romanNumeral: 'Level 7',
    title: 'Grandmaster Preparation',
    subtitle: 'Elite calculation challenges & critical decision making',
    objective:
      'Provide advanced study material and rigorous training positions: deep opening ideas, complex endgame studies, and critical tournament decisions.',
    targetRating: '2300+ ELO Study',
    prerequisiteLevelId: 'level-6-master',
    minCompletedLessonsRequired: 3,
    moduleIds: ['mod-13-gm-calculation', 'mod-14-critical-decisions'],
  },
];

export const ACADEMY_LEVEL_MAP: Record<AcademyLevelId, AcademyLevel> = ACADEMY_LEVELS.reduce(
  (acc, lvl) => {
    acc[lvl.id] = lvl;
    return acc;
  },
  {} as Record<AcademyLevelId, AcademyLevel>
);
