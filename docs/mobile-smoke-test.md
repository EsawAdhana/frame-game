# Mobile smoke test checklist

Run on **iOS Safari** and **one Android browser** before inviting participants.

## Sign up & onboarding

- [ ] Open production URL in mobile browser
- [ ] Tap Get started → sign up with email + password (8+ chars)
- [ ] Land on onboarding → pick username → reach `/today`

## Core loop

- [ ] Today's prompt visible on `/today`
- [ ] Tap Post → pick/take photo → add caption → submit
- [ ] Return to `/today` — feed unlocked, your post visible
- [ ] Tap a post → like works
- [ ] Add a comment → appears in thread

## Social graph

- [ ] Open a cohort member's profile URL → Follow works
- [ ] Friend's post appears under Friends on `/today` after follow + their post
- [ ] Notification bell shows activity (new follower, like, comment)

## Edge cases

- [ ] Second post same day blocked or shows clear error
- [ ] Locked feed shows blur + dialog when tapping before posting
- [ ] Archive shows past days after prompt rollover

## If something fails

- Photo upload: check Supabase Storage bucket `posts` and RLS
- Sign-up: check Supabase email confirmation is OFF
- Empty prompt: run `npm run preflight` or hit site to trigger on-demand promotion
