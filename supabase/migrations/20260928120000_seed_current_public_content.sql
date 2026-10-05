-- Apply after 20260928111011_admin_dashboard.sql.
-- Ensure every current JSON-fallback event and project exists in Supabase.
-- This migration only inserts missing content; it never updates or deletes rows.

insert into public.events (
  id, title, starts_at, ends_at, date_tbd, location, description, summary,
  rsvp_url, recap_url, status
)
select
  '00000000-0000-4000-8000-000000000001'::uuid,
  'UMass Lowell Fall Engagement Fair',
  '2026-08-31T16:00:00Z'::timestamptz,
  null,
  false,
  'TBD',
  'Our first event of the semester. We met students at the fair, introduced the e-board, and invited people to get involved.',
  'Our first event of the semester. We met students at the fair, introduced the e-board, and invited people to get involved.',
  null,
  null,
  'published'
where not exists (
  select 1
  from public.events
  where lower(title) = lower('UMass Lowell Fall Engagement Fair')
    and starts_at = '2026-08-31T16:00:00Z'::timestamptz
)
on conflict (id) do nothing;

insert into public.events (
  id, title, starts_at, ends_at, date_tbd, location, description, summary,
  rsvp_url, recap_url, status
)
select
  '00000000-0000-4000-8000-000000000002'::uuid,
  'AI & ML Club kickoff social',
  '2026-09-24T22:30:00Z'::timestamptz,
  null,
  false,
  'TBD',
  'The AI & ML Club held its semester kickoff social.',
  'The AI & ML Club held its semester kickoff social.',
  null,
  null,
  'published'
where not exists (
  select 1
  from public.events
  where lower(title) = lower('AI & ML Club kickoff social')
    and starts_at = '2026-09-24T22:30:00Z'::timestamptz
)
on conflict (id) do nothing;

insert into public.events (
  id, title, starts_at, ends_at, date_tbd, location, description, summary,
  rsvp_url, recap_url, status
)
select
  '00000000-0000-4000-8000-000000000003'::uuid,
  'AI Agents',
  '2026-10-08T22:30:00Z'::timestamptz,
  null,
  false,
  'Olsen-330',
  'Learn how to utilize the power of agents to build anything you can imagine.',
  null,
  null,
  null,
  'published'
where not exists (
  select 1
  from public.events
  where lower(title) = lower('AI Agents')
    and starts_at = '2026-10-08T22:30:00Z'::timestamptz
)
on conflict (id) do nothing;

insert into public.projects (
  id, title, description, tags, status, github_url, demo_url,
  cover_image_path, visibility, sort_order
)
select
  '00000000-0000-4000-8000-000000000004'::uuid,
  'SquadPulse',
  'Affordable sports-science analytics for high school and collegiate teams, tracking training loads and flagging injury-risk spikes without costly wearables or subscriptions.',
  array[]::text[],
  'active',
  null,
  null,
  null,
  'published',
  0
where not exists (
  select 1
  from public.projects
  where lower(title) = lower('SquadPulse')
)
on conflict (id) do nothing;
