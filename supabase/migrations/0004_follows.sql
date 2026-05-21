-- FrameGame: follows
-- One-way follow relationship between profiles. A row means
-- follower_id follows followee_id. Mutual follows are two rows.

create table if not exists public.follows (
  follower_id uuid not null references public.profiles(id) on delete cascade,
  followee_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, followee_id),
  check (follower_id <> followee_id)
);

create index if not exists follows_follower_idx on public.follows (follower_id);
create index if not exists follows_followee_idx on public.follows (followee_id);

alter table public.follows enable row level security;

drop policy if exists "follows readable by authed" on public.follows;
create policy "follows readable by authed"
  on public.follows for select
  to authenticated
  using (true);

drop policy if exists "follows insert self" on public.follows;
create policy "follows insert self"
  on public.follows for insert
  to authenticated
  with check (auth.uid() = follower_id);

drop policy if exists "follows delete self" on public.follows;
create policy "follows delete self"
  on public.follows for delete
  to authenticated
  using (auth.uid() = follower_id);
