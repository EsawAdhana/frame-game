-- FrameGame: notifications
-- Five types, created by triggers on prompts/posts/follows/likes/comments.

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (
    type in (
      'new_prompt',
      'friend_post',
      'new_follower',
      'post_like',
      'post_comment'
    )
  ),
  actor_id uuid references public.profiles(id) on delete set null,
  post_id uuid references public.posts(id) on delete cascade,
  prompt_id uuid references public.prompts(id) on delete cascade,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_created_idx
  on public.notifications (user_id, created_at desc);

create index if not exists notifications_user_unread_idx
  on public.notifications (user_id)
  where read_at is null;

alter table public.notifications enable row level security;

drop policy if exists "notifications readable by recipient" on public.notifications;
create policy "notifications readable by recipient"
  on public.notifications for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "notifications update by recipient" on public.notifications;
create policy "notifications update by recipient"
  on public.notifications for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Inserts happen only via security-definer trigger functions.

-- ---------------------------------------------------------------------------
-- Type 1: new daily prompt → every profile
-- ---------------------------------------------------------------------------
create or replace function public.notify_new_prompt()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.notifications (user_id, type, prompt_id)
  select p.id, 'new_prompt', new.id
  from public.profiles p;
  return new;
end;
$$;

drop trigger if exists on_prompt_created_notify on public.prompts;
create trigger on_prompt_created_notify
  after insert on public.prompts
  for each row execute function public.notify_new_prompt();

-- ---------------------------------------------------------------------------
-- Type 2: someone you follow posted
-- ---------------------------------------------------------------------------
create or replace function public.notify_friend_post()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.notifications (user_id, type, actor_id, post_id, prompt_id)
  select f.follower_id, 'friend_post', new.user_id, new.id, new.prompt_id
  from public.follows f
  where f.followee_id = new.user_id;
  return new;
end;
$$;

drop trigger if exists on_post_created_notify_followers on public.posts;
create trigger on_post_created_notify_followers
  after insert on public.posts
  for each row execute function public.notify_friend_post();

-- ---------------------------------------------------------------------------
-- Type 3: new follower
-- ---------------------------------------------------------------------------
create or replace function public.notify_new_follower()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.notifications (user_id, type, actor_id)
  values (new.followee_id, 'new_follower', new.follower_id);
  return new;
end;
$$;

drop trigger if exists on_follow_created_notify on public.follows;
create trigger on_follow_created_notify
  after insert on public.follows
  for each row execute function public.notify_new_follower();

-- ---------------------------------------------------------------------------
-- Type 4: like on your post (not self-like)
-- ---------------------------------------------------------------------------
create or replace function public.notify_post_like()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.notifications (user_id, type, actor_id, post_id)
  select po.user_id, 'post_like', new.user_id, new.post_id
  from public.posts po
  where po.id = new.post_id
    and po.user_id <> new.user_id;
  return new;
end;
$$;

drop trigger if exists on_like_created_notify on public.likes;
create trigger on_like_created_notify
  after insert on public.likes
  for each row execute function public.notify_post_like();

-- ---------------------------------------------------------------------------
-- Type 5: comment on your post (not self-comment)
-- ---------------------------------------------------------------------------
create or replace function public.notify_post_comment()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.notifications (user_id, type, actor_id, post_id)
  select po.user_id, 'post_comment', new.user_id, new.post_id
  from public.posts po
  where po.id = new.post_id
    and po.user_id <> new.user_id;
  return new;
end;
$$;

drop trigger if exists on_comment_created_notify on public.comments;
create trigger on_comment_created_notify
  after insert on public.comments
  for each row execute function public.notify_post_comment();
