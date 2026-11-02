import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Standard utility function for conditionally combining Tailwind CSS class names
 * with collision resolution. Compatible with shadcn/ui component patterns.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
