import React from 'react';
import {
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  RotateCcw,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import type { ChessExercise } from '../types';

interface ExerciseFeedbackProps {
  status: 'ready' | 'correct' | 'incorrect' | 'completed';
  feedbackMessage: string;
  exercise: ChessExercise;
  currentStepIndex: number;
  totalSteps: number;
  showHint: boolean;
  onToggleHint: () => void;
  onReset: () => void;
  onNextLesson?: () => void;
  hasNextLesson: boolean;
}

export const ExerciseFeedback: React.FC<ExerciseFeedbackProps> = ({
  status,
  feedbackMessage,
  exercise,
  currentStepIndex,
  totalSteps,
  showHint,
  onToggleHint,
  onReset,
  onNextLesson,
  hasNextLesson,
}) => {
  return (
    <div className="rounded-2xl border border-[#242938] bg-[#10121B] p-4 sm:p-5 space-y-4 shadow-xl">
      {/* Exercise Instructions & Step Tracker */}
      <div className="flex items-center justify-between pb-3 border-b border-[#242938]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#D6B36A]" />
          <h4 className="text-xs font-mono uppercase tracking-wider text-[#D6B36A] font-bold">
            Objective
          </h4>
        </div>

        {totalSteps > 1 && (
          <span className="text-[11px] font-mono text-[#9297A5] bg-[#171A24] px-2 py-0.5 rounded border border-[#242938]">
            Step {Math.min(currentStepIndex + 1, totalSteps)} of {totalSteps}
          </span>
        )}
      </div>

      <p className="text-xs sm:text-sm text-[#F4F4F5] leading-relaxed">
        {exercise.instruction}
      </p>

      {/* Dynamic Status Banner */}
      {status === 'completed' ? (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 space-y-2 animate-fadeIn">
          <div className="flex items-center gap-2 text-emerald-400 text-xs sm:text-sm font-bold font-cinzel">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Exercise Solved!</span>
          </div>
          <p className="text-xs text-emerald-200 leading-relaxed">
            {feedbackMessage || exercise.explanation}
          </p>

          {hasNextLesson && onNextLesson && (
            <div className="pt-2">
              <button
                type="button"
                onClick={onNextLesson}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#D6B36A] hover:bg-[#E8CF96] text-[#0B0D14] text-xs font-bold font-mono transition-all shadow-md active:scale-98 cursor-pointer"
              >
                <span>Continue to Next Lesson</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      ) : status === 'incorrect' ? (
        <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/40 space-y-1.5 animate-fadeIn">
          <div className="flex items-center gap-2 text-red-400 text-xs font-semibold">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Incorrect Move</span>
          </div>
          <p className="text-xs text-red-200 leading-relaxed">
            {feedbackMessage}
          </p>
        </div>
      ) : status === 'correct' ? (
        <div className="p-3.5 rounded-xl bg-[#1D2230] border border-[#D6B36A]/40 space-y-1 animate-fadeIn">
          <div className="flex items-center gap-2 text-[#D6B36A] text-xs font-semibold">
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>Great Move!</span>
          </div>
          <p className="text-xs text-[#F4F4F5]">
            {feedbackMessage}
          </p>
        </div>
      ) : null}

      {/* Hint Box (if revealed) */}
      {showHint && (
        <div className="p-3.5 rounded-xl bg-[#171A24] border border-[#D6B36A]/30 text-xs text-[#E8CF96] flex items-start gap-2.5 animate-fadeIn">
          <HelpCircle className="w-4 h-4 text-[#D6B36A] shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-semibold block text-[#D6B36A]">Master Hint:</span>
            <span>{exercise.hint}</span>
          </div>
        </div>
      )}

      {/* Action Controls: Reset & Hint */}
      <div className="flex items-center justify-between pt-2 border-t border-[#242938]">
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1.5 text-xs text-[#9297A5] hover:text-[#F4F4F5] transition-colors cursor-pointer py-1"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Board</span>
        </button>

        <button
          type="button"
          onClick={onToggleHint}
          className="inline-flex items-center gap-1.5 text-xs text-[#D6B36A] hover:underline transition-all cursor-pointer py-1"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>{showHint ? 'Hide Hint' : 'Need a Hint?'}</span>
        </button>
      </div>
    </div>
  );
};
