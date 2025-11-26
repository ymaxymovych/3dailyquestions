# Project Context - Crystal Kuiper SaaS Planner

**Date:** 2025-11-25  
**Session Focus:** User Admin Module Implementation & UI Refactoring

---

## Session Objectives

### Primary Goal
Implement a comprehensive **User Admin Module** ("Single User Passport") including:
- Extended database schema for user profiles, roles, KPIs, workday settings
- Backend APIs for managing user admin data
- Frontend Settings UI refactored to a tabbed interface
- Role-based access control (RBAC) with scopes
- Integration with Daily Report system

### Secondary Goals
- Fix authentication and build errors blocking the application
- Resolve UI nesting issues in Settings layout
- Document common errors in an error registry

---

## Current State

### What Works
✅ **Database Schema**: Extended with User Admin entities (Role, UserRole, Artifact, WorkdaySettings, KpiDefinition, UserKPI, UserProject)  
✅ **Role Archetypes System**: Implemented DepartmentArchetype, RoleArchetype, and KPITemplate models for job roles (Sales SDR, AE, etc.)  
✅ **Daily Report KPI Integration**: Added DailyReportKPI model and integrated KPI input fields into Daily Report form  
✅ **Backend APIs**: Created UserAdminModule with services and controllers for Profile, Role, KPI, AccessLog  
✅ **Role Archetypes API**: Created RoleArchetypesModule with endpoints for departments and roles  
✅ **Frontend Components**: Created tab components (ProfileTab, WorkdayTab, KPITab, RolesTab, AccessTab, IntegrationsTab, ProjectsTab, TagsTab)  
✅ **Job Role Tab**: Added JobRoleTab in Settings for selecting user's job role archetype  
✅ **KPI Input Component**: Created KPIInputSection component for dynamic KPI fields in Daily Report  
✅ **Settings Layout**: Removed redundant secondary sidebar, simplified to Main Sidebar + Tabbed Content  
✅ **Error Registry**: Created `error_registry.md` documenting common errors and solutions  
✅ **RBAC Infrastructure**: Implemented `@RequirePermissions` decorator and `PermissionsGuard`  

### What's Broken / In Progress
🔴 **Tab Switching Issue**: Projects and Tags tabs are visible but clicking them doesn't switch the content view  
🟡 **Authentication**: Backend build errors were fixed, but authentication hasn't been tested end-to-end yet  
🟡 **Persistent Lint Error**: `File '@repo/typescript-config/base.json' not found` in `packages/database/tsconfig.json`  

### What's Missing
- Initial data seeding for Role Archetypes (already have seed script, need to run it)
- KPI validation and analytics (charts, trends, fact vs plan comparison)
- AI integration with KPI data for insights and recommendations
- Complete browser verification of all Settings tabs functionality
- End-to-end authentication testing (manual registration, Google OAuth)

---

## Recent Key Decisions & Design Choices

### 1. Tabbed Settings Interface
**Decision**: Replace sidebar-based navigation with a tabbed interface at `/settings`  
**Reasoning**: 
- Reduces visual clutter (no nested sidebars)
- All settings in one view, easier to navigate
- Consistent with modern UI patterns

**Migration Path**:
- General → Profile
- Work Routine → Workday
- My KPIs → KPIs
- Integrations → Integrations
- Security → Access & Security
- Projects → Projects (new tab)
- Tags → Tags (new tab)

### 2. Removing Secondary Sidebar
**Decision**: Remove the Settings-specific sidebar (General, Work Routine, etc.)  
**Reasoning**:
- User reported it as unwanted nested content
- Duplicates functionality now in tabs
- Simplifies layout: Main Sidebar → Content

### 3. Role Management Schema
**Decision**: Use separate `Role` and `UserRole` models instead of enum-based roles  
**Reasoning**:
- Flexibility: roles can be created/modified without schema changes
- Scopes: fine-grained permissions (e.g., `read:reports`, `write:users`)
- Audit trail: `AccessLog` tracks sensitive data access

