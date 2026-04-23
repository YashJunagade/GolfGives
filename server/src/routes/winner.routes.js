import { Router } from 'express';
import auth from '../middleware/auth.js';
import requireAdmin from '../middleware/requireAdmin.js';
import requireSubscription from '../middleware/requireSubscription.js';
import { submitProof, getMySubmissions, getAllSubmissions, reviewSubmission, markPaid } from '../controllers/winner.controller.js';

const router = Router();

router.post('/',          auth, requireSubscription, submitProof);
router.get('/mine',       auth, getMySubmissions);

// Admin
router.get('/',                       auth, requireAdmin, getAllSubmissions);
router.patch('/:id/review',           auth, requireAdmin, reviewSubmission);
router.patch('/:id/mark-paid',        auth, requireAdmin, markPaid);

export default router;
