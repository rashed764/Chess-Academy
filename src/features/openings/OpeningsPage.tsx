import React, { useState } from 'react';
import { BookOpen, ArrowLeft, Search, Bookmark, ChevronRight } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAppStore } from '../../stores/useAppStore';
import { playChessClick } from '../../utils/sound';

interface OpeningItem {
  eco: string;
  name: string;
  moves: string;
  category: string;
  description: string;
  grandmasters: string;
  whiteWinRate: number;
  blackWinRate: number;
  drawRate: number;
}

const CLASSICAL_OPENINGS: OpeningItem[] = [
  {
    eco: 'B90',
    name: 'Sicilian Defense: Najdorf Variation',
    moves: '1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 a6',
    category: 'Semi-Open Games (B)',
    description: 'The sharpest, most thoroughly analyzed opening in chess history. Black fights for dynamic counter-initiatives on the queenside.',
    grandmasters: 'Garry Kasparov, Bobby Fischer, Maxime Vachier-Lagrave',
    whiteWinRate: 38,
    drawRate: 34,
    blackWinRate: 28,
  },
  {
    eco: 'C65',
    name: 'Ruy Lopez: Berlin Defense',
    moves: '1. e4 e5 2. Nf3 Nc6 3. Bb5 Nf6',
    category: 'Open Games (C)',
    description: 'The legendary "Berlin Wall". Kramnik used it to dethrone Kasparov in 2000. Leads to profound queenless endgame structures.',
    grandmasters: 'Vladimir Kramnik, Magnus Carlsen, Fabiano Caruana',
    whiteWinRate: 31,
    drawRate: 53,
    blackWinRate: 16,
  },
  {
    eco: 'D37',
    name: "Queen's Gambit Declined: Classical 5.Bf4",
    moves: '1. d4 d5 2. c4 e6 3. Nc3 Nf6 4. Nf3 Be7 5. Bf4',
    category: 'Closed Games (D)',
    description: 'The foundational pillar of world championship chess. White maintains central pressure; Black seeks solid harmonious development.',
    grandmasters: 'Anatoly Karpov, Ding Liren, Viswanathan Anand',
    whiteWinRate: 40,
    drawRate: 42,
    blackWinRate: 18,
  },
  {
    eco: 'E60',
    name: "King's Indian Defense: Classical System",
    moves: '1. d4 Nf6 2. c4 g6 3. Nc3 Bg7 4. e4 d6 5. Nf3 O-O',
    category: 'Indian Defenses (E)',
    description: 'Hypermodern masterpiece. Black concedes the center early to mount devastating kingside pawn storms against White.',
    grandmasters: 'Garry Kasparov, Hikaru Nakamura, Judit Polgar',
    whiteWinRate: 42,
    drawRate: 30,
    blackWinRate: 28,
  },
  {
    eco: 'B12',
    name: 'Caro-Kann Defense: Advance Variation',
    moves: '1. e4 c6 2. d4 d5 3. e5 Bf5',
    category: 'Semi-Open Games (B)',
    description: 'Solid and resilient. Black develops the light-squared bishop outside the pawn chain before locking the center.',
    grandmasters: 'Mikhail Botvinnik, Alireza Firouzja, Anatoly Karpov',
    whiteWinRate: 37,
    drawRate: 37,
    blackWinRate: 26,
  },
];

