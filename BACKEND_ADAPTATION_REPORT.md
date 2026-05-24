# Backend Adaptation Report

## Reference Repo Studied

Reference: `yuvi76/twitch-clone`.

Useful concepts studied:

- LiveKit ingress creation and reset flow
- stream record fields: server URL, stream key, live state, chat settings
- creator dashboard key display pattern
- LiveKit webhook-driven `ingress_started` / `ingress_ended` live status updates
- stream-room chat/sidebar composition

## What Was Reused Conceptually

- Twitch-style OBS/RTMP creator flow
- private stream key shown only in creator dashboard
- separate stream status model
- provider ingress abstraction
- websocket-style live chat channel

No UI, Clerk auth, Prisma schema, MongoDB model, or LiveKit SDK code was copied into L00T.tv.

## What Was Rejected

- Clerk: L00T.tv is wallet-first and does not need email/password identity.
- MongoDB/Prisma: this repo already has a Postgres/Drizzle package.
- LiveKit as a hard dependency: it is viable later, but no credentials or final provider choice were available. The backend now has a provider interface so LiveKit, Livepeer, Mux, or Cloudflare Stream can be added cleanly.
- Generic Twitch clone frontend patterns: current L00T.tv styling and route structure were preserved.

## Final Backend Architecture

- Express 5 API server in `artifacts/api-server`
- Postgres + Drizzle schema in `lib/db`
- Cookie session wallet auth
- Base payment verification through JSON-RPC
- AES-256-GCM encrypted stream keys
- Provider abstraction in `src/lib/stream-provider.ts`
- provider-neutral stream status webhook at `POST /api/stream-webhooks/status`
- WebSocket chat at `/api/realtime`
- OpenAPI spec updated in `lib/api-spec/openapi.yaml`
- `/api/healthz` and `/api/readiness` are available before database setup; product routes return a clear `503` until `DATABASE_URL` is configured.

## Database Models

Implemented Drizzle tables:

- `users`
- `creator_profiles`
  - includes `banner_url` and `channel_color`; frontend now has local banner upload UX and color fallback ready to connect to persistent storage
- `categories`
- `streams`
- `posts`
- `chat_messages`
- `donations`
- `subscription_plans`
- `subscriptions`
- `auth_sessions`

## API Endpoints

Implemented endpoints cover auth, users/profiles, creators, categories, streams, posts, chat, donations, subscriptions, and stats, including:

- `POST /api/auth/nonce`
- `POST /api/auth/verify`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET/PATCH /api/me`
- `GET/POST /api/creators`
- `GET /api/creators/:username`
- `PATCH /api/creators/me`
- `GET /api/categories`
- `GET/POST /api/streams`
- `GET/PATCH /api/streams/:id`
- `POST /api/streams/:id/start`
- `POST /api/streams/:id/end`
- `POST /api/streams/:id/regenerate-key`
- `POST /api/stream-webhooks/status`
- `GET /api/creators/:username/live`
- `PATCH /api/subscription-plans/me`
- `GET /api/creators/:username/supporters`
- post, chat, payment, subscription, and stats routes listed in the OpenAPI spec

## Streaming Decision

Current provider is `stub` by default for local development. This returns deterministic RTMP/playback-style values and real encrypted stream keys without locking the app to a vendor.

Production path:

- set `STREAM_PROVIDER=livekit`, `livepeer`, `mux`, or `cloudflare`
- implement adapter behind `StreamProvider`
- translate provider webhooks into `POST /api/stream-webhooks/status`
- keep DB/API/frontend contracts stable

## Auth Decision

Wallet-first SIWE-style auth was implemented without Clerk:

- nonce stored on user
- wallet signs structured L00T.tv message
- backend verifies recovered address with `ethers`
- backend creates HTTP-only session cookie

## Payment Verification Plan

Backend verifies Base transactions server-side:

- validates configured Base chain id
- ETH: sender, recipient, confirmed receipt, minimum amount
- L00T ERC-20: transfer log, token address, sender, recipient, minimum amount
- payments go directly to creator wallet for MVP

## Risks

- Requires real `DATABASE_URL`, `BASE_RPC_URL`, `AUTH_SECRET`, `ENCRYPTION_KEY`, and `L00T_TOKEN_ADDRESS`.
- Streaming provider adapter still needs final vendor credentials.
- Frontend payment modals still need wallet transaction initiation.
- OpenAPI codegen now runs through `pnpm --filter @workspace/api-spec codegen`; the zod package post-processes its index to avoid duplicate generated exports.
- Demo backend data can be seeded with `pnpm --filter @workspace/scripts seed:demo` after categories are seeded.
- Production launch still requires end-to-end verification against a real database, real Base RPC, and the selected streaming provider.
