import React from 'react';
import {
  History,
  CheckCircle2,
  XCircle,
  BookOpen,
  Award,
  Calendar,
  RotateCcw,
} from 'lucide-react';
import type { ActivityHistoryItem } from '../types';
import { formatRelativeDate } from '../../../utils/formatters';

interface LearningHistoryViewProps {
  activityHistory: ActivityHistoryItem[];
  totalAttempts: number;
  correctAttempts: number;
  completedLessonsCount: number;
  onResetProgress: () => void;
}

export const LearningHistoryView: React.FC<LearningHistoryViewProps> = ({
  activityHistory,
  totalAttempts,
  correctAttempts,
  completedLessonsCount,
  onResetProgress,
}) => {
  const [showConfirmReset, setShowConfirmReset] = React.useState(false);

  const accuracy =
    totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-xl border border-[#242938] bg-[#171A24] space-y-1">
          <span className="text-[11px] font-mono text-[#9297A5] block">Completed Lessons</span>
          <span className="text-2xl font-bold font-mono text-[#D6B36A]">
            {completedLessonsCount}
          </span>
        </div>

        <div className="p-4 rounded-xl border border-[#242938] bg-[#171A24] space-y-1">
          <span className="text-[11px] font-mono text-[#9297A5] block">Exercise Attempts</span>
          <span className="text-2xl font-bold font-mono text-[#F4F4F5]">
            {totalAttempts}
          </span>
        </div>

        <div className="p-4 rounded-xl border border-[#242938] bg-[#171A24] space-y-1">
          <span className="text-[11px] font-mono text-[#9297A5] block">Correct Solves</span>
          <span className="text-2xl font-bold font-mono text-emerald-400">
            {correctAttempts}
          </span>
        </div>

        <div className="p-4 rounded-xl border border-[#242938] bg-[#171A24] space-y-1">
          <span className="text-[11px] font-mono text-[#9297A5] block">Accuracy Rate</span>
          <span className="text-2xl font-bold font-mono text-[#E8CF96]">
            {accuracy}%
          </span>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="rounded-2xl border border-[#242938] bg-[#10121B] p-5 sm:p-6 space-y-5">
        <div className="flex items-center justify-between pb-4 border-b border-[#242938]">
          <div className="flex items-center gap-2.5">
            <History className="w-5 h-5 text-[#D6B36A]" />
            <h3 className="text-base font-bold font-cinzel text-[#F4F4F5]">
              Learning Activity Journal
            </h3>
          </div>

          {activityHistory.length > 0 && (
            <button
              type="button"
              onClick={() => setShowConfirmReset(true)}
              className="text-xs text-[#9297A5] hover:text-red-400 transition-colors cursor-pointer"
            >
              Reset History
            </button>
          )}
        </div>

        {activityHistory.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-[#171A24] text-[#D6B36A] flex items-center justify-center mx-auto border border-[#242938]">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-[#F4F4F5]">
                No Learning Activity Yet
              </h4>
              <p className="text-xs text-[#9297A5] max-w-sm mx-auto mt-1">
                Your journey begins with Level 1. Read lesson materials and solve interactive board exercises to log your training history here.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {activityHistory.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-3.5 p-3.5 rounded-xl bg-[#171A24]/60 border border-[#242938] hover:border-[#2E3547] transition-colors"
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                    item.type === 'lesson_completed'
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : item.type === 'exercise_passed'
                      ? 'bg-[#D6B36A]/15 text-[#D6B36A] border border-[#D6B36A]/30'
                      : 'bg-red-500/15 text-red-400 border border-red-500/30'
                  }`}
                >
                  {item.type === 'lesson_completed' ? (
                    <Award className="w-4 h-4" />
                  ) : item.type === 'exercise_passed' ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <XCircle className="w-4 h-4" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h5 className="text-xs font-semibold text-[#F4F4F5] line-clamp-1 font-cinzel">
                      {item.lessonTitle}
                    </h5>
                    <span className="text-[10px] text-[#9297A5] font-mono shrink-0">
                      {formatRelativeDate(item.timestamp)}
                    </span>
                  </div>

                  <p className="text-[11px] text-[#9297A5] mt-0.5">
                    {item.details ||
                      (item.type === 'lesson_completed'
                        ? 'Mastered all objectives and exercises.'
                        : item.type === 'exercise_passed'
                        ? 'Solved interactive position correctly.'
                        : 'Move attempt did not satisfy objective.')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirm Reset Dialog */}
      {showConfirmReset && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-2xl border border-red-500/40 bg-[#10121B] p-6 space-y-4 shadow-2xl animate-scaleUp">
            <h4 className="text-sm font-bold font-cinzel text-red-400">
              Reset Training Progress?
            </h4>
            <p className="text-xs text-[#9297A5] leading-relaxed">
              This will clear all local completed lessons, exercise attempts, and history records. You will start fresh at Level 1.
            </p>
            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmReset(false)}
                className="px-3.5 py-1.5 rounded-lg border border-[#242938] bg-[#171A24] text-xs text-[#F4F4F5] hover:bg-[#1D2230] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onResetProgress();
                  setShowConfirmReset(false);
                }}
                className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-xs text-white font-bold cursor-pointer"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
