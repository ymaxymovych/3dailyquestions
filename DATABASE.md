# Crystal Ku

iper - Database Schema Documentation

**Database:** PostgreSQL  
**ORM:** Prisma  
**Last Updated:** 2025-11-25

---

## Table of Contents
1. [Schema Overview](#schema-overview)
2. [Core Entities](#core-entities)
3. [Access Control (RBAC)](#access-control-rbac)
4. [User Profile System](#user-profile-system)
5. [KPI System](#kpi-system)
6. [Project Management](#project-management)
7. [Daily Reports](#daily-reports)
8. [Integrations](#integrations)
9. [Indexes & Performance](#indexes--performance)
10. [Migration History](#migration-history)

---

## Schema Overview

The Crystal Kuiper database follows a **multi-tenant architecture** with these design principles:

1. **Organization-centric:** All major entities are scoped to an Organization
2. **Role-Based Access Control:** Fine-grained permissions using scopes
3. **3-Layered Profile System:** Official, Actual, Instrumental data
4. **Soft Delete:** Users can be soft-deleted (deletedAt field)
5. **Audit Trail:** Access logs for sensitive data

### Entity Relationship Diagram (High-Level)

```
Organization
    ├── Departments
    ├── Users
    │   ├── UserRoles (RBAC)
    │   ├── UserProfile
    │   ├── WorkdaySettings
    │   ├── UserKPIs
    │   ├── Artifacts
    │   ├── DailyReports
    │   └── Integrations
    ├── Projects
    │   └── UserProjects
    ├── Tags
    └── KpiDefinitions
```

---

## Core Entities

### Organization

**Purpose:** Top-level entity representing a company or business unit.

**Schema:**
```prisma
model Organization {
  id             String   @id @default(uuid())
  name           String
  timezone       String   @default("UTC")
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  
  // Relations
  departments    Department[]
  users          User[]
  projects       Project[]
  tags           Tag[]
  kpiDefinitions KpiDefinition[]
}
```

**Key Points:**
- Multi-tenant isolation: all data belongs to an organization
- Default timezone affects date/time handling across the org
- One organization can have multiple departments

---

### Department

**Purpose:** Organizational unit within a company (e.g., Engineering, HR, Sales).

**Schema:**
```prisma
model Department {
  id        String   @id @default(uuid())
  name      String
  orgId     String
  org       Organization @relation(fields: [orgId], references: [id])
  managerId String?
  hrId      String?
  
  // Relations
  users     User[]
  projects  Project[]
}
```

**Key Points:**
- Optional `managerId` and `hrId` for department leadership
- Users and Projects can be assigned to a department
- Future: Hierarchical departments (parent-child relationships)

---

### User

**Purpose:** Represents a user (employee, manager, admin) in the system.

**Schema:**
```prisma
model User {
  id           String   @id @default(uuid())
  email        String   @unique
  googleId     String?  @unique
  passwordHash String?
  fullName     String
  timezone     String   @default("UTC")
  language     Language @default(UK)
  
  orgId        String
  org          Organization @relation(fields: [orgId], references: [id])
  deptId       String?
  department   Department? @relation(fields: [deptId], references: [id])
  
  // Roles & Access
  roles        UserRole[]
  
  // Soft Delete
  deletedAt    DateTime?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  // Relations
  dailyReports DailyReport[]
  activities   Activity[]
  projectsOwned Project[]
  helpRequestsAssigned HelpRequest[]
  
  // User Settings & Admin Module
  profile         UserProfile?
  preferences     UserPreferences?
  integrations    Integration[]
  kpis            UserKPI[]
  workdaySettings WorkdaySettings?
  artifacts       Artifact[]
  userProjects    UserProject[]
}
```

**Key Fields:**
- `email` - Unique email address (used for login)
- `googleId` - Google OAuth identifier (nullable)
- `passwordHash` - bcrypt hashed password (nullable if Google auth)
- `deletedAt` - Soft delete timestamp (null = active user)
- `language` - UI language preference (UK or EN)
- `timezone` - User's local timezone

**Authentication:**
- Local: email + passwordHash
- Google OAuth: email + googleId (no password)

**Soft Delete:**
- Users are never hard-deleted (for audit trail)
- Setting `deletedAt` marks user as inactive
- Queries should filter `WHERE deletedAt IS NULL`

---

## Access Control (RBAC)

### Role

**Purpose:** Define a role with a set of permissions (scopes).

**Schema:**
```prisma
model Role {
  id          String   @id @default(uuid())
  name        String   @unique
  description String?
  scopes      String[]  // Array of permission strings
  isSystem    Boolean  @default(false)
  
  users       UserRole[]
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

**System Roles (to be seeded):**

| Name       | Description           | Scopes Example                                                      |
|------------|-----------------------|---------------------------------------------------------------------|
| `EMPLOYEE` | Standard user         | `read:own-profile`, `write:own-profile`, `read:reports`, `write:reports` |
| `MANAGER`  | Team lead             | Employee scopes + `read:all-profiles`, `read:reports:team`, `read:analytics` |
| `HR`       | Human resources       | Manager scopes + `read:sensitive-data`, `write:user-profile`       |
| `ADMIN`    | System admin          | All scopes + `manage:roles`, `delete:users`, `write:system-config` |
| `OWNER`    | Business owner        | All scopes (full access)                                            |

**Scopes Format:**
- Pattern: `<action>:<resource>:<optional-modifier>`
- Examples:
  - `read:own-profile` - Read own user profile
  - `write:all-profiles` - Edit any user's profile
  - `read:reports:team` - Read team members' reports
  - `manage:roles` - Create/update/delete roles

**Key Points:**
- `isSystem = true` - Cannot be deleted or modified (system-defined)
- Scopes are checked by `PermissionsGuard` on protected routes
- Multiple roles can be assigned to a user (via `UserRole`)

---

### UserRole

**Purpose:** Many-to-many relationship between Users and Roles.

**Schema:**
```prisma
model UserRole {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  roleId    String
  role      Role     @relation(fields: [roleId], references: [id], onDelete: Cascade)
  
  assignedBy String?
  createdAt  DateTime @default(now())
  
  @@unique([userId, roleId])
}
```

**Key Points:**
- A user can have multiple roles (e.g., EMPLOYEE + MANAGER)
- `assignedBy` tracks who assigned the role (for audit)
- Cascade delete: deleting user/role removes this assignment
- Unique constraint prevents duplicate role assignments

**Usage Example:**
```typescript
// Fetch user with roles
const user = await prisma.user.findUnique({
  where: { id: userId },
  include: {
    roles: {
      include: { role: true }
    }
  }
});

// Extract all scopes
const allScopes = user.roles.flatMap(ur => ur.role.scopes);
```

---

### AccessLog

**Purpose:** Audit trail for sensitive data access requests.

**Schema:**
```prisma
model AccessLog {
  id          String   @id @default(uuid())
  requesterId String   // Who requested access
  targetId    String   // Whose data was accessed
  reason      String   // Justification for access
  scopes      String[] // What permissions were granted
  grantedAt   DateTime @default(now())
  expiresAt   DateTime // When access expires
  createdAt   DateTime @default(now())
}
```

**Use Cases:**
- Manager requests access to employee's detailed profile
- HR reviews employee's 3-layer profile
- Admin audits who accessed sensitive data

**Key Points:**
- `requesterId` - User who made the request
- `targetId` - User whose data was accessed
- `reason` - Required justification (e.g., "Performance review")
- `expiresAt` - Temporary access expiration

---

## User Profile System

### UserProfile

**Purpose:** Extended user information (job title, bio, resume, etc.).

**Schema:**
```prisma
model UserProfile {
  id          String   @id @default(uuid())
  userId      String   @unique
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  jobTitle    String?
  department  String?
  bio         String?
  avatarUrl   String?
  phone       String?
  resumeUrl       String?
  roleDescription String?
  
  updatedAt   DateTime @updatedAt
}
```

**Key Fields:**
- `jobTitle` - Official job title
- `department` - Department name (text, not relation)
- `bio` - Short biography
- `resumeUrl` - Link to CV/resume
- `roleDescription` - Free-text role description

**One-to-One Relationship:**
- Each User has exactly one UserProfile (or none)
- Created on-demand when user updates profile

---

### Artifact

**Purpose:** Store versioned documents/artifacts for 3-layered profile system.

**Schema:**
```prisma
model Artifact {
  id          String   @id @default(uuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  type        ArtifactType
  layer       ProfileLayer
  
  title       String
  content     String?  // Text content or URL
  metadata    Json?
  
  version     Int      @default(1)
  isCurrent   Boolean  @default(true)
  
  createdAt   DateTime @default(now())
  createdBy   String?
}

enum ArtifactType {
  RESUME
  JOB_DESCRIPTION
  ROLE_DESCRIPTION
  HATS_LIST
  ONBOARDING_DOC
  OTHER
}

enum ProfileLayer {
  OFFICIAL    // Company-approved documents
  ACTUAL      // Real day-to-day work
  INSTRUMENTAL // Personal development, aspirations
}
```

**3-Layered Profile System:**

| Layer          | Description                                      | Examples                          |
|----------------|--------------------------------------------------|-----------------------------------|
| **OFFICIAL**   | Formal, company-approved documents               | Job description, official resume  |
| **ACTUAL**     | What the person actually does day-to-day         | Real role description, hats list  |
| **INSTRUMENTAL** | Personal goals, development plans, aspirations | Career goals, learning roadmap    |

**Versioning:**
- `version` - Incremented for each update
- `isCurrent = true` - The active version
- Old versions kept for history (isCurrent = false)

**Key Points:**
- Multiple artifacts per user (one for each type/layer combination)
- `metadata` can store additional structured data (JSON)
- `createdBy` tracks who uploaded (useful for manager-created artifacts)

---

### WorkdaySettings

**Purpose:** User's default workday schedule (used for pre-filling daily reports).

**Schema:**
```prisma
model WorkdaySettings {
  id           String   @id @default(uuid())
  userId       String   @unique
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  timezone     String   @default("Europe/Kyiv")
  start        String   @default("09:00")  // HH:mm format
  end          String   @default("18:00")  // HH:mm format
  breakMinutes Int      @default(60)
  workDays     Int[]    @default([1, 2, 3, 4, 5]) // 1=Monday, 7=Sunday
  
  updatedAt    DateTime @updatedAt
}
```

**Key Fields:**
- `start` / `end` - Default work hours (24-hour format)
- `breakMinutes` - Lunch/break duration
- `workDays` - Array of integers (1-7, Monday-Sunday)

**Usage:**
- Pre-fill daily report start/end times
- Calculate expected working hours
- Detect overtime or undertime

**Example `workDays`:**
- `[1, 2, 3, 4, 5]` - Monday to Friday
- `[2, 3, 4, 5, 6]` - Tuesday to Saturday

---

### UserPreferences

**Purpose:** User's global preferences (language, timezone, privacy settings).

**Schema:**
```prisma
model UserPreferences {
  id                    String   @id @default(uuid())
  userId                String   @unique
  user                  User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  language              Language @default(UK)
  timezone              String   @default("Europe/Kyiv")
  workDayStart          String   @default("09:00")
  workDayEnd            String   @default("18:00")
  isAutoBookFocus       Boolean  @default(false)
  privacyAggregatedOnly Boolean  @default(true)
  
  updatedAt             DateTime @updatedAt
}

enum Language {
  UK
  EN
}
```

**Key Fields:**
- `language` - UI language (UK = Ukrainian, EN = English)
- `privacyAggregatedOnly` - Show only aggregate stats to managers
- `isAutoBookFocus` - Auto-create focus time in calendar

**Note:**
- Some fields overlap with `WorkdaySettings` (legacy)
- Future: Consolidate into single settings model

---

## KPI System

### KpiDefinition

**Purpose:** Define a KPI metric at the organization level.

**Schema:**
```prisma
model KpiDefinition {
  id          String   @id @default(uuid())
  name        String
  unit        String
  period      KpiPeriod @default(WEEK)
  source      KpiSource @default(MANUAL)
  
  orgId       String
  org         Organization @relation(fields: [orgId], references: [id])
  
  isSystem    Boolean  @default(false)
  
  assignments UserKPI[]
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

enum KpiPeriod {
  DAY
  WEEK
  MONTH
}

enum KpiSource {
  MANUAL
  INTEGRATION
}
```

**Examples:**
- Name: "Code Reviews", Unit: "reviews", Period: WEEK
- Name: "Customer Calls", Unit: "calls", Period: DAY
- Name: "Revenue", Unit: "USD", Period: MONTH

**Key Points:**
- Organization-scoped (shared across all users in org)
- `isSystem = true` - Cannot be deleted
- `source = INTEGRATION` - Auto-populated from external tools

---

### UserKPI

**Purpose:** Assign a KPI to a user with a target value.

**Schema:**
```prisma
model UserKPI {
  id           String   @id @default(uuid())
  userId       String
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  definitionId String
  definition   KpiDefinition @relation(fields: [definitionId], references: [id])
  
  targetValue  Float
  status       KpiStatus @default(ACTIVE)
  
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

enum KpiStatus {
  ACTIVE
  PENDING
  ARCHIVED
}
```

**Key Fields:**
- `targetValue` - Goal for this KPI (e.g., 10 code reviews/week)
- `status` - ACTIVE (currently tracked), PENDING (future), ARCHIVED (past)

**Usage:**
- Daily report `todayNote` is pre-filled with KPI targets
- Manager dashboards show KPI progress
- Analytics track KPI trends over time

---

## Project Management

### Project

**Purpose:** Represent a work project (ongoing initiative or one-time task).

**Schema:**
```prisma
model Project {
  id          String   @id @default(uuid())
  name        String
  description String?
  status      ProjectStatus @default(ACTIVE)
  type        ProjectType   @default(ONGOING)
  
  deadline    DateTime?
  
  orgId       String
  org         Organization @relation(fields: [orgId], references: [id])
  deptId      String?
  department  Department? @relation(fields: [deptId], references: [id])
  ownerId     String
  owner       User @relation(fields: [ownerId], references: [id])
  
  userAssignments UserProject[]
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

enum ProjectStatus {
  DRAFT
  ACTIVE
  PAUSED
  CLOSED
}

enum ProjectType {
  ONGOING   // Long-term project (no end date)
  ONE_TIME  // Has a clear deadline
}
```

**Key Points:**
- Organization-scoped (visible across org)
- Optional department assignment
- `ownerId` - Project lead/manager
- `type` - ONGOING vs ONE_TIME (affects deadline requirement)

---

### UserProject

**Purpose:** Many-to-many relationship between Users and Projects.

**Schema:**
```prisma
model UserProject {
  id          String   @id @default(uuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  projectId   String
  project     Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  
  role        String?  // "Owner", "Member", "Contributor"
  isPinned    Boolean  @default(false)
  
  createdAt   DateTime @default(now())
  
  @@unique([userId, projectId])
}
```

**Key Fields:**
- `role` - User's role on this project (free text)
- `isPinned` - Show in user's "pinned" projects list

**Usage:**
- Daily reports can be tagged with projects
- Users see only projects they're assigned to
- Managers see all projects in their department

---

### Tag

**Purpose:** Categorize activities, reports, or tasks.

**Schema:**
```prisma
model Tag {
  id          String   @id @default(uuid())
  name        String
  color       String   @default("#808080")
  orgId       String
  org         Organization @relation(fields: [orgId], references: [id])
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@unique([orgId, name])
}
```

**Key Points:**
- Organization-scoped (shared tags across org)
- `color` - Hex color for UI display
- Unique constraint on (orgId, name) prevents duplicates

---

## Daily Reports

### DailyReport

**Purpose:** User's daily work report (achievements, plans, mood).

**Schema:**
```prisma
model DailyReport {
  id          String   @id @default(uuid())
  date        DateTime @db.Date
  userId      String
  user        User @relation(fields: [userId], references: [id])
  
  yesterdayBig    Json?
  yesterdayMedium Json?
  yesterdaySmall  Json?
  yesterdayNote   String?
  coveragePct     Int?
  
  todayBig        Json?
  todayMedium     Json?
  todaySmall      Json?
  todayNote       String?
  
  helpRequests    HelpRequest[]
  
  mood            Int?
  wellbeing       String?
  moodComment     String?
  
  status          ReportStatus @default(DRAFT)
  publishedAt     DateTime?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  activities      Activity[]
  
  @@unique([userId, date])
}

enum ReportStatus {
  DRAFT
  PUBLISHED
}
```

**Key Fields:**
- `date` - Report date (one report per user per day)
- `yesterdayBig/Medium/Small` - JSON arrays of tasks
- `yesterdayNote` - Free-text reflection on yesterday
- `todayBig/Medium/Small` - JSON arrays of planned tasks
- `todayNote` - Free-text plan for today (pre-filled with KPI targets)
- `mood` - Numeric mood score (1-10)
- `coveragePct` - Percentage of planned tasks completed

**Unique Constraint:**
- `@@unique([userId, date])` - One report per user per day

---

### HelpRequest

**Purpose:** User can request help from a colleague (tracked in daily report).

**Schema:**
```prisma
model HelpRequest {
  id          String   @id @default(uuid())
  reportId    String
  report      DailyReport @relation(fields: [reportId], references: [id], onDelete: Cascade)
  text        String
  link        String?
  assigneeId  String
  assignee    User @relation("HelpRequestsAssigned", fields: [assigneeId], references: [id])
  dueDate     DateTime
  priority    Priority @default(MEDIUM)
  status      HelpStatus @default(OPEN)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

enum Priority {
  LOW
  MEDIUM
  HIGH
}

enum HelpStatus {
  OPEN
  IN_PROGRESS
  DONE
  OVERDUE
}
```

**Key Points:**
- Tied to a daily report
- `assigneeId` - Who can provide help
- `dueDate` - When help is needed by
- Statuses track progress

---

### Activity

**Purpose:** Track activities from external integrations (calendar, time tracking).

**Schema:**
```prisma
model Activity {
  id          String   @id @default(uuid())
  source      String   // "google-calendar", "yaware", "manual"
  externalId  String?
  userId      String
  user        User @relation(fields: [userId], references: [id])
  reportId    String?
  report      DailyReport? @relation(fields: [reportId], references: [id])
  title       String?
  description String?
  startTime   DateTime?
  duration    Int?     // minutes
  metadata    Json?
  createdAt   DateTime @default(now())
}
```

**Key Points:**
- `source` - Where the activity came from
- `externalId` - ID in external system (for sync)
- Optional `reportId` - Can be linked to a daily report
- `metadata` - Flexible JSON for integration-specific data

---

## Integrations

### Integration

**Purpose:** Store OAuth credentials and settings for external services.

**Schema:**
```prisma
model Integration {
  id          String          @id @default(uuid())
  userId      String
  user        User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  type        IntegrationType
  credentials Json?
  settings    Json?
  isEnabled   Boolean         @default(false)
  createdAt   DateTime        @default(now())
  updatedAt   DateTime        @updatedAt

  @@unique([userId, type])
}

enum IntegrationType {
  YAWARE
  GMAIL
  CALENDAR
  JIRA
}
```

**Key Fields:**
- `type` - Which service (CALENDAR = Google Calendar)
- `credentials` - OAuth tokens (refresh_token, access_token)
- `settings` - Service-specific config (e.g., calendar ID)
- `isEnabled` - Toggle on/off

**Security:**
- Credentials stored as JSON (encrypted at rest in production)
- Unique constraint: one integration per user per type

---

## Indexes & Performance

### Recommended Indexes

```sql
-- User lookups
CREATE INDEX idx_user_email ON "User"(email);
CREATE INDEX idx_user_org_id ON "User"("orgId");

-- Daily report queries
CREATE INDEX idx_daily_report_user_date ON "DailyReport"("userId", date);
CREATE INDEX idx_daily_report_date ON "DailyReport"(date);

-- Access logs (audit queries)
CREATE INDEX idx_access_log_requester ON "AccessLog"("requesterId");
CREATE INDEX idx_access_log_target ON "AccessLog"("targetId");
CREATE INDEX idx_access_log_timestamp ON "AccessLog"("createdAt");

-- Role assignments
CREATE INDEX idx_user_role_user ON "UserRole"("userId");
CREATE INDEX idx_user_role_role ON "UserRole"("roleId");

-- Projects
CREATE INDEX idx_project_org ON "Project"("orgId");
CREATE INDEX idx_project_owner ON "Project"("ownerId");
```

### Query Optimization Tips

1. **Always filter by organization:** Most queries should include `orgId` filter
2. **Use unique constraints:** Leverage DB-level validation (e.g., userId + date for reports)
3. **Pagination:** Implement cursor-based pagination for large datasets
4. **Soft delete:** Always filter `deletedAt IS NULL` for active users

---

## Migration History

### Initial Migration: `20251124044348_add_google_id`
- Added `googleId` field to `User` table
- Enabled Google OAuth authentication

### User Admin Module Migration (Current)
- Added RBAC models: `Role`, `UserRole`, `AccessLog`
- Added profile models: `Artifact`, `WorkdaySettings`
- Extended KPI system: `KpiDefinition`, `UserKPI`
- Added `UserProject` for many-to-many user-project relationships

---

## Future Schema Changes

### Planned Additions

1. **Notifications Table:**
   ```prisma
   model Notification {
     id        String   @id @default(uuid())
     userId    String
     user      User     @relation(...)
     type      String
     title     String
     message   String
     isRead    Boolean  @default(false)
     createdAt DateTime @default(now())
   }
   ```

2. **Team Table:**
   ```prisma
   model Team {
     id        String @id @default(uuid())
     name      String
     orgId     String
     leaderId  String
     members   TeamMember[]
   }
   ```

3. **Advanced Analytics:**
   - `KpiSnapshot` - Historical KPI values
   - `ReportMetrics` - Aggregated report statistics
   - `UserProductivity` - Time-series productivity data

---

**For API usage, see [API_SPEC.md](./API_SPEC.md)**  
**For architecture overview, see [ARCHITECTURE.md](./ARCHITECTURE.md)**
