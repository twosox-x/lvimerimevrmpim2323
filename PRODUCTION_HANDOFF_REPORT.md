# L00T.tv Production Handoff Report

Date: 2026-05-23

## Executive Summary

L00T.tv is close to a frontend MVP and has a production-shaped backend foundation, but it is not production-ready yet. The repo can now be installed, typechecked, code-generated, built, and smoke-tested locally before external services are configured.

The main remaining production work is backend/devops integration:

- provision and verify Postgres
- configure production secrets
- choose and implement the streaming provider adapter
- connect real Base RPC and L00T token configuration
- complete frontend wallet transaction initiation
- run end-to-end auth, chat, payment, subscription, and stream-access tests
- deploy frontend and API with production environment separation

The project should be handed off as an integration-ready MVP foundation, not as a launch-ready production platform.

## Current Verified Local Status

The following commands pass locally:

```bash
pnpm install
pnpm --filter @workspace/api-spec run codegen
pnpm run typecheck
pnpm run build
VITE_DEMO_MODE=false pnpm --filter @workspace/loot-tv run build
```

API smoke test without a database:

```bash
PORT=3001 pnpm --filter @workspace/api-server dev
curl http://localhost:3001/api/healthz
curl http://localhost:3001/api/readiness
```

Expected behavior before database setup:

- `/api/healthz` returns healthy
- `/api/readiness` returns degraded with missing configuration details
- product API routes return `503` until `DATABASE_URL` is configured

Known non-blocking warnings:

- frontend production build emits a large chunk warning
- Vite may emit a sourcemap warning from a UI dependency

## Repo Map

- Frontend app: `artifacts/loot-tv`
- API server: `artifacts/api-server`
- Database schema: `lib/db`
- OpenAPI spec: `lib/api-spec/openapi.yaml`
- Generated React client: `lib/api-client-react`
- Generated Zod schemas: `lib/api-zod`
- Category seed script: `scripts/src/seed-categories.ts`
- Environment template: `.env.example`

## What Is Already Implemented

### Frontend

- React 19 + Vite + TypeScript
- Tailwind dark glass/cyan visual system
- responsive home, explore, categories, creators, creator profile, stream room, and dashboard routes
- mobile bottom nav and hover sidebar
- premium category video/GIF cards
- route-specific metadata and favicon
- API helper with `VITE_API_BASE_URL`
- realtime URL helper for WebSocket chat
- wallet-first auth attempt through backend nonce/signature flow
- local demo fallback controlled by `VITE_DEMO_MODE`
- stream dashboard UI with RTMP URL, stream key display, copy controls, and safety warning

### Backend

- Express API server
- health and readiness endpoints
- wallet nonce/signature auth
- HTTP-only cookie session flow
- Postgres/Drizzle schema
- users, creators, categories, streams, posts, chat, donations, subscriptions, and auth sessions tables
- encrypted stream key storage using AES-256-GCM
- stream provider abstraction with local `stub` provider
- WebSocket chat server
- server-side Base ETH and ERC-20/L00T payment verification logic
- rate limits for auth, chat, and payment-sensitive endpoints
- CORS and Helmet
- OpenAPI codegen working

## What Is Not Production-Ready Yet

### Infrastructure

- no production Postgres instance has been provisioned or tested
- no production API hosting target has been verified
- no production frontend deployment has been smoke-tested against the API
- no real domain/CORS/cookie settings have been validated

### Streaming

- `STREAM_PROVIDER=stub` is local-only
- no real Livepeer, Mux, Cloudflare Stream, or LiveKit adapter is implemented yet
- no provider webhook updates live/offline state yet
- OBS ingest and playback have not been verified with a real provider

### Payments

- no real Base RPC key has been tested
- no real L00T token address has been supplied
- frontend donation/subscription modals do not yet initiate real wallet transactions
- backend verification logic needs end-to-end testing with real transaction hashes
- direct-to-creator payment recipient logic needs final product approval

### Auth

- backend wallet signature flow exists, but full frontend account/profile creation still has demo/local fallback paths
- production must set `VITE_DEMO_MODE=false`
- production cookie settings should be verified with the final API/frontend domains

### Testing

- no full automated integration test suite exists yet
- critical flows need end-to-end tests:
  - wallet login
  - creator profile creation
  - stream setup and stream-key owner access
  - subscriber-only posts/streams
  - chat send/read
  - donation verification
  - subscription verification and expiry

## Required Environment Variables

Production backend:

```bash
DATABASE_URL=
PORT=
APP_URL=
CORS_ORIGIN=
AUTH_SECRET=
ENCRYPTION_KEY=
BASE_RPC_URL=
BASE_CHAIN_ID=8453
L00T_TOKEN_ADDRESS=
STREAM_PROVIDER=
```

Production frontend:

```bash
VITE_API_BASE_URL=
VITE_DEMO_MODE=false
```

Streaming provider variables depend on the selected provider. Current placeholders:

```bash
RTMP_INGEST_URL=
PLAYBACK_BASE_URL=
LIVEKIT_API_URL=
LIVEKIT_API_KEY=
LIVEKIT_API_SECRET=
```

`AUTH_SECRET` and `ENCRYPTION_KEY` must be strong production secrets. `ENCRYPTION_KEY` should be a 64-character hex string or high-entropy secret.

## Backend Developer Setup

1. Install dependencies:

```bash
pnpm install
```

2. Copy environment template:

```bash
cp .env.example .env
```

3. Start API in pre-database mode:

```bash
PORT=3001 pnpm --filter @workspace/api-server dev
```

4. Verify health:

```bash
curl http://localhost:3001/api/healthz
curl http://localhost:3001/api/readiness
```

