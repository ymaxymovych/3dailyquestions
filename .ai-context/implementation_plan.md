# Два Wizard: Organization + User Onboarding

## Проблема

Поточний wizard змішує налаштування компанії та персональні налаштування, що створює плутанину:
- Кроки 1-2, 4 - для організації (Company Settings, Organization Structure, AI Config)
- Крок 3 - для користувача (Job Role)
- `wizardCompleted` зберігається на рівні Organization, але питає персональні дані

## Рішення

Створити **два окремих wizard**:

### 1. Organization Wizard (`/setup-wizard/organization`)
**Призначення:** Онбординг компанії (для адміна)

**Кроки:**
1. **Welcome** - Вітання та пояснення
2. **Company Info** - Назва, індустрія, розмір
3. **Work Schedule** - Робочі дні, години, часовий пояс
4. **Organization Structure** - Департаменти та команди (з архетипами)
5. **AI Configuration** (optional) - LLM provider
6. **Review & Complete**

**Зберігання:** `OrganizationSetup.orgWizardCompleted`

---

### 2. User Wizard (`/setup-wizard/user`)
**Призначення:** Персональний онбординг (для кожного користувача)

**Кроки:**
1. **Welcome** - Персональне вітання
2. **Basic Info** - Ім'я, email (pre-filled), аватар
3. **Job Role** - Департамент + роль (з архетипами або custom)
4. **Work Preferences** - Notification settings, work hours
5. **Quick Tour** - Інтерактивний тур по функціях
6. **Complete**

**Зберігання:** `User.userWizardCompleted`

---

## Edge-кейси та рішення

### Edge-кейс 1: Перший користувач (Адмін)
**Сценарій:** Реєстрація нової компанії

**Flow:**
```
Registration → Organization Wizard → User Wizard → Dashboard
```

**Логіка:**
- Після реєстрації перевірити `isFirstUser` (count users in org == 1)
- Якщо так → редірект на `/setup-wizard/organization`
- Після завершення Organization Wizard → автоматично `/setup-wizard/user`

---

### Edge-кейс 2: Департамент не створено
**Сценарій:** Новий користувач, але адмін ще не налаштував структуру

**Flow:**
```
User Wizard → Job Role Step → "Organization not set up yet"
```

**Опції:**
1. **Вибрати з архетипів** (SALES, MKT, PRODENG...) - зберегти як `roleArchetype`
2. **Запропонувати Organization Wizard** (якщо є права адміна)
3. **Skip for now** - можна заповнити пізніше в Settings

**UI:**
```tsx
{!hasOrganizationStructure && (
  <Alert>
    <AlertTitle>Organization Structure Not Set Up</AlertTitle>
    <AlertDescription>
      {isAdmin ? (
        <>Would you like to set up your organization structure first?
          <Button onClick={() => router.push('/setup-wizard/organization')}>
            Set Up Organization
          </Button>
        </>
      ) : (
        <>You can select a general role type for now, or skip and complete this later.
          <Button variant="outline" onClick={handleSkip}>Skip for Now</Button>
        </>
      )}
    </AlertDescription>
  </Alert>
)}
```

---

### Edge-кейс 3: Запрошений користувач
**Сценарій:** Адмін запросив користувача в конкретну команду

**Flow:**
```
Accept Invitation → User Wizard (with pre-filled team/department)
```

**Логіка:**
- Invitation містить `teamId` або `departmentId`
- На кроці Job Role автоматично підставити департамент
- Дозволити змінити, якщо потрібно

---

### Edge-кейс 4: Фрілансер/Консультант
**Сценарій:** Не належить до конкретного департаменту

**Опції:**
1. **"Independent Contributor"** - спеціальна категорія
2. **Вибір архетипу без департаменту** - тільки роль (Designer, Developer...)
3. **Skip department** - заповнити тільки роль

---

### Edge-кейс 5: Зміна ролі
**Сценарій:** Користувач перейшов на іншу позицію

**Рішення:**
- Кнопка "Re-run User Wizard" в Settings
- Або просто Settings → Personal → Job Role
- Wizard можна перезапускати багато разів

---

## Технічна архітектура

### Database Schema Changes

```prisma
model OrganizationSetup {
  // ... existing fields
  
  // Rename existing field
  orgWizardCompleted    Boolean @default(false)  // was: wizardCompleted
  orgWizardSkipped      Boolean @default(false)  // was: wizardSkipped
  orgCurrentStep        Int     @default(1)      // was: currentStep
}

model User {
  // ... existing fields
  
  // Add new fields
  userWizardCompleted   Boolean @default(false)
  userWizardSkipped     Boolean @default(false)
  userCurrentStep       Int     @default(1)
  
  // For edge-case: role without department
  roleArchetypeId       String?
  roleArchetype         RoleArchetype? @relation(fields: [roleArchetypeId], references: [id])
}
```

### API Routes

#### Organization Wizard
- `GET/POST /api/setup/organization/status` - стан Organization Wizard
- Використовує `OrganizationSetup` модель

