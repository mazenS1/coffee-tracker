// Re-export all shared types
export * from '@coffee-tracker/shared';

// UI-specific extensions
import type { Coffee, Cup } from '@coffee-tracker/shared';

// Extended coffee type with UI-only properties (for local state)
export interface CoffeeWithUI extends Coffee {
  // Local-only fields
  imageUrl?: string;
}

// Extended cup type for UI display
export interface CupWithUI extends Cup {
  // Can add any UI-specific extensions here
}

// Grind sizes for UI selection (these are UI-only, not stored in DB as enum)
export const GRIND_SIZES = [
  'ناعم جداً',
  'ناعم',
  'متوسط ناعم',
  'متوسط',
  'متوسط خشن',
  'خشن',
] as const;

export type GrindSize = (typeof GRIND_SIZES)[number];
