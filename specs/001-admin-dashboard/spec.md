# Feature Specification: Admin Dashboard

**Feature Branch**: `001-admin-dashboard`
**Created**: 2026-03-11
**Status**: Draft
**Input**: PRD-WEB.md — Admin dashboard for Telephony Mafqud moderators and administrators

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Moderator Daily Report Review (Priority: P1)

A moderator logs into the dashboard with their email and password. They
land on the dashboard home page showing summary cards (total reports,
reports by status, total users). They click a "Received" status card to
navigate to the reports list filtered by that status. They open a report,
review the photos in a zoomable gallery, read the details (serial number,
phone number, description), then select a new status from
a dropdown showing only valid transitions and click "Update." They return
to the list and proceed to the next report.

**Why this priority**: Report review is the core daily workflow for
moderators. Without it, the dashboard has no value.

**Independent Test**: A moderator can log in, view filtered reports,
open a report detail, update its status, and verify the change persists.

**Acceptance Scenarios**:

1. **Given** a moderator with valid credentials, **When** they log in,
   **Then** they see the dashboard with summary cards and recent reports.
2. **Given** the dashboard shows a "12 Received" card, **When** the
   moderator clicks it, **Then** the reports list shows only reports
   with status RECEIVED, sorted by oldest first.
3. **Given** a report with status RECEIVED, **When** the moderator opens
   the detail view, **Then** they see serial number, phone number,
   description, photos (expandable gallery), current status, and a link
   to the submitting user. *(Status history is deferred to v1.1.)*
4. **Given** a report with status RECEIVED, **When** the moderator
   selects "REVIEWING" from the status dropdown, **Then** only valid
   target statuses are shown, and after clicking "Update" the status
   changes and persists.
5. **Given** report photos exist, **When** the moderator clicks a photo,
   **Then** it opens in a zoomable gallery view. If a photo fails to
   load, a placeholder with "Image unavailable" and a retry button
   appears.

---

### User Story 2 - Admin User & Moderator Management (Priority: P2)

An admin navigates to the Users page and sees a paginated, searchable
table of all users. They can view a user's detail page (profile,
report count, account status), edit profile fields, change roles
(END_USER ↔ MODERATOR), or soft-delete an account. The admin can also
navigate to the Moderators page (admin-only) to create new moderator
accounts by providing email, display name, and optional phone. They can
edit or soft-delete moderator accounts.

**Why this priority**: User and moderator management is the second most
critical workflow. Admins need to onboard staff and manage user accounts.

**Independent Test**: An admin can list users, search/filter, view
detail, create a moderator, edit a user's role, and soft-delete a user.

**Acceptance Scenarios**:

1. **Given** an admin is logged in, **When** they navigate to Users,
   **Then** they see a paginated table of users with search by name,
   email, or phone, and sort by relevant columns.
2. **Given** the Users list, **When** the admin clicks a user, **Then**
   they see the user's profile, account status, and a link to the
   user's reports.
3. **Given** a user detail page, **When** the admin edits name or
   phone and saves, **Then** changes persist immediately. *(Email is
   read-only — not editable via the API.)*
4. **Given** a user detail page, **When** the admin changes a user's
   role from END_USER to MODERATOR, **Then** the role updates and the
   user appears in the Moderators list.
5. **Given** the admin is on the Moderators page, **When** they click
   "Create Moderator" and fill in email and display name, **Then** the
   account is created and appears in the moderators list.
6. **Given** the admin tries to delete their own account, **Then** the
   action is blocked with the message "You cannot delete your own
   account."
7. **Given** only one admin remains, **When** the admin tries to demote
   or delete that account, **Then** the action is blocked with "At
   least one admin account must exist."

---

### User Story 3 - Authentication & Session Management (Priority: P1)

A staff member (moderator or admin) navigates to the login page, enters
their email and password, and is authenticated via Supabase Auth. If the
account has role END_USER, a 403 "Access denied" message is shown. On
successful login, the user is redirected to the dashboard. Sessions
auto-refresh. After 30 minutes of inactivity, a session-expired modal
appears with a "Log in again" button. The user can log out at any time.
From the settings page, they can change their password (requiring current
password) or request a password reset via email.

