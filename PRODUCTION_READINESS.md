# Production Readiness

## Environment Variables

Required:

- `DATABASE_URL`
- `PORT`
- `APP_URL`
- `CORS_ORIGIN`
- `AUTH_SECRET` or `JWT_SECRET`
- `ENCRYPTION_KEY`
- `BASE_RPC_URL`
- `BASE_CHAIN_ID`
- `L00T_TOKEN_ADDRESS`
- `STREAM_PROVIDER`
- `VITE_API_BASE_URL`
- `VITE_DEMO_MODE=false` for production

Provider-specific:

- `RTMP_INGEST_URL`
- `PLAYBACK_BASE_URL`
- `LIVEKIT_API_URL`
- `LIVEKIT_API_KEY`
- `LIVEKIT_API_SECRET`

See `.env.example`.

## Security Checklist

- HTTP-only session cookie auth
- nonce expiry for wallet login
- server-side signature verification
- server-side payment verification
- stream keys encrypted at rest
- stream keys exposed only through owner route/dashboard flow
- CORS origin configured
- Helmet enabled
- auth/chat/payment rate limits enabled
- chat max length validation
- post/profile/stream input validation
- subscriber-only posts and streams enforced by backend

## Deployment Checklist

1. Provision Postgres.
2. Set all required env vars.
3. Run `pnpm --filter @workspace/db push`.
4. Run `pnpm --filter @workspace/scripts seed:categories`.
5. Deploy API server from `artifacts/api-server`.
6. Deploy frontend from `artifacts/loot-tv`.
7. Set frontend `VITE_API_BASE_URL` if API is not same-origin.
8. Configure streaming provider adapter and webhook.
9. Set `VITE_DEMO_MODE=false`.
10. Verify `/api/healthz` and `/api/readiness`.

## Payment Checklist

- Confirm Base RPC is mainnet or intended testnet.
- Confirm `BASE_CHAIN_ID` matches RPC.
- Confirm `L00T_TOKEN_ADDRESS`.
- Verify creator wallet is correct before accepting payments.
- Verify ETH and ERC-20 transfer logs.
- Treat subscriptions as 30-day access passes only.

## Streaming Checklist

- Choose provider.
- Implement `StreamProvider` adapter.
- Confirm OBS RTMP ingest works.
- Confirm playback URL renders in stream room.
- Wire provider webhook to update `streams.status` and `creator_profiles.is_live`.
- Never log raw stream keys.

## Remaining Risks

- `pnpm install`, `pnpm --filter @workspace/api-spec codegen`, `pnpm run typecheck`, and `pnpm run build` pass locally.
- Frontend build emits a non-blocking bundle size warning; add route-level code splitting before launch if performance budget requires it.
- No real provider credentials, RPC key, or L00T token address were available, so runtime integration needs environment validation in deployment.
- `STREAM_PROVIDER=stub` is local-only. A production adapter and live-status webhook are still required.
- `VITE_DEMO_MODE` must be disabled for production to avoid demo auth/payment states masking real API failures.
