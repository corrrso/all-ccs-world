# All CCS World

An interactive map of carbon capture and storage (CCS) facilities across the **whole world** — operating plants, plants that are operating but underperforming, and projects in construction or planning. A global companion to [All UK CCS](https://github.com/corrrso/all-ccs-uk), covering every major region rather than a single country.

## What's in the app

- **Interactive map** (MapLibre GL, dark basemap) centred on the world, with point markers clustered so dense regions (Gulf Coast, North Sea) stay readable.
- **Colour-coded by status**:
  - 🟢 **Active** — operating and roughly meeting expectations.
  - 🟠 **Active, underperforming** — operating but publicly documented as capturing/injecting well below its own nameplate/design target.
  - 🔵 **In construction / planning** — everything from under construction to advanced/early development.
- **Country filter** and **status filter**, plus a live legend with per-status counts.
- **Click any marker (or zoom into a cluster)** for a card with operator, location, capacity, a short description, and the finer lifecycle stage (construction vs planning).

## The data

The facility points live in [`app/public/data/projects.geojson`](app/public/data/projects.geojson). Each point carries:

- `name`, `country`, `status`, `stage`, `type`, `operator`, `location`, `capacity`, `description`, plus `longitude`/`latitude` in the geometry.

`status` is one of three buckets:

| `status` | meaning |
|---|---|
| `operational` | Active, performing roughly as intended |
| `underperforming` | Active, but well below its own target |
| `development` | In construction or planning |

`stage` is a finer lifecycle label (`operational`, `construction`, `planning`, `advanced development`, `early development`) shown inside the card for development projects.

### The "underperforming" bucket

This is a deliberately small, high-confidence list. The canonical, widely documented cases flagged as underperforming against their own design targets are **Gorgon** (Chevron, Australia), **Boundary Dam Unit 3** (SaskPower, Canada) and **Petra Nova** (NRG/JX Nippon, USA). Other plants may run below their theoretical capacity at times (for example the Alberta Carbon Trunk Line's large design capacity vs much lower actual throughput) without being flagged here — see the individual card descriptions.

### Caveats

- This is a **reference map, not a regulatory record**. Coordinates are approximate (plant/site or nearest-city level).
- Capacities are indicative and rounded; many are nameplate targets rather than measured throughput.
- Statuses reflect publicly announced funding, final investment decisions and press reporting as of **late 2024 / 2025** and can change quickly.
- The scope is commercial-scale and notable projects (operating + under construction + significant planned), not every early concept or feasibility study in the databases.

Authoritative sources to cross-check: the [Global CCS Institute](https://www.globalccsinstitute.com/) *Global Status of CCS* report and [IEA CCUS Projects Database](https://www.iea.org/data-and-statistics/data-tools/ccus-projects-database).

## Running locally

```bash
cd app
npm install
npm run dev
```

Opens at `http://localhost:3000`.

## Deploying

The app is a Next.js static export deployed to GitHub Pages at `/all-ccs-world` (see [`next.config.ts`](app/next.config.ts) and [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)). Pushing to `main` publishes automatically.

## Tech

Next.js 16 (static export), React 19, `react-map-gl` (MapLibre GL 5), Tailwind CSS 4. Basemap by [OpenStreetMap](https://www.openstreetmap.org/copyright) via [CARTO](https://carto.com/attributions).
