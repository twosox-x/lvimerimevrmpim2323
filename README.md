# L00T.tv

Base-native creator streaming MVP.

## Stack

- React 19 + Vite frontend in `artifacts/loot-tv`
- Express API in `artifacts/api-server`
- Postgres + Drizzle in `lib/db`
- OpenAPI spec in `lib/api-spec`
- Wallet-first auth
- OBS/RTMP streaming provider abstraction
- Base ETH/L00T payment verification

## Setup

```bash
pnpm install
cp .env.example .env
```

Fill in `DATABASE_URL`, auth/encryption secrets, Base RPC, and L00T token address.

The API can still start without `DATABASE_URL` for health/readiness checks. Product API routes intentionally return `503` until a database is configured.

## Development

Frontend:

```bash
pnpm --filter @workspace/loot-tv dev
```

API:

```bash
PORT=3001 pnpm --filter @workspace/api-server dev
```

Database:

```bash
pnpm --filter @workspace/db push
pnpm --filter @workspace/scripts seed:categories
```

OpenAPI clients:

```bash
pnpm --filter @workspace/api-spec codegen
```

## Quality

```bash
pnpm run typecheck
pnpm run build
```

Current verified status:

- `pnpm install` passes
- `pnpm --filter @workspace/api-spec codegen` passes
- `pnpm run typecheck` passes
- `pnpm run build` passes

The frontend build currently emits a non-blocking large chunk warning. Code splitting can be added after the backend contract is final.

## Deployment Notes

- Frontend can deploy to Vercel from `artifacts/loot-tv`.
- Backend should deploy as a Node service from `artifacts/api-server`.
- Set `VITE_API_BASE_URL` when frontend and API are on different origins.
- Set `VITE_DEMO_MODE=false` for production so demo/local fallback auth does not mask API problems.
- Use `STREAM_PROVIDER=stub` only for local development.
- Do not deploy without production `AUTH_SECRET` and `ENCRYPTION_KEY`.

## Documentation

- `BACKEND_ADAPTATION_REPORT.md`
- `artifacts/loot-tv/FRONTEND_HANDOFF.md`
- `PRODUCTION_READINESS.md`
