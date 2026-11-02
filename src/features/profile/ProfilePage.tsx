import React from 'react';
import { Calendar, ArrowLeft, Trophy, Crown, Shield, Award } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAppStore } from '../../stores/useAppStore';
import { formatRelativeDate } from '../../utils/formatters';
import { playChessClick } from '../../utils/sound';

export const ProfilePage: React.FC = () => {
  const { currentProfile } = useAppStore();

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#242938] pb-6">
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
              Member Credentials
            </h2>
            <p className="text-xs text-[#9297A5] mt-0.5">
              Academy candidate profile, title trajectory, and club standing.
            </p>
          </div>
        </div>

        <span className="text-xs text-[#D6B36A] font-semibold uppercase tracking-wider px-3 py-1 rounded-full border border-[#D6B36A]/30 bg-[#D6B36A]/10 font-sans">
          {currentProfile.skillLevelTier}
        </span>
      </div>

      {/* Member Card */}
      <div className="rounded-xl border border-[#242938] bg-[#171A24] p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-[#1D2230] border-2 border-[#D6B36A] flex items-center justify-center text-2xl font-bold text-[#D6B36A] font-cinzel shadow-xl shadow-black/40 shrink-0">
            {currentProfile.displayName.slice(0, 2).toUpperCase()}
          </div>

          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h3 className="text-2xl font-bold text-[#F4F4F5] font-cinzel">
                {currentProfile.displayName}
              </h3>
              <span className="text-[11px] font-mono text-[#D6B36A] bg-[#10121B] px-2.5 py-0.5 rounded border border-[#242938]">
                ID: ACADEMY-MEMBER-01
              </span>
            </div>

            <p className="text-xs text-[#9297A5] font-mono">{currentProfile.email}</p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-[#9297A5] pt-2">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#D6B36A]" />
                Enrolled {formatRelativeDate(currentProfile.createdAt)}
              </span>
              <span className="flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-[#D6B36A]" />
                Mastery Score: {currentProfile.ratings.masteryScore}/100
              </span>
              <span className="flex items-center gap-1.5">
                <Crown className="w-3.5 h-3.5 text-[#D6B36A]" />
                Aiming for: National Master (NM)
              </span>
            </div>
          </div>
        </div>

        {/* Rating Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-[#242938]">
          <div className="p-3.5 rounded-lg bg-[#10121B]/60 border border-[#242938]">
            <span className="text-[10px] text-[#9297A5] uppercase tracking-wider block">Rapid</span>
            <span className="text-xl font-bold text-[#F4F4F5] font-mono">{currentProfile.ratings.rapid}</span>
          </div>
          <div className="p-3.5 rounded-lg bg-[#10121B]/60 border border-[#242938]">
            <span className="text-[10px] text-[#9297A5] uppercase tracking-wider block">Blitz</span>
            <span className="text-xl font-bold text-[#F4F4F5] font-mono">{currentProfile.ratings.blitz}</span>
          </div>
          <div className="p-3.5 rounded-lg bg-[#10121B]/60 border border-[#242938]">
            <span className="text-[10px] text-[#9297A5] uppercase tracking-wider block">Tactics</span>
            <span className="text-xl font-bold text-[#D6B36A] font-mono">{currentProfile.ratings.tactics}</span>
          </div>
          <div className="p-3.5 rounded-lg bg-[#10121B]/60 border border-[#242938]">
            <span className="text-[10px] text-[#9297A5] uppercase tracking-wider block">Endgame</span>
            <span className="text-xl font-bold text-[#D6B36A] font-mono">{currentProfile.ratings.endgame}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
