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
                body: `Привіт, {{user_name}}!

Ви щойно зареєструвалися в AI Advisory Board.
Щоб завершити створення акаунта і почати користуватися сервісом, підтвердіть свою email-адресу.

[Кнопка: Підтвердити email]({{confirmation_link}})

Якщо ви не реєструвалися в AI Advisory Board, просто проігноруйте цей лист.

З повагою,
команда AI Advisory Board`
            },
            en: {
                subject: 'Please confirm your email for AI Advisory Board',
                body: `Hi {{user_name}},

You have just signed up for AI Advisory Board.
To finish creating your account, please confirm your email address.

[Button: Confirm email]({{confirmation_link}})

If you did not try to sign up for AI Advisory Board, you can simply ignore this message.

Best regards,
AI Advisory Board team`
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
                body: `Привіт, {{user_name}}!

Вас запросили приєднатися до AI Advisory Board компанії «{{org_name}}» як учасника команди.

За допомогою AI Advisory Board ваша команда відповідатиме на короткі щоденні запитання, а керівники бачитимуть зрозумілу картину роботи.

Щоб приєднатися, перейдіть за посиланням:
[Кнопка: Приєднатися до команди]({{invite_link}})

Якщо ви не очікували цього запрошення, можете проігнорувати лист або повідомити про це своєму керівнику.

З повагою,
команда AI Advisory Board`
            },
            en: {
                subject: 'You've been invited to AI Advisory Board for your company',
        body: `Hi {{user_name}},

You have been invited to join your company's workspace in AI Advisory Board.
AI Advisory Board helps teams share short daily updates and gives managers a clear view of what is going on.

To join your team, follow this link:
[Button: Join AI Advisory Board]({{invite_link}})

If you did not expect this invitation, you can ignore this email or check with your manager.

Best regards,
AI Advisory Board team`
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
                body: `Привіт, {{user_name}}!

Ви — адміністратор AI Advisory Board у компанії «{{org_name}}».
Нижче — 3 кроки, щоб сервіс почав працювати для вашої команди:

1. Створіть команди та додайте учасників.
2. Налаштуйте час щоденного інтерв'ю для кожної команди.
3. (За бажанням) Підключіть Slack або Telegram, щоб люди відповідали прямо з месенджера.

[Кнопка: Перейти до налаштувань]({{settings_link}})

Якщо будуть питання, просто відповідайте на цей лист або зверніться до підтримки.

З повагою,
команда AI Advisory Board`
        },
        en: {
            subject: 'Your admin account in AI Advisory Board is ready',
                body: `Hi {{user_name}},

You are an administrator of your company's AI Advisory Board workspace.
Here are three simple steps to start getting value from the product:

1. Create one or more teams.
2. Add people to these teams.
3. Set the time for daily check-ins for each team.

Optionally, you can also connect Slack or Telegram so that people can answer from their usual tools.

[Button: Open admin settings]({{settings_link}})

If you need help with the setup, just reply to this email and we will support you.

Best regards,
AI Advisory Board team`
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
                body: `Привіт, {{user_name}}!

Вас призначили керівником команди «{{team_name}}» в AI Advisory Board.

Сервіс щодня ставитиме короткі запитання вашим колегам, а ви бачитимете в одному місці:
– що люди планують;
– що реально встигають;
– де з'являються блокери і ризики.

Почати варто з двох кроків:
1. Перевірити склад команди.
2. Узгодити час щоденного інтерв'ю.

[Кнопка: Перейти до вашої команди]({{team_link}})

З повагою,
команда AI Advisory Board`
        },
        en: {
            subject: 'You are now a team lead in AI Advisory Board',
                body: `Hi {{user_name}},

You have been assigned as a team lead in AI Advisory Board.
Every day your teammates will receive a few short questions, and you will see:
– what they plan to do;
– what they actually achieve;
– which blockers and risks appear.

To get started, please:
1. Check who is in your team.
2. Agree on a suitable time for the daily check-in.

[Button: Go to your team in AI Advisory Board]({{team_link}})

Best regards,
AI Advisory Board team`
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
                body: `Привіт, {{user_name}}!

Ми отримали запит на зміну пароля до вашого акаунта в AI Advisory Board.

Щоб встановити новий пароль, перейдіть за посиланням:
[Кнопка: Змінити пароль]({{reset_link}})

Посилання дійсне протягом 1 години.
Якщо ви не ініціювали цей запит, просто проігноруйте лист — ваш пароль залишиться без змін.

З повагою,
команда AI Advisory Board`
        },
        en: {
            subject: 'Password reset for your AI Advisory Board account',
                body: `Hi {{user_name}},

We received a request to reset the password for your AI Advisory Board account.

To set a new password, please click the button below:
[Button: Set new password]({{reset_link}})

This link is valid for a limited time.
If you did not request a password reset, you can ignore this email and your current password will stay the same.

Best regards,
AI Advisory Board team`
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
                body: `Привіт, {{user_name}}!

Ви запросили змінити email свого акаунта в AI Advisory Board з {{old_email}} на {{new_email}}.

Щоб підтвердити зміну, натисніть:
[Кнопка: Підтвердити новий email]({{confirm_link}})

Якщо ви не робили цього запиту, не натискайте кнопку та повідомте про це підтримку.
До підтвердження ваш поточний email залишиться активним.

З повагою,
команда AI Advisory Board`
        },
        en: {
            subject: 'Confirm your new email for AI Advisory Board',
                body: `Hi {{user_name}},

You asked to change the email address for your AI Advisory Board account.

To confirm this change, please click the button below:
[Button: Confirm new email]({{confirm_link}})

Until you confirm, your current email will remain active.
If you did not request this change, do not click the button and contact support.

Best regards,
AI Advisory Board team`
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
                body: `Привіт, {{user_name}}!

Ви створили акаунт AI Advisory Board для «{{org_name}}», але виглядає так, що налаштування ще не завершені.

На зараз:
– команд: {{teams_count}};
– час щоденного інтерв'ю: {{schedule_status}};
– перших щоденних звітів: {{reports_count}}.

Щоб сервіс почав приносити користь, зробіть, будь ласка, ці кроки:
1. Створіть одну або кілька команд.
2. Додайте до них учасників.
3. Оберіть час щоденного інтерв'ю для кожної команди.

[Кнопка: Завершити налаштування]({{setup_link}})

Якщо потрібна допомога, відповідайте на цей лист — ми підкажемо.

З повагою,
команда AI Advisory Board`
        },
        en: {
            subject: 'AI Advisory Board setup is not finished yet',
                body: `Hi {{user_name}},

You created an AI Advisory Board workspace for your company, but the setup still looks incomplete.

Right now we see that at least one of these steps is not done:
– no active teams;
– no time set for daily check-ins;
– no completed daily reports.

To start getting real value, please:
1. Create at least one team.
2. Add people to this team.
3. Set the time for the daily check-in.

[Button: Finish setup]({{setup_link}})

If you are unsure what to do next, reply to this email and we will help you pick the simplest option for your company.

Best regards,
AI Advisory Board team`
        }
    }
},
{
    code: 'ONB_TEAM_NO_STANDUPS_REMINDER',
        name: 'Team Activation Reminder',
            description: "Reminds manager if team hasn't started daily reports.",
                category: EmailCategory.ONBOARDING,
                    critical: false,
                        enabled: true,
                            recipients: ['Manager'],
                                triggers: '48h after team creation if no reports',
                                    variables: ['user_name', 'team_name', 'team_settings_link'],
                                        templates: {
        uk: {
            subject: 'Команда «{{team_name}}» ще не стартувала з щоденними звітами',
                body: `Привіт, {{user_name}}!

Ви створили команду «{{team_name}}» в AI Advisory Board, але щоденні звіти ще не запустилися.

На зараз:
– час щоденного інтерв'ю: не налаштовано;
– завершених звітів: 0.

Щоб команда почала отримувати користь:
1. Оберіть час щоденного інтерв'ю (коли людям зручно відповідати).
2. Перевірте, що всі учасники додані й мають доступ.

[Кнопка: Налаштувати команду]({{team_settings_link}})

Якщо є сумніви, з чого почати — відповідайте на цей лист, підкажемо варіант під ваш графік.

З повагою,
команда AI Advisory Board`
        },
        en: {
            subject: 'Your team has not started daily check-ins yet',
                body: `Hi {{user_name}},

You created a team in AI Advisory Board, but daily check-ins have not started yet.

At the moment we see that:
– the time for the daily check-in is not set, and/or
– no daily reports have been completed.

To start using AI Advisory Board with this team, please:
1. Choose a time for the daily check-in that works for your teammates.
2. Make sure all team members have access and know what to expect.

[Button: Set up your team]({{team_settings_link}})

If you would like suggestions on how to introduce daily check-ins to the team, just reply to this email.

Best regards,
AI Advisory Board team`
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
                body: `Привіт!

Ми оновили умови використання та/або політику конфіденційності AI Advisory Board.

Ознайомитися з оновленнями можна за цими посиланнями:
– [Умови використання]({{tos_link}})
– [Політика конфіденційності]({{privacy_link}})

Нова версія набуває чинності з {{effective_date}}.
Якщо ви продовжуєте користуватися сервісом після цієї дати, це означає, що ви погоджуєтесь з оновленими умовами.

Якщо у вас є запитання щодо змін, напишіть, будь ласка, у відповідь на цей лист.

З повагою,
команда AI Advisory Board`
        },
        en: {
            subject: 'We updated AI Advisory Board Terms and Privacy Policy',
                body: `Hi,

We have updated the Terms of Service and/or Privacy Policy for AI Advisory Board.

You can read the updated versions here:
– [Terms of Service]({{tos_link}})
– [Privacy Policy]({{privacy_link}})

The new version will take effect on {{effective_date}}.
By continuing to use AI Advisory Board after this date, you accept the updated terms.

If you have any questions about these changes, please reply to this email.

Best regards,
AI Advisory Board team`
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
                body: `Привіт!

Ми хочемо проінформувати вас про інцидент безпеки, який відбувся {{incident_date}}.
На цей момент ми з'ясували:
– суть інциденту: {{incident_summary}};
– які типи даних могли бути заторкнуті;
– яких користувачів це може стосуватися.

Що ми вже зробили:
– {{actions_taken}}.

Що рекомендуємо зробити вам:
– змінити пароль;
– за бажанням увімкнути додаткові механізми безпеки;
– звернутися до підтримки, якщо ви помітите підозрілу активність.

Нам щиро прикро, що це сталося. Ми серйозно ставимося до безпеки даних і продовжимо інформувати вас про всі важливі оновлення.

З повагою,
команда AI Advisory Board`
        },
        en: {
            subject: 'Important: security incident notice for AI Advisory Board',
                body: `Hi,

We want to inform you about a security incident that took place on {{incident_date}}.

At this point we know the following:
– what happened: {{incident_summary}};
– which types of data might have been affected;
– which users or workspaces may be involved.

What we have done so far:
– {{actions_taken}}.

What we recommend you to do:
– change your password;
– review recent activity in your account;
– contact support if you see anything unusual.

We take the protection of your data seriously and will keep you informed about any further important updates.

Best regards,
AI Advisory Board team`
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
                body: `Привіт!

В організації «{{org_name}}» у AI Advisory Board з'явився новий адміністратор.

Дані:
– Ім'я: {{new_admin_name}}
– Email: {{new_admin_email}}

– Хто призначив: {{actor_name}}
– Дата: {{date_time}}

Адміністратори мають розширені права доступу до налаштувань акаунта, команд і даних.
Якщо це призначення виглядає для вас несподіваним, варто уточнити деталі всередині компанії або звернутися до підтримки.

З повагою,
команда AI Advisory Board`
        },
        en: {
            subject: 'A new administrator was added to your AI Advisory Board workspace',
                body: `Hi,

A new administrator has been added to your AI Advisory Board workspace.

Details:
– Name: {{new_admin_name}}
– Email: {{new_admin_email}}
– Added by: {{actor_name}}
– Date: {{date_time}}

Administrators have extended access to workspace settings, teams and data.
If this change looks unexpected to you, please clarify it inside your company or contact support.

Best regards,
AI Advisory Board team`
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
                body: `Привіт!

В організації «{{org_name}}» у AI Advisory Board змінено права одного з адміністраторів.

Дані:
– Ім'я: {{target_name}}
– Email: {{target_email}}

– Нова роль: користувач без прав адміністратора
– Хто змінив: {{actor_name}}
– Дата: {{date_time}}

Якщо ви не очікували цієї зміни, варто уточнити деталі всередині компанії або звернутися до підтримки.

З повагою,
команда AI Advisory Board`
        },
        en: {
            subject: 'Administrator rights were removed in your AI Advisory Board workspace',
                body: `Hi,

Administrator rights have been removed from one of the users in your AI Advisory Board workspace.

Details:
– Name: {{target_name}}
– Email: {{target_email}}
– New role: user without admin rights
– Changed by: {{actor_name}}
– Date: {{date_time}}

If you did not expect this change, please check it inside your company or contact support.

Best regards,
AI Advisory Board team`
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
                body: `Привіт!

Ви залишили свій email на сайті AI Advisory Board, щоб отримувати новини й оновлення про продукт.

Щоб підтвердити підписку, перейдіть за посиланням:
[Кнопка: Підтвердити підписку]({{confirm_subscription_link}})

Ми час від часу надсилатимемо:
– оновлення продукту;
– корисні кейси та поради для керівників команд;
– анонси нових можливостей.

Якщо ви не планували підписуватися, просто проігноруйте цей лист — ми нічого більше надсилати не будемо.

З повагою,
команда AI Advisory Board`
        },
        en: {
            subject: 'Please confirm your subscription to AI Advisory Board updates',
                body: `Hi,

You entered your email on the AI Advisory Board website to receive news and updates.

To confirm your subscription, please click the button below:
[Button: Confirm subscription]({{confirm_subscription_link}})

From time to time we will send you:
– product updates;
– practical tips for team leads and managers;
– announcements of new features and online sessions.

If at any time you feel that these emails are no longer useful, you can unsubscribe with one click using the link at the bottom of each message.

Best regards,
AI Advisory Board team`
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
                body: `Привіт, {{user_name}}!

Дякуємо, що підтвердили підписку на оновлення AI Advisory Board.

Що ви отримуватимете:
– короткі огляди нових функцій;
– практичні поради для керівників команд;
– інколи запрошення на онлайн-зустрічі й вебінари.

Якщо в будь-який момент вирішите, що листів забагато або вони вам не корисні, ви зможете відписатися за одним кліком унизу кожного листа.

З повагою,
команда AI Advisory Board`
        },
        en: {
            subject: 'You are subscribed to AI Advisory Board updates',
                body: `Hi {{user_name}},

Thank you for confirming your subscription to AI Advisory Board updates.

What you can expect from us:
– short overviews of new features;
– useful ideas for running teams with daily check-ins;
– occasional invitations to online events and product sessions.

If at any time you feel that these emails are no longer useful, you can unsubscribe with one click using the link at the bottom of each message.

Best regards,
AI Advisory Board team`
        }
    }
}
];

export async function seedEmailTemplates() {
    console.log('📧 Seeding email templates...');

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
        console.log(`  ✅ ${template.code} - ${template.name}`);
    }

    console.log(`📧 Seeded ${EMAIL_TEMPLATES.length} email templates`);
}

// Allow running standalone
if (require.main === module) {
    seedEmailTemplates()
        .then(() => {
            console.log('✅ Email templates seeding complete');
            process.exit(0);
        })
        .catch((e) => {
            console.error('❌ Error seeding email templates:', e);
            process.exit(1);
        })
        .finally(async () => {
            await prisma.$disconnect();
        });
}
