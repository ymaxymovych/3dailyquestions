# Audit & Recovery Plan

**Date:** 2025-12-03
**Status:** Draft for User Review

## 1. Functional Improvements (Since Last GitHub Release)

The following features were implemented and will be **lost** upon reverting to the GitHub version. They need to be re-implemented.

### Architecture
- **Two-Wizard System:** Split the single onboarding flow into `Organization Wizard` (for admins) and `User Wizard` (for employees).
- **Smart Redirects:** Updated `AuthContext` to route users based on their setup status (New Org -> Org Wizard -> User Wizard -> Dashboard).

### Database Schema
- **OrganizationSetup:** Added `orgWizardCompleted`, `orgWizardSkipped`, `orgCurrentStep`.
- **User:** Added `userWizardCompleted`, `userWizardSkipped`, `userCurrentStep`, `roleArchetypeId`.

### User Interface
- **Organization Wizard Pages:**
  - `WelcomeStep`: Intro for admins.
  - `CompanyInfoStep`: Basic org details.
  - `WorkScheduleStep`: Configuring workdays/hours.
  - `AIConfigStep`: LLM provider selection.
  - `ReviewStep`: Final confirmation.
- **User Wizard Pages:**
  - `WelcomeStep`: Personal intro.
  - `BasicInfoStep`: Profile setup.
  - `PreferencesStep`: Notification/work preferences.
  - `QuickTourStep`: Interactive guide.
- **Settings Integration:** Added "Re-run Wizard" buttons in Settings.

### API
- **Status Endpoints:** `/api/setup/organization/status` and `/api/setup/user/status`.
- **Next.js 15 Fixes:** Updated all API routes to handle `params` as a Promise (critical for the current Next.js version).

### Detailed Wizard Functionality (To Be Re-implemented)

#### Organization Wizard (`/setup-wizard/organization`)
**Purpose:** Admin-only onboarding for company setup (5 steps)

**Steps:**
1. **Company Profile** (Step 1):
   - Company name
   - Industry select (Tech/Retail/Services)
   - Company size (1-10, 11-50, 50+)
   - Website URL
   
2. **Structure** (Step 2):
   - Redirect to `/admin/departments` for creating departments/teams
   - Note: Link was broken (`/admin/structure` → should be `/admin/departments`)
   
3. **Goals** (Step 3):
   - Redirect to goals page to set company objectives
   - Note: Link was broken (`/goals` → should be `/settings/kpi`)
   
4. **Process** (Step 4):
   - Work schedule: Select work days (Mon-Sun checkboxes)
   - Start hour & End hour (time pickers)
   - Timezone selection
   
5. **Finish** (Step 5):
   - Confirmation screen
   - Completes wizard → redirects to `/dashboard/manager`

**State Management:**
- Saves progress to `/api/setup/status` with `currentStep`
- Marks completion with `wizardCompleted: true`
- Fetches existing org data from `/api/organization`

**Key Features:**
- Suspense boundary for `useSearchParams`
- Auto-saves progress on each step
- Can resume from saved step

#### User Wizard (`/setup-wizard/user`)
**Purpose:** Personal onboarding for each employee (5 steps)

**Steps:**
1. **Welcome** (Step 0):
   - Intro message
   - Lists what will be configured (Basic Info, Job Role, Preferences)
   
2. **Basic Info** (Step 1):
   - Simple "continue" step
   - Info: Profile set from registration, editable in Settings
   
3. **Job Role** (Step 2):
   - Uses `WizardJobRoleStep` component
   - Allows selection of department + role from archetypes
   - **Edge Case Handling:**
     - If `!hasOrganizationStructure`:
       - Admins: Prompted to run Org Wizard first or skip
       - Non-admins: Can skip or select generic role
   
4. **Preferences** (Step 3):
   - Placeholder step
   - Redirects to Settings → Personal for actual configuration
   
5. **Complete** (Step 4):
   - Success screen with gradient badge
   - Completes wizard → redirects to `/my-day`

