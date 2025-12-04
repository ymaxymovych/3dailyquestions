# Onboarding Strategy Implementation: "Divide and Adapt"

## 📌 Current Focus (Short-Term Memory)
*Last Updated: 2025-12-04T04:54:00+02:00*

**Immediate Goal**: Manual testing of the implemented wizards flows (Admin, Manager, Employee).

**Active Context** (files relevant to current task):
- `apps/web/src/app/setup-wizard/organization/page.tsx`
- `apps/web/src/app/setup-wizard/user/page.tsx`
- `apps/web/src/app/setup-wizard/page.tsx`
- `apps/web/src/components/wizard/user/`

**Strategy**: "Divide and Adapt" ✅ **IMPLEMENTED**
1.  **Organization Wizard**: Company setup (Admin only) - ✅ Done
2.  **User Wizard**: Adaptive for everyone - ✅ Done
    -   **Employee**: Join Team
    -   **Manager**: Create/Manage Team
    -   **Admin**: Personal profile setup

## Phase 1: Plan & Schema
- [x] Analyze Database Schema for Roles/Teams
- [x] Define "Divide and Adapt" Strategy
- [x] Update `implementation_plan.md` with detailed flows
- [x] Verify Prisma Schema matches requirements (User fields)

## Phase 2: Organization Wizard (Refinement)
- [x] Rename/Move existing wizard to `/setup-wizard/organization`
- [x] Ensure it ONLY handles Org data (Departments, Schedule, AI)
- [x] Remove Personal steps (Job Role) from Org Wizard
- [x] Update API `api/setup/organization/status`
- [x] Create API routes for settings and AI policy

## Phase 3: User Wizard (New & Adaptive)
- [x] Create `/setup-wizard/user` structure
- [x] Implement **Welcome & Profile** step
- [x] Implement **Adaptive Team Step**:
    - [x] Logic: If Manager -> Show "Create Team" / "Manage Team"
    - [x] Logic: If Employee -> Show "Join Team" (Select from list)
- [x] Implement **Preferences** step
- [x] Update API `api/setup/user/status`
- [x] Create all API routes (teams, profile, preferences)

## Phase 4: Routing & Gatekeeper
- [x] Update `middleware` or `AuthContext` to handle redirects
    - *Implemented via Smart Redirector page `/setup-wizard/page.tsx`*
- [x] Logic: First User -> Org Wizard -> User Wizard
- [x] Logic: Invited User -> User Wizard
- [x] Logic: Existing User (new feature) -> Dashboard (or optional wizard)

## Phase 5: Verification
- [x] Run Build & Lint Checks ✅ **Build successful!**
- [ ] Test Admin Flow (New Company)
- [ ] Test Manager Flow (Head/Team Lead)
- [ ] Test Employee Flow (Join existing)

## Recent Decisions / Notes

### 2025-12-04: Complete Implementation & Build Fixes
- ✅ Successfully implemented Organization Wizard (6 steps)
- ✅ Successfully implemented User Wizard with adaptive logic (5 steps)
- ✅ Created all necessary API routes for wizards
- ✅ Fixed build errors:
  - Updated `User` interface in AuthContext (added `departmentId`, `image`, `profile`)
  - Fixed `/api/user/preferences` to use `workSchedule` JSON field
  - Added Suspense boundaries to settings pages using `useSearchParams()`
- 🎯 **Build Status**: Passing (all TypeScript errors resolved)

### Next Steps
1. Manual testing of wizard flows
2. Test edge cases (skip, navigation, errors)
3. Consider adding middleware for automatic wizard redirects
4. Possibly implement invite email system for new users

## Known Issues / TODOs
- [ ] User role detection logic in User Wizard is simplified (uses `roles` array)
- [ ] Need to implement proper middleware for wizard gatekeeper logic
- [ ] API routes created but not all backend DTO validation implemented
- [ ] TeamStep needs department selection if user doesn't have departmentId yet
