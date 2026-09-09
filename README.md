# Waktu Sembahyang Brunei

A progressive web app that shows daily Islamic prayer times for Brunei, using the official timetable from [Kementerian Hal Ehwal Ugama (KHEU)](https://www.mora.gov.bn/lists/waktusolat/waktusolat.aspx).

Open the home screen and you get today, tomorrow, and the day after: Gregorian and Hijri dates, a countdown to the next prayer, and Imsak through Isya. Times shift by district (Brunei-Muara/Temburong, Tutong, Belait). When a prayer begins, the app can send a browser notification.

This repo is now the **new TypeScript project** (pnpm). It clones prayer behaviour from the old Vue 2 app; it does not share that app's Firebase or Netlify site. Leftover Vue 2 files under `src/` are reference only.

## What you can do

Today: Nuxt 4 app with a file-backed `/api/prayers`. Domain tests stay on Japa (`pnpm test`). Full clock UI, ingest, and deploy come in later phases.

The product target is unchanged: today + two days of KHEU times, district offsets, countdown, notifications, automatic monthly ingest, admin paste as fallback.

## Stack (target)

| Layer | Choice |
| --- | --- |
| App | Nuxt 4 + TypeScript |
| Domain | `domain/` (no Vue, no Firebase) |
| Tests | Japa |
| Data | JSON file locally; Netlify Blobs in production |
| Hosting | New Netlify site + scheduled ingest |
| Packages | pnpm |

Architecture (as-is): [`documents/project_architecture.md`](documents/project_architecture.md). Upgrade plan: [`documents/upgrade_spec.md`](documents/upgrade_spec.md).

## Setup

```bash
pnpm install
pnpm test
pnpm check
```

Requires Node 20+ and pnpm 10 (`packageManager` is pinned).

| Command | What it does |
| --- | --- |
| `pnpm dev` | Nuxt 4 development server |
| `pnpm test` | Japa domain + functional fixture tests |
| `pnpm check` | `nuxt typecheck` + domain `tsc` |
| `pnpm build` | Production build |

Old Vue 2 behaviour is documented in [`documents/project_architecture.md`](documents/project_architecture.md), not used at runtime.

## Agent workflow

This repo uses **Ponytail full mode** (smallest change that works; no extra packages or rewrites by default) and **Graphify** (query the knowledge graph before hunting through files).

- Architecture: [`documents/project_architecture.md`](documents/project_architecture.md)
- Agent entry: [`AGENTS.md`](AGENTS.md)
- Graph: `graphify-out/GRAPH_REPORT.md` and `graphify-out/graph.html`

```bash
export PATH="$HOME/.local/bin:$PATH"
graphify query "how current prayer is chosen"
graphify path "parseKheuTsv" "assertCompleteMonth"
graphify update .
```
