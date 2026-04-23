import supabase from '../config/supabase.js';
import { validationResult } from 'express-validator';

const MAX_SCORES = 5;

export const getScores = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('scores')
      .select('id, score, date, created_at')
      .eq('user_id', req.user.id)
      .order('date', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
};

export const addScore = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ error: errors.array()[0].msg });

  try {
    const { score, date } = req.body;
    const userId = req.user.id;

    // Fetch existing scores ordered oldest first
    const { data: existing, error: fetchErr } = await supabase
      .from('scores')
      .select('id, date')
      .eq('user_id', userId)
      .order('date', { ascending: true });

    if (fetchErr) throw fetchErr;

    // Enforce one score per date
    const duplicate = existing.find((s) => s.date === date);
    if (duplicate) return res.status(409).json({ error: 'A score for this date already exists.' });

    // If at max, delete the oldest
    if (existing.length >= MAX_SCORES) {
      await supabase.from('scores').delete().eq('id', existing[0].id);
    }

    const { data, error } = await supabase
      .from('scores')
      .insert({ user_id: userId, score, date })
      .select('id, score, date, created_at')
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
};

export const updateScore = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ error: errors.array()[0].msg });

  try {
    const { id } = req.params;
    const { score } = req.body;

    // Verify ownership
    const { data: existing, error: fetchErr } = await supabase
      .from('scores')
      .select('id, user_id')
      .eq('id', id)
      .single();

    if (fetchErr || !existing) return res.status(404).json({ error: 'Score not found.' });
    if (existing.user_id !== req.user.id) return res.status(403).json({ error: 'Forbidden.' });

    const { data, error } = await supabase
      .from('scores')
      .update({ score })
      .eq('id', id)
      .select('id, score, date, created_at')
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
};

export const deleteScore = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data: existing, error: fetchErr } = await supabase
      .from('scores')
      .select('id, user_id')
      .eq('id', id)
      .single();

    if (fetchErr || !existing) return res.status(404).json({ error: 'Score not found.' });
    if (existing.user_id !== req.user.id) return res.status(403).json({ error: 'Forbidden.' });

    await supabase.from('scores').delete().eq('id', id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
