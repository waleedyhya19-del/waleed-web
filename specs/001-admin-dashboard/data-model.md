# Data Model: Admin Dashboard

**Feature Branch**: `001-admin-dashboard`
**Date**: 2026-03-11

This document describes the frontend data model. The source of truth
is the NestJS backend Prisma schema. These types mirror the API
response shapes that the dashboard consumes.

---

## Enums

```typescript
enum Role {
  END_USER = "END_USER",
  MODERATOR = "MODERATOR",
  ADMIN = "ADMIN",
}

enum ReportStatus {
  RECEIVED = "RECEIVED",
  REVIEWING = "REVIEWING",
  ESCALATED = "ESCALATED",
  REJECTED = "REJECTED",
  RESOLVED = "RESOLVED",
  CLOSED = "CLOSED",
}

enum ReportType {
  LOST = "LOST",
  STOLEN = "STOLEN",
}

enum Language {
  AR = "AR",
  EN = "EN",
}
```

---

## Entities

### User

Represents a staff member (MODERATOR or ADMIN) or an end user whose
data is viewed in the dashboard.

| Field              | Type             | Notes                          |
|--------------------|------------------|--------------------------------|
| id                 | UUID             | Primary key                    |
| email              | string \| null   | Unique; null if soft-deleted   |
| displayName        | string           | 1-100 chars                    |
| phone              | string \| null   | E.164 format                   |
| role               | Role             | END_USER, MODERATOR, ADMIN     |
| preferredLanguage  | Language         | Default: AR                    |
| profilePhotoUrl    | string \| null   | Supabase Storage URL           |
| failedLoginAttempts| number           | Visible to admins only         |
| lockedUntil        | ISO8601 \| null  | Account lockout timestamp      |
| createdAt          | ISO8601          |                                |
| updatedAt          | ISO8601          |                                |

**Relationships**:
- Has many Reports (as `userId`)

---

### Report

A lost or stolen phone report submitted by an end user.

| Field        | Type         | Notes                           |
|--------------|--------------|---------------------------------|
| id           | UUID         | Primary key                     |
| userId       | UUID         | Foreign key → User              |
| type         | ReportType   | LOST or STOLEN                  |
| serialNumber | string       | IMEI, exactly 15 digits         |
| phoneNumber  | string       | E.164 format                    |
| description  | string\|null | Max 2000 chars                  |
| status       | ReportStatus | Default: RECEIVED               |
| createdAt    | ISO8601      |                                 |
| updatedAt    | ISO8601      |                                 |

**Relationships**:
- Belongs to User (as `user`)
- Has many ReportPhotos (as `photos`)

**State Machine** (status transitions):

```
RECEIVED  → REVIEWING, ESCALATED, REJECTED
REVIEWING → ESCALATED, REJECTED, RESOLVED
ESCALATED → RESOLVED, REJECTED
RESOLVED  → CLOSED
REJECTED  → CLOSED, REVIEWING
CLOSED    → (terminal, no transitions)
```

---

### ReportPhoto

Evidence photo attached to a report.

| Field     | Type    | Notes                    |
|-----------|---------|--------------------------|
| id        | UUID    | Primary key              |
| url       | string  | Supabase Storage URL     |
| createdAt | ISO8601 |                          |

**Relationships**:
- Belongs to Report (as `reportId`)

---

## API Response Wrappers

### Success Response

```typescript
interface ApiResponse<T> {
  statusCode: number;
  data: T;
}
```

### Paginated Response

```typescript
interface PaginatedResponse<T> {
  statusCode: number;
  data: T[];
  meta: {
    hasNextPage: boolean;
    nextCursor: string | null;
  };
}
```

### Error Response

```typescript
interface ApiError {
  statusCode: number;
  error: string;
  message: string;
  details: Array<{ field?: string; message: string }> | null;
  correlationId: string;
  timestamp: string;
}
```

---

## Pagination Parameters

```typescript
interface PaginationParams {
  cursor?: string;  // UUID from previous response
  take?: number;    // 1-100, default 20
}
```

---

## Dashboard Summary (Derived)

The dashboard home page aggregates data from multiple endpoints.
There is no single "dashboard stats" endpoint; the frontend derives
all-time counts from paginated API responses:

- **Reports by status**: `GET /api/v1/reports?status=X&take=1` per
  status (use `meta.hasNextPage` to infer presence, but exact counts
  are approximate unless the API adds a count endpoint)
- **Total users**: `GET /api/v1/users?take=1` (approximate)
- **Total moderators**: `GET /api/v1/users?role=MODERATOR&take=1`
- **Recent reports**: `GET /api/v1/reports?take=10` (most recent)

> **Known limitation (v1)**: Without a dedicated stats endpoint,
> dashboard counts may be approximate. Date range filtering on
> summary cards is deferred to v1.1. Consider requesting a backend
> `GET /api/v1/stats` endpoint for accurate counts.
