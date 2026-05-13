# LeadPilot AI — Phase 1 MVP

Multi-tenant SaaS for Egyptian real estate brokerages.
**Next.js 14 + Tailwind + shadcn-style UI + Supabase.**

---

## ⚡ Quick start (5 minutes)

```bash
# 1. Install dependencies
npm install

# 2. Copy env template and fill in your Supabase credentials
cp .env.example .env.local
# → edit .env.local with your Supabase URL + anon key + service role key

# 3. Run the dev server
npm run dev
```

Open **http://localhost:3000**.

---

## 🚀 Full setup (frontend + backend)

### Step 1 — Set up Supabase backend

Read **`docs/PHASE_1_BACKEND_SETUP.md`** end-to-end. You'll:

1. Create a new Supabase project (region: `eu-central-1`)
2. Run the 3 SQL migrations in order:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_rls_policies.sql`
   - `supabase/migrations/003_storage_buckets.sql`
3. Install the Supabase CLI and deploy the Edge Functions:
   ```bash
   supabase login
   supabase link --project-ref YOUR-PROJECT-REF
   supabase functions deploy ai-copy
   supabase functions deploy invite-user
   ```
4. (Optional) Add your Claude API key for real AI copy:
   ```bash
   supabase secrets set CLAUDE_API_KEY=sk-ant-...
   ```
   *Without this, the AI generator returns realistic mock data so you can demo immediately.*

### Step 2 — Configure the frontend

Create `.env.local` from `.env.example`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Step 3 — Update Supabase Auth settings

In your Supabase dashboard → **Authentication → URL Configuration**:

- **Site URL:** `http://localhost:3000`
- **Redirect URLs:** add `http://localhost:3000/auth/callback`

### Step 4 — Run

```bash
npm install
npm run dev
```

### Step 5 — First-time flow

1. Visit `http://localhost:3000` → click **Get started**
2. Create your account (email + password)
3. You'll be redirected to **Onboarding** → name your company + pick brand colors
4. Land on the **Dashboard**
5. Add a **Project** → build a **Campaign** → generate **AI copy**

---

## 📂 Project structure

```
leadpilot-ai/
├── app/
│   ├── (dashboard)/            # Protected routes (sidebar layout)
│   │   ├── dashboard/          # KPIs, charts, recent activity
│   │   ├── projects/           # Projects list + create
│   │   ├── campaigns/          # Kanban board + builder wizard
│   │   ├── leads/              # Read-only lead pipeline
│   │   └── settings/           # Company, team, integrations
│   ├── login/                  # Sign-in (password + magic link)
│   ├── signup/                 # Account creation
│   ├── onboarding/             # Company creation wizard
│   ├── auth/callback/          # Supabase auth callback
│   ├── api/health/             # Health check endpoint
│   ├── layout.tsx              # Root layout (fonts, providers)
│   └── page.tsx                # Public landing page
├── components/
│   ├── ui/                     # Button, Input, Card, Badge, EmptyState
│   ├── layout/                 # Logo, Sidebar, Topbar, PageHeader
│   ├── dashboard/              # KPICard, LeadsChart
│   ├── campaigns/              # CampaignWizard, CopyGenerator
│   └── settings/               # InviteUserForm
├── lib/
│   ├── supabase/               # Client, server, middleware helpers
│   └── utils.ts                # cn, formatEGP, formatDate, timeAgo
├── hooks/
│   └── use-toast.tsx           # Toast notifications
├── types/
│   └── db.ts                   # TypeScript types matching the schema
├── supabase/
│   ├── migrations/             # SQL: schema, RLS, storage
│   └── functions/              # Edge Functions: ai-copy, invite-user
├── middleware.ts               # Auth + onboarding redirect logic
├── tailwind.config.ts
└── package.json
```

---

## 🎨 Design system

- **Fonts:** Syne (display) · DM Sans (body) · DM Mono (code/labels)
- **Background:** `#0a0c10` (deep navy)
- **Surfaces:** `#111318` (cards), `#181c24` (inputs)
- **Borders:** `#222632`
- **Accents:** `#00d4ff` cyan · `#7c5cfc` purple · `#ff6b35` orange
- **Status:** `#22d17a` green · `#f5c842` gold · `#ff4757` red

All colors live in `tailwind.config.ts` and `app/globals.css`.

---

## 🧪 What works in Phase 1

| Feature | Status |
|---|---|
| Email/password auth | ✅ |
| Magic-link auth | ✅ |
| Multi-tenant isolation (RLS) | ✅ |
| Company onboarding | ✅ |
| 6-tier role system | ✅ schema; UI in Phase 2 |
| Projects CRUD | ✅ create + list (edit in next sprint) |
| Campaign builder wizard | ✅ 5 steps, draft mode |
| AI copy generator (Claude) | ✅ real API + mock fallback |
| Dashboard with live data | ✅ KPIs + 14-day chart + recent feed |
| Team invitation | ✅ via `invite-user` Edge Function |
| Lead viewing | ✅ read-only |
| Storage uploads | ✅ buckets + policies (UI uploader next sprint) |

## ⏭ What's Phase 2

- Meta Marketing API OAuth + live campaign publishing
- Meta lead webhook ingestion
- Engaz CRM sync (Zapier path)
- PDF/Excel report generation
- Optimization engine (auto-flag high CPL, scale recs)
- Realtime lead notifications
- Audit log viewer

---

## 🚢 Deploy to Vercel

1. Push to GitHub
2. Import repo in Vercel
3. Add env vars (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SITE_URL`)
4. Deploy
5. Add the Vercel URL (e.g. `https://leadpilot-ai.vercel.app`) to Supabase Auth → URL Configuration → Redirect URLs

---

## 🩹 Troubleshooting

**Stuck on `/onboarding` even after creating a company**
→ The middleware checks `users.company_id`. Re-fetch the page; if still stuck, manually verify in Supabase Table Editor that your `users` row has `company_id` set.

**`new row violates row-level security policy`**
→ You're calling Supabase before the user has a company. RLS allows `companies INSERT` and self-`users UPDATE` for onboarding — make sure the onboarding wizard ran successfully.

**AI copy returns "Edge function error"**
→ Check the Edge Function is deployed: `supabase functions list`. Test directly:
```bash
curl -X POST https://YOUR-REF.supabase.co/functions/v1/ai-copy \
  -H "Authorization: Bearer YOUR_ANON_KEY" -H "Content-Type: application/json" \
  -d '{"project":{"name":"Test","starting_price":1000000,"down_payment_pct":10,"installment_years":5,"usps":["Test"]}}'
```

**Magic link redirects back to login**
→ Add your origin to Supabase Auth → Redirect URLs.
