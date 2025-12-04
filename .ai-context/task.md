# Crystal Kuiper Task Tracker

## 📌 Current Focus (Short-Term Memory)
*Last Updated: 2025-12-04T08:44:00+02:00*

**Immediate Goal**: Seed email templates → Test Email Admin UI locally → Then Real AI Integration (Whisper) OR User Profile Timeline.

**Active Context** (files relevant to current task):
- `apps/web/src/app/settings/emails/` — email admin pages
- `apps/web/src/app/api/email-templates/` — email API routes
- `packages/database/prisma/seed/seed-emails.ts` — email template seeder

## Completed Tasks
- [x] **Email Admin UI Integration** <!-- id: 25 -->
    - [x] Add Prisma models (`EmailTemplate`, `EmailLog`, `Subscriber`) to schema
    - [x] Create seed script with 14 templates (UA/EN) from `ai-advisory-admin/constants.ts`
    - [x] Run migration `20251204063533_add_email_system`
    - [x] Create API routes: `/api/email-templates`, `/api/email-templates/[id]`, `/api/email-logs`
    - [x] Create Dashboard page (`/settings/emails`)
    - [x] Create Templates list page (`/settings/emails/templates`)
    - [x] Create Template editor page with UA/EN tabs, Markdown, preview, test send
    - [x] Create Logs page (`/settings/emails/logs`)
    - [x] Create Subscribers page (`/settings/emails/subscribers`)
    - [x] Create Settings page (`/settings/emails/settings`)
    - [x] Update Settings navigation with Email Templates link
    - [x] Fix API imports (`@repo/database` instead of `@/lib/prisma`)
    - [x] Verify build passes ✅
- [x] **Super Admin MVP**: Implement `/internal` Dashboard and Impersonation <!-- id: 21 -->
- [x] **Voice Input**: Complete mock implementation with undo, duplicates prevention <!-- id: 4 -->
- [x] **Voice Recognition Settings**: Add STT Provider options to AI Config <!-- id: 12 -->

## Pending Tasks
- [ ] **Seed Email Templates**: Run `npx prisma db seed` to populate 14 templates <!-- id: 26 -->
- [ ] **Test Email Admin UI**: Navigate to `/settings/emails/` and verify all pages work
- [ ] **Real AI Integration**: Connect OpenAI Whisper API <!-- id: 11 -->
- [ ] **Super Admin**: User Profile page (Timeline, Debug) <!-- id: 23 -->

## Recent Decisions / Notes

### 2025-12-04 (08:44): Email UI Integration Complete 📧
- **Database**: Added 3 models (`EmailTemplate`, `EmailLog`, `Subscriber`) + `EmailCategory` enum.
- **Seed Script**: `seed-emails.ts` contains all 14 templates from `ai-advisory-admin/constants.ts`.
- **UI Pages**: Full admin panel at `/settings/emails/` (Dashboard, Templates, Editor, Logs, Subscribers, Settings).
- **Template Editor**: Supports UA/EN switching, Markdown toolbar, variable insertion, preview, test send modal.
- **API Pattern**: Uses `@repo/database` + mock auth pattern (same as other routes).
- **Next Steps**: Seed DB, test UI locally.

### 2025-12-04 (08:08): Super Admin MVP Complete 🛡️
- **Route Group**: Created `(super-admin)` with `/internal` base path.
- **Auth**: Simple email whitelist in `SuperAdminGuard`.
- **Dashboard**: Shows mock stats (Active Workspaces, Response Rate, Errors).
- **Impersonation**: Button triggers cookie-based session, orange border + banner.

## Known Issues / TODOs
- [ ] Voice input currently uses mock simulation (not real speech recognition)
- [ ] Super Admin uses mock data (no real DB queries yet)
- [x] Email Admin UI uses mock auth (same pattern as rest of project)
- [ ] Need to run `seed-emails.ts` to populate email templates in DB
