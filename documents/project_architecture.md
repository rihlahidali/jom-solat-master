# Project architecture — Waktu Sembahyang Brunei

**As-is:** a **single-package Vue 2 SPA** with **one Firestore database** and **one static deploy**.

**Target:** a **new** Nuxt 4 + TypeScript app on **pnpm**, own Firebase, own Netlify site. See [`documents/upgrade_spec.md`](upgrade_spec.md). This file is a snapshot of the old Vue 2 app only.

Ponytail full mode is the implementation filter for this repository.

## 1. Context

### Known facts

- Product: public prayer-time PWA for Brunei, sourced from KHEU.
- Runtime: Vue 2.6 + Vue Router 3 + Vuex 3 + Vuetify 2, built by Vue CLI 4.
- Persistence: Firebase project `waktu-sembahyang-brunei`. Collections `waktu` (one document per month) and `metadata/data` (integer `version`).
- Cache: `localStorage.prayer_data` and `localStorage.local_storage_metadata`.
- Hosting: Netlify SPA fallback in `netlify.toml`. PWA/service worker in production only.
- Local backend: Firebase emulators, Auth port `9099`, Firestore port `8089`.
- Package manager: npm with `package-lock.json`. App version `3.0.0`.
- Analytics: `vue-gtag` with measurement ID `G-C2E9CKWZCC` in production.
- Graphify map (2026-09-05, code-only): 233 nodes, 302 edges, 23 communities. God nodes cluster around Firestore helpers and npm `scripts`.

### Assumptions

- One operator maintains monthly uploads; public users only read times.
- Traffic is national-app scale, not a multi-tenant SaaS.
- Official times remain a monthly paste from KHEU rather than a live government API.

### Constraints

- Vue CLI 4 / Vue 2 stack; Node and sass tooling are dated.
- Firestore month document IDs for Oct–Dec are `910`/`911`/`912`.
- Firebase web config is compiled into the client (normal for Firebase web apps).

### Non-goals (now)

- Native mobile apps, user accounts for the public, calculation of times from astronomy, multi-country support, TypeScript migration, Vue 3 migration, pnpm migration.

## 2. System shape

**Chosen:** single-package modular SPA.

| Alternative | Why rejected now |
| --- | --- |
| Modular monolith API + DB | No server of our own; Firestore is the backend |
| Monorepo with apps/packages | One deployable, one team, no second consumer |
| Microservices | No independent ownership, scale, or release need |

Business modules live as Vuex modules + views, not as workspace packages.

## 3. Modules, ownership, boundaries

| Module | Owns | Public surface | Depends on |
| --- | --- | --- | --- |
| Prayer display (`views/Home.vue`, `components/*`) | Rendering today+2 days, countdown, Hijri/Gregorian labels | Route `/` | `prayers`, `days`, `months`, `eventBus` |
| District selection (`BottomNavigation.vue`) | Selected district + offsets applied in Home | `districtClicked` on `eventBus` | `localStorage` |
| Prayer catalog (`store/module/Prayers.js`) | Year of times, metadata version, fetch/cache policy | Vuex `prayers/*` | Firestore |
| Calendar labels (`Days.js`, `Months.js`) | Malay day names, English month names, month IDs | Vuex getters | nothing |
| Admin ingest (`views/Admin.vue`) | TSV parse + upload + version bump | Route `/admin` | Firestore |
| Firebase infra (`src/infrastructure/firebase/`) | App init, Firestore CRUD, Auth helpers, emulator seed | exported functions | Firebase SDK |
| Notifications (`mixins/global.js`) | Push permission + snackbar | `$push`, `$notify` | `push.js`, Vuex root |

Dependency direction: views → Vuex → Firebase. Do not import views from infrastructure.

Observed cycles (keep until a real bug forces a split): `main.js` ↔ `Home.vue` / `BottomNavigation.vue` via `eventBus`.

## 4. Repository structure (paths that exist)

