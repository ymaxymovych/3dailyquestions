# Crystal Kuiper - Architecture Documentation

**Project:** Crystal Kuiper SaaS Planner  
**Type:** Full-stack TypeScript monorepo  
**Last Updated:** 2025-11-25

---

## Table of Contents
1. [System Overview](#system-overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Module Architecture](#module-architecture)
5. [Data Flow](#data-flow)
6. [Authentication & Authorization](#authentication--authorization)
7. [Integration Points](#integration-points)
8. [Future Modules](#future-modules)

---

## System Overview

Crystal Kuiper is a daily planning and reporting SaaS application that helps users:
- Track daily activities and tasks
- Manage projects and tags
- Set and monitor KPIs
- Integrate with external calendars (Google Calendar)
- Generate reports for managers

**Core Principles:**
- **Role-Based Access Control (RBAC)**: Fine-grained permissions using scopes
- **3-Layered Profile System**: Official, Actual, Instrumental data layers
- **Audit Trail**: All sensitive data access is logged
- **Modular Design**: Clear separation between backend services

---

## Technology Stack

### Frontend
- **Framework:** Next.js 14+ (App Router)
- **UI Library:** React 18+
- **Styling:** Tailwind CSS + Shadcn UI components
- **Forms:** React Hook Form
- **State Management:** React Context API
- **HTTP Client:** Axios
- **Notifications:** Sonner

### Backend
- **Framework:** NestJS
- **Language:** TypeScript
- **ORM:** Prisma
- **Database:** PostgreSQL
- **Authentication:** JWT + Passport (Local + Google OAuth)
- **Validation:** class-validator, class-transformer

### DevOps & Tools
- **Package Manager:** pnpm (monorepo)
- **Build Tool:** Turbo
- **Version Control:** Git + GitHub
- **Deployment:** (TBD)

---

## Project Structure

```
crystal-kuiper/
├── apps/
│   ├── api/                          # NestJS Backend API
│   │   ├── src/
│   │   │   ├── auth/                 # Authentication module
│   │   │   ├── user-admin/           # User Admin module (Profile, Roles, KPIs)
│   │   │   ├── daily-reports/        # Daily Reports module
│   │   │   ├── projects/             # Projects CRUD
│   │   │   ├── tags/                 # Tags CRUD
│   │   │   ├── users/                # Users management
│   │   │   ├── user-settings/        # Legacy user settings (being phased out)
│   │   │   ├── integrations/         # External integrations (Google Calendar)
│   │   │   ├── prisma/               # Prisma service
│   │   │   ├── app.module.ts
│   │   │   └── main.ts
│   │   └── package.json
│   │
│   └── web/                          # Next.js Frontend
│       ├── src/
│       │   ├── app/                  # Next.js App Router pages
│       │   │   ├── auth/             # Auth callback
│       │   │   ├── dashboard/        # Dashboard page
│       │   │   ├── daily-report/     # Daily Report page
│       │   │   ├── login/            # Login page
│       │   │   ├── register/         # Registration page
│       │   │   └── settings/         # Settings with tabs
│       │   ├── components/
│       │   │   ├── layout/           # AppLayout, Sidebar, Header
│       │   │   ├── settings/         # Settings tab components
│       │   │   └── ui/               # Shadcn UI components
│       │   ├── context/
│       │   │   └── AuthContext.tsx   # Global auth state
│       │   └── lib/
│       │       ├── api.ts            # Axios instance
│       │       ├── daily-reports.ts  # Daily Reports API client
│       │       ├── projects.ts       # Projects API client
│       │       ├── tags.ts           # Tags API client
│       │       └── user-settings.ts  # User Settings API client
│       └── package.json
│
├── packages/
│   └── database/                     # Shared Prisma package
│       ├── prisma/
│       │   ├── schema.prisma         # Database schema
│       │   └── migrations/           # Migration history
│       └── package.json
│
├── docs/                             # Project documentation
│   ├── project_context.md            # Session context & status
│   ├── ARCHITECTURE.md               # This file
│   ├── API_SPEC.md                   # API endpoints documentation
│   ├── DATABASE.md                   # Database schema documentation
│   ├── error_registry.md             # Common errors & solutions
│   ├── role_management_spec.md       # RBAC specification
│   └── user_admin_spec.md            # User Admin module spec
│
├── .gitignore
├── package.json
├── pnpm-workspace.yaml
└── turbo.json
```

---

## Module Architecture

### 1. Authentication Module (`apps/api/src/auth`)

**Responsibility:** User authentication and authorization

**Components:**
- `AuthService`: Handles registration, login, JWT token generation
- `AuthController`: Exposes auth endpoints
- `JwtStrategy`: JWT token validation
- `GoogleStrategy`: Google OAuth integration
- `JwtAuthGuard`: Protects routes requiring authentication
- `PermissionsGuard`: RBAC enforcement using scopes
- `@RequirePermissions`: Decorator for defining required scopes

**Key Features:**
- Local authentication (email + password)
- Google OAuth 2.0
- JWT tokens with user roles
- RBAC with fine-grained scopes

**Dependencies:**
- `PrismaModule` (database access)
- `UserAdminModule` (role management)
- `@nestjs/jwt`, `@nestjs/passport`, `bcrypt`, `googleapis`

---

### 2. User Admin Module (`apps/api/src/user-admin`)

**Responsibility:** User profile, roles, KPIs, workday settings, access control

**Services:**
- `ProfileService`: Manage user profiles and artifacts
- `RoleService`: CRUD operations for roles and role assignments
- `KpiService`: KPI definitions and user KPI assignments
- `AccessLogService`: Log and retrieve access logs

**Controllers:**
- `ProfileController`: `/user-admin/profile/*`
- `RoleController`: `/user-admin/roles/*`
- `KpiController`: `/user-admin/kpi/*`
- `AccessLogController`: `/user-admin/access/*`

**Key Features:**
- 3-layered profile system (Official, Actual, Instrumental)
- Artifact management with versioning
- Workday settings (start/end time, work days, timezone)
- Role-based access with scopes
- Audit trail for sensitive data access

**Dependencies:**
- `PrismaModule`

---

### 3. Daily Reports Module (`apps/api/src/daily-reports`)

**Responsibility:** Daily activity tracking and reporting

**Components:**
- `DailyReportsService`: CRUD for daily reports, pre-fill logic
- `DailyReportsController`: `/daily-reports/*`

**Key Features:**
- Create/update/delete daily reports
- Pre-fill workday times from `WorkdaySettings`
- Pre-fill KPI targets in `todayNote` from `UserKPI`
- Virtual draft report (returns empty template if no report exists)
- Project and tag associations

**Dependencies:**
- `PrismaModule`
- `UserAdminModule` (for `ProfileService`, `KpiService`)

---

### 4. Projects Module (`apps/api/src/projects`)

**Responsibility:** Project management

**Components:**
- `ProjectsService`: CRUD for projects
- `ProjectsController`: `/projects/*`

**Key Features:**
- Create, read, update, delete projects
- User ownership (projects belong to users)
- Name and description

**Dependencies:**
- `PrismaModule`

---

### 5. Tags Module (`apps/api/src/tags`)

**Responsibility:** Tag management for categorization

**Components:**
- `TagsService`: CRUD for tags
- `TagsController`: `/tags/*`

**Key Features:**
- Create, read, update, delete tags
- User ownership
- Color coding
- Used in daily reports and tasks

**Dependencies:**
- `PrismaModule`

---

### 6. Integrations Module (`apps/api/src/integrations`)

**Responsibility:** External service integrations

**Current Integrations:**
- **Google Calendar** (`calendar/`)
  - `CalendarService`: Fetch events, create events
  - `CalendarController`: `/calendar/*`

**Future Integrations:**
- Slack notifications
- Email reminders
- Analytics dashboards

**Dependencies:**
- `PrismaModule`
- `googleapis`

---

### 7. Frontend Application (`apps/web`)

**Architecture Pattern:** Page-based with shared components

**Key Pages:**
- `/` - Landing/redirect
- `/login` - Login page
- `/register` - Registration page
- `/dashboard` - User dashboard (overview)
- `/daily-report` - Daily report editor
- `/settings` - Tabbed settings interface

**Settings Tabs:**
1. **Profile** - Personal information (job title, bio, CV link)
2. **Workday** - Work hours, days, timezone
3. **Projects** - Manage projects
4. **Tags** - Manage tags
5. **KPIs** - View and set KPIs
6. **Roles** - View assigned roles
7. **Access & Security** - Request detailed access, view logs
8. **Integrations** - Google Calendar, future integrations

**Shared Layouts:**
- `AppLayout`: Main application layout (Sidebar + Header + Content)
- `SettingsLayout`: Wraps settings pages in AppLayout

**State Management:**
- `AuthContext`: Global authentication state (user, login, logout, register)

---

## Data Flow

### Authentication Flow

```
User → Login Page → POST /auth/login
                        ↓
                    AuthService.login()
                        ↓
                    Validate credentials (bcrypt)
                        ↓
                    Fetch user roles (UserRole relation)
                        ↓
                    Generate JWT token (roles included)
                        ↓
                    Return { token, user }
                        ↓
User ← AuthContext.login() ← Response
```

### Google OAuth Flow

```
User → Click "Login with Google"
    ↓
Frontend → Redirect to /auth/google (backend)
    ↓
Google OAuth Consent Screen
    ↓
Google → Callback to /auth/google/callback
    ↓
GoogleStrategy.validate()
    ↓
AuthService.validateGoogleUser()
    ↓
Find or create user + UserRole
    ↓
Generate JWT token
    ↓
Redirect to frontend with token
    ↓
AuthContext.loginWithGoogle()
```

### Daily Report Creation Flow

```
User → Daily Report Page → Fill form
    ↓
Submit → POST /daily-reports
    ↓
DailyReportsService.create()
    ↓
Fetch WorkdaySettings (pre-fill times)
    ↓
Fetch UserKPI (pre-fill todayNote)
    ↓
Create DailyReport in database
    ↓
Return created report
    ↓
User ← Update UI ← Response
```

### RBAC Permission Check Flow

```
Request → JwtAuthGuard (validate token)
    ↓
Extract user ID from JWT
    ↓
PermissionsGuard.canActivate()
    ↓
Get required scopes from @RequirePermissions decorator
    ↓
RoleService.getUserRoles(userId)
    ↓
Fetch UserRole → Role → scopes
    ↓
Check if user has all required scopes
    ↓
Allow or Deny request
```

---

## Authentication & Authorization

### JWT Token Structure

```json
{
  "userId": "cuid_here",
  "email": "user@example.com",
  "roles": ["employee", "manager"],
  "iat": 1234567890,
  "exp": 1234567890
}
```

### Available Scopes (Examples)

- `read:own-profile` - Read own user profile
- `write:own-profile` - Update own user profile
- `read:all-profiles` - Read any user profile (Admin/Manager)
- `write:all-profiles` - Update any user profile (Admin)
- `read:reports` - View daily reports
- `write:reports` - Create/update daily reports
- `delete:reports` - Delete daily reports
- `manage:roles` - Assign/remove roles (Admin)
- `read:access-logs` - View access logs (Admin/Manager)
- `read:analytics` - View analytics dashboards

### System Roles (to be seeded)

| Role     | Description                      | Default Scopes                                                                 |
|----------|----------------------------------|-------------------------------------------------------------------------------|
| Employee | Standard user                    | `read:own-profile`, `write:own-profile`, `read:reports`, `write:reports`      |
| Manager  | Team lead/supervisor             | Employee scopes + `read:all-profiles`, `read:reports:team`, `read:analytics`  |
| Owner    | Business owner                   | Manager scopes + `read:access-logs`, `write:all-profiles`                     |
| Admin    | System administrator             | All scopes + `manage:roles`, `delete:users`, `write:system-config`            |

---

## Integration Points

### Google Calendar Integration

**Purpose:** Sync daily reports with Google Calendar

**Endpoints:**
- `GET /calendar/events` - Fetch events for date range
- `POST /calendar/events` - Create calendar event

**OAuth Flow:**
1. User clicks "Connect Google Calendar" in Settings → Integrations
2. Redirect to Google OAuth consent screen
3. Google redirects back to `/auth/google/calendar/callback`
4. Backend stores refresh token in `Integration` table
5. Frontend shows "Connected" status

**Data Sync:**
- Daily reports can trigger calendar event creation
- Calendar events can be imported as daily report tasks (future feature)

---

## Future Modules

### 1. Admin Dashboard (`apps/admin-dashboard`)

**Target Users:** System Admins, Business Owners

**Features:**
- User management (CRUD, role assignment)
- System analytics (user activity, report statistics)
- Access log viewer
- Role and scope management UI
- System configuration

**Tech Stack:** Same as `apps/web` (Next.js)

**API Dependencies:** Extends existing User Admin API

---

### 2. Manager Dashboard (`apps/manager-dashboard`)

**Target Users:** Managers, Team Leads

**Features:**
- Team member reports overview
- KPI tracking across team
- Approval/feedback on reports
- Team analytics and insights
- Export reports to PDF/Excel

**Tech Stack:** Next.js or standalone React SPA

**New Backend Modules Needed:**
- `TeamManagementModule`
- `ReportApprovalModule`
- `AnalyticsModule`

---

### 3. Mobile App (`apps/mobile`)

**Target Users:** All users

**Features:**
- Quick daily report entry
- Push notifications for reminders
- Offline mode with sync
- Calendar integration

**Tech Stack:** React Native or Flutter

**API:** Consumes existing backend APIs

---

### 4. Analytics Module (`apps/api/src/analytics`)

**Responsibility:** Generate insights and statistics

**Features:**
- User productivity metrics
- KPI trend analysis
- Team performance dashboards
- Custom report generation

**Dependencies:**
- `DailyReportsModule`
- `UserAdminModule`
- `ProjectsModule`

---

## Development Guidelines

### For New Modules

1. **Backend Module:**
   - Create module in `apps/api/src/<module-name>/`
   - Follow NestJS structure: `<name>.module.ts`, `<name>.service.ts`, `<name>.controller.ts`
   - Add DTOs in `dto/` subdirectory
   - Import `PrismaModule` for database access
   - Register in `AppModule`

2. **Frontend Feature:**
   - Create page in `apps/web/src/app/<route>/`
   - Create reusable components in `apps/web/src/components/`
   - Create API client in `apps/web/src/lib/<name>.ts`
   - Use `AuthContext` for user state
   - Use Shadcn UI components for consistency

3. **Database Changes:**
   - Update `packages/database/prisma/schema.prisma`
   - Run `npx prisma migrate dev --name <migration-name>`
   - Run `npx prisma generate`
   - Update `DATABASE.md` documentation

4. **Testing:**
   - Write unit tests for services
   - Write E2E tests for critical flows
   - Test with different user roles (RBAC)

---

## Communication Between Modules

### Backend Inter-Module Communication

**Preferred:** Module imports

```typescript
// In DailyReportsModule
import { UserAdminModule } from '../user-admin/user-admin.module';

@Module({
  imports: [UserAdminModule],
  // ...
})
export class DailyReportsModule {}
```

**Services can inject each other:**

```typescript
// In DailyReportsService
constructor(
  private prisma: PrismaService,
  private profileService: ProfileService,
  private kpiService: KpiService,
) {}
```

**Avoid:** HTTP calls between backend modules (creates circular dependencies)

---

### Frontend-Backend Communication

**Pattern:** Axios API clients

```typescript
// apps/web/src/lib/daily-reports.ts
import api from './api';

export const getDailyReports = async () => {
  const response = await api.get('/daily-reports');
  return response.data;
};
```

**API Instance:** `apps/web/src/lib/api.ts` (includes auth token injection)

---

## Deployment Architecture (Future)

```
┌─────────────────┐
│   Cloudflare    │  <- DNS, CDN
└────────┬────────┘
         │
    ┌────▼─────┐
    │  Vercel  │  <- Frontend (apps/web)
    └────┬─────┘
         │ API calls
    ┌────▼─────────┐
    │   Railway    │  <- Backend (apps/api)
    └────┬─────────┘
         │
    ┌────▼──────────┐
    │  PostgreSQL   │  <- Database (Supabase or Railway)
    └───────────────┘
```

---

**For detailed API documentation, see [API_SPEC.md](./API_SPEC.md)**  
**For database schema details, see [DATABASE.md](./DATABASE.md)**
