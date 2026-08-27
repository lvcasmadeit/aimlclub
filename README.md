# AI & ML Club — UMass Lowell

The website for the University of Massachusetts Lowell AI & ML Club. A single-page,
dark, futuristic, minimal site built to feel like a startup lab run by a room full of
delusional optimists.

Built with Next.js (App Router), React, TypeScript, Tailwind CSS v4, and
[Motion](https://motion.dev) for animation.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

Other scripts:

```bash
npm run build   # production build
npm run start   # serve the production build
npm run lint    # eslint
```

## Editing content

All copy is driven by static JSON in [`src/lib/data`](src/lib/data), so you can update
the site without touching components. The shapes are defined in
[`src/lib/types.ts`](src/lib/types.ts).

- [`site.json`](src/lib/data/site.json) — club name, tagline, mission, social links, and the hero stat row.
- [`projects.json`](src/lib/data/projects.json) — project cards. `status` is one of `active`, `shipped`, or `exploring`. `githubUrl` and `demoUrl` are optional.
- [`team.json`](src/lib/data/team.json) — e-board. `githubUrl` and `linkedinUrl` are optional. Avatars fall back to initials.
- [`meetings.json`](src/lib/data/meetings.json) — `upcoming` and `past` arrays. Dates are ISO strings; `rsvpUrl` and `recapUrl` are optional.
- [`faq.json`](src/lib/data/faq.json) — questions in the About section.

## Structure

```
src/
  app/            layout, page, global theme
  components/
    layout/       Header (sticky nav + scroll progress), Footer (marquee + socials)
    sections/     Hero, About, Projects, Team, Meetings, Contact
    ui/           shared primitives (Card, Button, Timeline, animation wrappers)
  lib/
    data/         editable JSON content
    types.ts      content types
    utils.ts      cn() and date formatting
```

## Design notes

- Dark-first palette with a single electric-cyan accent, defined as CSS variables in [`src/app/globals.css`](src/app/globals.css).
- Fonts: Space Grotesk (display) and IBM Plex Mono (labels and stats).
- Animation is intentionally restrained: scroll-reveal fades, a staggered hero, hover lifts on cards, and a CSS-only keyword marquee. Everything honors `prefers-reduced-motion`.

## Contact form

The contact form opens the visitor's email client via `mailto:` (no backend required).
To collect submissions server-side instead, swap the submit handler in
[`src/components/sections/ContactForm.tsx`](src/components/sections/ContactForm.tsx)
for a service like [Formspree](https://formspree.io) or
[Resend](https://resend.com).

## Deploy

The site is a static-friendly Next.js app and deploys to
[Vercel](https://vercel.com/new) with zero configuration:

1. Push this repository to GitHub.
2. Import it at [vercel.com/new](https://vercel.com/new) and accept the detected Next.js defaults.
3. Vercel builds and hosts it; add a custom domain later if you want one.

Alternatively, run `npx vercel` from this directory to deploy from the CLI.
