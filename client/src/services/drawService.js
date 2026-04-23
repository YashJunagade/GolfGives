import api from './api.js';

export const getPublishedDraws = ()   => api.get('/draws');
export const getMyResults      = ()   => api.get('/draws/my-results');
export const getMySubmissions  = ()   => api.get('/winners/mine');
export const submitProof       = (draw_result_id, proof_url) =>
  api.post('/winners', { draw_result_id, proof_url });
