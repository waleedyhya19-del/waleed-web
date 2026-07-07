# Product Requirements Document (PRD)

# تيليفوني مفقود - لوحة التحكم (I Lost My Phone - Admin Dashboard)

**Version:** 1.0
**Date:** 2026-03-06
**Author:** Product Team
**Status:** Draft
**Related:** [`docs/PRD.md`](./PRD.md) (Mobile App PRD)

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [Problem Statement](#2-problem-statement)
3. [Target Users and Personas](#3-target-users-and-personas)
4. [Goals and Success Metrics](#4-goals-and-success-metrics)
5. [Scope](#5-scope)
6. [Functional Requirements](#6-functional-requirements)
7. [Non-Functional Requirements](#7-non-functional-requirements)
8. [Page Structure and Navigation](#8-page-structure-and-navigation)
9. [User Flows](#9-user-flows)
10. [Edge Cases and Error Handling](#10-edge-cases-and-error-handling)
11. [Assumptions](#11-assumptions)
12. [Open Questions](#12-open-questions)
13. [Dependencies and Constraints](#13-dependencies-and-constraints)

---

## 1. Product Overview

The **Admin Dashboard** is a web application for moderators and administrators of the "تيليفوني مفقود" platform. It provides a browser-based interface for managing reports, users, and moderators. End users do not have access to this application. they use the Android mobile app exclusively. Moderators and admins can also use the mobile app for basic operations (viewing reports, updating statuses), but the web dashboard is their primary tool for management workflows.

This web app consumes the same NestJS backend API documented in `docs/PRD.md`. No separate backend is required.

**Platform:** Web (responsive, desktop-first)
**Frontend:** React with Next.js (or similar SPA framework) *[Assumption]*
**Backend:** Shared NestJS API (see `docs/PRD.md`)
**Authentication:** Email/password via Supabase Auth (no OAuth or WhatsApp for admin/moderator accounts)
**Localization:** Arabic (primary), English (secondary), user-switchable

---

## 2. Problem Statement

Moderators and administrators need a desktop-optimized interface to efficiently manage large volumes of reports, review user details, and perform administrative actions. A mobile app is not ideal for these workflows because:

- Report review involves viewing multiple photos, reading details, and updating statuses in rapid succession.
- User management (creating moderators, assigning roles, bulk operations) requires table views, filtering, and sorting.
- Admins need dashboard-level visibility into platform activity.

A dedicated web dashboard provides the screen real estate, keyboard navigation, and data-dense layouts these roles require.

---

## 3. Target Users and Personas

### 3.1 Moderator

- **Who:** Internal staff responsible for reviewing and triaging reports.
- **Access level:** View end users (not admins or other moderators), update report status only. Cannot delete or create anything.
- **Primary tasks:** Review reports, update statuses, view user context.
- **Environment:** Desktop browser, office setting.

### 3.2 Admin

- **Who:** System administrators and project owners.
- **Access level:** Full CRUD on users, moderators, and reports. Role assignment. Platform oversight.
- **Primary tasks:** Manage all entities, create moderator accounts, monitor platform health.
- **Environment:** Desktop browser.

**Note:** End users (role: END_USER) are blocked from accessing this web app entirely. Login attempts by end users return a 403 error.

---

## 4. Goals and Success Metrics

### 4.1 Product Goals

| # | Goal | Description |
|---|------|-------------|
| G1 | Efficient report review | Moderators can review and update a report in under 2 minutes |
| G2 | Centralized user management | Admins can manage all users and moderators from one interface |
| G3 | Data visibility | Dashboard provides at-a-glance metrics on report volume, statuses, and user activity |
| G4 | Responsive layout | Usable on tablets and desktops (minimum 768px width) |

### 4.2 Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Average report review time | < 2 minutes | Time from opening report to status update |
| Moderator task completion rate | > 95% | Actions started vs. completed without errors |
| Page load time (dashboard) | < 2 seconds | Lighthouse or RUM metrics |
| Admin satisfaction score | > 4/5 | Quarterly internal survey *[Assumption]* |

---

## 5. Scope

### 5.1 In-Scope (v1.0)

- Authentication for moderators and admins (email/password only via Supabase Auth)
- Dashboard home page with summary statistics
- Reports management: list, filter, sort, view detail, update status
- Users management (Admin only): list, view, create, edit, soft-delete, role assignment
- Moderator management (Admin only): create, edit, soft-delete moderator accounts
- Photo viewer for report evidence (zoom, gallery)
- Arabic and English language support with in-app language switcher
- Responsive layout (desktop-first, tablet-compatible)

### 5.2 Out-of-Scope (v1.0)

- End user access or registration
- Report creation from the web (reports are created by end users on mobile only)
- Real-time notifications or WebSocket updates *[Assumption]*
- Audit log viewer (deferred to v1.1) *[Assumption]*
- Bulk actions (bulk status change, bulk delete) *[Assumption]*
- Dark mode
- Mobile-optimized layout (below 768px)

---

## 6. Functional Requirements

### 6.1 Authentication

| ID | Requirement | Details |
|----|-------------|---------|
| WEB-AUTH-01 | Login with email and password | Via Supabase Auth. Only MODERATOR and ADMIN roles are allowed. |
| WEB-AUTH-02 | Role check on login | If authenticated user has role END_USER, return 403 and display "Access denied" message. |
| WEB-AUTH-03 | Session management | JWT stored in httpOnly cookie or secure localStorage. Auto-refresh via Supabase client. *[Assumption]* |
| WEB-AUTH-04 | Logout | Clear session and redirect to login page. |
| WEB-AUTH-05 | Password reset | Via Supabase email-based password reset flow. |
| WEB-AUTH-06 | Change password | Authenticated user can change password from profile/settings page. |

### 6.2 Dashboard (Home Page)

| ID | Requirement | Details |
|----|-------------|---------|
| WEB-DASH-01 | Summary cards | Display: total reports, reports by status (received, reviewing, escalated, etc.), total users, total moderators. |
| WEB-DASH-02 | Recent reports | Show the 10 most recent reports with status badges. |
| WEB-DASH-03 | Quick filters | Click a status card to navigate to the reports list pre-filtered by that status. |
| WEB-DASH-04 | Date range context | Summary stats default to last 30 days with option to change. *[Assumption]* |

### 6.3 Reports Management

| ID | Requirement | Moderator | Admin |
|----|-------------|-----------|-------|
| WEB-RPT-01 | List all reports with pagination, sorting, and filtering | Yes | Yes |
| WEB-RPT-02 | Filter by: status, report type (lost/stolen), date range, user | Yes | Yes |
| WEB-RPT-03 | Sort by: created date, updated date, status | Yes | Yes |
| WEB-RPT-04 | View report detail (serial number, phone number, description, photos, status history) | Yes | Yes |
| WEB-RPT-05 | View attached photos with zoom/gallery view | Yes | Yes |
| WEB-RPT-06 | Update report status (enforcing allowed transitions per workflow in mobile PRD section 6.5) | Yes | Yes |
| WEB-RPT-07 | Edit report fields (serial number, phone number, description, type) | No | Yes |
| WEB-RPT-08 | Soft-delete a report | No | Yes |
| WEB-RPT-09 | View report owner's profile (link to user detail) | Yes | Yes |
| WEB-RPT-10 | Search reports by IMEI or phone number | Yes | Yes |

### 6.4 Users Management

| ID | Requirement | Moderator | Admin |
|----|-------------|-----------|-------|
| WEB-USR-01 | List end users with pagination, sorting, and search | Yes (end users only) | Yes (all roles) |
| WEB-USR-02 | View user detail (profile, reports count, account status) | Yes (end users only) | Yes (all roles) |
| WEB-USR-03 | View user's reports (link to filtered reports list) | Yes | Yes |
| WEB-USR-04 | Create a new user account | No | Yes |
| WEB-USR-05 | Edit user details (name, email, phone) | No | Yes |
| WEB-USR-06 | Soft-delete a user | No | Yes |
| WEB-USR-07 | Assign/change user role (END_USER, MODERATOR) | No | Yes |
| WEB-USR-08 | Search users by name, email, or phone | Yes (end users only) | Yes |

### 6.5 Moderator Management (Admin Only)

| ID | Requirement | Details |
|----|-------------|---------|
| WEB-MOD-01 | List all moderators | Paginated table with name, email, created date, status |
| WEB-MOD-02 | Create moderator account | Admin provides email and temporary password. Moderator receives email to set password. *[Assumption]* |
| WEB-MOD-03 | Edit moderator details | Update name, email, phone |
| WEB-MOD-04 | Soft-delete moderator | Deactivate moderator account |
| WEB-MOD-05 | View moderator activity | See how many reports the moderator has updated *[Assumption]* |

### 6.6 Profile and Settings

| ID | Requirement | Details |
|----|-------------|---------|
| WEB-SET-01 | View own profile | Display name, email, role |
| WEB-SET-02 | Edit own profile | Update display name and phone number |
| WEB-SET-03 | Change password | Requires current password |
| WEB-SET-04 | Switch language | Toggle between Arabic (RTL) and English (LTR). Persisted to user profile. |

---

## 7. Non-Functional Requirements

### 7.1 Security

| ID | Requirement | Priority |
|----|-------------|----------|
| WEB-SEC-01 | All pages require authentication. Unauthenticated users are redirected to login. | Critical |
| WEB-SEC-02 | Role-based UI rendering: moderators do not see admin-only actions (create, edit, delete users). | Critical |
| WEB-SEC-03 | RBAC enforced at the API level (defense in depth, not UI-only). | Critical |
| WEB-SEC-04 | CSRF protection on all state-changing requests. | Critical |
| WEB-SEC-05 | Content Security Policy (CSP) headers configured. | High |
| WEB-SEC-06 | Session timeout after 30 minutes of inactivity. *[Assumption]* | High |
| WEB-SEC-07 | No sensitive data (tokens, passwords) in URL parameters. | Critical |
| WEB-SEC-08 | XSS prevention: all user-generated content is sanitized before rendering. | Critical |

### 7.2 Performance

| ID | Requirement | Target |
|----|-------------|--------|
| WEB-PERF-01 | Initial page load (dashboard) | < 2 seconds |
| WEB-PERF-02 | Page navigation (client-side) | < 500ms |
| WEB-PERF-03 | Table rendering (100 rows) | < 1 second |
| WEB-PERF-04 | Image gallery load | Progressive loading with thumbnails first |

### 7.3 Accessibility

| ID | Requirement | Details |
|----|-------------|---------|
| WEB-A11Y-01 | Keyboard navigation | All interactive elements reachable via keyboard |
| WEB-A11Y-02 | RTL layout | Full right-to-left support for Arabic language |
| WEB-A11Y-03 | Minimum contrast ratio | WCAG 2.1 AA (4.5:1 for text) *[Assumption]* |

### 7.4 Browser Support

| Browser | Minimum Version |
|---------|-----------------|
| Chrome | Latest 2 versions |
| Firefox | Latest 2 versions |
| Safari | Latest 2 versions |
| Edge | Latest 2 versions |

---

## 8. Page Structure and Navigation

### 8.1 Sidebar Navigation

```
[Logo / App Name]
------------------
Dashboard (Home)
Reports
Users
Moderators        (Admin only)
------------------
Settings / Profile
Logout
```

### 8.2 Page Inventory

| Page | URL | Access |
|------|-----|--------|
| Login | /login | Public (unauthenticated only) |
| Forgot Password | /forgot-password | Public |
| Dashboard | / | Moderator, Admin |
| Reports List | /reports | Moderator, Admin |
| Report Detail | /reports/:id | Moderator, Admin |
| Users List | /users | Moderator (end users only), Admin |
| User Detail | /users/:id | Moderator (end users only), Admin |
| Create User | /users/new | Admin |
| Moderators List | /moderators | Admin |
| Create Moderator | /moderators/new | Admin |
| Moderator Detail | /moderators/:id | Admin |
| Settings | /settings | Moderator, Admin |

---

## 9. User Flows

### 9.1 Moderator: Daily Report Review

1. Moderator logs in with email and password.
2. Dashboard loads showing summary cards. Moderator sees "12 reports received" card.
3. Moderator clicks the "received" card or navigates to Reports page.
4. Reports list shows filtered results (status = received), sorted by oldest first.
5. Moderator clicks the first report.
6. Report detail page shows: serial number, phone number, description, photos (expandable gallery), current status, and submitting user's name (linked).
7. Moderator reviews the photos and data.
8. Moderator selects new status "reviewing" from the status dropdown and clicks "Update".
9. Status is updated. Moderator clicks "Back to list" or uses browser back.
10. Moderator proceeds to the next report.

### 9.2 Moderator: Viewing a User for Context

1. On a report detail page, moderator clicks the report owner's name.
2. User detail page shows: display name, email, phone, registration date, total reports, list of their reports.
3. Moderator reviews the user's report history for patterns.
4. Moderator navigates back to the report.

### 9.3 Admin: Creating a Moderator Account

1. Admin navigates to Moderators page.
2. Admin clicks "Create Moderator".
3. Admin fills in: email, display name, phone (optional).
4. Admin submits the form.
5. System creates the account in Supabase Auth and the local database with role MODERATOR.
6. Moderator receives an email to set their password. *[Assumption]*
7. New moderator appears in the list.

### 9.4 Admin: Managing Users

1. Admin navigates to Users page.
2. Admin searches for a user by name or email.
3. Admin clicks the user to view details.
4. Admin can: edit profile fields, change role (END_USER to MODERATOR or vice versa), or soft-delete the account.
5. All changes take effect immediately.

### 9.5 Admin: Soft-Deleting a Report

1. Admin navigates to a report detail page.
2. Admin clicks "Delete Report".
3. Confirmation dialog appears: "Are you sure you want to delete this report? This action will hide the report from all views."
4. Admin confirms.
5. Report is soft-deleted. It no longer appears in lists or search results.

### 9.6 Language Switching

1. User (moderator or admin) navigates to Settings.
2. User toggles language from Arabic to English (or vice versa).
3. Entire UI re-renders in the selected language, including navigation, labels, buttons, and date formats.
4. Layout direction switches between RTL (Arabic) and LTR (English).
5. Preference is saved to the user's profile.

---

## 10. Edge Cases and Error Handling

| Scenario | Handling |
|----------|----------|
| End user attempts to log in to web dashboard | Display "Access denied. This dashboard is for authorized staff only." Redirect to login. |
| Moderator navigates to admin-only route (e.g., /moderators) | Display 403 page or redirect to dashboard. |
| Session expires while user is on a page | Show a session-expired modal with "Log in again" button. Do not lose unsaved form data if possible. |
| Admin tries to delete their own account | Block the action. Display "You cannot delete your own account." |
| Admin tries to demote the last remaining admin | Block the action. Display "At least one admin account must exist." *[Assumption]* |
| Concurrent status update by two moderators | Last-write-wins. The UI shows the updated status after refresh. No real-time conflict resolution in v1. |
| Moderator/admin attempts invalid status transition | Status dropdown only shows allowed target statuses based on current status. API also enforces transitions. |
| Report photos fail to load | Show placeholder with "Image unavailable" and a retry button. |
| Network error during form submission | Show error toast with "Failed to save. Please try again." Do not clear the form. |
| Empty states (no reports, no users) | Display appropriate empty state messages with contextual guidance. |

---

## 11. Assumptions

All assumptions are marked with *[Assumption]* inline throughout the document. Summary:

1. **Frontend framework** is React with Next.js (or similar SPA/SSR framework). Final choice is an engineering decision.
2. **Session storage** uses httpOnly cookies or secure localStorage with Supabase client library.
3. **Dashboard date range** defaults to last 30 days.
4. **Moderator account creation** triggers a Supabase email invite for password setup.
5. **Moderator activity tracking** (reports updated count) is available in v1.
6. **Session timeout** is 30 minutes of inactivity.
7. **WCAG 2.1 AA** is the accessibility target.
8. **Audit log, bulk actions, and real-time updates** are deferred to v1.1.
9. **At least one admin must exist** at all times. the system prevents deleting the last admin.
10. **The web app shares the same API** as the mobile app. no separate backend.
11. **First admin account** is created via a database seed script during deployment.
12. **Moderators and admins** also have access to the mobile app for basic operations.

---

## 12. Open Questions

| # | Question | Impact | Owner |
|---|----------|--------|-------|
| WEB-OQ-01 | What frontend framework should be used? (React/Next.js, Vue/Nuxt, Angular) | Engineering setup, hiring | Engineering |
| WEB-OQ-02 | Should the dashboard include real-time updates via WebSockets in v1 or defer to v1.1? | Complexity, UX | Product, Engineering |
| WEB-OQ-03 | Is an audit log required for v1? (Who changed what, when) | Compliance, scope | Product, Legal |
| WEB-OQ-04 | Should moderators be able to add internal notes to reports (not visible to end users)? | Feature scope, data model | Product |
| WEB-OQ-05 | What is the deployment target for the web app? (Vercel, Supabase hosting, self-hosted) | DevOps, cost | Engineering |
| WEB-OQ-06 | Should the web app support bulk status updates for reports? | UX for high-volume moderation | Product |
| WEB-OQ-07 | Are there specific branding/design guidelines or is the team free to design? | Design timeline | Design |

---

## 13. Dependencies and Constraints

### 13.1 Technical Dependencies

| Dependency | Version | Purpose |
|------------|---------|---------|
| React / Next.js | Latest *[Assumption]* | Web frontend framework |
| Supabase JS Client | Latest | Auth and session management |
| Shared NestJS API | Same as mobile | Backend endpoints |
| Tailwind CSS and shadcn/ui | Latest *[Assumption]* | Styling |
| Apexcharts | Latest *[Assumption]* | Data visualization |
| Firebase | Latest *[Assumption]* | Push notifications |

### 13.2 Shared Backend Dependency

This web app depends on the same NestJS API that serves the mobile app. The following API aspects are critical:

- **CORS:** Must allow the web dashboard origin in addition to the mobile app.
- **RBAC:** API guards must support all three roles. The web app relies on API-level enforcement, not just UI hiding.
- **Pagination, filtering, sorting:** The API must support query parameters for the table views (e.g., `?status=received&sort=createdAt&order=asc&page=1&limit=20`).
- **User language preference:** The API must store and return the user's preferred language.

### 13.3 Constraints

1. **No end-user access.** The web app is strictly for MODERATOR and ADMIN roles.
2. **Shared backend.** No separate API. All data comes from the existing NestJS endpoints.
3. **Desktop-first.** Responsive down to 768px (tablets), but not optimized for mobile screens.
4. **Same authentication provider.** Supabase Auth with email/password only for web login.
5. **Arabic RTL support is mandatory.** The UI framework and component library must support bidirectional text rendering.

---

*End of document.*
