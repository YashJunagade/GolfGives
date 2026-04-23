import api from './api.js';

export const getScores    = ()           => api.get('/scores');
export const addScore     = (score, date) => api.post('/scores', { score, date });
export const updateScore  = (id, score)  => api.patch(`/scores/${id}`, { score });
export const deleteScore  = (id)         => api.delete(`/scores/${id}`);
