import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Trophy,
  ArrowLeft,
  Target,
  Activity,
  Award,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Download,
  Sparkles,
  TrendingUp,
  Clock,
  Layers,
  ChevronRight,
  BookOpen,
} from 'lucide-react';
import { Chessboard } from 'react-chessboard';
import type { AssessmentReport, AssessmentGameRecord, AnalyzedMoveRecord } from '../types';
import { MoveQualityBadge } from '../../coach/components/MoveQualityBadge';

interface AssessmentReportViewProps {
  report: AssessmentReport;
  onBackToHub: () => void;
}

export const AssessmentReportView: React.FC<AssessmentReportViewProps> = ({
  report,
  onBackToHub,
}) => {
  const [selectedGameIndex, setSelectedGameIndex] = useState<number>(0);
  const [selectedMoveIndex, setSelectedMoveIndex] = useState<number | null>(null);

  const selectedGame: AssessmentGameRecord | undefined = report.games[selectedGameIndex];
  const selectedMove: AnalyzedMoveRecord | undefined =
    selectedGame && selectedMoveIndex !== null ? selectedGame.moves[selectedMoveIndex] : undefined;

  // Active board preview FEN (shows move FEN or final FEN)
  const activeFen = selectedMove ? selectedMove.fenAfter : selectedGame?.finalFen || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

  const results = report.overallResults;

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(report, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `assessment-report-${report.id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#242938] pb-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackToHub}
            className="p-2 rounded-lg text-[#9297A5] hover:text-[#F4F4F5] hover:bg-[#171A24] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold text-[#F4F4F5] font-cinzel">
                Diagnostic Assessment Report
              </h2>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold border ${
                  report.status === 'completed'
                    ? 'bg-emerald-950/60 border-emerald-500/30 text-emerald-300'
                    : 'bg-amber-950/60 border-amber-500/30 text-amber-300'
                }`}
              >
                {report.status === 'completed' ? 'Fully Completed' : 'Incomplete / Partial'}
              </span>
            </div>
            <p className="text-xs text-[#9297A5] mt-0.5">
              {report.formatName} · Recorded {new Date(report.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleExportJson}
          className="px-4 py-2 bg-[#171A24] hover:bg-[#1D2230] border border-[#242938] text-xs text-[#F4F4F5] font-semibold rounded-lg transition-colors flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5 text-[#D6B36A]" />
          <span>Export Report (JSON)</span>
        </button>
      </div>

      {/* Top Level Metric Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl border border-[#242938] bg-[#171A24] space-y-1">
          <span className="text-[11px] font-mono text-[#9297A5] uppercase tracking-wider block">
            Overall Accuracy
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[#D6B36A] font-cinzel">
              {results.accuracyPercent}%
            </span>
          </div>
          <span className="text-[10px] text-[#636878] block">
            Custom heuristic: 100·e^(-0.004·ACPL)
          </span>
        </div>

        <div className="p-5 rounded-xl border border-[#242938] bg-[#171A24] space-y-1">
          <span className="text-[11px] font-mono text-[#9297A5] uppercase tracking-wider block">
            Avg Centipawn Loss
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[#F4F4F5] font-mono">
              {results.acpl}
            </span>
            <span className="text-xs text-[#9297A5]">cp</span>
          </div>
          <span className="text-[10px] text-[#636878] block">
            Across {results.playerMovesCount} evaluated moves
          </span>
        </div>

        <div className="p-5 rounded-xl border border-[#242938] bg-[#171A24] space-y-1">
          <span className="text-[11px] font-mono text-[#9297A5] uppercase tracking-wider block">
            Match Score (W-L-D)
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[#F4F4F5] font-mono">
              {results.wins}-{results.losses}-{results.draws}
            </span>
          </div>
          <span className="text-[10px] text-[#636878] block">
            {report.gamesCompleted} of {report.totalGamesScheduled} games completed
          </span>
        </div>

        <div className="p-5 rounded-xl border border-[#242938] bg-[#171A24] space-y-1">
          <span className="text-[11px] font-mono text-[#9297A5] uppercase tracking-wider block">
            Best Moves Ratio
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-emerald-400 font-mono">
              {results.bestMovesPercent}%
            </span>
          </div>
          <span className="text-[10px] text-[#636878] block">
            {results.classificationCounts.best} engine top choices
          </span>
        </div>
      </div>

      {/* Experimental Playing Performance Summary (Clearly Disclosed) */}
      {results.estimatedSkillRange && (
        <div className="rounded-xl border border-[#D6B36A]/30 bg-[#171A24] p-6 space-y-2">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-[#D6B36A]" />
            <h3 className="text-sm font-bold text-[#F4F4F5] font-cinzel">
              Playing Performance Summary (Engine-Relative Indicator)
            </h3>
          </div>
          <p className="text-xs text-[#F4F4F5]">
            Estimated Tier: <strong className="text-[#D6B36A] font-semibold">{results.estimatedSkillRange.label}</strong> ({results.estimatedSkillRange.rangeMin} – {results.estimatedSkillRange.rangeMax} Rating Range).
          </p>
          <p className="text-[11px] text-[#9297A5] italic">
            {results.estimatedSkillRange.disclaimer}
          </p>
        </div>
      )}

      {/* Move Quality Distribution & Phase Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Move Classifications Distribution */}
        <div className="rounded-xl border border-[#242938] bg-[#171A24] p-6 space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#D6B36A] font-cinzel border-b border-[#242938] pb-3 flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Move Classification Breakdown
          </h4>

          <div className="space-y-3">
            {[
              { label: 'Brilliant', key: 'brilliant' as const, color: 'bg-cyan-500', text: 'text-cyan-400' },
              { label: 'Best', key: 'best' as const, color: 'bg-emerald-500', text: 'text-emerald-400' },
              { label: 'Good', key: 'good' as const, color: 'bg-blue-500', text: 'text-blue-400' },
              { label: 'Inaccuracy', key: 'inaccuracy' as const, color: 'bg-amber-500', text: 'text-amber-400' },
              { label: 'Mistake', key: 'mistake' as const, color: 'bg-orange-500', text: 'text-orange-400' },
              { label: 'Blunder', key: 'blunder' as const, color: 'bg-red-500', text: 'text-red-400' },
            ].map((tier) => {
              const count = results.classificationCounts[tier.key] || 0;
              const percent =
                results.playerMovesCount > 0
                  ? Math.round((count / results.playerMovesCount) * 100)
                  : 0;

              return (
                <div key={tier.key} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className={`font-semibold ${tier.text}`}>{tier.label}</span>
                    <span className="font-mono text-[#9297A5]">
                      {count} ({percent}%)
                    </span>
                  </div>
                  <div className="w-full bg-[#10121B] h-2 rounded-full overflow-hidden border border-[#242938]">
                    <div
                      className={`${tier.color} h-full transition-all duration-300`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Phase Breakdown */}
        <div className="rounded-xl border border-[#242938] bg-[#171A24] p-6 space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#D6B36A] font-cinzel border-b border-[#242938] pb-3 flex items-center gap-2">
            <Layers className="w-4 h-4" />
            Game Phase Performance
          </h4>

          <div className="space-y-4">
            {[
              { name: 'Opening Phase', data: results.phaseBreakdown.opening },
              { name: 'Middlegame Phase', data: results.phaseBreakdown.middlegame },
              { name: 'Endgame Phase', data: results.phaseBreakdown.endgame },
            ].map((phase, idx) => (
              <div key={idx} className="p-3.5 rounded-lg bg-[#10121B] border border-[#242938] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#F4F4F5] font-cinzel">{phase.name}</span>
                  <span className="font-mono text-[#D6B36A]">
                    {phase.data.accuracyPercent !== undefined
                      ? `${phase.data.accuracyPercent}% Accuracy`
                      : 'N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-[#9297A5]">
                  <span>{phase.data.movesCount} moves analyzed</span>
                  <span>{phase.data.acpl !== undefined ? `${phase.data.acpl} ACPL` : 'No loss data'}</span>
                </div>
                {phase.data.observations[0] && (
                  <p className="text-[11px] text-[#636878] italic">
                    {phase.data.observations[0]}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Strengths & Weaknesses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/15 p-6 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 font-cinzel flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Identified Strengths
          </h4>
          <ul className="space-y-2 text-xs text-[#F4F4F5]">
            {results.strengths.map((str, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                <span>{str}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-rose-500/30 bg-rose-950/15 p-6 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 font-cinzel flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Identified Weaknesses
          </h4>
          <ul className="space-y-2 text-xs text-[#F4F4F5]">
            {results.weaknesses.map((w, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                <span>{w}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Game-by-Game Deep Dive Review */}
      {selectedGame && (
        <div className="rounded-xl border border-[#242938] bg-[#171A24] p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#242938] pb-4">
            <div>
              <h3 className="text-base font-bold text-[#F4F4F5] font-cinzel">
                Interactive Game Replay & Analysis
              </h3>
              <p className="text-xs text-[#9297A5]">
                Review move-by-move engine evaluations, centipawn drops, and alternative recommendations.
              </p>
            </div>

            {/* Game Selector Tabs if multi-game battery */}
            {report.games.length > 1 && (
              <div className="flex items-center gap-1.5 bg-[#10121B] p-1 rounded-lg border border-[#242938]">
                {report.games.map((g, idx) => (
                  <button
                    key={g.gameId}
                    type="button"
                    onClick={() => {
                      setSelectedGameIndex(idx);
                      setSelectedMoveIndex(null);
                    }}
                    className={`px-3 py-1 rounded text-xs font-mono font-semibold transition-colors cursor-pointer ${
                      selectedGameIndex === idx
                        ? 'bg-[#D6B36A] text-[#0B0D14]'
                        : 'text-[#9297A5] hover:text-[#F4F4F5]'
                    }`}
                  >
                    Game {idx + 1}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Interactive Board Preview */}
            <div className="lg:col-span-6 space-y-3">
              <div className="max-w-[420px] mx-auto rounded-xl overflow-hidden border border-[#242938] bg-[#10121B] p-2 shadow-xl">
                <Chessboard
                  options={{
                    position: activeFen,
                    boardOrientation: selectedGame.playerColor === 'w' ? 'white' : 'black',
                    allowDragging: false,
                    darkSquareStyle: { backgroundColor: '#1E2332' },
                    lightSquareStyle: { backgroundColor: '#384257' },
                  }}
                />
              </div>

              {selectedMove && (
                <div className="p-3.5 rounded-lg bg-[#10121B] border border-[#242938] space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#F4F4F5] font-cinzel">
                      Move {selectedMove.moveNumber}. {selectedMove.color === 'w' ? '' : '... '}{selectedMove.san}
                    </span>
                    <MoveQualityBadge quality={selectedMove.quality} scoreDifferenceCentipawns={selectedMove.evalLossCp} />
                  </div>
                  {selectedMove.bestMoveSan && selectedMove.bestMoveSan !== selectedMove.san && (
                    <div className="text-[11px] text-emerald-400">
                      Engine Best Move: <strong className="font-mono">{selectedMove.bestMoveSan}</strong>
                    </div>
                  )}
                  {selectedMove.boundaryRule && (
                    <div className="text-[10px] text-[#636878] italic">
                      Classification: {selectedMove.boundaryRule}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Move List Table */}
            <div className="lg:col-span-6 space-y-2">
              <span className="text-xs font-mono uppercase text-[#9297A5] block">
                Evaluated Player Moves
              </span>

              <div className="border border-[#242938] rounded-xl overflow-hidden bg-[#10121B] max-h-[460px] overflow-y-auto font-mono text-xs">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-[#171A24] text-[10px] uppercase text-[#9297A5] border-b border-[#242938] sticky top-0">
                    <tr>
                      <th className="py-2.5 px-3">Move</th>
                      <th className="py-2.5 px-3">Played</th>
                      <th className="py-2.5 px-3">Quality</th>
                      <th className="py-2.5 px-3">Best Line</th>
                      <th className="py-2.5 px-3">Loss</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#242938]">
                    {selectedGame.moves.map((move, idx) => {
                      const isSelected = selectedMoveIndex === idx;
                      const isPlayerMove = move.color === selectedGame.playerColor;

                      return (
                        <tr
                          key={idx}
                          onClick={() => setSelectedMoveIndex(idx)}
                          className={`cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-[#D6B36A]/15 text-[#D6B36A]'
                              : isPlayerMove
                              ? 'hover:bg-[#1D2230] text-[#F4F4F5]'
                              : 'text-[#636878] hover:bg-[#1D2230]/40'
                          }`}
                        >
                          <td className="py-2 px-3 font-semibold">
                            {move.moveNumber}.{move.color === 'b' ? '..' : ''}
                          </td>
                          <td className="py-2 px-3 font-bold">{move.san}</td>
                          <td className="py-2 px-3">
                            {isPlayerMove ? (
                              <MoveQualityBadge quality={move.quality} />
                            ) : (
                              <span className="text-[10px] text-[#636878]">—</span>
                            )}
                          </td>
                          <td className="py-2 px-3 text-[#9297A5]">
                            {isPlayerMove ? move.bestMoveSan || '—' : '—'}
                          </td>
                          <td className="py-2 px-3">
                            {move.evalLossCp !== undefined && move.evalLossCp > 0 ? (
                              <span className="text-rose-400">-{move.evalLossCp} cp</span>
                            ) : (
                              <span className="text-[#636878]">0 cp</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Curriculum Recommendations */}
      <div className="rounded-xl border border-[#242938] bg-[#171A24] p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#242938] pb-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#D6B36A] font-cinzel flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Recommended Academy Syllabus
          </h4>
          <span className="text-[11px] font-mono text-[#9297A5]">
            Integrated with Personalized Learning Engine
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {results.recommendations.map((rec, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-[#10121B] border border-[#242938] space-y-2">
              <span className="w-5 h-5 rounded-full bg-[#D6B36A]/20 text-[#D6B36A] flex items-center justify-center font-bold text-xs">
                {idx + 1}
              </span>
              <p className="text-xs text-[#F4F4F5] leading-relaxed">{rec}</p>
            </div>
          ))}
        </div>
        <div className="pt-2 flex justify-end">
          <NavLink
            to="/progress"
            className="inline-flex items-center gap-1.5 text-xs text-[#D6B36A] hover:text-[#E8CF96] font-semibold transition-colors"
          >
            <span>View Full Personalized Skill Trajectory in Progress</span>
            <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
          </NavLink>
        </div>
      </div>
    </div>
  );
};
