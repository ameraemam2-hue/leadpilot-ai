-- =====================================================================
-- LeadPilot AI — Phase 1 MVP — Initial Schema
-- Run this in Supabase SQL Editor (in order, top to bottom).
-- Idempotent where possible. Safe to re-run on a clean project.
-- =====================================================================

-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- =====================================================================
-- 1. COMPANIES (tenants)
-- =====================================================================
create table if not exists public.companies (
  id                       uuid primary key default uuid_generate_v4(),
  name                     text not null,
  slug                     text unique not null,
  logo_url                 text,
  brand_colors             jsonb default '{"primary":"#00d4ff","secondary":"#7c5cfc","accent":"#ff6b35"}'::jsonb,
  meta_ad_account_id       text,
  meta_access_token        text,                  -- encrypted by app layer; never selected by anon
  subscription_plan        text not null default 'free' check (subscription_plan in ('free','starter','pro','enterprise')),
  subscription_expires_at  timestamptz,
  settings                 jsonb default '{}'::jsonb,
  created_at               timestamptz not null default now()
);

create index if not exists idx_companies_slug on public.companies(slug);

-- =====================================================================
-- 2. USERS (mirror of auth.users, extended with tenant + role)
-- =====================================================================
create table if not exists public.users (
  id          uuid primary key references auth.users(id) on delete cascade,
  company_id  uuid references public.companies(id) on delete cascade,
  full_name   text,
  email       text unique not null,
  role        text not null default 'viewer'
              check (role in ('super_admin','company_admin','marketing_manager','media_buyer','sales_manager','viewer')),
  avatar_url  text,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

create index if not exists idx_users_company on public.users(company_id);
create index if not exists idx_users_email   on public.users(email);

-- =====================================================================
-- 3. PROJECTS (real estate projects per company)
-- =====================================================================
create table if not exists public.projects (
  id                 uuid primary key default uuid_generate_v4(),
  company_id         uuid not null references public.companies(id) on delete cascade,
  name               text not null,
  developer_name     text,
  location           text,
  property_type      text check (property_type in ('apartment','villa','townhouse','commercial','chalet','duplex','penthouse')),
  starting_price     bigint,
  down_payment_pct   int check (down_payment_pct between 0 and 100),
  installment_years  int,
  delivery_date      text,
  available_units    int,
  usps               jsonb default '[]'::jsonb,
  target_audience    jsonb default '{}'::jsonb,
  media_urls         jsonb default '[]'::jsonb,
  landing_page_url   text,
  whatsapp_number    text,
  crm_source_code    text,
  is_active          boolean not null default true,
  created_at         timestamptz not null default now()
);

create index if not exists idx_projects_company on public.projects(company_id);
create index if not exists idx_projects_active  on public.projects(company_id, is_active);

-- =====================================================================
-- 4. CAMPAIGNS
-- =====================================================================
create table if not exists public.campaigns (
  id                 uuid primary key default uuid_generate_v4(),
  company_id         uuid not null references public.companies(id) on delete cascade,
  project_id         uuid not null references public.projects(id) on delete cascade,
  created_by         uuid references public.users(id) on delete set null,
  name               text not null,
  objective          text not null default 'LEAD_GENERATION'
                     check (objective in ('LEAD_GENERATION','MESSAGES','TRAFFIC','CONVERSIONS','BRAND_AWARENESS','REACH')),
  status             text not null default 'draft'
                     check (status in ('draft','pending_review','active','paused','completed','archived')),
  budget_daily       int,
  start_date         timestamptz,
  end_date           timestamptz,
  meta_campaign_id   text,
  builder_data       jsonb default '{}'::jsonb,
  ai_generated_copy  jsonb default '{}'::jsonb,
  performance        jsonb default '{}'::jsonb,
  created_at         timestamptz not null default now()
);

create index if not exists idx_campaigns_company  on public.campaigns(company_id);
create index if not exists idx_campaigns_project  on public.campaigns(company_id, project_id);
create index if not exists idx_campaigns_status   on public.campaigns(company_id, status);

-- =====================================================================
-- 5. LEADS
-- =====================================================================
create table if not exists public.leads (
  id            uuid primary key default uuid_generate_v4(),
  company_id    uuid not null references public.companies(id) on delete cascade,
  campaign_id   uuid references public.campaigns(id) on delete set null,
  project_id    uuid references public.projects(id) on delete set null,
  full_name     text,
  phone         text,
  email         text,
  source        text default 'manual'
                check (source in ('meta_lead_form','whatsapp','manual','csv_import','landing_page','referral')),
  status        text not null default 'new'
                check (status in ('new','contacted','qualified','site_visit','reservation','deal','lost')),
  crm_lead_id   text,
  form_answers  jsonb default '{}'::jsonb,
  meta_lead_id  text,
  assigned_to   uuid references public.users(id) on delete set null,
  notes         text,
  created_at    timestamptz not null default now()
);

create index if not exists idx_leads_company   on public.leads(company_id);
create index if not exists idx_leads_status    on public.leads(company_id, status);
create index if not exists idx_leads_campaign  on public.leads(campaign_id, created_at desc);
create index if not exists idx_leads_project   on public.leads(project_id);
create unique index if not exists ux_leads_meta on public.leads(meta_lead_id) where meta_lead_id is not null;

-- =====================================================================
-- 6. AUDIT LOGS
-- =====================================================================
create table if not exists public.audit_logs (
  id           uuid primary key default uuid_generate_v4(),
  company_id   uuid references public.companies(id) on delete cascade,
  user_id      uuid references public.users(id) on delete set null,
  action       text not null,
  table_name   text,
  record_id    uuid,
  old_value    jsonb,
  new_value    jsonb,
  created_at   timestamptz not null default now()
);

create index if not exists idx_audit_company on public.audit_logs(company_id, created_at desc);

-- =====================================================================
-- 7. SUBSCRIPTIONS (placeholder for Phase 3 Stripe billing)
-- =====================================================================
create table if not exists public.subscriptions (
  id                       uuid primary key default uuid_generate_v4(),
  company_id               uuid not null references public.companies(id) on delete cascade,
  plan                     text not null default 'free',
  billing_cycle            text default 'monthly' check (billing_cycle in ('monthly','annual')),
  stripe_subscription_id   text,
  status                   text default 'active',
  created_at               timestamptz not null default now()
);

-- =====================================================================
-- 8. HELPER FUNCTIONS — used inside RLS policies
-- =====================================================================

-- Returns the company_id of the currently authenticated user.
create or replace function public.current_company_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select company_id from public.users where id = auth.uid()
$$;

-- Returns the role of the currently authenticated user.
create or replace function public.current_user_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.users where id = auth.uid()
$$;

-- =====================================================================
-- 9. NEW USER TRIGGER — create a public.users row when auth.users row created
-- =====================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)),
    'viewer'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
