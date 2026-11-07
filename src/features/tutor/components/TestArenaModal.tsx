/**
 * Modal dialog for explicit user confirmation before transitioning to Test Arena.
 * Strictly guarantees that AI never silently forces the user into an unassisted match.
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Swords, AlertTriangle, ShieldCheck, X } from 'lucide-react';
import type { TestArenaTransitionPrompt } from '../models/academyOrchestrator';

interface TestArenaModalProps {
  prompt: TestArenaTransitionPrompt | null;
  onClose: () => void;
}

export const TestArenaModal: React.FC<TestArenaModalProps> = ({ prompt, onClose }) => {
  const navigate = useNavigate();

  if (!prompt || !prompt.isOpen) return null;

  const handleEnterTestArena = () => {
    onClose();
    navigate('/test-arena');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md p-6 rounded-2xl bg-[#171A24] border border-amber-500/40 shadow-2xl space-y-4">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon & Title */}
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Swords className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-semibold text-zinc-100">
              Formal Test Arena Recommendation
            </h3>
            <span className="text-xs text-amber-400 font-medium">
              Diagnostic Assessment ({prompt.recommendedFormat.toUpperCase()})
            </span>
          </div>
        </div>

        {/* Tutor Reason */}
        <div className="p-3.5 rounded-xl bg-[#10121B] border border-[#242938] text-xs text-zinc-300 leading-relaxed">
          <p className="font-medium text-amber-300 mb-1">Tutor Recommendation:</p>
          <p>{prompt.reason}</p>
        </div>

        {/* Cognitive Isolation Warning Notice */}
        <div className="p-3 rounded-xl bg-red-950/20 border border-red-500/30 text-xs text-red-300 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
          <div>
            <p className="font-semibold text-red-200">Strict Cognitive Isolation</p>
            <p className="text-zinc-400 mt-0.5">
              During Test Arena matches, all AI coaching, progressive hints, and live evaluations are
              completely disabled to measure your true chess strength.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl border border-zinc-700 hover:bg-zinc-800 text-xs font-medium text-zinc-300 transition"
          >
            Continue Training
          </button>
          <button
            onClick={handleEnterTestArena}
            className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-xs font-semibold text-zinc-950 transition shadow-lg shadow-amber-500/20 flex items-center justify-center gap-1.5"
          >
            <ShieldCheck className="w-4 h-4" />
            Enter Test Arena
          </button>
        </div>
      </div>
    </div>
  );
};
