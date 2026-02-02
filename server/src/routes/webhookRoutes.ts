import { Router } from 'express';
import express from 'express';
import { handleClerkWebhook } from '../controllers/webhook/clerkWebhook';

const router = Router();

// =============================================================================
// WEBHOOK ROUTES
// =============================================================================
// These routes handle incoming webhooks from external services.
// IMPORTANT: Webhook routes often need special handling:
// 1. They should NOT be behind authentication
// 2. They may need raw body access for signature verification
// 3. They should verify signatures to ensure authenticity

// -----------------------------------------------------------------------------
// CLERK WEBHOOKS
// -----------------------------------------------------------------------------
// Clerk sends webhooks for user lifecycle events (created, updated, deleted)
// 
// To set up in Clerk Dashboard:
// 1. Go to Webhooks in your Clerk Dashboard
// 2. Add endpoint: https://your-domain.com/api/webhooks/clerk
// 3. Subscribe to events: user.created, user.updated, user.deleted
// 4. Copy the signing secret to CLERK_WEBHOOK_SECRET env var

// Use raw body parser for webhook signature verification
// This must be applied BEFORE the route handler
router.post(
  '/clerk',
  express.raw({ type: 'application/json' }),
  handleClerkWebhook
);

export default router;
