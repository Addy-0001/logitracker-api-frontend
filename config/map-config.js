export const MapConfig = {
    // Default map settings
    defaultCenter: [27.7172, 85.3240], // Center of Nepal (Kathmandu)
    defaultZoom: 7,
    maxZoom: 18,
    minZoom: 6, // Prevent excessive tile loads at low zoom
    maxBounds: [
        [26, 80], // Southwest Nepal
        [30, 88], // Northeast Nepal
    ],
    maxBoundsViscosity: 1.0, // Prevent panning outside bounds

    // Tile layer configuration
    tileLayers: {
        osm: {
            url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 18,
            subdomains: ['a', 'b', 'c'],
            tileSize: 256,
            useCache: true, // Enable client-side caching
            cacheMaxAge: 24 * 60 * 60 * 1000, // Cache tiles for 24 hours
            cacheEmptyTile: false, // Don't cache empty tiles
        },
    },

    // Marker configurations
    markers: {
        pickup: {
            iconUrl:
                'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAiIGhlaWdodD0iMzAiIHZpZXdCb3g9IjAgMCAzMCAzMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTUiIGN5PSIxNSIgcj0iMTUiIGZpbGw9IiMyOGE3NDUiLz4KPHN2ZyB4PSI3IiB5PSI3IiB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0id2hpdGUiPgo8cGF0aCBkPSJNMTIgMkM2LjQ4IDIgMiA2LjQ4IDIgMTJzNC40OCAxMCAxMCAxMCAxMC00LjQ4IDEwLTEwUzE3LjUyIDIgMTIgMnptLTIgMTVsLTUtNSAxLjQxLTEuNDFMMTAgMTQuMTdsNy41OS03LjU5TDE5IDhsLTkgOXoiLz4KPC9zdmc+Cjwvc3ZnPgo=',
            iconSize: [30, 30],
            iconAnchor: [15, 15],
            popupAnchor: [0, -15],
        },
        delivery: {
            iconUrl:
                'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAiIGhlaWdodD0iMzAiIHZpZXdCb3g9IjAgMCAzMCAzMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTUiIGN5PSIxNSIgcj0iMTUiIGZpbGw9IiNkYzM1NDUiLz4KPHN2ZyB4PSI3IiB5PSI3IiB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0id2hpdGUiPgo8cGF0aCBkPSJNMTIgMkM4LjEzIDIgNSA1LjEzIDUgOWMwIDUuMjUgNyAxMyA3IDEzczctNy43NSA3LTEzYzAtMy44Ny0zLjEzLTctNy03em0wIDkuNWMtMS4zOCAwLTIuNS0xLjEyLTIuNS0yLjVzMS4xMi0yLjUgMi41LTIuNSAyLjUgMS4xMiAyLjUgMi41LTEuMTIgMi41LTIuNSAyLjV6Ii8+Cjwvc3ZnPgo8L3N2Zz4K',
            iconSize: [30, 30],
            iconAnchor: [15, 15],
            popupAnchor: [0, -15],
        },
        vehicle: {
            iconUrl:
                'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAiIGhlaWdodD0iMzAiIHZpZXdCb3g9IjAgMCAzMCAzMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTUiIGN5PSIxNSIgcj0iMTUiIGZpbGw9IiM3MjA3MDciLz4KPHN2ZyB4PSI3IiB5PSI3IiB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0id2hpdGUiPgo8cGF0aCBkPSJNMjAgOGgtM1Y0SDNjLTEuMTEgMC0yIC44OS0yIDJ2MTFoMmMwIDEuNjYgMS4zNCAzIDMgM3MzLTEuMzQgMy0zaDZjMCAxLjY2IDEuMzQgMyAzIDNzMy0xLjM0IDMtM2gydi0yYzAtMi43Ni0yLjI0LTUtNS01ek02IDEzLjVjLS44MyAwLTEuNS0uNjctMS41LTEuNXMuNjctMS41IDEuNS0xLjUgMS41LjY3IDEuNSAxLjUtLjY3IDEuNS0xLjUgMS41em0xMy41IDQuNWMtLjgzIDAtMS41LS42Ny0xLjUtMS41cy42Ny0xLjUgMS41LTEuNSAxLjUuNjcgMS41IDEuNS0uNjcgMS41LTEuNSAxLjV6Ii8+Cjwvc3ZnPgo8L3N2Zz4K',
            iconSize: [30, 30],
            iconAnchor: [15, 15],
            popupAnchor: [0, -15],
        },
    },

    // Route styling
    routeStyles: {
        default: {
            color: '#720707',
            weight: 4,
            opacity: 0.7,
        },
    },

    // Popup options
    popupOptions: {
        maxWidth: 300,
        className: 'custom-popup',
        closeButton: true,
        autoClose: false,
    },

    // Update intervals (in milliseconds)
    updateIntervals: {
        vehiclePosition: 120000, // 120 seconds to reduce requests
    },

    // Retry settings
    retrySettings: {
        maxRetries: 2, // Reduced to avoid overwhelming server
        retryDelay: 5000, // 5 seconds to spread out retries
    },
};

// Utility functions for map operations
export const MapUtils = {
    // Calculate distance between two points (Haversine formula)
    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Earth's radius in kilometers
        const dLat = this.toRadians(lat2 - lat1);
        const dLon = this.toRadians(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    },

    // Convert degrees to radians
    toRadians(degrees) {
        return degrees * (Math.PI / 180);
    },

    // Format coordinates for display
    formatCoordinates(lat, lng, precision = 4) {
        return `${lat.toFixed(precision)}, ${lng.toFixed(precision)}`;
    },

    // Create bounds from coordinate array
    createBounds(coordinates) {
        if (!coordinates || coordinates.length === 0) return null;
        let minLat = coordinates[0][0];
        let maxLat = coordinates[0][0];
        let minLng = coordinates[0][1];
        let maxLng = coordinates[0][1];
        coordinates.forEach((coord) => {
            minLat = Math.min(minLat, coord[0]);
            maxLat = Math.max(maxLat, coord[0]);
            minLng = Math.min(minLng, coord[1]);
            maxLng = Math.max(maxLng, coord[1]);
        });
        return [
            [minLat, minLng],
            [maxLat, maxLng],
        ];
    },

    // Validate coordinates
    isValidCoordinate(lat, lng) {
        return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
    },

    // Validate Nepal-specific coordinates
    isValidNepalCoordinate(lat, lng) {
        return lat >= 26 && lat <= 30 && lng >= 80 && lng <= 88;
    },
};

export default MapConfig;