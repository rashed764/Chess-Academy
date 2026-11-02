/**
 * Game results presentation modal.
 * Displays match outcome, termination reason, move statistics, and navigation actions.
 */

import React from 'react';
import { Trophy, Flag, AlertCircle, RefreshCw, Compass, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { CompletedMatchSummary } from '../types';

interface GameResultModalProps {
  summary: CompletedMatchSummary | null;
  onPlayAgain: () => void;
  onReturnToSetup: () => void;
}

export const GameResultModal: React.FC<GameResultModalProps> = ({
  summary,
  onPlayAgain,
  onReturnToSetup,
}) => {
  const navigate = useNavigate();

  if (!summary) return null;

  const isWin = summary.playerWon;
  const isLoss = summary.playerLost;
  const isDraw = summary.isDraw;

  const headline = isWin ? 'Victory Achieved' : isLoss ? 'Defeat' : 'Drawn Match';
  const subtitle = isWin
    ? 'Outstanding positional execution and strategic victory.'
    : isLoss
    ? 'Stockfish found the decisive breakthrough. Study the critical moments.'
    : 'Honorable peace agreed upon or forced by chess law.';

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-lg rounded-2xl border border-[#D6B36A]/50 bg-[#171A24] p-6 sm:p-8 shadow-2xl shadow-black/90 space-y-6">
        {/* Banner */}
        <div className="text-center space-y-2 pb-4 border-b border-[#242938]">
          <div
            className={`mx-auto w-14 h-14 rounded-2xl flex items-center justify-center border shadow-lg ${
              isWin
                ? 'bg-[#D6B36A]/15 border-[#D6B36A] text-[#D6B36A] shadow-[#D6B36A]/20'
                : isLoss
                ? 'bg-red-500/15 border-red-500 text-red-400 shadow-red-500/20'
                : 'bg-blue-500/15 border-blue-500 text-blue-400 shadow-blue-500/20'
            }`}
          >
            {isWin ? (
              <Trophy className="w-7 h-7 stroke-[1.75]" />
            ) : isLoss ? (
              <Flag className="w-7 h-7 stroke-[1.75]" />
            ) : (
              <AlertCircle className="w-7 h-7 stroke-[1.75]" />
            )}
          </div>

          <div className="inline-block px-3 py-0.5 rounded-full text-[11px] font-mono uppercase tracking-wider bg-[#10121B] border border-[#242938] text-[#9297A5]">
            Result: {summary.result}
          </div>

          <h3 className="text-2xl font-bold font-cinzel text-[#F4F4F5]">
            {headline}
          </h3>
          <p className="text-xs text-[#9297A5] max-w-sm mx-auto">
            {summary.terminationDescription || subtitle}
          </p>
        </div>

        {/* Match Statistics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-3 rounded-xl bg-[#10121B] border border-[#242938]">
            <span className="text-[10px] text-[#9297A5] uppercase tracking-wider block">Total Moves</span>
            <span className="text-base font-bold font-mono text-[#F4F4F5] mt-0.5 block">
              {summary.totalMoves}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#10121B] border border-[#242938]">
            <span className="text-[10px] text-[#9297A5] uppercase tracking-wider block">Duration</span>
            <span className="text-base font-bold font-mono text-[#F4F4F5] mt-0.5 block">
              {formatDuration(summary.totalDurationSeconds)}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#10121B] border border-[#242938]">
            <span className="text-[10px] text-[#9297A5] uppercase tracking-wider block">Time Control</span>
            <span className="text-xs font-bold font-mono text-[#D6B36A] mt-1 block truncate">
              {summary.timeControl.name}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#10121B] border border-[#242938]">
            <span className="text-[10px] text-[#9297A5] uppercase tracking-wider block">Opponent</span>
            <span className="text-xs font-bold font-cinzel text-[#F4F4F5] mt-1 block truncate">
              {summary.difficulty.name}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-2">
          <button
            type="button"
            onClick={onPlayAgain}
            className="w-full py-3.5 px-4 rounded-xl bg-[#D6B36A] hover:bg-[#E8CF96] text-[#0B0D14] font-bold text-xs tracking-wider uppercase transition-all shadow-lg shadow-[#D6B36A]/15 active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Play Again</span>
          </button>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => navigate('/analysis')}
              className="py-3 px-4 rounded-xl border border-[#242938] bg-[#10121B] hover:bg-[#1D2230] text-xs font-semibold text-[#F4F4F5] transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Compass className="w-4 h-4 text-[#D6B36A]" />
              <span>Study in Sanctum</span>
            </button>

            <button
              type="button"
              onClick={onReturnToSetup}
              className="py-3 px-4 rounded-xl border border-[#242938] bg-[#10121B] hover:bg-[#1D2230] text-xs font-semibold text-[#9297A5] hover:text-[#F4F4F5] transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Match Setup</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
