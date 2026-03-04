import { Request, Response, NextFunction } from 'express';
import prisma from '../../lib/prisma';
import { Prisma } from '../../generated/prisma';
import { pickAllowedFields } from '../../utils/pickAllowedFields';

// =============================================================================
// CONTROLLER GUIDE - Everything you need to know about writing controllers
// =============================================================================

// -----------------------------------------------------------------------------
// 1. TYPE DEFINITIONS
// -----------------------------------------------------------------------------
// Define types for your request bodies and query params for type safety.
// This helps catch errors at compile time and provides better IDE support.

// Note: userId is now obtained from authentication (req.dbUser), not from request body
interface CreateCoffeeBody {
  roasterId: string;
  name?: string;
  roastLevel: 'LIGHT' | 'MEDIUM' | 'MEDIUM_DARK' | 'DARK';
  origin?: string;
  processingMethod?: 'WASHED' | 'NATURAL' | 'HONEY' | 'ANAEROBIC' | 'OTHER';
  elevation?: string;
  variety?: string;
  notes?: string;
  flavorProfile?: string;
  rating?: number;
  price?: number;
  weight?: number;
}

interface UpdateCoffeeBody extends Partial<CreateCoffeeBody> {}

interface BulkCreateCoffeeBody {
  roasterId: string;
  name?: string;
  roastLevel: 'LIGHT' | 'MEDIUM' | 'MEDIUM_DARK' | 'DARK';
  origin?: string;
  processingMethod?: 'WASHED' | 'NATURAL' | 'HONEY' | 'ANAEROBIC' | 'OTHER';
  elevation?: string;
  variety?: string;
  notes?: string;
  flavorProfile?: string;
  rating?: number;
  price?: number;
  weight?: number;
}

interface CoffeeQueryParams {
  page?: string;
  limit?: string;
  search?: string;
  roastLevel?: string;
  // Note: userId filter removed - users can only see their own coffees
}

const buildRoasterVisibilityFilter = (userId: string): Prisma.RoasterWhereInput => ({
  OR: [{ userId }, { userId: null }],
});

const parsePositiveInt = (
  value: string | undefined,
  fallback: number,
  max: number
) => {
  const parsed = Number.parseInt(value ?? '', 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(1, parsed));
};

const COFFEE_UPDATE_FIELDS: readonly (keyof UpdateCoffeeBody)[] = [
  'roasterId',
  'name',
  'roastLevel',
  'origin',
  'processingMethod',
  'elevation',
  'variety',
  'notes',
  'flavorProfile',
  'rating',
  'price',
  'weight',
] as const;

// -----------------------------------------------------------------------------
// 2. BASIC CRUD OPERATIONS
// -----------------------------------------------------------------------------

/**
 * GET ALL - Retrieve multiple records with pagination, filtering, and search
 * 
 * Key concepts:
 * - Pagination with page/limit
 * - Filtering with query params
 * - Search across multiple fields
 * - Sorting
 * - Including related data
 * - Users can only see their own coffees (enforced by auth)
 */
export const getAllCoffees = async (
  req: Request<{}, {}, {}, CoffeeQueryParams>,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get authenticated user from middleware
    const userId = req.dbUser!.id;

    // Parse pagination params with defaults
    const page = parsePositiveInt(req.query.page, 1, 10_000);
    const limit = parsePositiveInt(req.query.limit, 10, 100);
    const skip = (page - 1) * limit;

    // Build dynamic where clause for filtering
    // Always filter by the authenticated user's ID
    const where: Prisma.CoffeeWhereInput = {
      userId, // Users can only see their own coffees
    };

    // Filter by roast level if provided
    if (req.query.roastLevel) {
      where.roastLevel = req.query.roastLevel as any;
    }

    // Search across multiple fields using OR
    if (req.query.search) {
      where.AND = [
        {
          OR: [
            { name: { contains: req.query.search, mode: 'insensitive' } },
            { origin: { contains: req.query.search, mode: 'insensitive' } },
            { notes: { contains: req.query.search, mode: 'insensitive' } },
          ],
        },
      ];
    }

    // Execute query with pagination and include related data
    const [coffees, total] = await Promise.all([
      prisma.coffee.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }, // Sort by newest first
        include: {
          roaster: true,  // Include related roaster
          _count: {       // Include count of related cups
            select: { cups: true },
          },
        },
      }),
      prisma.coffee.count({ where }), // Total count for pagination
    ]);

    // Return paginated response with metadata
    res.status(200).json({
      data: coffees,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
    });
  } catch (error) {
    // Pass errors to the error handler middleware
    next(error);
  }
};

