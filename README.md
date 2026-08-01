# Performance RAG Dashboard

Client-side React SPA for semiconductor test-engineering performance RAG evaluation. All CSV parsing and scoring run in the browser.

**Live:** [https://daemon-demons.github.io/performance-rag/](https://daemon-demons.github.io/performance-rag/)

## Quick start

```bash
npm install
npm run dev      # local server (restores Vite entry from index.vite.html)
npm test         # Vitest
npm run build    # production → dist/
```

## Deploy

Push to `main` runs GitHub Actions: test → build → publish to repo root and `docs/` (`base: './'`). Do not hand-edit generated `docs/` or root `assets/`. Keep `index.vite.html` as the Vite source entry.

## Usage

Load the sample roster or drop a CSV → **Dashboard**, **Org**, **Roster**, **Analytics**. Schema lives in `src/utils/csvSchema.js`; regenerate samples with `npm run generate:sample`.

## Privacy

Roster files stay in-browser via `FileReader` — no backend uploads.
