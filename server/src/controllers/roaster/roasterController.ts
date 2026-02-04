import { Request, Response, NextFunction } from 'express';
import prisma from '../../lib/prisma';
import { Prisma } from '../../generated/prisma';

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

interface CreateRoasterBody {
  name: string;
}

interface UpdateRoasterBody {
  name?: string;
}

interface RoasterQueryParams {
  page?: string;
  limit?: string;
  search?: string;
}

const parseEnvList = (value?: string): string[] =>
  value
    ? value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
    : [];

const adminEmails = parseEnvList(process.env.ROASTER_ADMIN_EMAILS).map((email) =>
  email.toLowerCase()
);
const adminClerkIds = parseEnvList(process.env.ROASTER_ADMIN_CLERK_IDS);

const isRoasterAdmin = (req: Request) => {
  const user = req.dbUser;
  if (!user) return false;

  return (
    adminEmails.includes(user.email.toLowerCase()) ||
    adminClerkIds.includes(user.clerkId)
  );
};

const buildRoasterVisibilityFilter = (userId: string): Prisma.RoasterWhereInput => ({
  OR: [{ userId }, { userId: null }],
});

const isRoasterVisibleToUser = (
  roaster: { userId: string | null },
  userId: string
) => roaster.userId === null || roaster.userId === userId;

// =============================================================================
// ROASTER CONTROLLER
// =============================================================================

/**
 * GET ALL - Retrieve all roasters with pagination
 */
export const getAllRoasters = async (
  req: Request<{}, {}, {}, RoasterQueryParams>,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.dbUser!.id;
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '50', 10);
    const skip = (page - 1) * limit;

    const visibilityFilter = buildRoasterVisibilityFilter(userId);
    const where: Prisma.RoasterWhereInput = req.query.search
      ? {
          AND: [
            visibilityFilter,
            { name: { contains: req.query.search, mode: 'insensitive' } },
          ],
        }
      : visibilityFilter;

    const [roasters, total] = await Promise.all([
      prisma.roaster.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      prisma.roaster.count({ where }),
    ]);

    res.status(200).json({
      data: roasters,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET ONE - Retrieve a single roaster by ID
 */
export const getRoasterById = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.dbUser!.id;

    const roaster = await prisma.roaster.findUnique({
      where: { id },
      include: {
        _count: {
          select: { coffees: true },
        },
      },
    });

    if (!roaster) {
      return res.status(404).json({
        error: 'Not found',
        message: `Roaster with id '${id}' not found`,
      });
    }

    if (!isRoasterVisibleToUser(roaster, userId)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You do not have permission to view this roaster',
      });
    }

    res.status(200).json({ data: roaster });
  } catch (error) {
    next(error);
  }
};

/**
 * CREATE - Create a new roaster
 */
export const createRoaster = async (
  req: Request<{}, {}, CreateRoasterBody>,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.dbUser!.id;
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Name is required',
      });
    }

    const roaster = await prisma.roaster.create({
      data: {
        name: name.trim(),
        userId: isRoasterAdmin(req) ? null : userId,
      },
    });

    res.status(201).json({ data: roaster });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return res.status(409).json({
          error: 'Conflict',
          message: 'A roaster with this name already exists',
        });
      }
    }
    next(error);
  }
};

/**
 * UPDATE - Update an existing roaster
 */
export const updateRoaster = async (
  req: Request<{ id: string }, {}, UpdateRoasterBody>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.dbUser!.id;
    const { name } = req.body;
    const isAdmin = isRoasterAdmin(req);

    const existing = await prisma.roaster.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({
        error: 'Not found',
        message: `Roaster with id '${id}' not found`,
      });
    }

    if (existing.userId === null && !isAdmin) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You do not have permission to update default roasters',
      });
    }

    if (existing.userId && existing.userId !== userId) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You do not have permission to update this roaster',
      });
    }

    const roaster = await prisma.roaster.update({
      where: { id },
      data: { name: name?.trim() },
    });

    res.status(200).json({ data: roaster });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE - Remove a roaster
 */
export const deleteRoaster = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.dbUser!.id;
    const isAdmin = isRoasterAdmin(req);

    const existing = await prisma.roaster.findUnique({
      where: { id },
      include: { _count: { select: { coffees: true } } },
    });

    if (!existing) {
      return res.status(404).json({
        error: 'Not found',
        message: `Roaster with id '${id}' not found`,
      });
    }

    if (existing.userId === null && !isAdmin) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You do not have permission to delete default roasters',
      });
    }

    if (existing.userId && existing.userId !== userId) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You do not have permission to delete this roaster',
      });
    }

    if (existing._count.coffees > 0) {
      return res.status(409).json({
        error: 'Conflict',
        message: `Cannot delete roaster with ${existing._count.coffees} associated coffees`,
      });
    }

    await prisma.roaster.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export default {
  getAllRoasters,
  getRoasterById,
  createRoaster,
  updateRoaster,
  deleteRoaster,
};
