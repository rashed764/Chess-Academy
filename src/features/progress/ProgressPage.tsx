import React from 'react';
import { TrendingUp, ArrowLeft, Award, Calendar, CheckCircle2, Shield, Flame } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAppStore } from '../../stores/useAppStore';
import { playChessClick } from '../../utils/sound';
import { usePersonalizedLearning } from '../learning-engine/hooks/usePersonalizedLearning';
import { TopicMasterySection } from '../learning-engine/components/TopicMasterySection';

export const ProgressPage: React.FC = () => {
  const { currentProfile } = useAppStore();
  const { topicMetrics, strengths, weaknesses, insufficientEvidenceAreas } = usePersonalizedLearning();

  const milestones = [
    { name: "The Grandmaster Scholar", desc: "Completed all Tier I & II foundational curriculum lessons.", date: "Nov 2026", active: true },
    { name: "Tactical Hawk", desc: "Solved 50 tactical motif positions with >90% precision.", date: "Nov 2026", active: true },
    { name: "Endgame Disciple", desc: "Mastered the Lucena and Philidor theoretical positions.", date: "In Progress", active: false },
    { name: "Arena Contender", desc: "Completed 5 diagnostic matches in the Test Arena.", date: "Scheduled", active: false },
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#242938] pb-6">
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
              Personal Chess Journey
            </h2>
            <p className="text-xs text-[#9297A5] mt-0.5">
              Academy progression trajectory, tactical proficiency, and study achievements.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-[#D6B36A] font-medium uppercase tracking-wider px-3 py-1 rounded-full border border-[#D6B36A]/30 bg-[#D6B36A]/10 font-sans flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Streak: {currentProfile.stats.currentStreakDays} Day</span>
          </span>
        </div>
      </div>

      {/* Ratings Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {[
          { label: 'Rapid ELO', value: currentProfile.ratings.rapid, subtitle: 'Official Arena' },
          { label: 'Blitz ELO', value: currentProfile.ratings.blitz, subtitle: 'Speed Duel' },
          { label: 'Bullet ELO', value: currentProfile.ratings.bullet, subtitle: 'Reflex' },
          { label: 'Tactics Proficiency', value: currentProfile.ratings.tactics, subtitle: 'Motif Rating' },
          { label: 'Endgame Precision', value: currentProfile.ratings.endgame, subtitle: 'Conversion' },
        ].map((item) => (
          <div key={item.label} className="p-4 rounded-xl border border-[#242938] bg-[#171A24] space-y-1">
            <span className="text-[11px] text-[#9297A5] block">{item.label}</span>
            <div className="text-2xl font-bold text-[#D6B36A] font-mono">
              {item.value}
            </div>
            <span className="text-[10px] text-[#9297A5]/70 block">{item.subtitle}</span>
          </div>
        ))}
      </div>

      {/* Skill Breakdown & Milestones */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Skill Proficiencies */}
        <div className="lg:col-span-6 rounded-xl border border-[#242938] bg-[#171A24] p-6 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#242938]">
            <h3 className="text-sm font-bold text-[#F4F4F5] font-cinzel">
              Skill Dimension Breakdown
            </h3>
            <span className="text-xs font-mono text-[#D6B36A]">Overall: {currentProfile.ratings.masteryScore}%</span>
          </div>

          <div className="space-y-4 text-xs">
            {[
              { name: 'Tactical Geometry & Calculation', percent: 84 },
              { name: 'Opening Repertoire Theory', percent: 68 },
              { name: 'Middlegame Positional Strategy', percent: 72 },
              { name: 'Endgame Technique & Precision', percent: 58 },
              { name: 'Time Discipline & Clock Management', percent: 88 },
            ].map((skill) => (
              <div key={skill.name} className="space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-[#F4F4F5] font-medium">{skill.name}</span>
                  <span className="font-mono text-[#9297A5]">{skill.percent}%</span>
                </div>
                <div className="w-full h-1.5 bg-[#10121B] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#D6B36A] to-[#E8CF96] rounded-full"
                    style={{ width: `${skill.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Academy Milestones */}
        <div className="lg:col-span-6 rounded-xl border border-[#242938] bg-[#171A24] p-6 space-y-4">
          <h3 className="text-sm font-bold text-[#F4F4F5] font-cinzel pb-3 border-b border-[#242938]">
            Honors & Study Milestones
          </h3>

          <div className="space-y-3">
            {milestones.map((m) => (
              <div
                key={m.name}
                className={`p-3.5 rounded-lg border transition-all ${
                  m.active
                    ? 'bg-[#10121B]/80 border-[#D6B36A]/30'
                    : 'bg-[#10121B]/40 border-[#242938] opacity-75'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Award className={`w-4 h-4 ${m.active ? 'text-[#D6B36A]' : 'text-[#9297A5]'}`} />
                    <h4 className="text-xs font-bold text-[#F4F4F5] font-cinzel">{m.name}</h4>
                  </div>
                  <span className="text-[10px] font-mono text-[#9297A5]">{m.date}</span>
                </div>
                <p className="text-[11px] text-[#9297A5] pl-6 leading-relaxed">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Verified Topic Mastery & Learning Engine Diagnostics */}
      <section className="space-y-4 pt-4 border-t border-[#242938]">
        <div>
          <h3 className="text-xl font-bold text-[#F4F4F5] font-cinzel tracking-wide">
            Verified Educational Performance
          </h3>
          <p className="text-xs text-[#9297A5] mt-0.5">
            Objective topic evaluation synthesized from training exercise attempts and Test Arena matches.
          </p>
        </div>

        <TopicMasterySection
          topicMetrics={topicMetrics}
          strengths={strengths}
          weaknesses={weaknesses}
          insufficientEvidenceAreas={insufficientEvidenceAreas}
        />
      </section>
    </div>
  );
};
