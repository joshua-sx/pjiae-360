
-- 3.1 Create/secure storage buckets and policies

-- Create buckets if they don't exist
insert into storage.buckets (id, name, public)
values ('org-assets', 'org-assets', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('employee-imports', 'employee-imports', false)
on conflict (id) do nothing;

-- Ensure RLS is enabled (usually enabled by default)
alter table storage.objects enable row level security;

-- Policies for org-assets (public)
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Public read org-assets'
  ) then
    create policy "Public read org-assets"
      on storage.objects
      for select
      using (bucket_id = 'org-assets');
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Admins manage org-assets (insert)'
  ) then
    create policy "Admins manage org-assets (insert)"
      on storage.objects
      for insert
      with check (
        bucket_id = 'org-assets'
        and (public.has_role('admin'::public.app_role) or public.has_role('director'::public.app_role))
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Admins/owners update org-assets'
  ) then
    create policy "Admins/owners update org-assets"
      on storage.objects
      for update
      using (
        bucket_id = 'org-assets'
        and (
          owner = auth.uid()
          or public.has_role('admin'::public.app_role)
          or public.has_role('director'::public.app_role)
        )
      )
      with check (
        bucket_id = 'org-assets'
        and (
          owner = auth.uid()
          or public.has_role('admin'::public.app_role)
          or public.has_role('director'::public.app_role)
        )
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Admins/owners delete org-assets'
  ) then
    create policy "Admins/owners delete org-assets"
      on storage.objects
      for delete
      using (
        bucket_id = 'org-assets'
        and (
          owner = auth.uid()
          or public.has_role('admin'::public.app_role)
          or public.has_role('director'::public.app_role)
        )
      );
  end if;
end
$$;

-- Policies for employee-imports (private)
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Admins/directors insert employee-imports'
  ) then
    create policy "Admins/directors insert employee-imports"
      on storage.objects
      for insert
      with check (
        bucket_id = 'employee-imports'
        and (public.has_role('admin'::public.app_role) or public.has_role('director'::public.app_role))
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Admins/directors/owners select employee-imports'
  ) then
    create policy "Admins/directors/owners select employee-imports"
      on storage.objects
      for select
      using (
        bucket_id = 'employee-imports'
        and (
          owner = auth.uid()
          or public.has_role('admin'::public.app_role)
          or public.has_role('director'::public.app_role)
        )
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Admins/directors/owners update employee-imports'
  ) then
    create policy "Admins/directors/owners update employee-imports"
      on storage.objects
      for update
      using (
        bucket_id = 'employee-imports'
        and (
          owner = auth.uid()
          or public.has_role('admin'::public.app_role)
          or public.has_role('director'::public.app_role)
        )
      )
      with check (
        bucket_id = 'employee-imports'
        and (
          owner = auth.uid()
          or public.has_role('admin'::public.app_role)
          or public.has_role('director'::public.app_role)
        )
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Admins/directors/owners delete employee-imports'
  ) then
    create policy "Admins/directors/owners delete employee-imports"
      on storage.objects
      for delete
      using (
        bucket_id = 'employee-imports'
        and (
          owner = auth.uid()
          or public.has_role('admin'::public.app_role)
          or public.has_role('director'::public.app_role)
        )
      );
  end if;
end
$$;
