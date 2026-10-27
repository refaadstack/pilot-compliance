# Pilot Compliance Dashboard

Dashboard for a pilot: **document expiry tracker**, **monthly duty calendar** and **flight time vs. regulatory limits**.
Monorepo with a NestJS API (`apps/api`) and a Nuxt 3 web app (`apps/web`). Data is mock JSON (no database yet).
**All business logic is computed in the API**; the web app only renders.

```
apps/
  api/   NestJS · class-validator · Swagger · Jest
         src/{common,config,shared,data,documents,schedules,flight-hours}
  web/   Nuxt 3 (SPA) · Pinia · Tailwind · Chart.js (vue-chartjs)
```

## Run it

Requirements: Node 20+ and npm 10+.

```bash
npm install                                   # installs both apps (npm workspaces)
cp apps/api/.env.example apps/api/.env        # optional, defaults are the same
cp apps/web/.env.example apps/web/.env

npm run dev                                   # api (3001) + web (3000) together
# or separately:
npm run dev -w apps/api                       # http://localhost:3001/api   (Swagger: /api/docs)
npm run dev -w apps/web                       # http://localhost:3000

npm test                                      # backend unit tests (Jest)
npm run typecheck                             # tsc (api) + vue-tsc (web)
npm run build                                 # production builds
```

| Variable | App | Default | Meaning |
|---|---|---|---|
| `PORT` | api | `3001` | API port |
| `APP_TODAY` | api | `2026-05-31` | The "today" for every calculation. The system clock is never used |
| `CORS_ORIGINS` | api | `http://localhost:3000` | Comma-separated allowed origins |
| `NUXT_PUBLIC_API_BASE` | web | `http://localhost:3001/api` | API base URL |

## Endpoints

Prefix `/api`, documented with Swagger at `/api/docs`. Every endpoint also accepts `?today=YYYY-MM-DD` to override `APP_TODAY` (for testing).
Invalid query params return `400` with a readable message, e.g. `{"message":["range must be one of: 1w, 1m, 3m, 6m, 1y"],"error":"Bad Request","statusCode":400}`. Unknown query params are rejected too.

| Endpoint | Returns |
|---|---|
| `GET /api/documents` | Documents with `daysRemaining` and `status` (`expired \| soon \| safe`), sorted by urgency, plus `summary` counts |
| `GET /api/schedules?month=YYYY-MM` | Duties of that month (default: month of today) plus `legend` |
| `GET /api/flight-hours/summary` | Pilot, total hours, `limits`, current usage (today / 7 / 30 / 365 days) with `%` and status |
| `GET /api/flight-hours/chart?range=1w\|1m\|3m\|6m\|1y` | `series` (15 points, today centred) + `limit` + `max` (default range `1w`) |

Response types: [`apps/api/src/shared/api-types.ts`](apps/api/src/shared/api-types.ts). It is type-only and is the single definition used by both apps (the web app imports it through the `@shared` alias, re-exported from `apps/web/types`).

### Sample responses (today = 2026-05-31)

`GET /api/documents` (trimmed)
```json
{ "today": "2026-05-31", "thresholds": { "warningDays": 30 }, "summary": { "expired": 2, "soon": 1, "safe": 2 },
  "documents": [
    { "id": "doc_security", "label": "Security Clearance Exp. Date",  "expiryDate": "2026-05-01", "daysRemaining": -30, "status": "expired" },
    { "id": "doc_license",  "label": "Indonesian License Exp. Date",  "expiryDate": "2026-05-29", "daysRemaining": -2,  "status": "expired" },
    { "id": "doc_medical",  "label": "Indonesian Medical Exp. Date",  "expiryDate": "2026-06-11", "daysRemaining": 11,  "status": "soon" },
    { "id": "doc_recurrent","label": "Next Recurrent Date",           "expiryDate": "2026-10-14", "daysRemaining": 136, "status": "safe" },
    { "id": "doc_ppc",      "label": "PPC Exp. Date",                 "expiryDate": "2026-12-25", "daysRemaining": 208, "status": "safe" } ] }
```

