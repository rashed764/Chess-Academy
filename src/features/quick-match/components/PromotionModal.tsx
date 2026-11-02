/**
 * Pawn promotion modal dialog.
 * Allows player to select Queen, Rook, Bishop, or Knight upon reaching the 8th/1st rank.
 */

import React from 'react';
import { Crown, Shield, Award, Zap } from 'lucide-react';

interface PromotionModalProps {
  isOpen: boolean;
  color: 'w' | 'b';
  onSelectPiece: (piece: 'q' | 'r' | 'b' | 'n') => void;
  onCancel: () => void;
}

export const PromotionModal: React.FC<PromotionModalProps> = ({
  isOpen,
  color,
  onSelectPiece,
  onCancel,
}) => {
  if (!isOpen) return null;

  const pieces: Array<{
    type: 'q' | 'r' | 'b' | 'n';
    name: string;
    icon: React.ComponentType<{ className?: string }>;
    detail: string;
  }> = [
    { type: 'q', name: 'Queen', icon: Crown, detail: 'Maximum mobility and tactical power' },
    { type: 'r', name: 'Rook', icon: Shield, detail: 'Linear files and rank control' },
    { type: 'b', name: 'Bishop', icon: Award, detail: 'Diagonal scope and color complex' },
    { type: 'n', name: 'Knight', icon: Zap, detail: 'Forking leaps and closed positions' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-md rounded-2xl border border-[#D6B36A]/40 bg-[#171A24] p-6 shadow-2xl shadow-black/80 space-y-6">
        <div className="text-center space-y-1 border-b border-[#242938] pb-4">
          <span className="text-[11px] font-mono uppercase tracking-widest text-[#D6B36A]">
            Pawn Promotion
          </span>
          <h3 className="text-xl font-bold font-cinzel text-[#F4F4F5]">
            Choose Your Piece
          </h3>
          <p className="text-xs text-[#9297A5]">
            Your pawn has reached the final rank. Promote to continue the attack.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {pieces.map((p) => {
            const Icon = p.icon;
            return (
              <button
                key={p.type}
                type="button"
                onClick={() => onSelectPiece(p.type)}
                className="flex flex-col items-center text-center p-4 rounded-xl border border-[#242938] bg-[#10121B] hover:bg-[#1D2230] hover:border-[#D6B36A] transition-all cursor-pointer group"
              >
                <div className="w-12 h-12 rounded-xl bg-[#171A24] border border-[#242938] flex items-center justify-center text-[#D6B36A] group-hover:scale-110 group-hover:bg-[#D6B36A]/10 transition-transform">
                  <Icon className="w-6 h-6 stroke-[1.75]" />
                </div>
                <span className="mt-3 text-sm font-bold text-[#F4F4F5] font-cinzel">
                  {p.name}
                </span>
                <span className="text-[10px] text-[#9297A5] mt-0.5 line-clamp-1">
                  {p.detail}
                </span>
              </button>
            );
          })}
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="w-full py-2.5 rounded-lg border border-[#242938] text-xs text-[#9297A5] hover:text-[#F4F4F5] hover:bg-[#10121B] transition-colors cursor-pointer"
          >
            Cancel Move
          </button>
        </div>
      </div>
    </div>
  );
};
