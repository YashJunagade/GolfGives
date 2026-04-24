import { Router } from 'express';
import auth from '../middleware/auth.js';
import { getProfile, updateProfile, sendWelcomeEmail, registerAdmin, checkAdminCode } from '../controllers/auth.controller.js';

const router = Router();

router.get('/profile',  auth, getProfile);
router.patch('/profile', auth, updateProfile);
router.post('/welcome',       auth, sendWelcomeEmail);
router.post('/check-admin-code', checkAdminCode);
router.post('/register-admin', auth, registerAdmin);

export default router;
