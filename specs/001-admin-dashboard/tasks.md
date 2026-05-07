# Tasks: Admin Dashboard

**Input**: Design documents from `/specs/001-admin-dashboard/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/api-endpoints.md

**Tests**: Tests are OPTIONAL in v1 (per constitution). Not included unless explicitly requested.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup

**Purpose**: Install dependencies and create project scaffolding

- [ ] T001 Install new dependencies: `@supabase/ssr`, `@supabase/supabase-js`, `next-intl`, `react-hook-form`, `@hookform/resolvers`, `zod`, `yet-another-react-lightbox` via `pnpm add`
- [ ] T002 Create `.env.example` and `.env.local` with `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] T003 [P] Create directory structure for `lib/api/`, `lib/supabase/`, `lib/constants/`, `lib/validations/`, `messages/`, `components/auth/`, `components/dashboard/`, `components/reports/`, `components/users/`, `components/moderators/`, `components/settings/`, `components/layout/`, `components/shared/`

**Checkpoint**: Dependencies installed, env configured, directory structure ready

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**CRITICAL**: No user story work can begin until this phase is complete

- [ ] T004 Define all TypeScript types and enums (Role, ReportStatus, ReportType, Language, User, Report, ReportPhoto, ApiResponse, PaginatedResponse, ApiError, PaginationParams) in `lib/api/types.ts`
- [ ] T005 [P] Define report status transitions map (`VALID_TRANSITIONS`) in `lib/constants/status-transitions.ts`
- [ ] T006 [P] Define role constants and permission helpers (`isAdmin`, `isModerator`, `canAccessRoute`) in `lib/constants/roles.ts`
- [ ] T007 [P] Create Zod validation schemas for auth (login, forgot-password, reset-password, change-password) in `lib/validations/auth.ts`
- [ ] T008 [P] Create Zod validation schemas for user create/edit in `lib/validations/user.ts`
- [ ] T009 [P] Create Zod validation schemas for report edit in `lib/validations/report.ts`
- [ ] T010 Implement base API client with typed fetch wrapper (base URL from env, auth header injection, response unwrapping, error normalization) in `lib/api/client.ts`
- [ ] T011 [P] Implement auth API service (login, logout, forgotPassword, resetPassword, changePassword, refresh) in `lib/api/auth.ts`
- [ ] T012 [P] Implement users API service (list, getMe, updateMe, getById, create, update, delete) in `lib/api/users.ts`
- [ ] T013 [P] Implement reports API service (list, getById, update, updateStatus, delete) in `lib/api/reports.ts`
- [ ] T014 Create Supabase browser client factory in `lib/supabase/client.ts`
- [ ] T015 Create Supabase server-side client factory (cookie-based) in `lib/supabase/server.ts`
- [ ] T016 Implement auth middleware helpers (getSession, getRole, requireAuth, requireRole) in `lib/supabase/middleware.ts`
- [ ] T017 Configure next-intl: create `i18n/request.ts` config, `i18n/routing.ts`, and update `next.config.ts` with next-intl plugin
- [ ] T018 [P] Create Arabic translation file with all UI strings (navigation, buttons, labels, messages, statuses, roles) in `messages/ar.json`
- [ ] T019 [P] Create English translation file mirroring Arabic structure in `messages/en.json`
- [ ] T020 Create Next.js middleware combining auth checks (redirect unauthenticated to login, block END_USER with 403) and next-intl locale handling in `middleware.ts`
- [ ] T021 Update root layout to include next-intl provider, next-themes provider, Sonner toaster, and set `<html lang={locale} dir={dir}>` in `app/layout.tsx`
- [ ] T022 Create auth layout (centered card, no sidebar) for login and forgot-password pages in `app/(auth)/layout.tsx`
- [ ] T023 Create current-user context provider and `useCurrentUser` hook in `hooks/use-current-user.ts`
- [ ] T024 Implement session timeout hook (30-min inactivity timer with activity listeners) in `hooks/use-session-timeout.ts`
- [ ] T025 Build app sidebar component with navigation links (Dashboard, Reports, Users, Moderators admin-only, Settings, Logout) using existing `components/ui/sidebar.tsx` in `components/layout/app-sidebar.tsx`
- [ ] T026 [P] Build topbar component with user avatar, role display, and logout button in `components/layout/topbar.tsx`
- [ ] T027 [P] Build session-expired modal component (overlay with "Log in again" button) in `components/layout/session-expired-modal.tsx`. **CRITICAL**: Modal MUST NOT clear or unmount underlying form data — render as a portal overlay so unsaved form state is preserved (FR-016).
- [ ] T028 Create dashboard layout wrapping sidebar + topbar + session timeout + main content area in `app/(dashboard)/layout.tsx`
- [ ] T029 [P] Build reusable data-table component with cursor-based pagination, column sorting, and search input using shadcn Table in `components/shared/data-table.tsx`
- [ ] T030 [P] Build confirmation-dialog component (title, message, confirm/cancel actions) using shadcn AlertDialog in `components/shared/confirmation-dialog.tsx`
- [ ] T031 [P] Build empty-state component (icon, title, description, optional action button) in `components/shared/empty-state.tsx`
- [ ] T032 [P] Build error-toast utility using Sonner for network error notifications in `components/shared/error-toast.tsx`
- [ ] T033 [P] Build page-header component (title, breadcrumb, optional action buttons) in `components/shared/page-header.tsx`
- [ ] T034 [P] Build report-status-badge component (colored badge per status) in `components/reports/report-status-badge.tsx`
- [ ] T035 [P] Build role-badge component (colored badge per role) in `components/users/role-badge.tsx`
- [ ] T036 Create 404 not-found page in `app/not-found.tsx`
- [ ] T037 [P] Create 403 forbidden page component in `app/forbidden.tsx`
- [ ] T038 Update `next.config.ts` to add CSP headers and security headers via `headers()` config

