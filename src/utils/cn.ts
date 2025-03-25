import { ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * A utility function that merges Tailwind CSS classes without conflicts.
 * Uses clsx for conditional classes and tailwind-merge to handle conflicts.
 * 
 * @param inputs - Class values to merge together
 * @returns A string of merged Tailwind CSS classes
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}