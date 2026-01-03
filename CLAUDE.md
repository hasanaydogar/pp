# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal Portfoy is a portfolio tracker built with Next.js 16 (App Router), TypeScript, Supabase (PostgreSQL + Auth), and Tailwind CSS. It supports multi-currency portfolio management with OAuth2 authentication.

## Commands

```bash
npm run dev           # Start development server (http://localhost:3000)
npm run build         # Production build
npm run lint          # Run ESLint
npm test              # Run Jest tests
npm run test:watch    # Jest in watch mode
npm run test:coverage # Generate coverage report
npm run test:e2e      # Run Playwright E2E tests
npm run test:e2e:ui   # Playwright with UI mode
```

To run a single test file:
```bash
npx jest path/to/test.test.ts
```

To run Playwright tests for a specific file:
```bash
npx playwright test e2e/specific.spec.ts
```

## Architecture

### Directory Structure

- **`app/`** - Next.js App Router
  - **`api/`** - REST API routes (auth, portfolios, assets, transactions)
  - **`(protected)/`** - Route group requiring authentication (dashboard, portfolios, assets, analysis, profile, settings)
  - **`login/`** - Public login page
- **`components/`** - React components (auth, ui, layout, portfolios, assets, transactions)
- **`lib/`** - Core business logic
  - **`api/`** - Server/client API utilities, analytics, cost-basis (FIFO), exchange rates
  - **`auth/`** - Authentication (actions.ts for signIn/signOut/getCurrentUser, token management)
  - **`supabase/`** - Supabase client initialization (server.ts, client.ts)
  - **`store/`** - Zustand stores (auth-store.ts)
  - **`context/`** - React Context (portfolio-context.tsx, currency-context.tsx)
  - **`hooks/`** - React Query hooks (use-portfolios, use-assets, use-transactions, etc.)
  - **`types/`** - TypeScript types with Zod schemas (portfolio.ts, auth.ts, currency.ts)
  - **`utils/`** - Utility functions (currency formatting, conversions)
- **`supabase/migrations/`** - Database migration files
- **`__tests__/`** - Jest tests (database, integration, e2e, types)
- **`e2e/`** - Playwright E2E tests

### Key Patterns

**Authentication Flow:**
- OAuth2 via Supabase Auth (Google, Apple, GitHub)
- Tokens stored in httpOnly cookies
- Server-side auth check via `getCurrentUser()` from `lib/auth/actions.ts`
- Protected routes enforced in `(protected)` layout

**Data Layer:**
- Server Components fetch data via `lib/api/server.ts`
- Client Components use React Query hooks from `lib/hooks/`
- All data schemas defined with Zod in `lib/types/portfolio.ts`

**State Management:**
- Zustand for global client state (auth)
- React Query for server state (portfolios, assets, transactions)
- React Context for portfolio selection and currency preference

### API Route Pattern

```typescript
// app/api/[resource]/[id]/route.ts
import { getCurrentUser } from '@/lib/auth/actions';

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return new Response('Unauthorized', { status: 401 });
  const params = await props.params;
  // Fetch from Supabase, validate with Zod, return JSON
}
```

### Server Component Pattern

```typescript
import { getCurrentUser } from '@/lib/auth/actions';
import { redirect } from 'next/navigation';

export default async function ProtectedPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  // Fetch data and render
}
```

## Environment Variables

Required in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=<supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<supabase-anon-key>
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## SpecPulse Integration

This project uses SpecPulse for feature development. Commands available in `.cursor/commands/`:
- `/sp-feature <name>` - Initialize a new feature
- `/sp-spec standard` - Write specification
- `/sp-plan` - Create implementation plan
- `/sp-task` - Break into tasks
