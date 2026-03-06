# Planner local setup

The planner API requires PostgreSQL. Follow these steps to run it locally.

## 1. Get a Postgres database

Choose one:

- **Neon** (free): https://neon.tech → create project → copy connection string
- **Supabase** (free): https://supabase.com → create project → Settings → Database → connection string
- **Local Postgres**: `postgresql://postgres:postgres@localhost:5432/nowercise`

## 2. Configure `.env`

Edit `.env` and set `DATABASE_URL`:

```
DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require
```

## 3. Run migrations

```bash
npm run db:migrate
```

This applies `0003_planned_sessions.sql` and `0004_planner_constraints.sql`.

## 4. Start the dev server

```bash
npm run dev
```

## 5. Test the planner

Open in browser:

**http://localhost:5000/api/planner/week?demo=true**

Expected: JSON with `ok: true` and `sessions` array (Mon/Wed/Fri strength).
