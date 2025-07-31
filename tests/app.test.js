import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/vue';
import App from '@/App.vue';
import { useAuthStore } from '@/stores/auth';

describe('App', () => {
    it('renders Navbar and BottomNavigation when authenticated', () => {
        const authStore = useAuthStore();
        authStore.token = 'mock-token';
        authStore.user = { role: 'admin' };
        render(App);
        expect(screen.getByText('LogiTracker')).toBeInTheDocument();
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
        expect(screen.getByText('Users')).toBeInTheDocument();
        expect(screen.getByText('Reports')).toBeInTheDocument();
        expect(screen.getByText('Profile')).toBeInTheDocument();
    });

    it('does not render Navbar and BottomNavigation when not authenticated', () => {
        const authStore = useAuthStore();
        authStore.token = null;
        authStore.user = null;
        render(App);
        expect(screen.queryByText('LogiTracker')).not.toBeInTheDocument();
        expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
    });
});