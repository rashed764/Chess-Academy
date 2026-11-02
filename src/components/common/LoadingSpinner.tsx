import React from 'react';
import { cn } from '../../utils/cn';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  label = 'Loading Chess Academy...',
  className,
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-3',
  };

  return (
    <div
      role="status"
      aria-label={label}
      className={cn('flex flex-col items-center justify-center gap-3 p-6', className)}
    >
      <div
        className={cn(
          'rounded-full border-[#242938] border-t-[#D6B36A] animate-spin',
          sizeClasses[size]
        )}
      />
      {label && <span className="text-xs font-medium text-[#9297A5] tracking-wide">{label}</span>}
      <span className="sr-only">{label}</span>
    </div>
  );
};
