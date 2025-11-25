'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api from '@/lib/api';
import { useRouter, usePathname } from 'next/navigation';

interface User {
    id: string;
    email: string;
    fullName: string;
    roles: string[];
}

interface AuthContextType {
    user: User | null;
    login: (token: string) => void;
    logout: () => void;
    isLoading: boolean;
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
            router.push('/dashboard');
        });
    }, [router]);

    const logout = useCallback(() => {
        localStorage.removeItem('token');
        setUser(null);
        router.push('/login');
    }, [router]);

    // Protect routes
    useEffect(() => {
        const publicPaths = ['/login', '/register', '/auth/callback'];
        if (!isLoading && !user && !publicPaths.includes(pathname)) {
            router.push('/login');
        }
    }, [user, isLoading, pathname, router]);

    return (
        <AuthContext.Provider value={{ user, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};