/**
 * GET ONE - Retrieve a single record by ID
 * 
 * Key concepts:
 * - Path parameters (req.params)
 * - 404 handling when record not found
 * - Including nested relations
 * - Authorization check (user can only view their own coffee)
 */
export const getCoffeeById = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.dbUser!.id;

    if (!id || id.length < 20) {
        return res.status(400).json({
          error: 'Validation error',
          message: 'Invalid id format',
        });
      }

    const coffee = await prisma.coffee.findUnique({
      where: { id },
      include: {
        roaster: true,
        cups: {
          orderBy: { createdAt: 'desc' },
          take: 10, // Limit nested results
        },
      },
    });

    // Always check if record exists
    if (!coffee) {
      return res.status(404).json({
        error: 'Not found',
        message: `Coffee with id '${id}' not found`,
      });
    }

    // Authorization: Users can only view their own coffees
    if (coffee.userId !== userId) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You do not have permission to view this coffee',
      });
    }

    res.status(200).json({ data: coffee });
  } catch (error) {
    next(error);
  }
};

/**
 * CREATE - Create a new record
 * 
 * Key concepts:
 * - Request body validation
 * - 201 status for created resources
 * - Handling unique constraint violations
 * - Returning the created record
 * - userId comes from authentication, not request body
 */
export const createCoffee = async (
  req: Request<{}, {}, CreateCoffeeBody>,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get authenticated user's database ID from middleware
    const userId = req.dbUser!.id;

    const {
      roasterId,
      name,
      roastLevel,
      origin,
      processingMethod,
      elevation,
      variety,
      notes,
      flavorProfile,
      rating,
      price,
      weight,
    } = req.body;

    // Basic validation (consider using a library like Zod or Joi for complex validation)
    if (!roasterId) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'roasterId is required',
      });
    }

    // Validate roastLevel is provided and is a valid enum value
    const validRoastLevels = ['LIGHT', 'MEDIUM', 'MEDIUM_DARK', 'DARK'];
    if (!roastLevel || !validRoastLevels.includes(roastLevel)) {
      return res.status(400).json({
        error: 'Validation error',
        message: `roastLevel is required and must be one of: ${validRoastLevels.join(', ')}`,
      });
    }

    // Validate rating range if provided
    if (rating !== undefined && (rating < 1 || rating > 10)) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Rating must be between 1 and 10',
      });
    }

    // Verify that roaster exists (foreign key check)
    // No need to verify user - they're authenticated
    const roasterExists = await prisma.roaster.findFirst({
      where: {
        AND: [{ id: roasterId }, buildRoasterVisibilityFilter(userId)],
      },
    });

    if (!roasterExists) {
      return res.status(400).json({
        error: 'Validation error',
        message: `Roaster with id '${roasterId}' not found or not accessible`,
      });
    }

    // Create the record
    const coffee = await prisma.coffee.create({
      data: {
        userId, // From authentication
        roasterId,
        name,
        roastLevel,
        origin,
        processingMethod,
        elevation,
        variety,
        notes,
        flavorProfile,
        rating,
        price: price !== undefined ? new Prisma.Decimal(price) : undefined,
        weight: weight !== undefined ? new Prisma.Decimal(weight) : undefined,
      },
      include: {
        roaster: true,
      },
    });

    // 201 = Created
    res.status(201).json({ data: coffee });
  } catch (error) {
    // Handle specific Prisma errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // P2002 = Unique constraint violation
      if (error.code === 'P2002') {
        return res.status(409).json({
          error: 'Conflict',
          message: 'A record with these values already exists',
        });
      }
      // P2003 = Foreign key constraint violation
      if (error.code === 'P2003') {
        return res.status(400).json({
          error: 'Validation error',
          message: 'Referenced record does not exist',
        });
      }
    }
    next(error);
  }
};

