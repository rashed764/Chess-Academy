import React from 'react';
import { Award, Lock, BookOpen, Target, CheckCircle2 } from 'lucide-react';
import type { AcademyLevel } from '../types';

interface LevelProgressBannerProps {
  level: AcademyLevel;
  isUnlocked: boolean;
  lockReason: string;
  completedLessons: number;
  totalLessons: number;
  completionPercentage: number;
}

export const LevelProgressBanner: React.FC<LevelProgressBannerProps> = ({
  level,
  isUnlocked,
  lockReason,
  completedLessons,
  totalLessons,
  completionPercentage,
}) => {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#242938] bg-gradient-to-r from-[#171A24] via-[#10121B] to-[#171A24] p-5 sm:p-7 shadow-xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3 max-w-2xl">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#D6B36A] px-2.5 py-0.5 rounded bg-[#10121B] border border-[#242938]">
              {level.romanNumeral}
            </span>
            <span className="text-xs text-[#9297A5] font-mono">
              Target ELO: {level.targetRating}
            </span>
            {isUnlocked ? (
              completionPercentage === 100 ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Level Mastered
                </span>
              ) : (
                <span className="text-[11px] font-mono text-[#D6B36A] bg-[#D6B36A]/10 px-2 py-0.5 rounded border border-[#D6B36A]/30">
                  Active Level
                </span>
              )
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-mono text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/30">
                <Lock className="w-3 h-3" />
                Locked Level
              </span>
            )}
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F4F4F5] font-cinzel tracking-tight">
              {level.title}
            </h2>
            <p className="text-xs sm:text-sm font-medium text-[#D6B36A] mt-0.5">
              {level.subtitle}
            </p>
          </div>

          <p className="text-xs sm:text-sm text-[#9297A5] leading-relaxed">
            {level.objective}
          </p>

          {!isUnlocked && lockReason && (
            <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-500/30 text-xs text-amber-200 flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{lockReason}</span>
            </div>
          )}
        </div>

        {/* Level Mastery Meter */}
        <div className="md:w-64 p-4 rounded-xl bg-[#10121B] border border-[#242938] space-y-3 shrink-0">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-[#9297A5] flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-[#D6B36A]" />
              Lessons Completed
            </span>
            <span className="text-[#F4F4F5] font-bold">
              {completedLessons} / {totalLessons}
            </span>
          </div>

          <div className="w-full h-2 rounded-full bg-[#171A24] overflow-hidden border border-[#242938]">
            <div
              className="h-full bg-gradient-to-r from-[#D6B36A] to-[#E8CF96] rounded-full transition-all duration-500"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-[#9297A5]">
            <span>Level Mastery</span>
            <span className="text-[#D6B36A] font-bold">{completionPercentage}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
