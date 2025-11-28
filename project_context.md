# Crystal Kuiper - Project Context & Status

**Last Updated:** 2025-11-28  
**Current Phase:** Multi-Tenancy Implementation (Completed)

---

## 🎯 Project Overview

**Crystal Kuiper** - Employee productivity tracking and management platform with AI-powered insights.

### Tech Stack
- **Backend:** NestJS (Node.js), PostgreSQL, Prisma ORM
- **Frontend:** Next.js (React), Tailwind CSS, Shadcn UI
- **Monorepo:** Turborepo (pnpm)
- **Auth:** JWT + Google OAuth
- **Integrations:** Yaware TimeTracker (via RapidAPI), Google Calendar (planned)

### Ports
- **API:** http://localhost:3001 (prefix: `/api`)
- **Web:** http://localhost:3000

---

## ✅ Completed Features

### Phase 1: Core Features
- ✅ Authentication (JWT + Google OAuth)
- ✅ User management (RBAC: EMPLOYEE, MANAGER, ADMIN)
- ✅ Daily reports submission
- ✅ Projects & Tags management
- ✅ Department structure

### Phase 2: Manager Dashboard (MVP)
- ✅ Team reports overview
- ✅ Employee status tracking
- ✅ Report details modal
- ✅ Date filtering
- ✅ Summary statistics

### Phase 3: AI Flags
- ✅ Automatic risk detection
- ✅ Pattern analysis (burnout, disengagement, blockers)
- ✅ AI-generated suggestions (Ukrainian)
- ✅ Risk levels (low, medium, high)

### Phase 4: Integrations (In Progress)
- ✅ Yaware API integration (backend ready)
  - YawareService with RapidAPI
  - Mock data fallback
  - IntegrationsSnapshotService
- ✅ Plan vs Fact comparison
- ✅ Underfocused detection
- ⏳ Waiting for YAWARE_ACCESS_KEY from support
- ❌ Google Calendar OAuth (postponed)

### Phase 5: Performance & SaaS Readiness
- ✅ Load testing setup (Artillery)
- ✅ Health endpoints
- ✅ Performance benchmarks
- ✅ Multi-tenancy (Organization model, TenantGuard, Isolation)
- ⏳ Redis caching (planned)

---

## 📊 Performance Benchmarks (Tested 2025-11-27)

### Health Endpoint (Simple)
```
RPS: 2,228 req/sec ✅
Latency p95: 25.8ms ✅
Latency p99: 32.1ms ✅
Success rate: 100% ✅
Concurrent users: ~45
```

### Manager Dashboard (with DB) - Pending
```
Status: Test blocked - need test user with password
Issue: Artillery can't test Google OAuth flow
Solution: Create test manager with email/password
```

---

## 🗂️ Project Structure

```
crystal-kuiper/
├── apps/
│   ├── api/                    # NestJS backend
│   │   ├── src/
│   │   │   ├── auth/          # JWT + Google OAuth
│   │   │   ├── users/         # User management
│   │   │   ├── daily-reports/ # Report submission
│   │   │   ├── manager-dashboard/  # Manager features
│   │   │   │   ├── manager-dashboard.service.ts
│   │   │   │   ├── ai-flags.service.ts
│   │   │   │   └── integrations-snapshot.service.ts
│   │   │   ├── integrations/
│   │   │   │   └── yaware/    # Yaware API integration
│   │   │   │       ├── yaware.service.ts
│   │   │   │       └── yaware.module.ts
│   │   │   ├── health/        # Health checks (NEW)
│   │   │   ├── organization/  # Organization management (NEW)
│   │   │   ├── common/
│   │   │   │   └── guards/    # TenantGuard (NEW)
│   │   │   └── main.ts        # Global prefix: /api
│   │   ├── .env               # Environment variables
│   │   └── package.json
│   │
│   └── web/                   # Next.js frontend
│       ├── src/
│       │   ├── app/
│       │   │   ├── dashboard/
│       │   │   │   ├── manager/  # Manager Dashboard UI
│       │   │   │   └── page.tsx
│       │   │   └── settings/
│       │   ├── components/
│       │   │   ├── dashboard/
│       │   │   │   ├── DashboardSummary.tsx
│       │   │   │   ├── EmployeeReportCard.tsx
│       │   │   │   └── ReportDetailsModal.tsx
│       │   │   ├── settings/
│       │   │   │   └── OrganizationTab.tsx (NEW)
│       │   │   └── ui/        # Shadcn components
│       │   └── lib/
│       └── package.json
│
├── packages/
│   └── database/              # Prisma shared package
│       ├── prisma/
│       │   ├── schema.prisma  # Database schema
│       │   ├── migrations/
│       │   └── seed/
│       │       ├── manager-dashboard-seed.ts
│       │       └── create-test-manager.ts (NEW)
│       └── package.json
│
├── load-tests/                # Performance testing (NEW)
│   └── manager-dashboard-test.yml
│
└── package.json               # Root monorepo config
```

---

## 🔑 Environment Variables

### apps/api/.env
```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/crystal_kuiper?schema=public"

# JWT
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="7d"

# Google OAuth (optional)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GOOGLE_CALLBACK_URL="http://localhost:3001/api/auth/google/callback"

# Yaware API (via RapidAPI)
RAPIDAPI_KEY="ab6fbeda98msh6a304c68759bf0ap1f7cccjsna5db737eedf1"
RAPIDAPI_HOST="yaware-timetracker.p.rapidapi.com"
YAWARE_ACCESS_KEY=""  # Waiting for support response

# Server
PORT=3001
```

