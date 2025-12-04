# 📦 BACKLOG & FUTURE IDEAS
*Passive storage. Do not process during active coding sessions to save tokens.*

## 🚀 High Priority
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