export const OpeningsPage: React.FC = () => {
  const { currentProfile } = useAppStore();
  const [selectedEco, setSelectedEco] = useState('B90');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOpenings = CLASSICAL_OPENINGS.filter(
    (op) =>
      op.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      op.eco.toLowerCase().includes(searchQuery.toLowerCase()) ||
      op.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedOpening =
    CLASSICAL_OPENINGS.find((op) => op.eco === selectedEco) || CLASSICAL_OPENINGS[0];

  const handleSelectOpening = (eco: string) => {
    playChessClick(currentProfile.settings.soundEnabled, 0.5);
    setSelectedEco(eco);
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
              Opening Reference Library
            </h2>
            <p className="text-xs text-[#9297A5] mt-0.5">
              The grandmaster encyclopedia of classical repertoires, ECO codes, and move orders.
            </p>
          </div>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-[#9297A5] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search ECO or opening..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#171A24] border border-[#242938] rounded-lg pl-9 pr-3 py-1.5 text-xs text-[#F4F4F5] placeholder-[#9297A5] focus:outline-none focus:border-[#D6B36A]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left List of Openings */}
        <div className="lg:col-span-5 space-y-2.5">
          {filteredOpenings.map((op) => {
            const isSelected = op.eco === selectedEco;
            return (
              <div
                key={op.eco}
                onClick={() => handleSelectOpening(op.eco)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-[#D6B36A] bg-[#171A24] shadow-md shadow-[#D6B36A]/10'
                    : 'border-[#242938] bg-[#10121B]/60 hover:bg-[#171A24] hover:border-[#2E3547]'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-mono font-bold text-[#D6B36A]">
                    {op.eco}
                  </span>
                  <span className="text-[10px] text-[#9297A5]">
                    {op.category.split(' ')[0]}
                  </span>
                </div>
                <h4 className="text-sm font-semibold text-[#F4F4F5] line-clamp-1 font-cinzel">
                  {op.name}
                </h4>
                <p className="text-[11px] font-mono text-[#9297A5] truncate mt-1">
                  {op.moves}
                </p>
              </div>
            );
          })}
        </div>

        {/* Right Detail Pane */}
        <div className="lg:col-span-7">
          <div className="rounded-xl border border-[#242938] bg-[#171A24] p-6 space-y-6 sticky top-24">
            <div className="border-b border-[#242938] pb-5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-[#D6B36A] bg-[#1D2230] px-2.5 py-1 rounded border border-[#242938]">
                  ECO {selectedOpening.eco}
                </span>
                <span className="text-xs text-[#9297A5]">{selectedOpening.category}</span>
              </div>
              <h3 className="text-xl font-bold text-[#F4F4F5] font-cinzel">
                {selectedOpening.name}
              </h3>
            </div>

            {/* Move Order */}
            <div className="space-y-1.5">
              <span className="text-[11px] uppercase font-bold tracking-wider text-[#9297A5] font-cinzel">
                Standard Line Notation
              </span>
              <div className="p-3 rounded-lg bg-[#10121B] border border-[#242938] font-mono text-sm text-[#E8CF96] tracking-wide select-all">
                {selectedOpening.moves}
              </div>
            </div>

            {/* Strategic Summary */}
            <div className="space-y-1.5">
              <span className="text-[11px] uppercase font-bold tracking-wider text-[#9297A5] font-cinzel">
                Strategic Foundation
              </span>
              <p className="text-xs text-[#9297A5] leading-relaxed">
                {selectedOpening.description}
              </p>
            </div>

            {/* Grandmasters */}
            <div className="space-y-1.5">
              <span className="text-[11px] uppercase font-bold tracking-wider text-[#9297A5] font-cinzel">
                Historic Champions & Practitioners
              </span>
              <p className="text-xs font-medium text-[#F4F4F5]">
                {selectedOpening.grandmasters}
              </p>
            </div>

            {/* Master Win Rates */}
            <div className="space-y-2 pt-2 border-t border-[#242938]">
              <span className="text-[11px] uppercase font-bold tracking-wider text-[#9297A5] font-cinzel">
                Master Database Win Distribution
              </span>
              <div className="w-full h-3 rounded-full bg-[#10121B] overflow-hidden flex">
                <div
                  style={{ width: `${selectedOpening.whiteWinRate}%` }}
                  className="h-full bg-slate-200"
                  title={`White Wins: ${selectedOpening.whiteWinRate}%`}
                />
                <div
                  style={{ width: `${selectedOpening.drawRate}%` }}
                  className="h-full bg-[#D6B36A]"
                  title={`Draw: ${selectedOpening.drawRate}%`}
                />
                <div
                  style={{ width: `${selectedOpening.blackWinRate}%` }}
                  className="h-full bg-slate-800"
                  title={`Black Wins: ${selectedOpening.blackWinRate}%`}
                />
              </div>
              <div className="flex justify-between text-[10px] font-mono text-[#9297A5]">
                <span>White {selectedOpening.whiteWinRate}%</span>
                <span>Draw {selectedOpening.drawRate}%</span>
                <span>Black {selectedOpening.blackWinRate}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
