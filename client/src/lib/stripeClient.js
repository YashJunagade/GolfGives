import { loadStripe } from '@stripe/stripe-js';

const stripe = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export default stripe;
