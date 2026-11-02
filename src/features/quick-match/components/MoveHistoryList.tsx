/**
 * Move history sheet in standard algebraic notation (SAN).
 * Displays White and Black moves in paired rows with automatic scroll-to-bottom.
 */

import React, { useEffect, useRef } from 'react';
import { ScrollText } from 'lucide-react';
import type { MoveRecordItem } from '../types';

interface MoveHistoryListProps {
  history: MoveRecordItem[];
}

export const MoveHistoryList: React.FC<MoveHistoryListProps> = ({ history }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest move
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [history.length]);

  // Group plies into pairs (moveNumber -> { white, black })
  const pairedMoves: Array<{
    moveNumber: number;
    white?: MoveRecordItem;
    black?: MoveRecordItem;
  }> = [];

  for (let i = 0; i < history.length; i += 2) {
    const white = history[i];
    const black = history[i + 1];
    pairedMoves.push({
      moveNumber: white.moveNumber,
      white,
      black,
    });
  }

  const latestPly = history.length > 0 ? history[history.length - 1].ply : 0;

  return (
    <div className="flex flex-col h-full rounded-xl bg-[#10121B] border border-[#242938] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#242938] bg-[#171A24]/60">
        <div className="flex items-center gap-2">
          <ScrollText className="w-4 h-4 text-[#D6B36A]" />
          <span className="text-xs font-bold uppercase tracking-wider font-cinzel text-[#F4F4F5]">
            Move History
          </span>
        </div>
        <span className="text-[11px] font-mono text-[#9297A5] bg-[#10121B] px-2 py-0.5 rounded border border-[#242938]">
          {history.length} {history.length === 1 ? 'ply' : 'plies'}
        </span>
      </div>

      {/* Move Sheet Body */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto p-2 space-y-0.5 font-mono text-xs scrollbar-thin scrollbar-thumb-[#242938]"
        tabIndex={0}
        aria-label="Algebraic move history"
      >
        {pairedMoves.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-6 text-center text-[#61687B] space-y-2">
            <span className="text-xs">Game has commenced.</span>
            <span className="text-[11px] text-[#9297A5]">White to move the opening piece.</span>
          </div>
        ) : (
          pairedMoves.map((pair) => {
            const isWhiteLatest = pair.white?.ply === latestPly;
            const isBlackLatest = pair.black?.ply === latestPly;

            return (
              <div
                key={pair.moveNumber}
                className="grid grid-cols-[38px_1fr_1fr] items-center px-2 py-1 rounded hover:bg-[#171A24]/70 transition-colors"
              >
                {/* Move Number */}
                <span className="text-[#61687B] font-medium text-[11px]">
                  {pair.moveNumber}.
                </span>

                {/* White Move */}
                <div
                  className={`px-2 py-0.5 rounded text-left truncate transition-colors ${
                    isWhiteLatest
                      ? 'bg-[#D6B36A]/20 text-[#D6B36A] font-bold border border-[#D6B36A]/40'
                      : pair.white
                      ? 'text-[#F4F4F5]'
                      : 'text-transparent'
                  }`}
                >
                  {pair.white ? pair.white.san : '—'}
                </div>

                {/* Black Move */}
                <div
                  className={`px-2 py-0.5 rounded text-left truncate transition-colors ${
                    isBlackLatest
                      ? 'bg-[#D6B36A]/20 text-[#D6B36A] font-bold border border-[#D6B36A]/40'
                      : pair.black
                      ? 'text-[#E4E4E7]'
                      : 'text-transparent'
                  }`}
                >
                  {pair.black ? pair.black.san : '—'}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
