import { Request, Response, NextFunction } from 'express';
import prisma from '../../lib/prisma';
import { Prisma } from '../../generated/prisma';

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

interface CreateCupBody {
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
  brewMethod?: 'FILTER' | 'ESPRESSO' | 'POUR_OVER' | 'AEROPRESS' | 'CHEMEX' | 'V60' | 'FRENCH_PRESS' | 'MOKA' | 'OTHER';
}

interface UpdateCupBody extends Partial<Omit<CreateCupBody, 'coffeeId'>> {}

interface CupQueryParams {
  page?: string;
  limit?: string;
  coffeeId?: string;
}

// =============================================================================
// CUP CONTROLLER
// =============================================================================

/**
 * GET ALL - Retrieve all cups with pagination (filtered by user's coffees)
 */
export const getAllCups = async (
  req: Request<{}, {}, {}, CupQueryParams>,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.dbUser!.id;
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '20', 10);
    const skip = (page - 1) * limit;

    // Build where clause - only cups from user's coffees
    const where: Prisma.CupWhereInput = {
      coffee: {
        userId, // Only cups from user's coffees
      },
    };

    // Filter by specific coffee if provided
    if (req.query.coffeeId) {
      where.coffeeId = req.query.coffeeId;
    }

    const [cups, total] = await Promise.all([
      prisma.cup.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          coffee: {
            select: {
              id: true,
              name: true,
              roaster: {
                select: { name: true },
              },
            },
          },
        },
      }),
      prisma.cup.count({ where }),
    ]);

    res.status(200).json({
      data: cups,
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
 * GET ONE - Retrieve a single cup by ID
 */
export const getCupById = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.dbUser!.id;

    const cup = await prisma.cup.findUnique({
      where: { id },
      include: {
        coffee: {
          select: {
            id: true,
            name: true,
            userId: true,
            roaster: {
              select: { name: true },
            },
          },
        },
      },
    });

    if (!cup) {
      return res.status(404).json({
        error: 'Not found',
        message: `Cup with id '${id}' not found`,
      });
    }

    // Authorization: User can only view cups from their coffees
    if (cup.coffee?.userId !== userId) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You do not have permission to view this cup',
      });
    }

    res.status(200).json({ data: cup });
  } catch (error) {
    next(error);
  }
};

/**
 * CREATE - Create a new cup
 */
export const createCup = async (
  req: Request<{}, {}, CreateCupBody>,
  res: Response,
  next: NextFunction
) => {
  console.log('createCup', req.body);
  try {
    const userId = req.dbUser!.id;
    const {
      coffeeId,
      rating,
      notes,
      grams,
      temperature,
      time,
      body,
      acidity,
      sweetness,
      bitterness,
      balance,
      aftertaste,
      aroma,
      brewMethod,
    } = req.body;

    if (!coffeeId) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'coffeeId is required',
      });
    }

    // Verify coffee exists and belongs to user
    const coffee = await prisma.coffee.findUnique({
      where: { id: coffeeId },
    });

    if (!coffee) {
      return res.status(404).json({
        error: 'Not found',
        message: `Coffee with id '${coffeeId}' not found`,
      });
    }

    if (coffee.userId !== userId) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only add cups to your own coffees',
      });
    }

    // Validate rating if provided
    if (rating !== undefined && (rating < 1 || rating > 10)) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Rating must be between 1 and 10',
      });
    }

    const cup = await prisma.cup.create({
      data: {
        coffeeId,
        rating,
        notes,
        grams: grams ? new Prisma.Decimal(grams) : undefined,
        temperature: temperature ? new Prisma.Decimal(temperature) : undefined,
        time: time ? new Prisma.Decimal(time) : undefined,
        body,
        acidity,
        sweetness,
        bitterness,
        balance,
        aftertaste,
        aroma,
        brewMethod,
      },
      include: {
        coffee: {
          select: {
            id: true,
            name: true,
            roaster: {
              select: { name: true },
            },
          },
        },
      },
    });

    res.status(201).json({ data: cup });
  } catch (error) {
    next(error);
  }
};

/**
 * UPDATE - Update an existing cup
 */
export const updateCup = async (
  req: Request<{ id: string }, {}, UpdateCupBody>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.dbUser!.id;
    const updateData = req.body;

    // Check if cup exists and user owns the coffee
    const existingCup = await prisma.cup.findUnique({
      where: { id },
      include: {
        coffee: {
          select: { userId: true },
        },
      },
    });

    if (!existingCup) {
      return res.status(404).json({
        error: 'Not found',
        message: `Cup with id '${id}' not found`,
      });
    }

    if (existingCup.coffee?.userId !== userId) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You do not have permission to update this cup',
      });
    }

    // Handle Decimal conversion
    const data: Prisma.CupUpdateInput = {
      ...updateData,
      grams: updateData.grams !== undefined
        ? new Prisma.Decimal(updateData.grams)
        : undefined,
      temperature: updateData.temperature !== undefined
        ? new Prisma.Decimal(updateData.temperature)
        : undefined,
      time: updateData.time !== undefined
        ? new Prisma.Decimal(updateData.time)
        : undefined,
    };

    // Remove undefined values
    Object.keys(data).forEach((key) => {
      if (data[key as keyof typeof data] === undefined) {
        delete data[key as keyof typeof data];
      }
    });

    const cup = await prisma.cup.update({
      where: { id },
      data,
      include: {
        coffee: {
          select: {
            id: true,
            name: true,
            roaster: {
              select: { name: true },
            },
          },
        },
      },
    });

    res.status(200).json({ data: cup });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE - Remove a cup
 */
export const deleteCup = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.dbUser!.id;

    // Check if cup exists and user owns the coffee
    const existingCup = await prisma.cup.findUnique({
      where: { id },
      include: {
        coffee: {
          select: { userId: true },
        },
      },
    });

    if (!existingCup) {
      return res.status(404).json({
        error: 'Not found',
        message: `Cup with id '${id}' not found`,
      });
    }

    if (existingCup.coffee?.userId !== userId) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You do not have permission to delete this cup',
      });
    }

    await prisma.cup.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export default {
  getAllCups,
  getCupById,
  createCup,
  updateCup,
  deleteCup,
};