**State Management:**
- Saves progress to `/api/setup/user/status` with `currentStep`
- Supports `?advance=true` and `?goBack=true` query params
- Can skip entire wizard with `skipped: true`

**Key Features:**
- Checks organization status (`structureConfigured`)
- Checks if user is admin
- Smart navigation with URL params for external redirects
- Skip button on every step

#### Third Wizard Recommendation (Department Onboarding)
**Доцільність:** ✅ **TAK, це має сенс!**

**Випадки використання:**
1. **Новий департамент створений** → Manager needs to set:
   - Department goals
   - Team structure within dept
   - Default KPIs for dept roles
   
2. **New manager призначений** → Onboarding для:
   - Understanding dept structure
   - Setting up team rituals
   - Configuring digest preferences

**Рекомендований flow:**
- Trigger: After creating dept or assigning dept manager
- Steps: Dept Goals → Team Setup → Manager Tools → Complete
- Optional for non-managers

---

## 2. Mistakes & Root Causes

The following errors led to the project instability and "broken" state.

### A. Accidental Deletion of Core APIs
- **What happened:** During the refactoring of `api/departments` to fix build errors, I inadvertently deleted or overwrote the `api/role-archetypes` folder and specific `api/departments` sub-routes.
- **Impact:** The "Job Role" step in the wizard and the "Departments" admin page stopped working (empty lists, 404 errors).
- **Specific Deleted Routes:**
  - `/api/role-archetypes/*` (Entire folder)
  - `/api/departments/archetypes`
  - `/api/departments/users-available`
  - `/api/departments/[id]/assign-user`

### B. Next.js 15 Compatibility Issues
- **What happened:** The project uses Next.js 15, where dynamic route `params` are asynchronous (`await params`). My initial code treated them as synchronous objects.
- **Impact:** `npm run build` failed repeatedly.
- **Panic Fixing:** In the rush to fix build errors, I aggressively refactored files, leading to the accidental deletions mentioned above.

### C. Broken Navigation Links
- **What happened:** I introduced links to pages that didn't exist yet or were named differently.
- **Impact:** 404 errors in the Wizard.
  - Linked to `/admin/structure` (did not exist) instead of `/admin/departments`.
  - Linked to `/goals` (did not exist) instead of `/settings/kpi`.

### D. Navigation & UI Logic Bugs
- **Double "Next" Buttons:** The `WizardBanner` component had built-in navigation buttons, and the individual wizard steps also had their own buttons. This caused confusion and UI clutter.
- **Step 0 Loop:** A logic error in the wizard's state management caused the `currentStep` to reset to 0 or fail to update in the database, trapping the user in a loop at the first step.
- **Prerendering Failures:** Pages using `useSearchParams` (like the Wizards) were not wrapped in `<Suspense>`, causing build failures.