/**
 * UPDATE - Update an existing record
 * 
 * Key concepts:
 * - Partial updates (PATCH semantics)
 * - Check existence before updating
 * - Handle concurrent modification
 * - Authorization check (user can only update their own coffee)
 */
export const updateCoffee = async (
  req: Request<{ id: string }, {}, UpdateCoffeeBody>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.dbUser!.id;

    if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Request body must be a JSON object',
      });
    }

    const { picked: updateData, unknownKeys } = pickAllowedFields<UpdateCoffeeBody>(
      req.body,
      COFFEE_UPDATE_FIELDS
    );

    if (unknownKeys.length > 0) {
      return res.status(400).json({
        error: 'Validation error',
        message: `Unknown fields in payload: ${unknownKeys.join(', ')}`,
      });
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'At least one valid field is required for update',
      });
    }

    // Check if record exists first
    const existingCoffee = await prisma.coffee.findUnique({
      where: { id },
    });

    if (!existingCoffee) {
      return res.status(404).json({
        error: 'Not found',
        message: `Coffee with id '${id}' not found`,
      });
    }

    // Authorization: Users can only update their own coffees
    if (existingCoffee.userId !== userId) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You do not have permission to update this coffee',
      });
    }

    if (updateData.roasterId) {
      const roasterExists = await prisma.roaster.findFirst({
        where: {
          AND: [{ id: updateData.roasterId }, buildRoasterVisibilityFilter(userId)],
        },
      });

      if (!roasterExists) {
        return res.status(400).json({
          error: 'Validation error',
          message: `Roaster with id '${updateData.roasterId}' not found or not accessible`,
        });
      }
    }

    // Handle Decimal conversion for price and weight
    const data: Prisma.CoffeeUpdateInput = {
      ...updateData,
      price: updateData.price !== undefined
        ? new Prisma.Decimal(updateData.price)
        : undefined,
      weight: updateData.weight !== undefined
        ? new Prisma.Decimal(updateData.weight)
        : undefined,
    };

    // Remove undefined values to avoid overwriting with null
    Object.keys(data).forEach((key) => {
      if (data[key as keyof typeof data] === undefined) {
        delete data[key as keyof typeof data];
      }
    });

    const coffee = await prisma.coffee.update({
      where: { id },
      data,
      include: {
        roaster: true,
      },
    });

    res.status(200).json({ data: coffee });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // P2025 = Record not found (race condition)
      if (error.code === 'P2025') {
        return res.status(404).json({
          error: 'Not found',
          message: 'Record was deleted by another process',
        });
      }
    }
    next(error);
  }
};

/**
 * DELETE - Remove a record
 * 
 * Key concepts:
 * - 204 No Content for successful deletion
 * - Check existence before deleting
 * - Handle cascade delete implications
 * - Authorization check (user can only delete their own coffee)
 */
export const deleteCoffee = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.dbUser!.id;

    // Check if record exists
    const existingCoffee = await prisma.coffee.findUnique({
      where: { id },
      include: { _count: { select: { cups: true } } },
    });

    if (!existingCoffee) {
      return res.status(404).json({
        error: 'Not found',
        message: `Coffee with id '${id}' not found`,
      });
    }

    // Authorization: Users can only delete their own coffees
    if (existingCoffee.userId !== userId) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You do not have permission to delete this coffee',
      });
    }

    // Optionally warn about related records that will be affected
    // (depending on your cascade settings in Prisma schema)
    if (existingCoffee._count.cups > 0) {
      // Option 1: Prevent deletion
      // return res.status(409).json({
      //   error: 'Conflict',
      //   message: `Cannot delete coffee with ${existingCoffee._count.cups} associated cups`,
      // });

      // Option 2: Delete related records first (if not using cascade)
      await prisma.cup.deleteMany({ where: { coffeeId: id } });
    }

    await prisma.coffee.delete({ where: { id } });

    // 204 = No Content (successful deletion with no response body)
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

// -----------------------------------------------------------------------------
// 3. ADVANCED PATTERNS
// -----------------------------------------------------------------------------

/**
 * BULK OPERATIONS - Create or update multiple records
 * 
 * Key concepts:
 * - Transactions for atomic operations
 * - createMany for bulk inserts
 * - userId comes from authentication for all records
 */
