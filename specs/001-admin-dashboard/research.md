# Research: Admin Dashboard

**Feature Branch**: `001-admin-dashboard`
**Date**: 2026-03-11

## R1: Internationalization (i18n) Strategy

**Decision**: Use `next-intl` for localization.

**Rationale**:
- First-class Next.js App Router + RSC support
- Built-in message formatting (ICU), date/number formatting per locale
- Supports dynamic `dir` attribute switching (RTL/LTR)
- Middleware-based locale detection and routing
- Lightweight compared to `react-i18next` + manual Next.js integration

**Alternatives Considered**:
- `react-i18next`: Mature, but requires manual SSR hydration in App Router;
  no built-in routing middleware for Next.js 16.
- `next-translate`: Less active maintenance; limited RSC support.
- Custom `Intl` wrapper: Too much boilerplate for 2-language support;
  reinvents message catalog, pluralization.

**Implementation Notes**:
- Locale files in `messages/ar.json` and `messages/en.json`
- Middleware rewrites to `/(ar|en)/...` segments
- Default locale: `ar` (Arabic, RTL)
- `useTranslations()` hook in client components
- `getTranslations()` in server components

---

## R2: API Client Architecture

**Decision**: Typed fetch wrapper with per-entity service modules.

**Rationale**:
- The NestJS API is a standard REST API with consistent response shapes.
  A thin typed wrapper over `fetch` is sufficient.
- No need for a heavy client like Axios or TanStack Query in v1. The
  dashboard is primarily server-rendered (RSC); client-side fetching is
  limited to mutations and interactive filters.
- Per-entity modules (`api/reports.ts`, `api/users.ts`, `api/auth.ts`)
  keep contracts co-located and independently testable.

**Alternatives Considered**:
- `axios`: Unnecessary abstraction over fetch for this use case.
- `@tanstack/react-query`: Powerful but premature for v1. Can be added
  in v1.1 if caching/optimistic updates are needed.
- OpenAPI codegen (`openapi-typescript`): The API has Swagger output at
  `/api/docs/openapi.json`. Could generate types. Deferred because the
  API is co-owned and types can be maintained manually with less tooling
  overhead in v1.

**Implementation Notes**:
- Base client in `lib/api/client.ts`: handles base URL, auth headers,
  response unwrapping, error normalization.
- Entity services: `lib/api/reports.ts`, `lib/api/users.ts`,
  `lib/api/auth.ts`.
- Types in `lib/api/types.ts` mirroring API DTOs.
- Server-side calls use cookie-forwarded tokens from middleware.
- Client-side calls use Supabase session token.

---

## R3: Authentication & Session Management

**Decision**: Supabase JS client (`@supabase/ssr`) for auth, with
Next.js middleware for route protection.

**Rationale**:
- The backend uses Supabase Auth (JWT HS256). The Supabase JS client
  handles token refresh, session persistence, and auth state natively.
- `@supabase/ssr` is the official package for Next.js SSR/RSC integration.
  It stores tokens in cookies (not localStorage), enabling server-side
  auth checks in middleware and RSC.
- Next.js middleware intercepts all routes to verify auth and role before
  page load, avoiding flash-of-unauthenticated-content.

**Alternatives Considered**:
- Manual JWT handling: More control but reinvents token refresh, secure
  storage, and session management that Supabase client handles.
- `next-auth` / `auth.js`: Designed for multi-provider auth. Overkill
  for single-provider (Supabase) email/password.

**Implementation Notes**:
- `lib/supabase/server.ts`: Server-side client factory (reads cookies).
- `lib/supabase/client.ts`: Browser client factory.
- `lib/supabase/middleware.ts`: Auth + role check middleware.
- Role check: After Supabase auth, fetch `/api/v1/users/me` to get role.
  Cache role in cookie or session to avoid re-fetching on every request.
- Session timeout: Implement 30-min inactivity timer on client side
  using activity listeners + `setTimeout`.

---

## R4: State Management

**Decision**: Server Components as primary data layer; URL search params
for filter/sort state; React Context for auth user.

**Rationale**:
- Next.js App Router with RSC makes most data fetching server-side.
  No global client state store needed for data.
- URL search params (`?status=RECEIVED&sort=createdAt`) make filter
  state shareable, bookmarkable, and browser-back-friendly.
- Auth context is the only truly global client state (current user,
  role, session).

**Alternatives Considered**:
- Zustand/Jotai: Lightweight stores but unnecessary when RSC handles
  data fetching and URL params handle UI state.
- Redux: Excessive for this scope.

---

## R5: Form Handling

**Decision**: `react-hook-form` with `zod` for validation.

**Rationale**:
- Forms are a core interaction pattern (login, create user, edit report,
  change password, status update).
- `react-hook-form` provides uncontrolled form performance with minimal
  re-renders.
- `zod` schemas can be shared between client validation and type
  generation, reducing duplication.

**Alternatives Considered**:
- Native form actions (React 19 `useActionState`): Good for simple
  forms but lacks field-level validation UX.
- `formik`: Heavier, controlled-input approach with more re-renders.

---

## R6: Photo Gallery / Viewer

**Decision**: Use a lightweight lightbox library (e.g., `yet-another-react-lightbox`).

**Rationale**:
- Report review requires zoomable photo viewing (spec FR-005).
- A dedicated lightbox library provides zoom, pan, keyboard navigation,
  and gallery mode out of the box.
- Building a custom viewer is unnecessary complexity.

**Alternatives Considered**:
- `react-photo-view`: Good but less maintained.
- Custom `<dialog>` with CSS zoom: Insufficient for the zoom/pan UX
  moderators need for evidence review.

---

## R7: Charts / Data Visualization

**Decision**: Use `recharts` (already installed).

**Rationale**:
- `recharts` is already a project dependency. It covers the dashboard
  summary cards and any future chart needs.
- The dashboard primarily needs numeric summary cards (not complex
  charts), so recharts is more than sufficient.

**Alternatives Considered**:
- None needed; recharts is already in `package.json`.

---

## R8: Report Status State Machine (Frontend)

**Decision**: Mirror the backend's `VALID_TRANSITIONS` map as a
frontend constant.

**Rationale**:
- The backend defines valid transitions in
  `src/common/utils/status-transitions.ts`.
- The frontend needs the same map to render the status dropdown with
  only valid target statuses.
- Keeping a frontend copy is simpler than an API call to "get valid
  transitions" (which doesn't exist as an endpoint).

**Valid Transitions Map**:
```
RECEIVED  → [REVIEWING, ESCALATED, REJECTED]
REVIEWING → [ESCALATED, REJECTED, RESOLVED]
ESCALATED → [RESOLVED, REJECTED]
RESOLVED  → [CLOSED]
REJECTED  → [CLOSED, REVIEWING]
CLOSED    → [] (terminal)
```

---

## R9: RTL Layout Strategy

**Decision**: Use Tailwind CSS logical properties + `dir` attribute on
`<html>` element.

**Rationale**:
- Tailwind CSS 4 supports logical properties (`ms-*`, `me-*`, `ps-*`,
  `pe-*`, `start`, `end`) that adapt to text direction automatically.
- Setting `dir="rtl"` or `dir="ltr"` on `<html>` combined with logical
  properties handles most layout flipping without custom CSS.
- shadcn/ui components already use logical properties where applicable.

**Implementation Notes**:
- `<html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'}>` in
  root layout.
- Avoid hardcoded `left`/`right`; use `start`/`end` equivalents.
- Test every component in both directions.
