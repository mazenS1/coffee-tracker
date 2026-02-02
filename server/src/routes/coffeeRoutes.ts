import { Router } from 'express';
import {
  getAllCoffees,
  getCoffeeById,
  createCoffee,
  updateCoffee,
  deleteCoffee,
  bulkCreateCoffees,
  getCoffeeStats,
} from '../controllers/coffee/coffeeController';

const router = Router();

// =============================================================================
// ROUTES GUIDE - Connecting controllers to Express
// =============================================================================

// -----------------------------------------------------------------------------
// REST API CONVENTIONS
// -----------------------------------------------------------------------------
// GET    /coffees       - Get all coffees (list)
// GET    /coffees/:id   - Get one coffee by ID
// POST   /coffees       - Create a new coffee
// PUT    /coffees/:id   - Replace a coffee entirely (rarely used)
// PATCH  /coffees/:id   - Partially update a coffee
// DELETE /coffees/:id   - Delete a coffee

// -----------------------------------------------------------------------------
// BASIC CRUD ROUTES
// -----------------------------------------------------------------------------

// List all coffees with pagination and filtering
// GET /api/v1/coffees?page=1&limit=10&search=ethiopia&roastLevel=LIGHT
router.get('/', getAllCoffees);

// Get statistics (put specific routes BEFORE :id route!)
// GET /api/v1/coffees/stats?userId=123
router.get('/stats', getCoffeeStats);

// Get a single coffee by ID
// GET /api/v1/coffees/abc123
router.get('/:id', getCoffeeById);

// Create a new coffee
// POST /api/v1/coffees
router.post('/', createCoffee);

// Bulk create coffees
// POST /api/v1/coffees/bulk
router.post('/bulk', bulkCreateCoffees);

// Update a coffee (partial update)
// PATCH /api/v1/coffees/abc123
router.patch('/:id', updateCoffee);

// Delete a coffee
// DELETE /api/v1/coffees/abc123
router.delete('/:id', deleteCoffee);

// -----------------------------------------------------------------------------
// ROUTE ORDER MATTERS!
// -----------------------------------------------------------------------------
// Express matches routes in order. Put specific routes before dynamic ones:
//
// WRONG ORDER (stats would never match):
//   router.get('/:id', getCoffeeById);
//   router.get('/stats', getCoffeeStats);  // 'stats' matches :id first!
//
// CORRECT ORDER:
//   router.get('/stats', getCoffeeStats);  // Specific route first
//   router.get('/:id', getCoffeeById);     // Dynamic route after

export default router;
