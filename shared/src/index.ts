// =============================================================================
// SHARED TYPES - Used by both frontend and backend
// =============================================================================

// -----------------------------------------------------------------------------
// ENUMS
// -----------------------------------------------------------------------------

export const RoastLevel = {
  LIGHT: 'LIGHT',
  MEDIUM: 'MEDIUM',
  MEDIUM_DARK: 'MEDIUM_DARK',
  DARK: 'DARK',
} as const;

export type RoastLevel = (typeof RoastLevel)[keyof typeof RoastLevel];

export const ProcessingMethod = {
  WASHED: 'WASHED',
  NATURAL: 'NATURAL',
  HONEY: 'HONEY',
  ANAEROBIC: 'ANAEROBIC',
  OTHER: 'OTHER',
} as const;

export type ProcessingMethod = (typeof ProcessingMethod)[keyof typeof ProcessingMethod];

export const BrewMethod = {
  FILTER: 'FILTER',
  ESPRESSO: 'ESPRESSO',
  POUR_OVER: 'POUR_OVER',
  AEROPRESS: 'AEROPRESS',
  CHEMEX: 'CHEMEX',
  V60: 'V60',
  FRENCH_PRESS: 'FRENCH_PRESS',
  MOKA: 'MOKA',
  OTHER: 'OTHER',
} as const;

export type BrewMethod = (typeof BrewMethod)[keyof typeof BrewMethod];

// -----------------------------------------------------------------------------
// BASE ENTITY TYPES
// -----------------------------------------------------------------------------

export interface User {
  id: string;
  clerkId: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface Roaster {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Cup {
  id: string;
  coffeeId: string;
  rating: number | null;
  notes: string | null;
  grams: number | null;
  temperature: number | null;
  time: number | null;
  body: string | null;
  acidity: string | null;
  sweetness: string | null;
  bitterness: string | null;
  balance: string | null;
  aftertaste: string | null;
  aroma: string | null;
  brewMethod: BrewMethod | null;
  createdAt: string;
  updatedAt: string;
}

export interface Coffee {
  id: string;
  userId: string;
  roasterId: string;
  name: string | null;
  roastLevel: RoastLevel;
  origin: string | null;
  processingMethod: ProcessingMethod | null;
  elevation: string | null;
  variety: string | null;
  notes: string | null;
  flavorProfile: string | null;
  rating: number | null;
  price: number | null;
  weight: number | null;
  createdAt: string;
  updatedAt: string;
  // Relations (optional, populated by API)
  roaster?: Roaster;
  user?: Pick<User, 'id' | 'name' | 'email'>;
  cups?: Cup[];
  _count?: {
    cups: number;
  };
}

// -----------------------------------------------------------------------------
// API INPUT TYPES
// -----------------------------------------------------------------------------

export interface CreateCoffeeInput {
  roasterId: string;
  name?: string;
  roastLevel: RoastLevel;
  origin?: string;
  processingMethod?: ProcessingMethod;
  elevation?: string;
  variety?: string;
  notes?: string;
  flavorProfile?: string;
  rating?: number;
  price?: number;
  weight?: number;
}

export interface UpdateCoffeeInput extends Partial<CreateCoffeeInput> {}

export interface CreateCupInput {
  coffeeId: string;
  rating?: number;
  notes?: string;
  grams?: number;
  temperature?: number;
  time?: number;
  body?: string;
  acidity?: string;
  sweetness?: string;
  bitterness?: string;
  balance?: string;
  aftertaste?: string;
  aroma?: string;
  brewMethod?: BrewMethod;
}

export interface UpdateCupInput extends Partial<Omit<CreateCupInput, 'coffeeId'>> {}

export interface CreateRoasterInput {
  name: string;
}

export interface UpdateRoasterInput extends Partial<CreateRoasterInput> {}

// -----------------------------------------------------------------------------
// API RESPONSE TYPES
// -----------------------------------------------------------------------------

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationInfo;
}

export interface SingleResponse<T> {
  data: T;
}

export interface ErrorResponse {
  error: string;
  message: string;
}

export interface CoffeeStats {
  total: number;
  averageRating: number | null;
  priceRange: {
    min: number | null;
    max: number | null;
  };
  byRoastLevel: Array<{
    roastLevel: RoastLevel;
    count: number;
    averageRating: number | null;
  }>;
  recentCoffees: Array<{
    id: string;
    name: string | null;
    createdAt: string;
  }>;
}

// -----------------------------------------------------------------------------
// API QUERY TYPES
// -----------------------------------------------------------------------------

export interface CoffeeQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  roastLevel?: RoastLevel;
}

export interface CupQueryParams {
  page?: number;
  limit?: number;
  coffeeId?: string;
}

// -----------------------------------------------------------------------------
// DISPLAY HELPERS - For Arabic UI
// -----------------------------------------------------------------------------

export const ROAST_LEVEL_LABELS: Record<RoastLevel, string> = {
  LIGHT: 'فاتح',
  MEDIUM: 'متوسط',
  MEDIUM_DARK: 'متوسط غامق',
  DARK: 'غامق',
};

export const PROCESSING_METHOD_LABELS: Record<ProcessingMethod, string> = {
  WASHED: 'مغسول',
  NATURAL: 'طبيعي',
  HONEY: 'عسلي',
  ANAEROBIC: 'لاهوائي',
  OTHER: 'أخرى',
};

export const BREW_METHOD_LABELS: Record<BrewMethod, string> = {
  FILTER: 'فلتر',
  ESPRESSO: 'إسبريسو',
  POUR_OVER: 'بور أوفر',
  AEROPRESS: 'ايروبريس',
  CHEMEX: 'كيمكس',
  V60: 'في60',
  FRENCH_PRESS: 'فرنش بريس',
  MOKA: 'موكا',
  OTHER: 'أخرى',
};

// Helper functions
export function getRoastLevelLabel(level: RoastLevel): string {
  return ROAST_LEVEL_LABELS[level];
}

export function getProcessingMethodLabel(method: ProcessingMethod): string {
  return PROCESSING_METHOD_LABELS[method];
}

export function getBrewMethodLabel(method: BrewMethod): string {
  return BREW_METHOD_LABELS[method];
}

// Taste notes (kept for UI)
export const TASTE_NOTES = [
  'شوكولاتة',
  'فواكه',
  'مكسرات',
  'زهري',
  'حمضي',
  'حلو',
  'مر',
  'كريمي',
  'توابل',
  'كراميل',
] as const;

export type TasteNote = (typeof TASTE_NOTES)[number];
