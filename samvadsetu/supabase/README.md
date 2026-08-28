# Supabase Setup for SamvadSetu

## 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project.
2. Copy your **Project URL** and **anon public key** from Settings → API.

## 2. Configure environment variables

Create `samvadsetu/.env`:

```
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Never commit `.env` or expose the **service_role** key in the frontend.

## 3. Run migrations

### Option A — Supabase SQL Editor

Run these files in order in the SQL Editor:

1. `supabase/migrations/20260825000001_initial_schema.sql`
2. `supabase/migrations/20260825000002_rls_triggers_storage.sql`

### Option B — Supabase CLI

```bash
cd samvadsetu
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
```

## 4. Verify

- Tables: `profiles`, `problems`, `comments`, `votes`, `evidence`, `verifications`, `activity_log`
- Storage buckets: `problem-images`, `evidence-files`
- RLS enabled on all public tables

## 5. Demo mode (no Supabase)

If `.env` uses placeholder credentials, the app runs in **mock mode** with localStorage and demo accounts:

| Email | Password | Role |
|-------|----------|------|
| admin@samvadsetu.in | demo123 | Admin |
| citizen@samvadsetu.in | demo123 | Citizen |
| student@samvadsetu.in | demo123 | Student |
| industry@samvadsetu.in | demo123 | Industry |
