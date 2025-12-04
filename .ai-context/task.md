# Crystal Kuiper Task Tracker

## 📌 Current Focus (Short-Term Memory)
*Last Updated: 2025-12-04T08:08:00+02:00*

**Immediate Goal**: Test Super Admin locally (`/internal`) → then Real AI Integration (Whisper) OR User Profile Timeline.

**Active Context** (files relevant to current task):
- `.ai-context/SUPER_ADMIN_GUIDE.md` — інструкція до адмінки
- `apps/web/src/app/(super-admin)/internal/` — роути адмін-панелі
- `apps/web/src/components/admin/` — компоненти адмін-панелі

## Completed Tasks
- [x] **Architecture Planning**: Defined Modular Monolith structure <!-- id: 17 -->
    - [x] Created `.ai-context/ARCHITECTURE.md` <!-- id: 18 -->
    - [x] Defined Modules: Marketing, Auth, Platform, Admin, Super Admin, Emails <!-- id: 19 -->
    - [x] Defined MVP vs V2 scope for Super Admin <!-- id: 20 -->
- [x] Implement Voice Input "Magic Draft" for Daily Report <!-- id: 4 -->
    - [x] Create `VoiceInput` component (FAB + Modal) <!-- id: 5 -->
    - [x] Create `mockAIParser` utility <!-- id: 6 -->
    - [x] Integrate into `MyReportPage` <!-- id: 7 -->
    - [x] Refactor UI to match Dark Theme Design (Red Mic, Timer, Waveform) <!-- id: 9 -->
    - [x] Update Logic to Append Text (not Overwrite) <!-- id: 10 -->
- [x] Add Voice Recognition Settings <!-- id: 12 -->
    - [x] Update `AIConfigPage` with STT Provider options <!-- id: 13 -->
    - [x] Set OpenAI Whisper as default <!-- id: 14 -->
- [x] Verify functionality (Manual Test) <!-- id: 8 -->
    - [x] Fix: Smart Merge Logic (Append vs Overwrite)
    - [x] Fix: Big Task Displacement (Move to Medium)
    - [x] Fix: Mock Logic (Usage Count & Short Record check)
- [x] **Improvement**: Add "Undo" action to Toast <!-- id: 15 -->
- [x] **Improvement**: Prevent Duplicate Entries <!-- id: 16 -->
- [x] **UX**: Handle Microphone Permissions denied state (Mock)
- [x] **Super Admin MVP**: Implement `/internal` Dashboard and Impersonation <!-- id: 21 -->
    - [x] Create `(super-admin)` route group with layout
    - [x] Create `SuperAdminGuard` (email-based auth)
    - [x] Create Dashboard page with StatsCards, ActivityChart, ProblematicCompanies
    - [x] Create Companies List page with search
    - [x] Create Company Profile page with Overview, Users, Config tabs
    - [x] Create Impersonation flow (Login As button + Exit banner)
    - [x] Add visual indicator (orange border) when impersonating
    - [x] Create `SUPER_ADMIN_GUIDE.md` documentation
    - [x] Add 50+ improvement ideas to BACKLOG.md

## Pending Tasks
- [ ] **Test Super Admin**: Manual test of `/internal` locally <!-- id: 24 -->
- [ ] **Real AI Integration**: Connect OpenAI Whisper API <!-- id: 11 -->
- [ ] **Refactoring**: Move existing pages to new `(platform)` route group structure <!-- id: 22 -->
- [ ] **Super Admin**: User Profile page (Timeline, Debug) <!-- id: 23 -->

## Recent Decisions / Notes

### 2025-12-04 (08:08): Session Summary 📋
- **Super Admin MVP** повністю реалізовано (mock data).
- Створено **SUPER_ADMIN_GUIDE.md** — інструкція для команди.
- Додано **50+ ідей** покращень у BACKLOG.md.
- **Email для доступу**: `yaroslav.maxymovych@gmail.com` (Google Sign-in).

### 2025-12-04: Super Admin MVP Complete 🛡️
- **Route Group**: Created `(super-admin)` with `/internal` base path.
- **Auth**: Simple email whitelist in `SuperAdminGuard`.
- **Dashboard**: Shows mock stats (Active Workspaces, Response Rate, Errors).
- **Companies**: List with search, Profile with tabs (Overview, Users, Config).
- **Impersonation**: Button triggers cookie-based session, orange border + banner.
- **Deferred**: Audit Log, RBAC for admins, User Profile Timeline (in Backlog).

### 2025-12-04: Architecture & MVP Strategy
- **Modular Monolith**: Adopted a strict module structure using Next.js Route Groups (`(marketing)`, `(platform)`, `(super-admin)`).
- **Super Admin MVP**:
  - **Must Have**: Impersonation ("Login as User"), Basic Dashboard (Pulse), Tenant Lookup.
  - **Later**: Complex editing, Analytics charts.
- **Email System**: Will use React Email + Resend. Templates hardcoded for MVP.
- **Voice Input**: Completed Mock phase, ready for Real AI.

### 2025-12-04: Voice Input Feature Complete 🚀
- **Smart Merge**: Implemented intelligent merging of voice data:
  - Text fields append with newlines.
  - **Big Task Strategy**: Existing Big Task is moved to "Medium Tasks" to make room for the new one.
- **Safety Nets**:
  - **Undo**: Added "Undo" button to success toast.
  - **Duplicates**: Prevented adding identical tasks.

## Known Issues / TODOs
- [ ] Voice input currently uses mock simulation (not real speech recognition)
- [ ] Super Admin uses mock data (no real DB queries yet)
- [ ] Need to implement real STT API integration using configured provider
- [ ] **Edge Case**: Handling "Yesterday" logic when editing a report from a different date
