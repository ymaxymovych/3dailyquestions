'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api from '@/lib/api';
import { useRouter, usePathname } from 'next/navigation';

interface User {
    userId: string;
    email: string;
    fullName: string;
    orgId: string;
    roles: string[];
    status?: 'ACTIVE' | 'PENDING' | 'BLOCKED';
}

interface AuthContextType {
    user: User | null;
    login: (token: string) => void;
    logout: () => void;
    isLoading: boolean;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setIsLoading(false);
                return;
            }

            try {
                const { data } = await api.get('/users/me');
                setUser(data);
            } catch (error) {
                console.error('Auth check failed', error);
                localStorage.removeItem('token');
            } finally {
                setIsLoading(false);
            }
        };

        initAuth();
    }, []);

    const login = useCallback((token: string) => {
        localStorage.setItem('token', token);
        // Refresh user data immediately
        api.get('/users/me').then(({ data }) => {
            setUser(data);
            router.push('/daily-report/team');
        });
    }, [router]);

    const logout = useCallback(() => {
        localStorage.removeItem('token');
        setUser(null);
        router.push('/login');
    }, [router]);

    const refreshProfile = useCallback(async () => {
        try {
            const { data } = await api.get('/users/me');
            setUser(data);
            return data;
        } catch (error) {
            console.error('Failed to refresh profile', error);
        }
    }, []);

    // Protect routes
    useEffect(() => {
        const publicPaths = ['/login', '/register', '/auth/callback', '/onboarding', '/pending-approval'];
        if (!isLoading) {
            if (!user && !publicPaths.includes(pathname)) {
                router.push('/login');
            } else if (user && user.status === 'PENDING' && pathname !== '/pending-approval') {
                router.push('/pending-approval');
            } else if (user && !user.orgId && pathname !== '/onboarding') {
                router.push('/onboarding');
            } else if (user && user.orgId && pathname === '/onboarding') {
                router.push('/daily-report/team'); // Already onboarded
            }
        }
    }, [user, isLoading, pathname, router]);

    return (
        <AuthContext.Provider value={{ user, login, logout, isLoading, refreshProfile }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};
