import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/vue';
import BottomNavigation from '@/components/BottomNavigation.vue';
import { useAuthStore } from '@/stores/auth';

describe('BottomNavigation', () => {
    beforeEach(() => {
        const authStore = useAuthStore();
        authStore.setAuthData({
            token: 'mock-token',
            user: { email: 'test@example.com', role: 'admin' },
            rememberMe: false,
        });
    });

    it('renders navigation items', () => {
        render(BottomNavigation);
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
        expect(screen.getByText('Users')).toBeInTheDocument();
        expect(screen.getByText('Reports')).toBeInTheDocument();
        expect(screen.getByText('Profile')).toBeInTheDocument();
    });

    it('highlights active route', () => {
        render(BottomNavigation, { props: { currentRoute: '/' } });
        const dashboardLink = screen.getByText('Dashboard').closest('a');
        expect(dashboardLink).toHaveClass('active'); // Assumes 'active' class is applied
    });
});