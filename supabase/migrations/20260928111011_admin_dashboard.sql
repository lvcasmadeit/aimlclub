-- AI & ML Club admin content. Run this migration before enabling Supabase env vars.

create table if not exists public.admin_users (
  email text primary key check (email = lower(email)),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(trim(title)) between 1 and 120),
  starts_at timestamptz,
  ends_at timestamptz,
  date_tbd boolean not null default false,
  location text not null check (char_length(trim(location)) between 1 and 160),
  description text not null check (char_length(trim(description)) between 1 and 2000),
  summary text check (summary is null or char_length(trim(summary)) <= 2000),
  rsvp_url text,
  recap_url text,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint events_date_state check (
    (date_tbd and starts_at is null and ends_at is null)
    or (not date_tbd and starts_at is not null and (ends_at is null or ends_at > starts_at))
  )
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(trim(title)) between 1 and 120),
  description text not null check (char_length(trim(description)) between 1 and 2000),
  tags text[] not null default '{}',
  status text not null check (status in ('active', 'shipped', 'exploring')),
  github_url text,
  demo_url text,
  cover_image_path text,
  visibility text not null default 'draft' check (visibility in ('draft', 'published', 'archived')),
  sort_order integer not null default 0,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists events_public_date_idx
  on public.events (starts_at asc nulls last)
  where status = 'published';

create index if not exists projects_public_order_idx
  on public.projects (sort_order asc, created_at desc)
  where visibility = 'published';

-- This security-definer helper can be used by RLS policies without exposing
-- the admin allowlist to anonymous users.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_users
    where is_active
      and lower(email) = lower(coalesce((select auth.jwt() ->> 'email'), ''))
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

alter table public.admin_users enable row level security;
alter table public.events enable row level security;
alter table public.projects enable row level security;

revoke all on public.admin_users from anon, authenticated;
grant select on public.admin_users to authenticated;
grant select on public.events, public.projects to anon, authenticated;
grant insert, update, delete on public.events, public.projects to authenticated;

create policy "Users can read their own admin record"
  on public.admin_users for select to authenticated
  using (lower(email) = lower(coalesce((select auth.jwt() ->> 'email'), '')));

create policy "Public can read published events and admins can read all"
  on public.events for select to anon, authenticated
  using (status = 'published' or (select public.is_admin()));

create policy "Admins can create events"
  on public.events for insert to authenticated
  with check ((select public.is_admin()));

create policy "Admins can update events"
  on public.events for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "Admins can archive events"
  on public.events for delete to authenticated
  using ((select public.is_admin()));

create policy "Public can read published projects and admins can read all"
  on public.projects for select to anon, authenticated
  using (visibility = 'published' or (select public.is_admin()));

create policy "Admins can create projects"
  on public.projects for insert to authenticated
  with check ((select public.is_admin()));

create policy "Admins can update projects"
  on public.projects for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "Admins can archive projects"
  on public.projects for delete to authenticated
  using ((select public.is_admin()));

insert into public.admin_users (email)
values ('lucas_brandao@student.uml.edu')
on conflict (email) do update set is_active = excluded.is_active;

-- Preserve the current timeline when the public site switches to Supabase.
insert into public.events (
  id, title, starts_at, date_tbd, location, description, summary, status
)
values
  (
    '00000000-0000-4000-8000-000000000001',
    'UMass Lowell Fall Engagement Fair',
    '2026-08-31T16:00:00Z',
    false,
    'TBD',
    'Our first event of the semester. We met students at the fair, introduced the e-board, and invited people to get involved.',
    'Our first event of the semester. We met students at the fair, introduced the e-board, and invited people to get involved.',
    'published'
  ),
  (
    '00000000-0000-4000-8000-000000000002',
    'AI & ML Club kickoff social',
    '2026-09-24T22:30:00Z',
    false,
    'TBD',
    'The AI & ML Club held its semester kickoff social.',
    'The AI & ML Club held its semester kickoff social.',
    'published'
  )
on conflict (id) do nothing;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'project-covers',
  'project-covers',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']::text[]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Public can view project cover images"
  on storage.objects for select to public
  using (bucket_id = 'project-covers');

create policy "Admins can upload project cover images"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'project-covers' and (select public.is_admin()));

create policy "Admins can update project cover images"
  on storage.objects for update to authenticated
  using (bucket_id = 'project-covers' and (select public.is_admin()))
  with check (bucket_id = 'project-covers' and (select public.is_admin()));

create policy "Admins can delete project cover images"
  on storage.objects for delete to authenticated
  using (bucket_id = 'project-covers' and (select public.is_admin()));
