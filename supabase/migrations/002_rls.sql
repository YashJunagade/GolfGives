-- ============================================================
-- Row Level Security Policies
-- ============================================================

alter table public.users               enable row level security;
alter table public.subscriptions       enable row level security;
alter table public.charities           enable row level security;
alter table public.scores              enable row level security;
alter table public.draws               enable row level security;
alter table public.draw_entries        enable row level security;
alter table public.prize_pools         enable row level security;
alter table public.draw_results        enable row level security;
alter table public.winner_submissions  enable row level security;

-- ============================================================
-- Helper: check if the current user is an admin
-- ============================================================
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.users
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ============================================================
-- USERS
-- ============================================================
create policy "users: read own"   on public.users for select using (id = auth.uid());
create policy "users: update own" on public.users for update using (id = auth.uid());
create policy "users: insert own" on public.users for insert with check (id = auth.uid());
create policy "users: admin all"  on public.users for all using (public.is_admin());

-- ============================================================
-- SUBSCRIPTIONS
-- ============================================================
create policy "subscriptions: read own"  on public.subscriptions for select using (user_id = auth.uid());
create policy "subscriptions: admin all" on public.subscriptions for all using (public.is_admin());

-- ============================================================
-- CHARITIES
-- Public can read; only admin can write
-- ============================================================
create policy "charities: read all"  on public.charities for select using (true);
create policy "charities: admin all" on public.charities for all using (public.is_admin());

-- ============================================================
-- SCORES
-- ============================================================
create policy "scores: read own"   on public.scores for select using (user_id = auth.uid());
create policy "scores: insert own" on public.scores for insert with check (user_id = auth.uid());
create policy "scores: update own" on public.scores for update using (user_id = auth.uid());
create policy "scores: delete own" on public.scores for delete using (user_id = auth.uid());
create policy "scores: admin all"  on public.scores for all using (public.is_admin());

-- ============================================================
-- DRAWS
-- Published draws are public; admin controls all
-- ============================================================
create policy "draws: read published" on public.draws for select using (status = 'published' or public.is_admin());
create policy "draws: admin all"      on public.draws for all using (public.is_admin());

-- ============================================================
-- DRAW ENTRIES
-- ============================================================
create policy "draw_entries: read own"  on public.draw_entries for select using (user_id = auth.uid() or public.is_admin());
create policy "draw_entries: admin all" on public.draw_entries for all using (public.is_admin());

-- ============================================================
-- PRIZE POOLS
-- ============================================================
create policy "prize_pools: read all"  on public.prize_pools for select using (true);
create policy "prize_pools: admin all" on public.prize_pools for all using (public.is_admin());

-- ============================================================
-- DRAW RESULTS
-- ============================================================
create policy "draw_results: read all"  on public.draw_results for select using (true);
create policy "draw_results: admin all" on public.draw_results for all using (public.is_admin());

-- ============================================================
-- WINNER SUBMISSIONS
-- ============================================================
create policy "winner_submissions: read own"   on public.winner_submissions for select using (user_id = auth.uid() or public.is_admin());
create policy "winner_submissions: insert own" on public.winner_submissions for insert with check (user_id = auth.uid());
create policy "winner_submissions: admin all"  on public.winner_submissions for all using (public.is_admin());
