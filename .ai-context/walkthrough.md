# Knowledge Base Admin — Walkthrough

## Overview
We have successfully implemented the Knowledge Base Admin system, integrated it with the existing Role Archetype system, and created a seamless experience for both Team Leads (Admin) and Employees.

## Features Implemented

### 1. Database Schema
- **`KnowledgeDocument`**: Stores policies, SOPs, and job descriptions.
- **`DocumentAcknowledgment`**: Tracks who has read which document.
- **`DocumentComment`**: Allows Q&A on documents.
- **Integration**: Linked to `Department`, `Team`, `JobRole`, and `User`.
- **Cleanup**: Removed duplicate `KPICatalogItem` model in favor of existing `KPITemplate`.

### 2. API Routes
- **`/api/knowledge-documents`**: Full CRUD with filtering and search.
- **`/api/knowledge-documents/[id]/acknowledge`**: Endpoint for employees to mark documents as read.
- **`/api/ai/scaffold-document`**: Generates document structure based on type and role (currently using templates, ready for LLM).

### 3. Team Lead UI (Admin)
Located at `/settings/knowledge`.
- **Hub Page**: Central access to Documents and Role Archetypes.
- **Document List**: Filter by Level (Company, Dept, Team, Role) and Status.
- **Document Editor**:
  - Markdown support with live preview.
  - **AI Scaffold**: "Magic wand" button to generate initial content.
  - **Versioning**: Auto-increments version on edit.
  - **Comments**: View questions from employees.

### 4. Employee UI
Located at `/my-day/knowledge`.
- **Job Role Card**: Displays mission and responsibilities.
- **KPI Dashboard**: Shows KPIs from the user's **Role Archetype** with traffic light status (Green/Yellow/Red).
- **Required Reading**: Prominent section for unread documents with "Acknowledge" button.
- **Document Library**: Access to all relevant company/department/role documents.

## Verification Steps

### 1. Create a Document (Team Lead)
1. Go to `/settings/knowledge/documents/new`.
2. Select Type: "Job Description", Level: "Role".
3. Click **"🤖 Generate Template"** to see the AI scaffold in action.
4. Edit content and click **"Save"**.
5. Change status to **"Published"** and save again.

### 2. View as Employee
1. Go to `/my-day/knowledge`.
2. You should see the new document in "Required Reading".
3. Click **"Acknowledge"** (Ознайомився).
4. The document should move to the "My Instructions" list with a green checkmark.

### 3. Check KPIs
1. Ensure your user has a Job Role assigned that is linked to an Archetype with KPIs.
2. On `/my-day/knowledge`, verify that "My KPIs" cards are displayed with mock data.

## Next Steps
- **Real AI**: Connect `/api/ai/scaffold-document` to OpenAI/Anthropic for dynamic generation.
- **Real KPI Data**: Replace mock values in `MyKnowledgePage` with actual daily report aggregations.
