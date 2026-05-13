-- =====================================================================
-- LeadPilot AI — RLS Policies
-- Multi-tenant isolation: every table filtered by current_company_id().
-- Run AFTER 001_initial_schema.sql.
-- =====================================================================

-- Enable RLS on every tenant-scoped table
alter table public.companies     enable row level security;
alter table public.users         enable row level security;
alter table public.projects      enable row level security;
alter table public.campaigns     enable row level security;
alter table public.leads         enable row level security;
alter table public.audit_logs    enable row level security;
alter table public.subscriptions enable row level security;

-- =====================================================================
-- COMPANIES — user can read their own company; only company_admin can update
-- =====================================================================
drop policy if exists "companies_select_own"  on public.companies;
drop policy if exists "companies_update_own"  on public.companies;
drop policy if exists "companies_insert_self" on public.companies;

create policy "companies_select_own" on public.companies
  for select
  using (id = public.current_company_id());

create policy "companies_update_own" on public.companies
  for update
  using (
    id = public.current_company_id()
    and public.current_user_role() in ('super_admin','company_admin')
  );

-- Allow any authenticated user to insert a company during onboarding.
-- They will then assign themselves to it via the onboarding flow.
create policy "companies_insert_self" on public.companies
  for insert
  to authenticated
  with check (true);

-- =====================================================================
-- USERS — see/edit users in your own company
-- =====================================================================
drop policy if exists "users_select_company"  on public.users;
drop policy if exists "users_select_self"     on public.users;
drop policy if exists "users_update_self"     on public.users;
drop policy if exists "users_admin_update"    on public.users;
drop policy if exists "users_insert_self"     on public.users;

-- Always allow a user to read their own row (needed before company is set)
create policy "users_select_self" on public.users
  for select
  using (id = auth.uid());

create policy "users_select_company" on public.users
  for select
  using (company_id = public.current_company_id());

-- Allow a user to update their own profile fields
create policy "users_update_self" on public.users
  for update
  using (id = auth.uid())
  with check (id = auth.uid());

-- Company admins can update other users in their company (role, is_active)
create policy "users_admin_update" on public.users
  for update
  using (
    company_id = public.current_company_id()
    and public.current_user_role() in ('super_admin','company_admin')
  );

-- Allow a user to insert their own row (used by onboarding self-assign)
create policy "users_insert_self" on public.users
  for insert
  to authenticated
  with check (id = auth.uid());

-- =====================================================================
-- PROJECTS
-- =====================================================================
drop policy if exists "projects_select" on public.projects;
drop policy if exists "projects_insert" on public.projects;
drop policy if exists "projects_update" on public.projects;
drop policy if exists "projects_delete" on public.projects;

create policy "projects_select" on public.projects
  for select using (company_id = public.current_company_id());

create policy "projects_insert" on public.projects
  for insert with check (
    company_id = public.current_company_id()
    and public.current_user_role() in ('super_admin','company_admin','marketing_manager')
  );

create policy "projects_update" on public.projects
  for update using (
    company_id = public.current_company_id()
    and public.current_user_role() in ('super_admin','company_admin','marketing_manager')
  );

create policy "projects_delete" on public.projects
  for delete using (
    company_id = public.current_company_id()
    and public.current_user_role() in ('super_admin','company_admin')
  );

-- =====================================================================
-- CAMPAIGNS
-- =====================================================================
drop policy if exists "campaigns_select" on public.campaigns;
drop policy if exists "campaigns_insert" on public.campaigns;
drop policy if exists "campaigns_update" on public.campaigns;
drop policy if exists "campaigns_delete" on public.campaigns;

create policy "campaigns_select" on public.campaigns
  for select using (company_id = public.current_company_id());

create policy "campaigns_insert" on public.campaigns
  for insert with check (
    company_id = public.current_company_id()
    and public.current_user_role() in ('super_admin','company_admin','marketing_manager','media_buyer')
  );

create policy "campaigns_update" on public.campaigns
  for update using (
    company_id = public.current_company_id()
    and public.current_user_role() in ('super_admin','company_admin','marketing_manager','media_buyer')
  );

create policy "campaigns_delete" on public.campaigns
  for delete using (
    company_id = public.current_company_id()
    and public.current_user_role() in ('super_admin','company_admin','marketing_manager')
  );

-- =====================================================================
-- LEADS
-- =====================================================================
drop policy if exists "leads_select" on public.leads;
drop policy if exists "leads_insert" on public.leads;
drop policy if exists "leads_update" on public.leads;
drop policy if exists "leads_delete" on public.leads;

create policy "leads_select" on public.leads
  for select using (company_id = public.current_company_id());

create policy "leads_insert" on public.leads
  for insert with check (company_id = public.current_company_id());

create policy "leads_update" on public.leads
  for update using (
    company_id = public.current_company_id()
    and public.current_user_role() in ('super_admin','company_admin','marketing_manager','sales_manager')
  );

create policy "leads_delete" on public.leads
  for delete using (
    company_id = public.current_company_id()
    and public.current_user_role() in ('super_admin','company_admin')
  );

-- =====================================================================
-- AUDIT LOGS — read-only for admins; inserts via service role only
-- =====================================================================
drop policy if exists "audit_select" on public.audit_logs;

create policy "audit_select" on public.audit_logs
  for select using (
    company_id = public.current_company_id()
    and public.current_user_role() in ('super_admin','company_admin')
  );

-- =====================================================================
-- SUBSCRIPTIONS — read-only for company admins
-- =====================================================================
drop policy if exists "subs_select" on public.subscriptions;

create policy "subs_select" on public.subscriptions
  for select using (
    company_id = public.current_company_id()
    and public.current_user_role() in ('super_admin','company_admin')
  );
