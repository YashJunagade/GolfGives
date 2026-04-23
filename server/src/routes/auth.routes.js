import { Router } from 'express';
import auth from '../middleware/auth.js';
import { getProfile, updateProfile, sendWelcomeEmail } from '../controllers/auth.controller.js';

const router = Router();

router.get('/profile',  auth, getProfile);
router.patch('/profile', auth, updateProfile);
router.post('/welcome',  auth, sendWelcomeEmail);

export default router;
