# Crystal Kuiper - API Specification

**Base URL:** `http://localhost:4000` (development)  
**Version:** 1.0  
**Last Updated:** 2025-11-25

---

## Table of Contents
1. [Authentication](#authentication)
2. [User Admin](#user-admin)
3. [Daily Reports](#daily-reports)
4. [Projects](#projects)
5. [Tags](#tags)
6. [User Settings](#user-settings)
7. [Users](#users)
8. [Calendar Integration](#calendar-integration)
9. [Error Responses](#error-responses)

---

## Authentication

All endpoints (except auth endpoints) require JWT token in Authorization header:
```
Authorization: Bearer <jwt_token>
```

### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123",
  "name": "John Doe"
}
```

**Response:** `201 Created`
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "clxyz123abc",
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "2025-11-25T10:00:00.000Z"
  }
}
```

**Errors:**
- `400` - Email already exists
- `400` - Validation error (weak password, invalid email)

---

### POST /auth/login
Login with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123"
}
```

**Response:** `200 OK`
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "clxyz123abc",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

**Errors:**
- `401` - Invalid credentials

---

### GET /auth/google
Initiate Google OAuth flow (redirect endpoint).

**Response:** Redirects to Google OAuth consent screen

---

### GET /auth/google/callback
Google OAuth callback (handled by backend).

**Query Parameters:**
- `code` - Authorization code from Google

**Response:** Redirects to frontend with JWT token in URL

---

## User Admin

### Profile Management

#### GET /user-admin/profile/:userId
Get user profile by ID.

**URL Parameters:**
- `userId` - User ID (cuid)

**Required Scopes:** `read:own-profile` or `read:all-profiles`

**Response:** `200 OK`
```json
{
  "id": "clxyz123abc",
  "email": "user@example.com",
  "name": "John Doe",
  "jobTitle": "Senior Engineer",
  "department": "Engineering",
  "phone": "+380123456789",
  "bio": "Experienced software engineer...",
  "resumeUrl": "https://example.com/cv.pdf",
  "avatarUrl": "https://example.com/avatar.jpg",
  "createdAt": "2025-11-25T10:00:00.000Z"
}
```

---

#### PATCH /user-admin/profile
Update current user's profile.

**Required Scopes:** `write:own-profile`

**Request Body:**
```json
{
  "jobTitle": "Lead Engineer",
  "department": "Engineering",
  "phone": "+380987654321",
  "bio": "Updated bio...",
  "resumeUrl": "https://example.com/new-cv.pdf"
}
```

**Response:** `200 OK` (returns updated profile)

---

#### POST /user-admin/profile/artifact
Upload a profile artifact (document, certificate, etc.).

**Required Scopes:** `write:own-profile`

**Request Body:**
```json
{
  "type": "RESUME",
  "layer": "OFFICIAL",
  "title": "Engineering CV 2025",
  "content": "Full text content or URL..."
}
```

**Artifact Types:** `RESUME`, `CERTIFICATE`, `PROJECT_PORTFOLIO`, `OTHER`  
**Profile Layers:** `OFFICIAL`, `ACTUAL`, `INSTRUMENTAL`

**Response:** `201 Created`
```json
{
  "id": "clart123",
  "type": "RESUME",
  "layer": "OFFICIAL",
  "title": "Engineering CV 2025",
  "version": 1,
  "isActive": true,
  "createdAt": "2025-11-25T11:00:00.000Z"
}
```

---

### Workday Settings

#### GET /user-admin/profile/workday
Get current user's workday settings.

**Required Scopes:** `read:own-profile`

**Response:** `200 OK`
```json
{
  "id": "clwork123",
  "userId": "clxyz123abc",
  "defaultStartTime": "09:00",
  "defaultEndTime": "18:00",
  "workDays": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
  "timezone": "Europe/Kiev"
}
```

---

#### PATCH /user-admin/profile/workday
Update workday settings.

**Required Scopes:** `write:own-profile`

**Request Body:**
```json
{
  "defaultStartTime": "08:30",
  "defaultEndTime": "17:30",
  "workDays": ["Monday", "Tuesday", "Wednesday", "Thursday"],
  "timezone": "Europe/Kiev"
}
```

**Response:** `200 OK` (returns updated settings)

---

### Role Management

#### GET /user-admin/roles
List all available roles.

**Required Scopes:** `read:roles`

**Response:** `200 OK`
```json
[
  {
    "id": "clrole1",
    "name": "employee",
    "description": "Standard user",
    "scopes": ["read:own-profile", "write:own-profile", "read:reports", "write:reports"],
    "isSystem": true
  },
  {
    "id": "clrole2",
    "name": "manager",
    "description": "Team manager",
    "scopes": ["read:own-profile", "write:own-profile", "read:reports", "write:reports", "read:all-profiles", "read:analytics"],
    "isSystem": true
  }
]
```

---

#### POST /user-admin/roles
Create a new role.

**Required Scopes:** `manage:roles`

**Request Body:**
```json
{
  "name": "team-lead",
  "description": "Technical team lead",
  "scopes": ["read:own-profile", "write:own-profile", "read:reports:team"]
}
```

**Response:** `201 Created` (returns created role)

---

#### PATCH /user-admin/roles/:id
Update a role.

**Required Scopes:** `manage:roles`

**Request Body:**
```json
{
  "description": "Updated description",
  "scopes": ["read:own-profile", "write:own-profile", "read:reports", "write:reports", "read:analytics"]
}
```

**Response:** `200 OK` (returns updated role)

**Note:** Cannot modify system roles (`isSystem: true`)

---

#### DELETE /user-admin/roles/:id
Delete a role.

**Required Scopes:** `manage:roles`

**Response:** `204 No Content`

**Note:** Cannot delete system roles or roles currently assigned to users

---

#### POST /user-admin/roles/assign
Assign a role to a user.

**Required Scopes:** `manage:roles`

**Request Body:**
```json
{
  "userId": "clxyz123abc",
  "roleId": "clrole2"
}
```

**Response:** `201 Created`
```json
{
  "id": "cluserrole1",
  "userId": "clxyz123abc",
  "roleId": "clrole2",
  "assignedAt": "2025-11-25T12:00:00.000Z"
}
```

---

### KPI Management

#### GET /user-admin/kpi/my
Get current user's assigned KPIs.

**Required Scopes:** `read:own-profile`

**Response:** `200 OK`
```json
[
  {
    "id": "clukpi1",
    "kpi": {
      "id": "clkpi1",
      "name": "Code Reviews",
      "description": "Number of code reviews completed",
      "unit": "reviews"
    },
    "targetValue": "10",
    "currentValue": "7",
    "assignedAt": "2025-11-20T10:00:00.000Z"
  }
]
```

---

#### POST /user-admin/kpi/assign
Assign a KPI to a user.

**Required Scopes:** `manage:kpis`

**Request Body:**
```json
{
  "userId": "clxyz123abc",
  "kpiId": "clkpi1",
  "targetValue": "15"
}
```

**Response:** `201 Created` (returns created UserKPI)

---

### Access Logs

#### POST /user-admin/access/request-detail
Request detailed access to another user's data.

**Required Scopes:** `read:all-profiles` or `read:access-logs`

**Request Body:**
```json
{
  "targetUserId": "clother123",
  "dataType": "passport",
  "reason": "Performance review preparation"
}
```

**Response:** `201 Created`
```json
{
  "id": "cllog1",
  "userId": "clxyz123abc",
  "targetUserId": "clother123",
  "dataType": "passport",
  "action": "read",
  "reason": "Performance review preparation",
  "timestamp": "2025-11-25T13:00:00.000Z"
}
```

---

#### GET /user-admin/access/logs
Get access logs (optionally filtered).

**Required Scopes:** `read:access-logs`

**Query Parameters:**
- `userId` (optional) - Filter by requesting user
- `targetUserId` (optional) - Filter by target user
- `limit` (optional, default 50) - Number of records

**Response:** `200 OK`
```json
[
  {
    "id": "cllog1",
    "user": {
      "id": "clxyz123abc",
      "name": "John Doe"
    },
    "target": {
      "id": "clother123",
      "name": "Jane Smith"
    },
    "dataType": "passport",
    "action": "read",
    "reason": "Performance review preparation",
    "timestamp": "2025-11-25T13:00:00.000Z"
  }
]
```

---

## Daily Reports

### GET /daily-reports
Get current user's daily reports.

**Required Scopes:** `read:reports`

**Query Parameters:**
- `date` (optional) - Filter by date (YYYY-MM-DD)
- `startDate` (optional) - Range start
- `endDate` (optional) - Range end

**Response:** `200 OK`
```json
[
  {
    "id": "clreport1",
    "userId": "clxyz123abc",
    "date": "2025-11-25",
    "startTime": "09:00",
    "endTime": "18:00",
    "yesterdayNote": "Completed feature X...",
    "todayNote": "Will work on feature Y...",
    "status": "COMPLETED",
    "projects": [
      {
        "id": "clproj1",
        "name": "Website Redesign"
      }
    ],
    "tags": [
      {
        "id": "cltag1",
        "name": "Frontend",
        "color": "#3b82f6"
      }
    ],
    "createdAt": "2025-11-25T08:00:00.000Z",
    "updatedAt": "2025-11-25T18:00:00.000Z"
  }
]
```

---

### GET /daily-reports/:id
Get a specific daily report.

**Required Scopes:** `read:reports`

**Response:** `200 OK` (same structure as above)

---

### POST /daily-reports
Create a new daily report.

**Required Scopes:** `write:reports`

**Request Body:**
```json
{
  "date": "2025-11-25",
  "startTime": "09:00",
  "endTime": "18:00",
  "yesterdayNote": "Yesterday's achievements...",
  "todayNote": "Today's plan...",
  "projectIds": ["clproj1", "clproj2"],
  "tagIds": ["cltag1"]
}
```

**Response:** `201 Created` (returns created report)

**Note:** Backend automatically pre-fills:
- `startTime` and `endTime` from `WorkdaySettings`
- `todayNote` with KPI targets from `UserKPI` (if empty)

---

### PATCH /daily-reports/:id
Update a daily report.

**Required Scopes:** `write:reports`

**Request Body:** (all fields optional)
```json
{
  "startTime": "08:30",
  "endTime": "17:30",
  "yesterdayNote": "Updated achievements...",
  "todayNote": "Updated plan...",
  "status": "IN_PROGRESS"
}
```

**Response:** `200 OK` (returns updated report)

---

### DELETE /daily-reports/:id
Delete a daily report.

**Required Scopes:** `delete:reports`

**Response:** `204 No Content`

---

## Projects

### GET /projects
Get current user's projects.

**Required Scopes:** `read:own-profile`

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "clproj1",
      "name": "Website Redesign",
      "description": "Complete redesign of company website",
      "userId": "clxyz123abc",
      "createdAt": "2025-11-20T10:00:00.000Z",
      "updatedAt": "2025-11-25T10:00:00.000Z"
    }
  ]
}
```

---

### POST /projects
Create a new project.

**Required Scopes:** `write:own-profile`

**Request Body:**
```json
{
  "name": "Mobile App",
  "description": "Native mobile application for iOS and Android"
}
```

**Response:** `201 Created` (returns created project)

---

### PATCH /projects/:id
Update a project.

**Required Scopes:** `write:own-profile`

**Request Body:**
```json
{
  "name": "Mobile App v2",
  "description": "Updated description..."
}
```

**Response:** `200 OK` (returns updated project)

---

### DELETE /projects/:id
Delete a project.

**Required Scopes:** `write:own-profile`

**Response:** `204 No Content`

---

## Tags

### GET /tags
Get current user's tags.

**Required Scopes:** `read:own-profile`

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "cltag1",
      "name": "Frontend",
      "color": "#3b82f6",
      "userId": "clxyz123abc",
      "createdAt": "2025-11-20T10:00:00.000Z",
      "updatedAt": "2025-11-25T10:00:00.000Z"
    }
  ]
}
```

---

### POST /tags
Create a new tag.

**Required Scopes:** `write:own-profile`

**Request Body:**
```json
{
  "name": "Backend",
  "color": "#10b981"
}
```

**Response:** `201 Created` (returns created tag)

---

### PATCH /tags/:id
Update a tag.

**Required Scopes:** `write:own-profile`

**Request Body:**
```json
{
  "name": "Backend API",
  "color": "#059669"
}
```

**Response:** `200 OK` (returns updated tag)

---

### DELETE /tags/:id
Delete a tag.

**Required Scopes:** `write:own-profile`

**Response:** `204 No Content`

---

## User Settings (Legacy)

**Note:** This module is being phased out in favor of User Admin endpoints.

### GET /user-settings/profile
Get current user's profile.

**Response:** `200 OK`
```json
{
  "id": "clxyz123abc",
  "email": "user@example.com",
  "name": "John Doe",
  "jobTitle": "Engineer",
  "department": "Engineering",
  "bio": "...",
  "phone": "+380123456789",
  "avatarUrl": "..."
}
```

---

### PATCH /user-settings/profile
Update profile.

**Request Body:** (same structure as GET)

**Response:** `200 OK`

---

### GET /user-settings/preferences
Get user preferences.

**Response:** `200 OK`
```json
{
  "theme": "dark",
  "language": "en",
  "timezone": "Europe/Kiev"
}
```

---

### PATCH /user-settings/preferences
Update preferences.

**Request Body:** (same structure as GET)

**Response:** `200 OK`

---

### GET /user-settings/integrations
Get integration settings.

**Response:** `200 OK`
```json
[
  {
    "id": "clint1",
    "service": "google-calendar",
    "isActive": true,
    "settings": {}
  }
]
```

---

### POST /user-settings/integrations
Create or update integration.

**Request Body:**
```json
{
  "service": "google-calendar",
  "isActive": true,
  "settings": {
    "calendarId": "primary"
  }
}
```

**Response:** `200 OK`

---

## Users

### GET /users
Get all users (Admin only).

**Required Scopes:** `read:all-profiles`

**Response:** `200 OK`
```json
[
  {
    "id": "clxyz123abc",
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "2025-11-25T10:00:00.000Z"
  }
]
```

---

### GET /users/:id
Get user by ID.

**Required Scopes:** `read:all-profiles`

**Response:** `200 OK` (same as /user-admin/profile/:userId)

---

## Calendar Integration

### GET /calendar/events
Fetch Google Calendar events.

**Required Scopes:** `read:own-profile`

**Query Parameters:**
- `timeMin` - Start date-time (ISO 8601)
- `timeMax` - End date-time (ISO 8601)

**Response:** `200 OK`
```json
{
  "events": [
    {
      "id": "google_event_id",
      "summary": "Team Meeting",
      "start": "2025-11-25T14:00:00Z",
      "end": "2025-11-25T15:00:00Z",
      "description": "Weekly team sync"
    }
  ]
}
```

**Errors:**
- `400` - Google Calendar not connected
- `401` - Invalid or expired Google token

---

### POST /calendar/events
Create a Google Calendar event.

**Required Scopes:** `write:own-profile`

**Request Body:**
```json
{
  "summary": "Daily Report Review",
  "description": "Review today's achievements",
  "start": "2025-11-25T17:00:00Z",
  "end": "2025-11-25T17:30:00Z"
}
```

**Response:** `201 Created`
```json
{
  "id": "google_event_id",
  "summary": "Daily Report Review",
  "htmlLink": "https://calendar.google.com/event?eid=..."
}
```

---

## Error Responses

All error responses follow this structure:

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

### Common Status Codes

- `400 Bad Request` - Invalid input data
- `401 Unauthorized` - Missing or invalid JWT token
- `403 Forbidden` - Insufficient permissions (missing scopes)
- `404 Not Found` - Resource not found
- `409 Conflict` - Duplicate resource (e.g., email already exists)
- `500 Internal Server Error` - Unexpected server error

### Example Error Responses

**401 Unauthorized:**
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

**403 Forbidden:**
```json
{
  "statusCode": 403,
  "message": "Insufficient permissions. Required scopes: [manage:roles]"
}
```

**400 Validation Error:**
```json
{
  "statusCode": 400,
  "message": [
    "email must be an email",
    "password must be at least 8 characters"
  ],
  "error": "Bad Request"
}
```

---

## Rate Limiting

**Current:** Not implemented  
**Future:** 100 requests per minute per user

---

## Pagination

**Current:** Not implemented for most endpoints  
**Future:** Standard pagination format:

```json
{
  "data": [...],
  "meta": {
    "total": 150,
    "page": 1,
    "limit": 50,
    "totalPages": 3
  }
}
```

---

**For database schema details, see [DATABASE.md](./DATABASE.md)**  
**For architecture overview, see [ARCHITECTURE.md](./ARCHITECTURE.md)**
