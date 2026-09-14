# Upgrade plan — Waktu Sembahyang Brunei

## Current state

All 6 phases complete. Repo is on Nuxt 4 + TypeScript + pnpm with domain, UI, server routes, and legacy cleanup done.

| Layer | Status |
| --- | --- |
| Domain (`domain/`) | Done. Prayer math, ingest parsers, fixtures. `pnpm test` green. |
| Nuxt scaffold + `/api/prayers` | Done. TS strict, file-backed timetable. `pnpm check` + `pnpm build` green. |
| Minimal UI | Done. Components, composables, responsive layout at 390px and 1280px. |
| Ingest + admin | Done. `POST /api/ingest` + `/admin`, secrets, file-backed writes, Netlify cron config. |
| Notifications / PWA / GA | Done. `use_notifications`, manifest, GA via runtime config. |
| Cleanup | Done. `src/`, Jest, Cypress, Firebase configs deleted. Architecture doc rewritten. |

## Post-phase operational checklist

Before first deploy, set these in **Netlify Site settings → Environment variables**:

| Variable | Purpose | Required |
| --- | --- | --- |
| `INGEST_SECRET` | Bearer token for `POST /api/ingest` (cron + manual sync) | Yes |
| `ADMIN_SECRET` | Bearer token for `/admin` routes | Yes |
| `NUXT_PUBLIC_GA_MEASUREMENT_ID` | Google Analytics measurement ID | Optional |
| `NETLIFY_BLOBS_SITE_ID` | Netlify site ID for Blob storage | Yes (production) |
| `NETLIFY_BLOBS_TOKEN` | Netlify personal access token with Blobs scope | Yes (production) |
| `NETLIFY_BLOBS_CONTAINER` | Blob container name (default: `timetable`) | No |

Then:
1. Create new Netlify site, connect this repo, build command `pnpm build`, publish `.output/public`.
2. Add `NETLIFY_BLOBS_SITE_ID` and `NETLIFY_BLOBS_TOKEN` to Netlify env.
3. Enable Netlify Scheduled Functions (Pro plan required for `@daily` cron).
4. Verify unauthenticated `POST /api/ingest` returns 401.
5. Verify `/admin` returns 401 without `ADMIN_SECRET`.
6. Deploy committed `server/data/timetable.json` as initial seed.
7. (Optional) Add PWA icons to `public/` if not using generated ones.

## Original phase details (completed)

### Phase 3 — Minimal clock UI

Target: first-class on 390px and 1280px. Dark, typographic, no cards.

1. **Composables**
   - `app/composables/use_prayer_clock.ts` — tick, call `getPrayerClock` from `#domain`, expose `current`, `next`, `countdown`, `copy`.
   - `app/composables/use_district.ts` — district state, apply offset via `#domain/district`.

2. **Components**
   - `app/components/prayer-now.vue` — current prayer name + time + countdown line. Gold accent only on active row.
   - `app/components/prayer-list.vue` — vertical list of remaining prayers, `tabular-nums`, hairline rules.
   - `app/components/day-strip.vue` — Hari ini / Esok / Lusa text tabs, keyboard left/right.
   - `app/components/district-bar.vue` — three district names, pinned bottom on mobile, surface `#121A17`.

3. **Layout + CSS**
   - `app/layouts/default.vue` — shell, Fraunces for display, Source Sans 3 for UI.
   - Extend `app/assets/css/main.css` with tokens (`--surface`, `radius: 0`, 8px grid).
   - Mobile column: Hijri → time → countdown → prayers → district bar (`env(safe-area-inset-bottom)`).
   - Desktop two-pane: left current prayer, right day list. Max-width 1120px centered.
   - `prefers-reduced-motion` disables pulse. Hit targets ≥ 44px. WCAG AA contrast.

4. **Page logic**
   - `app/pages/index.vue` — fetch `/api/prayers`, pick today + 2 days, apply district, render `prayer-now` + `prayer-list` + `day-strip`. Graceful empty state; no forever spinner.
   - `localStorage` version cache: if server version matches, skip network on reload.

**Proof:** `pnpm test` green. Visual pass at 390px and 1280px.

### Phase 4 — Ingest + admin

Target: no copy-paste, no Firestore.

1. **Server routes**
   - `server/api/ingest.post.ts` — `INGEST_SECRET` header check. Fetch KHEU HTML (SharePoint POST + All Items JSON fallback), parse with `#domain/ingest`, assert complete month, idempotent replace, version bump. Write to `server/data/timetable.json` (local).
   - `server/api/admin.get.ts` + `server/api/admin.post.ts` — `ADMIN_SECRET` check. GET returns current state. POST accepts TSV/HTML paste, runs same domain parsers.

2. **Netlify Blobs**
   - Replace file read in `server/utils/timetable_store.ts` with Blob read in production, file fallback locally. Same `TimetableYear` shape.
   - Add `@netlify/blobs` to `devDependencies`. One read path with env-based adapter.

3. **Cron**
   - `netlify.toml` — add `[functions]` and scheduled function config. Daily `POST /api/ingest`.
   - Secrets: `INGEST_SECRET`, `ADMIN_SECRET` in Netlify env. Never commit.

**Proof:** Functional test: unauthenticated write returns 401. Manual: `/admin` sync-now updates timetable without deploy.

### Phase 5 — Notifications / PWA / GA

1. `app/composables/use_notifications.ts` — request permission, notify at prayer minute.
2. PWA manifest + service worker (Nuxt `@vite-pwa/nuxt` or minimal custom). Install prompt optional.
3. GA: measurement ID in `nuxt.config.ts` head. Same ID or new one on new site.

**Proof:** Desktop + mobile notification at prayer start. Offline reload shows cached timetable.

### Phase 6 — Cleanup

Delete after each phase passes its proof:

1. `src/` (Vue 2 reference, already ignored by Nuxt)
2. `jest.config.js`, `tests/unit/`
3. `cypress.json`, `tests/e2e/`
4. `firebase.json`, `firestore.rules` (if no Firebase in v1)
5. `vue.config.js`, `babel.config.js`
6. Rewrite `documents/project_architecture.md` to as-is new stack.

**Proof:** `git grep` clean of old stack. `pnpm test` still green.

## Execution order

```
Phase 3  →  Phase 4  →  Phase 5  →  Phase 6
```

One phase at a time. `pnpm test` must stay green between phases.

## Ponytail reminders

- Prefer deletion over addition.
- Reuse existing domain functions; do not reimplement prayer math in components.
- Do not add Firestore, Vue 2, npm, workspaces, queues, or extra deployables.
- Use already-installed dependencies first (`date-fns`, Nuxt, Japa).
- Add `ponytail:` comments only for known ceilings with measurable upgrade triggers.
