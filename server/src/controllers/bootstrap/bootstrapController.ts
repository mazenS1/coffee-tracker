import { Request, Response, NextFunction } from 'express';
import { Prisma } from '../../generated/prisma';
import prisma from '../../lib/prisma';
import { getRoastersWithCache } from '../../lib/roasterCache';

interface BootstrapQueryParams {
  limit?: string;
  cursor?: string;
  includeRoasters?: string;
}

type CursorPayload = {
  id: string;
  createdAt: string;
};

const parsePositiveInt = (
  value: string | undefined,
  fallback: number,
  max: number
) => {
  const parsed = Number.parseInt(value ?? '', 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(1, parsed));
};

const parseBoolean = (value: string | undefined, fallback: boolean): boolean => {
  if (value === undefined) return fallback;
  const normalized = value.trim().toLowerCase();
  if (normalized === 'true' || normalized === '1') return true;
  if (normalized === 'false' || normalized === '0') return false;
  return fallback;
};

const decodeCursor = (cursor: string): CursorPayload | null => {
  try {
    const decoded = Buffer.from(cursor, 'base64url').toString('utf8');
    const parsed = JSON.parse(decoded) as Partial<CursorPayload>;

    if (
      typeof parsed.id !== 'string' ||
      !parsed.id ||
      typeof parsed.createdAt !== 'string' ||
      Number.isNaN(Date.parse(parsed.createdAt))
    ) {
      return null;
    }

    return { id: parsed.id, createdAt: parsed.createdAt };
  } catch {
    return null;
  }
};

const encodeCursor = (payload: CursorPayload): string =>
  Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');

const buildRoasterVisibilityFilter = (
  userId: string
): Prisma.RoasterWhereInput => ({
  OR: [{ userId }, { userId: null }],
});

export const getBootstrapData = async (
  req: Request<{}, {}, {}, BootstrapQueryParams>,
  res: Response,
  next: NextFunction
) => {
  const totalStartedAt = Date.now();

  try {
    const userId = req.dbUser!.id;
    const limit = parsePositiveInt(req.query.limit, 20, 50);
    const includeRoasters = parseBoolean(req.query.includeRoasters, false);

    const whereAnd: Prisma.CoffeeWhereInput[] = [{ userId }];
    if (req.query.cursor) {
      const cursor = decodeCursor(req.query.cursor);

      if (!cursor) {
        return res.status(400).json({
          error: 'Validation error',
          message: 'Invalid cursor',
        });
      }

      const createdAt = new Date(cursor.createdAt);
      whereAnd.push({
        OR: [
          { createdAt: { lt: createdAt } },
          {
            AND: [{ createdAt }, { id: { lt: cursor.id } }],
          },
        ],
      });
    }

    const coffeeQueryStartedAt = Date.now();
    const coffees = await prisma.coffee.findMany({
      where: { AND: whereAnd },
      take: limit + 1,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      include: {
        roaster: {
          select: {
            id: true,
            name: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        _count: {
          select: {
            cups: true,
          },
        },
      },
    });
    const coffeeQueryMs = Date.now() - coffeeQueryStartedAt;

    const hasMore = coffees.length > limit;
    const pageItems = hasMore ? coffees.slice(0, limit) : coffees;
    const lastItem = pageItems.length > 0 ? pageItems[pageItems.length - 1] : null;
    const nextCursor = hasMore && lastItem
      ? encodeCursor({
          id: lastItem.id,
          createdAt: lastItem.createdAt.toISOString(),
        })
      : null;

    let roastersFromCache: boolean | undefined;
    let roasters:
      | Array<{
          id: string;
          name: string;
          createdAt: Date;
          updatedAt: Date;
          userId: string | null;
        }>
      | undefined;
    let roasterQueryMs = 0;

    if (includeRoasters) {
      const roasterQueryStartedAt = Date.now();
      const cacheKey = `bootstrap:roasters:${userId}`;
      const cachedRoasters = await getRoastersWithCache(cacheKey, async () =>
        prisma.roaster.findMany({
          where: buildRoasterVisibilityFilter(userId),
          orderBy: { name: 'asc' },
        })
      );
      roasterQueryMs = Date.now() - roasterQueryStartedAt;
      roasters = cachedRoasters.value;
      roastersFromCache = cachedRoasters.fromCache;
    }

    const totalMs = Date.now() - totalStartedAt;
    console.info('[bootstrap] request timing', {
      path: req.originalUrl,
      includeRoasters,
      userId,
      coffeeQueryMs,
      roasterQueryMs,
      totalMs,
      count: pageItems.length,
    });

    res.status(200).json({
      data: {
        coffees: pageItems,
        ...(includeRoasters ? { roasters } : {}),
      },
      page: {
        nextCursor,
        hasMore,
      },
      meta: {
        generatedAt: new Date().toISOString(),
        ...(includeRoasters ? { roastersFromCache } : {}),
      },
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getBootstrapData,
};
