import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Compass,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  BookOpen,
  Target,
  RefreshCw,
} from 'lucide-react';
import type { PersonalizedLearningPlan, PersonalizedRecommendation } from '../types';

interface PersonalizedFocusCardProps {
  plan: PersonalizedLearningPlan;
  recommendations: PersonalizedRecommendation[];
  hasSufficientData: boolean;
  onRefresh?: () => void;
}

export const PersonalizedFocusCard: React.FC<PersonalizedFocusCardProps> = ({
  plan,
  recommendations,
  hasSufficientData,
  onRefresh,
}) => {
  const topRecommendation = recommendations[0];

  return (
    <div className="rounded-2xl border border-[#242938] bg-[#171A24] p-5 sm:p-6 shadow-xl relative overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#242938]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#D6B36A]/15 text-[#D6B36A] flex items-center justify-center border border-[#D6B36A]/30">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold font-cinzel text-[#F4F4F5] uppercase tracking-wider">
                Personalized Learning Focus
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#10121B] text-[#D6B36A] border border-[#242938]">
                Adaptive Engine
              </span>
            </div>
            <p className="text-xs text-[#9297A5] mt-0.5">{plan.currentFocus}</p>
          </div>
        </div>

        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            className="p-1.5 rounded-lg border border-[#242938] text-[#9297A5] hover:text-[#D6B36A] hover:bg-[#10121B] transition-colors self-start sm:self-auto cursor-pointer"
            title="Refresh Recommendations"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 pt-4">
        {/* Next Recommended Activity Banner */}
        <div className="md:col-span-7 space-y-3">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#9297A5] block">
            Primary Objective
          </span>

          {topRecommendation ? (
            <div className="p-4 rounded-xl border border-[#D6B36A]/30 bg-[#10121B] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#F4F4F5] font-cinzel">
                  {topRecommendation.title}
                </span>
                <span
                  className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded ${
                    topRecommendation.priority === 'critical'
                      ? 'bg-rose-950/70 text-rose-300 border border-rose-500/30'
                      : topRecommendation.priority === 'high'
                      ? 'bg-amber-950/70 text-amber-300 border border-amber-500/30'
                      : 'bg-[#171A24] text-[#D6B36A] border border-[#242938]'
                  }`}
                >
                  {topRecommendation.priority} priority
                </span>
              </div>
              <p className="text-xs text-[#9297A5] leading-relaxed">
                {topRecommendation.supportingEvidence}
              </p>
              <div className="pt-1">
                <NavLink
                  to={topRecommendation.actionUrl}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0B0D14] bg-[#D6B36A] hover:bg-[#E8CF96] px-3.5 py-1.5 rounded-lg transition-colors shadow-md shadow-[#D6B36A]/10 cursor-pointer"
                >
                  <span>{topRecommendation.actionLabel}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </NavLink>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl border border-[#242938] bg-[#10121B] text-xs text-[#9297A5]">
              No active priorities. Continue standard curriculum progression.
            </div>
          )}
        </div>

        {/* Priority Pillars / Review Items */}
        <div className="md:col-span-5 space-y-3">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#9297A5] block">
            Focus Disciplines
          </span>

          <div className="space-y-2">
            {plan.priorityTopics.length > 0 ? (
              plan.priorityTopics.map((item) => (
                <div
                  key={item.category}
                  className="p-2.5 rounded-lg border border-[#242938] bg-[#10121B] flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="text-[#F4F4F5] font-medium">{item.title}</span>
                  </div>
                  <span className="text-[10px] font-mono text-amber-400 uppercase">
                    Needs Practice
                  </span>
                </div>
              ))
            ) : (
              <div className="p-3 rounded-lg border border-[#242938] bg-[#10121B] flex items-center gap-2 text-xs text-[#9297A5]">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>No urgent gaps detected. Continue standard curriculum.</span>
              </div>
            )}

            {!hasSufficientData && (
              <div className="p-2.5 rounded-lg border border-[#242938] bg-[#10121B]/60 text-[11px] text-[#9297A5] flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[#D6B36A] shrink-0" />
                <span>Complete lessons or Test Arena games to unlock deeper topic analytics.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
