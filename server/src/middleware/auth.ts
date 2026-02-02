import { Request, Response, NextFunction } from 'express';
import { clerkMiddleware, getAuth, requireAuth as clerkRequireAuth } from '@clerk/express';
import prisma from '../lib/prisma';

// =============================================================================
// CLERK AUTHENTICATION MIDDLEWARE
// =============================================================================

// Re-export Clerk's middleware for use in app.ts
export { clerkMiddleware, clerkRequireAuth as requireAuth };

// -----------------------------------------------------------------------------
// TYPE EXTENSIONS
// -----------------------------------------------------------------------------

// Extend Express Request to include the database user
declare global {
  namespace Express {
    interface Request {
      dbUser?: {
        id: string;
        clerkId: string;
        name: string;
        email: string;
      };
    }
  }
}

// -----------------------------------------------------------------------------
// MIDDLEWARE: Attach Database User
// -----------------------------------------------------------------------------
/**
 * Middleware that looks up the database user by Clerk ID and attaches it to the request.
 * Must be used AFTER clerkMiddleware() and requireAuth().
 * 
 * This allows controllers to access req.dbUser.id for database operations
 * instead of looking up the user in every controller.
 * 
 * Note: requireAuth() already ensures the user is authenticated, so we don't
 * need to check auth.userId here - it's guaranteed to exist.
 */
export const attachDbUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const auth = getAuth(req);
    // requireAuth() - Redirects unauthenticated users to sign-in
    const clerkUserId = auth.userId!;
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
      select: {
        id: true,
        clerkId: true,
        name: true,
        email: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User exists in Clerk but not in database. Please wait for webhook sync or contact support.',
      });
    }

    req.dbUser = user;
    next();
  } catch (error) {
    next(error);
  }
};

// -----------------------------------------------------------------------------
// HELPER: Get Auth from Request
// -----------------------------------------------------------------------------
/**
 * Helper to get Clerk auth from request.
 * Re-exported for convenience in controllers.
 */
export { getAuth };
