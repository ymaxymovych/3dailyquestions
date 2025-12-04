# 🛡️ Super Admin Panel — Інструкція

## 🚀 Точка входу

| Середовище | URL |
|------------|-----|
| Локально | `http://localhost:3000/internal` |
| Production | `https://your-domain.com/internal` |

> **Примітка**: Це внутрішня адмінка для команди Crystal Kuiper, НЕ для клієнтів.

---

## 🔐 Додавання нових Super Admin

### Крок 1: Відкрий файл
```
apps/web/src/components/auth/SuperAdminGuard.tsx
```

### Крок 2: Додай email до масиву
```typescript
const SUPER_ADMIN_EMAILS = [
    'yaroslav.maxymovych@gmail.com', // Primary admin
    'admin@crystalkuiper.com',
    'dev@crystalkuiper.com',
    'new-admin@example.com'  // ← Додай сюди
];
```

### Крок 3: Задеплой зміни
- Локально: зміни застосуються автоматично (hot reload)
- Production: потрібен новий деплой

> **Майбутнє покращення**: Перенести список адмінів в базу даних або env-змінні (див. Backlog).

---

## 📊 Функціонал (MVP)

### 1. Dashboard (`/internal`)
**Статус: ✅ Працює (Mock Data)**

| Віджет | Опис |
|--------|------|
| **Active Workspaces** | Кількість активних компаній |
| **Scheduled Standups** | Заплановані stand-up'и на сьогодні |
| **Response Rate** | % користувачів, які відповіли |
| **Errors (24h)** | Кількість помилок (червоний, якщо > 0) |
| **Activity Chart** | Графік відповідей за 7 днів |
| **Problematic Companies** | Список компаній з проблемами |

> ⚠️ **Зараз**: Показує mock-дані. Для реальних даних потрібно підключити до БД.

---

### 2. Companies List (`/internal/companies`)
**Статус: ✅ Працює (Mock Data)**

- Таблиця всіх компаній
- Колонки: Name, Domain, Users, Status, Last Active
- Пошук (UI готовий, логіка TBD)
- Клік на компанію → профіль

---

### 3. Company Profile (`/internal/companies/[id]`)
**Статус: ✅ Працює (Mock Data)**

#### Таби:
| Таб | Функціонал |
|-----|------------|
| **Overview** | Статистика: Users, Active Today, Streak |
| **Users** | Список користувачів + кнопка "Login As" |
| **Config** | Timezone, Schedule, Modules (Voice, Big Task, Weekly Review) |

#### Кнопки:
- **Send Test Standup** — UI готовий, логіка TBD
- **Login As** — Impersonation (див. нижче)

---

### 4. Impersonation ("Login As")
**Статус: ✅ Працює**

**Як це працює:**
1. На сторінці Company Profile → таб "Users"
2. Натисни "Login As" біля потрібного користувача
3. Підтверди дію в діалозі
4. Тебе редіректить на `/daily-report/team` як того користувача

**Візуальні індикатори:**
- 🟠 **Оранжева рамка** (4px) навколо всього екрану
- 🟠 **Плаваючий банер** внизу: "You are currently impersonating..."

**Вийти з режиму:**
- Натисни "Exit Impersonation" на банері
- Тебе поверне на `/internal`

---

## 🚧 Що НЕ працює (Backlog)

| Функція | Статус | Опис |
|---------|--------|------|
| Real DB Data | 🔴 TODO | Dashboard показує mock-дані |
| User Profile | 🔴 TODO | Сторінка `/internal/users/[id]` з Timeline |
| Search | 🟡 UI Only | Пошук на сторінці Companies |
| Send Test Standup | 🟡 UI Only | Кнопка є, логіка TBD |
| Audit Log | 🔴 Backlog | Хто що змінював |
| Admin RBAC | 🔴 Backlog | Ролі (Support vs Dev) |

---

## 📁 Структура файлів

```
apps/web/src/
├── app/(super-admin)/
│   ├── layout.tsx              # Layout з Sidebar
│   └── internal/
│       ├── page.tsx            # Dashboard
│       └── companies/
│           ├── page.tsx        # Companies List
│           └── [id]/
│               └── page.tsx    # Company Profile
├── components/admin/
│   ├── AdminSidebar.tsx        # Навігація
│   ├── StatsCards.tsx          # Картки метрик
│   ├── ActivityChart.tsx       # Recharts графік
│   ├── ProblematicCompanies.tsx
│   ├── ImpersonateButton.tsx   # Кнопка "Login As"
│   └── ImpersonationBanner.tsx # Банер виходу
├── components/auth/
│   └── SuperAdminGuard.tsx     # Захист роутів
└── actions/admin/
    ├── dashboard.ts            # Mock data actions
    └── auth.ts                 # Impersonation logic
```

---

## 🔒 Безпека

1. **Email Whitelist**: Тільки emails з `SUPER_ADMIN_EMAILS` мають доступ
2. **Guard Component**: Перевіряє авторизацію перед рендером
3. **Impersonation Cookies**: `is_impersonating` (для UI) + `impersonate_user_id` (httpOnly)

---

## 🆘 Troubleshooting

### "Access denied" при переході на /internal
- Перевір, чи твій email є в `SUPER_ADMIN_EMAILS`
- Перевір, чи ти залогінений (token в localStorage)

### Impersonation не працює
- Перевір, чи cookies дозволені в браузері
- Перевір консоль на помилки

### Графік не відображається
- Переконайся, що `recharts` встановлено: `pnpm add recharts`
