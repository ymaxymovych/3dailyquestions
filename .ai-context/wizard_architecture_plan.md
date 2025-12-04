# Wizard Architecture Plan

## Проблема

Зараз у нас є:
- Organization Wizard (`/setup-wizard/organization`)
- User Wizard (`/setup-wizard/user`)
- Дублювання кнопок навігації (на блоці + на банері)
- Немає кнопки "Back" на банері
- Неясно, хто і коли проходить який візард

## Рекомендована архітектура

### 1. Organization Setup Wizard (об'єднаний п.1 + п.2)

**URL:** `/setup-wizard/organization`

**Хто проходить:**
- **Owner/Admin** → повний візард (вся компанія)
- **Department Head** → скорочений візард (тільки свій департамент)

**Кроки для Owner/Admin:**
1. **Company Profile** - назва, індустрія, розмір компанії
2. **Departments** - створення департаментів з архетипів або custom
3. **Teams** - створення команд всередині департаментів
4. **Invite Managers** - запрошення керівників департаментів
5. **Review & Finish** - огляд структури

**Кроки для Department Head:**
1. **Department Overview** - огляд свого департаменту
2. **Teams** - створення команд (якщо ще немає)
3. **Invite Members** - запрошення співробітників
4. **Assign Roles** - призначення ролей з архетипів
5. **Finish**

**Логіка:**
```typescript
if (user.role === 'OWNER' || user.role === 'ADMIN') {
  steps = fullOrganizationSteps; // 5 кроків
} else if (user.role === 'MANAGER' && user.departments.length > 0) {
  steps = departmentSteps; // 5 кроків для департаменту
}
```

### 2. User Onboarding Wizard (п.3)

**URL:** `/setup-wizard/user`

**Хто проходить:**
- Кожен новий співробітник при першому вході

**Кроки:**
1. **Welcome** - вітання, огляд системи
2. **Basic Info** - ім'я, фото, контакти, часовий пояс
3. **Job Role** - вибір ролі з архетипів свого департаменту
4. **Personal KPIs** - налаштування особистих KPI на основі ролі
5. **Preferences** - робочі години, нотифікації
6. **Complete** - завершення

### 3. Department Onboarding Wizard (опціональний, окремий)

**Альтернатива:** Якщо Department Head має більш складний workflow, можна створити окремий візард:

**URL:** `/setup-wizard/department`

**Переваги окремого візарда:**
- Чистіша логіка (без умов всередині)
- Легше підтримувати
- Різні UI для різних ролей

**Недоліки:**
- Більше коду для підтримки
- Потрібен роутинг між візардами

**Моя рекомендація:** Почати з об'єднаного Organization Wizard, а якщо логіка стане занадто складною - винести Department в окремий візард пізніше.

## Повторний прохід візарда

### Можливості повторного проходження:

1. **З Settings:**
   - Кнопка "Restart Organization Setup" в `/settings/organization`
   - Кнопка "Restart Onboarding" в `/settings/general`

2. **Збереження прогресу:**
   - Зберігати `currentStep` в БД
   - При повторному проходженні - почати з першого кроку, але з уже заповненими даними
   - Дозволити змінювати будь-які кроки

3. **Захист від випадкового скидання:**
   - Попередження: "Ви впевнені? Це не видалить існуючі дані, але дозволить їх змінити"

## Навігація візарда

### Проблема: Дублювання кнопок

**Поточний стан:**
- Кнопка "Next" всередині блоку контенту
- Кнопка "Next" на банері внизу сторінки

**Рекомендація: Залишити тільки банер з повною навігацією**

### Новий дизайн банера:

```
┌────────────────────────────────────────────────────────────┐
│  [<- Back]     Step 2 of 5: Create Departments     [Next ->]│
│              [████████░░░░░░░░░░] 40%                       │
└────────────────────────────────────────────────────────────┘
```

**Кнопки на банері:**
- **Back** (ліворуч) - повернутись на попередній крок
  - Disabled на першому кроці
- **Skip** (опціонально, по центру) - пропустити візард
  - Тільки якщо візард необов'язковий
- **Next / Save & Continue** (праворуч) - наступний крок
  - На останньому кроці: "Finish" замість "Next"

**Прогрес:**
- Прогрес-бар показує % завершення
- Текст "Step X of Y: [Step Name]"

### Винятки:

Якщо крок містить складну форму з власною логікою (наприклад, `WizardJobRoleStep`):
- Можна залишити локальну кнопку "Save and Continue" на компоненті
- **Але**: приховати глобальну кнопку "Next" на банері для цього кроку
- Логіка:

```typescript
// В page.tsx
<WizardBanner 
  currentStep={currentStep}
  totalSteps={steps.length}
  onNext={handleNext}
  onBack={handleBack}
  hideNext={currentStep === 3} // якщо крок 3 має власну кнопку
/>
```

## Приклад компонента WizardBanner

```tsx
interface WizardBannerProps {
  currentStep: number;
  totalSteps: number;
  stepName: string;
  onNext: () => void;
  onBack: () => void;
  onSkip?: () => void;
  hideNext?: boolean;
  hideBack?: boolean;
  nextLabel?: string; // "Next", "Save & Continue", або "Finish"
  nextDisabled?: boolean;
}

export function WizardBanner({
  currentStep,
  totalSteps,
  stepName,
  onNext,
  onBack,
  onSkip,
  hideNext,
  hideBack,
  nextLabel = "Next",
  nextDisabled
}: WizardBannerProps) {
  const progress = (currentStep / totalSteps) * 100;
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t shadow-lg z-50">
      <div className="container mx-auto py-4">
        <div className="flex items-center justify-between mb-2">
          {!hideBack && (
            <Button
              variant="outline"
              onClick={onBack}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          )}
          
          <div className="text-sm text-muted-foreground">
            Step {currentStep} of {totalSteps}: {stepName}
          </div>
          
          {!hideNext && (
            <Button onClick={onNext} disabled={nextDisabled}>
              {nextLabel}
              {nextLabel === "Finish" ? (
                <Check className="h-4 w-4 ml-2" />
              ) : (
                <ArrowRight className="h-4 w-4 ml-2" />
              )}
            </Button>
          )}
        </div>
        
        <Progress value={progress} className="h-2" />
        
        {onSkip && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onSkip}
            className="mt-2 mx-auto block"
          >
            Skip Setup
          </Button>
        )}
      </div>
    </div>
  );
}
```

## Рекомендації

1. **Почати з об'єднаного Organization Wizard** - простіше в підтримці
2. **Використовувати тільки банер для навігації** - уніфіковано і зрозуміло
3. **Додати кнопку "Back"** на банері - обов'язково
4. **Видалити дублюючі кнопки** всередині блоків контенту
5. **Додати прогрес-бар** - показує користувачу, скільки залишилось
6. **Зберігати прогрес** - можна повернутись пізніше
7. **Дозволити повторний прохід** - через Settings

## Наступні кроки

1. Створити компонент `WizardBanner`
2. Оновити `/setup-wizard/organization/page.tsx` для використання банера
3. Оновити `/setup-wizard/user/page.tsx` для використання банера
4. Видалити локальні кнопки "Next" з контенту кроків
5. Додати умовну логіку для Owner vs Department Head
6. Протестувати всі сценарії
