import React, { useState } from 'react';
import { Search, ArrowLeft, Upload, Copy, Play, Compass, Cpu } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAppStore } from '../../stores/useAppStore';
import { playChessClick } from '../../utils/sound';

export const AnalysisPage: React.FC = () => {
  const { currentProfile } = useAppStore();
  const [fenInput, setFenInput] = useState(
    'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
  );
  const [copied, setCopied] = useState(false);

  const sampleMoves = [
    { num: 1, white: 'e4', black: 'e5', eval: '+0.2' },
    { num: 2, white: 'Nf3', black: 'Nc6', eval: '+0.3' },
    { num: 3, white: 'Bb5', black: 'a6', eval: '+0.3' },
    { num: 4, white: 'Ba4', black: 'Nf6', eval: '+0.2' },
    { num: 5, white: 'O-O', black: 'Be7', eval: '+0.4' },
    { num: 6, white: 'Re1', black: 'b5', eval: '+0.3' },
    { num: 7, white: 'Bb3', black: 'd6', eval: '+0.2' },
  ];

  const handleCopyFen = () => {
    navigator.clipboard.writeText(fenInput);
    setCopied(true);
    playChessClick(currentProfile.settings.soundEnabled, 0.4);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#242938] pb-6">
        <div className="flex items-center gap-3">
          <NavLink
            to="/"
            onClick={() => playChessClick(currentProfile.settings.soundEnabled)}
            className="p-2 rounded-lg text-[#9297A5] hover:text-[#F4F4F5] hover:bg-[#171A24] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </NavLink>
          <div>
            <h2 className="text-2xl font-bold text-[#F4F4F5] font-cinzel">
              Game Analysis & Study Sanctum
            </h2>
            <p className="text-xs text-[#9297A5] mt-0.5">
              Engine calculation room, PGN move logs, and principal variation evaluation.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-[#D6B36A] font-medium uppercase tracking-wider px-3 py-1 rounded-full border border-[#D6B36A]/30 bg-[#D6B36A]/10 font-sans">
            Study Mode
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Move History & FEN controls */}
        <div className="lg:col-span-7 space-y-6">
          {/* FEN Bar */}
          <div className="rounded-xl border border-[#242938] bg-[#171A24] p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#F4F4F5] font-cinzel">Position FEN</span>
              <button
                type="button"
                onClick={handleCopyFen}
                className="text-xs text-[#D6B36A] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copied ? 'Copied' : 'Copy FEN'}</span>
              </button>
            </div>
            <input
              type="text"
              value={fenInput}
              onChange={(e) => setFenInput(e.target.value)}
              className="w-full bg-[#10121B] border border-[#242938] rounded-lg p-2.5 text-xs font-mono text-[#E8CF96] focus:outline-none focus:border-[#D6B36A]"
            />
          </div>

          {/* Move Notation Sheet */}
          <div className="rounded-xl border border-[#242938] bg-[#171A24] p-5 space-y-4">
            <h3 className="text-sm font-bold text-[#F4F4F5] font-cinzel">Move Notation Sheet</h3>

            <div className="divide-y divide-[#242938]/60 text-xs font-mono">
              {sampleMoves.map((m) => (
                <div key={m.num} className="grid grid-cols-12 py-2 hover:bg-[#10121B]/40 px-2 rounded">
                  <span className="col-span-2 text-[#9297A5]">{m.num}.</span>
                  <span className="col-span-4 text-[#F4F4F5] font-semibold">{m.white}</span>
                  <span className="col-span-4 text-[#F4F4F5] font-semibold">{m.black}</span>
                  <span className="col-span-2 text-[#D6B36A] text-right">{m.eval}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Engine Calculation & Evaluation Bar */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-xl border border-[#242938] bg-[#171A24] p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#242938]">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-[#D6B36A]" />
                <h3 className="text-sm font-bold text-[#F4F4F5] font-cinzel">Engine Evaluator</h3>
              </div>
              <span className="text-[11px] font-mono text-[#D6B36A]">Depth 24 / 24</span>
            </div>

            {/* Evaluation Score Display */}
            <div className="p-4 rounded-xl bg-[#10121B] border border-[#242938] text-center space-y-1">
              <span className="text-[10px] text-[#9297A5] uppercase tracking-wider block">
                Position Advantage
              </span>
              <span className="text-2xl font-bold font-mono text-[#F4F4F5]">
                +0.34
              </span>
              <span className="text-[10px] text-[#9297A5] block">
                Slight White Initiative · Equal Material
              </span>
            </div>

            {/* Principal Variations */}
            <div className="space-y-3">
              <span className="text-[11px] uppercase font-bold tracking-wider text-[#9297A5] font-cinzel">
                Top Principal Variations
              </span>

              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-lg bg-[#10121B]/70 border border-[#242938]">
                  <div className="flex justify-between font-mono text-[#D6B36A] text-[11px] mb-1">
                    <span>Line 1 (+0.34)</span>
                    <span>Stockfish WASM</span>
                  </div>
                  <p className="font-mono text-[#F4F4F5] text-[11px] leading-relaxed">
                    1. Re1 b5 2. Bb3 d6 3. c3 O-O 4. h3 Nb8 5. d4 Nbd7
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-[#10121B]/70 border border-[#242938]">
                  <div className="flex justify-between font-mono text-[#9297A5] text-[11px] mb-1">
                    <span>Line 2 (+0.18)</span>
                    <span>Alternative</span>
                  </div>
                  <p className="font-mono text-[#9297A5] text-[11px] leading-relaxed">
                    1. d3 d6 2. c3 g6 3. Nbd2 Bg7 4. Re1 O-O
                  </p>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#10121B] border border-[#242938] text-[11px] text-[#9297A5] leading-relaxed">
              Real-time deep calculation, multi-PV depth adjustments, and live Chessground position
              synchronization activate in <strong>TASK 03 & TASK 08</strong>.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
