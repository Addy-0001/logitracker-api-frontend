import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/vue';
import Navbar from '@/components/Navbar.vue';
import { useAuthStore } from '@/stores/auth';

describe('Navbar', () => {
    beforeEach(() => {
        const authStore = useAuthStore();
        authStore.setAuthData({
            token: 'mock-token',
            user: { email: 'test@example.com', role: 'admin' },
            rememberMe: false,
        });
    });

    it('renders navigation links', () => {
        render(Navbar);
        expect(screen.getByText('LogiTracker')).toBeInTheDocument();
        expect(screen.getByText('Profile')).toBeInTheDocument();
        expect(screen.getByText('Logout')).toBeInTheDocument();
    });
});