# Agent instructions

This is a **new** TypeScript project for Brunei prayer times. It clones behaviour from the old Vue 2 app; it does not share that app's Firebase, Netlify, or npm lockfile.

- Apply **Ponytail full mode**. See `.cursor/rules/ponytail.mdc` and `documents/upgrade_spec.md`.
- Package manager is **pnpm**. Never add `package-lock.json`. Commands: `pnpm test`, `pnpm check`, `pnpm dev`.
- For codebase questions, query Graphify first (`graphify query`, `graphify path`, `graphify explain`). The graph lives in `graphify-out/`.
- `src/` is leftover Vue 2 reference only. Do not wire new code to it, its Firestore, or its Netlify site.
- Product docs: `README.md`. Upgrade spec: `documents/upgrade_spec.md`. Old app snapshot: `documents/project_architecture.md`.
