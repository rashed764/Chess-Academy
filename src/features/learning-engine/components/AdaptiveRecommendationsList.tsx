import React from 'react';
import { NavLink } from 'react-router-dom';
import { Sparkles, ArrowRight, RotateCcw, AlertTriangle, CheckCircle2 } from 'lucide-react';
import type { PersonalizedRecommendation } from '../types';

interface AdaptiveRecommendationsListProps {
  recommendations: PersonalizedRecommendation[];
  onOpenLesson?: (lessonId: string) => void;
}

export const AdaptiveRecommendationsList: React.FC<AdaptiveRecommendationsListProps> = ({
  recommendations,
  onOpenLesson,
}) => {
  if (recommendations.length === 0) return null;

  return (
    <div className="rounded-2xl border border-[#D6B36A]/30 bg-gradient-to-br from-[#171A24] to-[#10121B] p-5 shadow-xl space-y-4">
      <div className="flex items-center justify-between border-b border-[#242938] pb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#D6B36A]/20 text-[#D6B36A] flex items-center justify-center border border-[#D6B36A]/30">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold font-cinzel text-[#F4F4F5] uppercase tracking-wider">
              Adaptive Recommendations
            </h3>
            <p className="text-[11px] text-[#9297A5]">
              Tailored learning path based on your verified performance evidence.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {recommendations.slice(0, 4).map((rec) => {
          const isReview = rec.type === 'curriculum_revision';

          return (
            <div
              key={rec.id}
              className={`p-4 rounded-xl border transition-all ${
                rec.priority === 'critical'
                  ? 'border-rose-500/30 bg-[#171A24]/90'
                  : rec.priority === 'high'
                  ? 'border-amber-500/30 bg-[#171A24]/90'
                  : 'border-[#242938] bg-[#10121B]'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span
                  className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold ${
                    isReview
                      ? 'bg-amber-950/60 text-amber-300 border border-amber-500/30'
                      : 'bg-[#D6B36A]/10 text-[#D6B36A] border border-[#D6B36A]/20'
                  }`}
                >
                  {isReview ? 'Targeted Revision' : 'Recommended Next'}
                </span>
                <span className="text-[10px] font-mono text-[#9297A5]">
                  {rec.estimatedMinutes ? `${rec.estimatedMinutes} min` : ''}
                </span>
              </div>

              <h4 className="text-xs font-bold text-[#F4F4F5] mb-1 font-cinzel">
                {rec.title}
              </h4>
              <p className="text-[11px] text-[#9297A5] leading-relaxed mb-3">
                {rec.supportingEvidence}
              </p>

              {rec.targetLessonId && onOpenLesson ? (
                <button
                  type="button"
                  onClick={() => onOpenLesson(rec.targetLessonId!)}
                  className="w-full py-2 px-3 rounded-lg bg-[#D6B36A] hover:bg-[#E8CF96] text-[#0B0D14] text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-[#D6B36A]/10"
                >
                  {isReview ? <RotateCcw className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
                  <span>{rec.actionLabel}</span>
                </button>
              ) : (
                <NavLink
                  to={rec.actionUrl}
                  className="w-full py-2 px-3 rounded-lg bg-[#D6B36A] hover:bg-[#E8CF96] text-[#0B0D14] text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-[#D6B36A]/10"
                >
                  <span>{rec.actionLabel}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </NavLink>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
