# Tessolve Performance RAG Management Dashboard

Client-side React SPA for Semiconductor Test Engineering performance RAG evaluation. All CSV parsing and scoring runs in the browser — no backend.

## Stack

- Vite + React 19
- Tailwind CSS v4 (`@tailwindcss/vite`)
- Lucide React, Recharts, react-dropzone, PapaParse
- React Router (`HashRouter` for GitHub Pages)

## Quick start

```bash
npm install
npm run dev
```

Open the local URL shown in the terminal (typically `http://localhost:5173/performance-rag/`).

## Build & GitHub Pages

`vite.config.js` sets `base: '/performance-rag/'` to match this repository name.

```bash
npm run build
npm run preview
```

### Deploy (required for a working site)

GitHub Pages must serve the **built** `dist/` output — not the Vite source on `main`.

**Option A — one-shot publish to `gh-pages` branch**

```bash
npm run deploy
```

Then in the repo: **Settings → Pages → Build and deployment → Source: Deploy from a branch → Branch: `gh-pages` / `/ (root)`**.

**Option B — GitHub Actions** (workflow in `.github/workflows/deploy-pages.yml`)

1. **Settings → Pages → Source: GitHub Actions**
2. Push to `main` (or run the workflow manually). Site URL: `https://daemon-demons.github.io/performance-rag/`

Convenience script (Option A):

```bash
npm run deploy
```

(requires `gh-pages` as a one-time `npx` download, or install it as a devDependency).

## Usage

1. On the welcome screen, click **Run demo with sample roster** (loads `sample/sample_team_roster.csv`), or drag-and-drop your own team CSV.
2. Invalid schemas show a clear error and a **Generate & Download Sample CSV** button.
3. After load: **Team Roster**, **Org Chart**, and **Analytics** tabs with Client / Role / RAG filters.
4. Toggle **Departed** on roster rows; enable **Attrition Simulation** to cascade mentee RAG downgrades.

Regenerate randomized demo data:

```bash
npm run generate:sample
```

This writes `sample/sample_team_roster.csv` and copies it to `public/sample/` for static serving.

## RAG engine

See `src/utils/ragEvaluator.js`:

- `Overall_Score = Max_V93k×0.35 + Lab_Score×0.35 + Process_Score×0.30`
- Role baselines and responsibility flags determine GREEN / AMBER / RED

## Privacy

No API calls are made for data processing. Files are read with the HTML5 `FileReader` API into memory only.
