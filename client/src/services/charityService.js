import api from './api.js';

export const getCharities    = ()                             => api.get('/charities');
export const getCharity      = (id)                           => api.get(`/charities/${id}`);
export const selectCharity   = (charity_id, charity_percent) => api.patch('/charities/select', { charity_id, charity_percent });
export const deselectCharity = ()                             => api.delete('/charities/select');