### 4. Legacy Code Removal
**Decision**: Remove legacy KPI methods from `UserSettingsService` and endpoints from `UserSettingsController`  
**Reasoning**:
- Old `KPI` model was replaced with `KpiDefinition` and `UserKPI`
- New `KpiService` in `user-admin` module handles all KPI logic
- Prevents confusion and maintains single source of truth

### 5. Component Structure
**Decision**: Create separate tab components instead of inline code in `SettingsPage`  
**Reasoning**:
- Separation of concerns
- Reusability
- Easier testing and maintenance

---

## Current Blockers

### 1. Tab Switching Not Working (CRITICAL)
**Symptom**: Projects and Tags tabs are visible but clicking them doesn't switch the content  
**Possible Causes**:
- React state issue with Tabs component
- Missing `"use client"` directive
- Event handler not properly attached
- Conflicting component keys

**Next Steps**:
- Check if `ProjectsTab` and `TagsTab` have `"use client"` directive
- Verify Tabs component implementation
- Test other tabs to see if they switch correctly
- Check browser console for JavaScript errors

### 2. Authentication Not Verified
**Symptom**: Backend compiled successfully after fixes, but no end-to-end test performed  
**Risk**: Users might not be able to register or log in  
**Next Steps**:
- Test manual registration
- Test Google OAuth flow
- Verify JWT token generation includes roles

---

## Agent Reasoning & Thoughts

### Why the Tab Switching Might Be Broken
The browser subagent reported that clicking "Projects" and "Tags" tabs doesn't switch the view. This is unusual because:
1. The tabs are rendered (visible in UI)
2. The TabsContent components are defined
3. Other tabs (Profile, Workday) presumably work

**Hypothesis 1**: The `ProjectsTab` and `TagsTab` components might be missing the `"use client"` directive, causing them to be server components that don't hydrate properly.

**Hypothesis 2**: There might be a runtime error in `ProjectsTab` or `TagsTab` preventing them from rendering, but the error is caught silently.

**Hypothesis 3**: The Tabs component might have a maximum number of tabs or specific configuration requirement we're missing.

### Why We Simplified the Layout
Initially, I tried to keep both the Main Sidebar and Settings Sidebar by wrapping `SettingsLayout` in `AppLayout`. However, the user reported seeing the Main Sidebar *inside* the Settings content area (nested incorrectly).

After investigation, I realized:
1. The Settings sidebar was redundant with the new tabbed interface
2. The user explicitly wanted it removed (highlighted in red on screenshot)
3. Removing it simplifies the hierarchy: `AppLayout` → `SettingsLayout` → `SettingsPage` → Tabs

### Error Registry Philosophy
Created `error_registry.md` because this is the second time we encountered a "nested layout" issue. The registry helps:
- Document patterns of errors
- Provide solutions for future reference
- Build institutional knowledge
- Reduce time spent on repeat issues

---

## File State Summary

### New Files Created
- `apps/api/src/user-admin/user-admin.module.ts` - User Admin module definition
- `apps/api/src/user-admin/profile.service.ts` - Profile management service
- `apps/api/src/user-admin/profile.controller.ts` - Profile API endpoints
- `apps/api/src/user-admin/role.service.ts` - Role management service
- `apps/api/src/user-admin/role.controller.ts` - Role API endpoints
- `apps/api/src/user-admin/kpi.service.ts` - KPI management service
- `apps/api/src/user-admin/kpi.controller.ts` - KPI API endpoints
- `apps/api/src/user-admin/access-log.service.ts` - Access logging service
- `apps/api/src/user-admin/access-log.controller.ts` - Access log API endpoints
- `apps/api/src/auth/permissions.decorator.ts` - RBAC decorator
- `apps/api/src/auth/permissions.guard.ts` - RBAC guard
- `apps/web/src/components/settings/ProfileTab.tsx` - Profile settings tab
- `apps/web/src/components/settings/KPITab.tsx` - KPI settings tab
- `apps/web/src/components/settings/WorkdayTab.tsx` - Workday settings tab
- `apps/web/src/components/settings/RolesTab.tsx` - Roles settings tab
- `apps/web/src/components/settings/AccessTab.tsx` - Access & Security tab
- `apps/web/src/components/settings/IntegrationsTab.tsx` - Integrations tab
- `apps/web/src/components/settings/ProjectsTab.tsx` - Projects management tab
- `apps/web/src/components/settings/TagsTab.tsx` - Tags management tab
- `apps/web/src/components/ui/checkbox.tsx` - Checkbox Shadcn UI component
- `apps/web/src/components/ui/tabs.tsx` - Tabs Shadcn UI component
- `.gemini/.../error_registry.md` - Common errors registry
- `.gemini/.../role_management_spec.md` - Role management specification
- `.gemini/.../user_admin_spec.md` - User admin specification

