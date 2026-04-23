import { Router } from 'express';
import auth from '../middleware/auth.js';
import { getDashboardData } from '../controllers/dashboard.controller.js';

const router = Router();

router.get('/', auth, getDashboardData);

export default router;
