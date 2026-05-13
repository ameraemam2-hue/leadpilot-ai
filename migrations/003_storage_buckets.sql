-- =====================================================================
-- Storage Buckets — run in SQL Editor after creating buckets in UI
-- (or use the SQL below to create them programmatically)
-- =====================================================================

-- Create buckets (id, name, public)
insert into storage.buckets (id, name, public)
values
  ('company-assets', 'company-assets', true),
  ('project-media',  'project-media',  true),
  ('reports',        'reports',        false)
on conflict (id) do nothing;

-- =====================================================================
-- Storage policies — restrict uploads to a company's own folder.
-- Convention: object path = "<company_id>/<filename>"
-- =====================================================================

-- COMPANY ASSETS
drop policy if exists "company_assets_read"   on storage.objects;
drop policy if exists "company_assets_write"  on storage.objects;
drop policy if exists "company_assets_update" on storage.objects;
drop policy if exists "company_assets_delete" on storage.objects;

create policy "company_assets_read" on storage.objects
  for select using (bucket_id = 'company-assets');

create policy "company_assets_write" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'company-assets'
    and (storage.foldername(name))[1] = public.current_company_id()::text
  );

create policy "company_assets_update" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'company-assets'
    and (storage.foldername(name))[1] = public.current_company_id()::text
  );

create policy "company_assets_delete" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'company-assets'
    and (storage.foldername(name))[1] = public.current_company_id()::text
  );

-- PROJECT MEDIA
drop policy if exists "project_media_read"   on storage.objects;
drop policy if exists "project_media_write"  on storage.objects;
drop policy if exists "project_media_update" on storage.objects;
drop policy if exists "project_media_delete" on storage.objects;

create policy "project_media_read" on storage.objects
  for select using (bucket_id = 'project-media');

create policy "project_media_write" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'project-media'
    and (storage.foldername(name))[1] = public.current_company_id()::text
  );

create policy "project_media_update" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'project-media'
    and (storage.foldername(name))[1] = public.current_company_id()::text
  );

create policy "project_media_delete" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'project-media'
    and (storage.foldername(name))[1] = public.current_company_id()::text
  );

-- REPORTS (private)
drop policy if exists "reports_read"   on storage.objects;
drop policy if exists "reports_write"  on storage.objects;

create policy "reports_read" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'reports'
    and (storage.foldername(name))[1] = public.current_company_id()::text
  );

create policy "reports_write" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'reports'
    and (storage.foldername(name))[1] = public.current_company_id()::text
  );
