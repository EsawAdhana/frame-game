-- FrameGame: Row Level Security
-- Policy model: logged-in users can read all social content, but only
-- modify their own rows.

alter table public.profiles   enable row level security;
alter table public.prompts    enable row level security;
alter table public.posts      enable row level security;
alter table public.likes      enable row level security;
alter table public.comments   enable row level security;
alter table public.prompt_pool enable row level security;

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
drop policy if exists "profiles readable by authed" on public.profiles;
create policy "profiles readable by authed"
  on public.profiles for select
  to authenticated
  using (true);

drop policy if exists "profiles update self" on public.profiles;
create policy "profiles update self"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- No INSERT policy: rows are created by the handle_new_user trigger.

-- ---------------------------------------------------------------------------
-- prompts (read-only to users; writes happen via service role / cron)
-- ---------------------------------------------------------------------------
drop policy if exists "prompts readable by authed" on public.prompts;
create policy "prompts readable by authed"
  on public.prompts for select
  to authenticated
  using (true);

-- ---------------------------------------------------------------------------
-- prompt_pool: not readable by end users (admin only via service role)
-- ---------------------------------------------------------------------------
-- No policies => no access for anon/authenticated. Service role bypasses RLS.

-- ---------------------------------------------------------------------------
-- posts
-- ---------------------------------------------------------------------------
drop policy if exists "posts readable by authed" on public.posts;
create policy "posts readable by authed"
  on public.posts for select
  to authenticated
  using (true);

drop policy if exists "posts insert self" on public.posts;
create policy "posts insert self"
  on public.posts for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "posts update self" on public.posts;
create policy "posts update self"
  on public.posts for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "posts delete self" on public.posts;
create policy "posts delete self"
  on public.posts for delete
  to authenticated
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- likes
-- ---------------------------------------------------------------------------
drop policy if exists "likes readable by authed" on public.likes;
create policy "likes readable by authed"
  on public.likes for select
  to authenticated
  using (true);

drop policy if exists "likes insert self" on public.likes;
create policy "likes insert self"
  on public.likes for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "likes delete self" on public.likes;
create policy "likes delete self"
  on public.likes for delete
  to authenticated
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- comments
-- ---------------------------------------------------------------------------
drop policy if exists "comments readable by authed" on public.comments;
create policy "comments readable by authed"
  on public.comments for select
  to authenticated
  using (true);

drop policy if exists "comments insert self" on public.comments;
create policy "comments insert self"
  on public.comments for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "comments update self" on public.comments;
create policy "comments update self"
  on public.comments for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "comments delete self" on public.comments;
create policy "comments delete self"
  on public.comments for delete
  to authenticated
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Storage bucket: `posts`
-- Create the bucket once via the Supabase dashboard (Storage -> new bucket,
-- name "posts", public=true) or via the SQL below.
-- Objects are keyed under "<user_id>/<post_id>.jpg" so ownership is provable
-- from the path prefix.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('posts', 'posts', true)
on conflict (id) do nothing;

drop policy if exists "posts bucket read" on storage.objects;
create policy "posts bucket read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'posts');

drop policy if exists "posts bucket insert own" on storage.objects;
create policy "posts bucket insert own"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'posts'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "posts bucket delete own" on storage.objects;
create policy "posts bucket delete own"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'posts'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ---------------------------------------------------------------------------
-- Storage bucket: `avatars`
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

drop policy if exists "avatars bucket read" on storage.objects;
create policy "avatars bucket read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'avatars');

drop policy if exists "avatars bucket write own" on storage.objects;
create policy "avatars bucket write own"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "avatars bucket update own" on storage.objects;
create policy "avatars bucket update own"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
