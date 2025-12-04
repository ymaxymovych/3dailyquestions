# Recovery Walkthrough: Stabilizing Build & Restoring Wizards

## 🎯 Objective
Achieve a stable build state for the `apps/web` project and restore the Organization and User wizard functionality after reverting to the last stable commit.

---

## ✅ Phase 1: Build Stability

### Issues Fixed
1. **Next.js 15 `params` Compatibility**
   - Updated API routes to handle async `params` in Next.js 15
   - Changed `params: { id: string }` → `params: Promise<{ id: string }>`
   - Fixed routes: `/api/departments/[id]/route.ts`, `/api/job-roles/[id]/route.ts`, `/api/teams/[id]/route.ts`

2. **`useSearchParams` Suspense Boundaries**
   - Wrapped all pages using `useSearchParams` in `Suspense` boundaries
   - Fixed pages:
     - `/onboarding/page.tsx`
     - `/admin/team/page.tsx`
     - `/setup-wizard/page.tsx`
     - `/dashboard/manager/page.tsx`
     - `/auth/callback/page.tsx`

3. **Prisma Schema Mismatches**
   - Fixed `ManagerDigest.create` to use `content` JSON field
   - Removed non-existent `metadata` field from `AIAdvice.create`
   - Removed `description` field from `Department.create`
   - Corrected field names in setup status routes

### Build Result
```
✓ Compiled successfully
✓ TypeScript passed
✓ 45 routes generated
```

---

## ✅ Phase 2: Database Migration

### Schema Changes
Updated `schema.prisma`:

**OrganizationSetup Model:**
```prisma
// Renamed for clarity
orgWizardCompleted    Boolean @default(false)
orgWizardSkipped      Boolean @default(false)
orgCurrentStep        Int     @default(1)
```

**User Model:**
```prisma
// New wizard tracking fields
userWizardCompleted   Boolean @default(false)
userWizardSkipped     Boolean @default(false)
userCurrentStep       Int     @default(0)
```

### Migration Applied
```bash
pnpm prisma migrate dev --name add_wizard_fields
✓ Migration applied successfully
✓ Prisma Client regenerated
```

---

## ✅ Phase 3: API Restoration

### New API Routes

#### 1. Organization Wizard Status
`/api/setup/organization/status/route.ts`
- **GET**: Fetch organization setup status, completion flags, and feature enablement
- **POST**: Update wizard state (`orgWizardCompleted`, `orgWizardSkipped`, `orgCurrentStep`)

#### 2. User Wizard Status
`/api/setup/user/status/route.ts`
- **GET**: Fetch user wizard status
- **POST**: Update user wizard state (`userWizardCompleted`, `userWizardSkipped`, `userCurrentStep`)

### Updated Routes
- `/api/setup/status/route.ts` - Updated to use new `org` prefixed field names

---

## ✅ Phase 4: UI Implementation

### Organization Wizard
`/setup-wizard/organization/page.tsx`

**Features:**
- 5-step wizard: Company Profile → Structure → Goals → Process → Finish
- Progress tracking with visual indicators
- State persistence via `/api/setup/organization/status`
- Suspense boundary for loading states
- Responsive design with gradient UI

**Steps:**
1. **Company Profile**: Name, industry, size, website
2. **Structure**: Department and team setup (redirects to `/admin/departments`)
3. **Goals**: Company objectives (redirects to `/settings/kpi`)
4. **Process**: Work schedule configuration
5. **Finish**: Completion confirmation

### User Wizard
`/setup-wizard/user/page.tsx`

**Features:**
- 5-step wizard: Welcome → Basic Info → Job Role → Preferences → Complete
- Integration with `WizardJobRoleStep` component
- Organization structure detection
- Admin role detection for conditional flows
- State persistence via `/api/setup/user/status`

**Navigation Fix:**
- Removed duplicate "Next" button on Job Role step
- `WizardJobRoleStep` has its own "Save and Continue" button
- Parent wizard hides "Next" button for step 2 (index 2)

---

## 📊 Verification

### Build Output
```
Route (app)
├ ○ /setup-wizard
├ ○ /setup-wizard/organization      ✅ NEW
├ ○ /setup-wizard/user              ✅ NEW
├ ƒ /api/setup/organization/status  ✅ NEW
├ ƒ /api/setup/user/status          ✅ NEW
├ ƒ /api/setup/status               ✅ UPDATED
```

### Key Metrics
- **Total Routes**: 45 (3 new wizard routes)
- **Build Time**: ~6s compilation + ~1s page generation
- **TypeScript**: ✅ No errors
- **Suspense Boundaries**: ✅ All pages wrapped

---

## 🔧 Technical Decisions

### 1. Field Naming Convention
- Prefixed organization wizard fields with `org` (`orgWizardCompleted`)
- Prefixed user wizard fields with `user` (`userWizardCompleted`)
- **Rationale**: Clear separation between organization and user wizard states

### 2. Suspense Strategy
- Created separate content components (e.g., `OrganizationWizardContent`)
- Exported wrapper with Suspense boundary
- **Rationale**: Cleaner separation of concerns, easier testing

### 3. Navigation Pattern
- Child components (`WizardJobRoleStep`) handle their own save logic
- Parent wizard controls overall flow
- **Rationale**: Reusable components with encapsulated logic

### 4. API Structure
- Separate routes for organization and user wizards
- Generic `/api/setup/status` for backward compatibility
- **Rationale**: Clear API boundaries, easier to maintain

---

## 📝 Files Modified

### Database
- `packages/database/prisma/schema.prisma` - Added wizard fields

### API Routes (Created)
- `/api/setup/organization/status/route.ts`
- `/api/setup/user/status/route.ts`

### API Routes (Updated)
- `/api/setup/status/route.ts`
- `/api/departments/[id]/route.ts`
- `/api/job-roles/[id]/route.ts`
- `/api/teams/[id]/route.ts`

### Pages (Created)
- `/setup-wizard/organization/page.tsx`
- `/setup-wizard/user/page.tsx`

### Pages (Updated - Suspense)
- `/onboarding/page.tsx`
- `/admin/team/page.tsx`
- `/setup-wizard/page.tsx`
- `/dashboard/manager/page.tsx`
- `/auth/callback/page.tsx`

---

## 🎉 Summary

All recovery phases completed successfully:
- ✅ **Phase 1**: Build stabilized (Next.js 15 compatibility, Suspense boundaries)
- ✅ **Phase 2**: Database migrated (wizard fields added)
- ✅ **Phase 3**: APIs restored (organization & user wizard endpoints)
- ✅ **Phase 4**: UI implemented (both wizards recreated with proper navigation)
- ✅ **Phase 5**: Build verified (45 routes, no TypeScript errors)

**Next Steps:**
- Manual testing of wizard flows
- Consider adding E2E tests for wizard completion
- Update user documentation with wizard screenshots
