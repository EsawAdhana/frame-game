# frame-game

A mobile-web social photo app where everyone responds to the same daily prompt.

## Overview

Unlike BeReal, the shared constraint is the **prompt**, not the timing — you have the whole day to respond. Each day's submissions form a shared collage that everyone can browse, like, and comment on. Built with Next.js 15 (App Router, RSC) on top of Supabase for auth, Postgres, storage, and edge functions.

## Stack

- Next.js 15 + TypeScript
- Tailwind CSS v4
- Supabase (Postgres + Auth + Storage + Edge Functions)
- TanStack Query
- `browser-image-compression` for client-side resize
- Sonner (toasts) + Lucide (icons)

## Getting started

```bash
npm install
```

Create a Supabase project, then apply the SQL migrations in `supabase/migrations/` in order. Seed the prompt pool with:

```bash
npm run seed
```

Run the dev server:

```bash
npm run dev
```

A daily-prompt Vercel Cron endpoint lives at `app/api/cron/daily-prompt/`. See `src/middleware.ts` for the Supabase session refresh, and `src/lib/db/` for typed queries.

## Status

Active.
