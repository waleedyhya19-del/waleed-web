# API Endpoint Contracts: Admin Dashboard

**Feature Branch**: `001-admin-dashboard`
**Date**: 2026-03-11
**Source**: NestJS backend at `api/` — Swagger at `/api/docs`

This document lists every API endpoint the admin dashboard consumes,
organized by feature area. The backend is the source of truth; this
file documents the frontend's contract expectations.

---

## Base Configuration

- **Base URL**: `{API_URL}/api/v1`
- **Auth**: `Authorization: Bearer <access_token>`
- **Content-Type**: `application/json` (unless noted)
- **Rate Limit**: 60 req/min per user

---

## Authentication

| Method | Path                        | Auth     | Dashboard Use        |
|--------|-----------------------------|----------|----------------------|
| POST   | `/auth/login`               | Public   | Login page           |
| POST   | `/auth/forgot-password`     | Public   | Forgot password page |
| POST   | `/auth/reset-password`      | Public   | Reset password page  |
| POST   | `/auth/change-password`     | All      | Settings page        |
| POST   | `/auth/refresh`             | Public   | Session refresh      |
| POST   | `/auth/logout`              | All      | Logout action        |

**Not used by dashboard**: `/auth/signup`, `/auth/oauth/google`,
`/auth/whatsapp/*`, `/auth/link-email` (mobile-only flows).

### POST `/auth/login`

```typescript
// Request
{ email: string, password: string }

// Response 200
{ statusCode: 200, data: { accessToken, refreshToken, expiresIn } }

// Error 401 (locked)
// Includes Retry-After header (seconds until unlock)
```

### POST `/auth/forgot-password`

```typescript
// Request
{ email: string }

// Response 200
{ statusCode: 200, data: { message: "Password reset request accepted." } }
```

### POST `/auth/reset-password`

```typescript
// Request
{ token: string, newPassword: string }

// Response 200
{ statusCode: 200, data: { ... } }
```

### POST `/auth/change-password`

```typescript
// Request
{ currentPassword: string, newPassword: string }

// Response 200
{ statusCode: 200, data: { message: "Password changed successfully." } }
```

### POST `/auth/refresh`

```typescript
// Request
{ refreshToken: string }

// Response 200
{ statusCode: 200, data: { accessToken, refreshToken, expiresIn } }
```

### POST `/auth/logout`

```typescript
// Request: empty body
// Response 200
{ statusCode: 200, data: { message: "Logout completed successfully." } }
```

---

## Users

| Method | Path                 | Auth          | Dashboard Use              |
|--------|----------------------|---------------|----------------------------|
| GET    | `/users`             | Mod/Admin     | Users list page            |
| GET    | `/users/me`          | All           | Current user context       |
| PATCH  | `/users/me`          | All           | Settings page (profile)    |
| GET    | `/users/:id`         | Mod/Admin     | User detail page           |
| POST   | `/users`             | Admin         | Create user/moderator      |
| PATCH  | `/users/:id`         | Admin         | Edit user, change role     |
| DELETE | `/users/:id`         | Admin         | Soft-delete user           |

**Not used by dashboard**: `/users/me/photo`, `/users/me/device-token`,
`DELETE /users/me` (mobile-only flows).

### GET `/users`

```typescript
// Query params
{ cursor?: string, take?: number, search?: string, role?: Role }

// Response 200
{
  statusCode: 200,
  data: User[],
  meta: { hasNextPage: boolean, nextCursor: string | null }
}
```

### GET `/users/me`

```typescript
// Response 200
{ statusCode: 200, data: User }
```

### PATCH `/users/me`

```typescript
// Request
{ displayName?: string, phone?: string, preferredLanguage?: "AR" | "EN" }

// Response 200
{ statusCode: 200, data: User }
```

### GET `/users/:id`

```typescript
// Response 200
{ statusCode: 200, data: User }
// Includes failedLoginAttempts, lockedUntil (admin visibility)
```

### POST `/users`

```typescript
// Request
{
  email: string,
  password: string,
  displayName: string,
  phone?: string,
  role: "END_USER" | "MODERATOR" | "ADMIN",
  preferredLanguage?: "AR" | "EN"
}

// Response 201
{ statusCode: 201, data: User }
```

### PATCH `/users/:id`

```typescript
// Request
{
  displayName?: string,
  phone?: string,
  role?: Role,
  preferredLanguage?: "AR" | "EN"
}

// Response 200
{ statusCode: 200, data: User }
```

### DELETE `/users/:id`

```typescript
// Response 200
{ statusCode: 200, data: { message: "User deleted successfully." } }
```

---

## Reports

| Method | Path                    | Auth        | Dashboard Use          |
|--------|-------------------------|-------------|------------------------|
| GET    | `/reports`              | Mod/Admin   | Reports list page      |
| GET    | `/reports/:id`          | Mod/Admin   | Report detail page     |
| PATCH  | `/reports/:id`          | Admin       | Edit report fields     |
| PATCH  | `/reports/:id/status`   | Mod/Admin   | Update report status   |
| DELETE | `/reports/:id`          | Admin       | Soft-delete report     |

**Not used by dashboard**: `POST /reports`,
`POST /reports/:id/photos`, `DELETE /reports/:id/photos/:photoId`
(end-user/mobile-only flows).

### GET `/reports`

```typescript
// Query params
{
  cursor?: string,
  take?: number,
  status?: ReportStatus,
  type?: "LOST" | "STOLEN",
  search?: string  // searches serialNumber, phoneNumber
}

// Response 200
{
  statusCode: 200,
  data: ReportWithUser[],
  meta: { hasNextPage: boolean, nextCursor: string | null }
}
```

### GET `/reports/:id`

```typescript
// Response 200
{
  statusCode: 200,
  data: {
    id, userId, type, serialNumber, phoneNumber,
    description, status, photos: ReportPhoto[],
    user: { id, displayName, email, profilePhotoUrl },
    createdAt, updatedAt
  }
}
```

### PATCH `/reports/:id`

```typescript
// Request (admin only, RECEIVED status only)
{
  type?: "LOST" | "STOLEN",
  serialNumber?: string,
  phoneNumber?: string,
  description?: string
}

// Response 200
{ statusCode: 200, data: Report }
```

### PATCH `/reports/:id/status`

```typescript
// Request
{ status: ReportStatus }

// Response 200
{ statusCode: 200, data: Report }

// Error 400 if invalid transition
```

### DELETE `/reports/:id`

```typescript
// Admin only, RECEIVED status only
// Response 200
{ statusCode: 200, data: { message: "Report deleted successfully." } }
```

---

## Health

| Method | Path           | Auth   | Dashboard Use        |
|--------|----------------|--------|----------------------|
| GET    | `/health`      | Public | API connectivity check |

---

## Validation Rules Reference

| Field        | Pattern / Rule                          |
|--------------|-----------------------------------------|
| email        | RFC 5322 compliant                      |
| phone        | `^\+[1-9]\d{1,14}$` (E.164)            |
| serialNumber | `^\d{15}$` (IMEI)                       |
| password     | ≥8 chars, lowercase+uppercase+digit     |
| displayName  | 1-100 chars                             |
| description  | Max 2000 chars                          |
| take         | 1-100, default 20                       |
