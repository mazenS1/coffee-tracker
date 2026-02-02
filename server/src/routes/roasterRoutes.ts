import { Router } from 'express';
import {
  getAllRoasters,
  getRoasterById,
  createRoaster,
  updateRoaster,
  deleteRoaster,
} from '../controllers/roaster/roasterController';

const router = Router();

// GET /api/v1/roasters - Get all roasters
router.get('/', getAllRoasters);

// GET /api/v1/roasters/:id - Get a specific roaster
router.get('/:id', getRoasterById);

// POST /api/v1/roasters - Create a new roaster
router.post('/', createRoaster);

// PATCH /api/v1/roasters/:id - Update a roaster
router.patch('/:id', updateRoaster);

// DELETE /api/v1/roasters/:id - Delete a roaster
router.delete('/:id', deleteRoaster);

export default router;
