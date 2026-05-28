# Day-of-launch checklist

Use this on launch day. Team ops items — not automated.

## T-0 (before sending the launch message)

- [ ] Landing page says "Email sign-up. Pick a password to get started." (not magic link)
- [ ] Run `npm run preflight` — all tables, buckets, and today's prompt OK
- [ ] Supabase **Auth → Email → Confirm email = OFF**
- [ ] Each team member: sign in, post today's photo, follow everyone via profile links

## T-0 (send launch)

- [ ] Send message from [`launch-message.md`](./launch-message.md) to full cohort **same morning**
- [ ] Include direct profile URLs for each participant (`/u/[username]`)

## T+1 hour

- [ ] Run `node --env-file=.env.local scripts/export-metrics.js`
- [ ] Note: signups vs active users vs lurkers
- [ ] DM anyone who signed up but hasn't posted (feed stays locked for them)

## Each day of study

- [ ] Re-run export-metrics in the morning and after 12pm PT (prompt rollover)
- [ ] Screenshot: Today (locked + unlocked), compose, post detail, notifications, archive
- [ ] Log surprises for the final paper (confusion, drop-off, unexpected behavior)

## T+end (before June 5 final paper)

- [ ] Final metrics snapshot via `export-metrics.js`
- [ ] Record 2–3 min demo video with real posts in the feed
- [ ] Save screenshots for the writeup

## Zone 1 target reminder

~15 **active** users (posted, liked, or commented — not just lurked). Document recruitment attempts even if you fall short.
