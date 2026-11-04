import React from 'react';
import { Lock, CheckCircle2 } from 'lucide-react';
import { ACADEMY_LEVELS } from '../data/levels';
import type { AcademyLevelId } from '../types';

interface LevelSelectorProps {
  selectedLevelId: AcademyLevelId;
  onSelectLevel: (levelId: AcademyLevelId) => void;
  isLevelUnlocked: (levelId: AcademyLevelId) => boolean;
  levelCompletionMap: Record<
    AcademyLevelId,
    { total: number; completed: number; percentage: number }
  >;
}

export const LevelSelector: React.FC<LevelSelectorProps> = ({
  selectedLevelId,
  onSelectLevel,
  isLevelUnlocked,
  levelCompletionMap,
}) => {
  return (
    <div className="w-full overflow-x-auto pb-2 scrollbar-thin">
      <div className="flex items-center gap-2.5 min-w-max p-1 bg-[#10121B] rounded-xl border border-[#242938]">
        {ACADEMY_LEVELS.map((level) => {
          const isSelected = level.id === selectedLevelId;
          const unlocked = isLevelUnlocked(level.id);
          const completion = levelCompletionMap[level.id] || { total: 0, completed: 0, percentage: 0 };
          const isMastered = completion.total > 0 && completion.completed >= completion.total;

          return (
            <button
              key={level.id}
              type="button"
              onClick={() => onSelectLevel(level.id)}
              className={`group relative flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-left transition-all cursor-pointer ${
                isSelected
                  ? 'bg-[#171A24] text-[#F4F4F5] border border-[#D6B36A] shadow-md shadow-[#D6B36A]/10'
                  : 'text-[#9297A5] hover:text-[#F4F4F5] hover:bg-[#171A24]/60 border border-transparent'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-md flex items-center justify-center text-xs font-mono font-bold shrink-0 ${
                  isSelected
                    ? 'bg-[#D6B36A] text-[#0B0D14]'
                    : isMastered
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : unlocked
                    ? 'bg-[#1D2230] text-[#D6B36A]'
                    : 'bg-[#171A24] text-[#9297A5]/50'
                }`}
              >
                {unlocked ? (
                  isMastered ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    level.order
                  )
                ) : (
                  <Lock className="w-3.5 h-3.5" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold font-cinzel tracking-wide block line-clamp-1">
                    {level.title}
                  </span>
                  {!unlocked && (
                    <span className="text-[10px] text-amber-400 font-mono bg-amber-400/10 px-1 rounded">
                      Locked
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-[10px] text-[#9297A5] font-mono">
                  <span>{completion.completed}/{completion.total} lessons</span>
                  {completion.percentage > 0 && (
                    <span className="text-[#D6B36A]">({completion.percentage}%)</span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
