import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useAuthStore } from '@/stores/auth';

describe('Auth Store', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
        localStorage.clear();
        sessionStorage.clear();
    });

    it('sets auth data with rememberMe true', () => {
        const authStore = useAuthStore();
        authStore.setAuthData({
            token: 'mock-token',
            user: { email: 'test@example.com', role: 'admin' },
            rememberMe: true,
        });
        expect(authStore.token).toBe('mock-token');
        expect(authStore.user).toEqual({ email: 'test@example.com', role: 'admin' });
        expect(localStorage.getItem('authToken')).toBe('mock-token');
        expect(JSON.parse(localStorage.getItem('user'))).toEqual({ email: 'test@example.com', role: 'admin' });
    });

    it('sets auth data with rememberMe false', () => {
        const authStore = useAuthStore();
        authStore.setAuthData({
            token: 'mock-token',
            user: { email: 'test@example.com', role: 'admin' },
            rememberMe: false,
        });
        expect(authStore.token).toBe('mock-token');
        expect(authStore.user).toEqual({ email: 'test@example.com', role: 'admin' });
        expect(sessionStorage.getItem('authToken')).toBe('mock-token');
        expect(JSON.parse(sessionStorage.getItem('user'))).toEqual({ email: 'test@example.com', role: 'admin' });
    });

    it('logs out and clears storage', () => {
        const authStore = useAuthStore();
        authStore.setAuthData({
            token: 'mock-token',
            user: { email: 'test@example.com', role: 'admin' },
            rememberMe: true,
        });
        authStore.logout();
        expect(authStore.token).toBeNull();
        expect(authStore.user).toBeNull();
        expect(localStorage.getItem('authToken')).toBeNull();
        expect(localStorage.getItem('user')).toBeNull();
        expect(sessionStorage.getItem('authToken')).toBeNull();
        expect(sessionStorage.getItem('user')).toBeNull();
    });
});