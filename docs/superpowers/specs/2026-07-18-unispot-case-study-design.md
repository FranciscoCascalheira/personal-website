# UniSpot — engineering case study (FC-DOSSIER 02)

**Date:** 2026-07-18 · **Page:** `/work/unispot` · **Template:** the opPORTOnities case
study (`src/app/work/opportonities/page.tsx`). Every rule that governs that page
governs this one: real content only, prose to `.measure`, the folio/figure
system, both themes, and every hard claim wired into `verify-claims.mjs`.

## The one claim

> FR Eventos staffed eighteen bars at NOS Alive 2026, and the clocking,
> correcting and paying of the people who worked them ran on software I led the
> building of.

Not "in production" the way the city platform is. A **live pilot** at one real
festival, for one real operator. The credibility comes from getting that exactly
right, not from inflating it.

## Honesty guardrails (load-bearing — do not drift)

1. **The product is the manager _console_, not a kiosk.** The self-service kiosk
   was built, hardened against real concurrency (ADR-0005), and then **removed**
   (`fae8970`, 2026-07-16, "kiosk removed — hasn't been used for weeks"). The
   floor ran on managers marking/correcting presence per person on the console.
2. **"944 clock events, virtually all captured on the operations console"** —
   never "944 self-service kiosk clock-ins". `source=ADMIN` (939 of 944) is a
   manager on the console; `source=KIOSK` (5) is the self-service path + console
   bulk actions that mimic it. Confirmed against the only writer of each label.
3. **No offline/PWA ever shipped.** ADR-0005 deferred the offline queue; it was
   never built. Do not claim offline sync. `clientPunchId` idempotency is real
   kiosk code, but the kiosk was superseded.
4. **Collaborative, but the engineering spine is Francisco's.** 295 of 322
   commits his; João's 24 are CSS/table UI, André's 3 are the allocation screen.
   The concurrency, tenancy, operational-day and idempotency work is entirely
   his. "Lead developer — 295 of 322 commits, with two colleagues" is honest and
   lets him claim the hard parts.
5. **The map is the operator's copy of the festival site plan, not a public
   URL.** Do not present it as independently pullable like the council's Atas.
   The publicly checkable anchors are FR Unipessoal (fr-lda.com) and the
   festival's public dates.
6. **Never quote or commit `nosalive-*.tmp.md`** (real staff PII in the repo).
   Aggregate DB counts only.

## Verified facts (do not re-derive; pulled 2026-07-18)

**Repo** `~/business/unilinkr/ponto` → `unilinkr-org/unilinkr-ponto` (private),
branch `main`:
- 322 commits on `main`; 597 with `--all`. `git shortlog -sne HEAD`:
  Francisco 295 (162 + 133, two identities), João Ferreira 24, André Grasslin 3.
- Created 2026-05-21, last commit 2026-07-17. 18 Prisma models.
- Stack (package.json): Next.js 15 App Router, React 19, TypeScript 5, Prisma 6
  + PostgreSQL, iron-session v8, bcryptjs, zod, libphonenumber-js, date-fns,
  exceljs, Tailwind 3, Vitest 4 against real Postgres (ADR-0001), Railway.
  Home-rolled RBAC (ORGANISER / SUPER_ADMIN / MANAGER). Cron via authenticated
  HTTP endpoint (`timingSafeEqual`, fail-closed).
- ADRs (`docs/adr/`): 0001 vitest-real-postgres · 0002 Bar→Posto rename ·
  0003 operational-day cutoff · 0004 billing real→planned fallback ·
  0005 idempotent punch · 0006 eu-west region.

**Production DB** `ponto-demo` / Postgres (aggregate counts only):
- 3 events: NOS Alive 2026, Anitta, Piscina das Marés 2026.
- **NOS-2026** (`code=NOS-2026`, 9–11 Jul 2026): **18 bars** (Posto kind=BAR) ·
  **209 staff** (EventAssignment, `@@unique(eventId,employeeId)` → 209 distinct
  employees) · **614 shifts** · 615 work slots · **944 clock events** (TimeEvent:
  570 ENTRY/ADMIN + 369 EXIT/ADMIN + 3 ENTRY/KIOSK + 2 EXIT/KIOSK) · 190 distinct
  employees with a punch · 0 orphan punches now.
- The 18 BAR postos: BAR-1,2,3,5,6,7,8,9,10,12,14,18 (12 numbered) + CG1,CG2,CG3,
  COCA-COLA, DELTA, RED-BULL (6 branded stands). Also 4 kind=FUNCAO (not bars).