**Why this priority**: Authentication is a foundational requirement.
Nothing works without it.

**Independent Test**: A moderator can log in, see a session persist
across page reloads, see the session-expired modal after timeout, log
out, and use password reset.

**Acceptance Scenarios**:

1. **Given** valid moderator credentials, **When** the user logs in,
   **Then** they are redirected to the dashboard.
2. **Given** an END_USER account, **When** they attempt to log in,
   **Then** they see "Access denied. This dashboard is for authorized
   staff only." and are not granted access.
3. **Given** an authenticated user, **When** 30 minutes of inactivity
   pass, **Then** a session-expired modal appears with a "Log in again"
   button.
4. **Given** an authenticated user, **When** they click "Logout",
   **Then** the session is cleared and they are redirected to login.
5. **Given** the forgot-password page, **When** the user enters their
   email, **Then** a password reset email is sent via Supabase Auth.
6. **Given** the settings page, **When** the user enters their current
   password and a new password, **Then** the password is changed.

---

### User Story 4 - Dashboard Home Page (Priority: P2)

An authenticated staff member lands on the dashboard and sees summary
cards showing total reports, reports grouped by status (received,
reviewing, escalated, rejected, resolved, closed), total users, and
total moderators. Below the cards, the 10 most recent reports are
displayed with status badges. Clicking a status card navigates to the
reports list pre-filtered by that status. *(Date range filtering on
summary cards is deferred to v1.1 pending a backend stats endpoint.)*

**Why this priority**: The dashboard provides situational awareness and
quick navigation, but is not strictly required for core workflows.

**Independent Test**: A user can view summary cards with correct counts,
see recent reports, and click a status card to navigate to filtered
reports.

**Acceptance Scenarios**:

1. **Given** an authenticated user on the dashboard, **When** the page
   loads, **Then** summary cards display all-time counts for reports by
   status, total users, and total moderators.
2. **Given** summary cards, **When** the user clicks the "Received"
   card, **Then** they are navigated to the reports list filtered by
   status RECEIVED.
3. **Given** the dashboard, **When** the user views the recent reports
   section, **Then** the 10 most recent reports are shown with status
   badges.

---

### User Story 5 - Language Switching (Priority: P3)

A staff member navigates to Settings and toggles the language between
Arabic and English. The entire UI re-renders in the selected language,
including navigation, labels, buttons, and date formats. The layout
direction switches between RTL (Arabic) and LTR (English). The
preference is saved to the user's profile and persists across sessions.

**Why this priority**: Bilingual support is important for usability but
is not blocking for core workflows.

**Independent Test**: A user can switch language, see the UI re-render
in the new language with correct text direction, and verify the
preference persists after logout and login.

**Acceptance Scenarios**:

1. **Given** the settings page with Arabic active, **When** the user
   toggles to English, **Then** the entire UI re-renders in English
   with LTR layout.
2. **Given** English is active, **When** the user toggles to Arabic,
   **Then** the entire UI re-renders in Arabic with RTL layout.
3. **Given** a language preference is saved, **When** the user logs out
   and logs back in, **Then** the UI loads in their saved language.
4. **Given** Arabic is active, **When** dates are displayed, **Then**
   they use the appropriate Arabic locale format.

---

### User Story 6 - Report Search & Advanced Filtering (Priority: P2)

A staff member on the reports list can search reports by IMEI or phone
number. They can filter by status and report type (lost/stolen).
Pagination is cursor-based. Clicking a report opens the detail page,
which includes a link to the report owner's profile. *(Date range
filter, user filter, and column sorting are deferred to v1.1 pending
backend API support.)*

**Why this priority**: Efficient search and filtering are critical for
high-volume moderation but build on top of the basic report list (US1).

**Independent Test**: A user can search by IMEI, apply multiple filters,
paginate through results, and navigate to a user profile from a report.

