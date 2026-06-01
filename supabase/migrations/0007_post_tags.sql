-- post_tags: many-to-many between posts and tagged profiles

create table public.post_tags (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  tagged_user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (post_id, tagged_user_id)
);

create index post_tags_post_idx on public.post_tags (post_id);
create index post_tags_user_idx on public.post_tags (tagged_user_id);

alter table public.post_tags enable row level security;

create policy "anyone can read post_tags"
  on public.post_tags for select
  using (true);

create policy "post owner can insert tags"
  on public.post_tags for insert
  with check (
    auth.uid() = (select user_id from public.posts where id = post_id)
  );

create policy "post owner can delete tags"
  on public.post_tags for delete
  using (
    auth.uid() = (select user_id from public.posts where id = post_id)
  );

-- Allow 'tag' in notifications.type
alter table public.notifications
  drop constraint if exists notifications_type_check;

alter table public.notifications
  add constraint notifications_type_check check (
    type in (
      'new_prompt',
      'friend_post',
      'new_follower',
      'post_like',
      'post_comment',
      'tag'
    )
  );

-- Trigger: fire a notification when a user is tagged in a post
create or replace function public.notify_on_tag()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_post_owner uuid;
begin
  select user_id into v_post_owner from public.posts where id = new.post_id;
  -- Skip if the post owner tags themselves
  if v_post_owner = new.tagged_user_id then
    return new;
  end if;
  insert into public.notifications (user_id, type, actor_id, post_id)
  values (new.tagged_user_id, 'tag', v_post_owner, new.post_id);
  return new;
end;
$$;

create trigger post_tags_notify_on_insert
  after insert on public.post_tags
  for each row
  execute function public.notify_on_tag();
