# Coffee Tracker

Coffee Tracker is a full-stack monorepo for logging coffees, tracking cups, and organizing roasters.

## Tech Stack

- Client: React, TypeScript, Vite, Clerk
- Server: Express, TypeScript, Prisma, Clerk
- Shared package: common types and API contracts

## Repository Structure

- `client/` - React frontend
- `server/` - Express API and Prisma schema/migrations
- `shared/` - shared TypeScript types used by client and server

## Prerequisites

- Node.js 20+
- npm 10+
- PostgreSQL database
- Clerk account and API keys

## Installation

```bash
npm install
```

## Environment Variables

Create a `.env` file in `server/` with values for your environment.

Typical variables include:

```bash
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DB_NAME
CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...
CLIENT_URL=http://localhost:5174
PORT=3000
```

Create a `.env` file in `client/` as needed:

```bash
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
# Optional: defaults to /api/v1
VITE_API_URL=/api/v1
```

## Database Setup

Generate Prisma client and run migrations:

```bash
npm run db:generate
npm run db:migrate
```

## Run in Development

Run both server and client:

```bash
npm run dev
```

Or run each service separately:

```bash
npm run dev:server
npm run dev:client
```

## Build

```bash
npm run build
```

## Lint

```bash
npm run lint
```

## Health Endpoints

- `GET /health`
- `GET /api/health`

## Deployment

A Vercel deployment guide is available at `VERCEL_DEPLOYMENT.md`.
