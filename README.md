# Performance RAG Dashboard

Client-side React SPA for performance RAG evaluation. All CSV parsing and scoring run in the browser.

**Live:** [https://daemon-demons.github.io/performance-rag/](https://daemon-demons.github.io/performance-rag/)

## Quick start

```bash
npm install
npm run dev      # http://localhost:5173/performance-rag/
npm test
npm run lint
npm run build    # → dist/
```

## Deploy

- **`main`** — source only
- **`gh-pages`** — production `dist/` (CI only)

Push to `main` runs GitHub Actions: `test` → `lint` → `build` → verify → publish `dist` to `gh-pages`. Broken builds never deploy.

**Repo setting (once):** Settings → Pages → Source: **Deploy from a branch** → **`gh-pages`** / **`/(root)`**.

## Usage

Load the sample roster or drop a CSV → **Dashboard**, **Org**, **Roster**, **Analytics**. Schema: `src/utils/csvSchema.js`. Regenerate samples: `npm run generate:sample`.

## Privacy

Roster files stay in-browser via `FileReader` — no backend uploads.