---

## 🗄️ Database Schema (Key Models)

### Organization (NEW)
```prisma
model Organization {
  id             String          @id @default(uuid())
  name           String
  slug           String?         @unique @default(cuid())
  plan           String          @default("free")
  status         String          @default("active")
  maxUsers       Int             @default(5)
  maxProjects    Int             @default(10)
  
  users          User[]
  departments    Department[]
  projects       Project[]
  dailyReports   DailyReport[]
}
```

### User
```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  password      String?   # Null for Google OAuth users
  firstName     String
  lastName      String
  role          Role      @default(EMPLOYEE)
  
  orgId         String
  org           Organization @relation(fields: [orgId], references: [id])
  departmentId  String?
  
  dailyReports  DailyReport[]
  managedDepartments Department[] @relation("DepartmentManager")
}
```

---

## 🚀 Quick Start Commands

### Development
```bash
# Install dependencies
pnpm install

# Start database
# (Ensure PostgreSQL is running on localhost:5432)

# Run migrations
cd packages/database
npx prisma migrate dev

# Seed data (optional)
npx prisma db seed

# Start API
cd apps/api
npm run start:dev

# Start Web (in another terminal)
cd apps/web
npm run dev
```

### Testing
```bash
# Multi-tenancy E2E Test
cd apps/api
npm run test:e2e -- test/multi-tenancy.e2e-spec.ts

# Load test - Health endpoint
artillery quick --count 50 --num 1000 http://localhost:3001/api/health

# Load test - Manager Dashboard (needs test user)
artillery run load-tests/manager-dashboard-test.yml

# Create test manager
cd packages/database
npx tsx prisma/seed/create-test-manager.ts
```

---

## 🔄 Current Work & Next Steps

### In Progress
- ⏳ **Yaware API Integration**
  - Backend: ✅ Complete
  - Credentials: ⏳ Waiting for YAWARE_ACCESS_KEY
  - Testing: ⏳ Blocked on test user creation

### Blocked
- ❌ **Load testing Manager Dashboard**
  - Issue: Artillery needs email/password auth
  - User logs in via Google OAuth only
  - Solution: Create test manager with password

### Next Priorities
1. **Create test manager** for load testing
2. **Run Manager Dashboard load test** to get real DB performance
3. **Implement Redis caching** for performance
4. **Settings UI** for Yaware integration

---

## 📈 SaaS Readiness

### Current Status: 85%
- ✅ Stateless API
- ✅ JWT auth
- ✅ RBAC
- ✅ Modular architecture
- ✅ Multi-tenancy (Organization model implemented)
- ❌ Caching layer (need Redis)
- ❌ Rate limiting
- ❌ Health checks (basic added, need DB checks)

### Estimated Capacity
- **Current (no optimization):** 100-200 concurrent users
- **With Redis + indexes:** 500-1000 concurrent users
- **With Kubernetes + scaling:** 10,000+ concurrent users

### Deployment Options
1. **Quick Start:** Railway (API) + Vercel (Web) - $40-70/month
2. **Production:** DigitalOcean Kubernetes - $71/month
3. **Enterprise:** AWS EKS - $170+/month

---

## 🐛 Known Issues

1. **Load testing blocked** - Need test user with password (Google OAuth users can't be tested with Artillery)
2. **Yaware API incomplete** - Waiting for YAWARE_ACCESS_KEY from support
3. **No caching** - Every request hits database
4. **No rate limiting** - Vulnerable to abuse

---

## 📚 Documentation Files

### In Repository
- `README.md` - Project overview
- `packages/database/prisma/schema.prisma` - Database schema
- `load-tests/manager-dashboard-test.yml` - Load test scenarios
- `apps/api/test/multi-tenancy.e2e-spec.ts` - Multi-tenancy verification test

### In Brain (Artifacts)
- `task.md` - Current task checklist
- `implementation_plan.md` - Yaware API integration plan
- `manager_dashboard_walkthrough.md` - Manager Dashboard documentation
- `saas_readiness_analysis.md` - SaaS architecture analysis
- `load_testing_guide.md` - Performance testing guide
- `migration_guide.md` - Multi-tenancy migration guide

---

## 🔐 Credentials & Access

### Database
- **Host:** localhost:5432
- **Database:** crystal_kuiper
- **User:** postgres
- **Password:** postgres

### RapidAPI (Yaware)
- **API Key:** ab6fbeda98msh6a304c68759bf0ap1f7cccjsna5db737eedf1
- **Host:** yaware-timetracker.p.rapidapi.com
- **Yaware Access Key:** ⏳ Pending from support

### Test Users
- **Google OAuth:** (your account)
- **Test Manager:** manager@example.com / password123 (to be created)

---

## 📞 Support Requests

### Active
- **Yaware Support** - Requested YAWARE_ACCESS_KEY (2025-11-26)

---

## 🎯 Long-term Roadmap

### Phase 6: Multi-tenancy (Completed)
- ✅ Organization model
- ✅ Row-level security (TenantGuard)
- ✅ Subscription plans (Basic schema)

### Phase 7: Advanced Features
- Real-time notifications
- Advanced analytics
- Mobile app
- Slack/Teams integration

### Phase 8: Enterprise
- SSO (SAML)
- Audit logs
- Custom reports
- White-labeling

---

**Status:** Active development  
**Last Session:** 2025-11-28 (Multi-tenancy implementation)  
**Next Session:** Load testing with test manager → Redis caching
