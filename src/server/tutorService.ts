/**
 * Server-side AI Tutor Service with @google/genai tool calling and deterministic local fallback.
 * Strictly validates all LLM tool actions against headless chess.js before returning to client.
 */

import { GoogleGenAI, Type, type FunctionDeclaration } from '@google/genai';
import { Chess, type Square } from 'chess.js';
import {
  isGeminiConfigured,
  getActiveModel,
  COACH_MODEL,
} from './geminiClient';
import type {
  TutorBoardAction,
  TutorOrchestratorAction,
  TutorTurnRequest,
  TutorTurnResponse,
} from '../features/tutor/types';

// Structured tool declarations for Gemini Function Calling
const TUTOR_TOOLS: FunctionDeclaration[] = [
  {
    name: 'set_position',
    description: 'Sets the chessboard to a specific legal FEN position for teaching or demonstration.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        fen: {
          type: Type.STRING,
          description: 'A valid FEN string representing the chess position.',
        },
        description: {
          type: Type.STRING,
          description: 'Brief description of the position being set up.',
        },
      },
      required: ['fen'],
    },
  },
  {
    name: 'move_piece',
    description: 'Demonstrates a legal chess move on the active board position.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        from: {
          type: Type.STRING,
          description: 'Starting square (e.g. e2, g1, d4).',
        },
        to: {
          type: Type.STRING,
          description: 'Destination square (e.g. e4, f3, c6).',
        },
        promotion: {
          type: Type.STRING,
          description: 'Promotion piece if a pawn reaches the 8th/1st rank: q, r, b, n.',
        },
        explanation: {
          type: Type.STRING,
          description: 'Why this move is played or demonstrated.',
        },
      },
      required: ['from', 'to'],
    },
  },
  {
    name: 'highlight_square',
    description: 'Highlights a specific square on the board to draw the student attention.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        square: {
          type: Type.STRING,
          description: 'Square coordinate to highlight (e.g. e4, d5, f7).',
        },
        color: {
          type: Type.STRING,
          description: 'CSS color string, e.g. rgba(214, 179, 106, 0.45) for gold, rgba(239, 68, 68, 0.45) for red.',
        },
      },
      required: ['square'],
    },
  },
  {
    name: 'highlight_squares',
    description: 'Highlights multiple squares at once, such as legal destinations or an outpost.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        squares: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: 'Array of squares to highlight (e.g. ["e4", "d4", "e5", "d5"]).',
        },
        color: {
          type: Type.STRING,
          description: 'CSS color string.',
        },
      },
      required: ['squares'],
    },
  },
  {
    name: 'show_arrow',
    description: 'Draws a colored visual arrow from one square to another.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        from: {
          type: Type.STRING,
          description: 'Arrow origin square.',
        },
        to: {
          type: Type.STRING,
          description: 'Arrow target square.',
        },
        color: {
          type: Type.STRING,
          description: 'Color of the arrow, e.g. rgb(214, 179, 106) for gold.',
        },
      },
      required: ['from', 'to'],
    },
  },
  {
    name: 'clear_highlights',
    description: 'Clears all custom square highlights and marks from the board.',
    parameters: {
      type: Type.OBJECT,
      properties: {},
    },
  },
  {
    name: 'clear_arrows',
    description: 'Clears all directional arrows from the board.',
    parameters: {
      type: Type.OBJECT,
      properties: {},
    },
  },
  {
    name: 'flip_board',
    description: 'Flips board orientation between white and black perspective.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        orientation: {
          type: Type.STRING,
          description: 'Either "white" or "black".',
        },
      },
    },
  },
  {
    name: 'reset_board',
    description: 'Resets the chessboard to the standard starting position.',
    parameters: {
      type: Type.OBJECT,
      properties: {},
    },
  },
  {
    name: 'request_student_move',
    description: 'Prompts the student to play a move on the board in practice mode.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        hint: {
          type: Type.STRING,
          description: 'Gentle nudge without revealing the exact move.',
        },
        prompt: {
          type: Type.STRING,
          description: 'Instruction shown to the student.',
        },
      },
    },
  },
  {
    name: 'start_position_exercise',
    description: 'Initiates an interactive tactical or conceptual exercise for the student to solve.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        initialFen: {
          type: Type.STRING,
          description: 'Initial FEN position.',
        },
        targetMove: {
          type: Type.STRING,
          description: 'Target correct move in SAN or UCI (e.g. "Nxc7+", "d5c7", "Qxf7#").',
        },
        opponentReply: {
          type: Type.STRING,
          description: 'Optional opponent auto-counter move in SAN or UCI.',
        },
        objective: {
          type: Type.STRING,
          description: 'The puzzle objective, e.g. "Find the winning fork".',
        },
      },
      required: ['initialFen', 'targetMove', 'objective'],
    },
  },
  {
    name: 'start_lesson',
    description: 'Loads a canonical curriculum lesson into the AI Tutor session.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        lessonId: {
          type: Type.STRING,
          description: 'Canonical lesson ID (e.g. "l-102-knight-movement", "l-105-castling-king-safety").',
        },
      },
      required: ['lessonId'],
    },
  },
  {
    name: 'complete_lesson',
    description: 'Marks the active lesson completed after the student demonstrates mastery.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        lessonId: {
          type: Type.STRING,
          description: 'The canonical lesson ID to mark complete.',
        },
      },
      required: ['lessonId'],
    },
  },
  {
    name: 'prompt_test_arena',
    description: 'Proposes transitioning the student to Test Arena for an unassisted diagnostic match.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        reason: {
          type: Type.STRING,
          description: 'Reason why the student is ready for a formal assessment.',
        },
        recommendedFormat: {
          type: Type.STRING,
          description: 'single, battery, or tactical.',
        },
      },
      required: ['reason'],
    },
  },
];

