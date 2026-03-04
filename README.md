# GymBro

A personal workout tracker built as a mobile-first PWA. Log sets and reps, track personal records, follow a weekly training plan, and watch your progress over time.

**Backend repo:** [gymbro-be](https://github.com/CrisTowi/gymbro-be)

## Features

- **Workout logging** — track sets, reps, and weight for every exercise, with a built-in rest timer and push notifications when rest ends
- **Personal records** — automatically detected and surfaced on the dashboard with progress charts
- **Weekly plan** — assign routines to days of the week; generate a plan from a natural language description using AI
- **Exercise catalog** — 80+ exercises across all muscle groups, with last-session performance and smart set recommendations
- **Progress charts** — volume and max-weight history per exercise
- **Installable PWA** — works offline-first, installable on iOS and Android, portrait-locked during workouts
- **English / Spanish** — full i18n support, language preference saved to your profile
- **Invite-only registration** — the server admin generates one-time invitation links; no open sign-ups

## Tech stack

| Layer     | Technology                                                    |
| --------- | ------------------------------------------------------------- |
| Framework | Next.js 16 (App Router)                                       |
| Language  | TypeScript / React 19                                         |
| Styling   | CSS Modules                                                   |
| i18n      | next-intl                                                     |
| Auth      | JWT (stored in localStorage)                                  |
| API       | REST — see [gymbro-be](https://github.com/CrisTowi/gymbro-be) |

## Getting started

You need the backend running first. Follow the setup steps in [gymbro-be](https://github.com/CrisTowi/gymbro-be), then come back here.

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.local.example .env.local
```

Set `NEXT_PUBLIC_API_URL` to point at your running backend (default: `http://localhost:5001`).

### 3. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 4. Register

Generate an invitation link from the backend:

```bash
# In gymbro-be/
npm run create-invitation
```

Open the printed URL to create your account.

## Available scripts

```bash
npm run dev          # Start dev server on :3000
npm run build        # Production build
npm run lint         # ESLint
npm run test         # Jest
npm run test:watch   # Jest in watch mode
npm run test:coverage
npm run validate-i18n  # Check en.json / es.json are in sync
```

## Project structure

```
src/
  app/            # Next.js App Router pages and layouts
  components/     # Reusable UI components
  context/        # AuthContext, LocaleContext
  data/           # Client-side exercise catalog
  hooks/          # useTimer, useNotification, ...
  lib/            # api.ts — single HTTP client
  types/          # Shared TypeScript types
  utils/          # Formatting helpers
messages/
  en.json         # English strings
  es.json         # Spanish strings
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT — see [LICENSE](LICENSE).
