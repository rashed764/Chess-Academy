import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium tracking-wide transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-[#1D2230] text-[#F4F4F5] border border-[#242938]',
        gold: 'bg-[#D6B36A]/15 text-[#E8CF96] border border-[#D6B36A]/30',
        success: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30',
        warning: 'bg-amber-500/15 text-amber-300 border border-amber-500/30',
        outline: 'border border-[#242938] text-[#9297A5]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export const Badge: React.FC<BadgeProps> = ({ className, variant, ...props }) => {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
};
