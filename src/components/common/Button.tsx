import React, { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D6B36A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0D14] disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none active:scale-[0.98]',
  {
    variants: {
      variant: {
        primary:
          'bg-[#D6B36A] text-[#0B0D14] font-semibold hover:bg-[#E8CF96] shadow-md shadow-[#D6B36A]/10',
        secondary:
          'bg-[#1D2230] text-[#F4F4F5] hover:bg-[#242938] border border-[#242938]',
        outline:
          'border border-[#242938] bg-transparent text-[#F4F4F5] hover:bg-[#171A24] hover:border-[#D6B36A]/40',
        ghost:
          'text-[#9297A5] hover:text-[#F4F4F5] hover:bg-[#171A24]',
        danger:
          'bg-red-600/90 text-white hover:bg-red-500 shadow-sm shadow-red-900/20',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-6 text-base font-semibold',
        icon: 'h-9 w-9 p-0',
      },
    },
    defaultVariants: {
      variant: 'secondary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      >
        {isLoading && (
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
