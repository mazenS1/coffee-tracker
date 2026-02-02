import { Request, Response, NextFunction } from 'express';
import prisma from '../../lib/prisma';
import { Prisma } from '../../generated/prisma/client';

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
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '50', 10);
    const skip = (page - 1) * limit;

    const where: Prisma.RoasterWhereInput = {};

    if (req.query.search) {
      where.name = { contains: req.query.search, mode: 'insensitive' };
    }

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
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Name is required',
      });
    }

    const roaster = await prisma.roaster.create({
      data: { name: name.trim() },
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
    const { name } = req.body;

    const existing = await prisma.roaster.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({
        error: 'Not found',
        message: `Roaster with id '${id}' not found`,
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
