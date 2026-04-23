-- ============================================================
-- Charity events (golf days, fundraisers, etc.)
-- ============================================================

create table public.charity_events (
  id          uuid primary key default uuid_generate_v4(),
  charity_id  uuid not null references public.charities(id) on delete cascade,
  title       text not null,
  description text,
  event_date  date not null,
  location    text,
  created_at  timestamptz not null default now()
);

alter table public.charity_events enable row level security;

create policy "Public can view charity events"
  on public.charity_events for select to public using (true);

create policy "Admins can manage charity events"
  on public.charity_events for all to authenticated
  using (
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  )
  with check (
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );
