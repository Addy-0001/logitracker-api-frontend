import L from 'leaflet';
import { MaptilerLayer } from '@maptiler/sdk';

// MapTiler API key (loaded from environment)
const MAPTILER_API_KEY = import.meta.env.VITE_MAPTILER_API_KEY || 'YOUR_MAPTILER_API_KEY_HERE';

// Nepal bounds for map restriction
const NEPAL_BOUNDS = [
    [26, 80], // Southwest
    [30, 88], // Northeast
];

// Map configuration
export const mapConfig = {
    apiKey: MAPTILER_API_KEY,
    container: 'tracking-map',
    options: {
        center: [27.7172, 85.3240], // Kathmandu, Nepal
        zoom: 7,
        minZoom: 6,
        maxZoom: 18,
        maxBounds: NEPAL_BOUNDS,
        maxBoundsViscosity: 1.0,
    },
    tileLayers: {
        maptiler: {
            layer: (map) =>
                new MaptilerLayer({
                    apiKey: MAPTILER_API_KEY,
                    style: 'streets-v2',
                }).addTo(map),
            attribution:
                '© <a href="https://www.maptiler.com/copyright/" target="_blank">MapTiler</a> ' +
                '© <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap contributors</a>',
        },
    },
    markerIcons: {
        pickup: L.icon({
            iconUrl: '/icons/pickup.png',
            iconSize: [32, 32],
            iconAnchor: [16, 32],
            popupAnchor: [0, -32],
        }),
        delivery: L.icon({
            iconUrl: '/icons/delivery.png',
            iconSize: [32, 32],
            iconAnchor: [16, 32],
            popupAnchor: [0, -32],
        }),
        current: L.icon({
            iconUrl: '/icons/vehicle.png',
            iconSize: [32, 32],
            iconAnchor: [16, 32],
            popupAnchor: [0, -32],
        }),
    },
};

// Function to add markers for job coordinates
export const addJobMarkers = (map, job) => {
    if (!job || !map) return;

    // Pickup marker
    if (job.pickupCoords && Array.isArray(job.pickupCoords) && job.pickupCoords.length === 2) {
        L.marker(job.pickupCoords, { icon: mapConfig.markerIcons.pickup })
            .addTo(map)
            .bindPopup(`< b > Pickup Location</b > <br>${job.pickupLocation}<br>Completed: ${job.pickupTime}`);
    }

    // Delivery marker
    if (job.deliveryCoords && Array.isArray(job.deliveryCoords) && job.deliveryCoords.length === 2) {
        L.marker(job.deliveryCoords, { icon: mapConfig.markerIcons.delivery })
            .addTo(map)
            .bindPopup(`<b>Delivery Location</b><br>${job.deliveryLocation}<br>ETA: ${job.eta}`);
    }

    // Current location marker
    if (job.currentCoords && Array.isArray(job.currentCoords) && job.currentCoords.length === 2) {
        L.marker(job.currentCoords, { icon: mapConfig.markerIcons.current })
            .addTo(map)
            .bindPopup(`<b>Current Location</b><br>${job.currentLocation}<br>Driver: ${job.driverInfo?.name || 'Unknown'}`);
    }
};