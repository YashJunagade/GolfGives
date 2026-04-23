import supabase from '../config/supabase.js';

const DRAW_SIZE   = 5;
const SCORE_MIN   = 1;
const SCORE_MAX   = 45;
const MATCH_TIERS = [5, 4, 3];

// ── Random draw: pick 5 unique numbers from 1–45 ──────────────────────────
function randomDraw() {
  const pool = Array.from({ length: SCORE_MAX }, (_, i) => i + 1);
  const drawn = [];
  while (drawn.length < DRAW_SIZE) {
    const idx = Math.floor(Math.random() * pool.length);
    drawn.push(...pool.splice(idx, 1));
  }
  return drawn.sort((a, b) => a - b);
}

// ── Algorithmic draw: rarer scores are more likely to be drawn ────────────
async function algorithmicDraw() {
  const { data: scores } = await supabase
    .from('scores')
    .select('score');

  const freq = new Array(SCORE_MAX + 1).fill(0);
  for (const { score } of scores || []) freq[score]++;

  // Invert frequency → rarer scores get higher weight
  const pool = [];
  for (let v = SCORE_MIN; v <= SCORE_MAX; v++) {
    const weight = Math.max(1, SCORE_MAX - freq[v]);
    for (let w = 0; w < weight; w++) pool.push(v);
  }

  const drawn = [];
  const used  = new Set();
  let safety  = 0;
  while (drawn.length < DRAW_SIZE && safety++ < 10000) {
    const pick = pool[Math.floor(Math.random() * pool.length)];
    if (!used.has(pick)) { drawn.push(pick); used.add(pick); }
  }
  return drawn.sort((a, b) => a - b);
}

// ── Match users against drawn numbers ─────────────────────────────────────
async function matchUsers(drawnNumbers, drawId) {
  const { data: entries } = await supabase
    .from('draw_entries')
    .select('user_id, scores_snapshot')
    .eq('draw_id', drawId);

  const results = { 5: [], 4: [], 3: [] };
  for (const entry of entries || []) {
    const matches = entry.scores_snapshot.filter((s) => drawnNumbers.includes(s)).length;
    if (results[matches]) results[matches].push(entry.user_id);
  }
  return results;
}

// ── Snapshot all eligible users' current scores ───────────────────────────
async function snapshotEntries(drawId) {
  // Get all active subscribers
  const { data: subs } = await supabase
    .from('subscriptions')
    .select('user_id')
    .eq('status', 'active');

  const userIds = (subs || []).map((s) => s.user_id);
  if (!userIds.length) return 0;

  // Get scores for each user
  const { data: scores } = await supabase
    .from('scores')
    .select('user_id, score')
    .in('user_id', userIds);

  // Group by user
  const byUser = {};
  for (const { user_id, score } of scores || []) {
    (byUser[user_id] ||= []).push(score);
  }

  // Only include users with at least 1 score
  const entries = Object.entries(byUser)
    .filter(([, s]) => s.length > 0)
    .map(([user_id, scores_snapshot]) => ({ draw_id: drawId, user_id, scores_snapshot }));

  if (entries.length) {
    await supabase.from('draw_entries').upsert(entries, { onConflict: 'draw_id,user_id' });
  }
  return entries.length;
}

// ── Main: run a draw (simulation or publish) ──────────────────────────────
export async function runDraw(drawId, publish = false) {
  const { data: draw, error } = await supabase
    .from('draws')
    .select('*')
    .eq('id', drawId)
    .single();

  if (error || !draw) throw new Error('Draw not found.');

  // Snapshot entries
  const entryCount = await snapshotEntries(drawId);

  // Generate drawn numbers
  const drawnNumbers = draw.draw_type === 'algorithmic'
    ? await algorithmicDraw()
    : randomDraw();

  // Calculate prize pool and charity contribution
  const { data: activeSubs } = await supabase
    .from('subscriptions')
    .select('plan, user_id')
    .eq('status', 'active');

  const subList = activeSubs || [];

  // Fetch charity_percent for each active subscriber to calculate total charity contribution
  const userIds = subList.map((s) => s.user_id);
  const { data: userProfiles } = userIds.length
    ? await supabase.from('users').select('id, charity_percent').in('id', userIds)
    : { data: [] };

  const charityPctMap = Object.fromEntries((userProfiles || []).map((u) => [u.id, u.charity_percent ?? 10]));

  let totalRevenue = 0;
  let totalCharity = 0;
  for (const s of subList) {
    const fee = s.plan === 'yearly' ? 89.99 / 12 : 9.99;
    totalRevenue += fee;
    totalCharity += fee * ((charityPctMap[s.user_id] ?? 10) / 100);
  }

  const totalPool = totalRevenue * 0.6; // 60% of subscription revenue goes to prize pool

  const jackpotPool    = totalPool * 0.40 + Number(draw.jackpot_rollover_amount);
  const fourMatchPool  = totalPool * 0.35;
  const threeMatchPool = totalPool * 0.25;

  // Match users
  const matchedUsers = await matchUsers(drawnNumbers, drawId);

  // Build results per tier
  const results = [];
  const tierPools = { 5: jackpotPool, 4: fourMatchPool, 3: threeMatchPool };

  for (const tier of MATCH_TIERS) {
    const winners       = matchedUsers[tier] || [];
    const prizePerWinner = winners.length > 0 ? tierPools[tier] / winners.length : 0;
    results.push({
      draw_id:         drawId,
      match_type:      tier,
      winner_ids:      winners,
      prize_per_winner: Math.round(prizePerWinner * 100) / 100,
      pool_amount:     Math.round(tierPools[tier] * 100) / 100,
    });
  }

  const newStatus = publish ? 'published' : 'simulated';

  // Persist everything
  await supabase.from('draws').update({ drawn_numbers: drawnNumbers, status: newStatus }).eq('id', drawId);

  await supabase.from('prize_pools').upsert({
    draw_id:                  drawId,
    active_subscribers_count: subList.length,
    total_pool:               Math.round(totalPool * 100) / 100,
    jackpot_pool:             Math.round(jackpotPool * 100) / 100,
    four_match_pool:          Math.round(fourMatchPool * 100) / 100,
    three_match_pool:         Math.round(threeMatchPool * 100) / 100,
    charity_contribution:     Math.round(totalCharity * 100) / 100,
  }, { onConflict: 'draw_id' });

  await supabase.from('draw_results').upsert(results, { onConflict: 'draw_id,match_type' });

  // Rollover jackpot if no 5-match winners.
  // The rollover amount is stored on the current draw's prize_pools record (already persisted above).
  // When the admin creates the next draw, createDraw() automatically reads the most recent
  // published draw's unclaimed jackpot and carries it forward via jackpot_rollover_amount.

  return { drawnNumbers, results, entryCount, totalPool: Math.round(totalPool * 100) / 100 };
}
