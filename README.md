# franciscocascalheira.com

The personal site of **Francisco Cascalheira**. It is not a portfolio. It is a
dossier that argues one claim and hands you the evidence to check it:

> The City of Porto runs its youth-internship programme on software I built alone.

That claim is easy to write and hard to believe from a second-year student, so
the site is built around the checking rather than the saying. Its house style is
a typeset public record — ivory paper, ink, one amber accent, figures numbered
like plates — and every number on it cites the command or the document that
reproduces it.

This repository is public because the argument includes the source. The site
tells you the schema has twelve models and that a race condition survived its own
fix; you should be able to see how it knows.

## What's worth opening

| | |
| --- | --- |
| [`src/components/case/RaceCondition.tsx`](src/components/case/RaceCondition.tsx) · [`src/lib/race-engine.ts`](src/lib/race-engine.ts) | **fig. 4** — a real PostgreSQL 18.3 (PGlite, WASM) runs *in the page*, replaying a double-placement race against the real guards from three points in the platform's history. It found that the audit's own published fix does not close the race: it is check-then-act, and under READ COMMITTED both transactions read `ACTIVE` before either writes. PGlite is single-connection, so the interleave is produced with two-phase commit, which the figure says out loud. |
| [`scripts/verify-claims.mjs`](scripts/verify-claims.mjs) | The truth rules, executable. 19 checks against git, against `schema.prisma`, against the production database, and against the council's own published minutes. Two claims have died here that a human reviewer waved through. |
| [`scripts/verify-tokens.mjs`](scripts/verify-tokens.mjs) | A Tailwind utility silently does nothing if its token isn't exported from `@theme` — the class reads right, lints, compiles, and paints nothing. This fails the build instead. |
| [`scripts/engrave.py`](scripts/engrave.py) | The engraving pipeline: banknote-style line work where a near-horizontal line family is displaced by view-space relief, so the nose pushes the lines and the sockets pull them. Tone is carried by stroke width. Form-following displacement is the difference between an engraving and a Photoshop filter. |
| [`src/components/Fig0Plate.tsx`](src/components/Fig0Plate.tsx) · [`src/lib/porto-plate.ts`](src/lib/porto-plate.ts) | **fig. 0** — the seven *freguesias* of Porto engraved from the official administrative charts (CAOP, EPSG:3763), with the real matching network etched over them and a Three.js layer that lifts it off the paper. |

## Truth rules

The site makes claims a reader cannot verify from their chair, so:

1. **Every claim cites the command that reproduces it** — and is verified *with
   that command*, not one that sounds equivalent.
2. **A claim that cannot be located is a failure, never a pass.** A verifier that
   silently matches nothing is worse than no verifier.
3. **A command proves arithmetic, never semantics.** It cannot prove a column
   means what its name suggests. `npm run verify:claims` once passed
   "138 positions" because the check ran the same query as the claim and
   inherited the same misreading — `slot_number` is the slot's *label*, not a
   count. An independent source caught it: the council publishes its own minutes,
   and they count 90 where that arithmetic implied 138.

Hence the fourth: **anchor to something with no assumptions in common.** The
case study cites the council's signed *Atas*, and `verify-claims` fetches each
one and asserts the document is still there — not by status code, because
cm-porto.pt answers `200` with an error page for things it does not have.

`npm run verify:claims` needs the platform's private repo and a Railway login, so
it skips cleanly where neither exists. It is a pre-deploy check, not a build gate.

## Stack

- **Next.js 16** (App Router) + **React 19**, TypeScript
- **Tailwind CSS v4** over a semantic CSS-variable token system
- **three.js** for fig. 0, **PGlite** for fig. 4 — both lazy, neither in the first load
- **Instrument Serif** (display) / **Geist** (body) / **Geist Mono** (evidence)
- Deployed on **Railway** (Nixpacks, `next start`)

## Develop

```bash
npm install
npm run dev            # http://localhost:3000
npm run build          # verify:tokens → verify:claims → build → verify:bundle
npm run verify:claims  # check every claim against the thing it describes
```

The build verifies itself at both ends: tokens and claims before, bundle weight
after. The footer prints the site's own first-load size, and `verify-bundle`
fails if that number has drifted from the truth.

## Structure

```
src/
  app/
    page.tsx                  the dossier
    work/opportonities/       the case study — figs. 1–4
    globals.css               tokens, theming, the print edition
  components/
    case/                     SchemaExplorer (fig. 1) · Lifecycle (fig. 2)
                              AuditLedger (fig. 3) · RaceCondition (fig. 4)
    Fig0Plate · Fig0Depth     fig. 0 — the survey plate
    InfluenceMap              fig. A — the appendix
  lib/
    case-study.ts             the case study + the public record it cites
    data.ts                   projects, trajectory, skills
    race.ts · race-engine.ts  fig. 4's steps, declared once, printed and executed
scripts/
  verify-claims.mjs           the truth rules
  verify-tokens.mjs           the dead-class guard
  verify-bundle.mjs           the colophon's weight
  engrave.py                  the engraving pipeline
```

Content lives in `src/lib/`. Change `data.ts`, `case-study.ts` and `site.ts` —
then run `verify:claims` and believe it over yourself.

## Print

The site has a print edition: `Cmd/Ctrl+P` produces a real typeset PDF — amber
flood becomes a ruled box, chrome and reveal-states disappear, marginalia becomes
a masthead. It is checked with headless Chrome, not by eye.

## Deploy

`railway up -c --service personal-website` from the repo root. The public site is
`www.franciscocascalheira.com`; the apex redirects to it via a Cloudflare rule,
because Cloudflare flattens a root CNAME to an A record and Railway won't verify
that.
