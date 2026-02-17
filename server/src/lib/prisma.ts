import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL is required');
}

type PrismaGlobals = {
  pgPool?: Pool;
  prisma?: PrismaClient;
};

const globalForPrisma = globalThis as typeof globalThis & PrismaGlobals;

const pool = globalForPrisma.pgPool ?? new Pool({
  connectionString: databaseUrl,
  max: Number(process.env.PG_POOL_MAX ?? 5),
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 10000,
});

if (!globalForPrisma.pgPool) {
  pool.on('error', (error) => {
    console.error('Postgres pool error:', error);
  });
}

const prisma = globalForPrisma.prisma ?? new PrismaClient({
  adapter: new PrismaPg(pool),
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.pgPool = pool;
  globalForPrisma.prisma = prisma;
}

export default prisma;
