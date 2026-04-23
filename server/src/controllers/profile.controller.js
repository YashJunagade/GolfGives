import supabase from '../config/supabase.js';

export const getProfile = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, full_name, email, role, charity_id, charity_percent, charities(id, name)')
      .eq('id', req.user.id)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { full_name, charity_percent } = req.body;
    const updates = {};

    if (full_name !== undefined) {
      if (!full_name?.trim()) return res.status(422).json({ error: 'Name cannot be empty.' });
      updates.full_name = full_name.trim();
    }

    if (charity_percent !== undefined) {
      const pct = Number(charity_percent);
      if (isNaN(pct) || pct < 10 || pct > 100) {
        return res.status(422).json({ error: 'Charity % must be between 10 and 100.' });
      }
      updates.charity_percent = pct;
    }

    if (!Object.keys(updates).length) {
      return res.status(422).json({ error: 'No fields to update.' });
    }

    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', req.user.id)
      .select('id, full_name, email, role, charity_id, charity_percent, charities(id, name)')
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
};
