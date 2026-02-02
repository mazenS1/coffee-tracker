import { Router } from 'express';
import {
  getAllCups,
  getCupById,
  createCup,
  updateCup,
  deleteCup,
} from '../controllers/cup/cupController';

const router = Router();

// GET /api/v1/cups - Get all cups (for user's coffees)
router.get('/', getAllCups);

// GET /api/v1/cups/:id - Get a specific cup
router.get('/:id', getCupById);

// POST /api/v1/cups - Create a new cup
router.post('/', createCup);

// PATCH /api/v1/cups/:id - Update a cup
router.patch('/:id', updateCup);

// DELETE /api/v1/cups/:id - Delete a cup
router.delete('/:id', deleteCup);

export default router;
