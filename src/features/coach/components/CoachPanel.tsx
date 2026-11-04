import React, { useState } from 'react';
import {
  Sparkles,
  HelpCircle,
  Brain,
  MessageSquare,
  ChevronRight,
  ShieldAlert,
  Target,
  Compass,
  Zap,
  Send,
  Loader2,
} from 'lucide-react';
import type { HintStage } from '../../../types/ai';
import type { EngineEvaluation, ChessColor } from '../../../types/chess';
import { useAICoach } from '../hooks/useAICoach';

interface CoachPanelProps {
  mode: 'training' | 'analysis';
  fen: string;
  objective?: string;
  expectedMoveSan?: string;
  exerciseCategory?: string;
  userColor?: ChessColor;
  engineEvaluation?: EngineEvaluation | null;
  recentMovesSan?: string[];
  className?: string;
}

export const CoachPanel: React.FC<CoachPanelProps> = ({
  mode,
  fen,
  objective = 'Evaluate the position and find the best move',
  expectedMoveSan,
  exerciseCategory,
  userColor = 'w',
  engineEvaluation,
  recentMovesSan = [],
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState<'hints' | 'position' | 'chat'>(
    mode === 'training' ? 'hints' : 'position'
  );
  const [chatInput, setChatInput] = useState('');

  const {
    loadingHint,
    hintError,
    currentHint,
    currentHintStage,
    requestHint,
    loadingPosition,
    positionError,
    positionExplanation,
    requestPositionExplanation,
    chatMessages,
    chatLoading,
    sendChatMessage,
  } = useAICoach();

  const handleFetchHint = (stage: HintStage) => {
    requestHint(fen, objective, stage, expectedMoveSan, exerciseCategory);
  };

  const handleFetchPosition = () => {
    requestPositionExplanation(fen, engineEvaluation || undefined, userColor, recentMovesSan);
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;
    const msg = chatInput.trim();
    setChatInput('');
    sendChatMessage(msg, fen, userColor);
  };

  return (
    <div
      className={`rounded-2xl border border-[#242938] bg-[#10121B] shadow-xl overflow-hidden flex flex-col ${className}`}
    >
      {/* Header & Tabs */}
      <div className="p-3.5 bg-[#171A24] border-b border-[#242938] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#D6B36A]/10 border border-[#D6B36A]/30 flex items-center justify-center text-[#D6B36A]">
            <Brain className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#F4F4F5]">
              Grandmaster AI Coach
            </h3>
            <span className="text-[10px] font-mono text-[#9297A5]">
              Powered by Gemini 3.8 Flash & Stockfish WASM
            </span>
          </div>
        </div>

        <div className="flex p-0.5 rounded-lg bg-[#10121B] border border-[#242938]">
          {mode === 'training' && (
            <button
              type="button"
              onClick={() => setActiveTab('hints')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-mono transition-all cursor-pointer ${
                activeTab === 'hints'
                  ? 'bg-[#D6B36A] text-[#0B0D14] font-bold'
                  : 'text-[#9297A5] hover:text-[#F4F4F5]'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Hints</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setActiveTab('position')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-mono transition-all cursor-pointer ${
              activeTab === 'position'
                ? 'bg-[#D6B36A] text-[#0B0D14] font-bold'
                : 'text-[#9297A5] hover:text-[#F4F4F5]'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Position</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-mono transition-all cursor-pointer ${
              activeTab === 'chat'
                ? 'bg-[#D6B36A] text-[#0B0D14] font-bold'
                : 'text-[#9297A5] hover:text-[#F4F4F5]'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Dialogue</span>
          </button>
        </div>
      </div>

      {/* Body Content */}
      <div className="p-4 flex-1 space-y-4">
        {/* TAB 1: Progressive Hints (for Training Academy) */}
        {activeTab === 'hints' && (
          <div className="space-y-4">
            <div className="text-xs text-[#9297A5] leading-relaxed">
              Progressive hints guide you through three pedagogical stages without spoiling the puzzle solution. Requesting hints does not penalize your exercise attempts.
            </div>

            {/* Stage Selector Buttons */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleFetchHint(1)}
                disabled={loadingHint}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  currentHint?.stage === 1
                    ? 'border-[#D6B36A] bg-[#171A24] text-[#F4F4F5]'
                    : 'border-[#242938] bg-[#12151E] text-[#9297A5] hover:border-[#384257]'
                }`}
              >
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#D6B36A] font-bold uppercase mb-0.5">
                  <Compass className="w-3 h-3" />
                  <span>Stage 1</span>
                </div>
                <div className="text-xs font-semibold">Direction</div>
              </button>

              <button
                type="button"
                onClick={() => handleFetchHint(2)}
                disabled={loadingHint}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  currentHint?.stage === 2
                    ? 'border-[#D6B36A] bg-[#171A24] text-[#F4F4F5]'
                    : 'border-[#242938] bg-[#12151E] text-[#9297A5] hover:border-[#384257]'
                }`}
              >
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#D6B36A] font-bold uppercase mb-0.5">
                  <Zap className="w-3 h-3" />
                  <span>Stage 2</span>
                </div>
                <div className="text-xs font-semibold">Tactical Motif</div>
              </button>

              <button
                type="button"
                onClick={() => handleFetchHint(3)}
                disabled={loadingHint}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  currentHint?.stage === 3
                    ? 'border-[#D6B36A] bg-[#171A24] text-[#F4F4F5]'
                    : 'border-[#242938] bg-[#12151E] text-[#9297A5] hover:border-[#384257]'
                }`}
              >
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#D6B36A] font-bold uppercase mb-0.5">
                  <Target className="w-3 h-3" />
                  <span>Stage 3</span>
                </div>
                <div className="text-xs font-semibold">Concrete Idea</div>
              </button>
            </div>

            {/* Loading Indicator */}
            {loadingHint && (
              <div className="p-4 rounded-xl bg-[#171A24] border border-[#242938] flex items-center justify-center gap-2 text-xs font-mono text-[#D6B36A]">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Consulting Grandmaster Coach...</span>
              </div>
            )}

            {/* Error Message */}
            {hintError && (
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-xs text-red-200">
                {hintError}
              </div>
            )}

            {/* Active Hint Card */}
            {currentHint && !loadingHint && (
              <div className="p-4 rounded-xl bg-[#171A24] border border-[#D6B36A]/40 space-y-2.5 animate-fadeIn">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-[#D6B36A] font-bold uppercase tracking-wider">
                    {currentHint.title}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#10121B] text-[#9297A5] border border-[#242938]">
                    {currentHint.source === 'gemini' ? 'Gemini 3.8' : 'Academy Offline Engine'}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-[#F4F4F5] leading-relaxed">
                  {currentHint.hint}
                </p>

                <div className="pt-2 border-t border-[#242938] flex items-center justify-between text-[11px] font-mono text-[#9297A5]">
                  <span>Focus: <strong className="text-[#D6B36A]">{currentHint.pedagogicalFocus}</strong></span>
                  {currentHint.stage < 3 && (
                    <button
                      type="button"
                      onClick={() => handleFetchHint((currentHint.stage + 1) as HintStage)}
                      className="text-[#D6B36A] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>Next Stage</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Positional Explanation */}
        {activeTab === 'position' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#9297A5]">
                Grandmaster assessment anchored in Stockfish WASM evaluation.
              </span>
              <button
                type="button"
                onClick={handleFetchPosition}
                disabled={loadingPosition}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#D6B36A] hover:bg-[#E8CF96] text-[#0B0D14] text-xs font-mono font-bold transition-all cursor-pointer disabled:opacity-50"
              >
                {loadingPosition ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                <span>Analyze Position</span>
              </button>
            </div>

            {loadingPosition && (
              <div className="p-6 rounded-xl bg-[#171A24] border border-[#242938] flex items-center justify-center gap-2 text-xs font-mono text-[#D6B36A]">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Evaluating pawn structure, piece activity, and king safety...</span>
              </div>
            )}

            {positionError && (
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-xs text-red-200">
                {positionError}
              </div>
            )}

            {positionExplanation && !loadingPosition && (
              <div className="space-y-3 animate-fadeIn">
                <div className="p-3.5 rounded-xl bg-[#171A24] border border-[#242938]">
                  <h4 className="text-xs sm:text-sm font-bold text-[#F4F4F5] mb-1">
                    {positionExplanation.headline}
                  </h4>
                  {positionExplanation.evaluationSummary && (
                    <span className="text-[11px] font-mono text-[#D6B36A]">
                      Engine Assessment: {positionExplanation.evaluationSummary}
                    </span>
                  )}
                </div>

                {positionExplanation.positionalBreakdown.length > 0 && (
                  <div className="p-3.5 rounded-xl bg-[#171A24] border border-[#242938] space-y-1.5">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#D6B36A] font-bold block">
                      Positional Factors
                    </span>
                    <ul className="text-xs text-[#9297A5] space-y-1 pl-4 list-disc">
                      {positionExplanation.positionalBreakdown.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {positionExplanation.tacticalOpportunities.length > 0 && (
                  <div className="p-3.5 rounded-xl bg-[#171A24] border border-[#242938] space-y-1.5">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#D6B36A] font-bold block">
                      Tactical Motifs & Vulnerabilities
                    </span>
                    <ul className="text-xs text-[#9297A5] space-y-1 pl-4 list-disc">
                      {positionExplanation.tacticalOpportunities.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="p-3.5 rounded-xl bg-[#1D2230] border border-[#D6B36A]/30 text-xs text-[#F4F4F5] leading-relaxed">
                  <strong className="text-[#D6B36A] block mb-1 font-mono uppercase text-[10px]">
                    Coach Strategic Advice:
                  </strong>
                  {positionExplanation.strategicAdvice}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Dialogue Chat */}
        {activeTab === 'chat' && (
          <div className="space-y-3 flex flex-col h-[340px]">
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {chatMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-4 text-[#9297A5] space-y-2">
                  <MessageSquare className="w-8 h-8 text-[#242938]" />
                  <p className="text-xs">
                    Ask the Grandmaster Coach anything about the current position, plans, or tactical motifs.
                  </p>
                </div>
              ) : (
                chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-3 rounded-xl text-xs leading-relaxed max-w-[90%] ${
                      msg.role === 'user'
                        ? 'ml-auto bg-[#D6B36A] text-[#0B0D14] font-medium'
                        : 'mr-auto bg-[#171A24] text-[#F4F4F5] border border-[#242938]'
                    }`}
                  >
                    {msg.content}
                  </div>
                ))
              )}

              {chatLoading && (
                <div className="mr-auto p-3 rounded-xl bg-[#171A24] border border-[#242938] text-xs text-[#D6B36A] flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Coach is formulating advice...</span>
                </div>
              )}
            </div>

            <form onSubmit={handleSendChat} className="flex gap-2 pt-2 border-t border-[#242938]">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask about this position..."
                disabled={chatLoading}
                className="flex-1 px-3 py-2 rounded-lg bg-[#171A24] border border-[#242938] text-xs text-[#F4F4F5] placeholder-[#9297A5] focus:outline-none focus:border-[#D6B36A]"
              />
              <button
                type="submit"
                disabled={!chatInput.trim() || chatLoading}
                className="px-3.5 py-2 rounded-lg bg-[#D6B36A] hover:bg-[#E8CF96] text-[#0B0D14] text-xs font-bold font-mono transition-all disabled:opacity-50 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
