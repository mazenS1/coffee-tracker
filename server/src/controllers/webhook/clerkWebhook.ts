import { Request, Response, NextFunction } from 'express';
import { Webhook } from 'svix';
import prisma from '../../lib/prisma';

// =============================================================================
// CLERK WEBHOOK CONTROLLER
// =============================================================================
// Handles webhook events from Clerk to sync user data with the database.
// Clerk sends events when users are created, updated, or deleted.

// -----------------------------------------------------------------------------
// TYPE DEFINITIONS
// -----------------------------------------------------------------------------

// Clerk webhook event types we handle
type ClerkWebhookEvent = {
  data: {
    id: string;
    email_addresses: Array<{
      id: string;
      email_address: string;
    }>;
    primary_email_address_id: string;
    first_name: string | null;
    last_name: string | null;
    image_url: string;
    created_at: number;
    updated_at: number;
  };
  object: 'event';
  type: 'user.created' | 'user.updated' | 'user.deleted';
};

// -----------------------------------------------------------------------------
// WEBHOOK HANDLER
// -----------------------------------------------------------------------------

/**
 * Handle Clerk webhook events
 * 
 * IMPORTANT: This endpoint must:
 * 1. Receive raw body (not parsed JSON) for signature verification
 * 2. NOT be protected by authentication (Clerk needs to call it)
 * 3. Verify the webhook signature using svix
 */
export const handleClerkWebhook = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

    if (!WEBHOOK_SECRET) {
      console.error('CLERK_WEBHOOK_SECRET is not set');
      return res.status(500).json({
        error: 'Configuration error',
        message: 'Webhook secret not configured',
      });
    }

    // Get the Svix headers for verification
    const svix_id = req.headers['svix-id'] as string;
    const svix_timestamp = req.headers['svix-timestamp'] as string;
    const svix_signature = req.headers['svix-signature'] as string;

    // If there are no headers, error out
    if (!svix_id || !svix_timestamp || !svix_signature) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'Missing svix headers',
      });
    }

    // Create a new Svix instance with your webhook secret
    const wh = new Webhook(WEBHOOK_SECRET);

    let event: ClerkWebhookEvent;

    try {
      // Verify the webhook signature
      // req.body is a Buffer from express.raw(), convert to string
      const body = Buffer.isBuffer(req.body) ? req.body.toString('utf8') : 
                   typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
      event = wh.verify(body, {
        'svix-id': svix_id,
        'svix-timestamp': svix_timestamp,
        'svix-signature': svix_signature,
      }) as ClerkWebhookEvent;
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return res.status(400).json({
        error: 'Bad request',
        message: 'Invalid webhook signature',
      });
    }

    // Handle the event based on type
    const { type, data } = event;

    console.log(`Received Clerk webhook: ${type}`);

    switch (type) {
      case 'user.created':
        await handleUserCreated(data);
        break;

      case 'user.updated':
        await handleUserUpdated(data);
        break;

      case 'user.deleted':
        await handleUserDeleted(data.id);
        break;

      default:
        console.log(`Unhandled webhook type: ${type}`);
    }

    // Respond with 200 to acknowledge receipt
    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    next(error);
  }
};

// -----------------------------------------------------------------------------
// EVENT HANDLERS
// -----------------------------------------------------------------------------

/**
 * Handle user.created event - Create user in database
 */
async function handleUserCreated(data: ClerkWebhookEvent['data']) {
  const { id: clerkId, email_addresses, primary_email_address_id, first_name, last_name } = data;

  // Find the primary email
  const primaryEmail = email_addresses.find(
    (email) => email.id === primary_email_address_id
  );

  if (!primaryEmail) {
    console.error('No primary email found for user:', clerkId);
    return;
  }

  // Build the display name
  const name = [first_name, last_name].filter(Boolean).join(' ') || 'User';

  try {
    const user = await prisma.user.create({
      data: {
        clerkId,
        email: primaryEmail.email_address,
        name,
      },
    });

    console.log(`Created user in database: ${user.id} (Clerk ID: ${clerkId})`);
  } catch (error: any) {
    // Handle duplicate - user might already exist
    if (error.code === 'P2002') {
      console.log(`User already exists with Clerk ID: ${clerkId}`);
      // Optionally update the existing user
      await handleUserUpdated(data);
    } else {
      throw error;
    }
  }
}

/**
 * Handle user.updated event - Update user in database
 */
async function handleUserUpdated(data: ClerkWebhookEvent['data']) {
  const { id: clerkId, email_addresses, primary_email_address_id, first_name, last_name } = data;

  // Find the primary email
  const primaryEmail = email_addresses.find(
    (email) => email.id === primary_email_address_id
  );

  if (!primaryEmail) {
    console.error('No primary email found for user:', clerkId);
    return;
  }

  // Build the display name
  const name = [first_name, last_name].filter(Boolean).join(' ') || 'User';

  try {
    const user = await prisma.user.update({
      where: { clerkId },
      data: {
        email: primaryEmail.email_address,
        name,
      },
    });

    console.log(`Updated user in database: ${user.id} (Clerk ID: ${clerkId})`);
  } catch (error: any) {
    // Handle user not found - create them instead
    if (error.code === 'P2025') {
      console.log(`User not found, creating: ${clerkId}`);
      await handleUserCreated(data);
    } else {
      throw error;
    }
  }
}

/**
 * Handle user.deleted event - Delete or soft-delete user in database
 * 
 * Note: Depending on your business logic, you might want to:
 * - Soft delete (add a deletedAt timestamp)
 * - Keep the user but anonymize data
 * - Cascade delete all related records
 * - Prevent deletion if user has data
 */
async function handleUserDeleted(clerkId: string) {
  try {
    // Option 1: Hard delete (current implementation)
    // This will fail if user has related records without cascade delete
    const user = await prisma.user.delete({
      where: { clerkId },
    });

    console.log(`Deleted user from database: ${user.id} (Clerk ID: ${clerkId})`);
  } catch (error: any) {
    if (error.code === 'P2025') {
      console.log(`User not found for deletion: ${clerkId}`);
    } else if (error.code === 'P2003') {
      // Foreign key constraint - user has related records
      console.error(`Cannot delete user ${clerkId}: has related records`);
      // You might want to soft delete instead or notify admins
    } else {
      throw error;
    }
  }
}

export default { handleClerkWebhook };
