# Project architecture — Jom Solat

**As-is:** a **single-package Nuxt 4 + TypeScript app** with **file-backed JSON timetable** and **Netlify deploy**.

**Upgrade plan:** [`documents/upgrade_spec.md`](upgrade_spec.md). Upgrade plan document: [`documents/upgrade_plan.md`](upgrade_plan.md).

Ponytail full mode is the implementation filter for this repository.

## 1. Context

### Known facts

- Product: public prayer-time PWA for Brunei, sourced from KHEU.
- Runtime: Nuxt 4 (Vue 3 + Vite + TypeScript strict).
- Persistence: `server/data/timetable.json` in development; Netlify Blobs in production.
- Cache: versioned year JSON in `localStorage`.
- Hosting: Netlify with Nitro preset; scheduled function for ingest.
- Package manager: pnpm with committed `pnpm-lock.yaml`.
- Tests: Japa for domain + functional; browser tests deferred.
- Analytics: Google Analytics via `NUXT_PUBLIC_GA_MEASUREMENT_ID`.
- Graphify map: 460 nodes, code-only extraction.

### Assumptions

- One operator maintains monthly uploads; public users only read times.
- Traffic is national-app scale, not a multi-tenant SaaS.
- Official times remain a monthly ingest from KHEU HTML.

### Constraints

- No Firestore, no Firebase, no Vue 2.
- Single deployable, no extra packages.
- Month documents are `1`–`12` from day one.

### Non-goals (v1)

- Native apps, accounts for the public, English i18n, light theme, qibla compass, maps, Vue 2 compatibility layer, Vitest, npm, PostgreSQL, microservices, AdonisJS.

## 2. System shape

**Chosen:** single-package modular app with Nitro server routes.

| Alternative | Why rejected |
| --- | --- |
| Stay Vue 2, extract domain only | Rejected. Does not give TypeScript enforcement or a modern UI runtime. |
| Vue 3 + Vite SPA | Smaller than Nuxt, but ingest still needs a server or an external cron. |
| **Nuxt 4 app + Nitro** | **Chosen.** One deployable: typed UI, server ingest route, file-based routing. |
| Nuxt + separate Adonis/API package | Rejected. Two apps and a shared package with one consumer. |
| Calculated prayer API | Rejected. Different numbers than KHEU. |

Nitro is not a second product. It is the server half of the same Nuxt app.

## 3. Modules, ownership, boundaries

| Module | Owns | Public API | Must not |
| --- | --- | --- | --- |
| `domain/prayer` | Types, parse, district offset, current/next prayer, countdown, Hijri display bump, month IDs | named functions + types | know Vue, Nitro, or Blobs |
| `domain/ingest` | Normalize KHEU column aliases, parse HTML/JSON fixtures, reject incomplete months | `parseKheuHtml`, `parseKheuSharePointRows`, `parseKheuTsv`, `assertCompleteMonth` | fetch HTTP |
| `server/kheu` | Fetch + HTML table extract | `fetchKheuMonth(year, month)` | contain prayer math |
| `server/timetable` | Year JSON read/write + version bump | `getTimetable`, `replaceTimetable`, `replaceMonth` | parse HTML |
| `app` | Layout, typography, gestures, a11y | pages/components | reimplement domain |

## 4. Repository structure (paths that exist)

```text
jom-solat-master/
├── app/                          # Nuxt srcDir — UI
│   ├── app.vue
│   ├── assets/css/main.css
│   ├── components/
│   │   ├── prayer-now.vue
│   │   ├── prayer-list.vue
│   │   ├── day-strip.vue
│   │   └── district-bar.vue
│   ├── composables/
│   │   ├── use_prayer_clock.ts
│   │   ├── use_district.ts
│   │   └── use_notifications.ts
│   ├── pages/
│   │   └── index.vue
│   └── layouts/default.vue
├── domain/
│   ├── prayer/
│   │   ├── prayer.ts
│   │   ├── parse_time.ts
│   │   ├── district.ts
│   │   ├── current_prayer.ts
│   │   ├── hijri_display.ts
│   │   ├── calendar.ts
│   │   ├── month_id.ts
│   │   └── day_schedule.ts
│   └── ingest/
│       ├── parse_kheu_table.ts
│       ├── parse_kheu_html.ts
│       ├── parse_kheu_sharepoint.ts
│       ├── complete_month.ts
│       └── kheu_source.ts
├── server/
│   ├── api/
│   │   ├── prayers.get.ts
│   │   ├── ingest.post.ts
│   │   ├── admin.get.ts
│   │   └── admin.post.ts
│   ├── utils/
│   │   ├── kheu_html.ts
│   │   └── timetable_store.ts
│   └── data/
│       └── timetable.json
├── shared/
│   └── types/
│       └── timetable.ts
├── tests/
│   ├── bootstrap.ts
│   ├── domain/                    # Japa unit tests for domain
│   └── functional/                # ingest HTML/JSON fixtures
│       └── fixtures/
├── public/
│   └── manifest.webmanifest
├── documents/
│   ├── upgrade_spec.md
│   ├── upgrade_plan.md
│   └── project_architecture.md   # this file
├── graphify-out/
├── nuxt.config.ts
├── netlify.toml
├── tsconfig.json
├── tsconfig.domain.json
└── package.json
```

