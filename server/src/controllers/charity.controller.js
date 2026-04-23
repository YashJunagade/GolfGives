import supabase from '../config/supabase.js';

export const getCharities = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('charities')
      .select('id, name, description, image_url, website, featured')
      .eq('active', true)
      .order('featured', { ascending: false })
      .order('name');

    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
};

export const getCharity = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('charities')
      .select('id, name, description, image_url, website, featured')
      .eq('id', req.params.id)
      .eq('active', true)
      .single();

    if (error || !data) return res.status(404).json({ error: 'Charity not found.' });
    res.json(data);
  } catch (err) {
    next(err);
  }
};

export const selectCharity = async (req, res, next) => {
  try {
    const { charity_id, charity_percent } = req.body;

    if (charity_percent < 10 || charity_percent > 100) {
      return res.status(422).json({ error: 'Charity contribution must be between 10% and 100%.' });
    }

    const { data, error } = await supabase
      .from('users')
      .update({ charity_id, charity_percent })
      .eq('id', req.user.id)
      .select('charity_id, charity_percent')
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
};

export const deselectCharity = async (req, res, next) => {
  try {
    const { error } = await supabase
      .from('users')
      .update({ charity_id: null })
      .eq('id', req.user.id);

    if (error) throw error;
    res.json({ charity_id: null });
  } catch (err) {
    next(err);
  }
};

// Admin only
export const createCharity = async (req, res, next) => {
  try {
    const { name, description, image_url, website, featured } = req.body;
    const { data, error } = await supabase
      .from('charities')
      .insert({ name, description, image_url, website, featured: !!featured })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
};

export const updateCharity = async (req, res, next) => {
  try {
    const { name, description, image_url, website, featured, active } = req.body;
    const { data, error } = await supabase
      .from('charities')
      .update({ name, description, image_url, website, featured, active })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
};

export const deleteCharity = async (req, res, next) => {
  try {
    await supabase.from('charities').update({ active: false }).eq('id', req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

export const getCharityEvents = async (req, res, next) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const { data, error } = await supabase
      .from('charity_events')
      .select('id, title, description, event_date, location')
      .eq('charity_id', req.params.id)
      .gte('event_date', today)
      .order('event_date', { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
};

export const createCharityEvent = async (req, res, next) => {
  try {
    const { title, description, event_date, location } = req.body;
    if (!title || !event_date) return res.status(422).json({ error: 'Title and date are required.' });
    const { data, error } = await supabase
      .from('charity_events')
      .insert({ charity_id: req.params.id, title, description, event_date, location })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
};

export const deleteCharityEvent = async (req, res, next) => {
  try {
    await supabase.from('charity_events').delete().eq('id', req.params.eventId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
