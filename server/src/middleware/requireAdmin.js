import supabase from '../config/supabase.js';

const requireAdmin = async (req, res, next) => {
  const { data, error } = await supabase
    .from('users')
    .select('role')
    .eq('id', req.user.id)
    .single();

  if (error || data?.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  next();
};

export default requireAdmin;
