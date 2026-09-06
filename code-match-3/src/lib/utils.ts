/**
 * src/lib/utils.ts — Shared utility functions
 *
 * `cn()` merges conditional class names using clsx + tailwind-merge.
 * This is the canonical utility used by all shadcn-vue components.
 */

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
