# frame-game

A mobile-web social photo app where everyone responds to the same daily prompt. The day's submissions form a shared collage you can browse, like, and comment on. Same idea as BeReal except the shared constraint is the prompt, not the timing, so you have the whole day to respond.

## Stack

Next.js 15 (App Router, RSC) with TypeScript. Tailwind v4. Supabase for Postgres, auth, storage, and edge functions. TanStack Query for client mutations. `browser-image-compression` resizes uploads in the browser. Sonner for toasts, Lucide for icons.

## Setup

```bash
npm install
```

Create a Supabase project and apply the SQL files in `supabase/migrations/` in order, then seed the prompt pool:

```bash
npm run seed
```

Run the dev server:

```bash
npm run dev
```

The daily-prompt Vercel Cron endpoint lives at `app/api/cron/daily-prompt/`. Session refresh happens in `src/middleware.ts`. Typed queries are in `src/lib/db/`.
