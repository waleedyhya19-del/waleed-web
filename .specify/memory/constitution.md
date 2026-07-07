<!--
  Sync Impact Report
  ==================
  Version change: 0.0.0 → 1.0.0 (initial ratification)

  Modified principles: N/A (initial version)

  Added sections:
    - Core Principles (6 principles)
    - Technology Constraints
    - Development Workflow
    - Governance

  Removed sections: N/A

  Templates requiring updates:
    - .specify/templates/plan-template.md        ✅ reviewed (compatible)
    - .specify/templates/spec-template.md         ✅ reviewed (compatible)
    - .specify/templates/tasks-template.md        ✅ reviewed (compatible)

  Follow-up TODOs: None
-->

# Telephony Mafqud Admin Dashboard Constitution

## Core Principles

### I. Security-First (NON-NEGOTIABLE)

- All pages MUST require authentication; unauthenticated users are
  redirected to login.
- Role-based access MUST be enforced at both UI and API levels
  (defense in depth). UI-only hiding is insufficient.
- Only MODERATOR and ADMIN roles are permitted. END_USER login
  attempts MUST return 403.
- Sensitive data (tokens, passwords) MUST NOT appear in URL
  parameters, logs, or client-accessible storage.
- CSRF protection MUST be active on all state-changing requests.
- XSS prevention: all user-generated content MUST be sanitized
  before rendering.
- CSP headers MUST be configured.

**Rationale:** The dashboard manages sensitive user and report data.
A single authorization bypass could expose personal information or
allow unauthorized moderation actions.

### II. Shared API Consumer

- The web dashboard MUST consume the existing NestJS backend API.
  No separate backend or BFF layer is permitted in v1.
- API response shape: success `{ statusCode, data }`,
  error `{ statusCode, error, message, details, correlationId, timestamp }`.
- Pagination MUST use cursor-based approach (`cursor` UUID + `take`
  1-100), not offset-based.
- Report status transitions MUST follow the server-side state
  machine: RECEIVED → REVIEWING → ESCALATED/REJECTED → RESOLVED → CLOSED.
  The UI MUST only present valid transitions.

**Rationale:** A single API reduces maintenance burden and ensures
mobile and web clients share identical business logic enforcement.

### III. Bilingual RTL-First

- Arabic (RTL) is the primary language. English (LTR) is secondary.
- Every user-facing string MUST be localized in both languages.
- Layout direction MUST switch dynamically based on active language.
- Date formats, number formats, and reading order MUST adapt to
  the active locale.
- Language preference MUST persist to the user's profile via API.

**Rationale:** The platform's primary audience is Arabic-speaking.
RTL-first prevents the common pitfall of bolting on RTL support
after LTR-first development, which causes layout regressions.

### IV. Component-Driven UI

- All UI elements MUST use shadcn/ui components built on Radix UI
  primitives with CVA variants.
- The `cn()` utility (`lib/utils.ts`) MUST be used for className
  composition (clsx + tailwind-merge).
- New components SHOULD follow compound component patterns
  (e.g., `Card.Header`, `CardTitle`) consistent with existing
  shadcn/ui conventions.
- Data attributes (`data-slot`, `data-variant`, `data-size`) MUST
  be used for styling hooks rather than direct DOM queries.

**Rationale:** Consistent component primitives reduce visual
inconsistency and accessibility gaps. Radix provides built-in
a11y (keyboard nav, focus management, ARIA).

### V. Desktop-First Responsive

- The primary layout target is desktop browsers (≥1024px).
- Responsive support MUST extend down to 768px (tablets).
- Layouts below 768px are explicitly out of scope for v1.
- Table views, sidebar navigation, and data-dense layouts MUST
  remain usable at the 768px breakpoint.

**Rationale:** Moderators and admins work primarily on desktop
in office settings. Tablet compatibility covers occasional
mobile-desk use without the cost of full mobile optimization.

### VI. Simplicity & Incremental Delivery

- Start with the simplest working solution. YAGNI applies.
- Each feature MUST be independently testable and deployable.
- Real-time updates (WebSocket), audit logs, bulk actions, and
  dark mode are explicitly deferred to v1.1+.
- Avoid premature abstractions. Three similar lines of code are
  preferable to a premature helper.

**Rationale:** The project is in bootstrap phase. Shipping a
functional MVP quickly provides more value than architecting
for hypothetical scale.

## Technology Constraints

- **Framework:** Next.js 16 with App Router, React 19,
  TypeScript 5 (strict mode)
- **Package Manager:** pnpm (no npm or yarn)
- **Styling:** Tailwind CSS 4 (`@import`/`@theme` syntax),
  OKLch color space, CSS custom properties
- **Component Library:** shadcn/ui (Radix Nova style)
- **Icons:** Lucide React
- **Auth Client:** Supabase JS Client (email/password only)
- **Path Aliases:** `@/*` maps to project root;
  `@/components`, `@/components/ui`, `@/lib`, `@/hooks`
- **Dark Mode:** `.dark` class via next-themes (infrastructure
  only; dark mode UI is deferred to v1.1)
- **Browser Support:** Latest 2 versions of Chrome, Firefox,
  Safari, Edge

## Development Workflow

- **Linting:** ESLint flat config with Next.js + TypeScript rules.
  Run `pnpm lint` before committing.
- **Code Style:** Prettier defaults (as configured). Single quotes,
  trailing commas.
- **Commits:** Atomic commits per logical change. Conventional
  commit messages preferred.
- **Branching:** Feature branches off `main`. PRs required for
  merge.
- **Testing:** Tests are optional in v1 unless explicitly
  requested. When present, they MUST pass before merge.
- **Accessibility:** WCAG 2.1 AA target. Keyboard navigation
  MUST work for all interactive elements. Minimum contrast ratio
  4.5:1 for text.

## Governance

- This constitution is the authoritative source of project
  principles. It supersedes ad-hoc decisions when conflicts arise.
- Amendments require:
  1. A documented rationale for the change.
  2. Version bump following semver (MAJOR for principle
     removals/redefinitions, MINOR for additions, PATCH for
     clarifications).
  3. Update to the Sync Impact Report at the top of this file.
  4. Propagation check across dependent templates
     (`plan-template.md`, `spec-template.md`, `tasks-template.md`).
- All PRs and code reviews SHOULD verify compliance with these
  principles.
- Runtime development guidance lives in `CLAUDE.md` at project
  root. This constitution defines the "what and why"; `CLAUDE.md`
  defines the "how".

**Version**: 1.0.0 | **Ratified**: 2026-03-11 | **Last Amended**: 2026-03-11
