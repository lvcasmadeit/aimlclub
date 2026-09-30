# Supabase setup for the admin dashboard

The app can still build and render its existing JSON content without Supabase credentials. The admin dashboard remains unavailable until a Supabase project is configured.

## 1. Create and configure a Supabase project

1. Create a Supabase project and copy its **Project URL** and **publishable key** from **Project Settings → API**.
2. Copy `.env.example` to `.env.local` and fill in:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
3. Do not add a service-role key to the app. Public reads and admin writes are restricted by the included Row Level Security policies.

## 2. Apply the database migration

Run the SQL in `supabase/migrations/20260928111011_admin_dashboard.sql` once, using the Supabase SQL Editor or the Supabase CLI. It creates the events/projects tables, admin allowlist, RLS policies, and the public `project-covers` bucket. It authorizes `lucas_brandao@student.uml.edu` as the initial admin and seeds the two events already shown in the timeline.

To authorize another person later, invite their email in Supabase Auth and add a lowercase email row to `public.admin_users`. To revoke access, set that row's `is_active` to `false`.

## 3. Enable invite-only email sign-in

1. In **Authentication → Providers → Email**, enable email OTP/magic links and disable public sign-ups.
2. Invite `lucas_brandao@student.uml.edu` from **Authentication → Users**.
3. In **Authentication → URL Configuration → Redirect URLs**, allow the exact callback origins you use, for example `http://localhost:3000/auth/callback`, `https://aimlclub-five.vercel.app/auth/callback`, and approved Vercel preview URLs ending in `/auth/callback`. Add the port you actually use locally. Keep **Site URL** set to the public site origin; the app passes the callback as `emailRedirectTo`.
4. Keep the Supabase project’s email confirmation enabled. The login flow uses `shouldCreateUser: false`; each admin must exist under **Authentication → Users** as well as in `public.admin_users`.

## Sign-in troubleshooting

- **Expired or already-used link:** Request one new link, then open the newest email promptly. Magic links are single-use. If the original Supabase invitation expired before it was accepted, resend the invitation from **Authentication → Users** first.
- **Email-send rate limit:** Stop retrying until Supabase's configured limit window resets; invites and sign-in links both consume email sends, and the reset may be longer than a few minutes. Inspect **Authentication → Logs** and the SMTP provider's quota. Supabase's built-in mailer is restrictive; configure a custom SMTP provider under **Authentication → SMTP Settings** for reliable ongoing use.
- **No Auth user:** An entry in `public.admin_users` only grants authorization after login; it does not create or invite a Supabase Auth user. Invite the email under **Authentication → Users** and complete that invitation. Avoid deleting and re-inviting the account during troubleshooting; request a sign-in link for the existing confirmed Auth user instead.
- **Callback rejected:** Verify the exact callback URL for the current origin and port is in **Redirect URLs**. The login page now displays Supabase’s error code for other send failures; check **Authentication → Logs** for the corresponding details.

## 4. Configure Vercel

Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in the Vercel project for the desired environments, then redeploy. Apply the migration to the same Supabase project before enabling the variables. Preview and production deployments may use separate Supabase projects if you want isolated content.

## Data behavior

- Only published events/projects are visible to anonymous visitors. Admins can view drafts and archived records.
- Event dates are stored as timestamps; an undated “TBD” event remains upcoming. Dated events move into the past timeline when their start time passes.
- Project cover uploads are limited to JPEG, PNG, or WebP and 5 MB. The public site stores the Storage object path, not a user-provided image URL.
- If Supabase variables are absent, the public site uses the existing JSON data. With variables configured, apply the migration before testing admin access.
