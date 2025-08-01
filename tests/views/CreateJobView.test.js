import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/vue';
import CreateJobView from '@/views/core/Home/CreateJobView.vue';
import { useAuthStore } from '@/stores/auth';

describe('CreateJobView', () => {
    beforeEach(() => {
        const authStore = useAuthStore();
        authStore.setAuthData({
            token: 'mock-token',
            user: { email: 'test@example.com', role: 'admin' },
            rememberMe: false,
        });
    });

    it('renders the create job form', () => {
        render(CreateJobView);
        expect(screen.getByText('Create New Job')).toBeInTheDocument();
        expect(screen.getByLabelText('Customer Name *')).toBeInTheDocument();
        expect(screen.getByLabelText('Email *')).toBeInTheDocument();
        expect(screen.getByLabelText('Phone *')).toBeInTheDocument();
        expect(screen.getByLabelText('Pickup Address *')).toBeInTheDocument();
        expect(screen.getByLabelText('Delivery Address *')).toBeInTheDocument();
        expect(screen.getByLabelText('Assign Driver *')).toBeInTheDocument();
        expect(screen.getByText('Create Job')).toBeInTheDocument();
    });

    it('updates form fields on user input', async () => {
        render(CreateJobView);
        await fireEvent.update(screen.getByLabelText('Customer Name *'), 'Test Customer');
        await fireEvent.update(screen.getByLabelText('Email *'), 'test@example.com');
        await fireEvent.update(screen.getByLabelText('Phone *'), '+9771234567890');
        await fireEvent.update(screen.getByLabelText('Pickup Address *'), 'Kathmandu');
        await fireEvent.update(screen.getByLabelText('Delivery Address *'), 'Pokhara');

        expect(screen.getByLabelText('Customer Name *').value).toBe('Test Customer');
        expect(screen.getByLabelText('Email *').value).toBe('test@example.com');
        expect(screen.getByLabelText('Phone *').value).toBe('+9771234567890');
        expect(screen.getByLabelText('Pickup Address *').value).toBe('Kathmandu');
        expect(screen.getByLabelText('Delivery Address *').value).toBe('Pokhara');
    });

    it('displays validation errors when required fields are empty', async () => {
        render(CreateJobView);
        await fireEvent.click(screen.getByText('Create Job'));
        expect(screen.getByText('Customer name is required')).toBeInTheDocument();
        expect(screen.getByText('Customer email is required')).toBeInTheDocument();
        expect(screen.getByText('Customer phone is required')).toBeInTheDocument();
        expect(screen.getByText('Pickup address is required')).toBeInTheDocument();
        expect(screen.getByText('Delivery address is required')).toBeInTheDocument();
        expect(screen.getByText('Please assign a driver')).toBeInTheDocument();
    });
});