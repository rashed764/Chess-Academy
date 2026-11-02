import React, { useState } from 'react';
import { Swords, Clock, Cpu, Zap, ArrowLeft, Shield, AlertCircle } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { STANDARD_TIME_CONTROLS } from '../../constants/chess';
import { useAppStore } from '../../stores/useAppStore';
import { playChessClick, playChime } from '../../utils/sound';

export const QuickMatchPage: React.FC = () => {
  const { currentProfile } = useAppStore();
  const [selectedTimeControl, setSelectedTimeControl] = useState('RAPID_10_0');
  const [engineSkillLevel, setEngineSkillLevel] = useState(10); // 1-20
  const [playerColor, setPlayerColor] = useState<'white' | 'random' | 'black'>('white');
  const [showConfigNotice, setShowConfigNotice] = useState(false);

  const handleSelectTime = (key: string) => {
    playChessClick(currentProfile.settings.soundEnabled, 0.6);
    setSelectedTimeControl(key);
  };

  const handleSelectColor = (color: 'white' | 'random' | 'black') => {
    playChessClick(currentProfile.settings.soundEnabled, 0.6);
    setPlayerColor(color);
  };

  const handleLaunchDuel = () => {
    playChime(currentProfile.settings.soundEnabled, 0.6);
    setShowConfigNotice(true);
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
              Quick Match Arena
            </h2>
            <p className="text-xs text-[#9297A5] mt-0.5">
              Unassisted grandmaster engine duel. Configure time controls and challenge Stockfish.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-[#D6B36A] font-medium uppercase tracking-wider px-3 py-1 rounded-full border border-[#D6B36A]/30 bg-[#D6B36A]/10 font-sans">
            Competitive Duel
          </span>
        </div>
      </div>

      {/* Duel Configuration Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Time Controls & Engine Level */}
        <div className="lg:col-span-8 space-y-6">
          {/* Time Controls */}
          <div className="rounded-xl border border-[#242938] bg-[#171A24] p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#D6B36A]" />
              <h3 className="text-sm font-bold text-[#F4F4F5] font-cinzel">
                Select Time Discipline
              </h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Object.entries(STANDARD_TIME_CONTROLS).map(([key, tc]) => {
                const isSelected = selectedTimeControl === key;
                const minutes = Math.floor(tc.initialSeconds / 60);

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleSelectTime(key)}
                    className={`flex flex-col items-center justify-center p-3.5 rounded-lg border text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#D6B36A] bg-[#1D2230] shadow-md shadow-[#D6B36A]/10'
                        : 'border-[#242938] bg-[#10121B]/60 hover:bg-[#171A24] hover:border-[#2E3547]'
                    }`}
                  >
                    <span className="text-base font-bold text-[#F4F4F5] font-mono">
                      {minutes}+{tc.incrementSeconds}
                    </span>
                    <span className="text-[11px] text-[#9297A5] uppercase tracking-wider mt-0.5">
                      {tc.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Engine Difficulty Calibration */}
          <div className="rounded-xl border border-[#242938] bg-[#171A24] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-[#D6B36A]" />
                <h3 className="text-sm font-bold text-[#F4F4F5] font-cinzel">
                  Engine Strength Calibration
                </h3>
              </div>
              <span className="text-xs font-mono font-semibold text-[#D6B36A] bg-[#1D2230] px-2.5 py-1 rounded border border-[#242938]">
                Level {engineSkillLevel} · ~{800 + engineSkillLevel * 100} ELO
              </span>
            </div>

            <div className="space-y-2">
              <input
                type="range"
                min="1"
                max="20"
                value={engineSkillLevel}
                onChange={(e) => setEngineSkillLevel(Number(e.target.value))}
                className="w-full accent-[#D6B36A] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#9297A5] font-mono">
                <span>Lvl 1 (800 Club Novice)</span>
                <span>Lvl 10 (1800 Club Master)</span>
                <span>Lvl 20 (2800 Super GM)</span>
              </div>
            </div>
          </div>

          {/* Side Preference */}
          <div className="rounded-xl border border-[#242938] bg-[#171A24] p-6 space-y-4">
            <h3 className="text-sm font-bold text-[#F4F4F5] font-cinzel">Piece Color</h3>

            <div className="grid grid-cols-3 gap-3">
              {(['white', 'random', 'black'] as const).map((color) => {
                const isSelected = playerColor === color;
                return (
                  <button
                    key={color}
                    type="button"
                    onClick={() => handleSelectColor(color)}
                    className={`py-3 px-4 rounded-lg border text-xs font-semibold capitalize tracking-wide transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#D6B36A] bg-[#1D2230] text-[#D6B36A] shadow-xs'
                        : 'border-[#242938] bg-[#10121B]/60 text-[#9297A5] hover:text-[#F4F4F5]'
                    }`}
                  >
                    {color === 'random' ? 'Random Color' : `${color} Pieces`}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Match Preview & Launch Action */}
        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-xl border border-[#242938] bg-[#171A24] p-6 space-y-5">
            <h3 className="text-sm font-bold text-[#F4F4F5] font-cinzel pb-3 border-b border-[#242938]">
              Match Protocol
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-[#242938]/40">
                <span className="text-[#9297A5]">Opponent</span>
                <span className="font-semibold text-[#F4F4F5]">Stockfish 16 WASM</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#242938]/40">
                <span className="text-[#9297A5]">Skill Target</span>
                <span className="font-mono text-[#D6B36A]">
                  {800 + engineSkillLevel * 100} ELO
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#242938]/40">
                <span className="text-[#9297A5]">Time Limit</span>
                <span className="font-mono text-[#F4F4F5]">
                  {STANDARD_TIME_CONTROLS[selectedTimeControl]?.name.toUpperCase()} (
                  {Math.floor(
                    (STANDARD_TIME_CONTROLS[selectedTimeControl]?.initialSeconds || 600) / 60
                  )}
                  m)
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#242938]/40">
                <span className="text-[#9297A5]">Assistance Mode</span>
                <span className="text-[#F4F4F5]">Unassisted Tournament</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLaunchDuel}
              className="w-full py-3.5 px-4 rounded-lg bg-[#D6B36A] hover:bg-[#E8CF96] text-[#0B0D14] font-bold text-sm tracking-wide transition-all shadow-lg shadow-[#D6B36A]/15 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
            >
              <Swords className="w-4 h-4" />
              <span>Launch Match</span>
            </button>

            {showConfigNotice && (
              <div className="p-3.5 rounded-lg bg-[#10121B] border border-[#D6B36A]/40 text-xs text-[#9297A5] space-y-1 animate-fadeIn">
                <div className="flex items-center gap-1.5 text-[#D6B36A] font-semibold">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Engine Setup Verified</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Configuration accepted. Interactive Chessground board and live Stockfish WASM worker
                  gameplay will launch in <strong>TASK 03 & TASK 04</strong>.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
