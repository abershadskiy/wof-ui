# World of Food UI

A React front end for [World of Food](https://github.com/abershadskiy/world-of-food). You log the restaurants you've
visited, and they show up as pins on an interactive 3D globe. The app builds a taste profile from your visits and
recommends new places to try.

> **Note:** This UI is fully vibe-coded. An AI agent wrote all of it, guided by prompts and feedback. Nobody has
> reviewed it line by line. The backend is a separate, hand-written project.

## Features

- **Globe.** Your visits appear as pins on a night-side Earth. Drag to spin and scroll to zoom. Past a certain zoom
  level the globe switches to a street map, so you can see exactly where each place is.
- **Discover.** Enter a location to get recommendations, then react to each one with like, meh or nope. The globe spins
  while it searches, then flies to the results.
- **Log a visit.** Search for a restaurant, or pick one you liked in Discover. Add a date, a rating and notes.
- **Taste profile.** After 5 visits, you see your top cuisines and typical price range, and recommendations start to
  follow them.
- **Sign-in.** Use email and password, or Google.

## Prerequisites

- Node.js 20.19 or later, or 22.12 or later.
- The [World of Food backend](https://github.com/abershadskiy/world-of-food) running locally on port 8000.
- A [CARTO basemaps](https://carto.com/basemaps) API key for the street-map tiles.
- Optional: a Google OAuth client ID, for Google sign-in.

## Setup

1. Install the dependencies:

   ```sh
   npm install
   ```

2. Copy `.env.example` to `.env.local` and fill in the values:

   | Key | Value |
   |---|---|
   | `VITE_API_URL` | The backend URL. The default is `http://localhost:8000`. |
   | `VITE_GOOGLE_CLIENT_ID` | The same value as the backend's `GOOGLE_CLIENT_ID`. Leave it empty to turn off Google sign-in. |
   | `VITE_CARTO_KEY` | Your CARTO basemaps key. |

   Vite builds every `VITE_` variable into the page, so treat these values as public. Restrict the CARTO key to your
   domains in the CARTO dashboard.

3. For Google sign-in, add `http://localhost:5173` and `http://localhost` to the OAuth client's **Authorized JavaScript
   origins** in Google Cloud Console.

## Run

1. Start the backend. In the backend repo, run:

   ```sh
   uvicorn app.main:app --reload
   ```

2. Start this app:

   ```sh
   npm run dev
   ```

3. Open <http://localhost:5173>.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Starts the dev server on port 5173. |
| `npm run build` | Type-checks the app and builds it into `dist/`. |
| `npm test` | Runs the unit tests with Vitest. |
| `npm run lint` | Lints the code with oxlint. |

## Regenerate the API types

The typed API client in `src/api/schema.d.ts` is generated from the backend's OpenAPI schema. When the backend changes,
start it and run:

```sh
npx -p openapi-typescript@7 -p typescript@5 openapi-typescript http://localhost:8000/openapi.json -o src/api/schema.d.ts
```

The generator needs TypeScript 5, but this project uses TypeScript 6. That's why the command installs its own
TypeScript instead of using the project's.

## Built with

React, TypeScript, Vite, TanStack Query, React Router, Tailwind CSS, and
[react-globe.gl](https://github.com/vasturiano/react-globe.gl). The globe and star textures come from
[three-globe](https://github.com/vasturiano/three-globe) (MIT). Map tiles: © OpenStreetMap contributors © CARTO.
