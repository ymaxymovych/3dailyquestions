export function parseNameFromEmail(email: string): string {
    const localPart = email.split('@')[0];

    if (!localPart) return '';

    // Handle formats: ivan.petrov, ivan_petrov
    if (localPart.includes('.') || localPart.includes('_')) {
        const parts = localPart.split(/[._]/);

        // Only capitalize if parts look like names (more than 1 char each)
        if (parts.every(p => p.length > 1)) {
            return parts
                .map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
                .join(' ');
        }
    }

    // Don't guess for formats like: ipetrov, jdoe
    return '';
}

export function getEmailType(email: string): 'corporate' | 'free' | 'disposable' {
    const domain = email.split('@')[1]?.toLowerCase() || '';

    const FREE_DOMAINS = [
        'gmail.com', 'googlemail.com', 'outlook.com', 'hotmail.com',
        'live.com', 'yahoo.com', 'icloud.com', 'me.com', 'aol.com'
    ];

    const DISPOSABLE_DOMAINS = [
        'tempmail.com', '10minutemail.com', 'guerrillamail.com',
        'mailinator.com', 'throwaway.email'
    ];

    if (DISPOSABLE_DOMAINS.includes(domain)) return 'disposable';
    if (FREE_DOMAINS.includes(domain)) return 'free';
    return 'corporate';
}
