import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  Copy,
  Cpu,
  Play,
  Square,
  RefreshCw,
  Sliders,
  Check,
  AlertTriangle,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { STARTING_FEN } from '../../services/chess/fen';
import { getChessEngine } from '../../services/chess/adapter';
import { UCIProtocol } from '../../services/chess/engine/UCIProtocol';
import type { EngineEvaluation } from '../../types/chess';
import type { EngineStatus } from '../../services/chess/types';
import { useAppStore } from '../../stores/useAppStore';
import { playChessClick, playChime } from '../../utils/sound';
import { CoachPanel } from '../coach/components/CoachPanel';

export const AnalysisPage: React.FC = () => {
  const { currentProfile } = useAppStore();
  const [fenInput, setFenInput] = useState(STARTING_FEN);
  const [copied, setCopied] = useState(false);

  // Engine state
  const [engineStatus, setEngineStatus] = useState<EngineStatus>('uninitialized');
  const [targetDepth, setTargetDepth] = useState<number>(12);
  const [multiPvCount, setMultiPvCount] = useState<number>(2);
  const [evaluation, setEvaluation] = useState<EngineEvaluation | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isEngineBusy, setIsEngineBusy] = useState(false);

  const engineRef = useRef(getChessEngine());

  // Listen to engine updates and ensure clean unmount
  useEffect(() => {
    const engine = engineRef.current;
    setEngineStatus(engine.status);

    engine.onEvaluationUpdate?.((liveEval) => {
      setEvaluation({ ...liveEval });
    });

    return () => {
      engine.stopSearch().catch(() => {});
    };
  }, []);

  const handleCopyFen = () => {
    navigator.clipboard.writeText(fenInput);
    setCopied(true);
    playChessClick(currentProfile.settings.soundEnabled, 0.4);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleResetStartPos = () => {
    playChessClick(currentProfile.settings.soundEnabled, 0.5);
    setFenInput(STARTING_FEN);
    setEvaluation(null);
    setErrorMessage(null);
  };

  const handleStartAnalysis = async () => {
    setErrorMessage(null);
    playChessClick(currentProfile.settings.soundEnabled, 0.5);

    const engine = engineRef.current;
    setIsEngineBusy(true);

    try {
      if (engine.status === 'uninitialized' || engine.status === 'error' || engine.status === 'terminated') {
        setEngineStatus('loading');
        await engine.init();
      }

      setEngineStatus('thinking');
      const result = await engine.evaluatePosition(fenInput, {
        depth: targetDepth,
        multiPv: multiPvCount,
      });

      setEvaluation(result);
      setEngineStatus('ready');
      playChime(currentProfile.settings.soundEnabled, 0.4);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : String(err));
      setEngineStatus(engine.status);
    } finally {
      setIsEngineBusy(false);
    }
  };

  const handleStopAnalysis = async () => {
    playChessClick(currentProfile.settings.soundEnabled, 0.5);
    const engine = engineRef.current;
    await engine.stopSearch();
    setIsEngineBusy(false);
    setEngineStatus('ready');
  };

  // Interpretation helper for position advantage
  const getAdvantageDescription = (ev: EngineEvaluation | null): string => {
    if (!ev) return 'Engine idle. Start analysis to evaluate position.';
    if (ev.mateInMoves !== undefined && ev.mateInMoves !== null) {
      return ev.mateInMoves > 0
        ? `Forced Mate for White in ${ev.mateInMoves} moves`
        : `Forced Mate for Black in ${Math.abs(ev.mateInMoves)} moves`;
    }
    if (ev.scoreCentipawns !== undefined && ev.scoreCentipawns !== null) {
      const score = ev.scoreCentipawns;
      if (Math.abs(score) < 25) return 'Even position · Dynamic equilibrium';
      if (score >= 25 && score < 100) return 'Slight White initiative · Positional pressure';
      if (score >= 100 && score < 300) return 'Clear White advantage · Favorable piece activity';
      if (score >= 300) return 'Decisive White advantage · Winning position';
      if (score <= -25 && score > -100) return 'Slight Black initiative · Positional pressure';
      if (score <= -100 && score > -300) return 'Clear Black advantage · Favorable piece activity';
      if (score <= -300) return 'Decisive Black advantage · Winning position';
    }
    return 'Calculating position variants...';
  };

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
              Game Analysis & Study Sanctum
            </h2>
            <p className="text-xs text-[#9297A5] mt-0.5">
              Live Stockfish WASM Web Worker calculation room, FEN analysis, and principal variations.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`text-xs font-medium uppercase tracking-wider px-3 py-1 rounded-full border font-sans ${
              engineStatus === 'thinking'
                ? 'border-[#D6B36A] bg-[#D6B36A]/20 text-[#D6B36A] animate-pulse'
                : engineStatus === 'ready'
                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                : engineStatus === 'loading'
                ? 'border-amber-500/40 bg-amber-500/10 text-amber-300'
                : 'border-[#242938] bg-[#171A24] text-[#9297A5]'
            }`}
          >
            {engineStatus === 'thinking'
              ? 'Stockfish Searching'
              : engineStatus === 'ready'
              ? 'Stockfish Ready'
              : engineStatus === 'loading'
              ? 'Booting WASM'
              : 'Engine Standby'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Move History & FEN controls */}
        <div className="lg:col-span-7 space-y-6">
          {/* FEN Bar */}
          <div className="rounded-xl border border-[#242938] bg-[#171A24] p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#F4F4F5] font-cinzel">Position FEN</span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleResetStartPos}
                  className="text-xs text-[#9297A5] hover:text-[#F4F4F5] flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Start Pos</span>
                </button>
                <button
                  type="button"
                  onClick={handleCopyFen}
                  className="text-xs text-[#D6B36A] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy FEN'}</span>
                </button>
              </div>
            </div>
            <input
              type="text"
              value={fenInput}
              onChange={(e) => {
                setFenInput(e.target.value);
                setErrorMessage(null);
              }}
              className="w-full bg-[#10121B] border border-[#242938] rounded-lg p-2.5 text-xs font-mono text-[#E8CF96] focus:outline-none focus:border-[#D6B36A]"
              placeholder="Paste FEN string..."
            />
            {errorMessage && (
              <div className="p-3 rounded-lg bg-red-950/40 border border-red-800/50 flex items-center gap-2 text-xs text-red-200">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
          </div>

          {/* Engine Parameters */}
          <div className="rounded-xl border border-[#242938] bg-[#171A24] p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#D6B36A]" />
              <h3 className="text-sm font-bold text-[#F4F4F5] font-cinzel">
                Calculation Calibration
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5 bg-[#10121B] p-3 rounded-lg border border-[#242938]">
                <div className="flex justify-between font-mono">
                  <span className="text-[#9297A5]">Search Depth:</span>
                  <span className="text-[#D6B36A] font-semibold">{targetDepth} ply</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="20"
                  value={targetDepth}
                  onChange={(e) => setTargetDepth(Number(e.target.value))}
                  disabled={isEngineBusy}
                  className="w-full accent-[#D6B36A] cursor-pointer disabled:opacity-50"
                />
              </div>

              <div className="space-y-1.5 bg-[#10121B] p-3 rounded-lg border border-[#242938]">
                <div className="flex justify-between font-mono">
                  <span className="text-[#9297A5]">Multi-PV Lines:</span>
                  <span className="text-[#D6B36A] font-semibold">{multiPvCount} lines</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="3"
                  value={multiPvCount}
                  onChange={(e) => setMultiPvCount(Number(e.target.value))}
                  disabled={isEngineBusy}
                  className="w-full accent-[#D6B36A] cursor-pointer disabled:opacity-50"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-1">
              {!isEngineBusy ? (
                <button
                  type="button"
                  onClick={handleStartAnalysis}
                  className="flex-1 py-3 px-4 rounded-lg bg-[#D6B36A] hover:bg-[#E8CF96] text-[#0B0D14] font-bold text-xs tracking-wider uppercase transition-all shadow-md shadow-[#D6B36A]/10 cursor-pointer flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Start Stockfish Analysis</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleStopAnalysis}
                  className="flex-1 py-3 px-4 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs tracking-wider uppercase transition-all shadow-md shadow-red-600/10 cursor-pointer flex items-center justify-center gap-2"
                >
                  <Square className="w-4 h-4 fill-current" />
                  <span>Stop Engine Search</span>
                </button>
              )}
            </div>
          </div>

          {/* AI Coach Positional Intelligence */}
          <CoachPanel
            mode="analysis"
            fen={fenInput}
            engineEvaluation={evaluation}
          />
        </div>


        {/* Right: Engine Calculation & Evaluation Bar */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-xl border border-[#242938] bg-[#171A24] p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#242938]">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-[#D6B36A]" />
                <h3 className="text-sm font-bold text-[#F4F4F5] font-cinzel">Stockfish WASM</h3>
              </div>
              <span className="text-[11px] font-mono text-[#D6B36A]">
                Depth {evaluation?.depth ?? 0} / {targetDepth}
              </span>
            </div>

            {/* Evaluation Score Display */}
            <div className="p-4 rounded-xl bg-[#10121B] border border-[#242938] text-center space-y-1">
              <span className="text-[10px] text-[#9297A5] uppercase tracking-wider block">
                Position Evaluation
              </span>
              <span className="text-3xl font-bold font-mono text-[#F4F4F5]">
                {UCIProtocol.formatEvaluationText(
                  evaluation?.scoreCentipawns,
                  evaluation?.mateInMoves
                )}
              </span>
              <span className="text-[11px] text-[#9297A5] block">
                {getAdvantageDescription(evaluation)}
              </span>
            </div>

            {/* Best Move Spotlight */}
            {evaluation?.bestMoveUci && (
              <div className="p-3 rounded-lg bg-[#1D2230] border border-[#D6B36A]/30 flex items-center justify-between text-xs">
                <span className="text-[#9297A5] font-mono">Recommended Best Move:</span>
                <span className="font-mono font-bold text-[#D6B36A] text-sm">
                  {evaluation.bestMoveSan ? `${evaluation.bestMoveSan} (${evaluation.bestMoveUci})` : evaluation.bestMoveUci}
                </span>
              </div>
            )}

            {/* Principal Variations */}
            <div className="space-y-3">
              <span className="text-[11px] uppercase font-bold tracking-wider text-[#9297A5] font-cinzel">
                Principal Variations (PV)
              </span>

              <div className="space-y-2 text-xs">
                {evaluation?.pvLines && evaluation.pvLines.length > 0 ? (
                  evaluation.pvLines.map((line, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-[#10121B]/70 border border-[#242938]">
                      <div className="flex justify-between font-mono text-[#D6B36A] text-[11px] mb-1">
                        <span>Line {idx + 1}</span>
                        <span>Stockfish WASM</span>
                      </div>
                      <p className="font-mono text-[#F4F4F5] text-[11px] leading-relaxed break-all">
                        {line}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="p-3 rounded-lg bg-[#10121B]/40 border border-[#242938] text-center text-[#9297A5] text-[11px]">
                    No search active. Click &quot;Start Stockfish Analysis&quot; to begin deep search.
                  </div>
                )}
              </div>
            </div>

            {/* Live Metrics */}
            {evaluation?.nodesVisited !== undefined && (
              <div className="flex justify-between items-center text-[10px] font-mono text-[#9297A5] pt-2 border-t border-[#242938]">
                <span>Nodes evaluated: {evaluation.nodesVisited.toLocaleString()}</span>
                <span>Worker: Dedicated WASM</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
