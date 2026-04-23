-- ============================================================
-- GolfGives - Database Schema
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- USERS
-- Extends Supabase auth.users with app-specific profile data
-- ============================================================
create table public.users (
  id           uuid primary key references auth.users(id) on delete cascade,
  email        text not null,
  full_name    text not null,
  role         text not null default 'user' check (role in ('user', 'admin')),
  charity_id   uuid,
  charity_percent integer not null default 10 check (charity_percent >= 10 and charity_percent <= 100),
  created_at   timestamptz not null default now()
);

-- ============================================================
-- SUBSCRIPTIONS
-- ============================================================
create table public.subscriptions (
  id                     uuid primary key default uuid_generate_v4(),
  user_id                uuid not null references public.users(id) on delete cascade,
  plan                   text not null check (plan in ('monthly', 'yearly')),
  status                 text not null check (status in ('active', 'cancelled', 'lapsed')),
  stripe_customer_id     text,
  stripe_subscription_id text unique,
  current_period_end     timestamptz,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

create unique index subscriptions_user_id_idx on public.subscriptions(user_id);

-- ============================================================
-- CHARITIES
-- ============================================================
create table public.charities (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  description text,
  image_url   text,
  website     text,
  featured    boolean not null default false,
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);

-- FK from users -> charities (added after charities table exists)
alter table public.users
  add constraint users_charity_id_fkey
  foreign key (charity_id) references public.charities(id) on delete set null;

-- ============================================================
-- SCORES
-- One score per user per date, max 5 retained (enforced in app layer)
-- ============================================================
create table public.scores (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references public.users(id) on delete cascade,
  score      integer not null check (score >= 1 and score <= 45),
  date       date not null,
  created_at timestamptz not null default now(),

  unique (user_id, date)
);

create index scores_user_id_date_idx on public.scores(user_id, date desc);

-- ============================================================
-- DRAWS
-- ============================================================
create table public.draws (
  id                    uuid primary key default uuid_generate_v4(),
  month                 integer not null check (month >= 1 and month <= 12),
  year                  integer not null,
  drawn_numbers         integer[] not null default '{}',
  draw_type             text not null default 'random' check (draw_type in ('random', 'algorithmic')),
  status                text not null default 'draft' check (status in ('draft', 'simulated', 'published')),
  jackpot_rollover_amount numeric(10,2) not null default 0,
  created_by            uuid references public.users(id),
  created_at            timestamptz not null default now(),

  unique (month, year)
);

-- ============================================================
-- DRAW ENTRIES
-- Snapshot of a user's scores at the time the draw is run
-- ============================================================
create table public.draw_entries (
  id              uuid primary key default uuid_generate_v4(),
  draw_id         uuid not null references public.draws(id) on delete cascade,
  user_id         uuid not null references public.users(id) on delete cascade,
  scores_snapshot integer[] not null,
  created_at      timestamptz not null default now(),

  unique (draw_id, user_id)
);

-- ============================================================
-- PRIZE POOLS
-- Calculated when draw is run; one row per draw
-- ============================================================
create table public.prize_pools (
  id                        uuid primary key default uuid_generate_v4(),
  draw_id                   uuid not null unique references public.draws(id) on delete cascade,
  active_subscribers_count  integer not null,
  total_pool                numeric(10,2) not null,
  jackpot_pool              numeric(10,2) not null,  -- 40%
  four_match_pool           numeric(10,2) not null,  -- 35%
  three_match_pool          numeric(10,2) not null,  -- 25%
  created_at                timestamptz not null default now()
);

-- ============================================================
-- DRAW RESULTS
-- One row per match tier per draw (max 3 rows per draw: 5/4/3 match)
-- ============================================================
create table public.draw_results (
  id               uuid primary key default uuid_generate_v4(),
  draw_id          uuid not null references public.draws(id) on delete cascade,
  match_type       integer not null check (match_type in (3, 4, 5)),
  winner_ids       uuid[] not null default '{}',
  prize_per_winner numeric(10,2) not null default 0,
  pool_amount      numeric(10,2) not null default 0,
  created_at       timestamptz not null default now(),

  unique (draw_id, match_type)
);

-- ============================================================
-- WINNER SUBMISSIONS
-- Winners upload proof; admin reviews
-- ============================================================
create table public.winner_submissions (
  id              uuid primary key default uuid_generate_v4(),
  draw_result_id  uuid not null references public.draw_results(id) on delete cascade,
  user_id         uuid not null references public.users(id) on delete cascade,
  proof_url       text not null,
  status          text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  payout_status   text not null default 'pending' check (payout_status in ('pending', 'paid')),
  submitted_at    timestamptz not null default now(),
  reviewed_at     timestamptz,

  unique (draw_result_id, user_id)
);