**Checkpoint**: Foundation ready — API client, auth, i18n, layouts, shared components all functional. User story implementation can now begin.

**i18n ENFORCEMENT (Constitution Principle III)**: All component tasks from Phase 3 onward MUST use `useTranslations()` (client) or `getTranslations()` (server) for every user-facing string. No hardcoded English or Arabic strings in components. All text MUST reference keys from `messages/ar.json` and `messages/en.json`.

---

## Phase 3: User Story 3 — Authentication & Session Management (Priority: P1) 🎯 MVP

**Goal**: Staff members can log in, log out, reset passwords, and change passwords. Sessions auto-refresh with 30-min inactivity timeout.

**Independent Test**: Log in with moderator credentials → see dashboard. Try END_USER → see 403. Wait 30 min → see session-expired modal. Log out → redirected to login. Use forgot-password → receive email.

### Implementation for User Story 3

- [ ] T039 [P] [US3] Build login form component with email/password fields, Zod validation, error display (including account locked with Retry-After), and submit handler calling auth API in `components/auth/login-form.tsx`
- [ ] T040 [P] [US3] Build forgot-password form component with email field, success message, and submit handler in `components/auth/forgot-password-form.tsx`
- [ ] T041 [US3] Create login page rendering LoginForm, redirecting authenticated users to dashboard in `app/(auth)/login/page.tsx`
- [ ] T042 [P] [US3] Create forgot-password page rendering ForgotPasswordForm in `app/(auth)/forgot-password/page.tsx`
- [ ] T043 [US3] Build change-password form component (current password + new password fields, Zod validation) in `components/settings/change-password-form.tsx`
- [ ] T044 [US3] Build profile form component (display name, phone, read-only email and role) in `components/settings/profile-form.tsx`
- [ ] T045 [US3] Create settings page with profile form and change-password form in `app/(dashboard)/settings/page.tsx`

**Checkpoint**: Users can authenticate, manage sessions, and update passwords. The auth flow is fully functional.

---

## Phase 4: User Story 1 — Moderator Daily Report Review (Priority: P1) 🎯 MVP

**Goal**: Moderators can view reports in a table, open report detail with photo gallery, and update report status via valid transitions.

**Independent Test**: Navigate to Reports → see paginated table → open a report → view photos in gallery → update status from RECEIVED to REVIEWING → verify change persists.

### Implementation for User Story 1

- [ ] T046 [US1] Build reports-table component using data-table with columns (ID, type, serial number, status badge, user name, created date) and basic pagination in `components/reports/reports-table.tsx`
- [ ] T047 [US1] Create reports list page fetching reports from API (server component) and rendering reports-table in `app/(dashboard)/reports/page.tsx`
- [ ] T048 [P] [US1] Build report-status-update component with dropdown showing only valid transitions from `VALID_TRANSITIONS` map, confirm button, and API call to PATCH `/reports/:id/status` in `components/reports/report-status-update.tsx`
- [ ] T049 [P] [US1] Build photo-gallery component using yet-another-react-lightbox with zoom, thumbnails, keyboard navigation, and error placeholder ("Image unavailable" + retry) in `components/reports/photo-gallery.tsx`
- [ ] T050 [US1] Build report-detail component displaying all report fields (serial number, phone number, description, type, current status, created/updated dates), photo gallery, status update widget, and link to report owner's profile in `components/reports/report-detail.tsx`. *(Status history deferred to v1.1.)*
- [ ] T051 [US1] Create report detail page fetching report by ID (server component) and rendering report-detail in `app/(dashboard)/reports/[id]/page.tsx`

