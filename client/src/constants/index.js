export const SCORE_MIN = 1;
export const SCORE_MAX = 45;
export const MAX_SCORES = 5;
export const CHARITY_MIN_PERCENT = 10;

export const PLANS = {
  MONTHLY: 'monthly',
  YEARLY: 'yearly',
};

export const SUBSCRIPTION_STATUS = {
  ACTIVE: 'active',
  CANCELLED: 'cancelled',
  LAPSED: 'lapsed',
};

export const DRAW_STATUS = {
  DRAFT: 'draft',
  SIMULATED: 'simulated',
  PUBLISHED: 'published',
};

export const DRAW_TYPE = {
  RANDOM: 'random',
  ALGORITHMIC: 'algorithmic',
};

export const MATCH_TYPES = {
  FIVE: 5,
  FOUR: 4,
  THREE: 3,
};

export const PRIZE_SPLIT = {
  [MATCH_TYPES.FIVE]: 0.40,
  [MATCH_TYPES.FOUR]: 0.35,
  [MATCH_TYPES.THREE]: 0.25,
};

export const SUBMISSION_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

export const PAYOUT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
};