**Acceptance Scenarios**:

1. **Given** the reports list, **When** the user searches by IMEI,
   **Then** only matching reports are shown.
2. **Given** the reports list, **When** the user filters by status
   "ESCALATED" and type "stolen", **Then** only matching reports appear.
4. **Given** more results than one page, **When** the user clicks "Load
   more" or scrolls, **Then** the next page loads via cursor-based
   pagination.
5. **Given** a report detail page, **When** the user clicks the report
   owner's name, **Then** they navigate to the user's detail page.

---

### User Story 7 - Admin Report Editing & Deletion (Priority: P3)

An admin can edit report fields (serial number, phone number,
description, type) from the report detail page. An admin can soft-delete
a report after confirming via a dialog: "Are you sure you want to delete
this report? This action will hide the report from all views." Deleted
reports no longer appear in lists or search. Moderators cannot edit or
delete reports.

**Why this priority**: Admin-level report editing is less frequent than
review. Builds on the report detail view from US1.

**Independent Test**: An admin can edit report fields and save, delete a
report and confirm it disappears. A moderator cannot see edit/delete
buttons.

**Acceptance Scenarios**:

1. **Given** an admin on a report detail page, **When** they edit the
   serial number and save, **Then** the change persists.
2. **Given** an admin on a report detail page, **When** they click
   "Delete Report", **Then** a confirmation dialog appears.
3. **Given** the confirmation dialog, **When** the admin confirms,
   **Then** the report is soft-deleted and no longer appears in lists.
4. **Given** a moderator on a report detail page, **Then** edit and
   delete actions are not visible.

---

### Edge Cases

- **Invalid status transition**: The status dropdown MUST only show
  valid target statuses based on the current status. The API also
  enforces transitions, showing an error if the UI state is stale.
- **Session expiry during form submission**: If a session expires while
  a form has unsaved data, the session-expired modal MUST appear without
  clearing the form data.
- **Concurrent status updates**: Last-write-wins. The UI shows the
  updated status after refresh. No real-time conflict resolution in v1.
- **Empty states**: When no reports, users, or moderators exist, the
  UI MUST display contextual empty state messages with guidance.
- **Network errors during submission**: Show an error toast "Failed to
  save. Please try again." without clearing the form.
- **Photo load failures**: Show placeholder with "Image unavailable"
  and a retry button.
- **Moderator accessing admin-only routes**: Display a 403 page or
  redirect to dashboard.
- **Last admin protection**: System prevents deleting or demoting the
  last remaining admin account.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST authenticate users via email and password.
  Only MODERATOR and ADMIN roles are granted access. END_USER login
  attempts MUST receive a 403 response.
- **FR-002**: System MUST display a dashboard home page with summary
  cards (report counts by status, total users, total moderators).
  *(Date range filtering on summary cards is deferred to v1.1 —
  requires a dedicated backend stats/aggregation endpoint. v1 shows
  all-time counts derived from paginated API responses.)*
- **FR-003**: System MUST display the 10 most recent reports on the
  dashboard with status badges.
- **FR-004**: System MUST provide a reports list with cursor-based
  pagination, filtering (status, type), and search (IMEI, phone number).
  *(Date range filter, user filter, and column sorting are deferred to
  v1.1 — requires backend API query parameter additions.)*
- **FR-005**: System MUST display report details including serial
  number, phone number, description, photos in a zoomable gallery,
  current status, and a link to the report owner. *(Status history
  is deferred to v1.1 — requires a backend audit trail endpoint.)*
- **FR-006**: System MUST allow moderators and admins to update report
  status, showing only valid transitions per the state machine.
- **FR-007**: System MUST allow admins to edit report fields (serial
  number, phone number, description, type) only when the report is in
  RECEIVED status. Edit controls MUST be hidden for other statuses.
- **FR-008**: System MUST allow admins to soft-delete reports with a
  confirmation dialog, only when the report is in RECEIVED status.
  Delete controls MUST be hidden for other statuses.
