import { Router } from 'express';
import auth from '../middleware/auth.js';
import requireAdmin from '../middleware/requireAdmin.js';
import { getUsers, updateUser, getAnalytics, getUserScores, updateUserScore, getSubscriptions } from '../controllers/admin.controller.js';

const router = Router();

router.use(auth, requireAdmin);

router.get('/users',                getUsers);
router.get('/analytics',            getAnalytics);
router.get('/subscriptions',        getSubscriptions);
router.get('/users/:id/scores',     getUserScores);
router.patch('/users/:id',          updateUser);
router.patch('/scores/:scoreId',    updateUserScore);

export default router;
