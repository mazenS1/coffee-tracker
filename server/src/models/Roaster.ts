import type { Roaster } from '../generated/prisma/client';

export type { Roaster };

export type CreateRoasterInput = {
    name: string;
};

export type UpdateRoasterInput = Partial<Pick<Roaster, 'name'>>;