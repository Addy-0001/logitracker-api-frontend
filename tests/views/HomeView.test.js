import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/vue';
import LoginView from '@/views/auth/Login/LoginView.vue';

describe('LoginView', () => {
    it('renders the login form', () => {
        render(LoginView);
        expect(screen.getByText('Welcome Back')).toBeInTheDocument();
        expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByText('Sign In')).toBeInTheDocument();
        expect(screen.getByText('Remember me')).toBeInTheDocument();
    });

    it('updates form fields on user input', async () => {
        render(LoginView);
        await fireEvent.update(screen.getByLabelText('Email Address'), 'test@example.com');
        await fireEvent.update(screen.getByLabelText('Password'), 'password123');
        await fireEvent.click(screen.getByLabelText('Remember me'));

        expect(screen.getByLabelText('Email Address').value).toBe('test@example.com');
        expect(screen.getByLabelText('Password').value).toBe('password123');
        expect(screen.getByLabelText('Remember me').checked).toBe(true);
    });

    it('displays validation errors for empty fields', async () => {
        render(LoginView);
        await fireEvent.click(screen.getByText('Sign In'));
        expect(screen.getByText('Email is required')).toBeInTheDocument();
        expect(screen.getByText('Password is required')).toBeInTheDocument();
    });
});