# Contributing to GymBro (frontend)

Thanks for your interest! This is the Next.js frontend. The backend lives in [gymbro-be](https://github.com/CrisTowi/gymbro-be) — you'll need both running locally.

## Prerequisites

- Node.js 20+
- A running instance of [gymbro-be](https://github.com/CrisTowi/gymbro-be)

## Local setup

```bash
# 1. Clone
git clone https://github.com/CrisTowi/gymbro.git
cd gymbro

# 2. Install
npm install

# 3. Configure
cp .env.local.example .env.local
# Set NEXT_PUBLIC_API_URL=http://localhost:5001

# 4. Start
npm run dev
```

## Before submitting a PR

```bash
npm run lint          # must pass with no errors
npm run test          # all tests must pass
npm run validate-i18n # en.json and es.json must stay in sync
npm run build         # must compile cleanly
```

## Conventions

- **CSS**: scoped CSS Modules per component — no global utility classes
- **i18n**: any new user-visible string goes in both `messages/en.json` and `messages/es.json` under the appropriate namespace
- **State**: local `useState` or the two existing Contexts (`AuthContext`, `LocaleContext`) — no new global state libraries
- **API calls**: all HTTP requests go through `src/lib/api.ts`; never call `fetch` directly in a component
- **No new dependencies** without a clear reason — keep the bundle lean

## Reporting bugs

Open an issue with steps to reproduce, expected vs actual behaviour, and your browser/OS.