#### User Wizard  
- `GET/POST /api/setup/user/status` - стан User Wizard
- Використовує `User` модель

### Routing Logic

```typescript
// middleware.ts або AuthProvider
function determineRedirect(user: User, org: Organization) {
  // Перший користувач → Organization Wizard
  if (isFirstUser(user) && !org.setup?.orgWizardCompleted) {
    return '/setup-wizard/organization';
  }
  
  // User Wizard не завершено → User Wizard
  if (!user.userWizardCompleted && !user.userWizardSkipped) {
    return '/setup-wizard/user';
  }
  
  // Все ОК → Dashboard
  return '/my-day';
}
```

---

## Wizard Features

### Обидва Wizard підтримують:
- ✅ **Skip кроків** - можна пропустити необов'язкові кроки
- ✅ **Багаторазовість** - можна перезапустити з Settings
- ✅ **Збереження прогресу** - автоматичне збереження після кожного кроку
- ✅ **Previous/Next** - навігація між кроками
- ✅ **Progress bar** - візуальний індикатор прогресу

### Додаткові фічі User Wizard:
- **Адаптивність** - змінюється залежно від стану організації
- **Pre-filling** - автоматичне заповнення з invitation або профілю
- **Quick Tour** - інтерактивний тур по основних функціях

---

## Proposed Changes

### New Files

#### Organization Wizard
- `apps/web/src/app/setup-wizard/organization/page.tsx` - основна сторінка
- `apps/web/src/components/wizard/org/WelcomeStep.tsx`
- `apps/web/src/components/wizard/org/CompanyInfoStep.tsx`
- `apps/web/src/components/wizard/org/WorkScheduleStep.tsx`
- `apps/web/src/components/wizard/org/OrganizationStructureStep.tsx` (reuse existing)
- `apps/web/src/components/wizard/org/AIConfigStep.tsx`
- `apps/web/src/components/wizard/org/ReviewStep.tsx`

#### User Wizard
- `apps/web/src/app/setup-wizard/user/page.tsx` - основна сторінка
- `apps/web/src/components/wizard/user/WelcomeStep.tsx`
- `apps/web/src/components/wizard/user/BasicInfoStep.tsx`
- `apps/web/src/components/wizard/user/JobRoleStep.tsx` (reuse existing)
- `apps/web/src/components/wizard/user/PreferencesStep.tsx`
- `apps/web/src/components/wizard/user/QuickTourStep.tsx`
- `apps/web/src/components/wizard/user/CompleteStep.tsx`

#### API Routes
- `apps/web/src/app/api/setup/organization/status/route.ts`
- `apps/web/src/app/api/setup/user/status/route.ts`

### Modified Files

#### Database
- `packages/database/prisma/schema.prisma` - додати поля для User Wizard

#### Existing Wizard
- `apps/web/src/app/setup-wizard/page.tsx` - **RENAME** to `organization/page.tsx`
- `apps/web/src/app/api/setup/status/route.ts` - **SPLIT** into two routes

#### Auth Flow
- `apps/web/src/context/AuthContext.tsx` - додати логіку редіректу
- `apps/web/src/app/auth/callback/page.tsx` - перевірка wizard status

#### Settings
- `apps/web/src/app/settings/page.tsx` - додати кнопки для перезапуску wizard

---

## User Review Required

> [!IMPORTANT]
> **Питання для підтвердження:**
> 
> 1. **Назви wizard:** `/setup-wizard/organization` та `/setup-wizard/user` - ОК?
> 2. **Quick Tour в User Wizard:** Чи потрібен інтерактивний тур, чи достатньо просто Welcome?
> 3. **Basic Info крок:** Які поля збирати? (ім'я вже є з реєстрації, аватар, phone, bio?)
> 4. **Work Preferences:** Які саме preferences? (notifications, work hours, timezone?)
> 5. **Адмін права:** Як визначати `isAdmin`? Через `UserRole` чи окреме поле `User.isOrgAdmin`?

> [!WARNING]
> **Breaking Changes:**
> - Database migration потрібна (rename fields в `OrganizationSetup`, додати поля в `User`)
> - Існуючі користувачі з `wizardCompleted=true` потребують міграції даних
> - URL змінюється: `/setup-wizard` → `/setup-wizard/organization` або `/setup-wizard/user`

---

## Verification Plan

### Automated Tests
1. **Organization Wizard Flow:**
   - Перший користувач → Organization Wizard → User Wizard
   - Skip кроків
   - Previous/Next навігація
   - Збереження прогресу

2. **User Wizard Flow:**
   - Новий користувач (org налаштована) → User Wizard
   - Новий користувач (org НЕ налаштована) → показати опції
   - Запрошений користувач → pre-filled дані
   - Skip і повернення пізніше

3. **Edge Cases:**
   - Фрілансер без департаменту
   - Зміна ролі (перезапуск wizard)
   - Багаторазовий wizard

### Manual Verification
1. Пройти обидва wizard від початку до кінця
2. Перевірити всі edge-кейси
3. Перевірити Settings → кнопки перезапуску
4. Перевірити міграцію існуючих користувачів
