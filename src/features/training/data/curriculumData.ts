import type { CurriculumModule, TrainingLesson } from '../types';

export const CURRICULUM_MODULES: CurriculumModule[] = [
  // --- LEVEL 1 ---
  {
    id: 'mod-1-board-pieces',
    levelId: 'level-1-absolute-beginner',
    order: 1,
    title: 'The Board, Coordinates & Piece Movement',
    description: 'Learn the battlefield geometry: files, ranks, diagonals, and how each noble piece traverses the 64 squares.',
    iconName: 'Compass',
    lessonIds: ['l-101-board-ranks-files', 'l-102-knight-movement', 'l-103-pawn-promotion-mechanics'],
  },
  {
    id: 'mod-2-rules-mechanics',
    levelId: 'level-1-absolute-beginner',
    order: 2,
    title: 'Fundamental Rules, Check, Checkmate & Special Moves',
    description: 'Master the core objective of chess: check, checkmate, stalemate, castling to safeguard the king, and en passant.',
    iconName: 'Shield',
    lessonIds: ['l-104-check-and-checkmate', 'l-105-castling-king-safety', 'l-106-en-passant-capture'],
  },

  // --- LEVEL 2 ---
  {
    id: 'mod-3-piece-values-opening',
    levelId: 'level-2-elementary',
    order: 1,
    title: 'Piece Values & Classical Opening Principles',
    description: 'Understand numerical material values, staking central claims with pawns, and harmoniously mobilizing knights and bishops.',
    iconName: 'BookOpen',
    lessonIds: ['l-201-piece-values-counting', 'l-202-controlling-the-center'],
  },
  {
    id: 'mod-4-basic-tactics',
    levelId: 'level-2-elementary',
    order: 2,
    title: 'Foundational Tactical Vision: Forks & Pins',
    description: 'Recognize hanging undefended pieces, geometric knight forks attacking two targets, and absolute pins paralyzing defenders.',
    iconName: 'Swords',
    lessonIds: ['l-203-the-knight-fork', 'l-204-the-absolute-pin'],
  },

  // --- LEVEL 3 ---
  {
    id: 'mod-5-tactical-motifs',
    levelId: 'level-3-intermediate',
    order: 1,
    title: 'Advanced Tactical Motifs: Skewers & Deflection',
    description: 'Weaponize linear skewers, lure king or queen off vital defenders with decoys, and shatter back ranks.',
    iconName: 'Target',
    lessonIds: ['l-301-the-linear-skewer', 'l-302-deflection-and-decoy', 'l-303-back-rank-destruction'],
  },
  {
    id: 'mod-6-pawn-structure-endgame',
    levelId: 'level-3-intermediate',
    order: 2,
    title: 'Strategic Outposts & Fundamental Endgames',
    description: 'Planting octopus knights on unshakeable outposts, open file infiltration, and key king opposition rules.',
    iconName: 'Crown',
    lessonIds: ['l-304-knight-outposts-open-files'],
  },

  // --- LEVEL 4 ---
  {
    id: 'mod-7-positional-strategy',
    levelId: 'level-4-advanced',
    order: 1,
    title: 'Positional Mastery, Weak Squares & Prophylaxis',
    description: 'Identify permanent square complexes, restrict counterplay via prophylactic thinking, and plan pawn levers.',
    iconName: 'Eye',
    lessonIds: ['l-401-weak-squares-color-complex', 'l-402-prophylactic-thinking'],
  },
  {
    id: 'mod-8-advanced-endgames',
    levelId: 'level-4-advanced',
    order: 2,
    title: 'Theoretical Rook Endgames & Piece Trades',
    description: 'The legendary Lucena bridge technique, Philidor drawing zone, and trading good bishops for bad ones.',
    iconName: 'Trophy',
    lessonIds: ['l-403-the-lucena-bridge', 'l-404-good-vs-bad-bishops'],
  },

  // --- LEVEL 5 ---
  {
    id: 'mod-9-deep-calculation',
    levelId: 'level-5-expert',
    order: 1,
    title: 'Candidate Move Selection & Calculation Trees',
    description: 'Systematically generate candidate moves, calculate forcing variations, and eliminate false lines.',
    iconName: 'Cpu',
    lessonIds: ['l-501-candidate-moves-elimination', 'l-504-the-zwischenzug-intermediate-move'],
  },
  {
    id: 'mod-10-dynamic-imbalances',
    levelId: 'level-5-expert',
    order: 2,
    title: 'Dynamic Imbalances & Positional Sacrifices',
    description: 'The Tigran Petrosian positional exchange sacrifice, valuing initiative over static points, and fortress creation.',
    iconName: 'Flame',
    lessonIds: ['l-502-positional-exchange-sacrifice', 'l-503-fortress-defensive-resource'],
  },

  // --- LEVEL 6 ---
  {
    id: 'mod-11-master-strategy',
    levelId: 'level-6-master',
    order: 1,
    title: 'Master Strategic Planning & High Prophylaxis',
    description: 'Anatoly Karpov restriction strategy, suffocating opponent counterplay, and calculating long-term strategic shifts.',
    iconName: 'Award',
    lessonIds: ['l-601-master-prophylaxis-restriction', 'l-604-the-minority-attack-carlsbad'],
  },
  {
    id: 'mod-12-complex-conversion',
    levelId: 'level-6-master',
    order: 2,
    title: 'Complex Technical Conversion & Stalemating Swindles',
    description: 'The principle of two weaknesses, patient rook endings, and finding hidden miraculous defensive resources.',
    iconName: 'Sparkles',
    lessonIds: ['l-602-principle-of-two-weaknesses', 'l-603-stalemate-swindle-resource'],
  },

  // --- LEVEL 7 ---
  {
    id: 'mod-13-gm-calculation',
    levelId: 'level-7-grandmaster-prep',
    order: 1,
    title: 'Grandmaster Opening Depth & Critical Positions',
    description: 'Deep modern opening understanding: sharp Najdorf dynamic themes, pawn structure choices, and critical moment diagnosis.',
    iconName: 'GraduationCap',
    lessonIds: ['l-701-najdorf-dynamic-preparation', 'l-702-grandmaster-multi-ply-calculation'],
  },
  {
    id: 'mod-14-critical-decisions',
    levelId: 'level-7-grandmaster-prep',
    order: 2,
    title: 'Tournament Pragmatism & Technical Precision',
    description: 'Practical tournament decision making under time pressure, choosing between complicated attacks and clean simplified wins.',
    iconName: 'CheckCircle',
    lessonIds: ['l-703-tournament-pragmatism-simplification', 'l-704-converting-plus-equals-endgame'],
  },
];

