# LeadPilot AI — Phase 1 Backend Setup Guide

Step-by-step guide to get the **Supabase backend** for LeadPilot AI running.
This is everything that is independent of the Next.js frontend — you can
do all of this **before** the frontend code is written.

---

## ✅ What's in this folder

```
leadpilot-ai/
├── supabase/
│   ├── config.toml                       # Supabase CLI config
│   ├── migrations/
│   │   ├── 001_initial_schema.sql        # All tables + helper functions + trigger
│   │   ├── 002_rls_policies.sql          # Row-Level Security policies
│   │   ├── 003_storage_buckets.sql       # Storage buckets + policies
│   │   └── 004_seed_dev.sql              # Optional dev seed data
│   └── functions/
│       ├── _shared/cors.ts               # Shared CORS headers
│       ├── ai-copy/index.ts              # Claude AI copy generator
│       └── invite-user/index.ts          # Team invitation flow
├── .env.example                          # Frontend env template
└── docs/
    └── PHASE_1_BACKEND_SETUP.md          # ← you are here
```

---

## Step 1 — Create your Supabase project

1. Go to https://supabase.com → **New Project**
2. Settings:
   - **Name:** `leadpilot-prod` (or `leadpilot-staging` for staging)
   - **Region:** `eu-central-1` (Frankfurt — closest to Egypt with low latency)
   - **Database Password:** generate a strong one and **save it in 1Password / Bitwarden**
3. Wait ~2 minutes for provisioning.
4. Once ready, go to **Project Settings → API** and copy:
   - `Project URL` → goes into `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → goes into `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → goes into `SUPABASE_SERVICE_ROLE_KEY` (**SERVER ONLY**)

---

## Step 2 — Run the SQL migrations

Open **SQL Editor** in your Supabase dashboard and run the migrations **in order**:

1. Open `supabase/migrations/001_initial_schema.sql` → paste → **Run**
2. Open `supabase/migrations/002_rls_policies.sql` → paste → **Run**
3. Open `supabase/migrations/003_storage_buckets.sql` → paste → **Run**

After each run, check the **bottom-right toast** for "Success".

### Verify tables exist
Go to **Table Editor** in the left sidebar. You should see:
- `companies`
- `users`
- `projects`
- `campaigns`
- `leads`
- `audit_logs`
- `subscriptions`

### Verify RLS is enabled
Click any table → **Authentication** tab → "Row Level Security" must be **green/enabled**.

### Verify storage buckets
Go to **Storage** → you should see three buckets:
- `company-assets` (public)
- `project-media` (public)
- `reports` (private)

---

## Step 3 — Configure Auth

In **Authentication → URL Configuration**:

- **Site URL:** `http://localhost:3000` (for local dev)
- **Redirect URLs:** add both:
  - `http://localhost:3000/auth/callback`
  - `https://your-production-domain.com/auth/callback` (after you deploy)

In **Authentication → Providers**:
- **Email**: enabled. Toggle "Confirm email" ON for production, OFF for dev speed.
- **Magic Link**: enabled.
- (Phase 3) Google, Facebook OAuth will be added later.

In **Authentication → Email Templates** (optional but recommended):
- Customize the "Invite user" template — add your brand and a clear CTA.

---

## Step 4 — Install the Supabase CLI (for Edge Functions)

```bash
# macOS
brew install supabase/tap/supabase

# Windows / Linux
npm install -g supabase
```

Verify:
```bash
supabase --version
```

---

## Step 5 — Link the local project to your Supabase instance

From inside the `leadpilot-ai/` folder:

```bash
supabase login
supabase link --project-ref YOUR-PROJECT-REF
```

Your `PROJECT-REF` is the part of the URL: `https://YOUR-PROJECT-REF.supabase.co`.

---

## Step 6 — Deploy the Edge Functions

```bash
# from project root
supabase functions deploy ai-copy
supabase functions deploy invite-user
```

You should see `Deployed Function ai-copy` in green.

### Set the function secrets

```bash
supabase secrets set CLAUDE_API_KEY=sk-ant-XXXXXX
supabase secrets set CLAUDE_MODEL=claude-sonnet-4-20250514
```

> **Note:** If you don't set `CLAUDE_API_KEY`, the `ai-copy` function will return
> **realistic mock data** instead of failing. This lets you keep developing
> without an Anthropic key. When you're ready to flip the switch, just set
> the secret — no redeploy needed.

### Test the AI copy function

```bash
curl -X POST \
  https://YOUR-PROJECT-REF.supabase.co/functions/v1/ai-copy \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "project": {
      "name": "Elysium Compound",
      "location": "Sheikh Zayed",
      "starting_price": 4500000,
      "down_payment_pct": 10,
      "installment_years": 8,
      "usps": ["Smart home", "Prime location"]
    }
  }'
```

You should get back JSON with `headlines`, `primary_texts`, `whatsapp_script`.

---

## Step 7 — Optional: seed dev data

After signing up your first user via the frontend (Step 9 — comes later):

1. Open Supabase **SQL Editor**
2. Open `004_seed_dev.sql`
3. Replace `YOUR_AUTH_USER_ID` with your real auth user UUID
   (find it in **Authentication → Users**)
4. Uncomment the `do $$ ... end $$;` block
5. Run

This will create a sample company, project, and draft campaign linked to you.

---

## Step 8 — Environment variables for the frontend

Create `.env.local` in your Next.js project root with:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

> ⚠️ **Never** commit `.env.local`. It's already in `.gitignore`.
> ⚠️ **Never** use `SUPABASE_SERVICE_ROLE_KEY` in client components — only in
> server actions, API routes, or Edge Functions.

---

## Step 9 — (Coming next) Frontend wiring

Once you upload your existing React prototype ZIP, I'll generate:
- The Next.js 14 project structure
- Supabase client setup (browser + server)
- Auth pages (login, signup, magic link, callback)
- `useAuth()` and `useCompany()` hooks
- Onboarding wizard (creates company + assigns user as admin)
- Projects CRUD with image upload
- Campaign Builder wizard (draft mode)
- AI Copy generator UI calling the `ai-copy` Edge Function
- Dashboard with KPI cards reading real Supabase data

---

## ✅ Verification checklist before moving to frontend

- [ ] All 7 tables visible in Table Editor
- [ ] RLS enabled (green) on all 7 tables
- [ ] All 3 storage buckets created
- [ ] Edge Function `ai-copy` deployed and curl test returned JSON
- [ ] Edge Function `invite-user` deployed
- [ ] Site URL + Redirect URL configured in Auth settings
- [ ] You can sign up a test user via Authentication → Users → "Add user"
- [ ] After signup, a row automatically appears in `public.users` (trigger works)

If all checks pass, you're ready for the Next.js frontend.

---

## Troubleshooting

**"new row violates row-level security policy"**
→ The user's `company_id` is `null`. They need to complete onboarding (which
inserts a `companies` row and updates their `users.company_id`).

**Edge function returns 401**
→ Add `Authorization: Bearer <SUPABASE_ANON_KEY>` header. JWT verification is
enabled by default.

**Trigger didn't create a `public.users` row**
→ Check `Database → Triggers`. You should see `on_auth_user_created` on
`auth.users`. If missing, re-run `001_initial_schema.sql`.

**Storage upload fails with "row-level security"**
→ The file path must start with the user's `company_id`. Convention:
`{company_id}/{filename.ext}`.

---

_Generated by Arena.ai Agent Mode for the LeadPilot AI Phase 1 build._
