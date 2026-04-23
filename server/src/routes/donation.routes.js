import { Router } from 'express';
import auth from '../middleware/auth.js';
import { createDonationCheckout } from '../controllers/donation.controller.js';

const router = Router();

router.post('/checkout', auth, createDonationCheckout);

export default router;
