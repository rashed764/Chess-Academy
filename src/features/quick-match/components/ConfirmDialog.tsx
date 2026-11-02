/**
 * Reusable confirmation dialog for match actions (resignation, abandoning game, returning to setup).
 */

import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDestructive = false,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-sm rounded-2xl border border-[#242938] bg-[#171A24] p-6 shadow-2xl shadow-black/90 space-y-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${
              isDestructive
                ? 'bg-red-500/15 border-red-500/30 text-red-400'
                : 'bg-[#D6B36A]/15 border-[#D6B36A]/30 text-[#D6B36A]'
            }`}
          >
            <AlertTriangle className="w-5 h-5 stroke-[1.75]" />
          </div>
          <div>
            <h4 className="text-base font-bold font-cinzel text-[#F4F4F5]">{title}</h4>
            <span className="text-[11px] font-mono text-[#9297A5] uppercase tracking-wider">
              Match Confirmation
            </span>
          </div>
        </div>

        <p className="text-xs text-[#9297A5] leading-relaxed">{description}</p>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="py-2.5 px-3 rounded-lg border border-[#242938] bg-[#10121B] hover:bg-[#1D2230] text-xs font-semibold text-[#9297A5] hover:text-[#F4F4F5] transition-colors cursor-pointer"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`py-2.5 px-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              isDestructive
                ? 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-950/50'
                : 'bg-[#D6B36A] hover:bg-[#E8CF96] text-[#0B0D14] shadow-lg shadow-[#D6B36A]/20'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
