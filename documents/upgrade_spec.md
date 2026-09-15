# Spec — Jom Solat upgrade

Status: proposed  
Date: 2026-09-05  
Owner: Ahmad  
Replaces (target): Vue 2 + Vue CLI + Vuex + Vuetify SPA  
Does not replace: the as-is description in `documents/project_architecture.md` until this spec is implemented

This repo is a **new TypeScript project**. It copies prayer *behaviour* from the old Vue 2 app. It does not share that app's Firebase project, Firestore data, Netlify site, or package manager.

## Recommendation

Migrate to **one Nuxt 4 TypeScript app** with:

- `domain/` — prayer rules, parsing, districts, countdown. No Vue, no Nitro, no Firestore.
- `app/` — UI only. Pages, components, and thin composables that call domain functions.
- `server/` — KHEU ingest, admin sync, timetable reads/writes.
- **Japa** as the only test runner (unit + functional + Playwright browser plugin).
- **JSON timetable** on disk in development; **Netlify Blobs** in production (same site as cron). No Firestore.
- **pnpm** with a committed `pnpm-lock.yaml`.
- **Automatic monthly ingest** from the official KHEU HTML list, with authenticated paste as fallback.
- **Its own Netlify site** (a different Netlify team/profile than the Vue 2 app is fine).
- **Minimalist, dark, typographic UI** that is first-class on both a phone and a wide desktop. Not Material, not a card dashboard.

Do not add a monorepo, a second package, a queue, or a second database.

---

## 1. Context

### Problem

The current app works, but it is stuck: Vue 2, untyped JS, UI and rules mixed in `Home.vue`, Vuetify chrome, a world-writable admin paste, and a human copy-paste from KHEU every month.

### Goals

1. Separate business rules from rendering.
2. Enforce TypeScript (`strict`).
3. Move the UI to Nuxt 4.
4. Make the first visual version minimal, distinctive, and responsive.
5. Refresh the timetable without copy-paste.
6. Test domain and ingest with Japa.

### Facts

