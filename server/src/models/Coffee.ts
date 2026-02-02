import type { Coffee, ProcessingMethod, RoastLevel
 } from '../generated/prisma/client';

export type {Coffee}

export type CreateCoffeeInput = {
    userId: string;
    roasterId: string;
    name: string;
    roastLevel: RoastLevel;
    origin: string;
    processingMethod: ProcessingMethod;
    elevation: string;
    variety: string;
    notes: string;
    flavorProfile: string;
    rating: number;
    price: number;
    weight: number;
};

export type UpdateCoffeeInput = Partial<Pick<Coffee, 'name' | 'roastLevel' | 'origin' | 'processingMethod' | 'elevation' | 'variety' | 'notes' | 'flavorProfile' | 'rating' | 'price' | 'weight'>>;