export const TRAINING_LESSONS: TrainingLesson[] = [
  // ==========================================
  // LEVEL 1: ABSOLUTE BEGINNER
  // ==========================================
  {
    id: 'l-101-board-ranks-files',
    moduleId: 'mod-1-board-pieces',
    levelId: 'level-1-absolute-beginner',
    order: 1,
    title: 'The Chessboard, Files, Ranks & The Rook',
    learningObjective: 'Learn chessboard coordinates (files a-h, ranks 1-8) and master straight-line movement with the Rook.',
    difficulty: 'absolute-beginner',
    estimatedMinutes: 5,
    content: {
      introduction:
        'The chessboard is an 8x8 grid of 64 alternating light and dark squares. Understanding files (vertical columns) and ranks (horizontal rows) is the alphabet of chess.',
      sections: [
        {
          title: 'Files and Ranks',
          paragraphs: [
            'Files run vertically from a to h, starting from White’s left to right.',
            'Ranks run horizontally from 1 to 8, with 1 and 2 being White’s home ranks and 7 and 8 being Black’s.',
            'Every square has an exact unique coordinate, such as e4 or h8.',
          ],
          diagramFen: '8/8/8/8/8/8/8/R4K1k w - - 0 1',
          diagramCaption: 'White Rook on a1 can travel vertically along the a-file or horizontally along the 1st rank.',
        },
        {
          title: 'The Mighty Rook',
          paragraphs: [
            'The Rook moves in straight vertical or horizontal lines across any number of unoccupied squares.',
            'Rooks excel on open files where no friendly or enemy pawns block their path.',
          ],
          bulletPoints: [
            'Moves forward, backward, left, or right as far as the path is open.',
            'Captures by occupying the square of an opposing piece.',
            'Worth 5 points in traditional piece valuation.',
          ],
        },
      ],
      keyTakeaways: [
        'The board has 64 squares: 8 files (a-h) and 8 ranks (1-8).',
        'Rooks slide horizontally and vertically across open lines.',
        'Controlling open files with rooks allows deep infiltration into enemy territory.',
      ],
    },
    exercise: {
      id: 'ex-101-rook-move',
      lessonId: 'l-101-board-ranks-files',
      title: 'Exercise: Infiltrate the Open E-File',
      instruction: 'Slide your White Rook on a1 along the 1st rank to e1 to seize the central e-file.',
      exerciseType: 'move_identification',
      initialFen: '8/8/8/8/8/8/8/R4K1k w - - 0 1',
      playerSide: 'w',
      steps: [
        {
          playerMoveSan: 'Re1',
          explanation: 'Excellent! The Rook glides to e1, controlling the entire vertical e-file.',
        },
      ],
      hint: 'Move the Rook on a1 horizontally to square e1.',
      explanation: 'Re1 moves the Rook from a1 to e1, dominating the open e-file with straight-line power.',
      difficulty: 'absolute-beginner',
    },
    completionCriteria: {
      requiresExercisePassed: true,
      requiresReadingCompleted: true,
    },
  },

  {
    id: 'l-102-knight-movement',
    moduleId: 'mod-1-board-pieces',
    levelId: 'level-1-absolute-beginner',
    order: 2,
    title: 'The Knight & The L-Shape Jump',
    learningObjective: 'Master the unique leaping ability of the Knight and its distinct L-shaped trajectory.',
    difficulty: 'absolute-beginner',
    estimatedMinutes: 6,
    prerequisiteLessonId: 'l-101-board-ranks-files',
    content: {
      introduction:
        'The Knight is the only piece on the chessboard capable of leaping over other friendly and enemy pieces. Its movement forms an "L": two squares in one direction, then one square perpendicular.',
      sections: [
        {
          title: 'The Geometry of the L-Shape',
          paragraphs: [
            'From any square, the Knight can jump two squares horizontally and one square vertically, or two squares vertically and one square horizontally.',
            'Crucially, a Knight always lands on a square of the opposite color from where it started. If it begins on a dark square, every legal hop lands on a light square!',
          ],
          diagramFen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/4P3/2N2N2/PPPP1PPP/R1BQKB1R w KQkq - 4 4',
          diagramCaption: 'Knights comfortably jump over the pawn wall in the opening phase.',
        },
      ],
      keyTakeaways: [
        'The Knight moves two squares in one direction, then one square to the side.',
        'It is the only piece that can jump over other pieces.',
        'A Knight on a light square always moves to a dark square, and vice versa.',
      ],
    },
    exercise: {
      id: 'ex-102-knight-jump',
      lessonId: 'l-102-knight-movement',
      title: 'Exercise: Leap the Knight to the Central Outpost',
      instruction: 'Jump your White Knight from c3 to the central d5 square.',
      exerciseType: 'move_identification',
      initialFen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/4P3/2N2N2/PPPP1PPP/R1BQKB1R w KQkq - 4 4',
      playerSide: 'w',
      steps: [
        {
          playerMoveSan: 'Nd5',
          explanation: 'Splendid leap! The knight on c3 hops gracefully over pawns to anchor itself on d5.',
        },
      ],
      hint: 'Select the Knight on c3 and move it to d5 (two squares up, one square right).',
      explanation: 'Nd5 demonstrates the leaping agility of the knight into the heart of the board.',
      difficulty: 'absolute-beginner',
    },
    completionCriteria: {
      requiresExercisePassed: true,
      requiresReadingCompleted: true,
    },
  },

  {
    id: 'l-103-pawn-promotion-mechanics',
    moduleId: 'mod-1-board-pieces',
    levelId: 'level-1-absolute-beginner',
    order: 3,
    title: 'Pawn Movement, Capturing & Promotion',
    learningObjective: 'Understand pawn steps (1 or 2 squares on first move), diagonal capturing, and the crowning reward of pawn promotion.',
    difficulty: 'absolute-beginner',
    estimatedMinutes: 6,
    prerequisiteLessonId: 'l-102-knight-movement',
    content: {
      introduction:
        'Pawns are the soul of chess. Although humble, when a pawn fights its way across the entire board to the 8th rank, it undergoes promotion—transforming into a Queen, Rook, Bishop, or Knight!',
      sections: [
        {
          title: 'Movement and Diagonal Captures',
          paragraphs: [
            'Pawns move forward vertically one square at a time. On their very first move, they have the option to advance either one or two squares.',
            'Unlike other pieces, pawns cannot capture forward; they only capture enemy pieces diagonally one square ahead.',
          ],
        },
        {
          title: 'Pawn Promotion',
          paragraphs: [
            'When a White pawn reaches the 8th rank (or a Black pawn reaches the 1st rank), it cannot remain a pawn.',
            'It is immediately replaced by a Queen, Rook, Bishop, or Knight of the same color. Promoting to a Queen is almost always the strongest choice.',
          ],
          diagramFen: '6k1/4P3/6K1/8/8/8/8/8 w - - 0 1',
          diagramCaption: 'The passed pawn on e7 is one square away from becoming an all-powerful Queen.',
        },
      ],
      keyTakeaways: [
        'Pawns move forward 1 square (or 2 squares on their first move).',
        'Pawns capture diagonally one square forward.',
        'Reaching the final rank transforms the pawn into a Queen or other major piece.',
      ],
    },
    exercise: {
      id: 'ex-103-pawn-promotion',
      lessonId: 'l-103-pawn-promotion-mechanics',
      title: 'Exercise: Promote the Passed Pawn to Queen',
      instruction: 'Advance your passed pawn from e7 to e8 and choose the Queen for checkmate!',
      exerciseType: 'rule_based',
      initialFen: '6k1/4P3/6K1/8/8/8/8/8 w - - 0 1',
      playerSide: 'w',
      steps: [
        {
          playerMoveSan: 'e8=Q#',
          explanation: 'Checkmate! The pawn marches to e8, promotes to a Queen, and delivers decisive checkmate!',
        },
      ],
      alternativeSolutionsSan: ['e8=R#'],
      hint: 'Push the pawn from e7 to e8 and promote it to a Queen.',
      explanation: 'Pushing e7-e8=Q immediately crowns a new Queen delivering unavoidable mate.',
      difficulty: 'absolute-beginner',
    },
    completionCriteria: {
      requiresExercisePassed: true,
      requiresReadingCompleted: true,
    },
  },

  {
    id: 'l-104-check-and-checkmate',
    moduleId: 'mod-2-rules-mechanics',
    levelId: 'level-1-absolute-beginner',
    order: 4,
    title: 'Check, Checkmate & The Goal of Chess',
    learningObjective: 'Distinguish between check (the king is attacked) and checkmate (the king is attacked with no legal escape).',
    difficulty: 'absolute-beginner',
    estimatedMinutes: 7,
    content: {
      introduction:
        'The King is the most important piece on the board. The game ends not when the King is physically captured, but when checkmate is delivered—leaving the King under attack with no legal way out.',
      sections: [
        {
          title: 'The 3 Ways to Escape Check (CPR)',
          paragraphs: [
            'When your King is in check, you MUST get out of check immediately. You have three possible remedies:',
            '1. Capture the attacking piece.',
            '2. Protect: Block the line of attack with another piece (not possible against Knight checks).',
            '3. Run: Move the King to an unattacked adjacent square.',
          ],
        },
        {
          title: 'Checkmate vs Stalemate',
          paragraphs: [
            'Checkmate: The King is in check, and NONE of the three escape methods work. Game over, attacker wins!',
            'Stalemate: The player whose turn it is has NO legal moves, but their King is NOT in check. The game is instantly a Draw.',
          ],
          diagramFen: 'r1bqkb1r/pppp1ppp/2n5/4p3/2B1n3/5Q2/PPPP1PPP/RNB1K1NR w KQkq - 0 5',
          diagramCaption: 'The f7 square is defended only by Black’s King, creating an immediate checkmate opportunity.',
        },
      ],
      keyTakeaways: [
        'Check means the King is attacked.',
        'Escape check via CPR: Capture, Protect, or Run.',
        'Checkmate ends the game immediately in victory.',
      ],
    },
    exercise: {
      id: 'ex-104-checkmate-f7',
      lessonId: 'l-104-check-and-checkmate',
      title: 'Exercise: Deliver Checkmate on f7',
      instruction: 'Find the decisive move for White: capture the f7 pawn with your Queen to deliver checkmate!',
      exerciseType: 'checkmate',
      initialFen: 'r1bqkb1r/pppp1ppp/2n5/4p3/2B1n3/5Q2/PPPP1PPP/RNB1K1NR w KQkq - 0 5',
      playerSide: 'w',
      steps: [
        {
          playerMoveSan: 'Qxf7#',
          explanation: 'Checkmate! The Queen captures on f7 supported by the bishop on c4. The Black King cannot capture or escape!',
        },
      ],
      hint: 'The Queen on f3 and Bishop on c4 are both targeting the weak f7 pawn.',
      explanation: 'Qxf7# delivers checkmate because the Bishop guards the Queen, so the Black King cannot capture it and has no flight squares.',
      difficulty: 'absolute-beginner',
    },
    completionCriteria: {
      requiresExercisePassed: true,
      requiresReadingCompleted: true,
    },
  },

  {
    id: 'l-105-castling-king-safety',
    moduleId: 'mod-2-rules-mechanics',
    levelId: 'level-1-absolute-beginner',
    order: 5,
    title: 'Castling: King Safety & Rook Activation',
    learningObjective: 'Learn how to castle kingside and queenside in one special move to tuck your king safely into the fortress.',
    difficulty: 'absolute-beginner',
    estimatedMinutes: 6,
    content: {
      introduction:
        'Castling is the only move in chess where two pieces move in the same turn: the King moves two squares toward a Rook, and the Rook hops over to the square the King skipped over.',
      sections: [
        {
          title: 'The Rules of Castling',
          paragraphs: [
            'Neither the King nor the participating Rook may have previously moved.',
            'All squares between the King and Rook must be empty.',
            'The King cannot be in check, cannot pass through a square attacked by an enemy piece, and cannot land in check.',
          ],
          diagramFen: 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4',
          diagramCaption: 'The e1-h1 path is cleared. White is ready for Kingside Castling (O-O).',
        },
      ],
      keyTakeaways: [
        'Castling protects the King behind a shield of pawns.',
        'It activates the Rook toward the center files.',
        'Cannot castle out of, through, or into check.',
      ],
    },
    exercise: {
      id: 'ex-105-kingside-castle',
      lessonId: 'l-105-castling-king-safety',
      title: 'Exercise: Castle Kingside (O-O)',
      instruction: 'Move your King from e1 two squares right to g1 to execute Kingside Castling.',
      exerciseType: 'rule_based',
      initialFen: 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4',
      playerSide: 'w',
      steps: [
        {
          playerMoveSan: 'O-O',
          explanation: 'Perfect! The King tucks safely into g1 while the Rook swings over to f1.',
        },
      ],
      hint: 'Click or drag the King on e1 to g1.',
      explanation: 'Kingside castling (O-O) moves King to g1 and Rook to f1, creating a solid defensive shield.',
      difficulty: 'absolute-beginner',
    },
    completionCriteria: {
      requiresExercisePassed: true,
      requiresReadingCompleted: true,
    },
  },

  {
    id: 'l-106-en-passant-capture',
    moduleId: 'mod-2-rules-mechanics',
    levelId: 'level-1-absolute-beginner',
    order: 6,
    title: 'The En Passant Pawn Capture',
    learningObjective: 'Master the unique French rule of "en passant" (in passing) when an opposing pawn bypasses yours with a two-square leap.',
    difficulty: 'absolute-beginner',
    estimatedMinutes: 5,
    content: {
      introduction:
        'En Passant (French for "in passing") is a special pawn capture rule invented centuries ago to prevent pawns from bypassing enemy capture zones by utilizing their initial two-square jump.',
      sections: [
        {
          title: 'When Does En Passant Apply?',
          paragraphs: [
            'Your pawn must already be on the 5th rank (for White) or 4th rank (for Black).',
            'An adjacent enemy pawn leaps forward TWO squares, landing directly alongside your pawn.',
            'You may capture that enemy pawn diagonally as if it had only stepped forward ONE square!',
            'CRITICAL: You must execute the en passant capture immediately on the very next move, or the right is permanently lost.',
          ],
          diagramFen: 'rnbqkbnr/pp1p1ppp/8/2pP4/8/8/PPP1PPPP/RNBQKBNR w KQkq c6 0 3',
          diagramCaption: 'Black just played c7-c5. White pawn on d5 can strike diagonally into c6!',
        },
      ],
      keyTakeaways: [
        'En passant is only valid for pawns, immediately after a two-square jump.',
        'The capturing pawn moves diagonally to the skipped square.',
        'If you do not capture on the very next turn, the opportunity is lost.',
      ],
    },
    exercise: {
      id: 'ex-106-en-passant',
      lessonId: 'l-106-en-passant-capture',
      title: 'Exercise: Execute the En Passant Capture',
      instruction: 'Black just pushed c7 to c5. Capture the c5 pawn en passant with your d5 pawn by moving to c6!',
      exerciseType: 'rule_based',
      initialFen: 'rnbqkbnr/pp1p1ppp/8/2pP4/8/8/PPP1PPPP/RNBQKBNR w KQkq c6 0 3',
      playerSide: 'w',
      steps: [
        {
          playerMoveSan: 'dxc6',
          explanation: 'Magnificent! The d5 pawn captured the passing c5 pawn en passant on c6.',
        },
      ],
      hint: 'Move your pawn from d5 diagonally to square c6.',
      explanation: 'dxc6 captures the c5 pawn in passing, removing it from the board.',
      difficulty: 'absolute-beginner',
    },
    completionCriteria: {
      requiresExercisePassed: true,
      requiresReadingCompleted: true,
    },
  },

  // ==========================================
  // LEVEL 2: ELEMENTARY
  // ==========================================
  {
    id: 'l-201-piece-values-counting',
    moduleId: 'mod-3-piece-values-opening',
    levelId: 'level-2-elementary',
    order: 1,
    title: 'Piece Values & Capturing Undefended Pieces',
    learningObjective: 'Learn the standard material scale (P=1, N=3, B=3, R=5, Q=9) and punish undefended hanging pieces.',
    difficulty: 'elementary',
    estimatedMinutes: 6,
    content: {
      introduction:
        'To make sound decisions, masters use a numerical material scale. Never give up a piece for less than its true worth, and ruthlessly hunt undefended ("hanging") enemy units.',
      sections: [
        {
          title: 'The Standard Valuation Table',
          paragraphs: [
            'Pawn: 1 point (the basic currency of chess).',
            'Knight: 3 points (minor piece; agile in closed boards).',
            'Bishop: 3 points (minor piece; long-range diagonal sniper).',
            'Rook: 5 points (major piece; rules ranks and files).',
            'Queen: 9 points (the ultimate offensive weapon).',
            'King: Priceless (its capture ends the game).',
          ],
          diagramFen: 'r1bqkb1r/pppp1ppp/8/8/n2QP3/8/PPP2PPP/RNB1KB1R w KQkq - 0 1',
          diagramCaption: 'Black carelessly placed their Knight on a4 without any friendly protection.',
        },
      ],
      keyTakeaways: [
        'Always calculate material trades: Queen (9) > Rook (5) > Bishop/Knight (3) > Pawn (1).',
        'Look at every square on the board: identify undefended hanging pieces.',
      ],
    },
    exercise: {
      id: 'ex-201-hanging-knight',
      lessonId: 'l-201-piece-values-counting',
      title: 'Exercise: Capture the Hanging Knight',
      instruction: 'Spot the undefended Black Knight on a4 and capture it with your Queen from d4!',
      exerciseType: 'best_move',
      initialFen: 'r1bqkb1r/pppp1ppp/8/8/n2QP3/8/PPP2PPP/RNB1KB1R w KQkq - 0 1',
      playerSide: 'w',
      steps: [
        {
          playerMoveSan: 'Qxa4',
          explanation: 'Superb! You win a free 3-point knight with zero risk.',
        },
      ],
      hint: 'The Black knight on a4 has no defenders. Strike with the White Queen.',
      explanation: 'Qxa4 captures the hanging knight, winning 3 points of pure material.',
      difficulty: 'elementary',
    },
    completionCriteria: {
      requiresExercisePassed: true,
      requiresReadingCompleted: true,
    },
  },

  {
    id: 'l-202-controlling-the-center',
    moduleId: 'mod-3-piece-values-opening',
    levelId: 'level-2-elementary',
    order: 2,
    title: 'The Golden Rules of the Opening: Center Control',
    learningObjective: 'Master classical opening strategy: occupy the center, develop knights and bishops rapidly, and castle early.',
    difficulty: 'elementary',
    estimatedMinutes: 6,
    content: {
      introduction:
        'The center four squares (e4, d4, e5, d5) are the high ground of the chessboard. From the center, your pieces command the greatest number of squares and can shift quickly to either flank.',
      sections: [
        {
          title: 'The Three Golden Opening Rules',
          paragraphs: [
            '1. Control the center with your pawns (1.e4 or 1.d4).',
            '2. Develop minor pieces (Knights before Bishops) toward the center.',
            '3. Castle within the first 6-8 moves to safeguard your king.',
          ],
        },
      ],
      keyTakeaways: [
        'Pieces placed in the center control up to 4x more squares than on the rim.',
        'Develop Knights before Bishops.',
        'Do not move the same piece twice in the opening unless necessary.',
      ],
    },
    exercise: {
      id: 'ex-202-develop-knight',
      lessonId: 'l-202-controlling-the-center',
      title: 'Exercise: Develop the Knight with Central Pressure',
      instruction: 'After 1.e4 e5, develop your King’s Knight to f3 to attack Black’s e5 pawn and control d4.',
      exerciseType: 'best_move',
      initialFen: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2',
      playerSide: 'w',
      steps: [
        {
          playerMoveSan: 'Nf3',
          explanation: 'Classic master play! 2.Nf3 develops a minor piece and puts direct pressure on e5.',
        },
      ],
      hint: 'Move the Knight from g1 to f3.',
      explanation: '2.Nf3 follows all opening principles: develops towards the center, prepares kingside castling, and attacks e5.',
      difficulty: 'elementary',
    },
    completionCriteria: {
      requiresExercisePassed: true,
      requiresReadingCompleted: true,
    },
  },

  {
    id: 'l-203-the-knight-fork',
    moduleId: 'mod-4-basic-tactics',
    levelId: 'level-2-elementary',
    order: 3,
    title: 'The Tactical Fork: Double Attack with the Knight',
    learningObjective: 'Learn how a single piece simultaneously attacks two or more enemy targets, creating an inescapable dilemma.',
    difficulty: 'elementary',
    estimatedMinutes: 7,
    content: {
      introduction:
        'A fork is a tactical motif where one piece attacks two or more enemy pieces at once. Knights are the most notorious forkers because they can leap in unexpected geometric angles.',
      sections: [
        {
          title: 'The Royal Fork',
          paragraphs: [
            'When a Knight forks both the King and the Queen or Rook, the opponent has no choice but to rescue the King, allowing you to capture the second target on the next turn!',
          ],
          diagramFen: 'r1b1k2r/pppp1ppp/8/3N4/4P3/8/PPP2PPP/R1B1KB1R w KQkq - 0 1',
          diagramCaption: 'The d5 Knight eyes the c7 square, which forks the e8 King and a8 Rook.',
        },
      ],
      keyTakeaways: [
        'A fork attacks two targets at once.',
        'Knights are especially deadly forkers because they cannot be blocked.',
        'A fork with check forces the opponent to deal with the king first.',
      ],
    },
    exercise: {
      id: 'ex-203-knight-fork-c7',
      lessonId: 'l-203-the-knight-fork',
      title: 'Exercise: Execute the Royal Fork on c7',
      instruction: 'Jump your Knight from d5 to c7 to deliver check to the King on e8 while attacking the Rook on a8!',
      exerciseType: 'tactical_puzzle',
      initialFen: 'r1b1k2r/pppp1ppp/8/3N4/4P3/8/PPP2PPP/R1B1KB1R w KQkq - 0 1',
      playerSide: 'w',
      steps: [
        {
          playerMoveSan: 'Nxc7+',
          explanation: 'Devastating fork! King is checked and the a8 Rook falls on the next turn.',
        },
      ],
      alternativeSolutionsSan: ['Nc7+'],
      hint: 'Capture the pawn on c7 with your Knight, delivering check.',
      explanation: 'Nxc7+ forks the King on e8 and the Rook on a8 simultaneously, winning decisive material.',
      difficulty: 'elementary',
    },
    completionCriteria: {
      requiresExercisePassed: true,
      requiresReadingCompleted: true,
    },
  },

  {
    id: 'l-204-the-absolute-pin',
    moduleId: 'mod-4-basic-tactics',
    levelId: 'level-2-elementary',
    order: 4,
    title: 'The Absolute Pin: Paralyzing the Enemy',
    learningObjective: 'Understand how a piece is immobilized when moving it would expose the king to illegal check.',
    difficulty: 'elementary',
    estimatedMinutes: 6,
    content: {
      introduction:
        'A pin occurs when an attacking piece targets an enemy piece that cannot move without exposing a more valuable piece behind it. An "Absolute Pin" pins a piece directly to the King—making its movement completely illegal by rule!',
      sections: [
        {
          title: 'Exploiting the Pinned Piece',
          paragraphs: [
            'A pinned piece cannot move, which means it cannot defend other squares.',
            'Grandmaster rule: "Pound the pinned piece!" Pile on more attackers with pawns or minor pieces.',
          ],
          diagramFen: '4k3/4q3/8/8/8/8/8/4R1K1 w - - 0 1',
          diagramCaption: 'The Black Queen on e7 is pinned to the e8 King by the White Rook on e1.',
        },
      ],
      keyTakeaways: [
        'An absolute pin paralyzes a piece because exposing the king to check is illegal.',
        'Always look for ways to capture or add pressure to pinned pieces.',
      ],
    },
    exercise: {
      id: 'ex-204-pin-queen-win',
      lessonId: 'l-204-the-absolute-pin',
      title: 'Exercise: Win the Pinned Queen',
      instruction: 'The Black Queen on e7 is pinned to its King. Capture the Queen with your Rook on e1!',
      exerciseType: 'tactical_puzzle',
      initialFen: '4k3/4q3/8/8/8/8/8/4R1K1 w - - 0 1',
      playerSide: 'w',
      steps: [
        {
          playerMoveSan: 'Rxe7+',
          explanation: 'Captured! You trade a 5-point rook for a 9-point queen with check!',
        },
      ],
      hint: 'Your Rook on e1 can capture straight into e7.',
      explanation: 'Rxe7+ captures the helpless pinned Queen with check, resulting in a decisive material advantage.',
      difficulty: 'elementary',
    },
    completionCriteria: {
      requiresExercisePassed: true,
      requiresReadingCompleted: true,
    },
  },

  // ==========================================
  // LEVEL 3: INTERMEDIATE
  // ==========================================
  {
    id: 'l-301-the-linear-skewer',
    moduleId: 'mod-5-tactical-motifs',
    levelId: 'level-3-intermediate',
    order: 1,
    title: 'The Linear Skewer: Attack through the Giant',
    learningObjective: 'Differentiate skewers from pins: the more valuable piece is in FRONT and forced to move, exposing the prize behind.',
    difficulty: 'intermediate',
    estimatedMinutes: 7,
    content: {
      introduction:
        'Often called a "reverse pin", a skewer attacks a high-value piece directly. When that high-value piece flees, the attacker captures the piece standing behind it along the line.',
      sections: [
        {
          title: 'Queen & Rook Skewers',
          paragraphs: [
            'Bishops, Rooks, and Queens can all execute skewers along ranks, files, or diagonals.',
            'When you check a King that has a Rook or Queen directly behind it on the same line, the King must step aside, leaving the rear piece defenseless.',
          ],
          diagramFen: '3r4/8/8/3k4/8/8/2Q5/6K1 w - - 0 1',
          diagramCaption: 'White Queen can skewer Black King on d5 and Rook on d8 along the d-file.',
        },
      ],
      keyTakeaways: [
        'In a skewer, the most valuable piece is attacked first.',
        'When the front piece escapes, the back piece is captured.',
      ],
    },
    exercise: {
      id: 'ex-301-queen-skewer',
      lessonId: 'l-301-the-linear-skewer',
      title: 'Exercise: Skewer the King & Rook',
      instruction: 'Find the Queen move to d3 checking the Black King on d5 while skewering the undefended Rook on d8!',
      exerciseType: 'tactical_puzzle',
      initialFen: '3r4/8/8/3k4/8/8/2Q5/6K1 w - - 0 1',
      playerSide: 'w',
      steps: [
        {
          playerMoveSan: 'Qd3+',
          explanation: 'Brilliant! The King is checked on d5, and when it moves, White takes the d8 Rook.',
        },
      ],
      hint: 'Move your Queen to d3 to check the king and align with d8.',
      explanation: 'Qd3+ skewers the d5 King and the d8 Rook along the d-file, winning the rook cleanly.',
      difficulty: 'intermediate',
    },
    completionCriteria: {
      requiresExercisePassed: true,
      requiresReadingCompleted: true,
    },
  },

  {
    id: 'l-302-deflection-and-decoy',
    moduleId: 'mod-5-tactical-motifs',
    levelId: 'level-3-intermediate',
    order: 2,
    title: 'Deflection & Removal of the Defender',
    learningObjective: 'Force an enemy piece away from its critical defensive duty, breaking the defensive chain.',
    difficulty: 'intermediate',
    estimatedMinutes: 7,
    content: {
      introduction:
        'Tactics rarely happen in a vacuum—pieces are usually defended. Deflection is the art of forcing a key defender to leave its post, allowing you to strike the undefended objective.',
      sections: [
        {
          title: 'Decoys and Overloaded Pieces',
          paragraphs: [
            'An overloaded piece has two defensive responsibilities at once. By challenging one, you break both.',
            'Deflection sacrifices lure enemy pieces onto fatal squares.',
          ],
        },
      ],
      keyTakeaways: [
        'Identify what piece is defending the target square.',
        'Use deflection to force or lure that defender away.',
      ],
    },
    exercise: {
      id: 'ex-302-deflection-backrank',
      lessonId: 'l-302-deflection-and-decoy',
      title: 'Exercise: Eliminate the Back-Rank Defender',
      instruction: 'White Rook on d1 can capture the d8 Rook with checkmate because the back rank is unguarded!',
      exerciseType: 'tactical_puzzle',
      initialFen: '3r2k1/pp3ppp/8/8/8/8/PP3PPP/3RR1K1 w - - 0 1',
      playerSide: 'w',
      steps: [
        {
          playerMoveSan: 'Rxd8#',
          explanation: 'Checkmate! The Black King was trapped by its own pawns on g7, f7, h7.',
        },
      ],
      hint: 'Capture the Rook on d8 with your d1 Rook.',
      explanation: 'Rxd8# exploits the undefended back rank for instant checkmate.',
      difficulty: 'intermediate',
    },
    completionCriteria: {
      requiresExercisePassed: true,
      requiresReadingCompleted: true,
    },
  },

  {
    id: 'l-303-back-rank-destruction',
    moduleId: 'mod-5-tactical-motifs',
    levelId: 'level-3-intermediate',
    order: 3,
    title: 'Multi-Move Back-Rank Checkmate Combinations',
    learningObjective: 'Calculate multi-step checkmate sequences where a queen sacrifice forces open the corridor of death.',
    difficulty: 'intermediate',
    estimatedMinutes: 8,
    content: {
      introduction:
        'When pawns on f7, g7, and h7 have not moved, the back rank is a claustrophobic corridor. A queen sacrifice to deflect the defending rook is one of chess’s most immortal motifs.',
      sections: [
        {
          title: 'The Queen Deflection Sacrifice',
          paragraphs: [
            'Look at: 1.Qe8+! Black has only one legal reply: 1...Rxe8. Then White delivers the crushing blow: 2.Rxe8# checkmate!',
          ],
        },
      ],
      keyTakeaways: [
        'Multi-move puzzles require calculating the opponent’s forced responses.',
        'A queen sacrifice is completely justified if checkmate immediately follows.',
      ],
    },
    exercise: {
      id: 'ex-303-backrank-mate-2',
      lessonId: 'l-303-back-rank-destruction',
      title: 'Exercise: Multi-Move Back-Rank Mate (Mate in 2)',
      instruction: 'Sacrifice your Queen on e8 with check! When Black’s Rook captures, deliver checkmate with your remaining Rook.',
      exerciseType: 'checkmate',
      initialFen: '2r3k1/5ppp/8/8/8/8/4QPPP/4R1K1 w - - 0 1',
      playerSide: 'w',
      steps: [
        {
          playerMoveSan: 'Qe8+',
          opponentReplySan: 'Rxe8',
          explanation: 'Magnificent queen sacrifice! Black was forced to respond with Rxe8.',
        },
        {
          playerMoveSan: 'Rxe8#',
          explanation: 'Checkmate! The Rook takes the back rank with no escape for the Black King.',
        },
      ],
      hint: 'Start by checking the king with your Queen on e8.',
      explanation: '1.Qe8+ forces 1...Rxe8, followed immediately by 2.Rxe8# checkmate.',
      difficulty: 'intermediate',
    },
    completionCriteria: {
      requiresExercisePassed: true,
      requiresReadingCompleted: true,
    },
  },

  {
    id: 'l-304-knight-outposts-open-files',
    moduleId: 'mod-6-pawn-structure-endgame',
    levelId: 'level-3-intermediate',
    order: 4,
    title: 'The Knight Outpost & Positional Infiltration',
    learningObjective: 'Understand how a hole in the opponent’s pawn structure creates a permanent home for a dominating piece.',
    difficulty: 'intermediate',
    estimatedMinutes: 7,
    content: {
      introduction:
        'An outpost is a square on the 4th, 5th, or 6th rank that cannot be attacked by an enemy pawn. When protected by your own pawn, a Knight stationed on an outpost radiates power in all directions.',
      sections: [
        {
          title: 'Octopus Knights',
          paragraphs: [
            'A Knight on an advanced central outpost touches 8 key enemy squares. It paralyzes enemy coordination and acts as a springboard for kingside attacks.',
          ],
        },
      ],
      keyTakeaways: [
        'Identify enemy squares that can no longer be challenged by pawns.',
        'Anchor your knights on outposts guarded by friendly pawns.',
      ],
    },
    exercise: {
      id: 'ex-304-knight-outpost-advance',
      lessonId: 'l-304-knight-outposts-open-files',
      title: 'Exercise: Seize the Central Space',
      instruction: 'Push your e4 pawn to e5, kicking Black’s f6 Knight and seizing an enduring space advantage in the center.',
      exerciseType: 'best_move',
      initialFen: 'r2q1rk1/ppp1bppp/2n1pn2/3p4/4P3/2NP1NP1/PPP2PBP/R1BQ1RK1 w - - 0 1',
      playerSide: 'w',
      steps: [
        {
          playerMoveSan: 'e5',
          explanation: 'Authoritative! The e5 push cramps Black’s kingside and evicts the defender of h7.',
        },
      ],
      hint: 'Advance the e-pawn forward one square to e5.',
      explanation: 'e5 gains space, drives away the f6 knight, and opens prospects for a direct kingside attack.',
      difficulty: 'intermediate',
    },
    completionCriteria: {
      requiresExercisePassed: true,
      requiresReadingCompleted: true,
    },
  },

  // ==========================================
  // LEVEL 4: ADVANCED
  // ==========================================
  {
    id: 'l-401-weak-squares-color-complex',
    moduleId: 'mod-7-positional-strategy',
    levelId: 'level-4-advanced',
    order: 1,
    title: 'Weak Squares & Color Complex Domination',
    learningObjective: 'Exploit weaknesses in enemy pawn structures, particularly holes left after pawn advances like ...g6 or ...f6.',
    difficulty: 'advanced',
    estimatedMinutes: 8,
    content: {
      introduction:
        'Pawns can never move backward. Every pawn advance irrevocably surrenders control of the squares it left behind. Advanced players hunt these weak squares and occupy them with pieces.',
      sections: [
        {
          title: 'Dark Square Complexes',
          paragraphs: [
            'When Black pushes ...g6 and trades off their dark-squared bishop, the squares f6, h6, and g7 become vulnerable forever.',
          ],
        },
      ],
      keyTakeaways: [
        'Every pawn advance creates permanent weak squares behind it.',
        'Trade off the enemy pieces that guard those weak color complexes.',
      ],
    },
    exercise: {
      id: 'ex-401-close-center-d5',
      lessonId: 'l-401-weak-squares-color-complex',
      title: 'Exercise: Fix the Weak Central Structure',
      instruction: 'Advance d4 to d5 to lock the center and clamp down on Black’s passive c6 Knight.',
      exerciseType: 'best_move',
      initialFen: 'r4rk1/pppq1pbp/2np1np1/4p3/2PPP3/2N1BBP1/PP3P1P/R2Q1RK1 w - - 0 1',
      playerSide: 'w',
      steps: [
        {
          playerMoveSan: 'd5',
          explanation: 'Strategically commanding! The d5 thrust closes the center and entombs Black’s bishop.',
        },
      ],
      hint: 'Push your d-pawn to d5.',
      explanation: 'd5 gains tempo on the c6 knight, closes the diagonal against the g7 bishop, and secures queenside space.',
      difficulty: 'advanced',
    },
    completionCriteria: {
      requiresExercisePassed: true,
      requiresReadingCompleted: true,
    },
  },

  {
    id: 'l-402-prophylactic-thinking',
    moduleId: 'mod-7-positional-strategy',
    levelId: 'level-4-advanced',
    order: 2,
    title: 'Prophylaxis: The Art of Restricting Counterplay',
    learningObjective: 'Master the thinking method popularized by Nimzowitsch and Petrosian: ask "What does my opponent want?" before attacking.',
    difficulty: 'advanced',
    estimatedMinutes: 9,
    content: {
      introduction:
        'Amateurs think only about their own plans. Masters spend half their energy asking what the opponent intends, neutralizing their candidate moves before they even unfold.',
      sections: [
        {
          title: 'Petrosian’s Prophylactic Shield',
          paragraphs: [
            'Sometimes the most potent move is a quiet pawn step like h3 or a3, extinguishing an opponent’s tactical counter-thrust before beginning your own operation.',
          ],
        },
      ],
      keyTakeaways: [
        'Always anticipate your opponent’s most active counterplay.',
        'Prophylaxis prevents tactical fires before they ignite.',
      ],
    },
    exercise: {
      id: 'ex-402-prophylactic-d3',
      lessonId: 'l-402-prophylactic-thinking',
      title: 'Exercise: Solidify the Center with Prophylaxis',
      instruction: 'Play the solid consolidating move d3, defending the e4 pawn and freeing the c1 Bishop.',
      exerciseType: 'best_move',
      initialFen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4',
      playerSide: 'w',
      steps: [
        {
          playerMoveSan: 'd3',
          explanation: 'Solid and classical! d3 fortifies e4 and enables harmonious development.',
        },
      ],
      alternativeSolutionsSan: ['O-O'],
      hint: 'Support e4 by advancing your d-pawn to d3.',
      explanation: 'd3 solidifies the central chain, blunts Black’s knight pressure, and opens the dark-squared bishop.',
      difficulty: 'advanced',
    },
    completionCriteria: {
      requiresExercisePassed: true,
      requiresReadingCompleted: true,
    },
  },

  {
    id: 'l-403-the-lucena-bridge',
    moduleId: 'mod-8-advanced-endgames',
    levelId: 'level-4-advanced',
    order: 3,
    title: 'The Lucena Position: Building the Rook Bridge',
    learningObjective: 'Master the most essential theoretical winning method in Rook & Pawn endgames.',
    difficulty: 'advanced',
    estimatedMinutes: 9,
    content: {
      introduction:
        'Published in 1497, the Lucena position is the blueprint for converting a passed pawn on the 7th rank when supported by your King. By building a "bridge" with your Rook on the 4th rank, you shield your King from endless checks.',
      sections: [
        {
          title: 'The 4th Rank Bridge',
          paragraphs: [
            'Step 1: Check the enemy King away from the file.',
            'Step 2: Place your Rook on the 4th rank (Rf4!).',
            'Step 3: Step your King out to let the pawn promote, using the 4th rank Rook to block vertical checks.',
          ],
          diagramFen: '4K3/4P3/3k4/8/8/8/r7/5R2 w - - 0 1',
          diagramCaption: 'White plays Rf4! to establish the 4th rank bridge against rear checks.',
        },
      ],
      keyTakeaways: [
        'The Lucena technique is 100% winning with correct bridge technique.',
        'Place the Rook on the 4th rank to block incoming checks when your King steps out.',
      ],
    },
    exercise: {
      id: 'ex-403-lucena-bridge',
      lessonId: 'l-403-the-lucena-bridge',
      title: 'Exercise: Initiate the Lucena Bridge',
      instruction: 'Move your Rook from f1 to f4 on the 4th rank to begin constructing the classic Lucena Bridge!',
      exerciseType: 'endgame',
      initialFen: '4K3/4P3/3k4/8/8/8/r7/5R2 w - - 0 1',
      playerSide: 'w',
      steps: [
        {
          playerMoveSan: 'Rf4',
          explanation: 'Theoretical precision! The Rook occupies the 4th rank, ready to intercept Black’s checks.',
        },
      ],
      hint: 'Advance the Rook along the f-file to f4.',
      explanation: 'Rf4 is the pivotal move of the Lucena position, creating the bridge that guarantees pawn promotion.',
      difficulty: 'advanced',
    },
    completionCriteria: {
      requiresExercisePassed: true,
      requiresReadingCompleted: true,
    },
  },

  {
    id: 'l-404-good-vs-bad-bishops',
    moduleId: 'mod-8-advanced-endgames',
    levelId: 'level-4-advanced',
    order: 4,
    title: 'Good Bishops vs. Bad Bishops & Endgame Conversion',
    learningObjective: 'Recognize when your bishop is locked behind its own pawn chains and execute favorable minor-piece trades.',
    difficulty: 'advanced',
    estimatedMinutes: 8,
    content: {
      introduction:
        'A "bad bishop" is one whose movement is severely restricted by friendly pawns fixed on squares of its own color. A "good bishop" moves freely between and beyond the pawn structure.',
      sections: [
        {
          title: 'Trading Bad for Good',
          paragraphs: [
            'In master chess, games are won by pinning the opponent with a crippled bad bishop while maintaining an active knight or outside passed pawn.',
          ],
        },
      ],
      keyTakeaways: [
        'Keep your pawns on the opposite color of your bishop.',
        'Pin your opponent’s bad bishop down to defending passive pawn chains.',
      ],
    },
    exercise: {
      id: 'ex-404-trade-bishop-pin',
      lessonId: 'l-404-good-vs-bad-bishops',
      title: 'Exercise: Pin the Knight & Trade Active Pieces',
      instruction: 'Play Bb5, pinning the Black c6 Knight to weaken Black’s pawn structure upon exchange.',
      exerciseType: 'best_move',
      initialFen: 'r4rk1/pp1b1ppp/2n1p3/3p4/3P4/2PB1N2/PP3PPP/R4RK1 w - - 0 1',
      playerSide: 'w',
      steps: [
        {
          playerMoveSan: 'Bb5',
          explanation: 'Classic positional technique! Pinning and removing the defender of d4/e5.',
        },
      ],
      hint: 'Move your light-squared Bishop to b5.',
      explanation: 'Bb5 pins the knight on c6, preparing to trade bishop for knight and dominate the queenside light squares.',
      difficulty: 'advanced',
    },
    completionCriteria: {
      requiresExercisePassed: true,
      requiresReadingCompleted: true,
    },
  },

  // ==========================================
  // LEVEL 5: EXPERT
  // ==========================================
  {
    id: 'l-501-candidate-moves-elimination',
    moduleId: 'mod-9-deep-calculation',
    levelId: 'level-5-expert',
    order: 1,
    title: 'Candidate Move Selection & Calculation Trees',
    learningObjective: 'Cultivate Grandmaster Alexander Kotov’s discipline: identify 2-4 candidate moves first before calculating single branches deeply.',
    difficulty: 'expert',
    estimatedMinutes: 10,
    content: {
      introduction:
        'The fatal flaw of club players is "blunder by omission": calculating 5 moves deep on the wrong move because they failed to notice a superior candidate. Always brainstorm all forcing candidate moves before calculating.',
      sections: [
        {
          title: 'The Discipline of Candidate Moves',
          paragraphs: [
            '1. Checks, Captures, Threats (CCT).',
            '2. List 3 candidates without diving into deep calculations yet.',
            '3. Systematically calculate each branch and compare evaluations at the end of the line.',
          ],
        },
      ],
      keyTakeaways: [
        'Never play the first good move you see without surveying alternative candidates.',
        'Calculate forcing candidate moves to a quiet terminal position.',
      ],
    },
    exercise: {
      id: 'ex-501-recentralize-queen',
      lessonId: 'l-501-candidate-moves-elimination',
      title: 'Exercise: The Decisive Central Capture',
      instruction: 'Calculate your candidate moves and capture the isolated d5 pawn with your Queen, dominating the endgame!',
      exerciseType: 'best_move',
      initialFen: '2r3k1/1p3pp1/p6p/3p4/3Q4/1P3P1P/P1q3P1/4R1K1 w - - 0 1',
      playerSide: 'w',
      steps: [
        {
          playerMoveSan: 'Qxd5',
          explanation: 'Clinically calculated! You win a pawn, centralize the Queen, and control the open board.',
        },
      ],
      hint: 'Capture on d5 with your Queen.',
      explanation: 'Qxd5 snatches the pawn while keeping the 1st rank safe and eye on Black’s queenside weaknesses.',
      difficulty: 'expert',
    },
    completionCriteria: {
      requiresExercisePassed: true,
      requiresReadingCompleted: true,
    },
  },

  {
    id: 'l-502-positional-exchange-sacrifice',
    moduleId: 'mod-10-dynamic-imbalances',
    levelId: 'level-5-expert',
    order: 2,
    title: 'The Positional Exchange Sacrifice',
    learningObjective: 'Understand how sacrificing a Rook for a minor piece can yield long-term strategic domination and dark-square control.',
    difficulty: 'expert',
    estimatedMinutes: 10,
    content: {
      introduction:
        'World Champion Tigran Petrosian stunned the chess world by repeatedly giving up a 5-point rook for a 3-point bishop or knight. A rook is only as good as its open files; an entrenched minor piece can strangle an entire army.',
      sections: [
        {
          title: 'When Does the Sacrifice Pay Off?',
          paragraphs: [
            '1. When the opponent’s king safety is permanently compromised.',
            '2. When you gain an unshakeable outpost for a minor piece.',
            '3. When the opponent’s remaining rook has no open files to enter the game.',
          ],
        },
      ],
      keyTakeaways: [
        'Material points are dynamic approximations, not holy scripture.',
        'A dominant minor piece and closed files often outperform an idle rook.',
      ],
    },
    exercise: {
      id: 'ex-502-liquidate-center',
      lessonId: 'l-502-positional-exchange-sacrifice',
      title: 'Exercise: Liquidate the Tension into a Superior Structure',
      instruction: 'Capture on c5 with your d4 pawn to shatter Black’s central tension and expose their queen.',
      exerciseType: 'best_move',
      initialFen: 'r1bq1rk1/pp3ppp/2n1pn2/2pp4/2PP4/2N1PN2/PP2BPPP/R1BQK2R w KQ - 0 8',
      playerSide: 'w',
      steps: [
        {
          playerMoveSan: 'dxc5',
          explanation: 'Accurate grandmaster timing! Winning a temporary pawn and opening lines for the pieces.',
        },
      ],
      hint: 'Capture the c5 pawn using your pawn on d4.',
      explanation: 'dxc5 liquidates Black’s center, creates isolated pawn targets, and accelerates White’s initiative.',
      difficulty: 'expert',
    },
    completionCriteria: {
      requiresExercisePassed: true,
      requiresReadingCompleted: true,
    },
  },

  {
    id: 'l-503-fortress-defensive-resource',
    moduleId: 'mod-10-dynamic-imbalances',
    levelId: 'level-5-expert',
    order: 3,
    title: 'Fortress Construction & Stalemate Geometry',
    learningObjective: 'Master resilient endgame fortresses where material deficits are neutralized through spatial geometry.',
    difficulty: 'expert',
    estimatedMinutes: 9,
    content: {
      introduction:
        'A fortress is an endgame position where a player down in material builds an impenetrable barrier that the stronger side cannot breach without allowing a draw or stalemate.',
      sections: [
        {
          title: 'The Corner King Draw',
          paragraphs: [
            'With a rook pawn and wrong-colored bishop, or an immobilized b-pawn, keeping the defending king toggling between b1 and a1 guarantees an impenetrable draw.',
          ],
        },
      ],
      keyTakeaways: [
        'Even down significant material, a fortress holds the half-point.',
        'Never resign while a theoretical fortress or stalemate swindle remains available.',
      ],
    },
    exercise: {
      id: 'ex-503-hold-fortress-kb1',
      lessonId: 'l-503-fortress-defensive-resource',
      title: 'Exercise: Step into the Stalemate Fortress',
      instruction: 'Move your King to b1 to guarantee the unbreakable stalemate barrier against Black’s b3 pawn!',
      exerciseType: 'endgame',
      initialFen: '8/8/8/8/k7/1p6/1K6/8 w - - 0 1',
      playerSide: 'w',
      steps: [
        {
          playerMoveSan: 'Kb1',
          explanation: 'Flawless technique! Black cannot make progress without stalemating the White King.',
        },
      ],
      hint: 'Step your King back to b1.',
      explanation: 'Kb1 locks the position into a textbook theoretical draw; any attempt by Black to advance causes stalemate.',
      difficulty: 'expert',
    },
    completionCriteria: {
      requiresExercisePassed: true,
      requiresReadingCompleted: true,
    },
  },

  // ==========================================
  // LEVEL 6: MASTER
  // ==========================================
  {
    id: 'l-601-master-prophylaxis-restriction',
    moduleId: 'mod-11-master-strategy',
    levelId: 'level-6-master',
    order: 1,
    title: 'Master Restriction Strategy & The Squeeze',
    learningObjective: 'Emulate Anatoly Karpov’s boa constrictor style: systematically strip the opponent of every dynamic break.',
    difficulty: 'master',
    estimatedMinutes: 11,
    content: {
      introduction:
        'At the Master level, games are rarely decided by simple two-move blunders. Mastery lies in restriction: denying your opponent even an inch of counterplay until their position collapses under internal tension.',
      sections: [
        {
          title: 'The Flank Clamp',
          paragraphs: [
            'Advancing h4-h5 or a4-a5 clamps down on an entire sector of the board, freezing enemy pawns and preparing decisive piece infiltration.',
          ],
        },
      ],
      keyTakeaways: [
        'A master wins by making the opponent run out of constructive moves.',
        'Fix enemy pawns on vulnerable squares before opening lines.',
      ],
    },
    exercise: {
      id: 'ex-601-flank-clamp-h4',
      lessonId: 'l-601-master-prophylaxis-restriction',
      title: 'Exercise: The Grandmaster Flank Clamp',
      instruction: 'Launch the pawn to h4, cementing kingside spatial superiority and seizing the initiative.',
      exerciseType: 'best_move',
      initialFen: 'r2q1rk1/1b1nbppp/ppn1p3/2ppP3/P2P4/2N2NP1/1PP2PBP/R1BQR1K1 w - - 0 12',
      playerSide: 'w',
      steps: [
        {
          playerMoveSan: 'h4',
          explanation: 'Karpovian mastery! 13.h4 stakes claim to the kingside and prepares Ng5.',
        },
      ],
      hint: 'Push the h-pawn forward two squares to h4.',
      explanation: 'h4 is a profound strategic thrust, freezing Black’s kingside pawn breaks and preparing attacking routes for the knights.',
      difficulty: 'master',
    },
    completionCriteria: {
      requiresExercisePassed: true,
      requiresReadingCompleted: true,
    },
  },

  {
    id: 'l-602-principle-of-two-weaknesses',
    moduleId: 'mod-12-complex-conversion',
    levelId: 'level-6-master',
    order: 2,
    title: 'The Principle of Two Weaknesses in Endgames',
    learningObjective: 'Understand why one weakness is easily defended, but creating a second weakness on the opposite flank shatters defenses.',
    difficulty: 'master',
    estimatedMinutes: 11,
    content: {
      introduction:
        'When an opponent has a single weakness (like a backward pawn), they can allocate all pieces to defend it. By opening a second front on the opposite flank, their defensive line is stretched beyond the breaking point.',
      sections: [
        {
          title: 'The 7th Rank Infiltration',
          paragraphs: [
            'Infiltrating a rook onto the 7th rank attacks base pawns horizontally while threatening back-rank mating nets.',
          ],
        },
      ],
      keyTakeaways: [
        'Never rush to win a single weakness; probe to create a second weakness first.',
        'Rooks on the 7th rank tie down enemy pieces and paralyze movement.',
      ],
    },
    exercise: {
      id: 'ex-602-rook-seventh-rank',
      lessonId: 'l-602-principle-of-two-weaknesses',
      title: 'Exercise: Infiltrate the 7th Rank',
      instruction: 'Slide your Rook to c7, anchoring on the 7th rank and tying Black down to the defense of f7.',
      exerciseType: 'endgame',
      initialFen: '8/5pk1/4p1p1/3pP2p/3P3P/4PKP1/1r6/2R5 w - - 0 1',
      playerSide: 'w',
      steps: [
        {
          playerMoveSan: 'Rc7',
          explanation: 'Dominating! The Rook controls the 7th rank, paralyzing Black’s counterplay.',
        },
      ],
      hint: 'Move your Rook from c1 straight up to c7.',
      explanation: 'Rc7 establishes absolute 7th rank control, tying Black’s king and rook down to defensive passivity.',
      difficulty: 'master',
    },
    completionCriteria: {
      requiresExercisePassed: true,
      requiresReadingCompleted: true,
    },
  },

  {
    id: 'l-603-stalemate-swindle-resource',
    moduleId: 'mod-12-complex-conversion',
    levelId: 'level-6-master',
    order: 3,
    title: 'The Desperado Rook & Stalemate Swindles',
    learningObjective: 'Discover miraculous defensive resources: sacrificing remaining pieces with check to force stalemate when losing.',
    difficulty: 'master',
    estimatedMinutes: 10,
    content: {
      introduction:
        'A "Desperado" is a piece doomed to be captured that wreaks havoc before dying. When your King has no legal moves, checking the enemy King relentlessly forces either a perpetual check or an unwanted capture leading to immediate stalemate!',
      sections: [
        {
          title: 'The Eternal Rook',
          paragraphs: [
            '1.Rc8+ Kh7 2.Rh8+! Kxh8 (Stalemate!) or Kg6 3.Rg8+! The rook cannot be captured without giving stalemate!',
          ],
        },
      ],
      keyTakeaways: [
        'Always look for stalemate geometry when facing overwhelming material deficits.',
        'A Desperado rook can turn an imminent loss into a glorious half-point draw.',
      ],
    },
    exercise: {
      id: 'ex-603-desperado-swindle',
      lessonId: 'l-603-stalemate-swindle-resource',
      title: 'Exercise: Execute the Desperado Swindle (Multi-Move)',
      instruction: 'Deliver check with Rc8+! When Black steps to h7, sacrifice the Rook with Rh8+ for miraculous stalemate!',
      exerciseType: 'tactical_puzzle',
      initialFen: '7k/2R3p1/8/8/8/1q6/8/K7 w - - 0 1',
      playerSide: 'w',
      steps: [
        {
          playerMoveSan: 'Rc8+',
          opponentReplySan: 'Kh7',
          explanation: 'Great first check! The King is forced to h7.',
        },
        {
          playerMoveSan: 'Rh8+',
          explanation: 'Pure genius! When Black captures Kxh8, White King on a1 has zero legal moves and is not in check: Stalemate!',
        },
      ],
      hint: 'Check with Rc8+, then follow up with Rh8+ directly in Black’s face.',
      explanation: '1.Rc8+ Kh7 2.Rh8+! is the classic desperado sacrifice: capturing it produces immediate stalemate, saving the draw!',
      difficulty: 'master',
    },
    completionCriteria: {
      requiresExercisePassed: true,
      requiresReadingCompleted: true,
    },
  },

  // ==========================================
  // LEVEL 7: GRANDMASTER PREPARATION
  // ==========================================
  {
    id: 'l-701-najdorf-dynamic-preparation',
    moduleId: 'mod-13-gm-calculation',
    levelId: 'level-7-grandmaster-prep',
    order: 1,
    title: 'Deep Sicilian Najdorf: The English Attack Dynamics',
    learningObjective: 'Master the razor-sharp tactical and strategic depth of the modern Sicilian Najdorf English Attack.',
    difficulty: 'grandmaster-prep',
    estimatedMinutes: 12,
    content: {
      introduction:
        'The Sicilian Najdorf (1.e4 c5 2.Nf3 d6 3.d4 cxd4 4.Nxd4 Nf6 5.Nc3 a6) is the battlefield of world champions from Fischer to Kasparov. The English Attack (Be3, f3, g4, Qd2, 0-0-0) pits opposite-side castling in a sprint of lethal calculation.',
      sections: [
        {
          title: 'The Queen Placement',
          paragraphs: [
            'In modern theory, placing the Queen on f3 pressures the d5 break, pins the f6 Knight, and safeguards White against early ...b5 tricks.',
          ],
        },
      ],
      keyTakeaways: [
        'In opposite-side castling, speed of attack takes precedence over material.',
        'Grandmaster opening depth requires knowing the positional nuances behind each theoretical move.',
      ],
    },
    exercise: {
      id: 'ex-701-najdorf-qf3',
      lessonId: 'l-701-najdorf-dynamic-preparation',
      title: 'Exercise: Deploy the Classical Repertoire Queen',
      instruction: 'Play Qf3 to reinforce central pressure and prepare the lethal kingside assault.',
      exerciseType: 'best_move',
      initialFen: 'r1bqkb1r/1p1n1ppp/p2ppn2/6B1/3NPP2/2N5/PPP3PP/R2QKB1R w KQkq - 0 8',
      playerSide: 'w',
      steps: [
        {
          playerMoveSan: 'Qf3',
          explanation: 'Theoretical precision! 8.Qf3 pins Black’s pieces and prepares O-O-O.',
        },
      ],
      hint: 'Place your Queen on f3.',
      explanation: '8.Qf3 is the standard master continuation, preparing queenside castling and over-protecting e4.',
      difficulty: 'grandmaster-prep',
    },
    completionCriteria: {
      requiresExercisePassed: true,
      requiresReadingCompleted: true,
    },
  },

  {
    id: 'l-702-grandmaster-multi-ply-calculation',
    moduleId: 'mod-13-gm-calculation',
    levelId: 'level-7-grandmaster-prep',
    order: 2,
    title: 'Grandmaster Multi-Ply Calculation Under Pressure',
    learningObjective: 'Calculate complex multi-piece tension and execute favorable structural exchanges.',
    difficulty: 'grandmaster-prep',
    estimatedMinutes: 12,
    content: {
      introduction:
        'Elite Grandmaster calculation is not just about spotting flashy sacrifices—it is about accurately calculating unforced quiet moves, recognizing when an exchange cements an enduring structural advantage.',
      sections: [
        {
          title: 'Resolving Piece Tension',
          paragraphs: [
            'When two knights meet in the center, calculating which pawn re-captures dictate the game for the next 20 moves.',
          ],
        },
      ],
      keyTakeaways: [
        'Calculate exchanges to their ultimate pawn structure consequences.',
        'Eliminate active defenders before launching secondary tactical operations.',
      ],
    },
    exercise: {
      id: 'ex-702-knight-exchange-c6',
      lessonId: 'l-702-grandmaster-multi-ply-calculation',
      title: 'Exercise: Resolve the Central Knight Tension',
      instruction: 'Capture Black’s Knight on c6 with your e5 Knight, damaging Black’s queenside structure.',
      exerciseType: 'best_move',
      initialFen: 'r2q1rk1/pb3ppp/1pn1pn2/2ppN3/3P4/2PBP3/PP1NQPPP/R4RK1 w - - 0 11',
      playerSide: 'w',
      steps: [
        {
          playerMoveSan: 'Nxc6',
          explanation: 'Clinical grandmaster technique! You eliminate an active defender and create structural targets.',
        },
      ],
      hint: 'Take the c6 Knight using your e5 Knight.',
      explanation: 'Nxc6 forces ...Bxc6, eliminating Black’s active minor piece and preserving White’s bishop pair.',
      difficulty: 'grandmaster-prep',
    },
    completionCriteria: {
      requiresExercisePassed: true,
      requiresReadingCompleted: true,
    },
  },

  {
    id: 'l-703-tournament-pragmatism-simplification',
    moduleId: 'mod-14-critical-decisions',
    levelId: 'level-7-grandmaster-prep',
    order: 3,
    title: 'Tournament Pragmatism & Technical Simplification',
    learningObjective: 'Master practical tournament decision making: simplify into a completely winning endgame rather than risking unnecessary complications.',
    difficulty: 'grandmaster-prep',
    estimatedMinutes: 10,
    content: {
      introduction:
        'Capablanca famously said that the best way to win a game is the most certain way. When ahead in material or position, trading down into a winning king and pawn endgame eliminates all opponent counterplay.',
      sections: [
        {
          title: 'The Elimination of Counterplay',
          paragraphs: [
            'Do not give your opponent tactical swindles in time pressure. Trade the remaining heavy pieces and let your extra pawn win the game with effortless arithmetic.',
          ],
        },
      ],
      keyTakeaways: [
        'Pragmatism over vanity: a clean boring win is worth 1.0 point, just like a flashy checkmate.',
        'Trade pieces, not pawns, when defending or simplifying an advantage.',
      ],
    },
    exercise: {
      id: 'ex-703-simplify-rooks',
      lessonId: 'l-703-tournament-pragmatism-simplification',
      title: 'Exercise: The Pragmatic Grandmaster Trade',
      instruction: 'Capture Black’s d8 Rook with your d3 Rook to liquidate into an easily converted King & Pawn ending.',
      exerciseType: 'best_move',
      initialFen: '3r2k1/p4p1p/1p4p1/2p5/4P3/1P1R1PP1/P5KP/8 w - - 0 1',
      playerSide: 'w',
      steps: [
        {
          playerMoveSan: 'Rxd8+',
          explanation: 'Pure tournament precision! Trading rooks eliminates any Black back-rank threats.',
        },
      ],
      hint: 'Capture the Rook on d8 using your d3 Rook with check.',
      explanation: 'Rxd8+ trades the last pair of rooks, leaving White with an effortlessly winning King & Pawn endgame.',
      difficulty: 'grandmaster-prep',
    },
    completionCriteria: {
      requiresExercisePassed: true,
      requiresReadingCompleted: true,
    },
  },

  // --- LEVEL 5 EXPANSION ---
  {
    id: 'l-504-the-zwischenzug-intermediate-move',
    moduleId: 'mod-9-deep-calculation',
    levelId: 'level-5-expert',
    order: 4,
    title: 'The Zwischenzug: The In-Between Attack',
    learningObjective: 'Master the art of the intermediate move (Zwischenzug) that shatters the opponent’s expected recapture sequence.',
    difficulty: 'expert',
    estimatedMinutes: 10,
    content: {
      introduction:
        'A Zwischenzug (German for "in-between move") is an unexpected tactical intermezzo inserted into what looks like a forced sequence. Instead of playing the obvious recapture, you deliver a forcing check or attack that changes the evaluation entirely.',
      sections: [
        {
          title: 'The Psychology of the Intermezzo',
          paragraphs: [
            'Most players calculate linearly: "If I attack his piece, he must move it or trade." A grandmaster searches for the third option: an in-between check that leaves the enemy helpless.',
            'When Black attacks your Knight with a pawn push like ...d4, look for whether you can ignore the threat by launching an immediate check against the king.',
          ],
          diagramFen: 'r2q1rk1/ppp2p1p/2n2P2/8/3p4/2N5/PPP2PPP/R1BQK2R w KQ - 0 1',
          diagramCaption: 'Black just attacked White’s c3 Knight with ...d4, expecting White to retreat.',
        },
      ],
      keyTakeaways: [
        'Never assume a sequence is forced: always check for intermediate checks and counter-attacks.',
        'An in-between check with checkmate threats overrides any material loss on the other side of the board.',
      ],
    },
    exercise: {
      id: 'ex-504-zwischenzug-mate',
      lessonId: 'l-504-the-zwischenzug-intermediate-move',
      title: 'Exercise: Execute the Zwischenzug (Mate in 2)',
      instruction: 'Ignore Black’s attack on your c3 Knight! Deliver check with Qg4+, and when the King steps to h8, deliver checkmate with Qg7#!',
      exerciseType: 'checkmate',
      initialFen: 'r2q1rk1/ppp2p1p/2n2P2/8/3p4/2N5/PPP2PPP/R1BQK2R w KQ - 0 1',
      playerSide: 'w',
      steps: [
        {
          playerMoveSan: 'Qg4+',
          opponentReplySan: 'Kh8',
          explanation: 'Lethal intermediate attack! The King is forced to h8 with no pieces able to block.',
        },
        {
          playerMoveSan: 'Qg7#',
          explanation: 'Checkmate! The Queen delivers mate on g7 protected by the advanced pawn on f6.',
        },
      ],
      hint: 'Bring your Queen to g4 with check instead of saving the c3 knight.',
      explanation: '1.Qg4+ Kh8 2.Qg7# completely refutes Black’s premature pawn advance with a decisive mating attack.',
      difficulty: 'expert',
    },
    completionCriteria: {
      requiresExercisePassed: true,
      requiresReadingCompleted: true,
    },
  },

  // --- LEVEL 6 EXPANSION ---
  {
    id: 'l-604-the-minority-attack-carlsbad',
    moduleId: 'mod-11-master-strategy',
    levelId: 'level-6-master',
    order: 4,
    title: 'The Minority Attack: Carlsbad Structure Mastery',
    learningObjective: 'Execute the classical minority attack (b4-b5) in the Carlsbad structure to saddle Black with a permanent backward c6 pawn.',
    difficulty: 'master',
    estimatedMinutes: 11,
    content: {
      introduction:
        'The Minority Attack is one of the most famous long-term strategic plans in chess. White uses two queenside pawns (a- and b-pawns) to attack Black’s three pawns (a-, b-, and c-pawns), intentionally provoking structural weaknesses.',
      sections: [
        {
          title: 'Creating the Backward c6 Pawn',
          paragraphs: [
            'By pushing b4-b5, White forces Black to either take on b5 (isolating Black’s d5 pawn) or allow White to capture on c6, leaving Black with a weak, backward c6 pawn on an open file.',
            'White’s rooks then target the backward c6 pawn for the remainder of the game.',
          ],
          diagramFen: 'r1r3k1/pp1b1ppp/2n1pn2/3p4/1P1P4/P1N1PN2/1Q2BPPP/R4RK1 w - - 0 1',
          diagramCaption: 'White is fully harmonized and ready to unleash the minority lever b4-b5.',
        },
      ],
      keyTakeaways: [
        'The minority attack uses fewer pawns to destroy a larger enemy pawn formation.',
        'Target the backward pawn created along the semi-open c-file with rooks and heavy pieces.',
      ],
    },
    exercise: {
      id: 'ex-604-minority-lever',
      lessonId: 'l-604-the-minority-attack-carlsbad',
      title: 'Exercise: Launch the Minority Attack',
      instruction: 'Advance your pawn to b5 to strike Black’s c6 pawn and initiate the structural breakdown of the queenside.',
      exerciseType: 'best_move',
      initialFen: 'r1r3k1/pp1b1ppp/2n1pn2/3p4/1P1P4/P1N1PN2/1Q2BPPP/R4RK1 w - - 0 1',
      playerSide: 'w',
      steps: [
        {
          playerMoveSan: 'b5',
          explanation: 'Classic master technique! 1.b5 strikes directly at the heart of Black’s pawn chain.',
        },
      ],
      hint: 'Push your b4 pawn forward to b5.',
      explanation: 'b5 is the thematic minority attack break, guaranteeing a permanent positional advantage against Black’s queenside.',
      difficulty: 'master',
    },
    completionCriteria: {
      requiresExercisePassed: true,
      requiresReadingCompleted: true,
    },
  },

  // --- LEVEL 7 EXPANSION ---
  {
    id: 'l-704-converting-plus-equals-endgame',
    moduleId: 'mod-14-critical-decisions',
    levelId: 'level-7-grandmaster-prep',
    order: 4,
    title: 'Converting Plus-Equals: Master King Centralization',
    learningObjective: 'Demonstrate elite endgame technique by aggressively activating the King to infiltrate the opponent’s weakened structure.',
    difficulty: 'grandmaster-prep',
    estimatedMinutes: 12,
    content: {
      introduction:
        'In equal or slightly superior ("plus-equals") endgames, the player who activates their king first almost always commands the board. The King transitions from a vulnerable liability into an aggressive attacking piece.',
      sections: [
        {
          title: 'The King Infiltration Route',
          paragraphs: [
            'With the rooks still on the board, the King marches forward through dark-square conduits like f3-g4-h5, targeting base pawns and supporting rook penetration.',
            'Amateurs leave their king passive; Grandmasters lead the attack with the monarch.',
          ],
          diagramFen: '3r4/pp3k2/4p1p1/3pP3/3P4/2P2K2/PP6/6R1 w - - 0 1',
          diagramCaption: 'White King on f3 can advance to g4 to dominate the dark squares and infiltrate.',
        },
      ],
      keyTakeaways: [
        'In the endgame, the King is a powerful attacking piece worth as much as a minor piece.',
        'Advance the King toward weak enemy pawns while keeping opponent counterplay restricted.',
      ],
    },
    exercise: {
      id: 'ex-704-king-march-g4',
      lessonId: 'l-704-converting-plus-equals-endgame',
      title: 'Exercise: The Grandmaster King March',
      instruction: 'Advance your King to g4 to prepare deep infiltration into Black’s weakened kingside squares.',
      exerciseType: 'endgame',
      initialFen: '3r4/pp3k2/4p1p1/3pP3/3P4/2P2K2/PP6/6R1 w - - 0 1',
      playerSide: 'w',
      steps: [
        {
          playerMoveSan: 'Kg4',
          explanation: 'Exceptional grandmaster endgame technique! The King marches forward to spearhead the attack.',
        },
      ],
      alternativeSolutionsSan: ['Kf4'],
      hint: 'Step your King forward to g4.',
      explanation: 'Kg4 activates the King, preparing Kh5 or Rh1 followed by an unstoppable invasion of the 7th rank.',
      difficulty: 'grandmaster-prep',
    },
    completionCriteria: {
      requiresExercisePassed: true,
      requiresReadingCompleted: true,
    },
  },
];

export const LESSON_MAP: Record<string, TrainingLesson> = TRAINING_LESSONS.reduce(
  (acc, lesson) => {
    acc[lesson.id] = lesson;
    return acc;
  },
  {} as Record<string, TrainingLesson>
);

export const MODULE_MAP: Record<string, CurriculumModule> = CURRICULUM_MODULES.reduce(
  (acc, mod) => {
    acc[mod.id] = mod;
    return acc;
  },
  {} as Record<string, CurriculumModule>
);
