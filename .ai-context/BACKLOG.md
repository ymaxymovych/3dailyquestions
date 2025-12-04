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
- [x] **Super Admin MVP** ✅ DONE (2025-12-04):
  - [x] **Dashboard "Pulse"**: Active Workspaces, Reports Today, Error Rate.
  - [x] **Company Profile**: Overview, Users List, Basic Settings.
  - [x] **Impersonation**: "Login As" with visual indicator.
  - [ ] **User Profile**: Event Timeline (Sent/Replied/Error), Manual Trigger.
  - [ ] **Scenario Builder (MVP)**: Edit Intro/Questions/Summary Prompt for the main flow.
  - [ ] **Logs**: Basic error table.
- [x] **Email System** (📧 UI інтегровано 2025-12-04):
  - [x] **Prisma Models**: `EmailTemplate`, `EmailLog`, `Subscriber` — DONE.
  - [x] **API Routes**: `/api/email-templates`, `/api/email-logs` — DONE.
  - [x] **UI Integration**: `/settings/emails/` (Dashboard, Templates, Editor, Logs) — DONE.
  - [ ] **Provider**: Resend (рекомендовано) — 3000 листів/міс безкоштовно.
  - [ ] **DNS Setup** для `aiadvisoryboard.me`: SPF, DKIM, DMARC записи.
  - [ ] **Real Email Sending**: Integrate Resend API for actual delivery.

### 📧 Email System Improvements
- [ ] **Template Variables Preview**: Mock preview з реальними значеннями (user_name = "Іван Петренко")
- [ ] **Email Queue**: Bull/BullMQ queue замість sync send, retry on failure, rate limiting
- [ ] **A/B Testing**: 2 версії subject line, random split, tracking open rate per version
- [ ] **Analytics Dashboard**: Open rate, click rate, bounce rate per template (tracking pixel)
- [ ] **Personalization Engine**: Auto-fill {{first_name}} з user profile
- [ ] **Localization Auto-detect**: Вибір мови по user.preferredLanguage
- [ ] **Visual Email Builder**: Drag-drop blocks замість Markdown (MJML?)
- [ ] **Scheduled Campaigns**: "Надіслати в понеділок о 10:00"
- [ ] **Segmentation**: "Тільки менеджерам з >10 людей у команді"
- [ ] **Unsubscribe Management**: One-click unsubscribe + preferences page

