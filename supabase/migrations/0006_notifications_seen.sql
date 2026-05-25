-- Tracks when the user last opened the notifications inbox (bell badge).

alter table public.profiles
  add column if not exists notifications_seen_at timestamptz;
