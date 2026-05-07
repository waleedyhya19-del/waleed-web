# Quickstart: Admin Dashboard

**Feature Branch**: `001-admin-dashboard`
**Date**: 2026-03-11

## Prerequisites

- Node.js 20+
- pnpm (latest)
- Running NestJS backend (`api/` directory) with seeded database
- Supabase project with Auth configured

## Setup

```bash
# From repository root, enter the web directory
cd web

# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env.local
```

## Environment Variables

Create `.env.local` with:

```env
# NestJS API
NEXT_PUBLIC_API_URL=http://localhost:3000

# Supabase Auth
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Development

```bash
# Start dev server (default: http://localhost:3001)
pnpm dev

# Lint
pnpm lint

# Build for production
pnpm build
pnpm start
```

## First Login

1. Ensure the backend is running and the database is seeded
   (`npx prisma db seed` in `api/`).
2. Open `http://localhost:3001` in your browser.
3. You will be redirected to `/login`.
4. Log in with the seeded admin account credentials.
5. The dashboard home page loads with summary cards.

## Key Routes

| Route              | Access         | Description            |
|--------------------|----------------|------------------------|
| `/login`           | Public         | Email/password login   |
| `/forgot-password` | Public         | Password reset request |
| `/`                | Mod/Admin      | Dashboard home         |
| `/reports`         | Mod/Admin      | Reports list           |
| `/reports/:id`     | Mod/Admin      | Report detail          |
| `/users`           | Mod/Admin      | Users list             |
| `/users/:id`       | Mod/Admin      | User detail            |
| `/users/new`       | Admin          | Create user            |
| `/moderators`      | Admin          | Moderators list        |
| `/moderators/new`  | Admin          | Create moderator       |
| `/moderators/:id`  | Admin          | Moderator detail       |
| `/settings`        | Mod/Admin      | Profile & language     |

## Verifying Functionality

1. **Auth**: Log in → verify redirect to dashboard. Log out → verify
   redirect to login. Try END_USER credentials → verify 403.
2. **Reports**: Navigate to Reports → verify table loads with
   pagination. Open a report → verify detail with photos. Update
   status → verify only valid transitions appear.
3. **Users**: Navigate to Users → verify table with search. View a
   user → verify profile and report count.
4. **Language**: Go to Settings → switch language → verify RTL/LTR
   toggle and persisted preference.
