# Agents Instructions

## Cursor Cloud specific instructions

### Overview

Nowercise is a full-stack Node.js/TypeScript monolith (Express + React/Vite) for cancer patient exercise management. A single Express server on port 5000 serves both the REST API (`/api/*`) and the React SPA (via Vite dev middleware in development).

### Database: Local PostgreSQL via WebSocket proxy

The app uses `@neondatabase/serverless` which communicates with PostgreSQL through WebSocket. For local development, two helper files in `.dev/` bridge local PostgreSQL:

- `.dev/ws-proxy.mjs` — WebSocket-to-TCP proxy on port 5488 forwarding to PostgreSQL on port 5432
- `.dev/neon-local.mjs` — Node.js preload script that configures `neonConfig` for local WebSocket mode

Both must be active when running the app. Start the proxy first, then set `NODE_OPTIONS="--import /workspace/.dev/neon-local.mjs"` for all Node commands that touch the database (dev server, drizzle-kit, etc.).

### Required environment variables

| Variable | Value for local dev |
|---|---|
| `DATABASE_URL` | `postgresql://ubuntu@localhost/nowercise` |
| `SESSION_SECRET` | any non-empty string |
| `REPLIT_DOMAINS` | `localhost:5000` |
| `REPL_ID` | `local-dev` |
| `OPENAI_API_KEY` | `sk-dummy-local-dev` (AI features will fail gracefully) |
| `NODE_OPTIONS` | `--import /workspace/.dev/neon-local.mjs` |

### Starting the dev server

```bash
# 1. Ensure PostgreSQL is running
sudo pg_ctlcluster 16 main start

# 2. Start WebSocket proxy (background)
node /workspace/.dev/ws-proxy.mjs &

# 3. Start dev server
DATABASE_URL="postgresql://ubuntu@localhost/nowercise" \
SESSION_SECRET="dev-session-secret" \
REPLIT_DOMAINS="localhost:5000" \
REPL_ID="local-dev" \
OPENAI_API_KEY="sk-dummy-local-dev" \
NODE_OPTIONS="--import /workspace/.dev/neon-local.mjs" \
npm run dev
```

The app is available at `http://localhost:5000/?demo=true` (demo mode bypasses Replit auth).

### Key commands

| Action | Command |
|---|---|
| Dev server | `npm run dev` (with env vars above) |
| TypeScript check | `npm run check` (has pre-existing type errors) |
| Tests | `npm run test` (30 tests, all pass) |
| Build | `npm run build` (Vite client + esbuild server) |
| DB schema push | `npx drizzle-kit push` (needs `DATABASE_URL` + `NODE_OPTIONS`) |

### Gotchas

- `npm run check` (tsc) reports ~80+ pre-existing type errors. The app still runs fine because `tsx` and Vite transpile without strict type checking.
- The `connect-pg-simple` session store requires a `sessions` table. It is created by `drizzle-kit push` from the schema.
- PostgreSQL `pg_hba.conf` must use `trust` auth for `127.0.0.1` TCP connections (the update script handles this).
- The WebSocket proxy must be running before the dev server or any drizzle-kit commands.
