import { vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';

// Setup Pinia for testing
beforeEach(() => {
    setActivePinia(createPinia());
});