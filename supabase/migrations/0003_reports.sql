-- FrameGame: reports
-- Users can submit a report on a post. Reports are readable only by the
-- service role (no select policy) and each user can only see whether they
-- submitted one (via insert).

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  reason text check (char_length(coalesce(reason, '')) <= 500),
  created_at timestamptz not null default now(),
  unique (user_id, post_id)
);

alter table public.reports enable row level security;

drop policy if exists "reports insert self" on public.reports;
create policy "reports insert self"
  on public.reports for insert
  to authenticated
  with check (auth.uid() = user_id);
