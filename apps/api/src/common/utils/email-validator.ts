export const FREE_EMAIL_DOMAINS = [
    // Google
    'gmail.com',
    'googlemail.com',

    // Microsoft
    'outlook.com',
    'hotmail.com',
    'live.com',
    'msn.com',

    // Yahoo
    'yahoo.com',
    'yahoo.co.uk',
    'yahoo.fr',
    'yahoo.de',
    'ymail.com',

    // Apple
    'icloud.com',
    'me.com',
    'mac.com',

    // Other popular
    'aol.com',
    'protonmail.com',
    'proton.me',
    'zoho.com',
    'gmx.com',
    'gmx.de',

    // Russian/Ukrainian
    'mail.ru',
    'yandex.ru',
    'yandex.ua',
    'ukr.net',
    'i.ua',
];

export const DISPOSABLE_EMAIL_DOMAINS = [
    'tempmail.com',
    '10minutemail.com',
    'guerrillamail.com',
    'mailinator.com',
    'throwaway.email',
    'temp-mail.org',
    'getnada.com',
    'maildrop.cc',
    'trashmail.com',
    'sharklasers.com',
    'guerrillamail.info',
    'grr.la',
    'guerrillamail.biz',
    'guerrillamail.de',
    'spam4.me',
    'mailnesia.com',
    'mytemp.email',
    'mohmal.com',
    'emailondeck.com',
    'fakeinbox.com',
];

export function getEmailDomain(email: string): string {
    return email.split('@')[1]?.toLowerCase() || '';
}

export function isFreeEmailProvider(email: string): boolean {
    const domain = getEmailDomain(email);
    return FREE_EMAIL_DOMAINS.includes(domain);
}

export function isDisposableEmail(email: string): boolean {
    const domain = getEmailDomain(email);
    return DISPOSABLE_EMAIL_DOMAINS.includes(domain);
}

export function isCorporateEmail(email: string): boolean {
    return !isFreeEmailProvider(email) && !isDisposableEmail(email);
}
