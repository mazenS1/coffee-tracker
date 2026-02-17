# Vercel Deployment Guide

This repo deploys to Vercel as a single project:

- Static frontend from `client/dist`
- Serverless API from `api/[...route].ts` (Express app in `server/src/app.ts`)

## 1) Connect the repository in Vercel

- Import this Git repository in Vercel.
- Use the repository root as the project root.
- `vercel.json` already defines:
  - `installCommand`: `npm install`
  - `buildCommand`: `npm run build:vercel`
  - `outputDirectory`: `client/dist`

## 2) Configure environment variables

Set these in Vercel for `Production` and `Preview`:

- `DATABASE_URL` (serverless pooler/transaction connection string)
- `DIRECT_URL` (direct Postgres URL for Prisma CLI/migrations, recommended)
- `PG_POOL_MAX` (optional, default `5`)
- `CLERK_SECRET_KEY`
- `CLERK_WEBHOOK_SECRET`
- `CLERK_PUBLISHABLE_KEY`
- `CLIENT_URL` (frontend URL for CORS in cross-origin usage)
- `ROASTER_ADMIN_EMAILS` (optional)
- `ROASTER_ADMIN_CLERK_IDS` (optional)

## 3) Run Prisma migrations

Run migrations from CI or local before/with production rollout:

```bash
npm run db:migrate
```

`server/prisma.config.ts` prefers `DIRECT_URL` and falls back to `DATABASE_URL`.

## 4) Deploy and verify

After deployment, verify:

- `GET /api/health` returns `{ "status": "ok" }`
- Authenticated endpoints under `/api/v1/*` work
- Clerk webhook endpoint is configured to:
  - `https://<your-domain>/api/webhooks/clerk`

## Notes

- Local backend development still uses `server/src/server.ts`.
- Vercel runtime uses the serverless entrypoint `api/[...route].ts`.
