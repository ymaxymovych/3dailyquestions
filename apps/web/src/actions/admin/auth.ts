'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function impersonateUser(userId: string) {
    // In a real app, this would verify admin permissions and generate a special token.
    // For MVP, we'll set a cookie that the frontend can read (or middleware).

    // NOTE: In a real NextAuth setup, we'd use `unstable_update` or a custom session strategy.
    // Here we simulate it.

    (await cookies()).set('impersonate_user_id', userId, {
        secure: true,
        httpOnly: true,
        path: '/',
    });

    // Also set a flag for the UI to show the banner
    (await cookies()).set('is_impersonating', 'true', {
        secure: true,
        httpOnly: false, // UI needs to read this to show the banner
        path: '/',
    });

    redirect('/daily-report/team');
}

export async function stopImpersonation() {
    (await cookies()).delete('impersonate_user_id');
    (await cookies()).delete('is_impersonating');
    redirect('/internal');
}
