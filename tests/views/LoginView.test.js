import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/vue';
import LoginView from '@/views/auth/Login/LoginView.vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

vi.mock('vue-router', () => ({
    RouterLink: vi.fn(),
    useRouter: vi.fn(() => ({
        push: vi.fn(),
    })),
}));

describe('LoginView', () => {
    let router, authStore;

    beforeEach(() => {
        router = useRouter();
        authStore = useAuthStore();
        authStore.token = null;
        authStore.user = null;
    });

    it('renders the login form', () => {
        render(LoginView);
        expect(screen.getByText('Welcome Back')).toBeInTheDocument();
        expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByText('Sign In')).toBeInTheDocument();
    });

    it('displays validation errors for empty fields', async () => {
        render(LoginView);
        await fireEvent.click(screen.getByText('Sign In'));
        expect(screen.getByText('Email is required')).toBeInTheDocument();
        expect(screen.getByText('Password is required')).toBeInTheDocument();
    });

    it('logs in successfully with valid credentials', async () => {
        render(LoginView);
        await fireEvent.update(screen.getByLabelText('Email Address'), 'admin@example.com');
        await fireEvent.update(screen.getByLabelText('Password'), 'password123');
        await fireEvent.click(screen.getByText('Sign In'));
        await waitFor(() => {
            expect(authStore.token).toBe('mock-token');
            expect(authStore.user).toEqual({ email: 'admin@example.com', role: 'admin' });
            expect(router.push).toHaveBeenCalledWith('/');
        });
    });

    it('displays error for invalid credentials', async () => {
        render(LoginView);
        await fireEvent.update(screen.getByLabelText('Email Address'), 'wrong@example.com');
        await fireEvent.update(screen.getByLabelText('Password'), 'wrongpassword');
        await fireEvent.click(screen.getByText('Sign In'));
        await waitFor(() => {
            expect(screen.getByText('Incorrect email or password. Please try again.')).toBeInTheDocument();
        });
    });
});