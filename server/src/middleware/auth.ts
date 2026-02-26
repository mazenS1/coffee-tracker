import { Request, Response, NextFunction } from 'express';
import {
  clerkClient,
  clerkMiddleware,
  getAuth,
  requireAuth as clerkRequireAuth,
} from '@clerk/express';
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
    let user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
      select: {
        id: true,
        clerkId: true,
        name: true,
        email: true,
      },
    });

    if (!user) {
      user = await provisionDbUserFromClerk(clerkUserId);
    }

    if (!user) {
      return res.status(503).json({
        error: 'User sync pending',
        message:
          'User exists in Clerk but is not ready in the database yet. Please retry in a moment.',
      });
    }

    req.dbUser = user;
    next();
  } catch (error) {
    next(error);
  }
};

type ClerkUserEmail = {
  id?: string;
  emailAddress?: string;
  email_address?: string;
};

const getPrimaryEmail = (clerkUser: any): string | null => {
  const emails = Array.isArray(clerkUser?.emailAddresses)
    ? (clerkUser.emailAddresses as ClerkUserEmail[])
    : [];
  const primaryId = clerkUser?.primaryEmailAddressId;

  const primaryEmail =
    emails.find((email) => email.id === primaryId)?.emailAddress ??
    emails.find((email) => email.id === primaryId)?.email_address ??
    emails[0]?.emailAddress ??
    emails[0]?.email_address;

  return typeof primaryEmail === 'string' && primaryEmail.trim()
    ? primaryEmail.trim()
    : null;
};

const getDisplayName = (clerkUser: any): string => {
  const fullName =
    (typeof clerkUser?.fullName === 'string' && clerkUser.fullName.trim()) ||
    [clerkUser?.firstName, clerkUser?.lastName]
      .filter((part) => typeof part === 'string' && part.trim())
      .join(' ')
      .trim();

  return fullName || 'User';
};

const provisionDbUserFromClerk = async (clerkUserId: string) => {
  try {
    const clerkUser = await clerkClient.users.getUser(clerkUserId);
    const email = getPrimaryEmail(clerkUser);

    if (!email) {
      console.error('Unable to provision user: Clerk user has no primary email', {
        clerkUserId,
      });
      return null;
    }

    return prisma.user.upsert({
      where: { clerkId: clerkUserId },
      update: {
        email,
        name: getDisplayName(clerkUser),
      },
      create: {
        clerkId: clerkUserId,
        email,
        name: getDisplayName(clerkUser),
      },
      select: {
        id: true,
        clerkId: true,
        name: true,
        email: true,
      },
    });
  } catch (error) {
    console.error('Failed to provision database user from Clerk', {
      clerkUserId,
      error,
    });
    return null;
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
