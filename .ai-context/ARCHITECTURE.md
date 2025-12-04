# 🏗️ Crystal Kuiper Architecture & Roadmap

## 🧠 Core Philosophy: Modular Monolith
We are adopting a **Modular Monolith** architecture within our Next.js App Router structure. This allows us to keep everything in one repository (easy for AI & Devs) while strictly separating concerns.

### 📂 Module Structure (`apps/web/src/app`)
We will use **Route Groups** (folders with `()`) to organize modules without affecting URLs where possible, or explicit path prefixes where it makes sense.

| Module | Route Group / Path | Purpose |
| :--- | :--- | :--- |
| **Marketing** | `(marketing)/` | Public landing pages, pricing, blog. |
| **Auth** | `(auth)/` | Login, Register, Forgot Password. |
| **Onboarding** | `(onboarding)/setup-wizard` | New user/company setup flow. |
| **Platform** | `(platform)/app` | The core authenticated application. |
| **Company Admin** | `(platform)/app/admin` | Customer's admin panel (Org structure, settings). |
| **Super Admin** | `(super-admin)/internal` | **OUR** internal admin panel for support & monitoring. |

---

## 🛠️ Module Breakdown & Page Mapping

### 1. 📢 Marketing Module `(marketing)`
*Public facing, SEO optimized.*
- `/` - Landing Page (Value Prop, "Why not BI?").
- `/pricing` - Plans & Features (Future).
- `/about` - Mission & Vision.
- `/legal/*` - Terms, Privacy.

### 2. 🔐 Auth Module `(auth)`
*Authentication flows.*
- `/login` - Sign In.
- `/register` - Sign Up.
- `/auth/error` - Error handling.
- `/auth/verify` - Email verification.

### 3. 🚀 Onboarding Module `(onboarding)`
*The "Wizard" experience.*
- `/setup-wizard` - Main entry point.
- `/setup-wizard/company` - Company details.
- `/setup-wizard/personal` - User profile.
- `/setup-wizard/team` - Team creation.
- `/setup-wizard/invite` - Invite colleagues.

### 4. 📱 Platform Module `(platform)/app`
*The core product. Requires Authentication.*

#### 👤 Employee View
- `/app/my-day` - **Main Dashboard**. Daily Plan, Voice Input.
- `/app/my-day/history` - Past reports.
- `/app/profile` - User settings.

#### 👥 Team Lead View
- `/app/team` - Team Dashboard.
- `/app/team/pulse` - Who submitted reports?
- `/app/team/members/[id]` - Member details.

#### 🏢 CEO / Dept Head View
- `/app/company` - Company Overview ("Temperature").
- `/app/company/departments` - Dept list.

### 5. ⚙️ Company Admin `(platform)/app/admin`
*For our customers (Admins).*
- `/app/admin` - Dashboard.
- `/app/admin/users` - User management (Invite/Deactivate).
- `/app/admin/structure` - Departments & Teams.
- `/app/admin/settings` - Company-wide settings (Timezone, Frequency).

### 6. 📚 Knowledge Base `(platform)/app/knowledge`
*The "Brain" of the company. Roles, KPIs, Guides.*
- `/app/knowledge` - Search & Overview.
- `/app/knowledge/roles` - Role definitions (e.g., "Senior Dev").
- `/app/knowledge/kpi-profiles` - KPI sets.
- `/app/knowledge/guides` - Internal documentation.

### 7. 🔌 Integrations `(platform)/app/integrations`
*External connections.*
- `/app/integrations` - Marketplace of integrations.
- `/app/integrations/calendar` - Google/Outlook sync.
- `/app/integrations/slack` - Bot configuration.
- `/app/integrations/yaware` - Tracker connection.

### 8. 🔔 Notifications `(platform)/app/settings/notifications`
*User & System preferences.*
- `/app/settings/notifications` - User preferences (Email/Push/Telegram).
- `/app/admin/notifications` - Company-wide rules.

### 9. 📧 Email System `(shared)/emails`
*Transactional & Marketing Email Templates.*
*Not a route group, but a shared internal service/package.*
- **Templates**:
    - `welcome_owner` - Post-registration.
    - `invite_user` - Team invitation.
    - `daily_reminder` - "Time to report".
    - `daily_digest` - For Managers.
    - `weekly_digest` - For CEO.
- **Infrastructure**: React Email + Resend/SendGrid.

### 10. 🛡️ Super Admin `(super-admin)/internal`
*For US (Developers & Support). Protected by `SUPER_ADMIN` role.*

#### 📊 Monitoring (The "Pulse")
- **Dashboard**:
    - Active Workspaces Today.
    - Total Reports Submitted Today.
    - Error Rate (Last 24h).
- **Queues**: Status of Email/AI jobs.

#### 🛠️ Tools
- **Impersonation**: "Login as [User]" (Critical for support).
- **Tenant Lookup**: Search Company/User by ID/Email.
- **Feature Flags**: Toggle "Real AI", "Maintenance Mode".

#### 🔍 Logs
- **AI Logs**: Input/Output of LLM calls (for debugging quality).
- **Integration Logs**: Calendar/Slack sync status.

---

## 📝 Implementation Priority

### Phase 1: Restructuring (Current)
- [ ] Move existing pages into `(platform)/app` structure (careful with redirects).
- [ ] Establish `(super-admin)` route group.

### Phase 2: Super Admin MVP
- [ ] **Page**: `/internal/dashboard` (Simple stats).
- [ ] **Page**: `/internal/companies` (List + Search).
- [ ] **Action**: Impersonation (Login as User).

### Phase 3: Real AI & Integrations
- [ ] Connect Whisper API.
- [ ] Connect Calendar API.