const TUTOR_SYSTEM_INSTRUCTION = `You are the Grandmaster AI Tutor of CHESS ACADEMY.
Your mission is to teach chess systematically, patiently, and interactively like a master instructor sitting beside the student at a physical board.

KEY PRINCIPLES:
1. Explain ONE concept at a time. Do not overwhelm beginners with dense variations.
2. USE THE BOARD! When explaining a piece or move, invoke tool actions like set_position, move_piece, highlight_square, or show_arrow to demonstrate visually.
3. FOLLOW THE TEACHING CYCLE:
   - Step 1: Introduce concept & purpose.
   - Step 2: Demonstrate on board (use move_piece or highlight_squares).
   - Step 3: Ask student to move or solve an exercise (use request_student_move or start_position_exercise).
   - Step 4: Evaluate, explain mistakes, and advance.
4. AUTHORITY BOUNDARY:
   - You control demonstrations, but chess legality is strictly validated. Never attempt illegal moves.
   - For formal assessments, you can propose Test Arena, but the student must confirm. Test Arena itself is strictly unassisted.
5. LANGUAGE SUPPORT:
   - You naturally support both English and Bengali (বাংলা) if the student communicates in either language.
   - Standard algebraic chess notation (e.g. e4, Nf3, O-O, Qxf7#) remains precise.
6. TONE:
   - Noble, encouraging, patient, articulate, and deeply respectful of the game's beauty.`;

/**
 * Validates and filters AI-generated board actions using chess.js.
 */