- **FR-009**: System MUST provide a users list with cursor-based
  pagination and search (name, email, phone). Moderators see only
  end users; admins see all roles. *(Column sorting is deferred to
  v1.1 — requires backend API sort parameter support.)*
- **FR-010**: System MUST display user details (profile, account
  status, link to user's reports). *(Report count per user is deferred
  to v1.1 — requires a backend `userId` filter on reports endpoint or
  a dedicated count endpoint.)*
- **FR-011**: System MUST allow admins to create, edit, and soft-delete
  user accounts, and to assign or change roles.
- **FR-012**: System MUST provide a moderators list (admin-only) with
  the ability to create, edit, and soft-delete moderator accounts.
- **FR-013**: System MUST allow authenticated users to view and edit
  their own profile (display name, phone), change password (requiring
  current password), and switch language.
- **FR-014**: System MUST support Arabic (RTL) and English (LTR) with
  dynamic layout direction switching and persistent language preference.
- **FR-015**: System MUST enforce role-based UI rendering: moderators
  MUST NOT see admin-only actions (create, edit, delete users; manage
  moderators).
- **FR-016**: System MUST redirect unauthenticated users to the login
  page. Session timeout after 30 minutes of inactivity MUST show a
  modal without losing unsaved form data.
- **FR-017**: System MUST provide a sidebar navigation with: Dashboard,
  Reports, Users, Moderators (admin-only), Settings, and Logout.
- **FR-018**: System MUST provide a password reset flow via email.
- **FR-019**: System MUST prevent an admin from deleting their own
  account or demoting/deleting the last remaining admin.

### Key Entities

- **User**: Staff member (moderator or admin) who accesses the
  dashboard. Attributes: ID, display name, email, phone, role
  (MODERATOR, ADMIN), language preference, account status, created
  date.
- **End User**: Mobile app user whose reports are managed via the
  dashboard. Same entity as User but with role END_USER. Cannot access
  the dashboard.
- **Report**: A lost or stolen phone report submitted by an end user.
  Attributes: ID, serial number (IMEI), phone number, description,
  type (lost/stolen), status, photos, submitting user, created date,
  updated date.
- **Report Photo**: Evidence photo attached to a report. Attributes:
  ID, URL, report association.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Moderators can review a report and update its status in
  under 2 minutes from opening the report detail page.
- **SC-002**: The dashboard home page loads within 2 seconds on a
  standard broadband connection.
- **SC-003**: Page-to-page navigation completes within 500 milliseconds.
- **SC-004**: Tables render 100 rows within 1 second.
- **SC-005**: Moderator task completion rate exceeds 95% (actions
  started vs. completed without errors).
- **SC-006**: All interactive elements are reachable via keyboard
  navigation.
- **SC-007**: Text contrast meets a minimum ratio of 4.5:1.
- **SC-008**: The UI is fully functional at screen widths from 768px
  to 2560px.
- **SC-009**: Language switching re-renders the entire UI in under
  1 second with correct text direction.
- **SC-010**: End users attempting to log in are blocked with a clear
  denial message 100% of the time.

## Assumptions

1. Moderator account creation requires the admin to set a temporary
   password (API `POST /users` requires a `password` field). The new
   moderator uses "Forgot Password" on first login to set their own
   password.
2. Session storage uses Supabase client library with auto-refresh.
   Exact storage mechanism (httpOnly cookie vs. secure localStorage)
   is an implementation detail.
3. Moderator activity tracking (reports updated count) is deferred
   to v1.1 — no existing API endpoint provides this data.
4. The first admin account is created via a database seed script
   during deployment, not through the dashboard.
5. Photo thumbnails are generated server-side or by the storage
   provider. The dashboard requests appropriately sized images.
6. The shared NestJS API already supports all required query
   parameters for filtering and cursor-based pagination. Column
   sorting is deferred to v1.1 pending backend API support.
7. Dashboard summary cards show all-time counts in v1. Date range
   filtering is deferred to v1.1 (requires backend stats endpoint).