```text
waktu-sembahyang-brunei-vue-master/
├── src/
│   ├── main.js
│   ├── App.vue
│   ├── router/index.js
│   ├── store/
│   │   ├── index.js
│   │   └── module/{Prayers,Days,Months}.js
│   ├── views/{Home,Admin}.vue
│   ├── components/{CountDown,DisplayInfo,BottomNavigation,Version}.vue
│   ├── mixins/global.js
│   ├── plugins/vuetify.js
│   └── infrastructure/firebase/{index,config,firestore,auth}.js
├── tests/{unit,e2e}/
├── public/
├── website/                 # vuese component docs
├── documents/project_architecture.md
├── graphify-out/
├── firebase.json
├── firestore.rules
├── netlify.toml
└── package.json
```

Do not add `apps/`, `packages/`, or `platform/` folders. They are not justified.

## 5. Critical flows

### Read prayer times (public)

```text
browser GET /
  -> App created: dispatch prayers/getPrayerData
  -> localStorage hit? hydrate Vuex and set hasData
  -> compare metadata.version with Firestore
  -> if missing or stale: getDocs(waktu), write Vuex + localStorage
  -> Home formats today/tomorrow/day-after, applies district minutes
  -> CountDown emits current/next prayer; DisplayInfo highlights the active row
  -> at prayer start: $push + snackbar
```

Failure: fetch errors are `console.error`; UI stays on the previous cache or the loader.

### Admin upload

```text
paste TSV -> convertText (tab/newline split, `:` to `.`)
  -> updatePrayerByMonth(monthId, days)  // setDoc waktu/{id} { Day: [...] }
  -> updateMetadata(localVersion + 1)
  -> clients refresh on next version check
```

Failure: button loading flag is not cleared in `catch`. No auth check. No schema validation beyond split columns.

### Local development

```text
npm run firebase:emulator
npm run serve
  -> NODE_ENV != production
  -> connect Firestore/Auth emulators
  -> clear localStorage, DELETE emulator documents, seed dummy year + admin user
```

### Async work

None durable. Version check is a best-effort follow-up promise. No queues.

## 6. Data

**Authoritative store:** Firestore.

- `waktu/{monthId}` → `{ Day: PrayerDay[] }` where `PrayerDay` has `Date`, `Tarikh`, `Imsak`, `Subuh`, `Syuruk`, `Duha`, `Zuhur`, `Asar`, `Maghrib`, `Isya` as strings like `"5.04"`.
- `metadata/data` → `{ data: { version: number } }`.

**Client cache:** full year JSON in `localStorage`. Eventual consistency is acceptable; a stale day until the version check completes is fine.

**Transactions:** single `setDoc` per month plus a separate metadata write. Not atomic. A crash between them can leave new times with an old version (clients will not refresh) or the reverse.

**Time:** wall-clock `Date` in the browser; prayer strings are parsed with am/pm from `prayer_name`. No UTC store.

**Retention:** yearly replacement via admin upload. No personal data besides optional notification permission.

**Backup:** Firebase project backups; not automated in this repo.

**Recovery:** re-upload the month from KHEU TSV.

## 7. Security and observability

| Control | Current state | Action |
| --- | --- | --- |
| Authn | Auth helpers exist; `/admin` does not use them | **Fix now** before any production write hardening |
| Authz | `firestore.rules` allow `read, write` on all documents | **Fix now**: public read on `waktu`/`metadata`; authenticated write only |
| Secrets | Firebase web API key in `src/infrastructure/firebase/config.js` | Keep (browser keys); restrict by HTTP referrer in Firebase console |
| Emulator password | `admin@wsb.com` / `!Password1` in `auth.js` | Acceptable for emulator only; never use in production |
| Validation | Admin TSV is unsanitized | **Improve incrementally**: reject wrong column counts |
| Logging | `console.log` / `console.error`; GA in production | Keep; do not log prayer dumps at volume |
| Rate limit | None | Defer; static hosting + Firestore quotas |

Do not log notification payloads or emails if Auth is wired up later.

## 8. Testing and commands

Cheapest tests that prove behavior:

1. Lint (`npm run lint`)
2. Unit: mixins, Firestore helpers against emulator
3. Cypress: home load, cached timetable, district-ish navigation, debug panel

