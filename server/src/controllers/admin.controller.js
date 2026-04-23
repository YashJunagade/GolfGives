import supabase from '../config/supabase.js';

export const getUserScores = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('scores')
      .select('id, score, date, created_at')
      .eq('user_id', req.params.id)
      .order('date', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
};

export const updateUserScore = async (req, res, next) => {
  try {
    const val = Number(req.body.score);
    if (!val || val < 1 || val > 45) {
      return res.status(422).json({ error: 'Score must be between 1 and 45.' });
    }
    const { data, error } = await supabase
      .from('scores')
      .update({ score: val })
      .eq('id', req.params.scoreId)
      .select('id, score, date, created_at')
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
};

export const getUsers = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, full_name, email, role, created_at, subscriptions(status, plan, current_period_end)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
};

export const getAnalytics = async (req, res, next) => {
  try {
    const [
      { count: totalUsers },
      { data: subs,      error: subErr  },
      { data: pools,     error: poolErr },
      { data: charities, error: charErr },
      { data: drawsData, error: drawErr },
    ] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('subscriptions').select('status'),
      supabase.from('prize_pools').select('total_pool, charity_contribution'),
      supabase.from('charities').select('id'),
      supabase.from('draws').select(`
        id, month, year, status, draw_type,
        prize_pools (total_pool, active_subscribers_count),
        draw_results (match_type, winner_ids, prize_per_winner)
      `).order('year', { ascending: false }).order('month', { ascending: false }),
    ]);

    if (subErr || poolErr || charErr || drawErr) throw subErr ?? poolErr ?? charErr ?? drawErr;

    const activeSubs   = subs?.filter((s) => s.status === 'active').length ?? 0;
    const totalPool    = pools?.reduce((s, p) => s + Number(p.total_pool || 0), 0) ?? 0;
    const totalCharity = pools?.reduce((s, p) => s + Number(p.charity_contribution || 0), 0) ?? 0;

    const drawStats = (drawsData ?? []).map((d) => ({
      id:          d.id,
      month:       d.month,
      year:        d.year,
      status:      d.status,
      draw_type:   d.draw_type,
      total_pool:  d.prize_pools?.total_pool ?? 0,
      subscribers: d.prize_pools?.active_subscribers_count ?? 0,
      winners: {
        five:  d.draw_results?.find((r) => r.match_type === 5)?.winner_ids?.length ?? 0,
        four:  d.draw_results?.find((r) => r.match_type === 4)?.winner_ids?.length ?? 0,
        three: d.draw_results?.find((r) => r.match_type === 3)?.winner_ids?.length ?? 0,
      },
    }));

    res.json({
      totalUsers:     totalUsers ?? 0,
      activeSubs,
      totalPool,
      totalCharity,
      totalDraws:     drawsData?.length ?? 0,
      totalCharities: charities?.length ?? 0,
      drawStats,
    });
  } catch (err) {
    next(err);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const { full_name } = req.body;
    const { data, error } = await supabase
      .from('users')
      .update({ full_name })
      .eq('id', req.params.id)
      .select('id, full_name, email')
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
};

export const getSubscriptions = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('id, status, plan, current_period_end, created_at, users(id, full_name, email)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
};
