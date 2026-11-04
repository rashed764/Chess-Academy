import React from 'react';
import type { MoveQuality } from '../../../types/ai';

interface MoveQualityBadgeProps {
  quality: MoveQuality;
  scoreDifferenceCentipawns?: number;
  className?: string;
}

const QUALITY_CONFIG: Record<
  MoveQuality,
  { label: string; bg: string; text: string; border: string; symbol: string }
> = {
  brilliant: {
    label: 'Brilliant',
    bg: 'bg-cyan-950/60',
    text: 'text-cyan-400',
    border: 'border-cyan-500/40',
    symbol: '!!',
  },
  best: {
    label: 'Best',
    bg: 'bg-emerald-950/60',
    text: 'text-emerald-400',
    border: 'border-emerald-500/40',
    symbol: '★',
  },
  good: {
    label: 'Good',
    bg: 'bg-blue-950/60',
    text: 'text-blue-400',
    border: 'border-blue-500/40',
    symbol: '✓',
  },
  inaccuracy: {
    label: 'Inaccuracy',
    bg: 'bg-amber-950/60',
    text: 'text-amber-400',
    border: 'border-amber-500/40',
    symbol: '?!',
  },
  mistake: {
    label: 'Mistake',
    bg: 'bg-orange-950/60',
    text: 'text-orange-400',
    border: 'border-orange-500/40',
    symbol: '?',
  },
  blunder: {
    label: 'Blunder',
    bg: 'bg-red-950/60',
    text: 'text-red-400',
    border: 'border-red-500/40',
    symbol: '??',
  },
  unclassified: {
    label: 'Unclassified',
    bg: 'bg-[#171A24]',
    text: 'text-[#9297A5]',
    border: 'border-[#242938]',
    symbol: '—',
  },
};

export const MoveQualityBadge: React.FC<MoveQualityBadgeProps> = ({
  quality,
  scoreDifferenceCentipawns,
  className = '',
}) => {
  const config = QUALITY_CONFIG[quality] || QUALITY_CONFIG.unclassified;

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-mono font-semibold ${config.bg} ${config.text} ${config.border} ${className}`}
    >
      <span className="font-bold">{config.symbol}</span>
      <span>{config.label}</span>
      {scoreDifferenceCentipawns !== undefined && scoreDifferenceCentipawns > 0 && (
        <span className="text-[10px] opacity-75">(-{(scoreDifferenceCentipawns / 100).toFixed(2)})</span>
      )}
    </div>
  );
};
