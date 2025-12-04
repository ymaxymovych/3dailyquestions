# 🛡️ Super Admin (Internal) Dashboard Specification

## 🎯 Goal
Provide the internal team (Devs, Support, Product) with a "Control Center" to monitor the health of the SaaS, debug user issues, and manage content (questions/scenarios) without code changes.

## 🏗️ Architecture
- **Route Group**: `apps/web/src/app/(super-admin)`
- **Base Path**: `/internal` (to distinguish from `/admin` which is for Company Admins)
- **Auth**: Protected by `SuperAdminGuard` (requires specific email domain or flag in DB).
- **Layout**: Sidebar navigation, distinct "Internal" theme (e.g., different header color or badge).

## 📱 Verbal Wireframes (MVP)

### 1. Dashboard: "Today's Pulse" (`/internal`)
**Goal**: Instant health check. 5-second rule: "Is the system healthy?"

**Header**:
- Title: "Crystal Kuiper Internal"
- Right: User Menu, Environment Badge (PROD/DEV)

**Top Row (Key Metrics Cards)**:
- **Active Workspaces**: [Count] (e.g., 12)
- **Scheduled Standups**: [Count] (e.g., 150)
- **Response Rate**: [%] (e.g., 65%)
- **Avg Utility Rating**: [1-5] (e.g., 4.2)
- **Errors (24h)**: [Count] (Red if > 0)

**Main Content (2 Columns)**:
- **Left (Activity)**:
  - **Chart**: "Responses Last 7 Days" (Line chart).
  - **List**: "Problematic Companies" (Top 5 with low response rate or high errors).
    - Columns: Company Name | Sent/Replied | Last Active | Status (Red/Yellow/Green).
- **Right (System Health)**:
  - **Alerts**: List of critical system warnings (LLM timeouts, Calendar Sync failures).
  - **Quick Filters**: Links to pre-filtered lists (e.g., "Companies with 0 replies", "New Signups").

---

### 2. Company Profile (`/internal/companies/[id]`)
**Goal**: "Source of Truth" for a specific client. Debug & Config.

**Header**:
- **Title**: [Company Name]
- **Subtitle**: [Domain] | [ID]
- **Status Badge**: [Trial/Active/Churned]
- **Actions**: 
  - [Login as Admin] (Impersonation) -> *Placed in "Danger Zone" dropdown or distinct secondary action area. Triggers a confirmation modal.*
  - [Send Test Standup]

**Impersonation Mode UX**:
- **Visual Indicator**: Persistent red/orange border (2px) around the entire viewport.
- **Floating Bar**: Fixed bottom-center or top-center bar: "You are viewing as [User]. [Exit Impersonation]".
- **Security**: Session cookie flag `is_impersonating=true`.

**Resilience Strategy**:
- **Error Boundaries**: Wrap Dashboard widgets in individual Error Boundaries. If one chart fails, the rest of the page loads.
- **System Status**: If DB/LLM is down, show a global banner in Admin, but allow access to static logs if possible.

**Tabs**:
1.  **Overview**:
    - **Stats**: Users Count, Active Today, Streak.
    - **Activity Chart**: Responses over last 14 days.
    - **Recent Days**: Table of last 7 days (Date | Sent | Replied | Errors).
2.  **Users**:
    - Table of users in this company.
    - Columns: Name | Email | Role | Last Reply | Streak | Status.
    - Action: Click row to go to User Profile.
3.  **Config**:
    - **Timezone**: [Dropdown]
    - **Schedule**: Morning [Time], Evening [Time].
    - **Modules**: Toggles for [Voice Input], [Big Task], [Weekly Review].
    - **Scenarios**: Toggle [Standard Daily Flow] (On/Off).

---

### 3. User Profile (`/internal/users/[id]`)
**Goal**: Deep debug for "Why didn't I get a message?" support tickets.

**Header**:
- **Title**: [User Name]
- **Subtitle**: [Email] | [Company Link]
- **Tags**: [Role], [Channel: Telegram/Slack], [Timezone]
- **Actions**: [Trigger Standup Now], [Send Test Message]

**Content (2 Columns)**:
- **Left (Timeline)**:
  - Vertical list of events (newest first).
  - **Events**:
    - 🟢 "Standup Sent" (Time)
    - 🔵 "User Replied (Voice)" (Time) - *Preview text*
    - 🟣 "Summary Generated" (Time)
    - 🔴 "Error: LLM Timeout" (Time) - *Expandable details*
- **Right (Debug Info)**:
  - **Integrations**:
    - Calendar: [Connected/Disconnected] | Last Sync: [Time]
    - Telegram: [Connected] | Chat ID: [...]
  - **Raw Logs**: Collapsible section showing JSON of last webhook/API call.

---

## 🛠️ MVP Scope (Phase 1)
1.  **Auth**: Simple hardcoded list of super-admin emails.
2.  **Dashboard**: Mock data first, then real DB counts.
3.  **Companies List**: Simple table with search.
4.  **Company Profile**: Basic details + "Login As" button.
5.  **User Profile**: Basic details + "Trigger Standup" button.

## 🔮 Future (Backlog)
- **Scenario Builder**: UI to edit questions without code.
- **Billing**: Stripe integration status.
- **Audit Log**: Who changed what.