### E. Other Technical Fixes (Included in Current Version)
- **Linter Errors:** Fixed multiple "unescaped apostrophe" errors in JSX and `any` type usage.
- **Prisma Schema:** Fixed invalid `include` statements in `api/departments/[id]/route.ts` (Prisma doesn't support certain includes in `update` depending on the schema version/relation).
- **Auth Flow:** Fixed `Google Sign In` issues in `auth/callback` where the wizard status wasn't being checked correctly.

---

## 3. Recovery Plan (Post-Revert)

**Recommendation:**
If we revert to the GitHub version, we will return to a state where **`npm run build` will likely fail** immediately due to the Next.js 15 `params` issue (unless the GitHub version was on an older Next.js or already fixed).

**Action Plan for Re-implementation:**

1.  **Phase 1: Stability (Fix Build First)**
    - Run `npm run build` immediately after revert.
    - If it fails on `params`, apply the `await params` fix to ALL existing API routes *carefully*, file by file. Do NOT delete any folders.

2.  **Phase 2: Database Migration**
    - Apply the schema changes for the Two-Wizard system.
    - Run `prisma migrate dev`.

3.  **Phase 3: API Restoration (Safe Mode)**
    - Create the NEW routes for wizard status (`/api/setup/...`).
    - **CRITICAL:** Do NOT touch `api/role-archetypes` or `api/departments` unless adding a *new* file. Verify existence of archetypes endpoint before proceeding.

4.  **Phase 4: UI Implementation**
    - Re-create the `apps/web/src/app/setup-wizard/organization` and `user` folders.
    - Copy the component code (I have it in history) but verify all import paths.
    - Ensure all `useSearchParams` components are wrapped in `<Suspense>`.

5.  **Phase 5: Integration**
    - Update `AuthContext` for redirects.
    - Verify links: Use `/admin/departments` and `/settings/kpi`.

---

## 4. Recovery Execution Plan

**Step 0: Revert (User Action)**
1.  Open terminal.
2.  Run: `git fetch origin`
3.  Run: `git reset --hard origin/main` (or the specific commit hash of the last stable version).
4.  Run: `npm install` to ensure dependencies are clean.
5.  Run: `npm run build` to **verify** the starting point is stable.

**Step 1: Database Schema (Additive Only)**
1.  Modify `schema.prisma`:
    - Add `orgWizardCompleted`, `orgWizardSkipped`, `orgCurrentStep` to `OrganizationSetup`.
    - Add `userWizardCompleted`, `userWizardSkipped`, `userCurrentStep`, `roleArchetypeId` to `User`.
2.  Run: `npx prisma migrate dev --name add_wizard_fields`.

**Step 2: API Implementation (Iterative)**
1.  **Fix Next.js 15 Params (If Build Fails):**
    - If the clean build fails due to `params`, go file-by-file.
    - Change `params: { id: string }` to `params: Promise<{ id: string }>`.
    - Add `const { id } = await params;`.
    - **DO NOT** delete or rename any files during this process.
2.  **Create New Endpoints:**
    - Create `/api/setup/organization/status/route.ts`.
    - Create `/api/setup/user/status/route.ts`.

**Step 3: UI Implementation (Re-construction)**
1.  Create folder structure: `apps/web/src/app/setup-wizard/organization` and `user`.
2.  Re-create components (Welcome, Info, etc.) from the audit history.
3.  **Crucial Fix:** Ensure `WizardBanner` does NOT have its own "Next" button if the page content also has one.
4.  **Crucial Fix:** Wrap all wizard pages in `<Suspense>`.

**Step 4: Auth Integration (Minimal Touch)**
1.  Modify `AuthContext.tsx` to add the redirect logic.
2.  **DO NOT** rewrite the entire `checkUser` function. Only append the wizard check *after* the user is confirmed logged in.

---

## 5. Lessons Learned & Actions to Avoid (Anti-Patterns)

**1. Aggressive Refactoring ("The Sledgehammer Approach")**
- **Mistake:** Deleting the entire `api/role-archetypes` folder because I thought it was redundant or "old code".
- **Rule:** Never delete an API route without verifying 0 usage across the entire codebase (grep search). If unsure, deprecate (mark as `@deprecated`), don't delete.

**2. Ignoring Build Errors**
- **Mistake:** Trying to implement new features while `npm run build` was failing.
- **Rule:** "Red-Green-Refactor". If the build is red (failing), stop adding features. Fix the build first.

**3. Touching Working Core Logic (Google Auth)**
- **Mistake:** Rewriting the `auth/callback` logic to "optimize" it, which broke the delicate state handling of Google Sign-In.
- **Rule:** If it works, don't touch it. Add *new* logic in a separate layer (e.g., a wrapper or a subsequent check) rather than modifying the core authentication handshake.

**4. Assumption of Synchronous Params**
- **Mistake:** Assuming `params` in Next.js 15 are synchronous objects.
- **Rule:** Always treat `params` and `searchParams` as Promises in Next.js 15+.

**5. Navigation Logic Duplication**
- **Mistake:** Placing navigation buttons in both the global `WizardBanner` and the local page component.
- **Rule:** Define a single source of truth for navigation control. Either the parent controls it (passing `onNext` to child), or the child controls it.
