# AI Job Matcher

A personal job-search prototype for reviewing and tracking Product Manager and
Product Owner opportunities, focused on English-speaking Junior, Associate and
relevant non-senior roles in Dublin and elsewhere in Europe.

## Current prototype

React + Vite with plain JavaScript and CSS, using **10 fictional demo vacancies**.
Search titles/companies, filter location and seniority, and navigate Active,
Saved, Applied and Rejected. Saved also has an application-status filter.
No real collection, CV processing, AI matching, external APIs, authentication or
database is implemented. The former Streamlit application has been replaced.

### Tracking rules and persistence

- Saved is independent: save/unsave both unapplied and applied jobs.
- Applied is irreversible in the app; applied jobs cannot be rejected.
- Rejection clears Saved. Rejected jobs appear only under Rejected and offer
  only Restore, which returns them to Active without previous labels.
- Active means all non-rejected vacancies. Saved and Applied overlap; counters
  exclude rejected jobs and remain independent of filters.
- Statuses and application timestamps persist in **this browser's localStorage**
  across reloads, under `ai-job-matcher:statuses:v1`. No CV data or secrets are
  stored. Clearing browser site data resets the demo. Data does not sync between
  devices or browsers; different local preview ports have separate storage.
- If storage is blocked or full, the app warns and keeps changes in memory.

## Run locally

Requires Node.js 22.12+ (Node 22 LTS recommended) and npm. From the repository root:

```bash
npm ci
npm run dev
```

Open **http://localhost:5173/ai-job-matcher/**. Vite prints the actual port if
5173 is busy. Stop with Ctrl+C. In Codex Cloud, open that URL inside the cloud
Desktop browser; a localhost URL on your own machine points to your own machine.
No credentials or paid services are needed.

### Production preview

```bash
npm test
npm run build
npm run preview -- --port 4173 --strictPort
```

Open **http://localhost:4173/ai-job-matcher/**. The static production output is
`dist/`; Vite's base path is `/ai-job-matcher/`, including all built assets.

## Validation

`npm test` uses Node's built-in test runner: all allowed/forbidden transitions,
filters, counters, storage persistence, normalization and unavailable storage.

Optional rendered browser checks, with the production preview running:

```bash
python -m pip install playwright
python -m playwright install chromium
python tests/check_browser.py
```

Python/Playwright is only a development test tool; it is not needed to build,
run or deploy the app. The script uses system Chromium if available, otherwise
Playwright's installed browser. It checks 375px, 390px and 1440px layouts,
44px+ tap targets, overflow, UI actions, filters, reload persistence, cross-tab
updates and blocked storage. Screenshots go to `/tmp/ai-job-matcher-react`.
Override the preview URL with the `APP_URL` environment variable if needed.

## GitHub Pages

Deployment is prepared, **not published**. After reviewing and pushing the code:

1. In the repository, choose **Settings → Pages → Build and deployment → Source:
   GitHub Actions**.
2. Merge to `main` or run **Actions → Deploy GitHub Pages → Run workflow**.
3. The workflow installs from the lockfile, runs tests, builds and deploys `dist/`.

Expected project URL: `https://mary-kir.github.io/ai-job-matcher/`.
The repository name and Vite base must stay aligned. No custom domain, backend,
secrets or SPA routing fallback is required. View navigation uses React state.
The workflow has not been run in GitHub during this task.

## Structure and future integration

- `src/App.jsx`: views, filters, action feedback and React state.
- `src/components/JobCard.jsx`: vacancy presentation and allowed buttons.
- `src/styles.css`: responsive styling, colours, typography and layout.
- `src/data/jobs.json`: fictional fixtures with canonical vacancy IDs and
  `source_listings` (`source`, `external_id`, nullable `url`).
- `src/tracking.js`: pure business rules, filtering and dashboard calculations.
- `src/services/statusStore.js`: versioned, whitelisted storage adapter; a future
  backend can replace this boundary without rewriting the tracking rules.
- `tests/`: Node logic/storage tests and optional Python browser checks.
- `.github/workflows/deploy.yml`: GitHub Pages build and deployment.

Application timestamps use UTC ISO strings. Duplicate detection is not
implemented; source references prepare for multiple listings per vacancy.
Future AI matching, permitted Playwright collection and shared persistence
belong in a separate backend. Never place API credentials or CV content in the
static bundle, Vite environment variables or localStorage.

See the [product brief](docs/product-brief.md) and
[decision log](docs/decision-log.md) for the broader product plan and assumptions.