function validateActions(
  startingFen: string,
  rawActions: any[]
): { validBoardActions: TutorBoardAction[]; validOrchestratorActions: TutorOrchestratorAction[] } {
  const validBoardActions: TutorBoardAction[] = [];
  const validOrchestratorActions: TutorOrchestratorAction[] = [];

  let simulatedFen = startingFen;
  const chess = new Chess();

  try {
    chess.load(simulatedFen);
  } catch {
    chess.load('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
  }

  for (const act of rawActions) {
    if (!act || typeof act !== 'object' || !act.name) continue;

    const name = act.name;
    const args = act.args || {};

    switch (name) {
      case 'set_position': {
        if (typeof args.fen === 'string') {
          try {
            const testChess = new Chess(args.fen);
            if (testChess.fen()) {
              simulatedFen = testChess.fen();
              chess.load(simulatedFen);
              validBoardActions.push({
                type: 'set_position',
                fen: simulatedFen,
                description: args.description,
              });
            }
          } catch {
            // skip invalid FEN
          }
        }
        break;
      }

      case 'move_piece': {
        if (typeof args.from === 'string' && typeof args.to === 'string') {
          try {
            const moveRes = chess.move({
              from: args.from.toLowerCase() as Square,
              to: args.to.toLowerCase() as Square,
              promotion: args.promotion,
            });
            if (moveRes) {
              validBoardActions.push({
                type: 'move_piece',
                from: args.from.toLowerCase(),
                to: args.to.toLowerCase(),
                promotion: args.promotion,
                explanation: args.explanation,
              });
              simulatedFen = chess.fen();
            }
          } catch {
            // Illegal move rejected
          }
        }
        break;
      }

      case 'highlight_square': {
        if (typeof args.square === 'string' && /^[a-h][1-8]$/i.test(args.square)) {
          validBoardActions.push({
            type: 'highlight_square',
            square: args.square.toLowerCase(),
            color: args.color,
          });
        }
        break;
      }

      case 'highlight_squares': {
        if (Array.isArray(args.squares)) {
          const cleanSq = args.squares
            .filter((s: any) => typeof s === 'string' && /^[a-h][1-8]$/i.test(s))
            .map((s: string) => s.toLowerCase());
          if (cleanSq.length > 0) {
            validBoardActions.push({
              type: 'highlight_squares',
              squares: cleanSq,
              color: args.color,
            });
          }
        }
        break;
      }

      case 'show_arrow': {
        if (
          typeof args.from === 'string' &&
          typeof args.to === 'string' &&
          /^[a-h][1-8]$/i.test(args.from) &&
          /^[a-h][1-8]$/i.test(args.to)
        ) {
          validBoardActions.push({
            type: 'show_arrow',
            from: args.from.toLowerCase(),
            to: args.to.toLowerCase(),
            color: args.color,
          });
        }
        break;
      }

      case 'clear_highlights': {
        validBoardActions.push({ type: 'clear_highlights' });
        break;
      }

      case 'clear_arrows': {
        validBoardActions.push({ type: 'clear_arrows' });
        break;
      }

      case 'flip_board': {
        validBoardActions.push({
          type: 'flip_board',
          orientation: args.orientation === 'black' ? 'black' : 'white',
        });
        break;
      }

      case 'reset_board': {
        validBoardActions.push({ type: 'reset_board' });
        simulatedFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
        chess.load(simulatedFen);
        break;
      }

      case 'request_student_move': {
        validBoardActions.push({
          type: 'request_student_move',
          hint: args.hint,
          prompt: args.prompt,
        });
        break;
      }

      case 'start_position_exercise': {
        if (
          typeof args.initialFen === 'string' &&
          typeof args.targetMove === 'string' &&
          typeof args.objective === 'string'
        ) {
          try {
            const testChess = new Chess(args.initialFen);
            if (testChess.fen()) {
              validBoardActions.push({
                type: 'start_position_exercise',
                initialFen: testChess.fen(),
                targetMove: args.targetMove,
                opponentReply: args.opponentReply,
                objective: args.objective,
              });
            }
          } catch {
            // invalid FEN
          }
        }
        break;
      }

      // Orchestrator actions
      case 'start_lesson': {
        if (typeof args.lessonId === 'string') {
          validOrchestratorActions.push({
            type: 'start_lesson',
            lessonId: args.lessonId,
          });
        }
        break;
      }

      case 'complete_lesson': {
        if (typeof args.lessonId === 'string') {
          validOrchestratorActions.push({
            type: 'complete_lesson',
            lessonId: args.lessonId,
          });
        }
        break;
      }

      case 'prompt_test_arena': {
        validOrchestratorActions.push({
          type: 'prompt_test_arena',
          reason: args.reason || 'You are ready for a formal diagnostic match.',
          recommendedFormat: args.recommendedFormat || 'single',
        });
        break;
      }
    }
  }

  return { validBoardActions, validOrchestratorActions };
}

/**
 * Deterministic local fallback tutor engine when Gemini is offline or unconfigured.
 */
function runLocalFallbackTutor(request: TutorTurnRequest): TutorTurnResponse {
  const latestMessage = request.messages[request.messages.length - 1]?.content.toLowerCase() || '';
  const currentFen = request.boardState.fen;

  // 1. Initial Assessment Request
  if (
    latestMessage.includes('assess') ||
    latestMessage.includes('evaluation') ||
    latestMessage.includes('test my skill') ||
    latestMessage.includes('start test')
  ) {
    return {
      message:
        'Welcome, candidate! Let us conduct your Initial Skill Assessment to discover your chess knowledge and build your personalized curriculum. Click "Start Initial Assessment" below to begin.',
      boardActions: [{ type: 'reset_board' }],
      orchestratorActions: [{ type: 'start_initial_assessment' }],
      suggestedReplies: [
        'Start Initial Assessment',
        'Teach me Knight movement',
        'Teach me Castling rules',
        'What should I learn next?',
      ],
      source: 'local_fallback',
    };
  }

  // 2. Knight Movement Lesson & Demonstration
  if (latestMessage.includes('knight') || latestMessage.includes('ঘোড়া')) {
    const knightFen = '8/8/8/8/3N4/8/8/8 w - - 0 1';
    return {
      message:
        'The Knight is the most unique piece in chess. Unlike other pieces that travel in straight lines, the Knight moves in an "L-shape" (two squares in one direction, then one square perpendicular) and can jump over any piece on the board!\n\nNotice the gold highlighted squares on the board — from d4, the knight controls 8 active squares: c6, e6, f5, f3, e2, c2, b3, and b5. Let me demonstrate a jump to f5.',
      boardActions: [
        { type: 'set_position', fen: knightFen, description: 'Isolated White Knight on d4' },
        {
          type: 'highlight_squares',
          squares: ['c6', 'e6', 'f5', 'f3', 'e2', 'c2', 'b3', 'b5'],
          color: 'rgba(214, 179, 106, 0.45)',
        },
        { type: 'show_arrow', from: 'd4', to: 'f5', color: 'rgb(214, 179, 106)' },
        { type: 'move_piece', from: 'd4', to: 'f5', explanation: 'Knight jumps to f5' },
        {
          type: 'start_position_exercise',
          initialFen: '8/8/8/8/5N2/8/8/8 w - - 0 1',
          targetMove: 'f4d5',
          objective: 'Practice: Move the Knight on f4 to the central outpost on d5!',
        },
      ],
      orchestratorActions: [{ type: 'start_lesson', lessonId: 'l-102-knight-movement' }],
      suggestedReplies: [
        'How does the Bishop move?',
        'Teach me Castling',
        'What is En Passant?',
        'What should I learn next?',
      ],
      source: 'local_fallback',
    };
  }

  // 3. Castling Lesson & Demonstration
  if (latestMessage.includes('castle') || latestMessage.includes('castling') || latestMessage.includes('ক্যাসলিং')) {
    const castlingFen = 'r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1';
    return {
      message:
        'Castling is the only move in chess where TWO pieces move in a single turn! The King moves two squares toward the Rook, and the Rook leaps over to stand immediately beside the King.\n\nCastling accomplishes two vital goals at once: it tucks your King into safety in the corner and activates your Rook toward the center.\n\nWatch as White castles kingside (O-O).',
      boardActions: [
        { type: 'set_position', fen: castlingFen, description: 'Castling Demonstration' },
        { type: 'show_arrow', from: 'e1', to: 'g1', color: 'rgb(214, 179, 106)' },
        { type: 'move_piece', from: 'e1', to: 'g1', explanation: 'Kingside Castle' },
        {
          type: 'start_position_exercise',
          initialFen: 'r3k2r/pppppppp/8/8/8/8/PPPPPPPP/4K2R b Kkq - 1 1',
          targetMove: 'e8c8',
          objective: 'Your Turn: Black has queenside castling rights! Execute queenside castle (O-O-O).',
        },
      ],
      orchestratorActions: [{ type: 'start_lesson', lessonId: 'l-105-castling-king-safety' }],
      suggestedReplies: [
        'When is castling illegal?',
        'Teach me En Passant',
        'Show me a Knight Fork',
        'What should I learn next?',
      ],
      source: 'local_fallback',
    };
  }

  // 4. En Passant Demonstration
  if (latestMessage.includes('en passant') || latestMessage.includes('passant')) {
    const enPassantFen = 'rnbqkbnr/ppp1p1pp/8/3pPp2/8/8/PPPP1PPP/RNBQKBNR w KQkq f6 0 3';
    return {
      message:
        'En Passant ("in passing") is a special pawn capture rule. When an enemy pawn advances two squares from its starting rank and lands directly beside your pawn on the 5th rank, you may capture it diagonally as if it had only moved one square!\n\nCrucial rule: En Passant must be played immediately on the very next turn, or the right is forfeited forever. Watch the e5 pawn capture on f6!',
      boardActions: [
        { type: 'set_position', fen: enPassantFen, description: 'En Passant Setup' },
        { type: 'show_arrow', from: 'e5', to: 'f6', color: 'rgb(214, 179, 106)' },
        { type: 'move_piece', from: 'e5', to: 'f6', explanation: 'En Passant capture' },
      ],
      orchestratorActions: [{ type: 'start_lesson', lessonId: 'l-106-en-passant-capture' }],
      suggestedReplies: [
        'Show me Pawn Promotion',
        'Teach me Checkmate patterns',
        'What should I learn next?',
      ],
      source: 'local_fallback',
    };
  }

  // 5. Pawn Promotion Demonstration
  if (latestMessage.includes('promotion') || latestMessage.includes('pawn promote')) {
    const promoFen = '8/4P3/8/8/8/8/8/4K2k w - - 0 1';
    return {
      message:
        'Pawn Promotion: When a humble pawn marches all the way to the 8th rank, it undergoes an immediate promotion into a Queen, Rook, Bishop, or Knight! In 98% of cases, promoting to a Queen provides overwhelming firepower.',
      boardActions: [
        { type: 'set_position', fen: promoFen, description: 'Pawn Queening' },
        { type: 'show_arrow', from: 'e7', to: 'e8', color: 'rgb(214, 179, 106)' },
        { type: 'move_piece', from: 'e7', to: 'e8', promotion: 'q', explanation: 'Pawn promotes to Queen' },
      ],
      orchestratorActions: [{ type: 'start_lesson', lessonId: 'l-103-pawn-promotion-mechanics' }],
      suggestedReplies: [
        'What is a Knight Fork?',
        'Teach me Castling',
        'What should I learn next?',
      ],
      source: 'local_fallback',
    };
  }

  // 6. Next Lesson / Curriculum Guidance
  if (
    latestMessage.includes('next') ||
    latestMessage.includes('recommend') ||
    latestMessage.includes('curriculum') ||
    latestMessage.includes('what should i learn')
  ) {
    const completed = request.learnerContext.completedLessonIds;
    let nextId = 'l-101-board-ranks-files';
    if (completed.includes('l-101-board-ranks-files')) nextId = 'l-102-knight-movement';
    if (completed.includes('l-102-knight-movement')) nextId = 'l-103-pawn-promotion-mechanics';
    if (completed.includes('l-103-pawn-promotion-mechanics')) nextId = 'l-104-check-and-checkmate';
    if (completed.includes('l-104-check-and-checkmate')) nextId = 'l-105-castling-king-safety';

    return {
      message: `Based on your academy progress, your next recommended canonical milestone is lesson "${nextId}". Let us dive into this subject together!`,
      boardActions: [{ type: 'reset_board' }],
      orchestratorActions: [{ type: 'start_lesson', lessonId: nextId }],
      suggestedReplies: [
        'Start this lesson',
        'Show me how knights move',
        'Teach me Castling rules',
        'Take Skill Assessment',
      ],
      source: 'local_fallback',
    };
  }

  // 7. Test Arena Proposal
  if (latestMessage.includes('test arena') || latestMessage.includes('arena') || latestMessage.includes('assessment match')) {
    return {
      message:
        'The Test Arena is where you measure your genuine unassisted chess strength. During an active Test Arena match, all AI coaching, hints, and live evaluations are strictly suppressed. Would you like to enter a formal Single Match Diagnostic?',
      boardActions: [],
      orchestratorActions: [
        {
          type: 'prompt_test_arena',
          reason: 'Evaluate your calculation consistency under classical rapid time controls.',
          recommendedFormat: 'single',
        },
      ],
      suggestedReplies: [
        'Enter Test Arena (15+10)',
        'Continue Academy Training',
        'Assess my skill',
      ],
      source: 'local_fallback',
    };
  }

  // Default Pedagogical Greeting / Reply
  return {
    message:
      'Greetings! I am your Grandmaster AI Tutor. We can explore any concept in our 7-level curriculum, demonstrate piece movement and tactical motifs on the board, solve interactive puzzles, or conduct an Initial Skill Assessment to calibrate your personalized curriculum. What would you like to explore today?',
    boardActions: [],
    orchestratorActions: [],
    suggestedReplies: [
      'Take Initial Skill Assessment',
      'Show me how Knights move',
      'Teach me Castling rules',
      'What should I learn next?',
    ],
    source: 'local_fallback',
  };
}

/**
 * Safely executes a promise with an upper bound client timeout (8s default),
 * returning fallbackVal if the timeout expires.
 */
async function withTimeout<T>(
  action: Promise<T>,
  timeoutMs = 8000,
  fallbackVal: T
): Promise<T> {
  let timer: NodeJS.Timeout;
  const timeoutPromise = new Promise<T>((resolve) => {
    timer = setTimeout(() => {
      console.warn(`[TutorService] Gemini request exceeded client wait deadline of ${timeoutMs}ms, resolving to local fallback`);
      resolve(fallbackVal);
    }, timeoutMs);
  });

  return Promise.race([action, timeoutPromise]).finally(() => clearTimeout(timer));
}

/**
 * Primary server-side handler for an AI Tutor conversational turn.
 */
export async function executeTutorTurn(request: TutorTurnRequest): Promise<TutorTurnResponse> {
  // If Gemini is not configured, immediately use intelligent local fallback
  if (!isGeminiConfigured()) {
    return runLocalFallbackTutor(request);
  }

  const fallback = runLocalFallbackTutor(request);

  return withTimeout(
    (async () => {
      try {
        const apiKey = process.env.GEMINI_API_KEY;
        const ai = new GoogleGenAI({
          apiKey,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            },
          },
        });

        const activeModel = getActiveModel() || COACH_MODEL;

        // Convert messages to GenAI format
        const contents = request.messages.map((m) => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }],
        }));

        // Append context metadata to the latest user message
        const latestPart = contents[contents.length - 1]?.parts[0];
        if (latestPart) {
          latestPart.text += `\n\n[CURRENT BOARD CONTEXT]: FEN: "${request.boardState.fen}", Orientation: ${request.boardState.boardOrientation}, Mode: ${request.boardState.mode}, Active Lesson: "${request.boardState.activeLessonId || 'None'}", Current Level: "${request.learnerContext.currentLevelId}".`;
        }

        const response = await ai.models.generateContent({
          model: activeModel,
          contents,
          config: {
            systemInstruction: TUTOR_SYSTEM_INSTRUCTION,
            tools: [{ functionDeclarations: TUTOR_TOOLS }],
          },
        });

        const candidate = response.candidates?.[0];
        const text = response.text || 'I am ready to guide your study. What chess concept shall we examine on the board?';

        // Extract function calls from candidate parts
        const functionCalls: any[] = [];
        if (candidate?.content?.parts) {
          for (const part of candidate.content.parts) {
            if (part.functionCall) {
              functionCalls.push(part.functionCall);
            }
          }
        }

        // Validate all generated board actions with chess.js
        const { validBoardActions, validOrchestratorActions } = validateActions(
          request.boardState.fen,
          functionCalls
        );

        return {
          message: text,
          boardActions: validBoardActions,
          orchestratorActions: validOrchestratorActions,
          suggestedReplies: [
            'Show me an example on the board',
            'Give me an exercise to solve',
            'What should I learn next?',
            'Take Skill Assessment',
          ],
          source: 'gemini' as const,
        };
      } catch (err) {
        console.warn('[Chess Academy] Gemini Tutor error, falling back to local engine:', err);
        return fallback;
      }
    })(),
    8000,
    fallback
  );
}

