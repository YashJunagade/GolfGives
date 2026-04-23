import api from './api.js';

// Draws
export const adminGetDraws    = ()          => api.get('/draws/admin');
export const adminCreateDraw  = (body)      => api.post('/draws', body);
export const adminSimulate    = (id)        => api.post(`/draws/${id}/simulate`);
export const adminPublish     = (id)        => api.post(`/draws/${id}/publish`);

// Winners
export const adminGetWinners  = ()          => api.get('/winners');
export const adminReview      = (id, status)=> api.patch(`/winners/${id}/review`, { status });
export const adminMarkPaid    = (id)        => api.patch(`/winners/${id}/mark-paid`);

// Charities (re-use charityService for CRUD)
export const adminGetUsers         = ()                  => api.get('/admin/users');
export const adminGetAnalytics     = ()                  => api.get('/admin/analytics');
export const adminGetUserScores    = (userId)            => api.get(`/admin/users/${userId}/scores`);
export const adminUpdateScore      = (scoreId, score)    => api.patch(`/admin/scores/${scoreId}`, { score });
export const adminGetSubscriptions = ()                  => api.get('/admin/subscriptions');
export const adminUpdateUser       = (id, body)          => api.patch(`/admin/users/${id}`, body);
