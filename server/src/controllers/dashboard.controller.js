import supabase from '../config/supabase.js';

export const getDashboardData = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const [subResult, scoresResult, drawsResult, resultsResult, submissionsResult] = await Promise.all([
      supabase
        .from('subscriptions')
        .select('plan, status, current_period_end')
        .eq('user_id', userId)
        .single(),

      supabase
        .from('scores')
        .select('id, score, date, created_at')
        .eq('user_id', userId)
        .order('date', { ascending: false }),

      supabase
        .from('draws')
        .select(`
          id, month, year, drawn_numbers, draw_type, status,
          prize_pools (total_pool, jackpot_pool, four_match_pool, three_match_pool, active_subscribers_count),
          draw_results (match_type, winner_ids, prize_per_winner, pool_amount)
        `)
        .eq('status', 'published')
        .order('year', { ascending: false })
        .order('month', { ascending: false }),

      supabase
        .from('draw_results')
        .select(`
          id, match_type, prize_per_winner, pool_amount,
          draws (id, month, year, drawn_numbers, status)
        `)
        .contains('winner_ids', [userId]),

      supabase
        .from('winner_submissions')
        .select('id, draw_result_id, payout_status, submitted_at')
        .eq('user_id', userId),
    ]);

    // Calculate upcoming draw month/year
    const draws = drawsResult.data ?? [];
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear  = now.getFullYear();
    const currentPublished = draws.some((d) => d.month === currentMonth && d.year === currentYear);
    let upcomingMonth = currentPublished ? currentMonth + 1 : currentMonth;
    let upcomingYear  = currentYear;
    if (upcomingMonth > 12) { upcomingMonth = 1; upcomingYear++; }

    res.json({
      subscription:  subResult.error || !subResult.data ? { status: 'none' } : subResult.data,
      scores:        scoresResult.data      ?? [],
      draws,
      myResults:     resultsResult.data     ?? [],
      mySubmissions: submissionsResult.data ?? [],
      upcoming:      { month: upcomingMonth, year: upcomingYear },
    });
  } catch (err) {
    next(err);
  }
};