### Modified Files
- `packages/database/prisma/schema.prisma` - Extended with User Admin models
- `apps/api/src/app.module.ts` - Import UserAdminModule
- `apps/api/src/auth/auth.module.ts` - Import UserAdminModule for PermissionsGuard
- `apps/api/src/auth/auth.service.ts` - Updated for new UserRole schema
- `apps/api/src/daily-reports/daily-reports.module.ts` - Import UserAdminModule
- `apps/api/src/daily-reports/daily-reports.service.ts` - Integrate WorkdaySettings and UserKPI
- `apps/api/src/user-settings/user-settings.service.ts` - Removed legacy KPI methods
- `apps/api/src/user-settings/user-settings.controller.ts` - Removed legacy KPI endpoints
- `apps/web/src/app/settings/layout.tsx` - Simplified to just wrap children in AppLayout (removed sidebar)
- `apps/web/src/app/settings/page.tsx` - Refactored to tabbed interface with all tabs
- `apps/web/src/app/daily-report/page.tsx` - Moved 'Add' buttons to headers, added Metrics fields

### Deleted Content
- Settings sidebar navigation (from layout.tsx)
- Legacy KPI methods in UserSettingsService
- AppLayout import from old SettingsPage (was causing double nesting)

---

## Technical Implementation Details

### Database Schema Changes
```prisma
// New Models
model Role {
  id          String     @id @default(cuid())
  name        String     @unique
  description String?
  scopes      String[]   // JSON array of permission scopes
  isSystem    Boolean    @default(false)
  UserRole    UserRole[]
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
}

model UserRole {
  id        String   @id @default(cuid())
  userId    String
  roleId    String
  assignedAt DateTime @default(now())
  assignedBy String?
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  role Role @relation(fields: [roleId], references: [id], onDelete: Cascade)
  
  @@unique([userId, roleId])
}

model Artifact {
  id          String        @id @default(cuid())
  userId      String
  type        ArtifactType
  layer       ProfileLayer
  title       String
  content     String        @db.Text
  version     Int           @default(1)
  isActive    Boolean       @default(true)
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId, type, layer])
}

model WorkdaySettings {
  id              String   @id @default(cuid())
  userId          String   @unique
  defaultStartTime String? // HH:mm format
  defaultEndTime   String? // HH:mm format
  workDays        String[] // JSON array ["Monday", "Tuesday", ...]
  timezone        String?
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model KpiDefinition {
  id          String    @id @default(cuid())
  name        String
  description String?
  unit        String?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  UserKPI UserKPI[]
  
  @@unique([name])
}

model UserKPI {
  id             String        @id @default(cuid())
  userId         String
  kpiId          String
  targetValue    String?
  currentValue   String?
  assignedAt     DateTime      @default(now())
  
  user User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  kpi  KpiDefinition @relation(fields: [kpiId], references: [id], onDelete: Cascade)
  
  @@unique([userId, kpiId])
}

model AccessLog {
  id          String   @id @default(cuid())
  userId      String
  targetUserId String
  dataType    String   // e.g., "passport", "role"
  action      String   // e.g., "read", "write"
  reason      String?
  ipAddress   String?
  userAgent   String?
  timestamp   DateTime @default(now())
  
  user   User @relation("AccessLogUser", fields: [userId], references: [id], onDelete: Cascade)
  target User @relation("AccessLogTarget", fields: [targetUserId], references: [id], onDelete: Cascade)
  
  @@index([userId])
  @@index([targetUserId])
  @@index([timestamp])
}
```