export const bulkCreateCoffees = async (
  req: Request<{}, {}, { coffees: BulkCreateCoffeeBody[] }>,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get authenticated user's database ID from middleware
    const userId = req.dbUser!.id;

    const { coffees } = req.body;

    if (!Array.isArray(coffees) || coffees.length === 0) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Request body must contain a non-empty coffees array',
      });
    }

    const roasterIds = Array.from(new Set(coffees.map((coffee) => coffee.roasterId)));
    const accessibleRoasters = await prisma.roaster.findMany({
      where: {
        AND: [{ id: { in: roasterIds } }, buildRoasterVisibilityFilter(userId)],
      },
      select: { id: true },
    });

    if (accessibleRoasters.length !== roasterIds.length) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'One or more roasterIds are invalid or not accessible',
      });
    }

    // Use transaction for atomic operation
    const result = await prisma.$transaction(async (tx) => {
      const created = await tx.coffee.createMany({
        data: coffees.map((c) => ({
          userId, // All coffees belong to the authenticated user
          roasterId: c.roasterId,
          name: c.name,
          roastLevel: c.roastLevel,
          origin: c.origin,
          processingMethod: c.processingMethod,
          elevation: c.elevation,
          variety: c.variety,
          notes: c.notes,
          flavorProfile: c.flavorProfile,
          rating: c.rating,
          price: c.price !== undefined ? new Prisma.Decimal(c.price) : undefined,
          weight: c.weight !== undefined ? new Prisma.Decimal(c.weight) : undefined,
        })),
        skipDuplicates: true, // Skip records that would violate unique constraints
      });

      return created;
    });

    res.status(201).json({
      data: { count: result.count },
      message: `Successfully created ${result.count} coffees`,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * AGGREGATION - Statistics and summaries
 * 
 * Key concepts:
 * - Prisma aggregate functions
 * - groupBy for grouped statistics
 * - Statistics are scoped to the authenticated user's coffees
 */
export const getCoffeeStats = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get authenticated user's database ID from middleware
    const userId = req.dbUser!.id;

    // Stats are always filtered to the authenticated user's coffees
    const where: Prisma.CoffeeWhereInput = { userId };

    // Get aggregate statistics
    const [stats, byRoastLevel, recentCoffees] = await Promise.all([
      // Overall stats
      prisma.coffee.aggregate({
        where,
        _count: { id: true },
        _avg: { rating: true },
        _min: { price: true },
        _max: { price: true },
      }),

      // Group by roast level
      prisma.coffee.groupBy({
        by: ['roastLevel'],
        where,
        _count: { id: true },
        _avg: { rating: true },
      }),

      // Most recent coffees
      prisma.coffee.findMany({
        where,
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, createdAt: true },
      }),
    ]);

    res.status(200).json({
      data: {
        total: stats._count.id,
        averageRating: stats._avg.rating,
        priceRange: {
          min: stats._min.price,
          max: stats._max.price,
        },
        byRoastLevel: byRoastLevel.map((item) => ({
          roastLevel: item.roastLevel,
          count: item._count.id,
          averageRating: item._avg.rating,
        })),
        recentCoffees,
      },
    });
  } catch (error) {
    next(error);
  }
};

// -----------------------------------------------------------------------------
// 4. HTTP STATUS CODES REFERENCE
// -----------------------------------------------------------------------------
// 200 OK           - Successful GET, PUT, PATCH
// 201 Created      - Successful POST (resource created)
// 204 No Content   - Successful DELETE
// 400 Bad Request  - Invalid request body or params
// 401 Unauthorized - Missing or invalid authentication
// 403 Forbidden    - Authenticated but not authorized
// 404 Not Found    - Resource doesn't exist
// 409 Conflict     - Resource conflict (e.g., duplicate)
// 422 Unprocessable- Validation errors
// 500 Server Error - Unexpected server error

// -----------------------------------------------------------------------------
// 5. EXPORT ALL HANDLERS
// -----------------------------------------------------------------------------
// You can export as named exports (shown above) or as an object:

export default {
  getAllCoffees,
  getCoffeeById,
  createCoffee,
  updateCoffee,
  deleteCoffee,
  bulkCreateCoffees,
  getCoffeeStats,
};