`GET /api/flight-hours/summary`
```json
{ "today": "2026-05-31", "pilot": { "name": "John Doe", "totalFlightHours": 1444.5 },
  "limits": { "daily": 8, "weekly": 40, "monthly": 100, "annual": 1050 },
  "usage": {
    "today":       { "hours": 4.3,    "limit": 8,    "windowDays": 1,   "percentage": 53.8, "status": "normal"  },
    "last7Days":   { "hours": 15.4,   "limit": 40,   "windowDays": 7,   "percentage": 38.5, "status": "normal"  },
    "last30Days":  { "hours": 99.3,   "limit": 100,  "windowDays": 30,  "percentage": 99.3, "status": "warning" },
    "last365Days": { "hours": 1025.3, "limit": 1050, "windowDays": 365, "percentage": 97.6, "status": "warning" } } }
```

`GET /api/flight-hours/chart?range=1w` (today = 2026-05-31; 15 points, today at index 7)
```json
{ "today": "2026-05-31", "range": "1w", "limit": 40, "max": 45, "windowDays": 7, "halfSpanDays": 7,
  "series": [ { "date": "2026-05-24", "hours": 30.9, "partial": false },
              { "date": "2026-05-31", "hours": 15.4, "partial": false },
              { "date": "2026-06-07", "hours": 0,    "partial": false } ] }
```

`GET /api/schedules?month=2026-06`: the entry for id 97041 (`ScheduleItem`)
```json
{ "id": "97041", "dutyDate": "2026-06-04", "status": 1, "dutyType": "TRX", "baseName": "CJN",
  "color": "#F59E0B", "rawColor": "#FBA577", "colorMismatch": true, "countSchedules": 1, "countLogbooks": 0, "isComplete": false }
```

## Assumptions

1. **"Today"** comes from `APP_TODAY` (default `2026-05-31`), optionally overridden by `?today=`. The `today` fields inside the mock files (`2026-05-15`, `2026-05-31`) are ignored.
2. **Document status**: `daysRemaining = expiryDate − today` in whole calendar days (UTC-day arithmetic, no time zones). `≤ 0` expired, `1..30` soon, `> 30` safe. So *0 days = expired* and *exactly 30 days = still "soon"*.
3. **Document ordering**: expired, soon, safe; inside a group, ascending `daysRemaining` (the most urgent first). For expired documents that means the longest overdue first: Security Clearance (−30) before Indonesian License (−2). The brief does not say which direction "most urgent" means for expired items; flip the comparator in `sortDocuments` if you prefer the opposite.
4. **Flight-hour series**: the value at date `D` is the rolling sum of the `windowDays` days **ending on `D`** (inclusive) — 1w = 7 d, 1m = 30 d, 3m = 90 d, 6m = 180 d, 1y = 365 d. The X axis is fixed at **`today ± 7` days, one point per day → 15 points with today exactly in the middle** (`halfSpanDays: 7`). The point for today equals the gauge value in `/summary`, so a point is directly comparable with the plotted limit (30-day total vs. the 100 h monthly limit).
   *Why the window ends on D and not starts on D:* an "ends on D" window answers "how close am I to the limit if today were D", which is the operational question the chart exists to answer; it also makes the limit line and the monthly/annual gauges the same unit.
   *Future dates (after `today`):* they still get a value — the same trailing `windowDays` window ending on that future date. No data exists there yet, so each future point simply drops the hours that fall out of the window's back end and adds 0. This keeps the axis uniform (no gaps, no nulls, no layout special-casing) and reads as "the limit usage you would carry into that day if you flew nothing more". For `1w` on 31 May the line falls 15.4 h → 12.1 h → … → 0 h by 7 Jun.
   *Start of the dataset:* when a window reaches back before the first record (2024-12-27), it is summed over the days that exist and the point is flagged `partial: true` — hollow marker, footnote and tooltip note in the UI. It is never extrapolated as if the missing days were flown, and never skipped.
