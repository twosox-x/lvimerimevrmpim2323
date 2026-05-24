# L00T.tv Frontend Handoff

## Routes

- `/` home
- `/explore` stream browsing with search, category query param support, category chips, live/offline filter, viewer sorting, and empty state
- `/categories` premium game/topic grid with video/GIF category cards
- `/creators` creator directory with search/filter
- `/stream/:id` stream room
- `/@username` and `/creator/:username` creator profile
- `/dashboard` creator dashboard

## Auth States

`src/context/AuthContext.tsx` still preserves localStorage-backed preview state so the deployed static frontend does not break without an API. It now also exposes `connectWallet()`, which attempts a real injected wallet flow:

1. `POST /api/auth/nonce`
2. wallet `personal_sign`
3. `POST /api/auth/verify`
4. secure backend session cookie when the API is available

If no wallet/API is available, the modal falls back to demo mode while keeping the UI states intact.

Demo fallback is now controlled by `VITE_DEMO_MODE`. Local development enables it by default; production should set `VITE_DEMO_MODE=false` so missing backend/payment integration fails visibly instead of pretending success.

Supported UI states:

- logged out browsing
- logged in viewer
- logged in creator
- creator dashboard gate
- subscribed/not subscribed via local preview state
- creator profile incomplete/complete through dashboard onboarding

## Stream Room

`StreamRoomPage.tsx` keeps the existing dark glass/cyan style and now attempts backend integration:

- fetches chat history from `GET /api/streams/:id/chat`
- opens `ws(s)://.../api/realtime?streamId=:id`
- sends chat through `POST /api/streams/:id/chat`
- keeps local optimistic chat and donation/subscription feedback for static preview
- uses playback placeholder until a configured provider returns a playback URL

Subscriber-only stream enforcement is implemented server-side. The frontend should render a locked state when the API response includes `locked: true`.

## Creator Dashboard

Dashboard loops are preserved and partially connected:

- stream creation/update calls `POST /api/streams` / `PATCH /api/streams/:id`
- start/end calls `/api/streams/:id/start` and `/api/streams/:id/end`
- stream key is shown only in dashboard state returned by owner-only routes
- profile update attempts `PATCH /api/creators/me`
- profile settings include display name, bio, channel color circles, and local banner image upload
- if no banner image is uploaded, the creator channel banner uses the selected channel color
- uploaded banner images are stored in local preview state as `bannerUrl`; backend handoff should persist this to `creator_profiles.banner_url`
- post publishing attempts `POST /api/posts`
- subscription plan updates should call `PATCH /api/subscription-plans/me`
- supporter dashboards can read `GET /api/creators/:username/supporters`
- local state fallback remains for Vercel static previews

The dashboard includes RTMP URL, stream key show/hide, copy controls, and the “Never share” warning.

## Profile Visual State

- Default creator/viewer profile images now use `/PFP.jpg` from `artifacts/loot-tv/public/PFP.jpg`.
- Creator cards, stream cards, sidebar identity, stream room identity, and creator profiles all fall back to the same default PFP.
- The owner channel at `/creator/:username` reads local dashboard/AuthContext state, so display name, bio, channel color, banner upload, stream title/category, and posts reflect dashboard edits in preview mode.
- The Profile Settings tab intentionally omits wallet/receive-address details; monetization/payment settings own that information.

## Payments

`DonateModal` and `SubscribeModal` still provide polished local transaction UX. The backend now exposes verification endpoints:

- `POST /api/donations/verify`
- `POST /api/subscriptions/verify`
- `GET /api/creators/:username/subscription-status`
- `PATCH /api/subscription-plans/me`
- `GET /api/creators/:username/supporters`

Next frontend step: wire modal success to wallet transaction submission, then send tx hash to the backend verification endpoints.

## Integration Points

- API base: `VITE_API_BASE_URL`, empty string for same-origin `/api`
- Demo fallback: `VITE_DEMO_MODE=true` locally, `false` in production
- Realtime: `src/lib/api.ts` builds `/api/realtime?streamId=...`
- Auth: `AuthModal` calls `connectWallet()` first, demo fallback second
- Category media remains in `public/category-gifs`

## Known Limits

- Provider playback is abstracted but no paid provider credentials are configured.
- Wallet transaction initiation is not yet implemented in the modals.
- Static preview fallback intentionally remains so public browsing does not point at dead endpoints.
- `pnpm run typecheck` and `pnpm run build` pass locally. The production frontend build emits a non-blocking bundle-size warning.
