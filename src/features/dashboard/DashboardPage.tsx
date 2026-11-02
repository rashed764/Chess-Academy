import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Swords,
  GraduationCap,
  Trophy,
  ArrowRight,
  Sparkles,
  BookOpen,
  Compass,
  CheckCircle2,
} from 'lucide-react';
import { useAppStore } from '../../stores/useAppStore';
import { playChessClick, playChime } from '../../utils/sound';

export const DashboardPage: React.FC = () => {
  const { currentProfile } = useAppStore();

  const handleActionClick = () => {
    playChessClick(currentProfile.settings.soundEnabled, 0.7);
  };

  const handlePrimaryModeClick = () => {
    playChime(currentProfile.settings.soundEnabled, 0.6);
  };

  return (
    <div className="space-y-10 animate-fadeIn max-w-6xl mx-auto">
      {/* 1. Welcoming Hero Section with Luxury Chess Visual */}
      <section className="relative overflow-hidden rounded-2xl border border-[#242938] bg-gradient-to-br from-[#171A24] via-[#10121B] to-[#0B0D14] p-6 md:p-10 shadow-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Hero Typography */}
          <div className="lg:col-span-7 space-y-5 z-10">
            <div className="inline-flex items-center gap-2 text-xs font-medium text-[#D6B36A] tracking-wider uppercase">
              <span className="w-2 h-2 rounded-full bg-[#D6B36A]" aria-hidden="true" />
              <span>Grandmaster Salon & Academy</span>
            </div>

            <div className="space-y-1">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#F4F4F5] tracking-tight font-cinzel leading-tight text-balance">
                Master the Game.
              </h2>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#D6B36A] tracking-tight font-cinzel leading-tight text-balance">
                One Move at a Time.
              </h2>
            </div>

            <p className="text-sm sm:text-base text-[#9297A5] leading-relaxed max-w-xl">
              Your journey from your first move to advanced chess mastery starts here.
              Immerse yourself in structured academy curricula, test your strength in the arena,
              and duel high-performance engines in an atmosphere crafted for serious players.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <NavLink
                to="/training"
                onClick={handlePrimaryModeClick}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[#D6B36A] text-[#0B0D14] font-bold text-sm tracking-wide hover:bg-[#E8CF96] transition-all shadow-lg shadow-[#D6B36A]/15 active:scale-[0.98] cursor-pointer"
              >
                <span>Enter Academy</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </NavLink>

              <NavLink
                to="/quick-match"
                onClick={handleActionClick}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-[#242938] hover:border-[#D6B36A]/50 bg-[#171A24]/60 text-[#F4F4F5] font-medium text-sm hover:bg-[#1D2230] transition-all active:scale-[0.98] cursor-pointer"
              >
                <Swords className="w-4 h-4 text-[#D6B36A]" aria-hidden="true" />
                <span>Play Quick Match</span>
              </NavLink>
            </div>
          </div>

          {/* Hero Visual: Luxury Chess Club Artwork */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-xl overflow-hidden border border-[#D6B36A]/30 shadow-2xl group bg-[#0B0D14]">
              <img
                src="/assets/aistudio/image_8b937a72.png"
                alt="Luxury hand-crafted wooden chess board with carved pieces in dramatic ambient lighting"
                referrerPolicy="no-referrer"
                className="w-full h-64 sm:h-72 object-cover object-[92%_45%] scale-160 origin-[92%_45%] group-hover:scale-165 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B0D14] via-transparent to-transparent opacity-60 pointer-events-none" />

              <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs">
                <span className="text-[#F4F4F5] font-cinzel font-semibold tracking-wider">
                  The Academy Board
                </span>
                <span className="text-[#D6B36A] text-[11px] font-mono">Staunton Classic</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. The Three Primary Pillars: Quick Match, Training Academy, Test Arena */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-[#F4F4F5] font-cinzel tracking-wide">
              Primary Disciplines
            </h3>
            <p className="text-xs text-[#9297A5] mt-0.5">
              Choose your focus: competition, study, or objective assessment.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pillar 1: Quick Match */}
          <div className="group relative flex flex-col justify-between rounded-xl border border-[#242938] hover:border-[#D6B36A]/40 bg-[#171A24] p-6 transition-all duration-300 hover:shadow-xl hover:shadow-black/40">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[#1D2230] border border-[#242938] group-hover:border-[#D6B36A]/40 flex items-center justify-center text-[#D6B36A] transition-colors">
                <Swords className="w-6 h-6" aria-hidden="true" />
              </div>

              <div>
                <h4 className="text-lg font-bold text-[#F4F4F5] font-cinzel group-hover:text-[#D6B36A] transition-colors">
                  Quick Match
                </h4>
                <p className="text-xs font-medium text-[#D6B36A] mt-0.5">
                  Challenge the engine.
                </p>
              </div>

              <p className="text-xs text-[#9297A5] leading-relaxed">
                Step into an unassisted duel against Stockfish. Calibrate your time controls,
                test your opening reflexes, and experience tournament-grade chess.
              </p>
            </div>

            <div className="pt-6 border-t border-[#242938]/60 mt-6">
              <NavLink
                to="/quick-match"
                onClick={handleActionClick}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#1D2230] hover:bg-[#242938] text-[#F4F4F5] border border-[#242938] text-xs font-semibold tracking-wide transition-colors group-hover:border-[#D6B36A]/40 cursor-pointer"
              >
                <span>Play Quick Match</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#D6B36A]" aria-hidden="true" />
              </NavLink>
            </div>
          </div>

          {/* Pillar 2: Training Academy (Featured Core Discipline) */}
          <div className="group relative flex flex-col justify-between rounded-xl border-2 border-[#D6B36A]/50 bg-gradient-to-b from-[#1D2230] via-[#171A24] to-[#171A24] p-6 transition-all duration-300 shadow-xl shadow-[#D6B36A]/5">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-[#D6B36A]/15 border border-[#D6B36A]/40 flex items-center justify-center text-[#E8CF96]">
                  <GraduationCap className="w-6 h-6" aria-hidden="true" />
                </div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#D6B36A] bg-[#D6B36A]/10 px-2.5 py-1 rounded-full border border-[#D6B36A]/30">
                  Featured
                </span>
              </div>

              <div>
                <h4 className="text-lg font-bold text-[#F4F4F5] font-cinzel">
                  Training Academy
                </h4>
                <p className="text-xs font-medium text-[#E8CF96] mt-0.5">
                  Learn and improve.
                </p>
              </div>

              <p className="text-xs text-[#9297A5] leading-relaxed">
                Adaptive grandmaster curricula structured across four progressive tiers.
                Master calculation, tactical motifs, pawn structures, and classic endgame mechanics.
              </p>
            </div>

            <div className="pt-6 border-t border-[#242938]/60 mt-6">
              <NavLink
                to="/training"
                onClick={handlePrimaryModeClick}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#D6B36A] hover:bg-[#E8CF96] text-[#0B0D14] text-xs font-bold tracking-wide transition-all shadow-md shadow-[#D6B36A]/10 active:scale-[0.98] cursor-pointer"
              >
                <span>Start Training</span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </NavLink>
            </div>
          </div>

          {/* Pillar 3: Test Arena */}
          <div className="group relative flex flex-col justify-between rounded-xl border border-[#242938] hover:border-[#D6B36A]/40 bg-[#171A24] p-6 transition-all duration-300 hover:shadow-xl hover:shadow-black/40">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[#1D2230] border border-[#242938] group-hover:border-[#D6B36A]/40 flex items-center justify-center text-[#D6B36A] transition-colors">
                <Trophy className="w-6 h-6" aria-hidden="true" />
              </div>

              <div>
                <h4 className="text-lg font-bold text-[#F4F4F5] font-cinzel group-hover:text-[#D6B36A] transition-colors">
                  Test Arena
                </h4>
                <p className="text-xs font-medium text-[#D6B36A] mt-0.5">
                  Test your actual chess strength.
                </p>
              </div>

              <p className="text-xs text-[#9297A5] leading-relaxed">
                Unbiased diagnostic assessment matches. Complete games without assistance to
                generate true centipawn loss profiles and pinpoint technical weaknesses.
              </p>
            </div>

            <div className="pt-6 border-t border-[#242938]/60 mt-6">
              <NavLink
                to="/test-arena"
                onClick={handleActionClick}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#1D2230] hover:bg-[#242938] text-[#F4F4F5] border border-[#242938] text-xs font-semibold tracking-wide transition-colors group-hover:border-[#D6B36A]/40 cursor-pointer"
              >
                <span>Enter Test Arena</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#D6B36A]" aria-hidden="true" />
              </NavLink>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Restrained Secondary Information: Learning Level & Recent Club Record */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
        {/* Candidate Standing & Small Progress Indicator */}
        <div className="lg:col-span-5 rounded-xl border border-[#242938] bg-[#171A24] p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-[#F4F4F5] font-cinzel">
              Current Learning Standing
            </h4>
            <span className="text-xs font-semibold text-[#D6B36A] font-mono">
              {currentProfile.skillLevelTier.toUpperCase()}
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#9297A5]">Mastery Progress</span>
              <span className="text-[#F4F4F5] font-mono font-medium">
                {currentProfile.ratings.masteryScore}% to Next Tier
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-[#10121B] overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#D6B36A] to-[#E8CF96] rounded-full transition-all duration-500"
                style={{ width: `${currentProfile.ratings.masteryScore}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#242938] text-center">
            <div className="p-2 rounded-lg bg-[#10121B]/60">
              <span className="text-[10px] text-[#9297A5] block">Rapid ELO</span>
              <span className="text-sm font-bold text-[#F4F4F5] font-mono">
                {currentProfile.ratings.rapid}
              </span>
            </div>
            <div className="p-2 rounded-lg bg-[#10121B]/60">
              <span className="text-[10px] text-[#9297A5] block">Tactics</span>
              <span className="text-sm font-bold text-[#F4F4F5] font-mono">
                {currentProfile.ratings.tactics}
              </span>
            </div>
            <div className="p-2 rounded-lg bg-[#10121B]/60">
              <span className="text-[10px] text-[#9297A5] block">Endgame</span>
              <span className="text-sm font-bold text-[#F4F4F5] font-mono">
                {currentProfile.ratings.endgame}
              </span>
            </div>
          </div>
        </div>

        {/* Recent Academy Activity */}
        <div className="lg:col-span-7 rounded-xl border border-[#242938] bg-[#171A24] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-[#F4F4F5] font-cinzel">
              Recent Salon Activity
            </h4>
            <NavLink
              to="/progress"
              onClick={handleActionClick}
              className="text-xs text-[#D6B36A] hover:underline cursor-pointer"
            >
              View Full Journal
            </NavLink>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-[#10121B]/50 border border-[#242938]/60">
              <div className="w-8 h-8 rounded-lg bg-[#D6B36A]/10 text-[#D6B36A] flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-[#F4F4F5]">
                  Tactical Motif Mastered: Pin & Deflection
                </p>
                <p className="text-[11px] text-[#9297A5] truncate">
                  Completed 5 diagnostic exercises with 94% precision rating.
                </p>
              </div>
              <span className="text-[10px] text-[#9297A5] shrink-0">Today</span>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-[#10121B]/50 border border-[#242938]/60">
              <div className="w-8 h-8 rounded-lg bg-[#1D2230] text-[#D6B36A] flex items-center justify-center shrink-0 mt-0.5">
                <BookOpen className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-[#F4F4F5]">
                  Opening Repertoire: Sicilian Defense (Najdorf Variation)
                </p>
                <p className="text-[11px] text-[#9297A5] truncate">
                  Main line theory reviewed up to move 12.
                </p>
              </div>
              <span className="text-[10px] text-[#9297A5] shrink-0">Yesterday</span>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-[#10121B]/50 border border-[#242938]/60">
              <div className="w-8 h-8 rounded-lg bg-[#1D2230] text-[#D6B36A] flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-[#F4F4F5]">
                  Test Arena Diagnostic Report Generated
                </p>
                <p className="text-[11px] text-[#9297A5] truncate">
                  Accuracy: 88.4% · Key strength identified in minor piece transitions.
                </p>
              </div>
              <span className="text-[10px] text-[#9297A5] shrink-0">2d ago</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
