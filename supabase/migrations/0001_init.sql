-- FrameGame: initial schema
-- Run via: supabase db push (with Supabase CLI) OR paste into SQL editor.

create extension if not exists "pgcrypto";

-- ============================================================================
-- profiles
-- One row per authenticated user. id mirrors auth.users.id.
-- ============================================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null
    check (char_length(username) between 3 and 24 and username ~ '^[a-z0-9_]+$'),
  display_name text,
  avatar_url text,
  bio text check (char_length(coalesce(bio, '')) <= 160),
  created_at timestamptz not null default now()
);

-- ============================================================================
-- prompt_pool
-- Curated list of prompts the daily cron rotates through.
-- ============================================================================
create table if not exists public.prompt_pool (
  id uuid primary key default gen_random_uuid(),
  text text not null,
  used_on date,
  created_at timestamptz not null default now()
);

-- ============================================================================
-- prompts
-- Exactly one row per calendar day (UTC). active_date is unique.
-- ============================================================================
create table if not exists public.prompts (
  id uuid primary key default gen_random_uuid(),
  text text not null,
  active_date date not null unique,
  created_at timestamptz not null default now()
);

create index if not exists prompts_active_date_idx
  on public.prompts (active_date desc);

-- ============================================================================
-- posts
-- One photo per user per prompt. Enforced via unique (user_id, prompt_id).
-- image_path is the object path in Supabase Storage (bucket "posts").
-- ============================================================================
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  prompt_id uuid not null references public.prompts(id) on delete cascade,
  image_path text not null,
  caption text check (char_length(coalesce(caption, '')) <= 280),
  created_at timestamptz not null default now(),
  unique (user_id, prompt_id)
);

create index if not exists posts_prompt_created_idx
  on public.posts (prompt_id, created_at desc);
create index if not exists posts_user_created_idx
  on public.posts (user_id, created_at desc);

-- ============================================================================
-- likes
-- ============================================================================
create table if not exists public.likes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  post_id uuid not null references public.posts(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, post_id)
);

create index if not exists likes_post_idx on public.likes (post_id);

-- ============================================================================
-- comments
-- ============================================================================
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 500),
  created_at timestamptz not null default now()
);

create index if not exists comments_post_created_idx
  on public.comments (post_id, created_at asc);

-- ============================================================================
-- Helper: create a profiles row automatically when an auth user signs up.
-- The client is expected to UPDATE the placeholder row during /onboarding.
-- We use a short random username placeholder to satisfy the NOT NULL/unique
-- constraints; the user picks a real one immediately after.
-- ============================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  placeholder text;
begin
  placeholder := 'user_' || substr(replace(new.id::text, '-', ''), 1, 10);
  insert into public.profiles (id, username)
  values (new.id, placeholder)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
