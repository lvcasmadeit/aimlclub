<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# AI & ML Club (UMass Lowell)

Public site for the **University of Massachusetts Lowell AI & ML Club** (CampusGroups). Brand as **AI & ML Club**, not MassAI (UMass Amherst) and not the Manning School “Artificial Intelligence Multidisciplinary Society.”

Production: https://aimlclub-five.vercel.app
Repo: https://github.com/lvcasmadeit/aimlclub

## Stack

Next.js 16 App Router (`src/app`), React 19, TypeScript strict, Tailwind CSS v4, Motion (`motion/react`). Path alias `@/*` → `src/*`. No CMS, auth, or backend.

## Git and deploy

- **`main`** → Vercel production. **`dev`** → continued work and preview deploys.
- Do not merge to `main` unless asked. Do not invent GitHub/LinkedIn URLs for people.
- Vercel project is already linked (`.vercel/` is gitignored).

## Content

Edit copy in `src/lib/data/*.json`. Types live in `src/lib/types.ts`. Do not hardcode club copy in components if it belongs in JSON.

- `site.json` — name, tagline, mission, socials, `joinUrl` (Discord), hero stats
- `projects.json` — `status`: `active` | `shipped` | `exploring`
- `team.json` — e-board only (name, role; optional github/linkedin)
- `meetings.json` — `upcoming` / `past`; dates ISO or `"TBD"` (`formatDate` in `src/lib/utils.ts` handles TBD)
- `faq.json` — About accordion

Contact form is `mailto:` via `ContactForm.tsx` (no Formspree/Resend unless asked).

## Page structure

Single page. Section order and labels:

1. Hero `#hero` — 2. About `#about` — 3. Meetings `#meetings` — 4. Projects `#projects` — 5. Team `#team` — 6. Contact `#contact`

Header nav must match that order. Keep `scroll-margin-top` on `section[id]`.

E-board (do not invent extra officers unless asked): Jonathan Doughty (President), Lucas Brandao (Vice President), Sowndaryan Jayaprakash Anand (Secretary), Mohammed Aldulaimy (Treasurer). Team cards: name + role (+ socials if URLs exist). No general members list.

## Design

- Dark default (`:root`). Light via `html.light`. Toggle + inline script in `layout.tsx` (localStorage `theme`, else `prefers-color-scheme`). `suppressHydrationWarning` on `<html>`.
- Tokens in `src/app/globals.css`. Accent is **warm amber** (`#f59e0b` dark / `#c2410c` light), secondary terracotta (`--violet` name is historical — it is not purple). Do not revert to cyan.
- Fonts: Space Grotesk + IBM Plex Mono.
- Hero only: light wells + `.hero-scan` grid. **No film grain.** Do not put the scan grid on other sections.
- Tone: startup-minded students, not “delusional optimists.” Tagline currently: “Builders and beyond, exploring AI & ML.”
- Animation: transform/opacity only; `prefers-reduced-motion`; Motion in small `'use client'` islands. No GSAP/Three.js unless asked.

## Conventions

- Prefer Server Components; client only for interactivity (nav, theme, FAQ, form, Motion).
- Verify UI in the browser for layout/styling/routing changes.
- `npm run lint` and `npm run build` before calling work done.