5. Add a real `DATABASE_URL`.

6. Push schema:

```bash
pnpm --filter @workspace/db push
```

7. Seed categories:

```bash
pnpm --filter @workspace/scripts seed:categories
```

8. Regenerate API clients after API contract changes:

```bash
pnpm --filter @workspace/api-spec run codegen
```

9. Run quality checks:

```bash
pnpm run typecheck
pnpm run build
```

## Recommended Production Work Plan

### Priority 1: Database and API Runtime

- provision Postgres
- set `DATABASE_URL`
- run Drizzle push or convert schema to migrations if the deployment process requires immutable migrations
- seed categories
- verify `/api/readiness` returns ready for database
- test all basic read routes with real DB data

Acceptance criteria:

- API starts cleanly with production-like env
- `/api/healthz` returns 200
- `/api/readiness` reports database configured
- categories and creators can be read from DB

### Priority 2: Auth and Session Hardening

- set production `AUTH_SECRET`
- verify cookie behavior across frontend/API domains
- confirm `SameSite`, `Secure`, and CORS settings for final deployment topology
- complete frontend post-auth profile hydration from `/api/auth/me`
- disable demo fallback with `VITE_DEMO_MODE=false`

Acceptance criteria:

- wallet login works against backend
- refresh keeps session
- logout clears session
- demo login is unavailable in production

### Priority 3: Streaming Provider

- choose provider: Livepeer, Mux, Cloudflare Stream, or LiveKit
- implement the provider behind `StreamProvider`
- generate or fetch RTMP ingest URL and stream key
- store stream key encrypted
- return playback URL for stream room
- implement provider webhook for live/offline status

Acceptance criteria:

- creator can create/regenerate stream key
- only stream owner can read stream key
- OBS can stream to provider
- playback works in stream room
- live status updates automatically from webhook

### Priority 4: Payments and Subscriptions

- set `BASE_RPC_URL`
- set final `L00T_TOKEN_ADDRESS`
- confirm recipient wallet strategy
- wire frontend ETH transfer initiation
- wire frontend L00T ERC-20 transfer initiation
- submit tx hash to backend verification endpoints
- record donations/subscriptions after confirmation
- enforce 30-day subscriber access from backend

Acceptance criteria:

- ETH donation verifies on Base
- L00T donation verifies on Base
- ETH subscription creates 30-day access
- L00T subscription creates 30-day access
- subscriber-only content is locked/unlocked by backend state

### Priority 5: Chat and Realtime

- test WebSocket behavior behind deployed API infrastructure
- verify auth requirement for sending messages
- verify public read access where intended
- enforce subscriber-only chat if product requires it
- add production logging around connection failures

Acceptance criteria:

- logged-in users can send chat
- logged-out users cannot send chat
- messages persist in DB
- new messages broadcast live

### Priority 6: Frontend Integration Cleanup

- ensure all core frontend data comes from API in production mode
- remove or hide demo-only wording in production
- finish transaction states in donation/subscription modals
- add clear API error states
- keep existing visual style intact

Acceptance criteria:

- public browsing works from API data
- dashboard writes real backend records
- stream room respects backend access control
- payment success is based on backend verification only

### Priority 7: Security and Abuse Controls

- audit all protected routes
- add production-grade logging
- add request IDs if needed
- confirm rate limits behind deployment proxy
- sanitize/render user content safely
- make sure stream keys are never logged
- verify no private env vars are exposed in frontend bundle

Acceptance criteria:

- creator-only APIs reject non-owners
- stream keys are encrypted and owner-only
- subscriber-only access cannot be bypassed from frontend
- payment status cannot be faked from frontend

### Priority 8: Deployment

- deploy API as a Node service
- deploy frontend as static Vite app, likely Vercel
- configure `VITE_API_BASE_URL`
- configure `CORS_ORIGIN`
- enable HTTPS
- verify cookie/session behavior on deployed domains
- run final smoke checklist

Acceptance criteria:

- deployed frontend can log in through deployed API
- deployed API passes health/readiness
- no demo fallback in production
- all required env vars are set

## Launch Smoke Checklist

- public homepage loads
- explore loads real API stream/category data
- categories load seeded DB data
- creators load real DB data
- wallet login works
- dashboard is gated
- creator can create/edit profile
- creator can create stream setup
- creator can view/regenerate stream key
- non-owner cannot access stream key
- OBS ingest works
- stream playback works
- public stream room opens
- subscriber-only stream locks correctly
- chat send/read works
- ETH donation verifies
- L00T donation verifies
- ETH subscription unlocks for 30 days
- L00T subscription unlocks for 30 days
- subscriber-only posts unlock for active subscribers
- expired subscriptions lose access
- `/api/healthz` returns healthy
- `/api/readiness` returns ready
- production build passes

## Immediate Next Tasks

1. Provision a development Postgres database.
2. Run `pnpm --filter @workspace/db push`.
3. Run `pnpm --filter @workspace/scripts seed:categories`.
4. Start the API with real `DATABASE_URL`.
5. Connect frontend to API using `VITE_API_BASE_URL`.
6. Verify wallet auth end-to-end.
7. Choose the production streaming provider.
8. Implement the provider adapter and webhook.
9. Wire real frontend wallet transactions.
10. Add integration tests around auth, stream key access, payments, and subscriptions.

## Final Readiness Verdict

Current state: backend-dev-ready, not production-ready.

The repo is now in a good state for handoff because it builds, typechecks, code-generates, documents required env vars, and fails gracefully when external services are missing. Production readiness depends on real infrastructure, real provider credentials, and end-to-end verification of money, access control, and streaming behavior.
