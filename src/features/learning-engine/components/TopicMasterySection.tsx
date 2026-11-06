import React from 'react';
import {
  Brain,
  ShieldCheck,
  AlertTriangle,
  HelpCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
} from 'lucide-react';
import type {
  TopicPerformanceMetrics,
  DetectedWeakness,
  ConfirmedStrength,
  EducationalTopicCategory,
} from '../types';

interface TopicMasterySectionProps {
  topicMetrics: Record<EducationalTopicCategory, TopicPerformanceMetrics>;
  strengths: ConfirmedStrength[];
  weaknesses: DetectedWeakness[];
  insufficientEvidenceAreas: EducationalTopicCategory[];
}

export const TopicMasterySection: React.FC<TopicMasterySectionProps> = ({
  topicMetrics,
  strengths,
  weaknesses,
}) => {
  const metricsList = Object.values(topicMetrics);

  return (
    <div className="space-y-6">
      {/* Strengths & Weaknesses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Confirmed Strengths */}
        <div className="p-5 rounded-2xl border border-[#242938] bg-[#171A24] space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#242938]">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold font-cinzel text-[#F4F4F5] uppercase tracking-wider">
                Confirmed Pedagogical Strengths
              </h3>
              <span className="text-[10px] text-[#9297A5]">Supported by repeated verified evaluations</span>
            </div>
          </div>

          <div className="space-y-3">
            {strengths.length > 0 ? (
              strengths.map((str) => (
                <div
                  key={str.id}
                  className="p-3 rounded-xl border border-emerald-500/20 bg-emerald-950/15 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#F4F4F5] font-cinzel">{str.title}</span>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                      {str.accuracyOrSuccessRate}% precision
                    </span>
                  </div>
                  <p className="text-[11px] text-[#9297A5] leading-relaxed">{str.description}</p>
                </div>
              ))
            ) : (
              <div className="p-4 rounded-xl border border-[#242938] bg-[#10121B] text-center text-xs text-[#9297A5]">
                Complete more lessons or assessments with &gt;80% accuracy to establish confirmed strength profiles.
              </div>
            )}
          </div>
        </div>

        {/* Detected Weaknesses */}
        <div className="p-5 rounded-2xl border border-[#242938] bg-[#171A24] space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#242938]">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold font-cinzel text-[#F4F4F5] uppercase tracking-wider">
                Identified Educational Gaps
              </h3>
              <span className="text-[10px] text-[#9297A5]">Conservative thresholds requiring multiple errors</span>
            </div>
          </div>

          <div className="space-y-3">
            {weaknesses.length > 0 ? (
              weaknesses.map((weak) => (
                <div
                  key={weak.id}
                  className={`p-3 rounded-xl border space-y-1.5 ${
                    weak.severity === 'repeated'
                      ? 'border-rose-500/30 bg-rose-950/15'
                      : 'border-amber-500/20 bg-amber-950/15'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#F4F4F5] font-cinzel">{weak.title}</span>
                    <span
                      className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded ${
                        weak.severity === 'repeated'
                          ? 'text-rose-300 bg-rose-950/60 border border-rose-500/30'
                          : 'text-amber-300 bg-amber-950/60 border border-amber-500/30'
                      }`}
                    >
                      {weak.severity} ({weak.evidenceCount} errors)
                    </span>
                  </div>
                  <p className="text-[11px] text-[#9297A5] leading-relaxed">{weak.description}</p>
                  <div className="text-[10px] font-mono text-[#D6B36A] pt-1">
                    Remedy: {weak.pedagogicalRemedy}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 rounded-xl border border-[#242938] bg-[#10121B] text-center text-xs text-[#9297A5]">
                No recurring gaps detected. Isolated single mistakes are not classified as weaknesses.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Comprehensive 10-Discipline Mastery Matrix */}
      <div className="p-5 rounded-2xl border border-[#242938] bg-[#171A24] space-y-4">
        <div className="flex items-center justify-between border-b border-[#242938] pb-3">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-[#D6B36A]" />
            <h3 className="text-xs font-bold font-cinzel text-[#F4F4F5] uppercase tracking-wider">
              Educational Discipline Performance Matrix
            </h3>
          </div>
          <span className="text-[10px] font-mono text-[#9297A5]">
            Conservative evidence confidence tiers
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3 text-xs">
          {metricsList.map((m) => {
            return (
              <div
                key={m.category}
                className="p-3 rounded-xl border border-[#242938] bg-[#10121B] space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#F4F4F5]">{m.title}</span>
                  <div className="flex items-center gap-1.5">
                    {m.recentTrend === 'improving' && (
                      <span className="text-emerald-400 flex items-center gap-0.5 text-[10px] font-mono">
                        <TrendingUp className="w-3 h-3" />
                        Up
                      </span>
                    )}
                    {m.recentTrend === 'regressing' && (
                      <span className="text-rose-400 flex items-center gap-0.5 text-[10px] font-mono">
                        <TrendingDown className="w-3 h-3" />
                        Down
                      </span>
                    )}
                    {m.recentTrend === 'stable' && (
                      <span className="text-[#9297A5] flex items-center gap-0.5 text-[10px] font-mono">
                        <Minus className="w-3 h-3" />
                        Steady
                      </span>
                    )}
                    <span
                      className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded ${
                        m.masteryStatus === 'mastered'
                          ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-500/30'
                          : m.masteryStatus === 'proficient'
                          ? 'bg-teal-950/70 text-teal-300 border border-teal-500/30'
                          : m.masteryStatus === 'competent'
                          ? 'bg-blue-950/70 text-blue-300 border border-blue-500/30'
                          : m.masteryStatus === 'developing'
                          ? 'bg-amber-950/70 text-amber-300 border border-amber-500/30'
                          : 'bg-[#171A24] text-[#9297A5] border border-[#242938]'
                      }`}
                    >
                      {m.masteryStatus.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {m.confidence !== 'insufficient' ? (
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-[#9297A5]">Precision</span>
                      <span className="font-mono text-[#F4F4F5]">
                        {m.successRate}% ({m.successfulAttempts}/{m.totalAttempts})
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-[#171A24] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          m.successRate >= 80
                            ? 'bg-emerald-400'
                            : m.successRate >= 60
                            ? 'bg-[#D6B36A]'
                            : 'bg-amber-500'
                        }`}
                        style={{ width: `${m.successRate}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-[#9297A5] leading-normal pt-1">
                      {m.masteryExplanation}
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-[11px] text-[#9297A5] py-1">
                    <HelpCircle className="w-3.5 h-3.5 text-[#9297A5]/60" />
                    <span>Insufficient sample size for objective calculation ({m.totalAttempts} sample)</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
