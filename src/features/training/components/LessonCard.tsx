import React from 'react';
import { CheckCircle2, Clock, Lock, Play, ChevronRight } from 'lucide-react';
import type { TrainingLesson } from '../types';

interface LessonCardProps {
  lesson: TrainingLesson;
  isUnlocked: boolean;
  isCompleted: boolean;
  onOpenLesson: (lessonId: string) => void;
}

export const LessonCard: React.FC<LessonCardProps> = ({
  lesson,
  isUnlocked,
  isCompleted,
  onOpenLesson,
}) => {
  return (
    <div
      onClick={() => {
        if (isUnlocked) {
          onOpenLesson(lesson.id);
        }
      }}
      className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
        !isUnlocked
          ? 'bg-[#10121B]/40 border-[#242938]/60 opacity-60 cursor-not-allowed'
          : isCompleted
          ? 'bg-[#171A24] border-emerald-500/30 hover:border-emerald-500/60 cursor-pointer shadow-sm'
          : 'bg-[#171A24] border-[#242938] hover:border-[#D6B36A]/50 hover:bg-[#1D2230] cursor-pointer shadow-md'
      }`}
    >
      <div className="flex items-start gap-3.5 min-w-0">
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
            isCompleted
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
              : !isUnlocked
              ? 'bg-[#10121B] text-[#9297A5]/40 border border-[#242938]'
              : 'bg-[#1D2230] text-[#D6B36A] border border-[#242938]'
          }`}
        >
          {isCompleted ? (
            <CheckCircle2 className="w-5 h-5" />
          ) : !isUnlocked ? (
            <Lock className="w-4 h-4" />
          ) : (
            <span className="text-xs font-mono font-bold">{lesson.order}</span>
          )}
        </div>

        <div className="space-y-1 min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h4
              className={`text-sm font-semibold font-cinzel line-clamp-1 ${
                isCompleted
                  ? 'text-[#F4F4F5]'
                  : isUnlocked
                  ? 'text-[#F4F4F5]'
                  : 'text-[#9297A5]'
              }`}
            >
              {lesson.title}
            </h4>
            {isCompleted && (
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                Completed
              </span>
            )}
          </div>

          <p className="text-xs text-[#9297A5] line-clamp-1">
            {lesson.learningObjective}
          </p>

          <div className="flex items-center gap-3 text-[11px] text-[#9297A5] font-mono pt-0.5">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-[#D6B36A]" />
              {lesson.estimatedMinutes} min
            </span>
            <span>·</span>
            <span className="capitalize">{lesson.exercise.exerciseType.replace('_', ' ')}</span>
            <span>·</span>
            <span className="text-[#D6B36A] capitalize">{lesson.difficulty.replace('-', ' ')}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
        {isUnlocked ? (
          <button
            type="button"
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold font-mono tracking-wide transition-all ${
              isCompleted
                ? 'bg-[#1D2230] hover:bg-[#242938] text-[#F4F4F5] border border-[#242938]'
                : 'bg-[#D6B36A] hover:bg-[#E8CF96] text-[#0B0D14] shadow-md shadow-[#D6B36A]/10 active:scale-98'
            }`}
          >
            <span>{isCompleted ? 'Review' : 'Start'}</span>
            {isCompleted ? <ChevronRight className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
          </button>
        ) : (
          <span className="text-[11px] font-mono text-[#9297A5] flex items-center gap-1">
            <Lock className="w-3 h-3 text-amber-400/80" />
            <span>Locked</span>
          </span>
        )}
      </div>
    </div>
  );
};