### 📧 Email Use Cases
- [ ] **Daily Standup Reminders**: Cron job о 9:00 "Час заповнити звіт!"
- [ ] **Digest for Managers**: Підсумок дня команди після всіх відповідей
- [ ] **Streak Notifications**: "5 днів поспіль! 🔥" після N послідовних звітів
- [ ] **Re-engagement**: "Ми сумуємо..." якщо 3+ дні без активності
- [ ] **Billing/Subscription**: Trial ending, Payment failed (Stripe webhooks)
- [ ] **Weekly Summary**: Підсумок тижня для менеджерів (п'ятниця 17:00)

### 📧 Email Edge Cases
- [ ] **Bounce Handling**: Soft bounce (retry 3x), Hard bounce (mark email invalid, stop sending)
- [ ] **Duplicate Prevention**: Не надсилати той самий шаблон двічі за 1 годину
- [ ] **Rate Limiting**: Max 100 emails/user/day, max 1000/org/day
- [ ] **Timezone Handling**: Надсилати о 9:00 *локального* часу користувача
- [ ] **Unsubscribed Users**: Перевіряти статус перед кожною відправкою
- [ ] **Email Validation**: Перевірка формату + MX record перед збереженням
- [ ] **Template Fallback**: Якщо немає UA версії → використати EN
- [ ] **Variable Missing**: Graceful degradation якщо {{var}} не передано
- [ ] **Critical Email Bypass**: Критичні листи (password reset) ігнорують unsubscribe
- [ ] **Org Disabled**: Не надсилати листи якщо організація заблокована
- [ ] **User Deleted**: Cleanup email logs при видаленні користувача (GDPR)
- [ ] **Email Change**: Invalidate old email, require re-confirmation
- [ ] **Spam Score Check**: Перевірка subject/body на spam triggers перед відправкою

### 📧 Email Metrics & KPIs
- [ ] **Delivery Rate**: % успішно доставлених (target: >98%)
- [ ] **Open Rate**: % відкритих листів (tracking pixel, target: >40%)
- [ ] **Click Rate (CTR)**: % кліків по кнопках/посиланнях (target: >15%)
- [ ] **Bounce Rate**: % відхилених (soft vs hard bounce, target: <2%)
- [ ] **Unsubscribe Rate**: % відписок від marketing листів (target: <0.5%)
- [ ] **Spam Complaint Rate**: % скарг на spam (target: <0.1%)
- [ ] **Time to Open**: Середній час від відправки до відкриття
- [ ] **Engagement Score**: Комбінований показник активності користувача

### 📧 Email Automation Flows
- [ ] **User Onboarding Flow**:
  - Day 0: Welcome Email → Day 1: "How to..." tips → Day 3: First standup nudge → Day 7: Check-in
- [ ] **Team Activation Flow**:
  - Team created → 24h: Setup reminder → 48h: Final reminder → 72h: Personal outreach
- [ ] **Re-engagement Flow**:
  - 3 days inactive → Soft reminder → 7 days → "We miss you" → 14 days → Win-back offer
- [ ] **Manager Digest Flow**:
  - Daily: Team summary → Weekly (Fri): Week review → Monthly: Trends report
- [ ] **Trial-to-Paid Flow**:
  - Day 1: Trial started → Day 7: Mid-trial tips → Day 12: Trial ending soon → Day 14: Last chance
- [ ] **Streak Celebration Flow**:
  - 5 days → Badge 🥉 → 10 days → Badge 🥈 → 30 days → Badge 🥇 → 100 days → Special 🏆

- [ ] **Knowledge Base**:
  - [ ] Role definitions & KPI sets (JSON-based for MVP).
- [ ] **Integrations**:
  - [ ] Google Calendar Sync.
  - [ ] Slack Bot.

## 🛡️ Super Admin Improvements (Post-MVP)

### 🔐 Security & Access
- [ ] **Admin RBAC**: Roles for internal team (Support = read-only, Dev = full access).
- [ ] **Audit Log**: Track admin actions (who changed what config, when).
- [ ] **Admin List from DB**: Move `SUPER_ADMIN_EMAILS` to database or env variables.
- [ ] **2FA for Admins**: Extra security layer for Super Admin access.
- [ ] **Session Timeout**: Auto-logout after inactivity.

### 📊 Dashboard Enhancements
- [ ] **Real DB Data**: Replace mock data with actual Prisma queries.
- [ ] **Date Range Picker**: Filter dashboard by custom date range.
- [ ] **Comparison Mode**: Compare metrics vs previous period (week-over-week).
- [ ] **Export to CSV**: Download dashboard data for reporting.
- [ ] **Real-time Updates**: WebSocket or polling for live metrics.
- [ ] **Custom Alerts**: Set thresholds (e.g., "notify if error rate > 5%").

### 🏢 Company Management
- [ ] **Company Search**: Implement actual search logic (currently UI only).
- [ ] **Bulk Actions**: Select multiple companies, apply action (pause, enable module).
- [ ] **Company Notes**: Internal notes for support team (e.g., "VIP client").
- [ ] **Billing Status**: Show plan, payment status, next renewal.
- [ ] **Send Test Standup**: Implement actual trigger logic.
- [ ] **Feature Flags per Company**: Toggle features without code deploy.
- [ ] **Activity Graph**: Per-company response chart.

### 👤 User Management
- [ ] **User Profile Page**: `/internal/users/[id]` with full event timeline.
- [ ] **Event Timeline**: Visual log of sent/replied/error events.
- [ ] **Manual Trigger**: "Send Standup Now" button.
- [ ] **Raw Logs Viewer**: Collapsible JSON viewer for debugging.
- [ ] **User Search**: Global search across all companies.
- [ ] **Streak Leaderboard**: Top users by streak across platform.

### 📝 Scenario Builder (Content Management)
- [ ] **Scenario Editor**: UI to edit questions/prompts without code.
- [ ] **Version History**: Track changes to scenarios.
- [ ] **A/B Testing**: Run experiments with different question sets.
- [ ] **Role-based Scenarios**: Different questions for Dev vs Manager.
- [ ] **Preview Mode**: See how scenario looks to end user.
- [ ] **Template Library**: Pre-built scenarios for common industries.

### 🔌 Integrations Dashboard
- [ ] **Integration Status**: Health check for Calendar, Slack, Yaware.
- [ ] **OAuth Token Monitor**: Alert when tokens expire.
- [ ] **Retry Failed Syncs**: Button to manually retry failed integrations.
- [ ] **Integration Logs**: Per-company integration event log.

### 📈 Analytics & Costs
- [ ] **Token Analytics**: LLM token usage per company/user.
- [ ] **Cost Calculator**: Estimated cost per user based on usage.
- [ ] **LLM Latency Tracking**: Average response time by provider.
- [ ] **Usage Trends**: Charts showing growth over time.
- [ ] **Churn Prediction**: Flag companies with declining engagement.

### 🔧 Technical Health
- [ ] **Error Log Page**: `/internal/logs` with filterable error table.
- [ ] **Queue Monitoring**: Show pending jobs (standup, LLM, email).
- [ ] **System Status Banner**: Global alert when services are degraded.
- [ ] **Error Heatmap**: Visualize errors by time and type.
- [ ] **Dependency Health**: Check external API status (OpenAI, Google, etc.).

### 🎨 UX Improvements
- [ ] **Dark Mode**: Consistent dark theme for admin (currently mixed).
- [ ] **Keyboard Shortcuts**: Quick navigation (G+D = Dashboard, G+C = Companies).
- [ ] **Recent Activity**: "Last viewed companies" quick access.
- [ ] **Favorites**: Pin frequently accessed companies.
- [ ] **Responsive Design**: Mobile-friendly admin panel.

## 📊 Super Admin Metrics & Monitoring (Detailed)
- [ ] **Subjective Value**: Track "Was this useful?" rating (1-5) per company/user.
- [ ] **Voice/Channel Metrics**:
  - [ ] Distribution by channel (Telegram vs Slack vs Web).
  - [ ] STT Error Rate & Avg Duration.
- [ ] **Technical Health**:
  - [ ] Queue Monitoring (Standup Queue, LLM Queue).
  - [ ] Error Heatmap (Time vs Error Type).
- [ ] **Retention Metrics**:
  - [ ] Streak distribution (how many users have 7+ day streaks).
  - [ ] Weekly Active Users (WAU) trend.
  - [ ] Companies with 0 activity in last 7 days.

## 🖥️ Infrastructure & Hosting
- **Development Environment**:
  - Docker on Windows 11 (домашній комп'ютер).
  - PostgreSQL в Docker container.
  - Next.js dev server (`npm run dev`).
- **Production Migration** (після завершення розробки):
  - [ ] Перенести на повноцінний сервер (VPS/Dedicated).
  - [ ] Налаштувати Docker Compose для production.
  - [ ] SSL сертифікат (Let's Encrypt).
  - [ ] Reverse proxy (Nginx/Traefik).
  - [ ] CI/CD pipeline (GitHub Actions → deploy to server).
