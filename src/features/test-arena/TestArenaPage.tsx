import React, { useState, useEffect } from 'react';
import {
  Trophy,
  ArrowLeft,
  Target,
  Activity,
  ShieldCheck,
  Zap,
  Play,
  RotateCcw,
  Clock,
  History,
  Trash2,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAppStore } from '../../stores/useAppStore';
import { playChessClick, playChime } from '../../utils/sound';
import { ARENA_ASSESSMENT_FORMATS } from './models/formats';
import { DIFFICULTY_PRESETS } from '../quick-match/models/difficulty';
import type { DifficultyLevel, PlayerColorChoice } from '../quick-match/types';
import type { AssessmentFormatId, AssessmentReport } from './types';
import { TestArenaStorage } from './models/storage';
import { ArenaMatchView } from './components/ArenaMatchView';
import { AssessmentReportView } from './components/AssessmentReportView';

type ViewMode = 'hub' | 'playing' | 'report';

export const TestArenaPage: React.FC = () => {
  const { currentProfile } = useAppStore();
  const soundEnabled = currentProfile.settings.soundEnabled;

  const [viewMode, setViewMode] = useState<ViewMode>('hub');
  const [selectedFormat, setSelectedFormat] = useState<AssessmentFormatId>('single_match');
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel>('intermediate');
  const [colorChoice, setColorChoice] = useState<PlayerColorChoice>('random');

  // Stored state
  const [reportsHistory, setReportsHistory] = useState<AssessmentReport[]>([]);
  const [activeAssessment, setActiveAssessment] = useState<AssessmentReport | null>(null);
  const [selectedReport, setSelectedReport] = useState<AssessmentReport | null>(null);

  // Load history & active assessment on mount
  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = () => {
    const reports = TestArenaStorage.getReports();
    setReportsHistory(reports);
    const active = TestArenaStorage.getActiveAssessment();
    setActiveAssessment(active);
  };

  const handleLaunch = () => {
    playChime(soundEnabled, 0.6);
    setViewMode('playing');
  };

  const handleResumeActive = () => {
    if (!activeAssessment) return;
    playChime(soundEnabled, 0.6);
    setSelectedFormat(activeAssessment.formatId);
    setViewMode('playing');
  };

  const handleDiscardActive = () => {
    if (window.confirm('Discard active in-progress assessment? This cannot be undone.')) {
      TestArenaStorage.clearActiveAssessment();
      setActiveAssessment(null);
      playChessClick(soundEnabled, 0.5);
    }
  };

  const handleViewReport = (report: AssessmentReport) => {
    playChessClick(soundEnabled, 0.5);
    setSelectedReport(report);
    setViewMode('report');
  };

  const handleDeleteReport = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Delete this assessment report from history?')) {
      TestArenaStorage.deleteReport(id);
      loadReports();
      playChessClick(soundEnabled, 0.4);
    }
  };

  // Determine actual starting player color (resolves 'random')
  const resolvedStartingColor: 'w' | 'b' =
    colorChoice === 'random' ? (Math.random() > 0.5 ? 'w' : 'b') : (colorChoice === 'white' ? 'w' : 'b');

  // Playing Mode
  if (viewMode === 'playing') {
    return (
      <ArenaMatchView
        formatId={selectedFormat}
        difficultyLevel={selectedDifficulty}
        initialPlayerColor={resolvedStartingColor}
        existingAssessment={activeAssessment}
        onAssessmentCompleted={(completedReport) => {
          setSelectedReport(completedReport);
          loadReports();
        }}
        onViewReport={(rep) => {
          setSelectedReport(rep);
          setViewMode('report');
        }}
        onExit={() => {
          loadReports();
          setViewMode('hub');
        }}
      />
    );
  }

  // Report View Mode
  if (viewMode === 'report' && selectedReport) {
    return (
      <AssessmentReportView
        report={selectedReport}
        onBackToHub={() => {
          loadReports();
          setViewMode('hub');
        }}
      />
    );
  }

  // Hub Mode
  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#242938] pb-6">
        <div className="flex items-center gap-3">
          <NavLink
            to="/"
            onClick={() => playChessClick(soundEnabled)}
            className="p-2 rounded-lg text-[#9297A5] hover:text-[#F4F4F5] hover:bg-[#171A24] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </NavLink>
          <div>
            <h2 className="text-2xl font-bold text-[#F4F4F5] font-cinzel">
              Test Arena
            </h2>
            <p className="text-xs text-[#9297A5] mt-0.5">
              Unbiased chess diagnostic assessment and verified engine performance evaluation.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-[#D6B36A] font-semibold uppercase tracking-wider px-3 py-1 rounded-full border border-[#D6B36A]/30 bg-[#D6B36A]/10 font-sans flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#D6B36A]" />
            Formal Assessment Mode
          </span>
        </div>
      </div>

      {/* Active In-Progress Banner (If Multi-Game Battery Incomplete) */}
      {activeAssessment && (
        <div className="rounded-xl border border-amber-500/40 bg-amber-950/25 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[11px] font-mono text-amber-400 uppercase tracking-wider font-semibold block">
              In-Progress Assessment Detected
            </span>
            <h4 className="text-sm font-bold text-[#F4F4F5] font-cinzel">
              {activeAssessment.formatName} ({activeAssessment.gamesCompleted} of {activeAssessment.totalGamesScheduled} Games Completed)
            </h4>
            <p className="text-xs text-[#9297A5]">
              Started on {new Date(activeAssessment.createdAt).toLocaleDateString()}. You can resume immediately.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleResumeActive}
              className="px-4 py-2 bg-[#D6B36A] hover:bg-[#E8CF96] text-[#0B0D14] text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-md shadow-[#D6B36A]/10 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Resume Assessment</span>
            </button>
            <button
              type="button"
              onClick={handleDiscardActive}
              className="px-3 py-2 bg-[#171A24] hover:bg-rose-950/30 hover:border-rose-500/30 hover:text-rose-300 text-[#9297A5] text-xs font-semibold rounded-lg transition-colors border border-[#242938] cursor-pointer"
              title="Discard In-Progress Assessment"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Arena Assessment Format Cards */}
      <div className="space-y-3">
        <label className="text-xs font-mono uppercase tracking-wider text-[#9297A5] block">
          Select Assessment Protocol
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {Object.values(ARENA_ASSESSMENT_FORMATS).map((format) => {
            const isSelected = selectedFormat === format.id;
            return (
              <div
                key={format.id}
                onClick={() => {
                  playChessClick(soundEnabled, 0.5);
                  setSelectedFormat(format.id);
                }}
                className={`p-6 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-[#D6B36A] bg-[#171A24] shadow-lg shadow-[#D6B36A]/10 ring-1 ring-[#D6B36A]/50'
                    : 'border-[#242938] bg-[#10121B]/60 hover:bg-[#171A24]'
                }`}
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-lg bg-[#1D2230] text-[#D6B36A] flex items-center justify-center border border-[#242938]">
                    {format.id === 'single_match' && <Target className="w-5 h-5" />}
                    {format.id === 'five_match_battery' && <Activity className="w-5 h-5" />}
                    {format.id === 'tactical_speed' && <Zap className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#F4F4F5] font-cinzel">
                      {format.name}
                    </h3>
                    <span className="text-[10px] text-[#D6B36A] font-mono block">
                      {format.tagline}
                    </span>
                  </div>
                  <p className="text-xs text-[#9297A5] leading-relaxed">
                    {format.description}
                  </p>
                </div>
                <div className="pt-4 border-t border-[#242938]/60 mt-4 flex items-center justify-between text-[11px] font-mono text-[#D6B36A]">
                  <span>{format.timeControl.label}</span>
                  <span>{format.totalGames} {format.totalGames === 1 ? 'Game' : 'Games'}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Opponent & Color Configuration */}
      <div className="rounded-xl border border-[#242938] bg-[#171A24] p-6 space-y-6">
        <h3 className="text-sm font-bold text-[#F4F4F5] font-cinzel border-b border-[#242938] pb-3">
          Opponent Calibration & Piece Color
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Difficulty Tier */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#F4F4F5] block">
              Stockfish Engine Opponent Tier
            </label>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value as DifficultyLevel)}
              className="w-full bg-[#10121B] border border-[#242938] focus:border-[#D6B36A] text-xs text-[#F4F4F5] rounded-lg p-2.5 outline-none cursor-pointer"
            >
              {Object.values(DIFFICULTY_PRESETS).map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.label}) — Skill Level {d.skillLevel}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-[#9297A5]">
              {DIFFICULTY_PRESETS[selectedDifficulty].description}
            </p>
          </div>

          {/* Color Assignment */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#F4F4F5] block">
              Player Piece Color Assignment
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'white', label: 'White' },
                { id: 'black', label: 'Black' },
                { id: 'random', label: 'Random' },
              ].map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setColorChoice(c.id as PlayerColorChoice)}
                  className={`p-2.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
                    colorChoice === c.id
                      ? 'border-[#D6B36A] bg-[#1D2230] text-[#D6B36A]'
                      : 'border-[#242938] bg-[#10121B] text-[#9297A5] hover:text-[#F4F4F5]'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-[#9297A5]">
              {selectedFormat === 'five_match_battery'
                ? 'Color alternates automatically every game in the 5-game series.'
                : 'Selected piece orientation for the diagnostic match.'}
            </p>
          </div>
        </div>

        {/* Start Assessment Action */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-[#242938]">
          <div className="flex items-center gap-2.5 text-xs text-[#9297A5]">
            <ShieldCheck className="w-4 h-4 text-[#D6B36A] shrink-0" />
            <span>Unbiased evaluation: zero hints, zero evaluation bar leaks, 100% objective metrics.</span>
          </div>

          <button
            type="button"
            onClick={handleLaunch}
            className="px-6 py-3 rounded-lg bg-[#D6B36A] hover:bg-[#E8CF96] text-[#0B0D14] text-xs font-bold tracking-wide transition-all shadow-md shadow-[#D6B36A]/10 cursor-pointer flex items-center justify-center gap-2 shrink-0 active:scale-[0.98]"
          >
            <Trophy className="w-4 h-4" />
            <span>Begin Assessment</span>
          </button>
        </div>
      </div>

      {/* Assessment Reports History */}
      <div className="rounded-xl border border-[#242938] bg-[#171A24] p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[#242938] pb-3">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-[#D6B36A]" />
            <h3 className="text-sm font-bold text-[#F4F4F5] font-cinzel">
              Assessment Report Archive
            </h3>
          </div>
          <span className="text-[11px] font-mono text-[#9297A5]">
            {reportsHistory.length} Recorded
          </span>
        </div>

        {reportsHistory.length === 0 ? (
          <div className="p-8 rounded-xl bg-[#10121B]/60 border border-[#242938] text-center space-y-2">
            <Trophy className="w-8 h-8 text-[#636878] mx-auto opacity-50" />
            <h4 className="text-xs font-semibold text-[#F4F4F5]">
              No Diagnostic Reports Recorded Yet
            </h4>
            <p className="text-[11px] text-[#9297A5] max-w-sm mx-auto">
              Complete your first single-match or multi-game battery to unlock verified Stockfish engine analysis, accuracy metrics, and phase diagnostics.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#242938] border border-[#242938] rounded-xl overflow-hidden bg-[#10121B]">
            {reportsHistory.map((rep) => (
              <div
                key={rep.id}
                onClick={() => handleViewReport(rep)}
                className="p-4 hover:bg-[#1D2230]/70 transition-colors flex items-center justify-between cursor-pointer group"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#F4F4F5] font-cinzel">
                      {rep.formatName}
                    </span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                        rep.status === 'completed'
                          ? 'bg-emerald-950/60 border-emerald-500/30 text-emerald-300'
                          : 'bg-amber-950/60 border-amber-500/30 text-amber-300'
                      }`}
                    >
                      {rep.status === 'completed' ? 'Completed' : 'Partial'}
                    </span>
                  </div>
                  <span className="text-[11px] text-[#9297A5] block">
                    Recorded {new Date(rep.createdAt).toLocaleDateString()} · {rep.gamesCompleted} games · Score: {rep.overallResults.wins}-{rep.overallResults.losses}-{rep.overallResults.draws}
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-sm font-bold text-[#D6B36A] font-mono block">
                      {rep.overallResults.accuracyPercent}%
                    </span>
                    <span className="text-[10px] text-[#9297A5] block">
                      {rep.overallResults.acpl} ACPL
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => handleDeleteReport(rep.id, e)}
                    className="p-1.5 rounded text-[#9297A5] hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
                    title="Delete report"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <ChevronRight className="w-4 h-4 text-[#636878] group-hover:text-[#D6B36A] transition-colors" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
