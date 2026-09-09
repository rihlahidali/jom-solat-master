# Graph Report - jom-solat-master-vue-master  (2026-09-05)

## Corpus Check
- 79 files · ~34,149 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 481 nodes · 646 edges · 68 communities (23 shown, 30 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- devDependencies
- dependencies
- Admin.vue
- Home.vue
- scripts
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
- parse_kheu_table.ts
- compilerOptions
- Waktu Sembahyang Brunei
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
- babel-eslint
- extraction-spec.md
- eslint
- eslint-plugin-prettier
- eslint-plugin-vue
- @japa/assert
- @japa/runner
- prettier
- sass
- sass-loader
- tsx
- @types/node
- typescript
- @vue/cli-plugin-babel
- @vue/cli-plugin-e2e-cypress
- @vue/cli-plugin-pwa
- @vue/cli-plugin-router
- @vue/cli-plugin-unit-jest
- vue-cli-plugin-vuetify
- @vue/cli-plugin-vuex
- @vue/cli-service
- @vue/eslint-config-prettier
- vue-template-compiler
- @vue/test-utils
- vuetify-loader

## God Nodes (most connected - your core abstractions)
1. `Spec — Waktu Sembahyang Brunei upgrade` - 16 edges
2. `Project architecture — Waktu Sembahyang Brunei` - 14 edges
3. `What You Must Do When Invoked` - 12 edges
4. `scripts` - 11 edges
5. `compilerOptions` - 11 edges
6. `/graphify` - 10 edges
7. `buildThreeDayWindow()` - 8 edges
8. `graphify reference: extra exports and benchmark` - 8 edges
9. `Waktu Sembahyang Brunei` - 8 edges
10. `scheduleDay()` - 7 edges

## Surprising Connections (you probably didn't know these)
- `january2021()` --indirect_call--> `prayerDayFromLegacyRow()`  [INFERRED]
  tests/domain/helpers.ts → domain/ingest/parse_kheu_table.ts
- `windowAt()` --calls--> `buildThreeDayWindow()`  [EXTRACTED]
  tests/domain/current_prayer.spec.ts → domain/prayer/day_schedule.ts
- `prayerDayFromCells()` --calls--> `parseKheuToHHmm()`  [EXTRACTED]
  domain/ingest/parse_kheu_table.ts → domain/prayer/parse_time.ts
- `windowAt()` --calls--> `january2021()`  [EXTRACTED]
  tests/domain/current_prayer.spec.ts → tests/domain/helpers.ts
- `assertCompleteMonth()` --calls--> `daysInMonth()`  [EXTRACTED]
  domain/ingest/complete_month.ts → domain/prayer/calendar.ts

## Import Cycles
- None detected.

## Communities (68 total, 30 thin omitted)

### Community 0 - "devDependencies"
Cohesion: 0.29
Nodes (7): axios, node-sass, devDependencies, axios, node-sass, @vue/cli-plugin-eslint, @vue/cli-plugin-eslint

### Community 1 - "dependencies"
Cohesion: 0.07
Nodes (27): animate.css, core-js, date-fns, lodash, @mdi/font, dependencies, animate.css, core-js (+19 more)

### Community 3 - "Home.vue"
Cohesion: 0.12
Nodes (10): formatandPushPrayerDataToDays(), getDateData(), GetPrayerData(), hasData(), initTodayDate(), mounted(), registerEventBus(), TodayDate() (+2 more)

### Community 4 - "scripts"
Cohesion: 0.10
Nodes (18): name, private, repository, type, url, scripts, build, firebase:emulator (+10 more)

### Community 5 - "main.js"
Cohesion: 0.12
Nodes (3): eventBus, router, routes

### Community 6 - "firestore.js"
Cohesion: 0.15
Nodes (21): firebase, firebase, createUser(), getAuthInstance(), getCurrentUser(), seedData(), signInUser(), signOutUser() (+13 more)

### Community 7 - "Prayers.js"
Cohesion: 0.12
Nodes (6): checkNewData(), getDatabaseMetaDataFromFirebase(), getDataFromFireBase(), getDataFromFirebaseAndSaveToPrayerModule(), getDataFromLocalStorage(), getPrayerData()

### Community 8 - "global.js"
Cohesion: 0.38
Nodes (4): isObject(), $notify(), $requestPushPermission(), wsbPrint()

### Community 9 - "prayer/index.ts"
Cohesion: 0.10
Nodes (44): addDays(), formatGregorianLabel(), MONTH_NAMES, monthDisplayName(), monthKey(), toIsoDate(), weekdayName(), WEEKDAYS (+36 more)

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
Cohesion: 0.07
Nodes (27): 10. Incremental plan, 11. Risks, questions, revisit triggers, 12. Readiness checklist, 1. Context, 2. System shape, 3. Modules, ownership, boundaries, 4. Repository structure (paths that exist), 5. Critical flows (+19 more)

### Community 24 - "What You Must Do When Invoked"
Cohesion: 0.08
Nodes (24): For /graphify add and --watch, For /graphify query, For the commit hook and native AGENTS.md integration, For --update and --cluster-only, /graphify, Honesty Rules, Interpreter guard for subcommands, Part A - Structural extraction for code files (+16 more)

### Community 25 - "parse_kheu_table.ts"
Cohesion: 0.21
Nodes (14): assertCompleteMonth(), isoOn(), COLUMN_ALIASES, normalizeHeader(), parseKheuTsv(), parseTsvRow(), PRAYER_FIELDS, prayerDayFromCells() (+6 more)

### Community 26 - "compilerOptions"
Cohesion: 0.11
Nodes (17): bin/test.ts, domain/**/*.ts, node, tests/bootstrap.ts, tests/domain/**/*.ts, compilerOptions, esModuleInterop, isolatedModules (+9 more)

### Community 27 - "Waktu Sembahyang Brunei"
Cohesion: 0.17
Nodes (9): Agent instructions, Admin upload (`/admin`), Agent workflow, Districts and debug, How prayer data is loaded, Setup, Stack, Waktu Sembahyang Brunei (+1 more)

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
- **180 isolated node(s):** `/Users/ahmadghazali.hanipah/.local/bin/graphify-mcp`, `COLUMN_ALIASES`, `PRAYER_FIELDS`, `baseUrl`, `paths` (+175 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 257 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **30 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `devDependencies` connect `devDependencies` to `scripts`, `babel-eslint`, `eslint`, `eslint-plugin-prettier`, `eslint-plugin-vue`, `@japa/assert`, `@japa/runner`, `prettier`, `sass`, `sass-loader`, `tsx`, `@types/node`, `typescript`, `@vue/cli-plugin-babel`, `@vue/cli-plugin-e2e-cypress`, `@vue/cli-plugin-pwa`, `@vue/cli-plugin-router`, `@vue/cli-plugin-unit-jest`, `vue-cli-plugin-vuetify`, `@vue/cli-plugin-vuex`, `@vue/cli-service`, `@vue/eslint-config-prettier`, `vue-template-compiler`, `@vue/test-utils`, `vuetify-loader`?**
  _High betweenness centrality (0.047) - this node is a cross-community bridge._
- **Why does `dependencies` connect `dependencies` to `scripts`, `firestore.js`?**
  _High betweenness centrality (0.042) - this node is a cross-community bridge._
- **Why does `firebase` connect `firestore.js` to `dependencies`?**
  _High betweenness centrality (0.022) - this node is a cross-community bridge._
- **What connects `/Users/ahmadghazali.hanipah/.local/bin/graphify-mcp`, `COLUMN_ALIASES`, `PRAYER_FIELDS` to the rest of the system?**
  _180 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.07407407407407407 - nodes in this community are weakly interconnected._
- **Should `Home.vue` be split into smaller, more focused modules?**
  _Cohesion score 0.11956521739130435 - nodes in this community are weakly interconnected._
- **Should `scripts` be split into smaller, more focused modules?**
  _Cohesion score 0.09523809523809523 - nodes in this community are weakly interconnected._