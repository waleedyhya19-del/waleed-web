# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Admin dashboard for **Telephony Mafqud** (تليفوني) — a lost/stolen phone reporting platform. This is the `web/` directory of a monorepo. The backend lives in `api/` (NestJS). This frontend consumes the NestJS REST API directly via a fetch-based client; there is no BFF or separate backend.

## Commands

```bash
pnpm dev              # Start dev server
pnpm build            # Production build
pnpm lint             # ESLint (flat config)
pnpm test:e2e         # Playwright E2E tests
pnpm test:e2e:headed  # Playwright with browser visible
```

## Architecture

### Routing

All routes live under `app/[locale]/` (i18n segment). Route groups:
- `(auth)/` — Public: `/login`, `/forgot-password`
- `(dashboard)/` — Protected: `/` (dashboard home), `/reports/...`, `/users/...`, `/moderators/...`, `/settings`

Pages are thin Server Components. Feature logic lives in `components/<feature>/*-page-content.tsx` as `'use client'` components, dynamically imported via `next/dynamic` so each page gets its own loading skeleton.

### Auth & Session

JWT-based (not Supabase session cookies). Tokens stored in **localStorage** via `lib/auth/token.ts`.

1. Login → `authApi.login()` → stores `accessToken` + `refreshToken`
2. `DashboardShell` (`components/layout/dashboard-shell.tsx`) calls `authApi.getSession()` on mount
3. User stored in **Zustand** (`stores/session-store.ts`) with 60-second TTL cache (`hasFreshSession()`)
4. `ApiClient` (`lib/api/client.ts`) auto-refreshes on 401 (deduplicates concurrent refreshes via shared promise)
5. 30-min inactivity timer in `hooks/use-session-timeout.ts` triggers logout

Role-based route access: `lib/constants/roles.ts` → `canAccessRoute(role, pathname)` checked in DashboardShell.

> `lib/supabase/middleware.ts` exists but is **not used**. The deleted `middleware.ts` (visible in git status) was replaced by the `next-intl` plugin in `next.config.ts` handling i18n routing automatically.

### API Client

`lib/api/client.ts` — fetch-based `ApiClient`:
- Base URL: `NEXT_PUBLIC_API_URL` env var (falls back to `/api/v1`)
- Adds `Authorization: Bearer` + `Accept-Language` (from `lib/i18n/runtime-locale.ts`) to every request
- Non-2xx responses → `createAppError()` in `lib/api/error.ts`
- `AppError` has `statusCode`, `category` (VALIDATION, AUTHENTICATION, NOT_FOUND, etc.), `retriable`, `details[]`
- Error messages localized via `lib/api/error-copy.ts` (EN + AR dictionaries)

API modules: `lib/api/auth.ts`, `lib/api/users.ts`, `lib/api/reports.ts`.

### Data Fetching & Caching

`hooks/use-async-resource.ts` — primary data hook:
- Returns `{ data, error, errorMessage, isLoading, refresh }`
- Deduplicates concurrent requests and caches results in `stores/resource-cache-store.ts` (in-memory Zustand)
- Cache keys defined in `lib/cache/keys.ts`
- Invalidate by prefix: `invalidateResourceCacheByPrefix('reports:')` or exact key: `invalidateResourceCache('reports:list')`

Pagination is **cursor-based** (not offset). Use `fetchAllPages()` from `lib/api/pagination.ts` to load all pages.

### i18n

- `next-intl` v4 with `[locale]` route segment
- Locales: `ar` (default, RTL) + `en` — defined in `i18n/routing.ts`
- Messages: `messages/ar.json`, `messages/en.json`
- Components: `useTranslations()` hook from next-intl
- RTL/LTR applied via `<LocaleDocumentSync>` (sets `document.documentElement.lang` + `dir`)
- Fonts: `Space Grotesk` (EN) / `Cairo` (AR)

### State Management

Two Zustand stores:
- `stores/session-store.ts` — user session, persisted to localStorage with 60s TTL
- `stores/resource-cache-store.ts` — in-memory API response cache with per-entry TTL

### Component Patterns

- `cn()` (`lib/utils.ts`) — className merging via clsx + tailwind-merge
- shadcn v4 components in `components/ui/` — Radix UI (`radix-ui` unified package) + CVA variants
- `ScrollReveal` wraps sections for entrance animations (GSAP)
- `RequestErrorState` — standardized error display with retry action
- Form validation: react-hook-form (with `@hookform/resolvers` available). Zod 4 (`zod@^4.3.6`) for schema definitions
- Always use `text-destructive` for field error text (not `text-red-500`)
- Always use `Role` enum from `lib/api/types` (not string literals) for role comparisons

