/**
 * Interactive Initial Skill Assessment Card.
 * Renders in-stream assessment questions, options, and progress indicators.
 */

import React from 'react';
import { Sparkles, CheckCircle2, ChevronRight, HelpCircle } from 'lucide-react';
import type { InitialAssessmentState } from '../types';

interface InitialAssessmentCardProps {
  assessmentState: InitialAssessmentState;
  onSubmitAnswer: (answer: number | string) => void;
}

export const InitialAssessmentCard: React.FC<InitialAssessmentCardProps> = ({
  assessmentState,
  onSubmitAnswer,
}) => {
  if (!assessmentState.isActive || assessmentState.isCompleted) {
    return null;
  }

  const currentQ = assessmentState.questions[assessmentState.currentQuestionIndex];
  if (!currentQ) return null;

  const currentStep = assessmentState.currentQuestionIndex + 1;
  const total = assessmentState.totalQuestions;
  const progressPct = (currentStep / total) * 100;

  return (
    <div className="p-4 rounded-2xl bg-[#171A24] border border-amber-500/30 shadow-xl space-y-3">
      {/* Header & Progress */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
            Initial Skill Assessment
          </span>
        </div>
        <span className="text-xs text-zinc-400 font-mono">
          {currentStep} / {total}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-300"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Question Text */}
      <div className="space-y-1">
        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-medium bg-zinc-800 text-zinc-300 border border-zinc-700">
          {currentQ.category.replace(/_/g, ' ')} • {currentQ.difficulty}
        </span>
        <p className="text-sm font-medium text-zinc-100 leading-snug">
          {currentQ.question}
        </p>
      </div>

      {/* Options for Multiple Choice */}
      {currentQ.type === 'multiple_choice' && currentQ.options && (
        <div className="grid grid-cols-1 gap-2 pt-1">
          {currentQ.options.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => onSubmitAnswer(idx)}
              className="text-left px-3 py-2.5 rounded-xl bg-[#1D2230] hover:bg-[#242938] border border-[#2B3245] hover:border-amber-500/50 text-xs text-zinc-200 transition flex items-center justify-between group"
            >
              <span>{opt}</span>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-amber-400 transition shrink-0 ml-2" />
            </button>
          ))}
        </div>
      )}

      {/* Instructions for Board Move */}
      {currentQ.type === 'board_move' && (
        <div className="p-3 rounded-xl bg-[#1D2230] border border-amber-500/20 text-xs text-amber-300 flex items-start gap-2">
          <HelpCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Board Challenge</p>
            <p className="text-zinc-300">
              Look at the chessboard on the left. Find the best move and play it directly on the board!
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
