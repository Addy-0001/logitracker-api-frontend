import { vi } from 'vitest';
import { createTestingPinia } from '@pinia/testing';
import { setActivePinia } from 'pinia';
import { mswServer } from './mocks/handlers';

// Setup Pinia for testing
beforeEach(() => {
    setActivePinia(createTestingPinia({ createSpy: vi.fn }));
});

// Setup MSW for API mocking
// beforeAll(() => mswServer.listen());
// afterEach(() => mswServer.resetHandlers());
// afterAll(() => mswServer.close());

// Mock global dependencies
vi.mock('maplibre-gl', () => ({
    Map: vi.fn(() => ({
        on: vi.fn(),
        addControl: vi.fn(),
        remove: vi.fn(),
        setCenter: vi.fn(),
        setZoom: vi.fn(),
        fitBounds: vi.fn(),
    })),
    Marker: vi.fn(() => ({
        setLngLat: vi.fn().mockReturnThis(),
        setPopup: vi.fn().mockReturnThis(),
        addTo: vi.fn().mockReturnThis(),
        remove: vi.fn(),
    })),
    Popup: vi.fn(() => ({
        setHTML: vi.fn().mockReturnThis(),
    })),
    NavigationControl: vi.fn(),
    LngLatBounds: vi.fn(() => ({
        extend: vi.fn(),
        isEmpty: vi.fn(() => false),
    })),
}));