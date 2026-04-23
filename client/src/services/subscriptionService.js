import api from './api.js';

export const createCheckout     = (plan) => api.post('/subscription/checkout', { plan });
export const getStatus          = ()     => api.get('/subscription/status');
export const cancelSubscription = ()     => api.post('/subscription/cancel');
