import React, { useState } from 'react';
import {
  ShieldAlert,
  Flag,
  ArrowRight,
  Cpu,
  RefreshCw,
  Clock,
  Sparkles,
  Trophy,
} from 'lucide-react';
import type { Square } from 'chess.js';
import { ChessboardView } from '../../quick-match/components/ChessboardView';
import { PromotionModal } from '../../quick-match/components/PromotionModal';
import { ConfirmDialog } from '../../quick-match/components/ConfirmDialog';
import { useArenaMatchSession, type UseArenaMatchSessionProps } from '../hooks/useArenaMatchSession';
import { formatClockDisplay } from '../../quick-match/models/clock';
import type { AssessmentReport } from '../types';

interface ArenaMatchViewProps extends UseArenaMatchSessionProps {
  onViewReport: (report: AssessmentReport) => void;
}

export const ArenaMatchView: React.FC<ArenaMatchViewProps> = ({
  formatId,
  difficultyLevel,
  initialPlayerColor = 'w',
  existingAssessment,
  onAssessmentCompleted,
  onViewReport,
  onExit,
}) => {
  const [showResignConfirm, setShowResignConfirm] = useState(false);

  const {
    formatConfig,
    difficultyConfig,
    assessment,
    currentGameIndex,
    totalGames,
    currentPlayerColor,
    fen,
    rawMoves,
    isCheck,
    lastMove,
    selectedSquare,
    legalMovesForSelected,
    pendingPromotion,
    isEngineThinking,
    engineError,
    clockState,
    whiteDisplayText,
    blackDisplayText,
    isAnalyzing,
    analysisProgress,
    gameResultDetails,
    makePlayerMove,
    handleSquareClick,
    handleResign,
    advanceToNextGame,
    setPendingPromotion,
  } = useArenaMatchSession({
    formatId,
    difficultyLevel,
    initialPlayerColor,
    existingAssessment,
    onAssessmentCompleted,
    onExit,
  });

  const isPlayerTurn = (fen.split(' ')[1] || 'w') === currentPlayerColor;

  const whiteTime = whiteDisplayText;
  const blackTime = blackDisplayText;
  const isWhiteActive = clockState.activeSide === 'w';
  const isBlackActive = clockState.activeSide === 'b';

  const isAssessmentFinished = assessment.games.length >= totalGames && !isAnalyzing;
  const lastFinishedGameIndex = assessment.games.length > 0 ? assessment.games.length - 1 : 0;
  const gameIndexToDisplay = gameResultDetails ? lastFinishedGameIndex : currentGameIndex;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 animate-fadeIn">
      {/* Top Banner: Formal Unbiased Protocol */}
      <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#F4F4F5] uppercase tracking-wider font-cinzel">
                {formatConfig.name}
              </span>
              <span className="text-[11px] font-mono text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30">
                Game {currentGameIndex + 1} of {totalGames}
              </span>
            </div>
            <p className="text-[#9297A5] text-[11px] mt-0.5">
              Unbiased Evaluation Protocol: AI assistance, hints, and live engine evaluation are strictly suppressed during assessment.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowResignConfirm(true)}
          disabled={Boolean(gameResultDetails) || isAnalyzing}
          className="px-3 py-1.5 rounded-lg border border-[#242938] bg-[#171A24] hover:bg-rose-950/30 hover:border-rose-500/30 hover:text-rose-300 text-[#9297A5] text-xs font-semibold transition-colors flex items-center gap-1.5 shrink-0 self-start sm:self-auto cursor-pointer disabled:opacity-50"
        >
          <Flag className="w-3.5 h-3.5" />
          <span>Resign Match</span>
        </button>
      </div>

      {/* Main Chess Arena Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Board and Clocks */}
        <div className="lg:col-span-8 space-y-4">
          {/* Opponent Info & Clock Bar (Top) */}
          <div
            className={`p-3.5 rounded-xl border transition-all flex items-center justify-between ${
              currentPlayerColor === 'w'
                ? isBlackActive
                  ? 'border-[#D6B36A]/60 bg-[#171A24] shadow-md shadow-[#D6B36A]/5'
                  : 'border-[#242938] bg-[#10121B]'
                : isWhiteActive
                ? 'border-[#D6B36A]/60 bg-[#171A24] shadow-md shadow-[#D6B36A]/5'
                : 'border-[#242938] bg-[#10121B]'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#1D2230] text-[#D6B36A] flex items-center justify-center border border-[#242938]">
                <Cpu className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-[#F4F4F5] block font-cinzel">
                  Stockfish WASM ({difficultyConfig.name})
                </span>
                <span className="text-[11px] text-[#9297A5]">
                  Playing as {currentPlayerColor === 'w' ? 'Black' : 'White'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {isEngineThinking && (
                <span className="text-[11px] font-mono text-[#D6B36A] flex items-center gap-1 bg-[#D6B36A]/10 px-2 py-0.5 rounded border border-[#D6B36A]/20">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  Thinking...
                </span>
              )}
              <div
                className={`px-4 py-2 rounded-lg font-mono text-lg font-bold border transition-colors ${
                  (currentPlayerColor === 'w' ? isBlackActive : isWhiteActive)
                    ? 'bg-[#1D2230] text-[#D6B36A] border-[#D6B36A]/40'
                    : 'bg-[#0B0D14] text-[#9297A5] border-[#242938]'
                }`}
              >
                {currentPlayerColor === 'w' ? blackTime : whiteTime}
              </div>
            </div>
          </div>

          {/* Interactive Chessboard View */}
          <div className="relative rounded-2xl overflow-hidden border border-[#242938] bg-[#10121B] shadow-2xl p-2 sm:p-4">
            <ChessboardView
              fen={fen}
              playerSide={currentPlayerColor}
              isPlayerTurn={isPlayerTurn}
              isEngineThinking={isEngineThinking || isAnalyzing}
              isCheck={isCheck}
              selectedSquare={selectedSquare}
              legalMovesForSelected={legalMovesForSelected}
              lastMove={lastMove}
              onPieceDrop={(from, to) => makePlayerMove(from, to)}
              onSquareClick={handleSquareClick}
            />

            {/* In-Game Analysis Overlay Spinner */}
            {isAnalyzing && (
              <div className="absolute inset-0 bg-[#0B0D14]/85 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center z-30 animate-fadeIn">
                <div className="w-12 h-12 rounded-xl bg-[#D6B36A]/15 text-[#D6B36A] flex items-center justify-center border border-[#D6B36A]/30 mb-4 animate-bounce">
                  <Cpu className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-[#F4F4F5] font-cinzel mb-1">
                  Engine Performance Analysis
                </h4>
                <p className="text-xs text-[#9297A5] max-w-sm mb-4">
                  Evaluating positional accuracy and centipawn volatility using client-side Stockfish WASM.
                </p>
                <div className="w-full max-w-xs bg-[#171A24] h-2 rounded-full overflow-hidden border border-[#242938]">
                  <div
                    className="bg-[#D6B36A] h-full transition-all duration-300"
                    style={{
                      width: `${
                        analysisProgress.total > 0
                          ? Math.round((analysisProgress.current / analysisProgress.total) * 100)
                          : 0
                      }%`,
                    }}
                  />
                </div>
                <span className="text-[11px] font-mono text-[#D6B36A] mt-2">
                  Analyzing Move {analysisProgress.current} of {analysisProgress.total}...
                </span>
              </div>
            )}
          </div>

          {/* Player Info & Clock Bar (Bottom) */}
          <div
            className={`p-3.5 rounded-xl border transition-all flex items-center justify-between ${
              currentPlayerColor === 'w'
                ? isWhiteActive
                  ? 'border-[#D6B36A]/60 bg-[#171A24] shadow-md shadow-[#D6B36A]/5'
                  : 'border-[#242938] bg-[#10121B]'
                : isBlackActive
                ? 'border-[#D6B36A]/60 bg-[#171A24] shadow-md shadow-[#D6B36A]/5'
                : 'border-[#242938] bg-[#10121B]'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#D6B36A]/20 text-[#D6B36A] flex items-center justify-center font-bold text-xs border border-[#D6B36A]/30">
                YOU
              </div>
              <div>
                <span className="text-xs font-bold text-[#F4F4F5] block font-cinzel">
                  Candidate Assessment Player
                </span>
                <span className="text-[11px] text-[#9297A5]">
                  Playing as {currentPlayerColor === 'w' ? 'White' : 'Black'}
                </span>
              </div>
            </div>

            <div
              className={`px-4 py-2 rounded-lg font-mono text-lg font-bold border transition-colors ${
                (currentPlayerColor === 'w' ? isWhiteActive : isBlackActive)
                  ? 'bg-[#1D2230] text-[#D6B36A] border-[#D6B36A]/40'
                  : 'bg-[#0B0D14] text-[#9297A5] border-[#242938]'
              }`}
            >
              {currentPlayerColor === 'w' ? whiteTime : blackTime}
            </div>
          </div>
        </div>

        {/* Right Column: Move History and Assessment Details */}
        <div className="lg:col-span-4 space-y-4">
          {/* Assessment Protocol Card */}
          <div className="rounded-xl border border-[#242938] bg-[#171A24] p-5 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#D6B36A] font-cinzel border-b border-[#242938] pb-3">
              Assessment Protocol Rules
            </h4>

            <div className="space-y-2.5 text-xs text-[#9297A5]">
              <div className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D6B36A] mt-1.5 shrink-0" />
                <span>Standard FIDE clock rules with {formatConfig.timeControl.label}.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D6B36A] mt-1.5 shrink-0" />
                <span>Move evaluations calculated post-game with Stockfish WASM.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D6B36A] mt-1.5 shrink-0" />
                <span>Performance report generated upon assessment completion.</span>
              </div>
            </div>
          </div>

          {/* Real-time Move Notation Sheet */}
          <div className="rounded-xl border border-[#242938] bg-[#171A24] p-5 flex flex-col h-[400px]">
            <div className="flex items-center justify-between border-b border-[#242938] pb-3 mb-3">
              <span className="text-xs font-bold text-[#F4F4F5] font-cinzel">
                Move Record Sheet
              </span>
              <span className="text-[11px] font-mono text-[#9297A5]">
                {Math.ceil(rawMoves.length / 2)} moves
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1 pr-1 font-mono text-xs">
              {rawMoves.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-[#9297A5] italic">
                  Moves will appear here as played.
                </div>
              ) : (
                Array.from({ length: Math.ceil(rawMoves.length / 2) }).map((_, moveIdx) => {
                  const whiteMove = rawMoves[moveIdx * 2];
                  const blackMove = rawMoves[moveIdx * 2 + 1];

                  return (
                    <div
                      key={moveIdx}
                      className="grid grid-cols-12 py-1 px-2 rounded hover:bg-[#1D2230]/50 transition-colors"
                    >
                      <span className="col-span-2 text-[#636878]">{moveIdx + 1}.</span>
                      <span className="col-span-5 text-[#F4F4F5] font-semibold">
                        {whiteMove?.san}
                      </span>
                      <span className="col-span-5 text-[#9297A5]">
                        {blackMove?.san || ''}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Game Completed / Intermission Modal */}
      {gameResultDetails && !isAnalyzing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-lg rounded-2xl border border-[#D6B36A]/40 bg-[#171A24] p-6 shadow-2xl shadow-black/80 space-y-6">
            <div className="text-center space-y-2 border-b border-[#242938] pb-5">
              <div className="w-12 h-12 rounded-xl bg-[#D6B36A]/20 text-[#D6B36A] flex items-center justify-center mx-auto border border-[#D6B36A]/30">
                <Trophy className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold font-cinzel text-[#F4F4F5]">
                Game {gameIndexToDisplay + 1} Concluded
              </h3>
              <p className="text-xs text-[#9297A5]">{gameResultDetails.description}</p>
            </div>

            {/* Quick Summary Numbers */}
            {assessment.games[gameIndexToDisplay] && (
              <div className="grid grid-cols-3 gap-3 p-3.5 rounded-xl bg-[#10121B] border border-[#242938] text-center">
                <div>
                  <span className="text-[10px] uppercase font-mono text-[#9297A5] block">Result</span>
                  <span className="text-base font-bold text-[#F4F4F5] font-mono">
                    {assessment.games[gameIndexToDisplay].result}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-mono text-[#9297A5] block">Accuracy</span>
                  <span className="text-base font-bold text-[#D6B36A] font-mono">
                    {assessment.games[gameIndexToDisplay].accuracyPercent}%
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-mono text-[#9297A5] block">Avg Loss</span>
                  <span className="text-base font-bold text-[#F4F4F5] font-mono">
                    {assessment.games[gameIndexToDisplay].acpl} cp
                  </span>
                </div>
              </div>
            )}

            {/* Progression Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              {isAssessmentFinished ? (
                <button
                  type="button"
                  onClick={() => onViewReport(assessment)}
                  className="w-full py-3 bg-[#D6B36A] hover:bg-[#E8CF96] text-[#0B0D14] text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-[#D6B36A]/10 cursor-pointer"
                >
                  <Trophy className="w-4 h-4" />
                  <span>View Full Diagnostic Report</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={advanceToNextGame}
                  className="w-full py-3 bg-[#D6B36A] hover:bg-[#E8CF96] text-[#0B0D14] text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-[#D6B36A]/10 cursor-pointer"
                >
                  <span>Proceed to Game {gameIndexToDisplay + 2} of {totalGames}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Promotion Modal */}
      <PromotionModal
        isOpen={Boolean(pendingPromotion)}
        color={currentPlayerColor}
        onSelectPiece={(piece) => {
          if (pendingPromotion) {
            makePlayerMove(pendingPromotion.from, pendingPromotion.to, piece);
          }
        }}
        onCancel={() => setPendingPromotion(null)}
      />

      {/* Resignation Confirmation */}
      <ConfirmDialog
        isOpen={showResignConfirm}
        title="Resign Assessment Match"
        description="Are you sure you want to resign? This will record a loss for this match in your official assessment report."
        confirmLabel="Resign Match"
        cancelLabel="Continue Playing"
        isDestructive={true}
        onConfirm={() => {
          setShowResignConfirm(false);
          handleResign();
        }}
        onCancel={() => setShowResignConfirm(false)}
      />
    </div>
  );
};
