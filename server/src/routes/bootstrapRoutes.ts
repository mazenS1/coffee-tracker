import { Router } from 'express';
import { getBootstrapData } from '../controllers/bootstrap/bootstrapController';

const router = Router();

// GET /api/v2/bootstrap - Optimized first-load payload
router.get('/', getBootstrapData);

export default router;
