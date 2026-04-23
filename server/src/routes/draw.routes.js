import { Router } from 'express';
import auth from '../middleware/auth.js';
import requireAdmin from '../middleware/requireAdmin.js';
import requireSubscription from '../middleware/requireSubscription.js';
import { getPublishedDraws, getMyResults, createDraw, simulateDraw, publishDraw, getAllDraws } from '../controllers/draw.controller.js';

const router = Router();

router.get('/',           getPublishedDraws);
router.get('/my-results', auth, requireSubscription, getMyResults);

// Admin
router.get('/admin',          auth, requireAdmin, getAllDraws);
router.post('/',               auth, requireAdmin, createDraw);
router.post('/:id/simulate',   auth, requireAdmin, simulateDraw);
router.post('/:id/publish',    auth, requireAdmin, publishDraw);

export default router;
