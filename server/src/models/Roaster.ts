import type { Roaster } from '../generated/prisma';

export type { Roaster };

export type CreateRoasterInput = {
    name: string;
};

export type UpdateRoasterInput = Partial<Pick<Roaster, 'name'>>;
