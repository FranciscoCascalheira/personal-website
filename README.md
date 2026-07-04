# franciscocascalheira.com

Personal website of **Francisco Cascalheira** — software developer building
production software. A single-page portfolio: dark by default, with a light
editorial mode, built from scratch with an eye on the details.

Design is inspired by the work of Augusta Labs, Delta Y and Sword Health —
near-black canvas, a typographic mono counterpoint, technical microcopy, one
warm amber accent, and light used as atmosphere.

## Stack

- **Next.js 16** (App Router) + **React 19**
- **Tailwind CSS v4** with a semantic CSS-variable token system
- **Geist / Geist Mono / Instrument Serif** via `next/font`
- Social cards generated at build with `next/og`
- Deployed on **Vercel**

## Develop

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
```

## Structure

```
src/
  app/
    layout.tsx            root layout, fonts, metadata, no-flash theme script
    page.tsx              composes the sections
    globals.css           design tokens + theming + signature utilities
    opengraph-image.tsx   social card (also reused for Twitter)
    icon.svg              favicon monogram
    robots.ts sitemap.ts
  components/              Nav, Hero, Work, About, Stack, Path, Contact, Footer
                          + primitives: Reveal, ThemeToggle, AmbientGlow, Section
  lib/
    site.ts               identity, links, nav config
    data.ts               projects, experience, skills — the content lives here
    og.tsx                Open Graph image
public/
  portrait.jpg
  Francisco-Cascalheira-CV.pdf
```

**To edit content**, change `src/lib/data.ts` and `src/lib/site.ts` — nothing
else needs to move.

## Theming

Two registers (dark, light) are defined as CSS variables in `globals.css` and
mapped onto Tailwind via `@theme inline`, so the toggle is instant and every
utility (`bg-bg`, `text-text-muted`, `text-accent`, …) follows the theme. The
initial theme is set before first paint by an inline script and persisted to
`localStorage`.

## Deploy

Import the repo on [vercel.com/new](https://vercel.com/new) (framework and build
settings are detected automatically). Then point the domain — see below.

### DNS for franciscocascalheira.com

In Vercel: Project → Settings → Domains → add `franciscocascalheira.com` and
`www.franciscocascalheira.com`. At the registrar, set the records Vercel shows:

| Type  | Name | Value                 |
| ----- | ---- | --------------------- |
| A     | @    | `76.76.21.21`         |
| CNAME | www  | `cname.vercel-dns.com`|

(Confirm the exact values in the Vercel dashboard — it verifies automatically
once they propagate.)
