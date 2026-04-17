# FrameGame

A mobile-web social photo app where everyone responds to the same daily prompt. Built with Next.js + Supabase.

Unlike BeReal, the shared constraint is the **prompt**, not the timing: you have the whole day. Each day's submissions form a shared collage that everyone can browse, like, and comment on.

## Stack

- Next.js 15 (App Router, React Server Components) + TypeScript
- Tailwind CSS v4
- Supabase (Postgres + Auth + Storage + Edge Functions)
- TanStack Query (for optimistic client mutations)
- `browser-image-compression` (client-side resize before upload)
- Sonner (toasts) + Lucide (icons)

## Project layout

```
src/
  app/
    (app)/              # authenticated app shell (header + bottom nav)
      today/            # today's prompt + collage
      compose/          # camera capture + caption + upload
      post/[id]/        # post detail + likes + comments + report/delete
      archive/          # past prompts list
      archive/[date]/   # one past day's feed
      u/[username]/     # public profile
      settings/         # edit profile + sign out
    actions/            # server actions: auth, profile, posts
    api/cron/daily-prompt/  # Vercel Cron endpoint
    auth/callback/      # magic-link OAuth code exchange
    sign-in/            # magic-link form
    onboarding/         # username + avatar
    page.tsx            # landing (signed out)
  components/
    ui/                 # primitives (button, input, avatar, card, skeleton)
    prompt-hero.tsx, collage-grid.tsx, composer.tsx, like-button.tsx, ...
  lib/
    supabase/           # browser, server, middleware, admin clients
    db/                 # typed queries (prompts, posts, comments, profiles)
    types.ts, utils.ts
  middleware.ts         # refreshes Supabase session cookie on every request
supabase/
  migrations/           # 0001_init.sql, 0002_rls.sql, 0003_reports.sql
  functions/daily-prompt/   # optional Edge Function for the daily cron
seed/prompts.json       # ~90 prompts to seed prompt_pool
scripts/seed-prompts.js # loader that pushes prompts.json into Supabase
```

## Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Create a Supabase project** at https://supabase.com.

3. **Apply the schema.** In the Supabase SQL editor, run, in order:

   - `supabase/migrations/0001_init.sql`
   - `supabase/migrations/0002_rls.sql`
   - `supabase/migrations/0003_reports.sql`

   Those migrations also create the `posts` and `avatars` storage buckets with the right RLS policies.

4. **Configure environment variables.** Copy `.env.example` to `.env.local` and fill in:

   - `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from Supabase → Project Settings → API.
   - `SUPABASE_SERVICE_ROLE_KEY` (server-only; used by the cron route and seed script).
   - `NEXT_PUBLIC_SITE_URL=http://localhost:3000` for local magic-link redirects.

5. **Seed the prompt pool and today's prompt.**

   ```bash
   node scripts/seed-prompts.js
   ```

6. **Run the dev server.**

   ```bash
   npm run dev
   ```

   Open http://localhost:3000 on a phone-sized viewport (the shell is capped at 480px).

## Daily prompt rotation

The `prompts` table holds exactly one row per UTC calendar day (enforced by a unique constraint on `active_date`). Rotation can happen two ways:

- **Vercel Cron** (recommended for this project): `vercel.json` already registers `/api/cron/daily-prompt` on `0 0 * * *`. Set `CRON_SECRET` in the Vercel project to lock it down.
- **Supabase Edge Function**: `supabase/functions/daily-prompt/index.ts` is the same logic for teams who prefer Supabase Scheduled Functions.
- **On-demand fallback**: if a user loads `/today` before the cron has run, `getTodayPrompt()` will promote a new prompt itself using the service role. Cron is an optimization, not a dependency.

## One-post-per-day enforcement

- DB: unique constraint `(user_id, prompt_id)` on `posts`.
- Server action: catches the 23505 unique-violation and surfaces a friendly error.
- UI: `/compose` redirects to `/today` if the user has already posted; the feed is locked behind posting until the user contributes.

## Deployment

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial FrameGame build"
git remote add origin git@github.com:<you>/framegame.git
git push -u origin main
```

### 2. Create the Vercel project

- Import the GitHub repo into Vercel. Framework = Next.js (auto-detected).
- Under **Settings → Environment Variables**, add:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `NEXT_PUBLIC_SITE_URL` — set to the production URL, e.g. `https://framegame.vercel.app`
  - `CRON_SECRET` — any random string; Vercel sends it in the cron request.

### 3. Configure Supabase for production

- **Auth → URL Configuration**: set **Site URL** to the Vercel URL and add `https://<vercel-url>/auth/callback` to **Redirect URLs**.
- **Auth → Email Templates**: optional — swap the sign-in template for FrameGame branding.
- **Storage**: confirm the `posts` and `avatars` buckets exist and are marked *public*. They were created by migration `0002_rls.sql`, but double-check.

### 4. Verify cron

After the first deploy, `vercel.json` auto-registers `/api/cron/daily-prompt` to run at `0 0 * * *` UTC. From the Vercel dashboard:

- **Crons** tab → you should see `daily-prompt` listed.
- Hit "Run now" once, then check `prompts` in Supabase — there should be a row for today.

If you'd rather use Supabase's scheduled functions, deploy `supabase/functions/daily-prompt/index.ts` with the Supabase CLI and schedule it in the dashboard instead.

### 5. Pre-launch sanity check

Run the preflight script (requires the same env as the app):

```bash
node scripts/preflight.js
```

It checks that all required env vars are set, all tables exist, the prompt pool has unused rows, and today's prompt has been seeded.

## Classmate beta runbook

1. **Seed content so the first open isn't empty.** Create 2–3 demo accounts and have them post before inviting classmates. An empty feed kills curiosity fast.
2. **Lock down signups.** For a small beta, set Supabase **Auth → Providers → Email → Enable email confirmations** to on, and add classmates' emails to the **Auth → Users** allow list if you want an invite-only flow.
3. **Share a single link.** Post `https://<vercel-url>/` in the class channel with the first prompt teased. The landing page renders today's prompt even for signed-out visitors, which doubles as the hook.
4. **Keep an eye on reports.** `reports` rows are only visible to the service role — check them from the Supabase dashboard daily during the beta.
5. **Collect feedback.** Pin a quick Google form in `/settings` or in the class channel asking about friction points (camera flow, sign-in, prompt quality).

## App icons

`public/icon.svg` ships a small placeholder icon. For best results on iOS Home Screen, generate `icon-192.png` and `icon-512.png` from the SVG (any tool works: [realfavicongenerator.net](https://realfavicongenerator.net), `rsvg-convert`, Figma, etc.) and drop them in `public/`. The PWA manifest already references them.
# frame-game