### Styling

- Tailwind CSS 4 with `@import`/`@theme` syntax in `globals.css`
- OKLch color space with CSS custom properties
- Dark mode via `.dark` class (`next-themes`)

### Role-Based Access

| Role | Access |
|------|--------|
| `END_USER` | Blocked (403) |
| `MODERATOR` | View-only (reports + users) |
| `ADMIN` | Full CRUD on all entities |

### Backend API Shape

- **Success:** `{ statusCode, data }`
- **Error:** `{ statusCode, error, message, details, correlationId, timestamp }`
- **Report status machine:** RECEIVED → REVIEWING|ESCALATED|REJECTED, REVIEWING → ESCALATED|REJECTED|RESOLVED, ESCALATED → RESOLVED|REJECTED, REJECTED → CLOSED|REVIEWING, RESOLVED → CLOSED

## RTL Layout Rules

Arabic (`ar`) is the primary locale and renders RTL. The `dir="rtl"` attribute is set on the wrapper div in `app/[locale]/layout.tsx` and synced to `document.documentElement` by `LocaleDocumentSync`.

**Sidebar**: For RTL, `AppSidebar` sets `side="right"` so it appears on the right. The `SidebarProvider` flex layout naturally handles the content/sidebar order via RTL flex direction. The sidebar trigger in the topbar automatically appears on the right in RTL because flex items reverse.

**Icon mirroring**: Directional icons must be mirrored in RTL using `rtl:-scale-x-100`:
- `LogOut`, `ArrowUpRight`, `ChevronRight` → add `rtl:-scale-x-100`
- `LayoutPanelLeft`, `PanelLeftIcon` → already have `rtl:-scale-x-100` ✓

**Always use logical CSS properties** (not physical left/right):
- Positioning: `start-*`/`end-*` instead of `left-*`/`right-*`
- Margins: `ms-*`/`me-*` instead of `ml-*`/`mr-*`
- Padding: `ps-*`/`pe-*` instead of `pl-*`/`pr-*`
- Borders: `border-s`/`border-e` instead of `border-l`/`border-r`
- Text align: `text-start`/`text-end` instead of `text-left`/`text-right`
- Translate: use `ltr:translate-x-*` + `rtl:-translate-x-*` for directional offsets

**Tooltip side**: When sidebar is collapsed to icon-only mode, tooltip must appear on the opposite side from the sidebar. Pass `tooltip={{ children: label, side: isRtl ? 'left' : 'right' }}` to `SidebarMenuButton`.

## Known Patterns & Pitfalls

- **Cache invalidation after mutations:** Use `invalidateResourceCache(exactKey)` for single-key invalidation, `invalidateResourceCacheByPrefix('prefix:')` for dynamic keys (e.g. `users:list:*`)
- **Cache clear on logout:** `clearResourceCache()` from `stores/resource-cache-store.ts` — the `clear()` action calls `set()` correctly
- **Report status Select:** Always include the current status as a disabled first option so the Select shows a value before user interaction
- **CSP:** `unsafe-eval` and localhost ports are only included in development builds — both conditional on `NODE_ENV === 'development'`
- **API error category validation:** `normalizeApiErrorCategory` in `client.ts` validates against known enum members before casting
- **Route guard:** `isRouteAllowed = user != null && canAccessRoute(user.role, pathname)` — must require non-null user to prevent brief flash of protected content during auth state transitions
- **Sidebar visibility:** Nav items are hidden (empty array) when user role is undefined — do NOT default to showing all items (`false` not `true`)
- **Router imports:** Always import `useRouter`, `Link`, `usePathname` from `@/i18n/routing`, never from `next/navigation` or `next/link` (except `app/forbidden.tsx` and `app/not-found.tsx` which live outside the `[locale]` segment and can't use i18n routing)
- **Error pages at root (`app/forbidden.tsx`, `app/not-found.tsx`, `app/global-error.tsx`):** These live outside `[locale]` and cannot access locale context — hardcoded strings and `next/link` are correct here; do NOT add `'use client'` unless using React hooks
- **`lib/api/auth.ts` response handling:** `login()`, `getSession()`, `refresh()` unwrap `.data`; `forgotPassword()`, `resetPassword()`, `changePassword()` return the full `ApiResponse<T>` — callers don't use the return value so this inconsistency is harmless but be aware of it
- **E2E tests:** `playwright.config.ts` uses `pnpm` (not npm) to build/start the app