**Checkpoint**: Moderators can browse reports, view full details with photos, and update statuses. Core MVP is functional.

---

## Phase 5: User Story 4 — Dashboard Home Page (Priority: P2)

**Goal**: Dashboard shows summary cards (reports by status, total users, total moderators) and 10 most recent reports with status badges.

**Independent Test**: Log in → dashboard loads with correct all-time counts → click a status card → navigate to filtered reports list.

### Implementation for User Story 4

- [ ] T052 [P] [US4] Build summary-cards component displaying all-time report counts per status, total users, total moderators, each card clickable to navigate to filtered list in `components/dashboard/summary-cards.tsx`. *(Counts derived from paginated API responses; date range filtering deferred to v1.1 pending backend stats endpoint.)*
- [ ] T053 [P] [US4] Build recent-reports component displaying the 10 most recent reports as a compact list with status badges and links to detail pages in `components/dashboard/recent-reports.tsx`
- [ ] T054 [US4] Create dashboard home page (server component) fetching summary data and recent reports, rendering summary-cards + recent-reports in `app/(dashboard)/page.tsx`

**Checkpoint**: Dashboard provides at-a-glance platform overview with quick navigation to filtered views.

---

## Phase 6: User Story 2 — Admin User & Moderator Management (Priority: P2)

**Goal**: Admins can list/search/view/create/edit/delete users and moderators. Role assignment works. Safety guards prevent self-deletion and last-admin removal.

**Independent Test**: Navigate to Users → search by name → view user detail → edit role → verify change. Navigate to Moderators → create moderator → see in list. Try to delete own account → blocked.

### Implementation for User Story 2

- [ ] T056 [US2] Build users-table component using data-table with columns (name, email, phone, role badge, created date, actions) and search input in `components/users/users-table.tsx`
- [ ] T057 [US2] Create users list page fetching users from API (server component, moderators see only END_USER, admins see all) rendering users-table in `app/(dashboard)/users/page.tsx`
- [ ] T058 [US2] Build user-detail component displaying profile info, account status (locked until), link to user's reports, and admin-only actions (edit, role change, delete) in `components/users/user-detail.tsx`. *(Report count deferred to v1.1 — requires backend `userId` filter on reports endpoint.)*
- [ ] T059 [US2] Create user detail page fetching user by ID (server component) rendering user-detail in `app/(dashboard)/users/[id]/page.tsx`
- [ ] T060 [US2] Build user-form component (email, password, display name, phone, role, language) with Zod validation, used for both create and edit. Email and password fields are shown only on create; email is read-only on edit (not editable via API) in `components/users/user-form.tsx`
- [ ] T061 [US2] Create user create page (admin only) rendering user-form with POST handler in `app/(dashboard)/users/new/page.tsx`
- [ ] T062 [US2] Build moderators-table component using data-table with columns (name, email, phone, created date, actions) in `components/moderators/moderators-table.tsx`
- [ ] T063 [US2] Create moderators list page (admin only) fetching users with role=MODERATOR rendering moderators-table in `app/(dashboard)/moderators/page.tsx`
- [ ] T064 [US2] Build moderator-form component (email, display name, phone, temporary password) with Zod validation in `components/moderators/moderator-form.tsx`
- [ ] T065 [US2] Create moderator create page (admin only) rendering moderator-form with POST handler (role=MODERATOR) in `app/(dashboard)/moderators/new/page.tsx`
- [ ] T066 [US2] Build moderator-detail component displaying profile info and admin actions (edit, soft-delete) in `components/moderators/moderator-detail.tsx`
- [ ] T067 [US2] Create moderator detail page (admin only) fetching user by ID rendering moderator-detail in `app/(dashboard)/moderators/[id]/page.tsx`
- [ ] T068 [US2] Add self-deletion guard and last-admin guard to user-detail and moderator-detail: disable delete button with tooltip "You cannot delete your own account" or "At least one admin must exist" in `components/users/user-detail.tsx` and `components/moderators/moderator-detail.tsx`

