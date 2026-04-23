import { Router } from 'express';
import auth from '../middleware/auth.js';
import { createCheckout, cancelSubscription, getStatus, handleWebhook } from '../controllers/subscription.controller.js';

const router = Router();

// Webhook — raw body, no auth (Stripe calls this)
router.post('/webhook', handleWebhook);

router.post('/checkout', auth, createCheckout);
router.post('/cancel',   auth, cancelSubscription);
router.get('/status',    auth, getStatus);

export default router;
