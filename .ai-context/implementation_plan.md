# Onboarding Strategy: "Divide and Adapt"

## Проблема
Поточний підхід змішує налаштування компанії та користувача. Потрібно чітко розділити ці процеси та адаптувати їх під роль користувача (Працівник vs Керівник).

## Стратегія: "Divide and Adapt"

Ми розділяємо процес на два незалежних візарди:

### 1. Organization Wizard (`/setup-wizard/organization`)
**Тільки для Адміна/Власника** при створенні нової компанії.
**Мета:** Створити "скелет" організації.

**Кроки:**
1.  **Welcome & Vision**: Вітання, пояснення цінності.
2.  **Company Profile**: Назва, індустрія, домен.
3.  **Structure Setup**: Створення Департаментів (Sales, Marketing, Engineering...).
4.  **Work Schedule**: Глобальний графік роботи та часовий пояс.
5.  **AI Policy**: Налаштування поведінки AI.
6.  **Complete**: Перехід до User Wizard.

### 2. User Wizard (`/setup-wizard/user`)
**Для ВСІХ користувачів** (включаючи Адміна після Org Wizard).
**Мета:** Персональне налаштування та інтеграція в команду.
**Адаптивність:** Кроки змінюються залежно від ролі.

**Кроки:**
1.  **Welcome**: Персональне вітання.
2.  **Profile Confirmation**: Фото, Ім'я, Bio.
3.  **Role & Team (ADAPTIVE)**:
    *   **Сценарій A: Працівник (Employee)**
        *   Вибір Департаменту (якщо не задано).
        *   **Join Team**: Вибір зі списку існуючих команд або "No Team".
        *   Вибір Ролі (Role Archetype).
    *   **Сценарій B: Керівник (Manager/Head)**
        *   Вибір Департаменту (яким керує).
        *   **Create/Manage Team**: Створення своєї команди або підтвердження керівництва існуючою.
        *   Запрошення учасників (опціонально).
    *   **Сценарій C: Адмін (Owner)**
        *   Пропускає вибір команди (або створює свою).
        *   Налаштування свого "Admin" профілю.
4.  **Work Preferences**: Сповіщення, робочі години (якщо відрізняються від Org).
5.  **Quick Tour**: Короткий огляд інтерфейсу.

---

## Технічна Реалізація

### 1. Database Schema (Prisma)
Переконатися, що модель `User` підтримує стан візарда (вже є в схемі, перевірити використання).

```prisma
model User {
  // ...
  userWizardCompleted   Boolean @default(false)
  userWizardSkipped     Boolean @default(false)
  userCurrentStep       Int     @default(0)
  
  // Role & Team relations
  teamId          String?
  team            Team?         @relation(fields: [teamId], references: [id])
  // ...
}
```

### 2. Routing Logic (Middleware/Auth)
*   **New Company**: Register -> Org Wizard -> User Wizard -> Dashboard.
*   **Invited User**: Register (via Invite) -> User Wizard -> Dashboard.
*   **Existing User**: Login -> Check `userWizardCompleted` -> Redirect if needed.

### 3. Components Structure
*   `apps/web/src/app/setup-wizard/organization/` - сторінки Org Wizard.
*   `apps/web/src/app/setup-wizard/user/` - сторінки User Wizard.
*   `apps/web/src/components/wizard/user/` - компоненти кроків (AdaptiveStep, ProfileStep...).

### 4. Adaptive Logic
Використовувати `UserRole` або дані з `Invite` для визначення сценарію (Manager vs Employee).
*   Якщо `Invite` має роль `MANAGER` -> Сценарій B.
*   Якщо `Invite` має роль `EMPLOYEE` -> Сценарій A.
*   Якщо `isFirstUser` (Admin) -> Сценарій C.

## Verification Plan

### Automated Tests
1.  **Admin Flow**: Register -> Org Wizard -> User Wizard -> Dashboard.
2.  **Employee Flow**: Invite Link -> Register -> User Wizard (Join Team) -> Dashboard.
3.  **Manager Flow**: Invite Link -> Register -> User Wizard (Create Team) -> Dashboard.

### Manual Verification
1.  Пройти шлях створення компанії.
2.  Запросити працівника, пройти шлях працівника.
3.  Запросити менеджера, пройти шлях менеджера.
