
<template>
    <div class="job-details-container">
        <!-- Loading State -->
        <div v-if="isLoading" class="loading-state">
            <div class="loading-spinner">
                <div class="spinner-ring"></div>
                <div class="spinner-ring"></div>
                <div class="spinner-ring"></div>
            </div>
            <p>Loading job details...</p>
        </div>

        <!-- Error State -->
        <div v-if="errorMessage" class="error-state">
            <div class="error-icon">
                <i class="fas fa-exclamation-circle"></i>
            </div>
            <h3>Unable to load job details</h3>
            <p>{{ errorMessage }}</p>
            <button @click="fetchJobDetails" class="retry-btn">
                <i class="fas fa-redo"></i>
                Try Again
            </button>
        </div>

        <!-- Job Details Content -->
        <div v-else-if="jobDetails" class="job-details-content">
            <!-- Header Section -->
            <div class="job-header">
                <div class="header-content">
                    <div class="header-left">
                        <button @click="goBack" class="back-btn">
                            <i class="fas fa-arrow-left"></i>
                            Back to Dashboard
                        </button>
                        <div class="job-title">
                            <h1>Job Details</h1>
                            <div class="job-id-section">
                                <span class="job-id">{{ jobDetails._id.slice(-8) }}</span>
                                <span v-if="jobDetails.isUrgent" class="urgent-badge">
                                    <i class="fas fa-exclamation-circle"></i>
                                    URGENT
                                </span>
                            </div>
                        </div>
                    </div>
                    <div class="header-right">
                        <div class="status-section">
                            <span :class="['status-badge', jobDetails.status]">
                                <i :class="getStatusIcon(jobDetails.status)"></i>
                                {{ formatStatus(jobDetails.status) }}
                            </span>
                        </div>
                        <div class="header-actions">
                            <button @click="toggleLiveTracking" class="track-btn" :class="{ active: isLiveTracking }">
                                <i :class="['fas', isLiveTracking ? 'fa-pause' : 'fa-play']"></i>
                                {{ isLiveTracking ? 'Pause Tracking' : 'Start Live Tracking' }}
                            </button>
                            <button @click="contactCustomer" class="contact-btn">
                                <i class="fas fa-phone"></i>
                                Contact
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Main Content Grid -->
            <div class="main-content">
                <!-- Left Panel - Job Information -->
                <div class="left-panel">
                    <!-- Customer Information Card -->
                    <div class="info-card customer-card">
                        <div class="card-header">
                            <div class="card-icon customer">
                                <i class="fas fa-user"></i>
                            </div>
                            <h3>Customer Information</h3>
                        </div>
                        <div class="card-content">
                            <div class="customer-details">
                                <div class="customer-avatar">
                                    <span>{{ getCustomerInitials(jobDetails.pickupInfo.name) }}</span>
                                </div>
                                <div class="customer-info">
                                    <h4>{{ jobDetails.pickupInfo.name }}</h4>
                                    <p class="customer-email">{{ jobDetails.pickupInfo.email }}</p>
                                    <p class="customer-phone">{{ jobDetails.pickupInfo.phone }}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Driver Information Card -->
                    <div class="info-card driver-card" v-if="jobDetails.driverInfo">
                        <div class="card-header">
                            <div class="card-icon driver">
                                <i class="fas fa-user-tie"></i>
                            </div>
                            <h3>Assigned Driver</h3>
                        </div>
                        <div class="card-content">
                            <div class="driver-details">
                                <div class="driver-avatar">
                                    <span>{{ getDriverInitials(jobDetails.driverInfo.name) }}</span>
                                </div>
                                <div class="driver-info">
                                    <h4>{{ jobDetails.driverInfo.name }}</h4>
                                    <p class="driver-phone">{{ jobDetails.driverInfo.phone }}</p>
                                    <div class="driver-status online">
                                        <div class="status-dot"></div>
                                        <span>Online</span>
                                    </div>
                                </div>
                            </div>
                            <div class="driver-actions">
                                <button @click="callDriver" class="driver-action-btn">
                                    <i class="fas fa-phone"></i>
                                    Call
                                </button>
                                <button @click="messageDriver" class="driver-action-btn">
                                    <i class="fas fa-message"></i>
                                    Message
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Route Information Card -->
                    <div class="info-card route-card">
                        <div class="card-header">
                            <div class="card-icon route">
                                <i class="fas fa-route"></i>
                            </div>
                            <h3>Route Details</h3>
                        </div>
                        <div class="card-content">
                            <div class="route-details">
                                <div class="route-point pickup">
                                    <div class="point-marker">
                                        <i class="fas fa-circle"></i>
                                    </div>
                                    <div class="point-info">
                                        <span class="point-label">Pickup Location</span>
                                        <p class="point-address">{{ formatAddress(jobDetails.pickupInfo) }}</p>
                                        <p class="point-contact">{{ jobDetails.pickupInfo.name }} • {{
                                            jobDetails.pickupInfo.phone }}</p>
                                    </div>
                                </div>

                                <div class="route-connector">
                                    <div class="connector-line"></div>
                                    <div class="distance-info" v-if="routeDistance">
                                        <span>{{ routeDistance }} km</span>
                                        <span>{{ routeDuration }}</span>
                                    </div>
                                </div>

                                <div class="route-point delivery">
                                    <div class="point-marker">
                                        <i class="fas fa-map-marker-alt"></i>
                                    </div>
                                    <div class="point-info">
                                        <span class="point-label">Delivery Location</span>
                                        <p class="point-address">{{ formatAddress(jobDetails.dropoffInfo) }}</p>
                                        <p class="point-contact">{{ jobDetails.dropoffInfo.name }} • {{
                                            jobDetails.dropoffInfo.phone }}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Job Progress Card -->
                    <div class="info-card progress-card">
                        <div class="card-header">
                            <div class="card-icon progress">
                                <i class="fas fa-tasks"></i>
                            </div>
                            <h3>Job Progress</h3>
                        </div>
                        <div class="card-content">
                            <div class="progress-overview">
                                <div class="progress-stats">
                                    <div class="progress-percentage">{{ jobProgress }}%</div>
                                    <div class="progress-label">Complete</div>
                                </div>
                                <div class="progress-bar-container">
                                    <div class="progress-bar">
                                        <div class="progress-fill" :style="{ width: jobProgress + '%' }"
                                            :class="jobDetails.status"></div>
                                    </div>
                                </div>
                            </div>

                            <div class="progress-timeline">
                                <div class="timeline-item" :class="{ completed: jobProgress >= 0 }">
                                    <div class="timeline-marker"></div>
                                    <div class="timeline-content">
                                        <h5>Job Created</h5>
                                        <p>{{ formatDateTime(jobDetails.createdAt) }}</p>
                                    </div>
                                </div>

                                <div class="timeline-item" :class="{ completed: jobProgress >= 25 }">
                                    <div class="timeline-marker"></div>
                                    <div class="timeline-content">
                                        <h5>Driver Assigned</h5>
                                        <p v-if="jobDetails.driverInfo">{{ jobDetails.driverInfo.name }}</p>
                                        <p v-else class="pending">Pending assignment</p>
                                    </div>
                                </div>

                                <div class="timeline-item" :class="{ completed: jobProgress >= 50 }">
                                    <div class="timeline-marker"></div>
                                    <div class="timeline-content">
                                        <h5>En Route to Pickup</h5>
                                        <p v-if="jobProgress >= 50">Driver heading to pickup location</p>
                                        <p v-else class="pending">Waiting for driver</p>
                                    </div>
                                </div>

                                <div class="timeline-item" :class="{ completed: jobProgress >= 75 }">
                                    <div class="timeline-marker"></div>
                                    <div class="timeline-content">
                                        <h5>Package Collected</h5>
                                        <p v-if="jobProgress >= 75">En route to delivery</p>
                                        <p v-else class="pending">Awaiting pickup</p>
                                    </div>
                                </div>

                                <div class="timeline-item" :class="{ completed: jobProgress >= 100 }">
                                    <div class="timeline-marker"></div>
                                    <div class="timeline-content">
                                        <h5>Delivered</h5>
                                        <p v-if="jobProgress >= 100">Package delivered successfully</p>
                                        <p v-else class="pending">In transit</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Additional Information Card -->
                    <div class="info-card additional-card">
                        <div class="card-header">
                            <div class="card-icon additional">
                                <i class="fas fa-info-circle"></i>
                            </div>
                            <h3>Additional Information</h3>
                        </div>
                        <div class="card-content">
                            <div class="additional-details">
                                <div class="detail-row">
                                    <span class="detail-label">Special Instructions:</span>
                                    <span class="detail-value">{{ jobDetails.note || 'None' }}</span>
                                </div>

                                <div class="detail-row">
                                    <span class="detail-label">Add-ons:</span>
                                    <div class="addons-list">
                                        <span v-if="jobDetails.addOns?.fragileItems" class="addon-tag fragile">
                                            <i class="fas fa-fragile"></i>
                                            Fragile Items
                                        </span>
                                        <span v-if="jobDetails.addOns?.heavyItem" class="addon-tag heavy">
                                            <i class="fas fa-weight-hanging"></i>
                                            Heavy Item
                                        </span>
                                        <span v-if="!jobDetails.addOns?.fragileItems && !jobDetails.addOns?.heavyItem"
                                            class="addon-tag none">
                                            No special requirements
                                        </span>
                                    </div>
                                </div>

                                <div class="detail-row">
                                    <span class="detail-label">Created:</span>
                                    <span class="detail-value">{{ formatDateTime(jobDetails.createdAt) }}</span>
                                </div>

                                <div class="detail-row">
                                    <span class="detail-label">Last Updated:</span>
                                    <span class="detail-value">{{ formatDateTime(jobDetails.updatedAt) }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Right Panel - Live Tracking Map -->
                <div class="right-panel">
                    <div class="map-card">
                        <div class="map-header">
                            <h3>
                                <i class="fas fa-map-marked-alt"></i>
                                Live Tracking
                            </h3>
                            <div class="map-controls">
                                <button @click="centerMap" class="map-control-btn" title="Center Map">
                                    <i class="fas fa-crosshairs"></i>
                                </button>
                                <button @click="fitRoute" class="map-control-btn" title="Fit Route">
                                    <i class="fas fa-expand-arrows-alt"></i>
                                </button>
                                <button @click="toggleMapStyle" class="map-control-btn" title="Toggle Style">
                                    <i class="fas fa-layer-group"></i>
                                </button>
                                <button @click="refreshLocation" class="map-control-btn" title="Refresh Location"
                                    :disabled="isRefreshingLocation">
                                    <i :class="['fas fa-sync-alt', { 'fa-spin': isRefreshingLocation }]"></i>
                                </button>
                            </div>
                        </div>

                        <div class="map-container">
                            <div id="job-tracking-map" class="map"></div>

                            <!-- Map Legend -->
                            <div class="map-legend">
                                <div class="legend-title">Legend</div>
                                <div class="legend-items">
                                    <div class="legend-item">
                                        <div class="legend-marker pickup"></div>
                                        <span>Pickup Location</span>
                                    </div>
                                    <div class="legend-item">
                                        <div class="legend-marker delivery"></div>
                                        <span>Delivery Location</span>
                                    </div>
                                    <div class="legend-item" v-if="driverLocation">
                                        <div class="legend-marker driver"></div>
                                        <span>Driver Location</span>
                                    </div>
                                    <div class="legend-item">
                                        <div class="legend-line route"></div>
                                        <span>Planned Route</span>
                                    </div>
                                </div>
                            </div>

                            <!-- Driver Location Info -->
                            <div v-if="driverLocation" class="driver-location-info">
                                <div class="location-header">
                                    <i class="fas fa-truck"></i>
                                    <span>Driver Location</span>
                                    <div class="last-updated">
                                        Updated {{ formatRelativeTime(driverLocation.timestamp) }}
                                    </div>
                                </div>
                                <div class="location-details">
                                    <p>{{ driverLocation.address || 'Fetching address...' }}</p>
                                    <div class="location-coords">
                                        {{ driverLocation.latitude?.toFixed(6) }}, {{
                                            driverLocation.longitude?.toFixed(6) }}
                                    </div>
                                </div>
                            </div>

                            <!-- Map Loading Overlay -->
                            <div v-if="isMapLoading" class="map-loading">
                                <div class="loading-content">
                                    <i class="fas fa-spinner fa-spin"></i>
                                    <p>Loading map...</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import apiClient from '@/api/axios';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

// Reactive data
const jobDetails = ref(null);
const isLoading = ref(false);
const errorMessage = ref('');
const isLiveTracking = ref(false);
const isMapLoading = ref(false);
const isRefreshingLocation = ref(false);

// Map related
const map = ref(null);
const mapStyle = ref('streets-v2');
const driverLocation = ref(null);
const routeDistance = ref(null);
const routeDuration = ref(null);

// Map markers
const pickupMarker = ref(null);
const deliveryMarker = ref(null);
const driverMarker = ref(null);

// Tracking interval
const trackingInterval = ref(null);

// Environment variables
const mapTilerKey = import.meta.env.VITE_MAPTILER_API_KEY || "pj6JP8mcZoHH4whFRfMA";
const orsKey = import.meta.env.VITE_ORS_API_KEY;

// Computed properties
const jobProgress = computed(() => {
    if (!jobDetails.value) return 0;

    const progressMap = {
        'pending': 0,
        'assigned': 25,
        'in-transit': 50,
        'out-for-delivery': 75,
        'delivered': 100,
        'delayed': 30,
        'cancelled': 0
    };

    return progressMap[jobDetails.value.status] || 0;
});

// Methods
const fetchJobDetails = async () => {
    isLoading.value = true;
    errorMessage.value = '';

    try {
        const jobId = route.params.id;
        const response = await apiClient.get(`/job/getJobById/${jobId}`);

        if (response.data && response.data.success && response.data.job) {
            jobDetails.value = response.data.job;
            console.log('Job details fetched:', jobDetails.value); // Debug log
            await nextTick(); // Ensure DOM is updated
            await initializeMap();
            await calculateRoute();
        } else {
            throw new Error('Job not found');
        }
    } catch (error) {
        console.error('Error fetching job details:', error);
        errorMessage.value = error.response?.data?.message || 'Failed to load job details';
    } finally {
        isLoading.value = false;
    }
};

const initializeMap = async () => {
    if (!jobDetails.value) return;

    try {
        isMapLoading.value = true;
        const mapContainer = document.getElementById('job-tracking-map');
        if (!mapContainer) {
            console.error('Map container not found');
            errorMessage.value = 'Map container not found. Please try again.';
            isMapLoading.value = false;
            return;
        }

        map.value = new maplibregl.Map({
            container: 'job-tracking-map',
            style: `https://api.maptiler.com/maps/${mapStyle.value}/style.json?key=${mapTilerKey}`,
            center: [85.324, 27.7172], // Kathmandu, Nepal
            zoom: 12,
            attributionControl: true,
            maxBounds: [
                [80.058, 26.347], // Southwest
                [88.2015, 30.447], // Northeast
            ]
        });

        map.value.on('load', () => {
            console.log('Map loaded successfully');
            addMapMarkers();
            isMapLoading.value = false;
        });

        map.value.on('error', (e) => {
            console.error('Map error:', e.error);
            errorMessage.value = 'Failed to load map. Please try again later.';
            isMapLoading.value = false;
        });

        map.value.addControl(new maplibregl.NavigationControl(), 'top-right');
    } catch (error) {
        console.error('Error initializing map:', error);
        errorMessage.value = 'Failed to initialize map. Please try again later.';
        isMapLoading.value = false;
    }
};

const addMapMarkers = () => {
    if (!map.value || !jobDetails.value) return;

    // Add pickup marker
    if (jobDetails.value.pickupInfo.latitude && jobDetails.value.pickupInfo.longitude) {
        const pickupCoords = [
            parseFloat(jobDetails.value.pickupInfo.longitude),
            parseFloat(jobDetails.value.pickupInfo.latitude)
        ];

        const pickupEl = document.createElement('div');
        pickupEl.className = 'custom-marker pickup';
        pickupEl.innerHTML = '<i class="fas fa-circle"></i>';

        pickupMarker.value = new maplibregl.Marker(pickupEl)
            .setLngLat(pickupCoords)
            .setPopup(new maplibregl.Popup().setHTML(`
                <div class="marker-popup">
                    <h4>Pickup Location</h4>
                    <p><strong>${jobDetails.value.pickupInfo.name}</strong></p>
                    <p>${jobDetails.value.pickupInfo.phone}</p>
                    <p>${formatAddress(jobDetails.value.pickupInfo)}</p>
                </div>
            `))
            .addTo(map.value);
    }

    // Add delivery marker
    if (jobDetails.value.dropoffInfo.latitude && jobDetails.value.dropoffInfo.longitude) {
        const deliveryCoords = [
            parseFloat(jobDetails.value.dropoffInfo.longitude),
            parseFloat(jobDetails.value.dropoffInfo.latitude)
        ];

        const deliveryEl = document.createElement('div');
        deliveryEl.className = 'custom-marker delivery';
        deliveryEl.innerHTML = '<i class="fas fa-map-marker-alt"></i>';

        deliveryMarker.value = new maplibregl.Marker(deliveryEl)
            .setLngLat(deliveryCoords)
            .setPopup(new maplibregl.Popup().setHTML(`
                <div class="marker-popup">
                    <h4>Delivery Location</h4>
                    <p><strong>${jobDetails.value.dropoffInfo.name}</strong></p>
                    <p>${jobDetails.value.dropoffInfo.phone}</p>
                    <p>${formatAddress(jobDetails.value.dropoffInfo)}</p>
                </div>
            `))
            .addTo(map.value);
    }
};

const calculateRoute = async () => {
    if (!jobDetails.value || !orsKey) return;

    try {
        const pickupLat = parseFloat(jobDetails.value.pickupInfo.latitude);
        const pickupLng = parseFloat(jobDetails.value.pickupInfo.longitude);
        const deliveryLat = parseFloat(jobDetails.value.dropoffInfo.latitude);
        const deliveryLng = parseFloat(jobDetails.value.dropoffInfo.longitude);

        if (isNaN(pickupLat) || isNaN(pickupLng) || isNaN(deliveryLat) || isNaN(deliveryLng)) {
            console.error('Invalid coordinates:', {
                pickupLat,
                pickupLng,
                deliveryLat,
                deliveryLng
            });
            errorMessage.value = 'Invalid coordinates for route calculation.';
            return;
        }

        const pickupCoords = [pickupLng, pickupLat];
        const deliveryCoords = [deliveryLng, deliveryLat];

        const requestBody = {
            coordinates: [pickupCoords, deliveryCoords],
            profile: 'driving-car',
            format: 'geojson',
            instructions: false
        };

        const response = await fetch(
            'https://api.openrouteservice.org/v2/directions/driving-car/geojson',
            {
                method: 'POST',
                headers: {
                    'Authorization': orsKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            }
        );

        if (response.ok) {
            const data = await response.json();
            console.log('ORS API response:', data); // Debug log
            if (data.features && data.features.length > 0 && data.features[0].properties?.summary) {
                const route = data.features[0];
                routeDistance.value = (route.properties.summary.distance / 1000).toFixed(1); // Convert meters to km
                routeDuration.value = formatDuration(route.properties.summary.duration); // Duration in seconds
                displayRouteOnMap(route.geometry);
            } else {
                console.error('Invalid route data:', data);
                errorMessage.value = 'Failed to calculate route: Invalid data returned.';
            }
        } else {
            const errorData = await response.json();
            console.error('ORS API request failed:', response.status, errorData);
            errorMessage.value = errorData.message || 'Failed to calculate route.';
        }
    } catch (error) {
        console.error('Error calculating route:', error);
        errorMessage.value = 'Failed to calculate route. Please try again.';
    }
};

const displayRouteOnMap = (geometry) => {
    if (!map.value) return;

    // Remove existing route
    if (map.value.getSource('route')) {
        map.value.removeLayer('route');
        map.value.removeSource('route');
    }

    // Add route source and layer
    map.value.addSource('route', {
        type: 'geojson',
        data: {
            type: 'Feature',
            geometry: geometry
        }
    });

    map.value.addLayer({
        id: 'route',
        type: 'line',
        source: 'route',
        layout: {
            'line-join': 'round',
            'line-cap': 'round'
        },
        paint: {
            'line-color': '#720707',
            'line-width': 4,
            'line-opacity': 0.8
        }
    });
};

const toggleLiveTracking = () => {
    isLiveTracking.value = !isLiveTracking.value;

    if (isLiveTracking.value) {
        startLiveTracking();
    } else {
        stopLiveTracking();
    }
};

const startLiveTracking = () => {
    fetchDriverLocation();
    trackingInterval.value = setInterval(fetchDriverLocation, 30000); // Update every 30 seconds
};

const stopLiveTracking = () => {
    if (trackingInterval.value) {
        clearInterval(trackingInterval.value);
        trackingInterval.value = null;
    }
};

const fetchDriverLocation = async () => {
    if (!jobDetails.value?._id) return;

    try {
        const response = await apiClient.get(`/coordinate/getAllCoord/${jobDetails.value._id}`);

        if (response.data && response.data.length > 0) {
            const latestCoord = response.data[response.data.length - 1];

            if (latestCoord.latitude && latestCoord.longitude) {
                driverLocation.value = {
                    latitude: parseFloat(latestCoord.latitude),
                    longitude: parseFloat(latestCoord.longitude),
                    timestamp: latestCoord.timestamp || new Date(),
                    address: null
                };

                updateDriverMarker();
                await reverseGeocode(driverLocation.value.latitude, driverLocation.value.longitude);
            }
        }
    } catch (error) {
        console.error('Error fetching driver location:', error);
    }
};

const updateDriverMarker = () => {
    if (!map.value || !driverLocation.value) return;

    const coords = [driverLocation.value.longitude, driverLocation.value.latitude];

    if (driverMarker.value) {
        driverMarker.value.remove();
    }

    const driverEl = document.createElement('div');
    driverEl.className = 'custom-marker driver';
    driverEl.innerHTML = '<i class="fas fa-truck"></i>';

    driverMarker.value = new maplibregl.Marker(driverEl)
        .setLngLat(coords)
        .setPopup(new maplibregl.Popup().setHTML(`
            <div class="marker-popup">
                <h4>Driver Location</h4>
                <p><strong>${jobDetails.value.driverInfo?.name || 'Driver'}</strong></p>
                <p>Last updated: ${formatRelativeTime(driverLocation.value.timestamp)}</p>
                <p>${driverLocation.value.address || 'Fetching address...'}</p>
            </div>
        `))
        .addTo(map.value);
};

const reverseGeocode = async (lat, lng) => {
    try {
        const response = await fetch(
            `https://api.maptiler.com/geocoding/${lat},${lng}.json?key=${mapTilerKey}`
        );

        if (response.ok) {
            const data = await response.json();
            if (data.features && data.features.length > 0) {
                driverLocation.value.address = data.features[0].place_name;
            }
        }
    } catch (error) {
        console.error('Error reverse geocoding:', error);
    }
};

const refreshLocation = async () => {
    isRefreshingLocation.value = true;
    await fetchDriverLocation();
    setTimeout(() => {
        isRefreshingLocation.value = false;
    }, 1000);
};

const centerMap = () => {
    if (!map.value || !jobDetails.value) return;

    const pickupCoords = [
        parseFloat(jobDetails.value.pickupInfo.longitude),
        parseFloat(jobDetails.value.pickupInfo.latitude)
    ];
    const deliveryCoords = [
        parseFloat(jobDetails.value.dropoffInfo.longitude),
        parseFloat(jobDetails.value.dropoffInfo.latitude)
    ];

    const bounds = new maplibregl.LngLatBounds();
    bounds.extend(pickupCoords);
    bounds.extend(deliveryCoords);

    if (driverLocation.value) {
        bounds.extend([driverLocation.value.longitude, driverLocation.value.latitude]);
    }

    map.value.fitBounds(bounds, { padding: 50 });
};

const fitRoute = () => {
    centerMap();
};

const toggleMapStyle = () => {
    if (!map.value) return;

    mapStyle.value = mapStyle.value === 'streets-v2' ? 'satellite' : 'streets-v2';
    map.value.setStyle(`https://api.maptiler.com/maps/${mapStyle.value}/style.json?key=${mapTilerKey}`);

    map.value.once('styledata', () => {
        addMapMarkers();
        if (driverLocation.value) {
            updateDriverMarker();
        }
        calculateRoute();
    });
};

// Utility functions
const getStatusIcon = (status) => {
    const icons = {
        pending: 'fas fa-clock',
        'in-transit': 'fas fa-truck',
        delayed: 'fas fa-exclamation-triangle',
        delivered: 'fas fa-check-circle',
        cancelled: 'fas fa-times-circle',
        assigned: 'fas fa-user-check'
    };
    return icons[status] || 'fas fa-circle';
};

const formatStatus = (status) => {
    return status
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

const getCustomerInitials = (name) => {
    if (!name) return 'C';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

const getDriverInitials = (name) => {
    if (!name) return 'D';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

const formatAddress = (info) => {
    if (!info) return 'Address not available';

    const lat = parseFloat(info.latitude);
    const lng = parseFloat(info.longitude);

    if (lat && lng) {
        return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }

    return 'Address not available';
};

const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

const formatRelativeTime = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now - time;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
};

const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    } else {
        return `${minutes}m`;
    }
};

const goBack = () => {
    router.go(-1);
};

const contactCustomer = () => {
    if (jobDetails.value?.pickupInfo?.phone) {
        window.open(`tel:${jobDetails.value.pickupInfo.phone}`);
    }
};

const callDriver = () => {
    if (jobDetails.value?.driverInfo?.phone) {
        window.open(`tel:${jobDetails.value.driverInfo.phone}`);
    }
};

const messageDriver = () => {
    console.log('Message driver:', jobDetails.value?.driverInfo?.name);
};

// Lifecycle hooks
onMounted(async () => {
    await fetchJobDetails();
});

onUnmounted(() => {
    stopLiveTracking();
    if (map.value) {
        map.value.remove();
    }
});
</script>

<style scoped>
@import './JobDetails.css';
</style>
