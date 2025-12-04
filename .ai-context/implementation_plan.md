# Super Admin Dashboard MVP Implementation Plan

## Goal
Implement the MVP of the Internal Super Admin Dashboard to allow the team to monitor system health ("Pulse"), manage companies, and debug user issues.

## User Review Required
> [!IMPORTANT]
> **Security**: This module provides "God Mode" access. We will implement a basic `SuperAdminGuard` that checks against a hardcoded list of allowed emails (or a DB flag) for MVP.
> **Impersonation**: This feature allows logging in as any user. It will be visually distinct (Red Border) to prevent accidents.

## Proposed Changes

### 1. Infrastructure & Routing
#### [NEW] `apps/web/src/app/(super-admin)`
- Create a new Route Group to isolate admin pages from the main app.
- **Layout**: `apps/web/src/app/(super-admin)/layout.tsx`
  - Distinct theme (e.g., slate-900 sidebar).
  - Sidebar navigation: Dashboard, Companies, Users (Future).
- **Guard**: `apps/web/src/components/auth/SuperAdminGuard.tsx`
  - Checks user role/email. Redirects to `/` if not authorized.

### 2. Dashboard Page ("Pulse")
#### [NEW] `apps/web/src/app/(super-admin)/internal/page.tsx`
- **Widgets**:
  - `StatsCards`: Active Workspaces, Response Rate, Error Count.
  - `ActivityChart`: Recharts line chart for last 7 days.
  - `ProblematicCompanies`: Simple table of companies with issues.
- **Data Fetching**:
  - Create server actions `getAdminStats()` in `apps/web/src/actions/admin/dashboard.ts`.

### 3. Company Management
#### [NEW] `apps/web/src/app/(super-admin)/internal/companies/page.tsx`
- **List View**: Table with Search and Filters (Active/Trial).
- **Columns**: Name, Users, Last Active, Status.

#### [NEW] `apps/web/src/app/(super-admin)/internal/companies/[id]/page.tsx`
- **Profile View**:
  - **Header**: Actions (Login As, Send Test).
  - **Tabs**: Overview, Users, Config.
  - **Impersonation Logic**: Server Action `impersonateUser(userId)` that sets a session cookie.

### 4. Components
#### [NEW] `apps/web/src/components/admin/`
- `AdminSidebar.tsx`
- `StatCard.tsx`
- `ImpersonationBanner.tsx` (The floating "Exit" bar).

## Verification Plan

### Automated Tests
- None for MVP UI.

### Manual Verification
1.  **Access Control**: Try accessing `/internal` as a regular user (should fail). Access as Admin (should succeed).
2.  **Dashboard**: Verify stats match DB counts (mocked or real).
3.  **Impersonation**:
    - Go to Company -> Click "Login as Admin".
    - Verify Red Border appears.
    - Verify you see the app as that user.
    - Click "Exit Impersonation" -> Return to Admin.