**Checkpoint**: Full user and moderator CRUD for admins. Moderators see read-only end-user list. Safety guards operational.

---

## Phase 7: User Story 6 — Report Search & Advanced Filtering (Priority: P2)

**Goal**: Reports list supports search by IMEI/phone, filter by status and type, and cursor-based pagination with "Load more".

**Independent Test**: Search by IMEI → matching results shown. Apply status + type filter → results narrow. Paginate → more results load.

### Implementation for User Story 6

- [ ] T069 [US6] Add search input (IMEI/phone number) to reports-table component, syncing search term to URL search params in `components/reports/reports-table.tsx`
- [ ] T070 [US6] Add filter controls (status dropdown, type dropdown) to reports list page, syncing filter state to URL search params in `app/(dashboard)/reports/page.tsx`. *(Date range filter and column sorting deferred to v1.1 — backend API does not support `dateFrom`/`dateTo`/`sort`/`order` params.)*
- [ ] T071 [US6] Implement cursor-based "Load more" button in reports-table using `meta.hasNextPage` and `meta.nextCursor` from API response in `components/reports/reports-table.tsx`
- [ ] T072 [US6] Add link from report owner's name in report-detail to user detail page (`/users/:id`) in `components/reports/report-detail.tsx`

**Checkpoint**: Reports list is fully searchable, filterable, sortable, and paginated. Cross-linking between reports and users works.

---

## Phase 8: User Story 5 — Language Switching (Priority: P3)

**Goal**: Users can toggle between Arabic (RTL) and English (LTR) from settings. UI re-renders fully in selected language with correct direction. Preference persists across sessions.

**Independent Test**: Go to Settings → switch to English → entire UI in English + LTR → log out and back in → still English. Switch to Arabic → UI in Arabic + RTL → dates in Arabic format.

### Implementation for User Story 5

- [ ] T074 [US5] Build language-switcher component (toggle or dropdown between AR/EN) that calls PATCH `/users/me` to persist preference and triggers locale change in `components/settings/language-switcher.tsx`
- [ ] T075 [US5] Add language-switcher to settings page alongside profile-form and change-password-form in `app/(dashboard)/settings/page.tsx`
- [ ] T076 [US5] Update middleware to read user's `preferredLanguage` from session/cookie and set the next-intl locale accordingly in `middleware.ts`
- [ ] T077 [US5] Review and complete all translation keys in `messages/ar.json` and `messages/en.json` ensuring every UI string, status label, role name, error message, button label, and navigation item is translated
- [ ] T078 [US5] Verify RTL/LTR layout switching works across all pages: sidebar flips to right side, tables read right-to-left, form labels align correctly, date pickers show correct direction

**Checkpoint**: Full bilingual support operational. Arabic RTL is the default, English LTR is switchable.

---

## Phase 9: User Story 7 — Admin Report Editing & Deletion (Priority: P3)

**Goal**: Admins can edit report fields and soft-delete reports. Moderators cannot see edit/delete controls.

**Independent Test**: As admin, open a report → edit serial number → save → change persists. Click "Delete Report" → confirmation dialog → confirm → report disappears from list. As moderator → no edit/delete buttons visible.

### Implementation for User Story 7

- [ ] T079 [US7] Build report-edit-form component (serial number, phone number, description, type fields) with Zod validation and PATCH handler in `components/reports/report-edit-form.tsx`
- [ ] T080 [US7] Add edit mode toggle and delete button (admin-only, role-gated, **RECEIVED status only**) to report-detail component. Hide edit/delete controls when report status is not RECEIVED. Render report-edit-form when editing and confirmation-dialog for delete in `components/reports/report-detail.tsx`
- [ ] T081 [US7] Implement soft-delete handler in report-detail: call DELETE `/reports/:id` (RECEIVED status only), show success toast, redirect to reports list in `components/reports/report-detail.tsx`

**Checkpoint**: Admins have full report editing and deletion capability. Moderators see read-only view.

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Quality, accessibility, performance, and UX improvements across all user stories

