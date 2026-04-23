import supabase from '../config/supabase.js';
import { sendSubmissionReviewed } from '../services/emailService.js';

export const submitProof = async (req, res, next) => {
  try {
    const { draw_result_id, proof_url } = req.body;
    if (!draw_result_id || !proof_url) {
      return res.status(422).json({ error: 'draw_result_id and proof_url are required.' });
    }

    // Verify user is actually a winner for this result
    const { data: result } = await supabase
      .from('draw_results')
      .select('winner_ids')
      .eq('id', draw_result_id)
      .single();

    if (!result?.winner_ids?.includes(req.user.id)) {
      return res.status(403).json({ error: 'You are not a winner for this draw result.' });
    }

    const { data, error } = await supabase
      .from('winner_submissions')
      .upsert({ draw_result_id, user_id: req.user.id, proof_url }, { onConflict: 'draw_result_id,user_id' })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
};

export const getMySubmissions = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('winner_submissions')
      .select(`id, proof_url, status, payout_status, submitted_at, reviewed_at,
        draw_results (match_type, prize_per_winner, draws (month, year))
      `)
      .eq('user_id', req.user.id)
      .order('submitted_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
};

// Admin
export const getAllSubmissions = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('winner_submissions')
      .select(`id, proof_url, status, payout_status, submitted_at, reviewed_at,
        users (full_name, email),
        draw_results (match_type, prize_per_winner, draws (month, year))
      `)
      .order('submitted_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
};

export const reviewSubmission = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(422).json({ error: 'Status must be approved or rejected.' });
    }

    const { data, error } = await supabase
      .from('winner_submissions')
      .update({ status, reviewed_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select(`*, users(email, full_name), draw_results(prize_per_winner)`)
      .single();

    if (error) throw error;

    // Notify the user — non-blocking
    if (data.users) {
      sendSubmissionReviewed(
        data.users.email,
        data.users.full_name,
        status,
        Number(data.draw_results?.prize_per_winner ?? 0).toFixed(2)
      );
    }

    res.json(data);
  } catch (err) {
    next(err);
  }
};

export const markPaid = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('winner_submissions')
      .update({ payout_status: 'paid' })
      .eq('id', req.params.id)
      .eq('status', 'approved')
      .select()
      .single();

    if (error || !data) return res.status(400).json({ error: 'Submission must be approved before marking paid.' });
    res.json(data);
  } catch (err) {
    next(err);
  }
};
