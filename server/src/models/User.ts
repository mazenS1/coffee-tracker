import type { User } from '../generated/prisma';

export type { User };

export type CreateUserInput = {
  clerkId: string;
  name: string;
  email: string;
};

export type UpdateUserInput = Partial<Pick<User, 'name' | 'email'>>;