- [ ] T082 [P] Add keyboard navigation testing across all interactive components: ensure Tab order, Enter/Space activation, Escape dismissal work correctly
- [ ] T083 [P] Add ARIA labels, roles, and live regions to custom components (data-table, photo-gallery, status-update, confirmation-dialog)
- [ ] T084 [P] Add empty-state components to all list pages (reports, users, moderators) when no data exists
- [ ] T085 [P] Add loading skeletons (using shadcn Skeleton) to all pages during data fetching
- [ ] T086 [P] Add error handling and error-toast to all API calls across all pages — network errors show "Failed to save. Please try again." without clearing forms
- [ ] T087 Review all pages at 768px and 1024px breakpoints; fix any layout issues with sidebar, tables, and forms
- [ ] T088 Run `pnpm lint` and fix all linting errors across the codebase
- [ ] T089 Run `pnpm build` and fix all TypeScript compilation errors
- [ ] T090 Verify quickstart.md flow end-to-end: setup → login → dashboard → reports → users → moderators → settings → language switch → logout

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **US3 Auth (Phase 3)**: Depends on Foundational — BLOCKS US1 (needs login to access dashboard)
- **US1 Report Review (Phase 4)**: Depends on US3 (auth must work)
- **US4 Dashboard Home (Phase 5)**: Depends on US3 (auth) — can run in parallel with US1
- **US2 User Management (Phase 6)**: Depends on US3 (auth) — can run in parallel with US1/US4
- **US6 Report Filtering (Phase 7)**: Depends on US1 (extends reports-table from US1)
- **US5 Language Switching (Phase 8)**: Depends on US3 (settings page from US3)
- **US7 Report Edit/Delete (Phase 9)**: Depends on US1 (extends report-detail from US1)
- **Polish (Phase 10)**: Depends on all desired user stories being complete

### User Story Dependencies

- **US3 (P1 Auth)**: Can start after Foundational — No dependencies on other stories
- **US1 (P1 Report Review)**: Depends on US3 for auth — No other story dependencies
- **US4 (P2 Dashboard)**: Depends on US3 — Can run in parallel with US1
- **US2 (P2 User Management)**: Depends on US3 — Can run in parallel with US1/US4
- **US6 (P2 Report Filtering)**: Depends on US1 — Extends US1 components
- **US5 (P3 Language Switching)**: Depends on US3 — Extends settings page
- **US7 (P3 Report Edit/Delete)**: Depends on US1 — Extends report detail

### Within Each User Story

- Components before pages
- Parallel component creation where no dependencies exist
- Pages wire components together last
- Story complete before moving to dependent stories

### Parallel Opportunities

- **Phase 2**: T005–T009 all parallel (constants, schemas); T011–T013 all parallel (API services); T018–T019 parallel (messages); T025–T027 parallel (layout components); T029–T035 parallel (shared components); T036–T037 parallel (error pages)
- **Phase 3**: T039–T040 parallel (auth forms); T041–T042 parallel (auth pages)
- **Phase 4**: T048–T049 parallel (status update + gallery)
- **Phase 5**: T052–T053 parallel (dashboard components)
- **Phase 6**: T056–T067 has some parallelism within component builds
- **After Phase 3**: US1, US4, US2 can all start in parallel
- **Phase 10**: T082–T086 all parallel

---

## Parallel Example: Foundational Phase

```bash
# Batch 1: Types and constants (all parallel)
Task: "T004 - Define types in lib/api/types.ts"
Task: "T005 - Status transitions in lib/constants/status-transitions.ts"
Task: "T006 - Role constants in lib/constants/roles.ts"
Task: "T007 - Auth validations in lib/validations/auth.ts"
Task: "T008 - User validations in lib/validations/user.ts"
Task: "T009 - Report validations in lib/validations/report.ts"

# Batch 2: API client (depends on T004)
Task: "T010 - Base API client in lib/api/client.ts"

# Batch 3: API services (all parallel, depend on T010)
Task: "T011 - Auth API service in lib/api/auth.ts"
Task: "T012 - Users API service in lib/api/users.ts"
Task: "T013 - Reports API service in lib/api/reports.ts"
```

---

## Implementation Strategy

### MVP First (US3 + US1)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: US3 Auth (login, logout, password flows)
4. Complete Phase 4: US1 Report Review (report table, detail, status update)
5. **STOP and VALIDATE**: Moderator can log in, review reports, update statuses
6. Deploy/demo if ready — this is the core MVP

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add US3 Auth → Login works → Deploy/Demo
3. Add US1 Report Review → Core workflow works → Deploy/Demo (MVP!)
4. Add US4 Dashboard + US2 User Management (parallel) → Admin features → Deploy/Demo
5. Add US6 Report Filtering → Enhanced search → Deploy/Demo
6. Add US5 Language Switching → Bilingual support → Deploy/Demo
7. Add US7 Report Edit/Delete → Admin editing → Deploy/Demo
8. Polish phase → Production-ready → Final Deploy
