/**
 * Player identity and real-time chess clock card.
 * Highlights active turn with pulsing gold/emerald luminescence,
 * shows tenths under 10 seconds, and indicates engine thinking status.
 */

import React from 'react';
import { User, Cpu, AlertCircle, Clock } from 'lucide-react';
import { formatClockDisplay } from '../models/clock';

interface PlayerClockCardProps {
  name: string;
  subtitle: string;
  color: 'w' | 'b';
  remainingMs: number;
  isActive: boolean;
  isThinking?: boolean;
  isCheck?: boolean;
  isOpponent?: boolean;
}

export const PlayerClockCard: React.FC<PlayerClockCardProps> = ({
  name,
  subtitle,
  color,
  remainingMs,
  isActive,
  isThinking = false,
  isCheck = false,
  isOpponent = false,
}) => {
  const isLowTime = remainingMs < 30000 && remainingMs > 0;
  const isCriticalTime = remainingMs < 10000 && remainingMs > 0;
  const isFlagged = remainingMs <= 0;

  return (
    <div
      className={`flex items-center justify-between p-3 sm:p-4 rounded-xl transition-all duration-300 border ${
        isActive
          ? 'bg-[#171A24] border-[#D6B36A] shadow-lg shadow-[#D6B36A]/10 ring-1 ring-[#D6B36A]/40'
          : 'bg-[#10121B] border-[#242938] hover:border-[#2D3345]'
      }`}
    >
      {/* Player Identity */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="relative shrink-0">
          <div
            className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center border transition-all ${
              isOpponent
                ? 'bg-[#131722] border-[#2E364A] text-[#9297A5]'
                : 'bg-[#1D2230] border-[#D6B36A]/40 text-[#D6B36A]'
            }`}
          >
            {isOpponent ? (
              <Cpu className="w-5 h-5 stroke-[1.75]" />
            ) : (
              <User className="w-5 h-5 stroke-[1.75]" />
            )}
          </div>

          {/* Color Indicator Dot */}
          <div
            className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-[#10121B] shadow-sm flex items-center justify-center ${
              color === 'w' ? 'bg-[#F4F4F5]' : 'bg-[#171A24] ring-1 ring-white/30'
            }`}
            title={color === 'w' ? 'Playing White' : 'Playing Black'}
          >
            <div
              className={`w-1.5 h-1.5 rounded-full ${
                color === 'w' ? 'bg-[#10121B]' : 'bg-[#F4F4F5]'
              }`}
            />
          </div>
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-[#F4F4F5] truncate font-cinzel">
              {name}
            </h4>
            {isCheck && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-red-500/20 border border-red-500/40 text-red-400 animate-pulse">
                <AlertCircle className="w-3 h-3" />
                CHECK
              </span>
            )}
            {isThinking && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono text-[#D6B36A] bg-[#D6B36A]/10 border border-[#D6B36A]/30 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D6B36A] animate-ping" />
                THINKING
              </span>
            )}
          </div>
          <p className="text-xs text-[#9297A5] truncate font-mono">{subtitle}</p>
        </div>
      </div>

      {/* Clock Timer Display */}
      <div className="flex items-center gap-2 shrink-0 pl-3">
        <div
          className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-mono text-base sm:text-lg font-bold tracking-wider transition-all border ${
            isFlagged
              ? 'bg-red-950/40 text-red-400 border-red-500/40'
              : isCriticalTime
              ? 'bg-red-500/15 text-red-400 border-red-500/50 animate-pulse ring-1 ring-red-500/30'
              : isLowTime
              ? 'bg-amber-500/15 text-amber-300 border-amber-500/40'
              : isActive
              ? 'bg-[#1D2230] text-[#D6B36A] border-[#D6B36A]/50 shadow-inner'
              : 'bg-[#131622] text-[#9297A5] border-[#242938]'
          }`}
        >
          <Clock
            className={`w-4 h-4 shrink-0 ${
              isActive ? 'text-[#D6B36A] animate-pulse' : 'text-[#61687B]'
            }`}
          />
          <span className="tabular-nums">{formatClockDisplay(remainingMs)}</span>
        </div>
      </div>
    </div>
  );
};