- Global: 356 employees, 4 companies.

**The map** (`~/Downloads/mapa_2026.pdf`, official NOS Alive 2026 site plan):
18 numbered bars — 12 **green** (1,2,3,5,6,7,8,9,10,12,14,18) + 6 **red**
(4,11,13,15,16,17); plus green lettered stands CG×3, CC, D, RB.
**Green set === the 18 DB postos, element by element. Red = absent from the DB.**
So on the festival's own map, green = in the UniSpot database, red = not.

**Public record (checkable):**
- FR Unipessoal, Lda (fr-lda.com): "prestação de serviços na exploração de
  espaços confinados para a venda direta ao público, em eventos ocasionais";
  lists Optimus/NOS Alive, Sudoeste, Paredes de Coura, Super Bock Super Rock.
  The real, documented festival-bar operator. (Their POS billing is separate
  from UniSpot's staff clocking — keep distinct.)
- NOS Alive 2026, 9–11 July, Passeio Marítimo de Algés — public (nosalive.com,
  Ticketline).

## The engineering backbone (sections 04–05)

**Hero, fig. 4 — the idempotent console batch (what actually ran the festival).**
Mass actions aren't naturally idempotent (anonymous entry creates people; mass
exit closes by count). Routes run under `withDbRetry`, which retries on
connection errors — including a lost ack after a committed transaction on
Railway's dropped Postgres connections. A naive retry re-runs committed work and
**duplicates people and hours**. Fix: `ConsoleActionBatch` written as the first
row of the transaction, so it commits atomically with the work; a re-send
collides on the PK (P2002) and returns the stored `result` instead of
re-executing. Mass exit/move use atomic claims (`updateMany where actualEnd:
null`) so a second manager closing the same shift gets `count:0`. Evidence:
`ece2ce0` (#138, "idempotência da consola"), `18a7771` ("101s → 13s"),
`1ca4662`. → **fig. 4 is an SVG timeline** (RaceTimeline-style): mass-entry
commits, ack drops, retry fires — WITHOUT the batch key it duplicates 20 people;
WITH it the retry collides and returns the stored result. SSR, prints, no WASM.

**Decisions that held (04):**
- Operational-day model (ADR-0003): night shifts ending 06:00 belong to the
  previous night; per-event `operationalDayCutoffHour` (default 7).
- One-place tenant scoping (`resolveAdminContext` / `requireScopedEventApi`) on a
  shared DB; `canSeeMoney()` the single money-blind decision point.
- Billing fallback (ADR-0004): real hours → planned hours + `needsReview` → never
  bill 0. Every planned-fallback forced past a human.
- The idempotent console batch (cross-ref fig. 4).

**What broke (05) — honest:**
- The UTC/DST cutoff bug (#71): the boundary anchored to UTC, so a summer 06:30
  Lisbon exit stuck in the previous night. Fixed to local wall-clock.
- **Three cross-tenant leaks found five days before launch** (`b35283f`,
  #215/#194): routes without `eventId` in the path slipped the scope guard —
  any admin could confirm/adjust another organiser's shifts, attach a punch to
  another organiser's worker, or enumerate another organiser's roster. Fixed by
  resolving the event from the shift/punch and intersecting with caller scope.
  Found late; say so.
- The orphan-resolution race (`c17b6ef`): two managers resolving the same orphan
  overwrote each other; fixed with `updateMany` carrying `employeeId: null` in
  the WHERE (0 rows → refuse).
- The retry that undid a manager's review (`5453a6c`, #99): a kiosk retry
  recomputed actuals and resurrected status from punches; fixed with
  `Shift.reviewedManually` (recompute early-returns on it).
- **The kiosk I built, hardened (ADR-0005, real concurrency tests), and then
  deleted** (`fae8970`) when the console proved to be how the floor worked.
  Removing code that isn't used is the mature move; it's part of the story.

## Structure (00→06, mirroring opPORTOnities)

- Masthead: title `UniSpot`, docId `FC-DOSSIER 02`, the italic claim, docket
  (Client / Event / Role / Status / Stack / Public record), status stamp
  ("In development · ran live at NOS Alive 2026" — no live API ping; the ponto
  demo endpoint is not a public health signal, so the masthead states the pilot,
  it does not fake a heartbeat).
- Contents front-matter nav (same grid/spine as the DocSections).
- **00 Abstract** — claim + four metrics: `18 bars` · `209 staff` · `614 shifts`
  · `944 clock events`. Footnotes name the count and the honest source.
- **01 The problem** — staffing a festival's bars end to end; before = paper,
  WhatsApp, spreadsheets.
- **02 Constraints** — flaky venue network · nights crossing 07:00 · non-technical
  managers · other companies' staff on one shared DB · an immovable date.
- **03 The system** — fig. 1 SchemaExplorer (18 models) + fig. 2 Lifecycle (the
  clock/operational-day state machine: entry→exit, cutoff, shift review states).
- **04 What held** — the four decisions above, each with its commit.
- **05 What broke** — the ledger of bugs above, ending in fig. 4 (the console
  batch made playable) with the 101s→13s receipt.
- **06 Outcome** — ran live 9–11 July from a container behind the stage; the map
  corroboration; collaborative, in development.

## Signature figure — fig. 0 analog: engraved NOS Alive site plate (Three.js)

The big build Francisco asked for. Mirror fig. 0's architecture
(`Fig0Plate.tsx` + `porto-plate.ts` + `plate-network.ts` + `Fig0Depth.tsx`):
- A simplified, hand-traced NOS Alive site plan: the Algés waterfront edge, the
  main stage blocks (Palco NOS, Clubbing, Comédia), the perimeter — as ink
  hairlines on ivory, engraving aesthetic, amber the sole accent.
- The **18 FR bars lit** (ink node + amber for the live pilot), the **6 non-FR
  numbered bars as ghost outlines** (present on the map, absent from the DB —
  this is the corroboration made visual).
- A small amber mark for the container behind the stage (where support ran).
- Cartouche: `NOS ALIVE 2026 · 9–11 JUL · ALGÉS` · `18 BARS · 209 STAFF`.
- Static SVG first (Phase 1), WebGL depth optional (Phase 2) reusing fig. 0's
  gate. Geometry hand-traced from the map, Douglas-Peucker-simplified like
  porto-plate; node positions read off the rendered map. New files:
  `src/lib/nosalive-plate.ts` (geometry), `src/components/case/NosAlivePlate.tsx`.
  Mobile: the wide-figure rail idiom (`overflow-x-auto`, `overscroll-x-contain`).

## verify-claims.mjs additions

The DB lives in a different Railway project (`ponto-demo`), so add a UniSpot
block that runs `railway run --service Postgres` from `~/business/unilinkr/ponto`
(override via `PONTO_PATH`), skipping cleanly when absent — same discipline as
the TERA-LINKR block.
- Authorship: `git -C <ponto> shortlog -sne HEAD` → assert Francisco 295 across
  two identities, 3 authors total; check the "295 of 322" claim at every site.
- Bars/staff/shifts/clock-events: live-checked against `ponto-demo` (aggregate
  count queries), each claimed in `case-study-unispot.ts` with a dated footnote.
- The invariant that makes "18 bars" mean something: `count(Posto kind=BAR where
  event=NOS-2026) = 18` AND the 12 numbered posto codes match the map's green
  numbered set (encode the green set as a constant and assert set-equality).
- Public record: FR (fr-lda.com, proof "espaços confinados") + festival dates
  (proof a stable NOS Alive string), each with `proof` bodies like opPORTOnities.

## Files

New: `src/app/work/unispot/page.tsx`, `src/lib/case-study-unispot.ts`,
`src/components/case/NosAlivePlate.tsx`, `src/lib/nosalive-plate.ts`, a UniSpot
console-batch timeline component (fig. 4), and figure data libs as needed
(schema-unispot, lifecycle-unispot, console-batch).
Modify: `src/lib/data.ts` (rewrite the UniSpot ledger entry; add a case-study
href), `src/components/Work.tsx` (make the UniSpot ledger row link to
`/work/unispot`), `scripts/verify-claims.mjs` (the UniSpot block),
`src/components/Footer.tsx` colophon weight if first-load moves,
`~/dev/ai-workflow/tier1.json` if it becomes a tier-1 screen.

## DoD (per deploy)

tsc + lint clean · `npm run build` clean (verify:tokens → verify:claims → build →
verify:bundle; update the colophon if weight moves) · both themes verified at 390
+ 1440 · one design-reviewer gate · commit + push +
`railway up -c --service personal-website` · verify in prod (curl `--resolve
www.franciscocascalheira.com:443:104.21.36.214`) · update memory.
