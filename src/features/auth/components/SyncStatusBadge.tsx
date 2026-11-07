import React from 'react';
import { Cloud, CloudOff, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { formatRelativeDate } from '../../../utils/formatters';

interface SyncStatusBadgeProps {
  showButton?: boolean;
  className?: string;
}

export const SyncStatusBadge: React.FC<SyncStatusBadgeProps> = ({
  showButton = false,
  className = '',
}) => {
  const { syncStatus, lastSyncedAt, triggerSync, isAuthenticated, isConfigured } = useAuth();
  const [isManualSyncing, setIsManualSyncing] = React.useState(false);

  const handleManualSync = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) return;
    setIsManualSyncing(true);
    try {
      await triggerSync();
    } finally {
      setIsManualSyncing(false);
    }
  };

  if (!isConfigured) {
    return (
      <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-mono bg-[#171A24] border border-[#242938] text-[#9297A5] ${className}`}>
        <CloudOff className="w-3.5 h-3.5 text-[#636878]" />
        <span>Local Mode</span>
      </div>
    );
  }

  if (syncStatus === 'syncing' || isManualSyncing) {
    return (
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-mono bg-amber-950/40 border border-amber-500/30 text-amber-300 ${className}`}>
        <RefreshCw className="w-3 h-3 animate-spin text-amber-400" />
        <span>Syncing...</span>
      </div>
    );
  }

  if (syncStatus === 'offline') {
    return (
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-mono bg-zinc-900 border border-zinc-700 text-zinc-400 ${className}`}>
        <CloudOff className="w-3.5 h-3.5 text-zinc-500" />
        <span>Offline (Local)</span>
      </div>
    );
  }

  if (syncStatus === 'error') {
    return (
      <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded text-[11px] font-mono bg-rose-950/40 border border-rose-500/30 text-rose-300 ${className}`}>
        <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
        <span>Sync Alert</span>
        {showButton && isAuthenticated && (
          <button
            type="button"
            onClick={handleManualSync}
            className="underline hover:text-rose-100 text-[10px] font-sans"
          >
            Retry
          </button>
        )}
      </div>
    );
  }

  if (isAuthenticated && syncStatus === 'synced') {
    return (
      <div className={`inline-flex items-center gap-2 ${className}`}>
        <div
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-mono bg-emerald-950/40 border border-emerald-500/30 text-emerald-300"
          title={lastSyncedAt ? `Last cloud sync: ${formatRelativeDate(lastSyncedAt)}` : 'Cloud Synced'}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Synced</span>
        </div>
        {showButton && (
          <button
            type="button"
            onClick={handleManualSync}
            className="p-1 text-[#9297A5] hover:text-[#D6B36A] hover:bg-[#171A24] rounded border border-[#242938] transition-colors"
            title="Force cloud sync"
            aria-label="Force cloud sync"
          >
            <RefreshCw className="w-3 h-3" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-mono bg-[#171A24] border border-[#242938] text-[#9297A5] ${className}`}>
      <Cloud className="w-3.5 h-3.5 text-[#636878]" />
      <span>Cloud Ready</span>
    </div>
  );
};