| Intent | Actual command |
| --- | --- |
| `dev` | `npm run serve` (emulator in another terminal) |
| `check` | `npm run lint` |
| `test` | `npm run test:unit` then `npm run test:e2e` |
| `build` | `npm run build` |
| `start` | serve `dist/` (not scripted; Netlify does this) |

`tests/unit/example.spec.js` imports a missing `HelloWorld.vue` — treat as dead. Firestore unit tests require the emulator.

CI is not defined in-repo. Revisit when there is a hosted pipeline.

## 9. Package manager

**Keep npm.** This is a small, stable single-package app with an existing lockfile. pnpm would be a migration without measured install/disk/CI benefit.

Pin policy: lockfile is source of truth; do not add `packageManager` until a toolchain forces it.

Unused declared dependencies (candidates to delete when next touching `package.json`): `vue-resource`, `lodash`. `axios` is used by the emulator flush.

## 10. Incremental plan

Do **not** rewrite. Order if work continues:

1. **Fix now:** Firestore rules + admin authentication. Add a test that unauthenticated writes fail.
2. **Fix now / cheap:** delete or skip `example.spec.js`; clear admin loading state on error.
3. **Improve incrementally:** validate TSV rows; wrap month+metadata writes; replace `eventBus` with Vuex only if a third subscriber appears.
4. **Delete:** unused `vue-resource` and `lodash` after confirming no dynamic use.
5. **Defer:** Vue 3, TypeScript, pnpm, calculated (non-KHEU) times.

Rollback: revert the git commit; Firestore rules rollback via Firebase console; data rollback by re-uploading the previous month TSV.

## 11. Risks, questions, revisit triggers

**Risks**

- Open Firestore rules mean anyone who finds `/admin` or the project ID can overwrite the national timetable.
- Import cycle through `eventBus` in `main.js` makes unit-testing Home harder.
- Vue CLI 4 / `node-sass` will break on newer Node versions.
- Hijri date bump after Maghrib is string/regex based, not a real calendar.

**Unanswered (non-blocking)**

- Is production Firestore still world-writable?
- Who currently performs the monthly upload?

**Revisit triggers**

| Change | Trigger |
| --- | --- |
| Second deployable (API/worker) | Need server-side secrets, cron ingest, or auth you cannot do in Firestore rules |
| Shared package | Two apps consume the same prayer-time parser |
| Vue 3 | Vue 2 security/support end plus a feature that needs the new compiler |
| pnpm | Measured install or CI time problem on this repo |
| PostgreSQL | Firestore access patterns fail (ad-hoc query, reporting) |
| Queue | Monthly ingest must retry durably without a human at `/admin` |

## 12. Readiness checklist

### Boundaries

- [x] One SPA with a named purpose
- [x] Dependencies mostly views → store → Firebase
- [x] No unjustified shared packages or extra services
- [ ] Import cycle via `eventBus` (known; defer)

### Correctness and data

- [ ] Admin TSV not schema-validated
- [ ] Month + metadata writes not transactional
- [x] Time handled at the UI boundary
- [x] No money/PII domains
- [ ] No durable delivery for ingest

### Security and operation

- [ ] Admin not authenticated
- [ ] Firestore rules are open
- [x] No server secrets in repo beyond the public Firebase web config
- [ ] No backup/restore runbook in-repo

### Developer experience

- [x] Quick start: `npm install`, emulator, `npm run serve`
- [ ] No CI
- [x] npm lockfile committed
- [x] Cypress covers the home journey with fixture data

### Simplicity

- [x] Single deployable, single database
- [x] No placeholder services
- [x] Request flow can be explained without extra layers

## Graphify

Code graph is in `graphify-out/`. Cursor loads `.cursor/rules/graphify.mdc` and `.cursor/mcp.json`.

```bash
export PATH="$HOME/.local/bin:$PATH"
graphify query "how does getPrayerData choose localStorage vs Firestore"
graphify path "uploadData" "updateMetadata"
graphify explain "CountDown"
graphify update .          # after code changes (AST only)
```

Rebuild from scratch (offline, code only):

```bash
graphify extract . --code-only
graphify cluster-only . --no-label
```
