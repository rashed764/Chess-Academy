import React, { useState } from 'react';
import { Trophy, ArrowLeft, Target, Activity, ShieldCheck, AlertTriangle, ArrowRight } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAppStore } from '../../stores/useAppStore';
import { playChessClick, playChime } from '../../utils/sound';

export const TestArenaPage: React.FC = () => {
  const { currentProfile } = useAppStore();
  const [selectedFormat, setSelectedFormat] = useState('rapid_diagnostic');
  const [notice, setNotice] = useState<string | null>(null);

  const handleLaunch = () => {
    playChime(currentProfile.settings.soundEnabled, 0.6);
    setNotice(
      'Diagnostic test arena protocol initialized. Objective assessment games and accuracy analytics launch in TASK 07.'
    );
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
              Test Arena
            </h2>
            <p className="text-xs text-[#9297A5] mt-0.5">
              Unbiased diagnostic performance assessment environment.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-[#D6B36A] font-medium uppercase tracking-wider px-3 py-1 rounded-full border border-[#D6B36A]/30 bg-[#D6B36A]/10 font-sans">
            Formal Assessment
          </span>
        </div>
      </div>

      {/* Arena Assessment Modes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div
          onClick={() => {
            playChessClick(currentProfile.settings.soundEnabled, 0.5);
            setSelectedFormat('rapid_diagnostic');
          }}
          className={`p-6 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
            selectedFormat === 'rapid_diagnostic'
              ? 'border-[#D6B36A] bg-[#171A24] shadow-lg shadow-[#D6B36A]/10'
              : 'border-[#242938] bg-[#10121B]/60 hover:bg-[#171A24]'
          }`}
        >
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-lg bg-[#1D2230] text-[#D6B36A] flex items-center justify-center border border-[#242938]">
              <Target className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#F4F4F5] font-cinzel">
              Single-Match Diagnostic
            </h3>
            <p className="text-xs text-[#9297A5] leading-relaxed">
              One 15+10 classical game against an unrevealed engine tier. Evaluates calculation depth and tactical resilience.
            </p>
          </div>
          <span className="text-[11px] font-mono text-[#D6B36A] pt-4 block">
            Format: 15 min + 10s increment
          </span>
        </div>

        <div
          onClick={() => {
            playChessClick(currentProfile.settings.soundEnabled, 0.5);
            setSelectedFormat('five_match_battery');
          }}
          className={`p-6 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
            selectedFormat === 'five_match_battery'
              ? 'border-[#D6B36A] bg-[#171A24] shadow-lg shadow-[#D6B36A]/10'
              : 'border-[#242938] bg-[#10121B]/60 hover:bg-[#171A24]'
          }`}
        >
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-lg bg-[#1D2230] text-[#D6B36A] flex items-center justify-center border border-[#242938]">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#F4F4F5] font-cinzel">
              5-Game Mastery Battery
            </h3>
            <p className="text-xs text-[#9297A5] leading-relaxed">
              Standardized five-game series measuring opening repertoire stability, middlegame transition, and endgame conversion.
            </p>
          </div>
          <span className="text-[11px] font-mono text-[#D6B36A] pt-4 block">
            Format: 5 Matches (Rapid 10+0)
          </span>
        </div>

        <div
          onClick={() => {
            playChessClick(currentProfile.settings.soundEnabled, 0.5);
            setSelectedFormat('tactical_stress');
          }}
          className={`p-6 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
            selectedFormat === 'tactical_stress'
              ? 'border-[#D6B36A] bg-[#171A24] shadow-lg shadow-[#D6B36A]/10'
              : 'border-[#242938] bg-[#10121B]/60 hover:bg-[#171A24]'
          }`}
        >
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-lg bg-[#1D2230] text-[#D6B36A] flex items-center justify-center border border-[#242938]">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#F4F4F5] font-cinzel">
              Tactical Stress Arena
            </h3>
            <p className="text-xs text-[#9297A5] leading-relaxed">
              Critical, complex double-edged positions. Tests accurate defensive calculation under severe time and spatial pressure.
            </p>
          </div>
          <span className="text-[11px] font-mono text-[#D6B36A] pt-4 block">
            Format: 10 Critical Positions
          </span>
        </div>
      </div>

      {/* Protocol Guarantee Box */}
      <div className="rounded-xl border border-[#242938] bg-[#171A24] p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#242938]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#D6B36A]/15 text-[#E8CF96] flex items-center justify-center border border-[#D6B36A]/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#F4F4F5] font-cinzel">
                Standardized Evaluation Protocol
              </h4>
              <p className="text-xs text-[#9297A5]">
                Zero assistance, zero evaluation bar leaks, 100% objective FIDE performance estimation.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLaunch}
            className="px-6 py-3 rounded-lg bg-[#D6B36A] hover:bg-[#E8CF96] text-[#0B0D14] text-xs font-bold tracking-wide transition-all shadow-md shadow-[#D6B36A]/10 cursor-pointer flex items-center justify-center gap-2 shrink-0 active:scale-[0.98]"
          >
            <Trophy className="w-4 h-4" />
            <span>Begin Assessment</span>
          </button>
        </div>

        {notice && (
          <div className="p-4 rounded-lg bg-[#10121B] border border-[#D6B36A]/40 text-xs text-[#F4F4F5] animate-fadeIn">
            {notice}
          </div>
        )}
      </div>
    </div>
  );
};
