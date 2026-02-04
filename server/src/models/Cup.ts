import type { BrewMethod, Cup } from '../generated/prisma';

export type { Cup };

export type CreateCupInput = {
    coffeeId: string;
    rating: number;
    notes: string;
    grams: number;
    temperature: number;
    time: number;
    body: string;
    acidity: string;
    sweetness: string;
    bitterness: string;
    balance: string;
    aftertaste: string;
    aroma: string;
    brewMethod: BrewMethod; 
};

export type UpdateCupInput = Partial<Pick<Cup, 'rating' | 'notes' | 'grams' | 'temperature' | 'time' | 'body' | 'acidity' | 'sweetness' | 'bitterness' | 'balance' | 'aftertaste' | 'aroma' | 'brewMethod'>>;
