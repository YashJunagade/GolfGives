import supabase from '../config/supabase.js';
import { runDraw } from '../services/drawEngine.js';
import { sendDrawPublished, sendWinnerAlert } from '../services/emailService.js';

// Public: get all published draws
export const getPublishedDraws = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('draws')
      .select(`
        id, month, year, drawn_numbers, draw_type, status,
        prize_pools (total_pool, jackpot_pool, four_match_pool, three_match_pool, active_subscribers_count),
        draw_results (match_type, winner_ids, prize_per_winner, pool_amount)
      `)
      .eq('status', 'published')
      .order('year', { ascending: false })
      .order('month', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
};

// Authenticated: get current user's results across draws
export const getMyResults = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('draw_results')
      .select(`
        id, match_type, prize_per_winner, pool_amount,
        draws (id, month, year, drawn_numbers, status)
      `)
      .contains('winner_ids', [req.user.id]);

    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
};

// Admin: create a draw for a given month/year
export const createDraw = async (req, res, next) => {
  try {
    const { month, year, draw_type = 'random' } = req.body;

    // Carry forward any unclaimed jackpot from the most recent published draw
    let jackpot_rollover_amount = 0;
    const { data: lastDraw } = await supabase
      .from('draws')
      .select('draw_results(match_type, winner_ids, pool_amount)')
      .eq('status', 'published')
      .order('year', { ascending: false })
      .order('month', { ascending: false })
      .limit(1)
      .single();

    if (lastDraw) {
      const jackpotResult = lastDraw.draw_results?.find((r) => r.match_type === 5);
      if (jackpotResult && (!jackpotResult.winner_ids?.length)) {
        jackpot_rollover_amount = jackpotResult.pool_amount ?? 0;
      }
    }

    const { data, error } = await supabase
      .from('draws')
      .insert({ month, year, draw_type, created_by: req.user.id, jackpot_rollover_amount })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
};

// Admin: simulate draw
export const simulateDraw = async (req, res, next) => {
  try {
    const result = await runDraw(req.params.id, false);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

// Admin: publish draw
export const publishDraw = async (req, res, next) => {
  try {
    const result = await runDraw(req.params.id, true);

    // Notify all active subscribers and alert winners — non-blocking
    const { data: draw } = await supabase.from('draws').select('month, year, drawn_numbers').eq('id', req.params.id).single();
    const { data: activeSubs } = await supabase.from('subscriptions').select('user_id').eq('status', 'active');

    if (draw && activeSubs?.length) {
      const userIds = activeSubs.map((s) => s.user_id);
      const { data: users } = await supabase.from('users').select('id, email, full_name').in('id', userIds);
      const monthName = new Date(draw.year, draw.month - 1).toLocaleString('en-GB', { month: 'long' });

      for (const u of users || []) {
        sendDrawPublished(u.email, u.full_name, monthName, draw.year, draw.drawn_numbers || []);
      }
    }

    // Notify winners from draw_results
    const { data: drawResults } = await supabase
      .from('draw_results')
      .select('match_type, winner_ids, prize_per_winner')
      .eq('draw_id', req.params.id);

    for (const dr of drawResults || []) {
      if (!dr.winner_ids?.length) continue;
      const { data: winners } = await supabase.from('users').select('email, full_name').in('id', dr.winner_ids);
      for (const w of winners || []) {
        sendWinnerAlert(w.email, w.full_name, dr.match_type, Number(dr.prize_per_winner).toFixed(2));
      }
    }

    res.json(result);
  } catch (err) {
    next(err);
  }
};

// Admin: list all draws
export const getAllDraws = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('draws')
      .select(`id, month, year, draw_type, status, drawn_numbers, jackpot_rollover_amount,
        prize_pools (total_pool, active_subscribers_count)
      `)
      .order('year', { ascending: false })
      .order('month', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
};
