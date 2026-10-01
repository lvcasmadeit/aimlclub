# AI & ML Club — UMass Lowell

The website for the University of Massachusetts Lowell AI & ML Club. A single-page,
minimal site with a startup-minded focus on student builders and practical exploration.

Built with Next.js (App Router), React, TypeScript, Tailwind CSS v4, [Motion](https://motion.dev), and React Three Fiber/Three.js for the hero and About visuals.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Admin dashboard

An invite-only dashboard implementation exists at `/admin`, but Supabase is not configured for the current production workflow and the dashboard is still in progress. Keep `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` unset to serve the public JSON fallback content. Once the owner is ready to enable Supabase-backed authentication, event/project publishing, and cover uploads, follow [`SUPABASE_SETUP.md`](SUPABASE_SETUP.md). The initial admin allowlist includes `lucas_brandao@student.uml.edu`.

Other scripts:

```bash
npm run build   # production build
npm run start   # serve the production build
npm run lint    # eslint
```

## Editing content

Static site copy and public fallback content live in [`src/lib/data`](src/lib/data). With Supabase unconfigured, the home page shows the JSON content, including the AI Agents upcoming event and the current SquadPulse project. With Supabase configured, published events and project cards come from the database; the shapes are defined in [`src/lib/types.ts`](src/lib/types.ts).

- [`site.json`](src/lib/data/site.json) — club name, hero title, tagline, mission, and social links.
- [`about.json`](src/lib/data/about.json) — About card copy for Hacks, Guest Speakers, Workshops, and Project Groups.
- [`projects.json`](src/lib/data/projects.json) — the public fallback project list; currently includes SquadPulse. Published project cards are loaded from Supabase when configured; `status` is one of `active`, `shipped`, or `exploring`.
- [`team.json`](src/lib/data/team.json) — e-board. `githubUrl` and `linkedinUrl` are optional. Avatars fall back to initials.
- [`meetings.json`](src/lib/data/meetings.json) — fallback `upcoming` and `past` arrays when Supabase is not configured. AI Agents is the current upcoming event; the other listed entries are past events. Published events are loaded from Supabase when configured; RSVP and recap links are optional.
- [`featured-event.json`](src/lib/data/featured-event.json) — featured event and media metadata; media files are in `public/media/`.
- [`faq.json`](src/lib/data/faq.json) — questions in the About section.

## Structure

```
src/
  app/            layout, page, global theme
  components/
    layout/       Header (sticky responsive nav), Footer (marquee + socials)
    sections/     Hero, About, Meetings, Projects, Team, Contact
    ui/           shared primitives (Card, Button, Timeline, animation wrappers)
  lib/
    data/         editable JSON content
    types.ts      content types
    utils.ts      cn() and date formatting
```

## Design notes

- Monochrome accent palette with high-contrast dark and light themes, defined as CSS variables in [`src/app/globals.css`](src/app/globals.css). About cards use blue glass/blob visuals.
- Fonts: Space Grotesk (display) and IBM Plex Mono (labels and stats).
- Motion is used for scroll reveals, the hero entrance, and project carousel. The hero loss landscape and About card visuals use React Three Fiber/Three.js; reduced-motion preferences are honored.
- The meetings timeline scrolls horizontally on desktop, centering the next event or the history as a group when no upcoming events remain; the next-event node glows. It stacks vertically on mobile.
- The hero pairs the club identity with a desktop loss-landscape visualization; the About section uses theme-specific 3D glass visuals.

## Contact form

The contact form opens the visitor's email client via `mailto:` (no backend required).
To collect submissions server-side instead, swap the submit handler in
[`src/components/sections/ContactForm.tsx`](src/components/sections/ContactForm.tsx)
for a service like [Formspree](https://formspree.io) or
[Resend](https://resend.com).

## Deploy

The site is a Next.js app with optional Supabase-backed runtime content and admin routes, and deploys to
[Vercel](https://vercel.com/new):

1. Push this repository to GitHub.
2. Import it at [vercel.com/new](https://vercel.com/new) and accept the detected Next.js defaults.
3. Vercel builds and hosts it; add a custom domain later if you want one.

Alternatively, run `npx vercel` from this directory to deploy from the CLI.
