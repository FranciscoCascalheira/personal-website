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

Hosted on **Railway** (Nixpacks build, `next start`). The public site is served
on `www.franciscocascalheira.com`; the bare domain 301-redirects to it.

### DNS (Cloudflare in front of the dominios.pt registration)

Railway custom domains resolve by CNAME, so the DNS lives on Cloudflare
(nameservers switched at dominios.pt):

| Record   | Name  | Target                       | Cloudflare proxy        |
| -------- | ----- | ---------------------------- | ----------------------- |
| CNAME    | `www` | `<service>.up.railway.app`   | DNS only (grey)         |
| CNAME/A  | `@`   | redirect to `www`            | Proxied (orange)        |

The apex can't point straight at Railway (Cloudflare flattens the root CNAME to
an A record, which Railway won't verify), so the root is proxied and a Cloudflare
**Redirect Rule** sends `franciscocascalheira.com/*` → `https://www.franciscocascalheira.com/$1`.
Grab the exact `www` CNAME target from Railway → project → Settings → Domains.
