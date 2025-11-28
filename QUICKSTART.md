# Crystal Kuiper - Quick Reference

## 🚀 Start Development

```bash
# 1. Start database (PostgreSQL must be running)

# 2. Start API
cd apps/api
npm run start:dev

# 3. Start Web (new terminal)
cd apps/web
npm run dev
```

**URLs:**
- API: http://localhost:3001/api
- Web: http://localhost:3000

---

## 📊 Current Status (2025-11-27)

- ✅ Manager Dashboard Phase 1-3 complete
- ✅ Yaware API integration (backend ready)
- ⏳ Waiting for YAWARE_ACCESS_KEY
- ⏳ Load testing blocked (need test user)

---

## 🔑 Quick Commands

```bash
# Database
cd packages/database
npx prisma studio          # Open DB GUI
npx prisma migrate dev     # Run migrations

# Testing
artillery quick --count 50 --num 1000 http://localhost:3001/api/health

# Create test user
cd packages/database
npx tsx prisma/seed/create-test-manager.ts
```

---

## 📞 Next Steps

1. Create test manager for load testing
2. Run Manager Dashboard performance test
3. Add Organization model (multi-tenancy)
4. Implement Redis caching

---

See `project_context.md` for full details.
