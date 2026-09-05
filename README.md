# College Organization Management Backend

Unofficial college student organization management system — membership,
moderator (info), election (info only, real-world voting), monthly dues,
payments, events, notices, complaints.

## Setup

1. `npm install`
2. Copy `.env.example` to `.env` and fill in real values
3. Make sure PostgreSQL is running and `DATABASE_URL` points to it
4. `npm run prisma:generate`
5. `npm run prisma:migrate`
6. `npm run dev`

Dev server uses `tsx watch` (not `ts-node-dev`) to avoid TypeScript 5.9+
compatibility issues (`--ignoreDeprecations` error).

## Structure

- `prisma/schema/` — Prisma schema split into per-entity files
- `src/modules/` — one folder per feature, each with
  `route / controller / service / validation / interface`
- `src/middlewares` — auth guard, error handler, validator, rate limiter
- `src/shared` — catchAsync, sendResponse, pick
- `src/errors` — ApiError + Zod/Prisma error transformers
- `src/utils` — jwt helpers, audit logger, pagination helper

Business logic in controllers/services is left as TODO stubs — only the
Prisma schema and the app/server bootstrap are complete, ready to build on.