- Official source is KHEU: [waktu solat list](https://www.mora.gov.bn/lists/waktusolat/waktusolat.aspx). District note: Tutong +1 minute, Belait +3 minutes.
- Public HTML table is readable (`table.ms-listviewtable`). SharePoint REST (`/_api`, `ListData.svc`, `owssvr.dll?XMLDATA=1`) returned 401. All Items embeds a `WPQ*ListData` JSON blob (not a documented API). RSS exists but is paginated and incomplete.
- Calculated third-party times (e.g. Alhabib/MABIMS) are **not** KHEU. Do not use them as the source of truth.
- Current stack: Vue 2.6 SPA, Vuex, Vuetify 2, Firebase Firestore + Auth (Auth unused by UI), Netlify, Cypress + Jest.
- Admin TSV parser and countdown/Hijri-bump logic already exist; they move into `domain/`.

### Assumptions

- KHEU will keep publishing a monthly HTML table with the same columns (Masihi, Hijrah, Imsak, Subuh/Suboh, Syuruk, Duha/Doha, Zuhur/Zohor, Asar, Maghrib, Isya/Isyak).
- One operator still needs a manual override when the scraper fails.
- Public users never log in.
- Deploy on a **new** Netlify site. A different Netlify profile/team than the Vue 2 app is expected.
- Do not read or write the Vue 2 production database. Do not add a Firebase project unless Blobs fail.

### Constraints

- Official times only. No astronomical calculation in v1.
- Malay UI copy stays.
- Month documents are `1`–`12` from day one. Do not reuse Vue 2 ids `910`/`911`/`912`.
- PWA + optional notifications remain; they are not the first slice.

### Non-goals (v1)

- Native apps, accounts for the public, English i18n, light theme, qibla compass, maps, Vue 2 compatibility layer, Vitest, npm, PostgreSQL, microservices, AdonisJS.
- Sharing the Vue 2 Firebase project, Firestore collections, or Netlify site.
- Pixel-perfect recreation of the Vuetify carousel.

---

## 2. Why Nuxt, and why not something smaller

**Yes, this Vue app can move to Nuxt.** Nuxt 4 is Vue 3 + Vite + TypeScript. It is a rewrite of the UI, not a config switch.

| Option | Verdict |
| --- | --- |
| Stay Vue 2, extract domain only | Rejected. Does not give TypeScript enforcement or a modern UI runtime. |
| Vue 3 + Vite SPA | Smaller than Nuxt, but ingest still needs a server or an external cron. User asked for Nuxt. |
| **Nuxt 4 app + Nitro** | **Chosen.** One deployable: typed UI, server ingest route, file-based routing, TS project refs. |
| Nuxt + separate Adonis/API package | Rejected. Two apps and a shared package with one consumer. |
| Calculated prayer API | Rejected. Different numbers than KHEU. |

Nitro is not a second product. It is the server half of the same Nuxt app.

---

## 3. Separation of concern

Normal flow:

```text
route / composable
  -> validate input at the boundary
  -> call a named domain function
  -> infrastructure (timetable store, KHEU HTTP) only from server or an explicit adapter
  -> map a DTO into the view
```

Rules:

- `domain/` imports nothing from `vue`, `#imports`, `h3`, `firebase`, or `@netlify/blobs`.
- Vue components do not parse TSV, apply district minutes, decide current/next prayer, or bump Hijri dates.
- Composables may hold clock ticks and UI state. They call domain functions with plain data.
- Server routes validate, call domain, then persist. They do not format Malay countdown strings for the DOM.

### Modules

| Module | Owns | Public API | Must not |
| --- | --- | --- | --- |
| `domain/prayer` | Types, parse, district offset, current/next prayer, countdown, Hijri display bump, month IDs | named functions + types | know Vue, Nitro, or Blobs |
| `domain/ingest` | Normalize KHEU column aliases, parse HTML/JSON fixtures, reject incomplete months | `parseKheuHtml`, `parseKheuSharePointRows`, `parseKheuTsv`, `assertCompleteMonth` | fetch HTTP |
| `server/kheu` | Fetch + HTML table extract | `fetchKheuMonth(year, month)` | contain prayer math |
| `server/timetable` | Year JSON read/write + version bump | `getYear`, `replaceMonth` | parse HTML |
| `app` | Layout, typography, gestures, a11y | pages/components | reimplement domain |

---

## 4. Target repository shape

Single package. Create only these paths when code exists:

```text
app/                          # Nuxt srcDir — UI
  app.vue
  assets/css/main.css
  components/
    prayer-now.vue
    prayer-list.vue
    day-strip.vue
    district-bar.vue
  composables/
    use_prayer_clock.ts       # tick + calls domain
    use_district.ts
  pages/
    index.vue
    admin.vue
  layouts/default.vue
domain/
  prayer/
    prayer.ts                 # types
    parse_time.ts
    district.ts
    current_prayer.ts
    countdown.ts
    hijri_display.ts
    month_id.ts
  ingest/
    parse_kheu_table.ts
    parse_kheu_html.ts
    parse_kheu_sharepoint.ts
    kheu_source.ts
    complete_month.ts
server/
  api/
    prayers.get.ts
    ingest.post.ts            # secret or admin session
  utils/
    kheu_html.ts
    timetable_store.ts
server/data/
  timetable.json            # committed seed / local store
shared/                       # only DTOs used by app + server
  types/timetable.ts
tests/
  bootstrap.ts
  domain/                    # Japa unit tests for domain
  functional/                # ingest HTML/JSON fixtures
    fixtures/
  browser/                   # later: Japa + Playwright
bin/test.ts
nuxt.config.ts
netlify.toml
documents/
  upgrade_spec.md             # this file
  project_architecture.md     # as-is until cutover
```

Aliases: `#domain` → `./domain`, `#shared` → `./shared`. `@` stays Nuxt’s `app/`.

No `packages/`, no `apps/`.

---

## 5. Flows

### Public read

```text
GET /
  -> server prayers.get (or client after first paint)
  -> timetable year + version (JSON file locally, Netlify Blobs in prod)
  -> client cache (localStorage) if version matches
  -> domain: pick today+2 days, apply district, current/next prayer
  -> render
```

Failure: show last good cache; if none, a single quiet empty state. Never a spinner forever.

### Automatic ingest

```text
schedule (daily) POST /api/ingest  (Authorization: Bearer INGEST_SECRET)
  -> for current month (and next month if published)
  -> fetch KHEU HTML
  -> domain parse + completeness check
  -> if identical to stored month, no-op
  -> else replace month + increment version
  -> log month, row count, version; no full timetable in logs
```

Locked fetch (phase 1b, 2026-09-05):

1. **HTML (years in the page dropdown, currently 2011–2025).** `GET https://www.mora.gov.bn/lists/waktusolat/waktusolat.aspx`, read `__VIEWSTATE` / `__VIEWSTATEGENERATOR` / `__EVENTVALIDATION`, then `POST` the same URL with `ctl00$PlaceHolderMain$Dropmonth` (`Jan`…`Dec`), `ctl00$PlaceHolderMain$Dropyear`, and `ctl00$PlaceHolderMain$btncari=Cari`. Querystring `FilterField*` on this view is **not** a reliable month switch (only the default month appears in the table).
2. **All Items JSON (years the dropdown omits, including 2026).** `GET https://www.mora.gov.bn/lists/waktusolat/allitems.aspx?FilterField1=Month&FilterValue1=Jan&FilterField2=Year&FilterValue2=2026`. Parse `var WPQ*ListData = { "Row": [...] }`. Rows are newest-first.
3. **Rejected:** `/_api`, `ListData.svc`, `owssvr.dll?XMLDATA=1` (401). RSS listfeed is 200 but paginated (~174 items), not a full month fetch.

SharePoint `Date` cells are **M/D/YYYY** (January is `1/1`…`1/31`). Admin TSV paste stays **D/M/YYYY**. Constants live in `domain/ingest/kheu_source.ts`.

Fallback: signed-in `/admin` paste of TSV/HTML, same domain parsers.

Poison data: incomplete month → do not write; surface error to admin and ingest log.

### Admin

`ADMIN_SECRET` (or later a single operator login) required. Sync-now button hits ingest. Paste remains for emergency. No Firebase Auth unless that secret model fails.

### Notifications (v1.1, after the clock UI)

Same rules as today: notify at prayer start; highlight starts 15 minutes before. Domain decides; composable calls the Notification API.

---

## 6. Data

One JSON document for the year (about 12 months, well under 1 MB):

```text
{
  year: number
  version: number
  ingestedAt: string | null
  source: 'kheu' | 'admin' | null
  months: { "1": PrayerDay[], ... "12": PrayerDay[] }
}
```

Local: `server/data/timetable.json` (committed seed until ingest writes). Production: the same shape in **Netlify Blobs** so a new month does not need a deploy.

Never `waktu_v2`, never the Vue 2 Firestore `waktu` documents, never a new Firebase project for v1.

`PrayerDay` (domain + stored):

```ts
{
  gregorian: string    // ISO date YYYY-MM-DD
  hijri: string        // KHEU label, e.g. "19 Jamadilakhir 1445"
  imsak: string        // "HH:mm" 24h
  subuh: string
  syuruk: string
  duha: string
  zuhur: string
  asar: string
  maghrib: string
  isya: string
}
```

Migrate off `5.04` + `am/pm` flags. Canonical clocks are `HH:mm` 24h. Canonical months are `1`–`12`.

Writes: replace the year JSON in one put; accept a retry (ingest is idempotent). Do not add a queue or a second store.

Retention: replace in place by month. Cache: versioned year JSON in `localStorage`.

---

## 7. Security

- Public **read** only through `GET /api/prayers` (and the HTML page). No client writes.
- `/api/ingest`: `INGEST_SECRET` header. Netlify cron only.
- `/admin`: `ADMIN_SECRET` (or later one operator login). Server checks before paste/sync.
- Secrets in env, not source. Do not copy Vue 2 emulator passwords or API keys.
- Redact emails and tokens from logs.

---

## 8. TypeScript and tests (Japa)

`typescript.strict: true`. `vue-tsc` in `check`. Domain files: ESLint `no-restricted-imports` for `vue` and `firebase`.

Japa is the runner. Do **not** add Vitest in v1. Component branching that is not domain should be covered by browser tests.

| Suite | Path | Proves |
| --- | --- | --- |
| unit | `tests/domain` | parse, offsets, current/next prayer, countdown, Hijri bump, month completeness |
| functional | `tests/functional` | ingest against HTML/TSV fixtures; API 401 without secret; idempotent write |
| browser | `tests/browser` | home clock, district change, three-day strip, mobile + desktop viewports |

Plugins: `@japa/runner`, `@japa/assert`, `@japa/api-client`, `@japa/browser-client` (Playwright), `@japa/file-system` if fixtures need it.

```text
dev     pnpm dev
check   pnpm check
test    pnpm test
build   pnpm build
start   pnpm start
```

`check` is `nuxt typecheck` plus domain `tsc`. `test` is Japa (`tsx bin/test.ts`).

The old Vue 2 tree under `src/` is reference only. Do not add Vue CLI, Jest, or Cypress to this package.

---

## 9. Package manager and hosting

Use **pnpm** (pinned in `packageManager`). Commit `pnpm-lock.yaml`. Do not add npm or `package-lock.json`.

Pin Node in `.nvmrc` / `engines` (`>=20`).

Deploy: **new** Netlify site, Nitro preset, Netlify Scheduled Function for ingest. A different Netlify profile than the Vue 2 app is expected. Public pages must not need a new deploy to show a new month.

---

## 10. UI / UX foundation (v1 minimal)

### Intent

A quiet night clock for solat, not a generic dashboard and not a themed “Islamic template” (no stock mosque silhouettes, gold gradients, or ornament dumps). One accent colour, lots of air, type does the work.

Reference feeling: a wooden clock in a dark surau — large numerals, a thin gold mark for “now”, everything else recedes.

### Visual tokens

| Token | v1 value | Notes |
| --- | --- | --- |
| Background | `#0C1210` | Near-black with green in the ink |
| Surface | `#121A17` | Only for the district bar / admin |
| Text | `#E8E4D8` | Warm paper |
| Mute | `#8B9188` | Inactive prayers |
| Now | `#D4B45A` | Gold, used only for current prayer + countdown |
| Rule | `1px` `#24302B` | Hairlines, no drop shadows |
| Display type | Fraunces | Times and countdown |
| UI type | Source Sans 3 | Labels, districts, dates |
| Radius | `0` | No cards |
| Space | 8px grid | `clamp` for type and padding |

No Vuetify, no Icon soup. One refresh control, three district names, KHEU attribution.

### Layout

**Mobile (< 768px)**

- Column: Hijri + Masihi → monumental current time → countdown line → remaining prayers → district bar pinned to the bottom (`env(safe-area-inset-bottom)`).
- Days: horizontal snap strip (Hari ini / Esok / Lusa), not a full-screen carousel.
- Type: current time `clamp(3.5rem, 18vw, 6rem)`.

**Desktop (≥ 768px)** and **wide (≥ 1200px)**

- Two panes. Left: current prayer name, huge time, countdown. Right: the rest of the day’s times as a vertical list with the gold row aligned to a baseline, not a card.
- Day switch: text tabs, keyboard left/right.
- Max content width ~1120px, centered. Do not stretch a phone column to 4K.

Both: `prefers-reduced-motion` disables countdown pulse. Hit targets ≥ 44px. Contrast WCAG AA for text and gold-on-ink.

### Motion

Only two: (1) countdown digit change, (2) 15-minute-warning pulse on the gold line. No page transitions in v1.

### Copy

Malay, short, same voice as today (“lagi kn masuk waktu”, “Sudah masuk waktu”). Sumber: KHEU link.

### Explicitly not v1

Light mode, settings drawer, onboarding, illustrations, glassmorphism, Inter/Roboto/Poppins as the display face, bottom nav icons for each prayer.

---

## 11. Phases

Do not rewrite the Vue 2 app in place. This package is already the new project (`pnpm`). Scaffold Nuxt into it in phase 2. `src/` is leftover Vue 2 reference, not a runtime.

| Phase | Outcome | Proof |
| --- | --- | --- |
| 0 | This spec accepted | You say go |
| 1 | Domain + Japa unit tests cloned from v1 behaviour | `pnpm test` green |
| 1b | KHEU HTML spike: lock fetch URL + fixture | **Done.** Functional tests parse saved Jan 2024 HTML, Feb 2024 HTML, and Jan 2026 All Items rows |
| 2 | Nuxt 4 scaffold, TS strict, timetable read API | **Done.** `pnpm check` + `pnpm build`; `pnpm dev` serves `/` and `/api/prayers` |
| 3 | Minimal UI (home + districts + 3 days) at both viewports | Browser tests; visual pass on 390px and 1280px |
| 4 | Ingest route + Netlify cron + admin secret fallback | Functional ingest; Blobs write; unauthenticated write denied |
| 5 | Notifications, PWA, and Google Analytics | GA on the new Netlify site |
| 6 | Delete leftover Vue 2 `src/`, Jest, Cypress, Vuetify | `git grep` clean; architecture doc rewritten to as-is |

The Vue 2 Netlify site and Firebase project stay as they are. This project never deploys over them.

### Behaviour that must survive

- District offsets 0 / +1 / +3
- Today + next two days
- Next-day Imsak/Subuh attached after Isya
- Hijri day bump after Maghrib before midnight
- Countdown Malay strings
- 15-minute highlight
- Notify at the minute a prayer starts
- Cache + version refresh
- Debug clock (`d`, `dt`) can wait until v1.1

---

## 12. Risks and revisit triggers

| Risk | Mitigation |
| --- | --- |
| KHEU HTML markup changes | Fixture tests; admin paste; ingest alerts |
| SharePoint blocks the cron IP | Retry/backoff; operator sync-now |
| Nuxt on Netlify serverless cold starts | Public read can stay JSON/Blob behind `/api/prayers` |
| Japa does not mount Vue SFC | Do not fight it; domain + browser tests |
| Scope creep into “design system” | Tokens in this spec only |

Revisit when:

- KHEU publishes a stable JSON/CSV — delete HTML parsing.
- Ingest must retry for hours unattended — then a durable queue is justified.
- A second client (e.g. native) needs the same domain — then a `packages/prayer` workspace.

### Decisions

1. **Cron: Netlify Scheduled Function** on the **new** Netlify site, calling `POST /api/ingest`.
2. **Keep Google Analytics** as a feature on the new site (new or existing measurement ID).
3. **This is a new project.** Clone prayer *functions* from the Vue 2 app. Do not share its Firebase project, Firestore data, Netlify site, or npm lockfile. Months `1`–`12` from day one.
4. **Storage: JSON file, then Netlify Blobs.** Firestore Spark would be free at this size, but it adds a Google project, Admin SDK, emulator, and rules for ~12 month documents. Skip it unless Blobs cannot hold the year JSON.

---

## 13. Readiness (this spec)

- [x] One Nuxt deployable, one JSON timetable, no extra packages
- [x] Domain vs UI vs server named and directional
- [x] Ingest has a real source (KHEU HTML) and a fallback
- [x] TypeScript + Japa commands defined
- [x] v1 visual rules small enough to implement without a design tool
- [x] Cron host: Netlify Scheduled Function
- [x] Analytics kept (new site)
- [x] New project: own Netlify, no v1 data, no new Firebase
- [x] pnpm (`packageManager` + `pnpm-lock.yaml`)
- [ ] Ingest write auth not yet applied (phase 4)
- [x] Phase 1 done (domain + Japa)
- [x] Phase 1b done (KHEU HTML + All Items fixtures)
- [x] Phase 2 done (Nuxt 4 + file-backed `/api/prayers`)

---

## Implementation filter

Take one phase at a time. Phases 1, 1b, and 2 are done. Next is phase 3 (minimal clock UI). Keep `pnpm test` green.
