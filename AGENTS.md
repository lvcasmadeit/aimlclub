<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# AI & ML Club (UMass Lowell)

Public site for the **University of Massachusetts Lowell AI & ML Club** (CampusGroups). Brand as **AI & ML Club**, not MassAI (UMass Amherst) and not the Manning School “Artificial Intelligence Multidisciplinary Society.”

Production: https://aimlclub-five.vercel.app
Repo: https://github.com/lvcasmadeit/aimlclub

## Stack

Next.js 16 App Router (`src/app`), React 19, TypeScript strict, Tailwind CSS v4, Motion (`motion/react`), and React Three Fiber/Three.js for the existing visual scenes. Path alias `@/*` → `src/*`.

Supabase SSR/client support and an admin dashboard exist in the codebase, but Supabase is not configured for the current production workflow. Until the owner explicitly enables it, the public site uses JSON fallback content and the dashboard remains unfinished.

## Git and deploy

- **`main`** → Vercel production. **`dev`** → continued work and preview deploys.
- Do not merge to `main` unless explicitly asked. Do not invent GitHub/LinkedIn URLs for people.
- Keep `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` unset in production until the owner confirms Supabase setup is complete. With both set, public events and projects are read from Supabase rather than their JSON fallback files.
- Vercel project is already linked (`.vercel/` is gitignored).

## Content

Edit copy in `src/lib/data/*.json`. Types live in `src/lib/types.ts`. Do not hardcode club copy in components if it belongs in JSON.

- `site.json` — name, tagline, mission, socials, and `joinUrl` (Discord)
- `projects.json` — public JSON fallback; SquadPulse is the current project. `status`: `active` | `shipped` | `exploring`
- `team.json` — e-board only (name, role; optional github/linkedin)
- `meetings.json` — public JSON fallback; AI Agents is the current upcoming event and the other listed entries are past events. Dates are ISO or `"TBD"` (`formatMeetingWhen` in `src/lib/utils.ts` handles TBD)
- `featured-event.json` — featured event ID and media metadata; its files live in `public/media/`
- `faq.json` — About accordion

Contact form is `mailto:` via `ContactForm.tsx` (no Formspree/Resend unless asked).

## Page structure

Single page. Section order and labels:

1. Hero `#hero` — 2. About `#about` — 3. Meetings `#meetings` — 4. Projects `#projects` — 5. Team `#team` — 6. Contact `#contact`

Header nav must match that order. Keep `scroll-margin-top` on `section[id]`.

E-board (do not invent extra officers unless asked): Jonathan Doughty (President), Lucas Brandao (Vice President), Sowndaryan Jayaprakash Anand (Secretary), Mohammed Aldulaimy (Treasurer). Team cards: name + role (+ socials if URLs exist). No general members list.

## Design

- Dark default (`:root`). Light via `html.light`. Toggle + inline script in `layout.tsx` (localStorage `theme`, else `prefers-color-scheme`). `suppressHydrationWarning` on `<html>`.
- Tokens in `src/app/globals.css`. The approved palette is monochrome: white accent in dark mode and black accent in light mode. About cards use blue glass/blob colors; the hero loss-landscape visualization uses optimizer colors.
- Fonts: Space Grotesk + IBM Plex Mono.
- The hero includes a dynamically loaded interactive loss-landscape visualization on large screens. The About cards use glass-style 3D visuals. These existing Three.js scenes are intentional; do not add other visualization frameworks without asking. **No film grain or `.hero-scan` grid.**
- Tone: startup-minded students, not “delusional optimists.” Approved tagline: “Learn. Build. Ship.”
- Honor `prefers-reduced-motion`; keep Motion interactions in small `'use client'` islands and avoid unnecessary animation.

## Conventions

- Prefer Server Components; client only for interactivity (nav, theme, FAQ, form, Motion).
- Verify UI in the browser for layout/styling/routing changes.
- `npm run lint` and `npm run build` before calling work done.