5. **Usage windows** in `/summary` are the last 1, 7, 30 and 365 days **ending today inclusive**. "Monthly" therefore means *rolling 30 days*, not a calendar month. Status uses the unrounded ratio: `< 80 %` normal, `80 % ≤ x < 100 %` warning, `≥ 100 %` exceeded.
6. Days without data count as 0 h. Sums are done in integer tenths of an hour to avoid floating-point drift (source resolution is 0.1 h).
7. `totalFlightHours` is the file's value minus any entries dated after `today` (only matters with a `?today=` override).
8. **Schedules**: `isComplete = count_logbooks === count_schedules`, regardless of `status`. The legend is the source of truth for colour. A `duty_type` absent from the legend keeps its `base_color` instead of failing.
9. **Web app**: runs as an SPA (`ssr: false`) because all data comes from the API and Chart.js needs the DOM. The UI is **light-theme only** — the Susi Air brand palette is fixed (`#0E2138` navy, `#F5F6F8` background, `#FFFFFF` cards, Plus Jakarta Sans), so there is no dark palette and no `prefers-color-scheme` branch. The UI language is English (weekday labels Mon–Sun, Monday first). Date arithmetic never uses the browser clock: the "today" ring and the "Today" button use the `today` returned by the API.
10. Rows with an invalid date (schedules, documents, flight hours) are skipped with a server warning instead of crashing a request.

## Data inconsistencies found

**`mock-schedules.json`**
- `status: 2` (completed) but `count_logbooks < count_schedules`: ids **97005** (2/4) and **97010** (1/2). Shown with a number badge, not a tick.
- `base_color` does not match the legend: id **97041** is `TRX` (legend `#F59E0B`) but painted `#FBA577` (the `TRD` colour). Normalised to the legend colour and flagged `colorMismatch: true`. It is the only such row.
- `status: 1` (pending) while `count_logbooks === count_schedules`: id **97027** (2026-05-15, 6/6). It shows a tick because completeness is derived from the counts.
- The file was exported with `today = 2026-05-15`, so **9 duties dated 19–29 May** are still `status: 1` with 0 logbooks even though they are in the past relative to `APP_TODAY`. They display as pending with their planned count.
- `fieldGuide` says `base_name` of non-DTY duties equals the duty code, but the data holds airport codes (`TRX` → `CJN`, `RLV` → `HLP`, `MED`/`REC`/`ADM` → `CJN`, `FER` → `HLP`). The UI shows `base_name` as specified plus the duty code (taken from `duty_type`).
- Legend entries with no duty in the data: `SCK`, `TRD`, `ULV`. No duplicate dates, no unknown duty types.

**`mock-flight-hours.json`**
- Data starts on **2024-12-27**. In the `1y` chart (365-day window) the points before ~26 Dec 2025 have windows reaching before the first record, so they are **understated**. The API marks them `partial: true`; the chart draws them hollow with a footnote and tooltip note.
- `pilot.totalFlightHours` (1444.5) equals the sum of all daily entries (521 consecutive days, no gaps, no duplicates).
- Against a **rolling** 30-day window the pilot exceeded the 100 h monthly limit on 77 of the last 360 days (peak 104.4 h on 2026-05-29). On 2026-05-31 the value is 99.3 h (warning). If "monthly" was meant to be a calendar month, the logic in `flight-hours.logic.ts` is the only place to change.

**Documents**: `mock-documents.json` and the brief agree (License −2, Security −30, Medical 11 days). No inconsistencies besides the differing `today` fields.

## Architecture notes

- Each API module (`documents`, `schedules`, `flight-hours`) has a controller, service, DTOs and a repository abstraction: `interface XRepository` + `JsonXRepository`, wired with an injection token in the module (`{ provide: X_REPOSITORY, useClass: JsonXRepository }`). Swapping to a database means writing one class and changing one line.
- Business rules are pure functions in `*.logic.ts` (unit-tested); services only orchestrate.
- Tests (`npm test`, 47 cases): status boundaries at exactly 0 and 30 days, sort order, rolling-window inclusivity and zero-fill, chart windowing (15 daily points, today centred, future dates, `partial`), usage-status boundaries at 80 % / 100 %, colour normalisation (including 97041), completeness (97005 / 97010), and the services run against the real mock files for `today = 2026-05-31`.
- Pinia setup stores (`documents`, `schedules`, `flightHours`) each expose `data`, `loading`, `error` and fetch actions. `schedules` and the chart ignore stale responses when the user navigates or switches range quickly.
- Accessibility: status always has an icon and text next to colour; calendar is an ARIA grid with a single tab stop and arrow-key navigation; range tabs are a real `tablist`; gauges are `progressbar`s with readable text; the chart has an `sr-only` data table; focus rings and reduced-motion are respected.
- Font **Plus Jakarta Sans** loads from Google Fonts with a system-sans fallback, so the app still works offline.

## Out of scope (by design)
No auth, no database, no additional pages.
