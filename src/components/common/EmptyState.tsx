import React, { type ReactNode } from 'react';
import { Inbox } from 'lucide-react';
import { cn } from '../../utils/cn';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  action,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 rounded-xl border border-dashed border-[#242938] bg-[#10121B]/60 text-center max-w-lg mx-auto',
        className
      )}
    >
      <div className="w-12 h-12 rounded-xl bg-[#1D2230] text-[#D6B36A] flex items-center justify-center mb-4 border border-[#242938]">
        {icon || <Inbox className="w-6 h-6" aria-hidden="true" />}
      </div>
      <h3 className="text-base font-semibold text-[#F4F4F5] mb-1 font-cinzel">{title}</h3>
      <p className="text-sm text-[#9297A5] max-w-sm mb-5 leading-relaxed">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
};
