/**
 * Quick Match configuration screen.
 * Allows time control selection (9 presets + custom), engine difficulty tuning (6 tiers),
 * color assignment (White, Random, Black), and match commencement.
 */

import React, { useState } from 'react';
import {
  Zap,
  Flame,
  Clock,
  Hourglass,
  Sliders,
  Shield,
  Cpu,
  Swords,
  Shuffle,
  Circle,
  HelpCircle,
} from 'lucide-react';
import { DIFFICULTY_PRESETS } from '../models/difficulty';
import { QUICK_MATCH_TIME_CONTROLS, validateCustomTimeControl } from '../models/timeControls';
import type { DifficultyLevel, PlayerColorChoice, TimeControlPresetId } from '../types';

interface QuickMatchSetupProps {
  selectedDifficultyLevel: DifficultyLevel;
  onSelectDifficulty: (level: DifficultyLevel) => void;
  selectedTimeControlId: TimeControlPresetId;
  onSelectTimeControl: (id: TimeControlPresetId) => void;
  customMinutes: number;
  onChangeCustomMinutes: (mins: number) => void;
  customIncrement: number;
  onChangeCustomIncrement: (inc: number) => void;
  colorChoice: PlayerColorChoice;
  onSelectColor: (choice: PlayerColorChoice) => void;
  onStartMatch: () => void;
}

