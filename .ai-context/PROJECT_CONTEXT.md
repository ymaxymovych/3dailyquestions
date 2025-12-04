# 🌍 PROJECT CONTEXT

## 📦 Repository
- **GitHub**: https://github.com/ymaxymovych/3dailyquestions
- **Project Name**: Crystal Kuiper (3 Daily Questions SaaS Planner)

## 🎯 Jobs To Be Done (JTBD) & Vision
- **Product Name**: Crystal Kuiper
- **Product Goal**: A comprehensive SaaS Planner and Organization Management tool that streamlines company structure, goal setting (KPIs), and daily employee workflows.
- **Target Audience**: 
  - **Admins/Owners**: Setting up company structure, strategy, and oversight.
  - **Managers**: Managing teams, setting department goals, monitoring progress.
  - **Employees**: Daily planning, task tracking, alignment with company goals.

## 🏗️ System Architecture
- **Tech Stack**: 
  - **Frontend**: Next.js 15 (App Router), React, TailwindCSS, Lucide Icons.
  - **Backend**: Next.js API Routes, Prisma ORM.
  - **Database**: PostgreSQL (implied by Prisma).
  - **Authentication**: Custom/NextAuth (Google Provider).
- **Architecture Style**: Modular Monolith (see [.ai-context/ARCHITECTURE.md](file:///c:/Users/yaros/.gemini/antigravity/playground/crystal-kuiper/.ai-context/ARCHITECTURE.md)).
- **Key Modules** (Route Groups):
  - `(marketing)`: Public Landing & Blog.
  - `(auth)`: Login/Register.
  - `(onboarding)`: Setup Wizard.
  - `(platform)`: Core App (Employee/Manager/Admin views).
  - `(super-admin)`: Internal Support & Monitoring.

## 🧠 ENGINEERING PHILOSOPHY & RULES

### 🛡️ The "No-Hallucination" Protocol
1. **Verify Before Implementing**: Never assume a library, function, or variable exists. Check imports and file definitions first.
2. **Simulation Mode**: Before writing complex logic, mentally simulate the execution flow 3 times with different inputs/edge cases.
3. **Reference First**: Do not rely on chat memory. Trust `task.md` (Current Focus) and actual file contents.

### 🔧 Coding Standards
1. **Atomic Changes**: Keep PRs/commits focused on specific tasks.
2. **Strict Types**: Avoid `any`; use generated Prisma types.
3. **Self-Documenting**: Code explains "How", comments explain "Why".
4. **Next.js 15 Specifics**: Treat `params` and `searchParams` as Promises.
5. **UI/UX**: Prioritize "Premium" aesthetics (gradients, glassmorphism) over default styles.

### 🤖 Workflow Ritual
**Start of Session:**
1. Read `PROJECT_CONTEXT.md` → Understand the Vision & Rules.
2. Read `task.md` (Current Focus section) → Understand what we're doing NOW.
3. Read `task.md` (Progress Tracker) → See what's done and what's next.

**End of Session (or before notify_user):**
1. Update `task.md` → Mark completed items with `[x]`.
2. Update "Current Focus" → Set next immediate goal.
3. Update "Recent Decisions" → Log any important decisions made.

## 🚫 Out of Scope
- Mobile Native App (currently Web only).
- Complex Billing/Subscription logic (for now, focused on core functionality).
