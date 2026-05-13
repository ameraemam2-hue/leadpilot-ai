-- =====================================================================
-- DEV SEED DATA — optional. Run only on a local/staging Supabase project.
-- Replace YOUR_AUTH_USER_ID with the UUID of a user you signed up via Auth.
-- =====================================================================

-- Example: assume the auth.users row already exists for you.
-- 1. Sign up via the app (creates auth.users row + public.users row via trigger).
-- 2. Grab your UUID from the Supabase Auth dashboard.
-- 3. Replace below and run.

/*
do $$
declare
  my_user_id uuid := 'YOUR_AUTH_USER_ID';
  my_company_id uuid;
  proj_id uuid;
begin
  -- create company
  insert into public.companies (name, slug, brand_colors)
  values ('New Step Real Estate', 'new-step', '{"primary":"#00d4ff","secondary":"#7c5cfc","accent":"#ff6b35"}'::jsonb)
  returning id into my_company_id;

  -- assign user to company as company_admin
  update public.users
    set company_id = my_company_id, role = 'company_admin', full_name = 'Faris'
    where id = my_user_id;

  -- seed a project
  insert into public.projects (
    company_id, name, developer_name, location, property_type,
    starting_price, down_payment_pct, installment_years, delivery_date,
    available_units, usps, target_audience, whatsapp_number, is_active
  ) values (
    my_company_id, 'Elysium Compound', 'Line Developments', 'Sheikh Zayed', 'apartment',
    4500000, 10, 8, 'Q4 2027',
    120,
    '["Prime Sheikh Zayed location","10% down payment","8-year installments","Smart home features"]'::jsonb,
    '{"age_range":"30-50","income_level":"upper-middle","interests":["luxury","family","investment"]}'::jsonb,
    '+201000000000', true
  ) returning id into proj_id;

  -- seed a draft campaign
  insert into public.campaigns (
    company_id, project_id, created_by, name, objective, status, budget_daily, builder_data
  ) values (
    my_company_id, proj_id, my_user_id,
    'Elysium — Sheikh Zayed — Lead Gen — Launch',
    'LEAD_GENERATION', 'draft', 1500,
    '{"step":5,"audience":{"locations":["Cairo","Giza"],"age_min":30,"age_max":50}}'::jsonb
  );
end $$;
*/
