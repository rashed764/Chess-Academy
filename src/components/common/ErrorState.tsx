import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { cn } from '../../utils/cn';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Service Unavailable',
  message,
  onRetry,
  className,
}) => {
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center justify-center p-6 rounded-xl border border-red-500/20 bg-red-950/10 text-center max-w-md mx-auto',
        className
      )}
    >
      <div className="w-10 h-10 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center mb-3">
        <AlertCircle className="w-5 h-5" aria-hidden="true" />
      </div>
      <h3 className="text-sm font-semibold text-red-200 mb-1">{title}</h3>
      <p className="text-xs text-[#9297A5] mb-4 max-w-xs">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#1D2230] text-[#F4F4F5] hover:bg-[#242938] border border-[#242938] transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
          Retry Request
        </button>
      )}
    </div>
  );
};
