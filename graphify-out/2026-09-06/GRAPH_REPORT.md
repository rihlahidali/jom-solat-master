# Graph Report - jom-solat-master-vue-master  (2026-09-05)

## Corpus Check
- 84 files · ~37,743 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 430 nodes · 640 edges · 42 communities (21 shown, 6 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- current_prayer.ts
- Admin.vue
- Home.vue
- package.json
- main.js
- firestore.js
- Prayers.js
- global.js
- prayer/index.ts
- Spec — Waktu Sembahyang Brunei upgrade
- compilerOptions
- CountDown.vue
- Project architecture — Waktu Sembahyang Brunei
- What You Must Do When Invoked
- ingest/index.ts
- compilerOptions
- graphify reference: extra exports and benchmark
- graphify reference: query, path, explain
- BottomNavigation.vue
- graphify reference: add a URL and watch a folder
- graphify reference: commit hook and native AGENTS.md integration
- graphify reference: incremental update and cluster-only
- test.ts
- graphify
- graphify reference: GitHub clone and cross-repo merge
- graphify reference: transcribe video and audio
- extraction-spec.md

## God Nodes (most connected - your core abstractions)
1. `Spec — Waktu Sembahyang Brunei upgrade` - 16 edges
2. `Project architecture — Waktu Sembahyang Brunei` - 14 edges
3. `What You Must Do When Invoked` - 12 edges
4. `compilerOptions` - 11 edges
5. `/graphify` - 10 edges
6. `prayerDayFromNamedRecord()` - 9 edges
7. `PrayerDay` - 9 edges
8. `buildThreeDayWindow()` - 8 edges
9. `graphify reference: extra exports and benchmark` - 8 edges
10. `parseKheuHtml()` - 7 edges

## Surprising Connections (you probably didn't know these)
- `january2021()` --indirect_call--> `prayerDayFromLegacyRow()`  [INFERRED]
  tests/domain/helpers.ts → domain/ingest/parse_kheu_table.ts
- `windowAt()` --calls--> `buildThreeDayWindow()`  [EXTRACTED]
  tests/domain/current_prayer.spec.ts → domain/prayer/day_schedule.ts
- `prayerDayFromCells()` --calls--> `parseKheuToHHmm()`  [EXTRACTED]
  domain/ingest/parse_kheu_table.ts → domain/prayer/parse_time.ts
- `assertCompleteMonth()` --calls--> `daysInMonth()`  [EXTRACTED]
  domain/ingest/complete_month.ts → domain/prayer/calendar.ts
- `parseKheuHtml()` --calls--> `prayerDayFromNamedRecord()`  [EXTRACTED]
  domain/ingest/parse_kheu_html.ts → domain/ingest/parse_kheu_table.ts

## Import Cycles
- None detected.

## Communities (42 total, 6 thin omitted)

### Community 0 - "current_prayer.ts"
Cohesion: 0.23
Nodes (12): prayerDayFromLegacyRow(), countdownCopy(), formatCountdown(), getPrayerClock(), isBeforeZuhur(), isFirstHalfNight(), isIsyaBeforeMidnight(), displayHijri() (+4 more)

### Community 3 - "Home.vue"
Cohesion: 0.12
Nodes (10): formatandPushPrayerDataToDays(), getDateData(), GetPrayerData(), hasData(), initTodayDate(), mounted(), registerEventBus(), TodayDate() (+2 more)

### Community 4 - "package.json"
Cohesion: 0.07
Nodes (25): date-fns, @japa/assert, @japa/runner, dependencies, date-fns, devDependencies, @japa/assert, @japa/runner (+17 more)

### Community 5 - "main.js"
Cohesion: 0.12
Nodes (3): eventBus, router, routes

### Community 6 - "firestore.js"
Cohesion: 0.17
Nodes (19): createUser(), getAuthInstance(), getCurrentUser(), seedData(), signInUser(), signOutUser(), useAuthEmulator(), clearLocalStorageAndFlushFirestore() (+11 more)

### Community 7 - "Prayers.js"
Cohesion: 0.12
Nodes (6): checkNewData(), getDatabaseMetaDataFromFirebase(), getDataFromFireBase(), getDataFromFirebaseAndSaveToPrayerModule(), getDataFromLocalStorage(), getPrayerData()

### Community 8 - "global.js"
Cohesion: 0.38
Nodes (4): isObject(), $notify(), $requestPushPermission(), wsbPrint()

### Community 9 - "prayer/index.ts"
Cohesion: 0.13
Nodes (35): addDays(), formatGregorianLabel(), MONTH_NAMES, monthDisplayName(), monthKey(), toIsoDate(), weekdayName(), WEEKDAYS (+27 more)

### Community 10 - "Spec — Waktu Sembahyang Brunei upgrade"
Cohesion: 0.06
Nodes (35): 10. UI / UX foundation (v1 minimal), 11. Phases, 12. Risks and revisit triggers, 13. Readiness (this spec), 1. Context, 2. Why Nuxt, and why not something smaller, 3. Separation of concern, 4. Target repository shape (+27 more)

### Community 11 - "compilerOptions"
Cohesion: 0.29
Nodes (6): compilerOptions, baseUrl, paths, exclude, dist, node_modules

### Community 12 - "CountDown.vue"
Cohesion: 0.48
Nodes (4): getStatus(), handler(), updateCountdown(), updatePrayerTime()

### Community 23 - "Project architecture — Waktu Sembahyang Brunei"
Cohesion: 0.06
Nodes (33): Agent instructions, 10. Incremental plan, 11. Risks, questions, revisit triggers, 12. Readiness checklist, 1. Context, 2. System shape, 3. Modules, ownership, boundaries, 4. Repository structure (paths that exist) (+25 more)

### Community 24 - "What You Must Do When Invoked"
Cohesion: 0.08
Nodes (24): For /graphify add and --watch, For /graphify query, For the commit hook and native AGENTS.md integration, For --update and --cluster-only, /graphify, Honesty Rules, Interpreter guard for subcommands, Part A - Structural extraction for code files (+16 more)

### Community 25 - "ingest/index.ts"
Cohesion: 0.11
Nodes (34): assertCompleteMonth(), isoOn(), KHEU_ALL_ITEMS_PAGE, KHEU_HTML_FORM, KHEU_HTML_PAGE, KHEU_LIST_ID, KHEU_MONTH_CODES, KHEU_ORIGIN (+26 more)

### Community 26 - "compilerOptions"
Cohesion: 0.11
Nodes (18): bin/test.ts, domain/**/*.ts, node, tests/bootstrap.ts, tests/domain/**/*.ts, tests/functional/**/*.ts, compilerOptions, esModuleInterop (+10 more)

### Community 28 - "graphify reference: extra exports and benchmark"
Cohesion: 0.22
Nodes (8): graphify reference: extra exports and benchmark, Step 6b - Wiki (only if --wiki flag), Step 7 - Neo4j export (only if --neo4j or --neo4j-push flag), Step 7a - FalkorDB export (only if --falkordb or --falkordb-push flag), Step 7b - SVG export (only if --svg flag), Step 7c - GraphML export (only if --graphml flag), Step 7d - MCP server (only if --mcp flag), Step 8 - Token reduction benchmark (only if total_words > 5000)

### Community 29 - "graphify reference: query, path, explain"
Cohesion: 0.33
Nodes (5): For /graphify explain, For /graphify path, graphify reference: query, path, explain, Step 0 — Constrained query expansion (REQUIRED before traversal), Step 1 — Traversal

### Community 30 - "BottomNavigation.vue"
Cohesion: 0.47
Nodes (3): getSelectedDistrict(), mounted(), updateSelectedDistrict()

### Community 31 - "graphify reference: add a URL and watch a folder"
Cohesion: 0.50
Nodes (3): For /graphify add, For --watch, graphify reference: add a URL and watch a folder

### Community 32 - "graphify reference: commit hook and native AGENTS.md integration"
Cohesion: 0.50
Nodes (3): For git commit hook, For native AGENTS.md integration, graphify reference: commit hook and native AGENTS.md integration

### Community 33 - "graphify reference: incremental update and cluster-only"
Cohesion: 0.50
Nodes (3): For --cluster-only, For --update (incremental re-extraction), graphify reference: incremental update and cluster-only

## Knowledge Gaps
- **139 isolated node(s):** `/Users/ahmadghazali.hanipah/.local/bin/graphify-mcp`, `COLUMN_ALIASES`, `PRAYER_FIELDS`, `CELL_FIELDS`, `baseUrl` (+134 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 217 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Spec — Waktu Sembahyang Brunei upgrade` connect `Spec — Waktu Sembahyang Brunei upgrade` to `Project architecture — Waktu Sembahyang Brunei`?**
  _High betweenness centrality (0.019) - this node is a cross-community bridge._
- **What connects `/Users/ahmadghazali.hanipah/.local/bin/graphify-mcp`, `COLUMN_ALIASES`, `PRAYER_FIELDS` to the rest of the system?**
  _139 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Home.vue` be split into smaller, more focused modules?**
  _Cohesion score 0.11956521739130435 - nodes in this community are weakly interconnected._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.07142857142857142 - nodes in this community are weakly interconnected._
- **Should `main.js` be split into smaller, more focused modules?**
  _Cohesion score 0.11764705882352941 - nodes in this community are weakly interconnected._
- **Should `Prayers.js` be split into smaller, more focused modules?**
  _Cohesion score 0.12380952380952381 - nodes in this community are weakly interconnected._
- **Should `prayer/index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.13131313131313133 - nodes in this community are weakly interconnected._