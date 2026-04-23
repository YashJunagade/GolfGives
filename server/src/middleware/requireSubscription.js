import supabase from '../config/supabase.js';

const requireSubscription = async (req, res, next) => {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('status, current_period_end')
    .eq('user_id', req.user.id)
    .single();

  if (error || data?.status !== 'active') {
    return res.status(403).json({ error: 'Active subscription required' });
  }

  next();
};

export default requireSubscription;
