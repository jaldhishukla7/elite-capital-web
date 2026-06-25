import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merges Tailwind classes safely, resolving conflicts (e.g. px-2 vs px-4)
 * in favor of the later class. Standard utility used across shadcn/ui-style
 * component patterns.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