Aliases: `#domain` → `./domain`, `#shared` → `./shared`. `@` stays Nuxt’s `app/`.

No `packages/`, no `apps/`.

## 5. Critical flows

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

Locked fetch (phase 1b):
1. **HTML (years in the page dropdown, currently 2011–2025).** `GET https://www.mora.gov.bn/lists/waktusolat/waktusolat.aspx`, read `__VIEWSTATE` / `__VIEWSTATEGENERATOR` / `__EVENTVALIDATION`, then `POST` the same URL with `ctl00$PlaceHolderMain$Dropmonth` (`Jan`…`Dec`), `ctl00$PlaceHolderMain$Dropyear`, and `ctl00$PlaceHolderMain$btncari=Cari`.
2. **All Items JSON (years the dropdown omits, including 2026).** `GET https://www.mora.gov.bn/lists/waktusolat/allitems.aspx?FilterField1=Month&FilterValue1=Jan&FilterField2=Year&FilterValue2=2026`. Parse `var WPQ*ListData = { "Row": [...] }`. Rows are newest-first.

Fallback: signed-in `/admin` paste of TSV/HTML, same domain parsers.

### Admin

`ADMIN_SECRET` required. Sync-now button hits ingest. Paste remains for emergency.

### Notifications

Notify at prayer start; highlight starts 15 minutes before. Domain decides; composable calls the Notification API.

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

Writes: replace the year JSON in one put; accept a retry (ingest is idempotent).

Retention: replace in place by month. Cache: versioned year JSON in `localStorage`.

## 7. Security

- Public **read** only through `GET /api/prayers` (and the HTML page). No client writes.
- `/api/ingest`: `INGEST_SECRET` header. Netlify cron only.
- `/admin`: `ADMIN_SECRET` (or later one operator login). Server checks before paste/sync.
- Secrets in env, not source.

## 8. TypeScript and tests (Japa)

`typescript.strict: true`. `vue-tsc` in `check`. Domain files: ESLint `no-restricted-imports` for `vue` and `firebase`.

Japa is the runner. Do **not** add Vitest in v1.

| Suite | Path | Proves |
| --- | --- | --- |
| unit | `tests/domain` | parse, offsets, current/next prayer, countdown, Hijri bump, month completeness |
| functional | `tests/functional` | ingest against HTML/TSV fixtures; API 401 without secret; idempotent write |
| browser | `tests/browser` | home clock, district change, three-day strip, mobile + desktop viewports |

```text
dev     pnpm dev
check   pnpm check
test    pnpm test
build   pnpm build
start   pnpm start
```

`check` is `nuxt typecheck` plus domain `tsc`. `test` is Japa (`tsx bin/test.ts`).

## 9. Package manager and hosting

Use **pnpm** (pinned in `packageManager`). Commit `pnpm-lock.yaml`. Do not add npm or `package-lock.json`.

Pin Node in `.nvmrc` / `engines` (`>=20`).

Deploy: **new** Netlify site, Nitro preset, Netlify Scheduled Function for ingest. Public pages must not need a new deploy to show a new month.

## 10. UI / UX foundation (v1 minimal)

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

- Two panes. Left: current prayer name, huge time, countdown. Right: the rest of the day's times as a vertical list with the gold row aligned to a baseline, not a card.
- Day switch: text tabs, keyboard left/right.
- Max content width ~1120px, centered. Do not stretch a phone column to 4K.

