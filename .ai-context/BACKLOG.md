# 📦 BACKLOG & FUTURE IDEAS
*Passive storage. Do not process during active coding sessions to save tokens.*

## 🚀 High Priority
- [ ] **Onboarding Settings Page** (`/settings/onboarding`): 
  - Створити повноцінну Settings сторінку з **прогресом** (progress bar, percentage) та **role-adaptive чеклістами**
  - Швидкі лінки для re-configuration будь-якого кроку (Company, Personal, Team)
  - Status badges (Complete ✅ / Pending ⏳ / Skipped ⏭️) для кожного пункту
  - API endpoint для tracking прогресу: `GET /api/onboarding/status`
  - **Мета**: Значно покращить UX та професійний вигляд продукту
  - **Примітка**: Зараз НЕ робимо, виконуємо після мануального тестування візардів
- [ ] **Department Onboarding Wizard**: Separate flow for Department Heads to set up goals and teams specifically for their department.
- [ ] **E2E Testing**: Add Cypress/Playwright tests for the full wizard flow.
- [ ] **Middleware Wizard Gatekeeper**: Implement automatic redirection to wizards based on completion status (currently handled by smart redirector page).
- [ ] **Email Invite System**: Implement invite emails with role-specific onboarding links.

## 🧪 Nice to Have
- [ ] **Mobile Responsive Polish**: Fine-tune the wizard UI for mobile devices (currently optimized for desktop/tablet).
- [ ] **Dark Mode Refinement**: Ensure all wizard gradients and glassmorphism effects look perfect in dark mode.
- [ ] **Billing Integration**: Add subscription steps to the Organization Wizard.
- [ ] **Wizard Progress Persistence**: Add "Save & Resume Later" functionality to wizards.

## 💡 UX Improvements
- [ ] **Department Naming**: Improve handling of duplicate department names (validation/edit prompt instead of auto-increment).
- [ ] **User Role Detection**: Improve role detection logic in User Wizard (currently uses simple array includes).
- [ ] **TeamStep Department Selection**: Add department selection if user doesn't have departmentId assigned yet.
- [ ] **Wizard Animations**: Add smooth transitions between wizard steps.

## 🎙️ Voice Input Enhancements (Future)
- [ ] **Real STT Integration**: Replace mock with actual OpenAI Whisper API
- [ ] **Voice Input History**: Add ability to view/undo previous voice entries
- [ ] **Multi-language Support**: Enable voice recognition in Ukrainian, English, etc.
- [ ] **Voice Commands**: Add voice shortcuts like "Save report", "Clear all"
- [ ] **Confidence Indicators**: Show AI parsing confidence scores for each field
- [ ] **Voice Memo Attachment**: Allow users to attach raw audio file to report

## 🏗️ Future Modules (Architecture)
- [ ] **Super Admin MVP**:
  - [ ] Dashboard (Active Users, Reports Today, Errors).
  - [ ] Impersonation (Login as User).
  - [ ] Tenant Lookup.
- [ ] **Email System**:
  - [ ] Integrate React Email + Resend.
  - [ ] Templates: Welcome, Invite, Daily Digest.
- [ ] **Knowledge Base**:
  - [ ] Role definitions & KPI sets (JSON-based for MVP).
- [ ] **Integrations**:
  - [ ] Google Calendar Sync.
  - [ ] Slack Bot.


