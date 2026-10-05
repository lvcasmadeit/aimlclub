# Production Supabase and admin dashboard

The dashboard at `/admin` manages events and projects using the existing Production Supabase project. The owner has chosen to share that database with local development and any future Vercel Preview deployments; no separate Supabase project or database branch is planned.

The application allows content mutations in local development (`NODE_ENV=development`) and on the Vercel Production deployment. Vercel Preview dashboard UIs/server actions are read-only. Local writes go directly to Production Supabase. This is an application-level safeguard, not database isolation: Supabase RLS authorizes the allowlisted admin independent of deployment environment, so an authenticated admin could still write directly through Supabase APIs.

Do not unset or replace the current Production environment variables or apply SQL to Production without the owner's explicit approval. The owner has authorized adding the Agents event through the local dashboard; all such local saves affect live Production data. The Production schema and existing rows have not otherwise been fully verified, and the owner will perform broader live CRUD testing separately.

## 1. Verify Production before applying SQL

The Production database may already contain some or all of the admin schema and public content. In the Supabase dashboard for the Production project:

1. Check **Table Editor** for `public.admin_users`, `public.events`, and `public.projects`.
2. Review existing event titles/dates/statuses and project titles/visibility. Preserve any existing edits; do not delete or replace rows just to match the JSON fallback.
3. Check whether the `project-covers` Storage bucket and its policies already exist.

The base migration uses `CREATE TABLE IF NOT EXISTS`, but also creates named policies without `IF NOT EXISTS`; do not rerun it over an already-configured schema. If the state is partial or unclear, inspect the existing policies and correct only what is missing.

## 2. Migrations and initial content

The base migration is [`supabase/migrations/20260928111011_admin_dashboard.sql`](supabase/migrations/20260928111011_admin_dashboard.sql). When applied to a new schema, it creates the events/projects tables, admin allowlist, RLS policies, and public `project-covers` bucket. It authorizes `lucas_brandao@student.uml.edu` and seeds the two past events. Apply it once only if those objects are not already configured.

The follow-up migration [`supabase/migrations/20260928120000_seed_current_public_content.sql`](supabase/migrations/20260928120000_seed_current_public_content.sql) ensures the current JSON-fallback entries are present: the Fall Engagement Fair, kickoff social, AI Agents event, and SquadPulse project. It inserts only entries without a matching title/date (or project title) and never updates or deletes existing content. Apply it after the base schema, and only after reviewing the existing rows.

These migrations are provided for review; they have **not** been applied to Production by this work.

## 3. Local development

1. Copy `.env.example` to the ignored `.env.local` at the repository root.
2. Fill in `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` using the existing Production project's public values. Do not use a service-role key, commit `.env.local`, or share the values in chat/logs.
3. Restart `npm run dev` after changing environment values.
4. Add `http://localhost:3000/auth/callback` to **Authentication → URL Configuration → Redirect URLs** in Supabase. Do not add a wildcard redirect.

Local development reads and can write to the Production project, including private drafts for an authenticated admin. Any event/project save, publish, delete, or cover upload from local development affects live data. The UI displays a warning before editing. Vercel Preview remains read-only. `npm run dev` sets `NODE_ENV=development`; do not set `VERCEL_ENV=production` locally.

If a Vercel Preview deployment is used later, it may be configured with the same Production Supabase project. The app remains read-only there. No branch has been pushed and no Preview environment has been configured as part of this work.

## 4. Invite-only password and email sign-in

1. In **Authentication → Providers → Email**, keep the Email provider enabled and disable public sign-ups. The app does not create users; only invited Auth users who are on `public.admin_users` can enter the dashboard.
2. Ensure `lucas_brandao@student.uml.edu` exists as a Supabase Auth user, and that the matching lowercase email is active in `public.admin_users`. An allowlist row alone does not create an Auth user.
3. Password sign-in is the normal login. If you are already signed in and need to set or change the password, use **Set/change password** in the dashboard; this uses the current Supabase session and does not send email. If signed out or the password is forgotten, use **Forgot or set password?** on the login page and follow the recovery email. Passwords are managed by Supabase Auth, not stored in this app; the form requires at least 12 characters. Routine password logins do not send email.
4. A magic-link sign-in remains available as a fallback. Password recovery and the magic-link fallback use the existing Supabase email sender; custom SMTP is not required unless delivery becomes blocked, rate-limited, or unreliable.
5. Allow the exact callback URLs you use, including `http://localhost:3000/auth/callback` for local testing and `https://aimlclub-five.vercel.app/auth/callback` for the production site. Add a custom domain or an approved Preview origin only if it is actually used. Keep the Supabase Site URL set to the public site origin. The Password Recovery email template must honor Supabase's requested callback, typically via `{{ .ConfirmationURL }}`.

### Sign-in troubleshooting

- **First password login says credentials are invalid:** Use **Forgot or set password?** once to establish the password for the existing Auth user. Do not create a second user or enable public sign-ups.
- **Forgot/set password email doesn't arrive:** Check **Authentication → Logs**, the Password Recovery email template, and the existing email sender's limits. Configure custom SMTP only if delivery needs it.
- **Expired or already-used link:** Both recovery and magic links are single-use. Request one fresh email and open its newest link promptly. If a new link fails immediately, check whether mail security scanning or link tracking consumes confirmation URLs.
- **Magic-link fallback fails immediately:** Check that its email template honors the requested callback and does not hard-code `{{ .SiteURL }}`. Supabase documents email prefetching as a cause of consumed links.
- **Email-send rate limit:** Stop retries until the limit resets. Check **Authentication → Logs** and the configured sender's quota; repeated requests will not bypass the limit.
- **No Auth user:** Invite the address under **Authentication → Users** and complete that invitation. The `admin_users` row grants authorization only after login.
- **Callback rejected:** Confirm the exact origin and `/auth/callback` path is in **Redirect URLs**. Check **Authentication → Logs** for the corresponding error.

## 5. Production editing and verification

Full create/edit/publish/archive/delete and cover-upload behavior is enabled in local development and on the Vercel Production deployment. Local development writes to Production; Vercel Preview uses Production in read-only mode. The owner will perform the broader live CRUD smoke test separately.
