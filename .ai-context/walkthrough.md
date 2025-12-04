# Walkthrough: Divide and Adapt Onboarding Strategy

## Overview
We have successfully implemented the "Divide and Adapt" onboarding strategy, splitting the monolithic wizard into two distinct, specialized flows: **Organization Wizard** and **User Wizard**. This ensures a tailored experience for Admins, Managers, and Employees.

## Changes Implemented

### 1. Organization Wizard (`/setup-wizard/organization`)
- **Purpose**: Exclusively for Admins/Owners to set up the company.
- **Steps**:
    1.  **Welcome**: Vision & Goals.
    2.  **Company Profile**: Name, Industry, Size.
    3.  **Structure**: Departments & Teams (link to Admin Settings).
    4.  **Work Schedule**: Working days, hours, timezone.
    5.  **AI Policy**: Provider (OpenAI/Anthropic) and Tone.
    6.  **Complete**: Redirects to User Wizard.
- **API Routes**:
    - `PATCH /api/organization` (Basic Info)
    - `PATCH /api/organization/settings` (Work Schedule)
    - `PATCH /api/organization/ai-settings` (AI Policy)

### 2. User Wizard (`/setup-wizard/user`)
- **Purpose**: Personal setup for all users (including Admins after Org setup).
- **Adaptive Logic**:
    - **Managers**: Prompted to **Create** or **Manage** their team.
    - **Employees**: Prompted to **Join** an existing team in their department.
    - **Admins**: Can skip team setup or configure their own profile.
- **Steps**:
    1.  **Welcome**: Overview.
    2.  **Basic Info**: Name, Job Title, Bio.
    3.  **Team & Role**: Adaptive step (Create vs Join).
    4.  **Preferences**: Work hours, Notifications.
    5.  **Complete**: Redirects to Dashboard (`/my-day`).
- **Components**:
    - `TeamStep.tsx`: Handles the logic for creating vs joining teams.
    - `BasicInfoStep.tsx`: Profile editing.
    - `PreferencesStep.tsx`: User settings.
- **API Routes**:
    - `GET /api/departments/[id]/teams`
    - `POST /api/teams`
    - `POST /api/teams/[id]/join`
    - `PATCH /api/user/profile`
    - `PATCH /api/user/preferences`

### 3. Smart Routing (`/setup-wizard`)
- The main `/setup-wizard` page now acts as a **smart redirector**.
- Checks `/api/setup/organization/status`.
- **Logic**:
    - If Organization Setup is **incomplete** -> Redirects to `/setup-wizard/organization`.
    - If Organization Setup is **complete** -> Redirects to `/setup-wizard/user`.

## Verification Steps

### Automated Verification
Run the following commands to ensure the build passes and no linting errors were introduced:
```bash
npm run build
npm run lint
```

### Manual Verification
1.  **Admin Flow**:
    - Log in as a new Admin (or reset `orgWizardCompleted` in DB).
    - Go to `/setup-wizard`.
    - Verify redirection to `/setup-wizard/organization`.
    - Complete Org Wizard.
    - Verify redirection to `/setup-wizard/user`.
    - Complete User Wizard as Admin.
    - Verify redirection to `/my-day`.

2.  **Employee Flow** (Requires Invite logic or manual DB setup):
    - Log in as a user in an existing Org.
    - Go to `/setup-wizard`.
    - Verify redirection to `/setup-wizard/user` (since Org is done).
    - Verify "Team Step" shows "Join Team" options.

3.  **Manager Flow**:
    - Log in as a Manager.
    - Verify "Team Step" shows "Create Team" options.