export const QuickMatchSetup: React.FC<QuickMatchSetupProps> = ({
  selectedDifficultyLevel,
  onSelectDifficulty,
  selectedTimeControlId,
  onSelectTimeControl,
  customMinutes,
  onChangeCustomMinutes,
  customIncrement,
  onChangeCustomIncrement,
  colorChoice,
  onSelectColor,
  onStartMatch,
}) => {
  const [customError, setCustomError] = useState<string | null>(null);

  const timeControlGroups: Array<{
    category: string;
    icon: React.ComponentType<{ className?: string }>;
    presets: TimeControlPresetId[];
  }> = [
    {
      category: 'Bullet',
      icon: Zap,
      presets: ['BULLET_1_0', 'BULLET_2_1'],
    },
    {
      category: 'Blitz',
      icon: Flame,
      presets: ['BLITZ_3_0', 'BLITZ_3_2', 'BLITZ_5_0', 'BLITZ_5_3'],
    },
    {
      category: 'Rapid',
      icon: Clock,
      presets: ['RAPID_10_0', 'RAPID_15_10'],
    },
    {
      category: 'Classical',
      icon: Hourglass,
      presets: ['CLASSICAL_30_0'],
    },
  ];

  const handleCustomChange = (mins: number, inc: number) => {
    const check = validateCustomTimeControl(mins, inc);
    if (!check.isValid) {
      setCustomError(check.error || 'Invalid time settings');
    } else {
      setCustomError(null);
    }
    onChangeCustomMinutes(mins);
    onChangeCustomIncrement(inc);
  };

  const handleStart = () => {
    if (selectedTimeControlId === 'CUSTOM') {
      const check = validateCustomTimeControl(customMinutes, customIncrement);
      if (!check.isValid) {
        setCustomError(check.error || 'Please specify valid custom minutes and increment');
        return;
      }
    }
    onStartMatch();
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#171A24] border border-[#D6B36A]/30 text-xs font-mono text-[#D6B36A]">
          <Cpu className="w-3.5 h-3.5 text-[#D6B36A]" />
          <span>Local Stockfish WASM Engine</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold font-cinzel text-[#F4F4F5] tracking-tight">
          Quick Match Arena
        </h1>
        <p className="text-sm text-[#9297A5] max-w-lg mx-auto">
          Challenge the Grandmaster-tier engine in authentic rated-tempo clock play.
          Calibrate time controls, tune opponent difficulty, and choose your side.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Time Controls (Col span 2) */}
        <div className="md:col-span-2 space-y-6">
          {/* Section: Time Control */}
          <div className="rounded-2xl border border-[#242938] bg-[#10121B] p-5 sm:p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-[#242938] pb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#D6B36A]" />
                <h3 className="text-sm font-bold font-cinzel uppercase tracking-wider text-[#F4F4F5]">
                  Select Time Control
                </h3>
              </div>
              <span className="text-xs text-[#9297A5] font-mono">
                {selectedTimeControlId === 'CUSTOM'
                  ? `Custom (${customMinutes}m + ${customIncrement}s)`
                  : QUICK_MATCH_TIME_CONTROLS[selectedTimeControlId].label}
              </span>
            </div>

            {/* Presets by Category */}
            <div className="space-y-4">
              {timeControlGroups.map((group) => {
                const CategoryIcon = group.icon;
                return (
                  <div key={group.category} className="space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-mono text-[#9297A5]">
                      <CategoryIcon className="w-3.5 h-3.5 text-[#D6B36A]" />
                      <span>{group.category}</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {group.presets.map((presetId) => {
                        const tc = QUICK_MATCH_TIME_CONTROLS[presetId];
                        const isSelected = selectedTimeControlId === presetId;
                        return (
                          <button
                            key={presetId}
                            type="button"
                            onClick={() => onSelectTimeControl(presetId)}
                            className={`py-2.5 px-3 rounded-xl border text-center transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-[#1D2230] border-[#D6B36A] shadow-md shadow-[#D6B36A]/10 text-[#F4F4F5]'
                                : 'bg-[#171A24]/60 border-[#242938] hover:border-[#384257] text-[#9297A5] hover:text-[#F4F4F5]'
                            }`}
                          >
                            <span className="text-sm font-bold font-mono block">
                              {tc.name}
                            </span>
                            <span className="text-[10px] text-[#61687B] block">
                              {tc.initialMinutes}m {tc.incrementSeconds > 0 ? `+${tc.incrementSeconds}s` : ''}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {/* Custom Time Control Option */}
              <div className="pt-2 border-t border-[#242938]">
                <button
                  type="button"
                  onClick={() => onSelectTimeControl('CUSTOM')}
                  className={`w-full py-2.5 px-4 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                    selectedTimeControlId === 'CUSTOM'
                      ? 'bg-[#1D2230] border-[#D6B36A] text-[#F4F4F5]'
                      : 'bg-[#171A24]/60 border-[#242938] hover:border-[#384257] text-[#9297A5]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-[#D6B36A]" />
                    <span className="text-xs font-bold font-mono">Custom Clock Settings</span>
                  </div>
                  <span className="text-[11px] font-mono text-[#D6B36A]">
                    {customMinutes}m + {customIncrement}s
                  </span>
                </button>

                {selectedTimeControlId === 'CUSTOM' && (
                  <div className="mt-3 p-4 rounded-xl bg-[#171A24] border border-[#242938] grid grid-cols-2 gap-4 animate-fadeIn">
                    <div>
                      <label className="text-[11px] font-mono uppercase tracking-wider text-[#9297A5] block mb-1">
                        Minutes per Player
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={180}
                        value={customMinutes}
                        onChange={(e) =>
                          handleCustomChange(parseInt(e.target.value, 10) || 1, customIncrement)
                        }
                        className="w-full px-3 py-2 rounded-lg bg-[#10121B] border border-[#242938] text-sm font-mono text-[#F4F4F5] focus:outline-none focus:border-[#D6B36A]"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-mono uppercase tracking-wider text-[#9297A5] block mb-1">
                        Increment (Seconds)
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={60}
                        value={customIncrement}
                        onChange={(e) =>
                          handleCustomChange(customMinutes, parseInt(e.target.value, 10) || 0)
                        }
                        className="w-full px-3 py-2 rounded-lg bg-[#10121B] border border-[#242938] text-sm font-mono text-[#F4F4F5] focus:outline-none focus:border-[#D6B36A]"
                      />
                    </div>
                    {customError && (
                      <p className="col-span-2 text-xs text-red-400 font-mono">
                        {customError}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section: Engine Difficulty Selection */}
          <div className="rounded-2xl border border-[#242938] bg-[#10121B] p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#242938] pb-3">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#D6B36A]" />
                <h3 className="text-sm font-bold font-cinzel uppercase tracking-wider text-[#F4F4F5]">
                  Engine Difficulty Calibration
                </h3>
              </div>
              <span className="text-xs text-[#9297A5] font-mono">
                Skill Level: {DIFFICULTY_PRESETS[selectedDifficultyLevel].skillLevel} / 20
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(Object.keys(DIFFICULTY_PRESETS) as DifficultyLevel[]).map((level) => {
                const diff = DIFFICULTY_PRESETS[level];
                const isSelected = selectedDifficultyLevel === level;
                return (
                  <button
                    key={level}
                    type="button"
                    onClick={() => onSelectDifficulty(level)}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#1D2230] border-[#D6B36A] shadow-md shadow-[#D6B36A]/10'
                        : 'bg-[#171A24]/60 border-[#242938] hover:border-[#384257]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-bold font-cinzel text-[#F4F4F5]">
                        {diff.name}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#10121B] border border-[#242938] text-[#D6B36A]">
                        Level {diff.skillLevel}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#9297A5] leading-relaxed line-clamp-2">
                      {diff.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Side Selection & Launch Match */}
        <div className="space-y-6">
          {/* Side Choice Card */}
          <div className="rounded-2xl border border-[#242938] bg-[#10121B] p-5 sm:p-6 space-y-4">
            <div className="border-b border-[#242938] pb-3">
              <h3 className="text-sm font-bold font-cinzel uppercase tracking-wider text-[#F4F4F5]">
                Side Preference
              </h3>
              <p className="text-[11px] text-[#9297A5] mt-0.5">
                Choose to move first or let fate decide
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => onSelectColor('white')}
                className={`py-3 px-2 rounded-xl border flex flex-col items-center text-center transition-all cursor-pointer ${
                  colorChoice === 'white'
                    ? 'bg-[#1D2230] border-[#D6B36A] text-[#F4F4F5]'
                    : 'bg-[#171A24]/60 border-[#242938] hover:border-[#384257] text-[#9297A5]'
                }`}
              >
                <div className="w-7 h-7 rounded-full bg-white border border-[#242938] shadow-sm mb-2" />
                <span className="text-xs font-bold font-cinzel">White</span>
                <span className="text-[10px] text-[#61687B]">Plays 1st</span>
              </button>

              <button
                type="button"
                onClick={() => onSelectColor('random')}
                className={`py-3 px-2 rounded-xl border flex flex-col items-center text-center transition-all cursor-pointer ${
                  colorChoice === 'random'
                    ? 'bg-[#1D2230] border-[#D6B36A] text-[#F4F4F5]'
                    : 'bg-[#171A24]/60 border-[#242938] hover:border-[#384257] text-[#9297A5]'
                }`}
              >
                <div className="w-7 h-7 rounded-full bg-[#171A24] border border-[#D6B36A] flex items-center justify-center text-[#D6B36A] mb-2">
                  <Shuffle className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold font-cinzel">Random</span>
                <span className="text-[10px] text-[#61687B]">50 / 50</span>
              </button>

              <button
                type="button"
                onClick={() => onSelectColor('black')}
                className={`py-3 px-2 rounded-xl border flex flex-col items-center text-center transition-all cursor-pointer ${
                  colorChoice === 'black'
                    ? 'bg-[#1D2230] border-[#D6B36A] text-[#F4F4F5]'
                    : 'bg-[#171A24]/60 border-[#242938] hover:border-[#384257] text-[#9297A5]'
                }`}
              >
                <div className="w-7 h-7 rounded-full bg-[#0B0D14] border border-[#242938] shadow-sm mb-2 ring-1 ring-white/20" />
                <span className="text-xs font-bold font-cinzel">Black</span>
                <span className="text-[10px] text-[#61687B]">Defends</span>
              </button>
            </div>
          </div>

          {/* Match Summary Preview & Commencement Button */}
          <div className="rounded-2xl border border-[#D6B36A]/30 bg-radial from-[#1A1D27] to-[#10121B] p-5 sm:p-6 space-y-5 shadow-xl shadow-black/80">
            <div className="space-y-1">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#D6B36A]">
                Duel Overview
              </span>
              <h4 className="text-lg font-bold font-cinzel text-[#F4F4F5]">
                Ready for Battle
              </h4>
            </div>

            <div className="space-y-2.5 text-xs font-mono border-y border-[#242938] py-3.5 text-[#9297A5]">
              <div className="flex justify-between items-center">
                <span>Opponent</span>
                <span className="text-[#F4F4F5] font-semibold">
                  {DIFFICULTY_PRESETS[selectedDifficultyLevel].name}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Time Control</span>
                <span className="text-[#D6B36A] font-semibold">
                  {selectedTimeControlId === 'CUSTOM'
                    ? `${customMinutes}m + ${customIncrement}s`
                    : QUICK_MATCH_TIME_CONTROLS[selectedTimeControlId].label}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Your Pieces</span>
                <span className="text-[#F4F4F5] font-semibold capitalize">
                  {colorChoice}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleStart}
              className="w-full py-4 px-6 rounded-xl bg-[#D6B36A] hover:bg-[#E8CF96] text-[#0B0D14] font-bold text-xs uppercase tracking-widest transition-all shadow-xl shadow-[#D6B36A]/20 active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2 group"
            >
              <Swords className="w-4 h-4 stroke-[2.2] group-hover:rotate-12 transition-transform" />
              <span>Commence Match</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
