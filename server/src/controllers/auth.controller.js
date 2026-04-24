import supabase from '../config/supabase.js';
import { sendWelcome } from '../services/emailService.js';

export const getProfile = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, full_name, role, charity_id, charity_percent, created_at')
      .eq('id', req.user.id)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
};

export const sendWelcomeEmail = async (req, res, next) => {
  try {
    const { data } = await supabase
      .from('users')
      .select('email, full_name')
      .eq('id', req.user.id)
      .single();
    if (data) sendWelcome(data.email, data.full_name);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};

export const checkAdminCode = (req, res) => {
  const { adminCode } = req.body;
  if (!adminCode || adminCode !== process.env.ADMIN_INVITE_CODE) {
    return res.status(403).json({ error: 'Invalid admin invite code.' });
  }
  res.json({ ok: true });
};

export const registerAdmin = async (req, res, next) => {
  try {
    const { adminCode } = req.body;
    if (!adminCode || adminCode !== process.env.ADMIN_INVITE_CODE) {
      return res.status(403).json({ error: 'Invalid admin invite code.' });
    }
    const { error } = await supabase
      .from('users')
      .update({ role: 'admin' })
      .eq('id', req.user.id);
    if (error) throw error;
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { full_name } = req.body;

    const { data, error } = await supabase
      .from('users')
      .update({ full_name })
      .eq('id', req.user.id)
      .select('id, email, full_name')
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
};
