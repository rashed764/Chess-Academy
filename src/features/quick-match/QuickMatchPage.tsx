/**
 * Quick Match Page — Full interactive gameplay against local Stockfish WASM.
 * Features 9 time control presets + custom, 6 difficulty tiers, drag-and-drop / click-to-move,
 * pawn promotion modal, drift-free chess clock, algebraic notation sheet, and match result modal.
 */

import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Flag,
  RotateCcw,
  Swords,
  AlertCircle,
  HelpCircle,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useAppStore } from '../../stores/useAppStore';
import { playChessClick } from '../../utils/sound';
import { ChessboardView } from './components/ChessboardView';
import { ConfirmDialog } from './components/ConfirmDialog';
import { GameResultModal } from './components/GameResultModal';
import { MoveHistoryList } from './components/MoveHistoryList';
import { PlayerClockCard } from './components/PlayerClockCard';
import { PromotionModal } from './components/PromotionModal';
import { QuickMatchSetup } from './components/QuickMatchSetup';
import { useQuickMatchSession } from './hooks/useQuickMatchSession';

export const QuickMatchPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentProfile, updateSettings } = useAppStore();
  const soundEnabled = currentProfile.settings.soundEnabled;

  const session = useQuickMatchSession();

  // Dialog visibility states
  const [showResignDialog, setShowResignDialog] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);

  const toggleSound = () => {
    updateSettings({ soundEnabled: !soundEnabled });
  };

  const handleConfirmResign = () => {
    setShowResignDialog(false);
    session.resignMatch();
  };

  const handleConfirmExit = () => {
    setShowExitDialog(false);
    session.stopActiveSearch();
    session.setMatchStatus('setup');
  };

  const opponentSide: 'w' | 'b' = session.playerSide === 'w' ? 'b' : 'w';

  return (
    <div className="space-y-6 max-w-6xl mx-auto px-2 sm:px-4">
      {/* Setup View */}
      {session.matchStatus === 'setup' ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-[#242938] pb-4">
            <NavLink
              to="/"
              onClick={() => playChessClick(soundEnabled)}
              className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#9297A5] hover:text-[#F4F4F5] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </NavLink>

            <button
              type="button"
              onClick={toggleSound}
              className="p-2 rounded-lg text-[#9297A5] hover:text-[#F4F4F5] hover:bg-[#171A24] transition-colors cursor-pointer"
              title={soundEnabled ? 'Mute Audio' : 'Enable Audio'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>

          <QuickMatchSetup
            selectedDifficultyLevel={session.selectedDifficultyLevel}
            onSelectDifficulty={session.setSelectedDifficultyLevel}
            selectedTimeControlId={session.selectedTimeControlId}
            onSelectTimeControl={session.setSelectedTimeControlId}
            customMinutes={session.customMinutes}
            onChangeCustomMinutes={session.setCustomMinutes}
            customIncrement={session.customIncrement}
            onChangeCustomIncrement={session.setCustomIncrement}
            colorChoice={session.colorChoice}
            onSelectColor={session.setColorChoice}
            onStartMatch={session.startMatch}
          />
        </div>
      ) : (
        /* Active In-Game Arena View */
        <div className="space-y-5 animate-fadeIn">
          {/* Top In-Game Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-xl bg-[#10121B] border border-[#242938]">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowExitDialog(true)}
                className="p-2 rounded-lg text-[#9297A5] hover:text-[#F4F4F5] hover:bg-[#171A24] transition-colors cursor-pointer"
                title="Abandon Match"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold font-cinzel text-[#F4F4F5]">
                    {session.activeTimeControl.label}
                  </h3>
                  <span className="text-[10px] font-mono text-[#D6B36A] px-2 py-0.5 rounded bg-[#171A24] border border-[#242938]">
                    vs {session.activeDifficulty.name} (Lvl {session.activeDifficulty.skillLevel})
                  </span>
                </div>
                <p className="text-[11px] font-mono text-[#9297A5]">
                  Playing as {session.playerSide === 'w' ? 'White' : 'Black'} · Engine: Stockfish WASM
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                type="button"
                onClick={toggleSound}
                className="p-2 rounded-lg text-[#9297A5] hover:text-[#F4F4F5] hover:bg-[#171A24] transition-colors cursor-pointer"
                title={soundEnabled ? 'Mute' : 'Unmute'}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>

              <button
                type="button"
                onClick={() => setShowResignDialog(true)}
                disabled={session.matchStatus !== 'playing'}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <Flag className="w-3.5 h-3.5" />
                <span>Resign</span>
              </button>
            </div>
          </div>

          {/* Engine Error Alert if any */}
          {session.engineError && (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-xs text-red-300 flex items-center gap-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{session.engineError}</span>
            </div>
          )}

          {/* Gameplay Grid: Board (Left) & Move List / Controls (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Chessboard Column */}
            <div className="lg:col-span-8 flex flex-col gap-3">
              {/* Opponent Card (Top) */}
              <PlayerClockCard
                name="Stockfish WASM"
                subtitle={`${session.activeDifficulty.name} · ~${800 + session.activeDifficulty.skillLevel * 100} ELO`}
                color={opponentSide}
                remainingMs={
                  opponentSide === 'w'
                    ? session.clock.whiteDisplayMs
                    : session.clock.blackDisplayMs
                }
                isActive={session.clock.clockState.activeSide === opponentSide}
                isThinking={session.isEngineThinking}
                isCheck={session.isCheck && session.turn === opponentSide}
                isOpponent
              />

              {/* Interactive Chessboard View */}
              <ChessboardView
                fen={session.fen}
                playerSide={session.playerSide}
                isPlayerTurn={session.isPlayerTurn}
                isEngineThinking={session.isEngineThinking}
                isCheck={session.isCheck}
                selectedSquare={session.selectedSquare}
                legalMovesForSelected={session.legalMovesForSelected}
                lastMove={session.lastMove}
                onPieceDrop={session.makeMove}
                onSquareClick={session.handleSquareClick}
              />

              {/* Human Player Card (Bottom) */}
              <PlayerClockCard
                name={currentProfile.displayName || 'You'}
                subtitle={`Club Member · ${session.playerSide === 'w' ? 'White' : 'Black'}`}
                color={session.playerSide}
                remainingMs={
                  session.playerSide === 'w'
                    ? session.clock.whiteDisplayMs
                    : session.clock.blackDisplayMs
                }
                isActive={session.clock.clockState.activeSide === session.playerSide}
                isCheck={session.isCheck && session.turn === session.playerSide}
              />
            </div>

            {/* Sidebar Column: Move History & Match Info */}
            <div className="lg:col-span-4 flex flex-col gap-4 h-full">
              <div className="h-[480px]">
                <MoveHistoryList history={session.moveHistory} />
              </div>

              {/* Match Status Card */}
              <div className="rounded-xl border border-[#242938] bg-[#10121B] p-4 space-y-3">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#9297A5] block">
                  Match Status
                </span>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      session.matchStatus === 'playing'
                        ? session.isPlayerTurn
                          ? 'bg-[#D6B36A] animate-ping'
                          : 'bg-emerald-400 animate-pulse'
                        : 'bg-red-400'
                    }`}
                  />
                  <span className="text-xs font-bold font-mono text-[#F4F4F5]">
                    {session.matchStatus === 'playing'
                      ? session.isPlayerTurn
                        ? 'Your Turn — Move Your Piece'
                        : 'Stockfish Calculating Response...'
                      : 'Match Concluded'}
                  </span>
                </div>
                <div className="text-[11px] text-[#9297A5] font-mono space-y-1 border-t border-[#242938] pt-2">
                  <div className="flex justify-between">
                    <span>Move Count:</span>
                    <span className="text-[#F4F4F5]">
                      {Math.ceil(session.moveHistory.length / 2)} moves
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Rules:</span>
                    <span className="text-[#F4F4F5]">FIDE Standard (chess.js)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pawn Promotion Modal */}
      <PromotionModal
        isOpen={Boolean(session.pendingPromotion)}
        color={session.playerSide}
        onSelectPiece={(piece) => {
          if (session.pendingPromotion) {
            session.makeMove(
              session.pendingPromotion.from,
              session.pendingPromotion.to,
              piece
            );
            session.setPendingPromotion(null);
          }
        }}
        onCancel={() => session.setPendingPromotion(null)}
      />

      {/* Confirm Resignation Dialog */}
      <ConfirmDialog
        isOpen={showResignDialog}
        title="Resign Active Match"
        description="Are you sure you wish to resign this game? The victory will be awarded to Stockfish."
        confirmLabel="Resign Game"
        cancelLabel="Continue Playing"
        isDestructive
        onConfirm={handleConfirmResign}
        onCancel={() => setShowResignDialog(false)}
      />

      {/* Confirm Exit Dialog */}
      <ConfirmDialog
        isOpen={showExitDialog}
        title="Abandon Match"
        description="Leaving this match will abort your progress and return to match setup. Are you sure?"
        confirmLabel="Leave Match"
        cancelLabel="Stay in Match"
        isDestructive
        onConfirm={handleConfirmExit}
        onCancel={() => setShowExitDialog(false)}
      />

      {/* Completed Match Outcome Modal */}
      <GameResultModal
        summary={session.matchResult}
        onPlayAgain={session.startMatch}
        onReturnToSetup={() => {
          session.setMatchStatus('setup');
        }}
      />
    </div>
  );
};
