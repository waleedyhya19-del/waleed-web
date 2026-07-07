# Implementation Plan: Admin Dashboard

**Branch**: `001-admin-dashboard` | **Date**: 2026-03-11 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-admin-dashboard/spec.md`

## Summary

Build a web-based admin dashboard for the Telephony Mafqud platform that
enables moderators to review and manage phone reports, and administrators
to manage users, moderators, and reports. The dashboard consumes the
existing NestJS backend API, supports Arabic (RTL) and English (LTR),
and uses Next.js 16 with App Router, React 19, shadcn/ui, and Supabase
Auth.

## Technical Context

**Language/Version**: TypeScript 5 (strict), Node.js 20+
**Primary Dependencies**: Next.js 16 (App Router), React 19, shadcn/ui (Radix Nova), Tailwind CSS 4, Supabase JS Client (`@supabase/ssr`), next-intl, react-hook-form, zod, recharts, yet-another-react-lightbox
**Storage**: N/A (frontend only; data from NestJS API + Supabase Auth)
**Testing**: Optional in v1 (per constitution). If added: Vitest + React Testing Library
**Target Platform**: Web (Chrome, Firefox, Safari, Edge — latest 2 versions)
**Project Type**: Web application (Next.js frontend consuming REST API)
**Performance Goals**: Dashboard load <2s, navigation <500ms, table render (100 rows) <1s
**Constraints**: Desktop-first (≥768px), no offline mode, no WebSocket in v1
**Scale/Scope**: ~12 pages, 2 user roles (MODERATOR, ADMIN), ~20 API endpoints consumed

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| # | Principle | Status | Notes |
|---|-----------|--------|-------|
| I | Security-First | PASS | Auth via Supabase + middleware route protection. RBAC at UI + API. CSRF via SameSite cookies. XSS via React's default escaping + CSP headers in Next.js config. No tokens in URLs. |
| II | Shared API Consumer | PASS | All data from NestJS API. No BFF. Cursor-based pagination. Status transitions mirrored from backend. |
| III | Bilingual RTL-First | PASS | next-intl for i18n. Arabic default. `dir` attribute on `<html>`. Tailwind logical properties. |
| IV | Component-Driven UI | PASS | shadcn/ui components throughout. `cn()` utility. Compound component patterns. Data attributes for styling. |
| V | Desktop-First Responsive | PASS | Desktop layout primary. Responsive down to 768px via Tailwind breakpoints. |
| VI | Simplicity & Incremental | PASS | No WebSocket, no audit log, no bulk actions, no dark mode UI. Each user story independently deliverable. |

**Post-Phase 1 Re-check**: All gates still pass. No violations introduced
during design. The addition of `next-intl`, `@supabase/ssr`,
`react-hook-form`, `zod`, and `yet-another-react-lightbox` are
necessary dependencies, not premature complexity.

## Project Structure

### Documentation (this feature)

```text
specs/001-admin-dashboard/
├── plan.md              # This file
├── research.md          # Phase 0: technology decisions
├── data-model.md        # Phase 1: frontend data model
├── quickstart.md        # Phase 1: setup & verification guide
├── contracts/
│   └── api-endpoints.md # Phase 1: API endpoint contracts
└── tasks.md             # Phase 2: implementation tasks (via /speckit.tasks)
```

### Source Code (repository root)

```text
app/
├── (auth)/
│   ├── login/
│   │   └── page.tsx
│   ├── forgot-password/
│   │   └── page.tsx
│   └── layout.tsx              # Auth layout (no sidebar)
├── (dashboard)/
│   ├── layout.tsx              # Dashboard layout (sidebar + topbar)
│   ├── page.tsx                # Dashboard home (/)
│   ├── reports/
│   │   ├── page.tsx            # Reports list
│   │   └── [id]/
│   │       └── page.tsx        # Report detail
│   ├── users/
│   │   ├── page.tsx            # Users list
│   │   ├── new/
│   │   │   └── page.tsx        # Create user (admin)
│   │   └── [id]/
│   │       └── page.tsx        # User detail
│   ├── moderators/
│   │   ├── page.tsx            # Moderators list (admin)
│   │   ├── new/
│   │   │   └── page.tsx        # Create moderator (admin)
│   │   └── [id]/
│   │       └── page.tsx        # Moderator detail (admin)
│   └── settings/
│       └── page.tsx            # Profile & language settings
├── layout.tsx                  # Root layout (html, body, providers)
├── not-found.tsx               # 404 page
└── forbidden.tsx               # 403 page (or component)

components/
├── ui/                         # 55 shadcn/ui components (existing)
├── auth/
│   ├── login-form.tsx
│   └── forgot-password-form.tsx
├── dashboard/
│   ├── summary-cards.tsx
│   └── recent-reports.tsx
├── reports/
│   ├── reports-table.tsx
│   ├── report-detail.tsx
│   ├── report-status-badge.tsx
│   ├── report-status-update.tsx
│   ├── report-edit-form.tsx
│   └── photo-gallery.tsx
├── users/
│   ├── users-table.tsx
│   ├── user-detail.tsx
│   ├── user-form.tsx
│   └── role-badge.tsx
├── moderators/
│   ├── moderators-table.tsx
│   ├── moderator-detail.tsx
│   └── moderator-form.tsx
├── settings/
│   ├── profile-form.tsx
│   ├── change-password-form.tsx
│   └── language-switcher.tsx
├── layout/
│   ├── app-sidebar.tsx
│   ├── topbar.tsx
│   └── session-expired-modal.tsx
└── shared/
    ├── data-table.tsx          # Reusable table with pagination/sort/filter
    ├── confirmation-dialog.tsx
    ├── empty-state.tsx
    ├── error-toast.tsx
    └── page-header.tsx

lib/
├── api/
│   ├── client.ts               # Base fetch wrapper
│   ├── types.ts                # API response types, entity types
│   ├── auth.ts                 # Auth endpoint functions
│   ├── reports.ts              # Report endpoint functions
│   └── users.ts                # User endpoint functions
├── supabase/
│   ├── client.ts               # Browser Supabase client
│   ├── server.ts               # Server-side Supabase client
│   └── middleware.ts            # Auth middleware helpers
├── constants/
│   ├── status-transitions.ts   # Report status state machine
│   └── roles.ts                # Role constants & permissions
├── validations/
│   ├── auth.ts                 # Login, password schemas (zod)
│   ├── report.ts               # Report edit schema (zod)
│   └── user.ts                 # User create/edit schemas (zod)
└── utils.ts                    # cn() utility (existing)

messages/
├── ar.json                     # Arabic translations
└── en.json                     # English translations

hooks/
├── use-mobile.ts               # Existing
├── use-session-timeout.ts      # 30-min inactivity timer
└── use-current-user.ts         # Current user context hook

middleware.ts                   # Next.js middleware (auth + i18n)
```

**Structure Decision**: Single Next.js frontend project (no separate
backend). Uses Next.js App Router route groups `(auth)` and `(dashboard)`
for layout separation. The backend already exists in `api/`.

## Complexity Tracking

> No violations. All design decisions align with constitution principles.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| (none)    |            |                                     |
