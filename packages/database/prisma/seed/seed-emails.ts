import { PrismaClient, EmailCategory } from '@prisma/client';

const prisma = new PrismaClient();

// Email templates from ai-advisory-admin/constants.ts
const EMAIL_TEMPLATES = [
    // --- Registration / Access ---
    {
        code: 'REG_CONFIRM_EMAIL',
        name: 'Confirm Email',
        description: 'Sent when a user registers or is invited to verify their email address.',
        category: EmailCategory.ACCESS,
        critical: true,
        enabled: true,
        recipients: ['All Roles'],
        triggers: 'User registration or invite',
        variables: ['user_name', 'confirmation_link', 'company_name'],
        templates: {
            uk: {
                subject: 'Підтвердіть свою email-адресу для доступу до AI Advisory Board',
                body: 'Привіт, {{user_name}}!\n\nВи щойно зареєструвалися в AI Advisory Board.\nЩоб завершити створення акаунта і почати користуватися сервісом, підтвердіть свою email-адресу.\n\n[Кнопка: Підтвердити email]({{confirmation_link}})\n\nЯкщо ви не реєструвалися в AI Advisory Board, просто проігноруйте цей лист.\n\nЗ повагою,\nкоманда AI Advisory Board'
            },
            en: {
                subject: 'Please confirm your email for AI Advisory Board',
                body: 'Hi {{user_name}},\n\nYou have just signed up for AI Advisory Board.\nTo finish creating your account, please confirm your email address.\n\n[Button: Confirm email]({{confirmation_link}})\n\nIf you did not try to sign up for AI Advisory Board, you can simply ignore this message.\n\nBest regards,\nAI Advisory Board team'
            }
        }
    },
    {
        code: 'REG_INVITE_TO_ORG',
        name: 'Invite to Organization',
        description: 'Sent when an admin invites a user to an organization.',
        category: EmailCategory.ACCESS,
        critical: false,
        enabled: true,
        recipients: ['Invited User'],
        triggers: 'Admin invites user',
        variables: ['user_name', 'org_name', 'invite_link', 'inviter_name', 'role'],
        templates: {
            uk: {
                subject: 'Вас запросили в AI Advisory Board вашої компанії',
                body: 'Привіт, {{user_name}}!\n\nВас запросили приєднатися до AI Advisory Board компанії «{{org_name}}» як учасника команди.\n\nЗа допомогою AI Advisory Board ваша команда відповідатиме на короткі щоденні запитання, а керівники бачитимуть зрозумілу картину роботи.\n\nЩоб приєднатися, перейдіть за посиланням:\n[Кнопка: Приєднатися до команди]({{invite_link}})\n\nЯкщо ви не очікували цього запрошення, можете проігнорувати лист або повідомити про це своєму керівнику.\n\nЗ повагою,\nкоманда AI Advisory Board'
            },
            en: {
                subject: 'You have been invited to AI Advisory Board for your company',
                body: 'Hi {{user_name}},\n\nYou have been invited to join your company workspace in AI Advisory Board.\nAI Advisory Board helps teams share short daily updates and gives managers a clear view of what is going on.\n\nTo join your team, follow this link:\n[Button: Join AI Advisory Board]({{invite_link}})\n\nIf you did not expect this invitation, you can ignore this email or check with your manager.\n\nBest regards,\nAI Advisory Board team'
            }
        }
    },
    {
        code: 'REG_WELCOME_ADMIN',
        name: 'Welcome Admin',
        description: 'Onboarding email for the first admin of an organization.',
        category: EmailCategory.ACCESS,
        critical: false,
        enabled: true,
        recipients: ['Admin'],
        triggers: 'First org admin created',
        variables: ['user_name', 'org_name', 'settings_link'],
        templates: {
            uk: {
                subject: 'Як запустити AI Advisory Board у вашій компанії: 3 прості кроки',
                body: 'Привіт, {{user_name}}!\n\nВи — адміністратор AI Advisory Board у компанії «{{org_name}}».\nНижче — 3 кроки, щоб сервіс почав працювати для вашої команди:\n\n1. Створіть команди та додайте учасників.\n2. Налаштуйте час щоденного інтерв\'ю для кожної команди.\n3. (За бажанням) Підключіть Slack або Telegram, щоб люди відповідали прямо з месенджера.\n\n[Кнопка: Перейти до налаштувань]({{settings_link}})\n\nЯкщо будуть питання, просто відповідайте на цей лист або зверніться до підтримки.\n\nЗ повагою,\nкоманда AI Advisory Board'
            },
            en: {
                subject: 'Your admin account in AI Advisory Board is ready',
                body: 'Hi {{user_name}},\n\nYou are an administrator of your company AI Advisory Board workspace.\nHere are three simple steps to start getting value from the product:\n\n1. Create one or more teams.\n2. Add people to these teams.\n3. Set the time for daily check-ins for each team.\n\nOptionally, you can also connect Slack or Telegram so that people can answer from their usual tools.\n\n[Button: Open admin settings]({{settings_link}})\n\nIf you need help with the setup, just reply to this email and we will support you.\n\nBest regards,\nAI Advisory Board team'
            }
        }
    },
    {
        code: 'REG_WELCOME_MANAGER',
        name: 'Welcome Manager',
        description: 'Onboarding email for a newly assigned manager.',
        category: EmailCategory.ACCESS,
        critical: false,
        enabled: true,
        recipients: ['Manager', 'Head'],
        triggers: 'User assigned as manager',
        variables: ['user_name', 'team_name', 'team_link'],
        templates: {
            uk: {
                subject: 'Як AI Advisory Board допомагатиме вам керувати командою',
                body: 'Привіт, {{user_name}}!\n\nВас призначили керівником команди «{{team_name}}» в AI Advisory Board.\n\nСервіс щодня ставитиме короткі запитання вашим колегам, а ви бачитимете в одному місці:\n– що люди планують;\n– що реально встигають;\n– де з\'являються блокери і ризики.\n\nПочати варто з двох кроків:\n1. Перевірити склад команди.\n2. Узгодити час щоденного інтерв\'ю.\n\n[Кнопка: Перейти до вашої команди]({{team_link}})\n\nЗ повагою,\nкоманда AI Advisory Board'
            },
            en: {
                subject: 'You are now a team lead in AI Advisory Board',
                body: 'Hi {{user_name}},\n\nYou have been assigned as a team lead in AI Advisory Board.\nEvery day your teammates will receive a few short questions, and you will see:\n– what they plan to do;\n– what they actually achieve;\n– which blockers and risks appear.\n\nTo get started, please:\n1. Check who is in your team.\n2. Agree on a suitable time for the daily check-in.\n\n[Button: Go to your team in AI Advisory Board]({{team_link}})\n\nBest regards,\nAI Advisory Board team'
            }
        }
    },
    {
        code: 'AUTH_PASSWORD_RESET',
        name: 'Password Reset',
        description: 'Sent when a user requests to reset their password.',
        category: EmailCategory.ACCESS,
        critical: true,
        enabled: true,
        recipients: ['All Roles'],
        triggers: 'User requests password reset',
        variables: ['user_name', 'reset_link'],
        templates: {
            uk: {
                subject: 'Скидання пароля до вашого акаунта AI Advisory Board',
                body: 'Привіт, {{user_name}}!\n\nМи отримали запит на зміну пароля до вашого акаунта в AI Advisory Board.\n\nЩоб встановити новий пароль, перейдіть за посиланням:\n[Кнопка: Змінити пароль]({{reset_link}})\n\nПосилання дійсне протягом 1 години.\nЯкщо ви не ініціювали цей запит, просто проігноруйте лист — ваш пароль залишиться без змін.\n\nЗ повагою,\nкоманда AI Advisory Board'
            },
            en: {
                subject: 'Password reset for your AI Advisory Board account',
                body: 'Hi {{user_name}},\n\nWe received a request to reset the password for your AI Advisory Board account.\n\nTo set a new password, please click the button below:\n[Button: Set new password]({{reset_link}})\n\nThis link is valid for a limited time.\nIf you did not request a password reset, you can ignore this email and your current password will stay the same.\n\nBest regards,\nAI Advisory Board team'
            }
        }
    },
    {
        code: 'AUTH_EMAIL_CHANGE_CONFIRM',
        name: 'Confirm Email Change',
        description: 'Sent when a user requests to change their email.',
        category: EmailCategory.ACCESS,
        critical: true,
        enabled: true,
        recipients: ['User'],
        triggers: 'User changes email in settings',
        variables: ['user_name', 'old_email', 'new_email', 'confirm_link'],
        templates: {
            uk: {
                subject: 'Підтвердіть зміну email в AI Advisory Board',
                body: 'Привіт, {{user_name}}!\n\nВи запросили змінити email свого акаунта в AI Advisory Board з {{old_email}} на {{new_email}}.\n\nЩоб підтвердити зміну, натисніть:\n[Кнопка: Підтвердити новий email]({{confirm_link}})\n\nЯкщо ви не робили цього запиту, не натискайте кнопку та повідомте про це підтримку.\nДо підтвердження ваш поточний email залишиться активним.\n\nЗ повагою,\nкоманда AI Advisory Board'
            },
            en: {
                subject: 'Confirm your new email for AI Advisory Board',
                body: 'Hi {{user_name}},\n\nYou asked to change the email address for your AI Advisory Board account.\n\nTo confirm this change, please click the button below:\n[Button: Confirm new email]({{confirm_link}})\n\nUntil you confirm, your current email will remain active.\nIf you did not request this change, do not click the button and contact support.\n\nBest regards,\nAI Advisory Board team'
            }
        }
    },
    // --- Onboarding / JTBD ---
    {
        code: 'ONB_ORG_SETUP_REMINDER',
        name: 'Org Setup Reminder',
        description: 'Reminds admin to complete organization setup if incomplete after 24h.',
        category: EmailCategory.ONBOARDING,
        critical: false,
        enabled: true,
        recipients: ['Admin'],
        triggers: '24h after org creation if incomplete',
        variables: ['user_name', 'org_name', 'teams_count', 'schedule_status', 'reports_count', 'setup_link'],
        templates: {
            uk: {
                subject: 'AI Advisory Board ще не запущений повністю: залишилось кілька кроків',
                body: 'Привіт, {{user_name}}!\n\nВи створили акаунт AI Advisory Board для «{{org_name}}», але виглядає так, що налаштування ще не завершені.\n\nНа зараз:\n– команд: {{teams_count}};\n– час щоденного інтерв\'ю: {{schedule_status}};\n– перших щоденних звітів: {{reports_count}}.\n\nЩоб сервіс почав приносити користь, зробіть, будь ласка, ці кроки:\n1. Створіть одну або кілька команд.\n2. Додайте до них учасників.\n3. Оберіть час щоденного інтерв\'ю для кожної команди.\n\n[Кнопка: Завершити налаштування]({{setup_link}})\n\nЯкщо потрібна допомога, відповідайте на цей лист — ми підкажемо.\n\nЗ повагою,\nкоманда AI Advisory Board'
            },
            en: {
                subject: 'AI Advisory Board setup is not finished yet',
                body: 'Hi {{user_name}},\n\nYou created an AI Advisory Board workspace for your company, but the setup still looks incomplete.\n\nRight now we see that at least one of these steps is not done:\n– no active teams;\n– no time set for daily check-ins;\n– no completed daily reports.\n\nTo start getting real value, please:\n1. Create at least one team.\n2. Add people to this team.\n3. Set the time for the daily check-in.\n\n[Button: Finish setup]({{setup_link}})\n\nIf you are unsure what to do next, reply to this email and we will help you pick the simplest option for your company.\n\nBest regards,\nAI Advisory Board team'
            }
        }
    },
    {
        code: 'ONB_TEAM_NO_STANDUPS_REMINDER',
        name: 'Team Activation Reminder',
        description: 'Reminds manager if team has not started daily reports.',
        category: EmailCategory.ONBOARDING,
        critical: false,
        enabled: true,
        recipients: ['Manager'],
        triggers: '48h after team creation if no reports',
        variables: ['user_name', 'team_name', 'team_settings_link'],
        templates: {
            uk: {
                subject: 'Команда «{{team_name}}» ще не стартувала з щоденними звітами',
                body: 'Привіт, {{user_name}}!\n\nВи створили команду «{{team_name}}» в AI Advisory Board, але щоденні звіти ще не запустилися.\n\nНа зараз:\n– час щоденного інтерв\'ю: не налаштовано;\n– завершених звітів: 0.\n\nЩоб команда почала отримувати користь:\n1. Оберіть час щоденного інтерв\'ю (коли людям зручно відповідати).\n2. Перевірте, що всі учасники додані й мають доступ.\n\n[Кнопка: Налаштувати команду]({{team_settings_link}})\n\nЯкщо є сумніви, з чого почати — відповідайте на цей лист, підкажемо варіант під ваш графік.\n\nЗ повагою,\nкоманда AI Advisory Board'
            },
            en: {
                subject: 'Your team has not started daily check-ins yet',
                body: 'Hi {{user_name}},\n\nYou created a team in AI Advisory Board, but daily check-ins have not started yet.\n\nAt the moment we see that:\n– the time for the daily check-in is not set, and/or\n– no daily reports have been completed.\n\nTo start using AI Advisory Board with this team, please:\n1. Choose a time for the daily check-in that works for your teammates.\n2. Make sure all team members have access and know what to expect.\n\n[Button: Set up your team]({{team_settings_link}})\n\nIf you would like suggestions on how to introduce daily check-ins to the team, just reply to this email.\n\nBest regards,\nAI Advisory Board team'
            }
        }
    },
    // --- Legal / Security ---
    {
        code: 'LEG_TERMS_UPDATE',
        name: 'Terms Update',
        description: 'Notification about changes to Terms of Service or Privacy Policy.',
        category: EmailCategory.LEGAL,
        critical: true,
        enabled: true,
        recipients: ['All Users'],
        triggers: 'Manual trigger by admin',
        variables: ['tos_link', 'privacy_link', 'effective_date'],
        templates: {
            uk: {
                subject: 'Ми оновили умови використання AI Advisory Board',
                body: 'Привіт!\n\nМи оновили умови використання та/або політику конфіденційності AI Advisory Board.\n\nОзнайомитися з оновленнями можна за цими посиланнями:\n– [Умови використання]({{tos_link}})\n– [Політика конфіденційності]({{privacy_link}})\n\nНова версія набуває чинності з {{effective_date}}.\nЯкщо ви продовжуєте користуватися сервісом після цієї дати, це означає, що ви погоджуєтесь з оновленими умовами.\n\nЯкщо у вас є запитання щодо змін, напишіть, будь ласка, у відповідь на цей лист.\n\nЗ повагою,\nкоманда AI Advisory Board'
            },
            en: {
                subject: 'We updated AI Advisory Board Terms and Privacy Policy',
                body: 'Hi,\n\nWe have updated the Terms of Service and/or Privacy Policy for AI Advisory Board.\n\nYou can read the updated versions here:\n– [Terms of Service]({{tos_link}})\n– [Privacy Policy]({{privacy_link}})\n\nThe new version will take effect on {{effective_date}}.\nBy continuing to use AI Advisory Board after this date, you accept the updated terms.\n\nIf you have any questions about these changes, please reply to this email.\n\nBest regards,\nAI Advisory Board team'
            }
        }
    },
    {
        code: 'LEG_INCIDENT_NOTICE',
        name: 'Security Incident',
        description: 'Notification about a security incident.',
        category: EmailCategory.LEGAL,
        critical: true,
        enabled: true,
        recipients: ['Affected Users'],
        triggers: 'Security incident detected',
        variables: ['incident_date', 'incident_summary', 'actions_taken'],
        templates: {
            uk: {
                subject: 'Важливо: повідомлення про інцидент безпеки в AI Advisory Board',
                body: 'Привіт!\n\nМи хочемо проінформувати вас про інцидент безпеки, який відбувся {{incident_date}}.\nНа цей момент ми з\'ясували:\n– суть інциденту: {{incident_summary}};\n– які типи даних могли бути заторкнуті;\n– яких користувачів це може стосуватися.\n\nЩо ми вже зробили:\n– {{actions_taken}}.\n\nЩо рекомендуємо зробити вам:\n– змінити пароль;\n– за бажанням увімкнути додаткові механізми безпеки;\n– звернутися до підтримки, якщо ви помітите підозрілу активність.\n\nНам щиро прикро, що це сталося. Ми серйозно ставимося до безпеки даних і продовжимо інформувати вас про всі важливі оновлення.\n\nЗ повагою,\nкоманда AI Advisory Board'
            },
            en: {
                subject: 'Important: security incident notice for AI Advisory Board',
                body: 'Hi,\n\nWe want to inform you about a security incident that took place on {{incident_date}}.\n\nAt this point we know the following:\n– what happened: {{incident_summary}};\n– which types of data might have been affected;\n– which users or workspaces may be involved.\n\nWhat we have done so far:\n– {{actions_taken}}.\n\nWhat we recommend you to do:\n– change your password;\n– review recent activity in your account;\n– contact support if you see anything unusual.\n\nWe take the protection of your data seriously and will keep you informed about any further important updates.\n\nBest regards,\nAI Advisory Board team'
            }
        }
    },
    {
        code: 'SEC_NEW_ADMIN_ADDED',
        name: 'New Admin Added',
        description: 'Notification to existing admins when a new admin is added.',
        category: EmailCategory.LEGAL,
        critical: true,
        enabled: true,
        recipients: ['Admins'],
        triggers: 'Admin role assigned',
        variables: ['new_admin_name', 'new_admin_email', 'actor_name', 'date_time', 'org_name'],
        templates: {
            uk: {
                subject: 'До вашої організації в AI Advisory Board додано нового адміністратора',
                body: 'Привіт!\n\nВ організації «{{org_name}}» у AI Advisory Board з\'явився новий адміністратор.\n\nДані:\n– Ім\'я: {{new_admin_name}}\n– Email: {{new_admin_email}}\n\n– Хто призначив: {{actor_name}}\n– Дата: {{date_time}}\n\nАдміністратори мають розширені права доступу до налаштувань акаунта, команд і даних.\nЯкщо це призначення виглядає для вас несподіваним, варто уточнити деталі всередині компанії або звернутися до підтримки.\n\nЗ повагою,\nкоманда AI Advisory Board'
            },
            en: {
                subject: 'A new administrator was added to your AI Advisory Board workspace',
                body: 'Hi,\n\nA new administrator has been added to your AI Advisory Board workspace.\n\nDetails:\n– Name: {{new_admin_name}}\n– Email: {{new_admin_email}}\n– Added by: {{actor_name}}\n– Date: {{date_time}}\n\nAdministrators have extended access to workspace settings, teams and data.\nIf this change looks unexpected to you, please clarify it inside your company or contact support.\n\nBest regards,\nAI Advisory Board team'
            }
        }
    },
    {
        code: 'SEC_ADMIN_REMOVED',
        name: 'Admin Removed',
        description: 'Notification when admin rights are removed.',
        category: EmailCategory.LEGAL,
        critical: true,
        enabled: true,
        recipients: ['Admins'],
        triggers: 'Admin role removed',
        variables: ['target_name', 'target_email', 'actor_name', 'date_time', 'org_name'],
        templates: {
            uk: {
                subject: 'Адміністратора в AI Advisory Board позбавлено прав',
                body: 'Привіт!\n\nВ організації «{{org_name}}» у AI Advisory Board змінено права одного з адміністраторів.\n\nДані:\n– Ім\'я: {{target_name}}\n– Email: {{target_email}}\n\n– Нова роль: користувач без прав адміністратора\n– Хто змінив: {{actor_name}}\n– Дата: {{date_time}}\n\nЯкщо ви не очікували цієї зміни, варто уточнити деталі всередині компанії або звернутися до підтримки.\n\nЗ повагою,\nкоманда AI Advisory Board'
            },
            en: {
                subject: 'Administrator rights were removed in your AI Advisory Board workspace',
                body: 'Hi,\n\nAdministrator rights have been removed from one of the users in your AI Advisory Board workspace.\n\nDetails:\n– Name: {{target_name}}\n– Email: {{target_email}}\n– New role: user without admin rights\n– Changed by: {{actor_name}}\n– Date: {{date_time}}\n\nIf you did not expect this change, please check it inside your company or contact support.\n\nBest regards,\nAI Advisory Board team'
            }
        }
    },
    // --- Marketing ---
    {
        code: 'MKT_NEWSLETTER_CONFIRM',
        name: 'Newsletter Confirmation',
        description: 'Double opt-in confirmation email for newsletter.',
        category: EmailCategory.MARKETING,
        critical: false,
        enabled: true,
        recipients: ['Subscriber'],
        triggers: 'Form submission',
        variables: ['confirm_subscription_link'],
        templates: {
            uk: {
                subject: 'Підтвердіть підписку на оновлення AI Advisory Board',
                body: 'Привіт!\n\nВи залишили свій email на сайті AI Advisory Board, щоб отримувати новини й оновлення про продукт.\n\nЩоб підтвердити підписку, перейдіть за посиланням:\n[Кнопка: Підтвердити підписку]({{confirm_subscription_link}})\n\nМи час від часу надсилатимемо:\n– оновлення продукту;\n– корисні кейси та поради для керівників команд;\n– анонси нових можливостей.\n\nЯкщо ви не планували підписуватися, просто проігноруйте цей лист — ми нічого більше надсилати не будемо.\n\nЗ повагою,\nкоманда AI Advisory Board'
            },
            en: {
                subject: 'Please confirm your subscription to AI Advisory Board updates',
                body: 'Hi,\n\nYou entered your email on the AI Advisory Board website to receive news and updates.\n\nTo confirm your subscription, please click the button below:\n[Button: Confirm subscription]({{confirm_subscription_link}})\n\nFrom time to time we will send you:\n– product updates;\n– practical tips for team leads and managers;\n– announcements of new features and online sessions.\n\nIf at any time you feel that these emails are no longer useful, you can unsubscribe with one click using the link at the bottom of each message.\n\nBest regards,\nAI Advisory Board team'
            }
        }
    },
    {
        code: 'MKT_NEWSLETTER_WELCOME',
        name: 'Newsletter Welcome',
        description: 'Welcome email after newsletter confirmation.',
        category: EmailCategory.MARKETING,
        critical: false,
        enabled: true,
        recipients: ['Subscriber'],
        triggers: 'Subscription confirmed',
        variables: ['user_name'],
        templates: {
            uk: {
                subject: 'Ви підписані на оновлення AI Advisory Board',
                body: 'Привіт, {{user_name}}!\n\nДякуємо, що підтвердили підписку на оновлення AI Advisory Board.\n\nЩо ви отримуватимете:\n– короткі огляди нових функцій;\n– практичні поради для керівників команд;\n– інколи запрошення на онлайн-зустрічі й вебінари.\n\nЯкщо в будь-який момент вирішите, що листів забагато або вони вам не корисні, ви зможете відписатися за одним кліком унизу кожного листа.\n\nЗ повагою,\nкоманда AI Advisory Board'
            },
            en: {
                subject: 'You are subscribed to AI Advisory Board updates',
                body: 'Hi {{user_name}},\n\nThank you for confirming your subscription to AI Advisory Board updates.\n\nWhat you can expect from us:\n– short overviews of new features;\n– useful ideas for running teams with daily check-ins;\n– occasional invitations to online events and product sessions.\n\nIf at any time you feel that these emails are no longer useful, you can unsubscribe with one click using the link at the bottom of each message.\n\nBest regards,\nAI Advisory Board team'
            }
        }
    }
];

export async function seedEmailTemplates() {
    console.log('Seeding email templates...');

    for (const template of EMAIL_TEMPLATES) {
        await prisma.emailTemplate.upsert({
            where: { code: template.code },
            update: {
                name: template.name,
                description: template.description,
                category: template.category,
                critical: template.critical,
                enabled: template.enabled,
                recipients: template.recipients,
                triggers: template.triggers,
                variables: template.variables,
                templates: template.templates,
            },
            create: {
                code: template.code,
                name: template.name,
                description: template.description,
                category: template.category,
                critical: template.critical,
                enabled: template.enabled,
                recipients: template.recipients,
                triggers: template.triggers,
                variables: template.variables,
                templates: template.templates,
            },
        });
        console.log(`  OK: ${template.code} - ${template.name}`);
    }

    console.log(`Seeded ${EMAIL_TEMPLATES.length} email templates`);
}

// Allow running standalone
if (require.main === module) {
    seedEmailTemplates()
        .then(() => {
            console.log('Email templates seeding complete');
            process.exit(0);
        })
        .catch((e) => {
            console.error('Error seeding email templates:', e);
            process.exit(1);
        })
        .finally(async () => {
            await prisma.$disconnect();
        });
}
