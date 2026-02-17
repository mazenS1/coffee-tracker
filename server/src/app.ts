import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { clerkMiddleware, requireAuth, attachDbUser } from './middleware/auth';
import coffeeRoutes from './routes/coffeeRoutes';
import cupRoutes from './routes/cupRoutes';
import roasterRoutes from './routes/roasterRoutes';
import webhookRoutes from './routes/webhookRoutes';

const app = express();

// =============================================================================
// MIDDLEWARE SETUP
// =============================================================================

// CORS - Allow cross-origin requests with credentials
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5174',
  credentials: true,
}));

// -----------------------------------------------------------------------------
// WEBHOOK ROUTES (must be before express.json() for raw body access)
// -----------------------------------------------------------------------------
// Webhooks need raw body for signature verification, so they're registered
// before the JSON body parser. The webhook route uses its own raw parser.
app.use('/api/webhooks', webhookRoutes);

// -----------------------------------------------------------------------------
// BODY PARSERS
// -----------------------------------------------------------------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// -----------------------------------------------------------------------------
// CLERK AUTHENTICATION
// -----------------------------------------------------------------------------
// clerkMiddleware() adds auth info to all requests (but doesn't block unauthenticated)
// Use requireAuth() on specific routes to enforce authentication
app.use(clerkMiddleware());

// =============================================================================
// ROUTES
// =============================================================================

// -----------------------------------------------------------------------------
// PUBLIC ROUTES
// -----------------------------------------------------------------------------

// Health check - no authentication required
const healthHandler = (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
};
app.get('/health', healthHandler);
app.get('/api/health', healthHandler);

// -----------------------------------------------------------------------------
// PROTECTED ROUTES
// -----------------------------------------------------------------------------
// requireAuth() - Blocks unauthenticated requests with 401
// attachDbUser - Looks up database user and attaches to req.dbUser

app.use('/api/v1/coffees', requireAuth(), attachDbUser, coffeeRoutes);
app.use('/api/v1/cups', requireAuth(), attachDbUser, cupRoutes);
app.use('/api/v1/roasters', requireAuth(), attachDbUser, roasterRoutes);

// =============================================================================
// ERROR HANDLING
// =============================================================================

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

export default app;
