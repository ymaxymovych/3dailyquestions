# Super Admin Dashboard Wireframes

## 1. Dashboard: "Today" (Pulse)
**Goal**: Instant health check of the system. 5-second rule: "Is everything OK?"

### Header
- **Left**: Logo + "Admin Panel"
- **Center**: Global Search (Company Name, User Email, Workspace ID)
- **Right**: Environment Badge (PROD/STAGE), Admin Profile

### Top Row: Key Metrics (The "Pulse")
*Cards with big numbers and trend indicators*
1.  **Active Workspaces**: Count of orgs with at least 1 active user today.
2.  **Expected Reports**: Total users scheduled to report today.
3.  **Actual Reports**: Count of submitted reports. (e.g., "142 / 850 (16%)")
4.  **Avg Utility Score**: 1-5 star rating average from today's feedback.
5.  **Error Rate**: (Optional red card) If > 0, shows count of critical failures.

### Main Content Area (2 Columns)

#### Left Column: Activity & Trends
- **Chart**: "Response Rate (Last 7 Days)"
    - Line chart showing daily active users.
    - Toggle: 7 Days / 30 Days.
- **List**: "Problematic Companies" (Top 5)
    - Rows: Company Name | Response Rate | Last Active
    - *Criteria*: Sudden drop in activity or high error rate.
    - Action: Click to view Company Profile.

#### Right Column: System Health & Quick Links
- **Alerts Section**:
    - "⚠️ LLM Latency High (>5s)"
    - "❌ Calendar Sync Errors (12)"
- **Quick Filters**:
    - "Zero Activity Companies"
    - "New Signups (Last 24h)"
    - "Expiring Trials"

---

## 2. Screen: Company / Workspace Profile
**Goal**: The "Source of Truth" for a specific customer. Debug, configure, and monitor.

### Header
- **Title**: Company Name (e.g., "Acme Corp")
- **Subtitle**: `org_id_123` | `acme.com`
- **Status Badge**: [Active] / [Trial] / [Past Due]
- **Actions**:
    - [Login as Admin] (Impersonation)
    - [Send Test Report] (Trigger manual push)
    - [View Logs]

### Tabs
`[Overview]` `[Users]` `[Scenarios]` `[Settings]`

### Tab: Overview
- **Stats Row**: Users (Total/Active) | Avg Streak | Plan Type
- **Activity Chart**: "Reports per Day" (Last 14 days)
- **Recent Days Table**:
    - Date | Reports Submitted | Errors | Avg Sentiment
    - *Click row to see reports from that day*

### Tab: Users (Simplified)
- **Filter**: Active / Inactive / Error State
- **Table**:
    - Name | Email | Role
    - Last Report (Time ago)
    - Streak (e.g., "🔥 5")
    - Calendar Linked? (✅/❌)
    - *Action*: [Manage] -> Go to User Profile

### Tab: Scenarios (MVP)
- **Active Scenario**: "Standard Daily Standup"
- **Edit Content**:
    - Intro Text
    - Questions (List)
    - AI Summary Prompt (System Instruction)
- **Toggle Modules**:
    - [x] Voice Input
    - [x] "Big Task" Question

---

## 3. Screen: User Profile
**Goal**: Deep dive for Support/Dev to answer "Why didn't I get a message?"

### Header
- **User**: Name + Email
- **Context**: Role (Manager), Timezone (Europe/Kyiv), Channel (Telegram)
- **Actions**:
    - [Trigger Standup Now] (Manual Push)
    - [Send Test Message] (Verify Channel)

### Left Column: Event Timeline
*Reverse chronological feed of system interactions*
- **Today, 09:00**: 🤖 System sent "Morning Prompt" (Status: Delivered)
- **Today, 09:15**: 👤 User sent Voice Message (14s)
- **Today, 09:16**: ✨ AI Processed Report (Success)
- **Yesterday, 18:00**: ⚠️ System failed to send "Evening Summary" (Error: Telegram Blocked)

### Right Column: Technical Details
- **Integrations Status**:
    - Google Calendar: ✅ Connected (Last sync: 10m ago)
    - Slack: ❌ Not Connected
- **Debug Data**:
    - `user_id`: ...
    - `chat_id`: ...
    - [Show Raw Logs] (Collapsible JSON view of last error)
