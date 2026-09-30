# AI & ML Club — UMass Lowell

The website for the University of Massachusetts Lowell AI & ML Club. A single-page,
minimal site with a startup-minded focus on student builders and practical exploration.

Built with Next.js (App Router), React, TypeScript, Tailwind CSS v4, and
[Motion](https://motion.dev) for animation.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Admin dashboard

The invite-only dashboard is available at `/admin`. Supabase credentials are optional for local development: without them, the public site uses its existing JSON content and the dashboard shows setup instructions. To enable authentication, event/project publishing, and project cover uploads, follow [`SUPABASE_SETUP.md`](SUPABASE_SETUP.md). The initial admin allowlist includes `lucas_brandao@student.uml.edu`.

Other scripts:

```bash
npm run build   # production build
npm run start   # serve the production build
npm run lint    # eslint
```

## Editing content

Static site copy and local fallback content live in [`src/lib/data`](src/lib/data). With Supabase configured, published events and project cards come from the database; the shapes are defined in [`src/lib/types.ts`](src/lib/types.ts).

- [`site.json`](src/lib/data/site.json) — club name, hero title, tagline, mission, social links, and the hero stat row.
- [`about.json`](src/lib/data/about.json) — provisional Learn, Build, and Community tab copy and placeholder visual labels.
- [`projects.json`](src/lib/data/projects.json) — the public empty-state notice. Published project cards are loaded from Supabase when configured; `status` is one of `active`, `shipped`, or `exploring`.
- [`team.json`](src/lib/data/team.json) — e-board. `githubUrl` and `linkedinUrl` are optional. Avatars fall back to initials.
- [`meetings.json`](src/lib/data/meetings.json) — fallback `upcoming` and `past` arrays when Supabase is not configured. Published events are loaded from Supabase when configured; RSVP and recap links are optional.
- [`faq.json`](src/lib/data/faq.json) — questions in the About section.

## Structure

```
src/
  app/            layout, page, global theme
  components/
    layout/       Header (sticky nav + scroll progress), Footer (marquee + socials)
    sections/     Hero, About, Meetings, Projects, Team, Contact
    ui/           shared primitives (Card, Button, Timeline, animation wrappers)
  lib/
    data/         editable JSON content
    types.ts      content types
    utils.ts      cn() and date formatting
```

## Design notes

- Black-and-white palette with high-contrast dark and light themes, defined as CSS variables in [`src/app/globals.css`](src/app/globals.css).
- Fonts: Space Grotesk (display) and IBM Plex Mono (labels and stats).
- Animation is intentionally restrained: scroll-reveal transitions, a staggered hero entrance, card hover effects, and a CSS-only keyword marquee. Motion honors `prefers-reduced-motion`.
- The meetings timeline scrolls horizontally on desktop, centering the next event or the history as a group when no upcoming events remain; the next-event node glows. It stacks vertically on mobile.
- The hero remains background-free, with wider desktop gutters; the About section uses theme-specific visuals.

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