### API Endpoints
- `GET /user-admin/profile/:userId` - Get user profile
- `PATCH /user-admin/profile` - Update user profile
- `POST /user-admin/profile/artifact` - Upload artifact
- `GET /user-admin/profile/workday` - Get workday settings
- `PATCH /user-admin/profile/workday` - Update workday settings
- `GET /user-admin/roles` - List all roles
- `POST /user-admin/roles` - Create role
- `PATCH /user-admin/roles/:id` - Update role
- `DELETE /user-admin/roles/:id` - Delete role
- `POST /user-admin/roles/assign` - Assign role to user
- `GET /user-admin/kpi/my` - Get my KPIs
- `POST /user-admin/kpi/assign` - Assign KPI to user
- `POST /user-admin/access/request-detail` - Request detailed access
- `GET /user-admin/access/logs` - Get access logs

### Frontend Tab Architecture
Each tab is a standalone component that:
1. Uses `useAuth()` hook for user context
2. Manages its own state (loading, editing, form data)
3. Calls appropriate API endpoints
4. Shows toast notifications for feedback
5. Handles create/update/delete operations

---

## Git Diff

**Full diff available in:** `git_diff.txt` (242 KB)

### Change Statistics
**Total Changes:** 28 files changed, 1342 insertions(+), 683 deletions(-)

**Major File Changes:**
- `packages/database/prisma/schema.prisma`: +346 lines (User Admin schema)
- `apps/web/src/app/daily-report/page.tsx`: +704 lines (UI refactoring)
- `pnpm-lock.yaml`: +462 lines (new dependencies)
- `apps/web/package.json`: +6 lines (checkbox, tabs dependencies)

**Deleted Files:**
- `apps/web/app/favicon.ico`
- `apps/web/app/fonts/GeistMonoVF.woff`
- `apps/web/app/fonts/GeistVF.woff`
- `apps/web/app/globals.css`
- `apps/web/app/layout.tsx`
- `apps/web/app/page.module.css`
- `apps/web/app/page.tsx`
- `apps/web/eslint.config.js`
- `apps/web/next.config.js`
- `apps/web/public/file-text.svg`
- `apps/web/public/turborepo-dark.svg`
- `apps/web/public/turborepo-light.svg`

**Modified Files:**
- `apps/web/src/app/layout.tsx`
- `apps/web/src/app/login/page.tsx`
- `apps/web/src/components/layout/Header.tsx`
- `apps/web/src/components/layout/Sidebar.tsx`
- `apps/web/src/components/ui/input.tsx`
- `apps/web/src/context/AuthContext.tsx`
- `apps/web/src/lib/api.ts`
- `apps/web/src/lib/daily-reports.ts`
- `packages/database/tsconfig.json`

### For User
1. **Tab Switching**: Should I investigate the Projects/Tags tab switching issue immediately, or is there other work to prioritize?
2. **Old Sub-Pages**: Should I delete the old `/settings/general/page.tsx`, `/settings/routine/page.tsx`, etc. since they're now replaced by tabs?
3. **Authentication Testing**: Do you want to test authentication now, or should I focus on completing the Settings UI first?
4. **Initial Roles**: What should be the default scopes for each system role (Employee, Manager, Owner, Admin)?

### Technical Questions
1. Why isn't the Tabs component switching content for Projects and Tags tabs specifically?
2. Is the issue related to client/server component boundaries?
3. Should we add error boundaries to catch and display tab rendering errors?
4. Should we implement lazy loading for tab components to improve initial load time?

---

## Notes

### User Preferences
- **No Terminal Auto-Execution**: Always ask user to run terminal commands manually (terminal hangs)
- **Language**: User prefers Ukrainian for UI text in Projects/Tags pages
- **Design**: User wants clean, modern UI without redundant sidebars

### Error Patterns Observed
1. **Nested Layouts**: Wrapping components in multiple layout components causes visual duplication
2. **Implicit Any Types**: NestJS controllers need explicit type annotations for parameters
3. **Prisma Sync**: After schema changes, must run `npx prisma db push` and `npx prisma generate`
4. **Legacy Code References**: After model renames, old service methods can cause build errors

---

**End of Context Document**