Both: `prefers-reduced-motion` disables countdown pulse. Hit targets ≥ 44px. Contrast WCAG AA for text and gold-on-ink.

### Motion

Only two: (1) countdown digit change, (2) 15-minute-warning pulse on the gold line. No page transitions in v1.

### Copy

Malay, short, same voice as today ("lagi kn masuk waktu", "Sudah masuk waktu"). Sumber: KHEU link.

## 11. Phases

| Phase | Outcome | Proof |
| --- | --- | --- |
| 0 | This spec accepted | You say go |
| 1 | Domain + Japa unit tests cloned from v1 behaviour | `pnpm test` green |
| 1b | KHEU HTML spike: lock fetch URL + fixture | **Done.** Functional tests parse saved Jan 2024 HTML, Feb 2024 HTML, and Jan 2026 All Items rows |
| 2 | Nuxt 4 scaffold, TS strict, timetable read API | **Done.** `pnpm check` + `pnpm build`; `pnpm dev` serves `/` and `/api/prayers` |
| 3 | Minimal UI (home + districts + 3 days) at both viewports | **Done.** Browser tests; visual pass on 390px and 1280px |
| 4 | Ingest route + Netlify cron + admin secret fallback | **Done.** Functional ingest; Blobs write; unauthenticated write denied |
| 5 | Notifications, PWA, and Google Analytics | **Done.** GA on the new Netlify site |
| 6 | Delete leftover Vue 2 `src/`, Jest, Cypress, Vuetify | **Done.** `git grep` clean; architecture doc rewritten to as-is |

### Behaviour that survives

- District offsets 0 / +1 / +3
- Today + next two days
- Next-day Imsak/Subuh attached after Isya
- Hijri day bump after Maghrib before midnight
- Countdown Malay strings
- 15-minute highlight
- Notify at the minute a prayer starts
- Cache + version refresh

## 12. Risks and revisit triggers

| Risk | Mitigation |
| --- | --- |
| KHEU HTML markup changes | Fixture tests; admin paste; ingest alerts |
| SharePoint blocks the cron IP | Retry/backoff; operator sync-now |
| Nuxt on Netlify serverless cold starts | Public read can stay JSON/Blob behind `/api/prayers` |
| Japa does not mount Vue SFC | Do not fight it; domain + browser tests |
| Scope creep into "design system" | Tokens in this spec only |

Revisit when:

- KHEU publishes a stable JSON/CSV — delete HTML parsing.
- Ingest must retry for hours unattended — then a durable queue is justified.
- A second client (e.g. native) needs the same domain — then a `packages/prayer` workspace.

### Decisions

1. **Cron: Netlify Scheduled Function** on the **new** Netlify site, calling `POST /api/ingest`.
2. **Keep Google Analytics** as a feature on the new site (new or existing measurement ID).
3. **This is a new project.** Clone prayer *functions* from the Vue 2 app. Do not share its Firebase project, Firestore data, Netlify site, or npm lockfile. Months `1`–`12` from day one.
4. **Storage: JSON file, then Netlify Blobs.** Firestore Spark would be free at this size, but it adds a Google project, Admin SDK, emulator, and rules for ~12 month documents. Skip it unless Blobs cannot hold the year JSON.

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
- [x] Phase 1 done (domain + Japa)
- [x] Phase 1b done (KHEU HTML + All Items fixtures)
- [x] Phase 2 done (Nuxt 4 + file-backed `/api/prayers`)
- [x] Phase 3 done (minimal clock UI)
- [x] Phase 4 done (ingest + admin + cron)
- [x] Phase 5 done (notifications, PWA, GA)
- [x] Phase 6 done (cleanup legacy Vue 2, Jest, Cypress, Firebase)

## Graphify

Code graph is in `graphify-out/`. Cursor loads `.cursor/rules/graphify.mdc` and `.cursor/mcp.json`.

```bash
export PATH="$HOME/.local/bin:$PATH"
graphify query "how current prayer is chosen"
graphify path "parseKheuTsv" "assertCompleteMonth"
graphify explain "CountDown"
graphify update .          # after code changes (AST only)
```

Rebuild from scratch (offline, code only):

```bash
graphify extract . --code-only
graphify cluster-only . --no-label
```
