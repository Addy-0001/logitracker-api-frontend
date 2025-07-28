<template>
    <div class="create-job-container" style="margin-bottom: 100px; padding-bottom: 100px;">
        <div class="page-header">
            <h1>Create New Job</h1>
            <button @click="cancel" class="cancel-btn">
                <i class="fas fa-times"></i>
                Cancel
            </button>
        </div>
        <div class="create-job-content">
            <form @submit.prevent="createNewJob" class="create-job-form">
                <div class="form-note">
                    <i class="fas fa-info-circle"></i>
                    Click on the map or search to set pickup and dropoff locations. Ensure addresses are in Nepal.
                </div>

                <!-- Customer Information -->
                <div class="form-section">
                    <h3 class="section-title">
                        <i class="fas fa-user"></i>
                        Customer Information
                    </h3>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="customerName" class="form-label">Customer Name *</label>
                            <input type="text" id="customerName" v-model="newJobForm.customerInfo.name"
                                class="form-input" :class="{ 'error': newJobErrors.customerName }"
                                placeholder="Enter customer name" />
                            <span v-if="newJobErrors.customerName" class="error-message">{{
                                newJobErrors.customerName }}</span>
                        </div>
                        <div class="form-group">
                            <label for="customerCompany" class="form-label">Company</label>
                            <input type="text" id="customerCompany" v-model="newJobForm.customerInfo.company"
                                class="form-input" placeholder="Enter company name" />
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="customerEmail" class="form-label">Email *</label>
                            <input type="email" id="customerEmail" v-model="newJobForm.customerInfo.email"
                                class="form-input" :class="{ 'error': newJobErrors.customerEmail }"
                                placeholder="Enter email address" />
                            <span v-if="newJobErrors.customerEmail" class="error-message">{{
                                newJobErrors.customerEmail }}</span>
                        </div>
                        <div class="form-group">
                            <label for="customerPhone" class="form-label">Phone *</label>
                            <input type="tel" id="customerPhone" v-model="newJobForm.customerInfo.phone"
                                class="form-input" :class="{ 'error': newJobErrors.customerPhone }"
                                placeholder="Enter phone number (+977)" />
                            <span v-if="newJobErrors.customerPhone" class="error-message">{{
                                newJobErrors.customerPhone }}</span>
                        </div>
                    </div>
                </div>

                <!-- Pickup Information -->
                <div class="form-section">
                    <h3 class="section-title">
                        <i class="fas fa-circle start-icon"></i>
                        Pickup Information
                    </h3>
                    <div class="form-group">
                        <label for="pickupAddress" class="form-label">Address Search *</label>
                        <div class="location-input">
                            <input id="pickupAddress" type="text" v-model="pickupSearch"
                                @keyup.enter="searchLocation('pickup')" placeholder="Search pickup address..."
                                class="form-input" :class="{ 'error': newJobErrors.pickupAddress }" />
                            <button @click="searchLocation('pickup')" class="search-btn"
                                :disabled="!pickupSearch.trim()">
                                <i class="fas fa-search"></i>
                            </button>
                        </div>
                        <div v-if="pickupSuggestions.length > 0" class="suggestions">
                            <div v-for="suggestion in pickupSuggestions" :key="suggestion.id"
                                @click="selectSuggestion('pickup', suggestion)" class="suggestion-item">
                                <i class="fas fa-map-marker-alt"></i>
                                <div class="suggestion-text">
                                    <div class="suggestion-name">{{ suggestion.name }}</div>
                                    <div class="suggestion-address">{{ suggestion.address }}</div>
                                </div>
                            </div>
                        </div>
                        <span v-if="newJobErrors.pickupAddress" class="error-message">{{
                            newJobErrors.pickupAddress }}</span>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="pickupCity" class="form-label">City *</label>
                            <input type="text" id="pickupCity" v-model="newJobForm.pickupInfo.city" class="form-input"
                                :class="{ 'error': newJobErrors.pickupCity }" placeholder="Enter city" />
                            <span v-if="newJobErrors.pickupCity" class="error-message">{{
                                newJobErrors.pickupCity }}</span>
                        </div>
                        <div class="form-group">
                            <label for="pickupState" class="form-label">State *</label>
                            <select id="pickupState" v-model="newJobForm.pickupInfo.state" class="form-input"
                                :class="{ 'error': newJobErrors.pickupState }">
                                <option value="" disabled>Select state</option>
                                <option value="Bagmati">Bagmati</option>
                                <option value="Gandaki">Gandaki</option>
                                <option value="Lumbini">Lumbini</option>
                                <option value="Karnali">Karnali</option>
                                <option value="Sudurpashchim">Sudurpashchim</option>
                                <option value="Province No. 1">Province No. 1</option>
                                <option value="Province No. 2">Province No. 2</option>
                            </select>
                            <span v-if="newJobErrors.pickupState" class="error-message">{{
                                newJobErrors.pickupState }}</span>
                        </div>
                        <div class="form-group">
                            <label for="pickupZipCode" class="form-label">Zip Code *</label>
                            <input type="text" id="pickupZipCode" v-model="newJobForm.pickupInfo.zipCode"
                                class="form-input" :class="{ 'error': newJobErrors.pickupZipCode }"
                                placeholder="Enter zip code" />
                            <span v-if="newJobErrors.pickupZipCode" class="error-message">{{
                                newJobErrors.pickupZipCode }}</span>
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Pickup Coordinates</label>
                        <div class="coordinates-display">
                            <span>Lat: {{ newJobForm.pickupInfo.latitude || 'Not set' }}</span>
                            <span>Lng: {{ newJobForm.pickupInfo.longitude || 'Not set' }}</span>
                        </div>
                    </div>
                </div>

                <!-- Delivery Information -->
                <div class="form-section">
                    <h3 class="section-title">
                        <i class="fas fa-map-marker-alt end-icon"></i>
                        Delivery Information
                    </h3>
                    <div class="form-group">
                        <label for="deliveryAddress" class="form-label">Address Search *</label>
                        <div class="location-input">
                            <input id="deliveryAddress" type="text" v-model="dropoffSearch"
                                @keyup.enter="searchLocation('dropoff')" placeholder="Search delivery address..."
                                class="form-input" :class="{ 'error': newJobErrors.deliveryAddress }" />
                            <button @click="searchLocation('dropoff')" class="search-btn"
                                :disabled="!dropoffSearch.trim()">
                                <i class="fas fa-search"></i>
                            </button>
                        </div>
                        <div v-if="dropoffSuggestions.length > 0" class="suggestions">
                            <div v-for="suggestion in dropoffSuggestions" :key="suggestion.id"
                                @click="selectSuggestion('dropoff', suggestion)" class="suggestion-item">
                                <i class="fas fa-map-marker-alt"></i>
                                <div class="suggestion-text">
                                    <div class="suggestion-name">{{ suggestion.name }}</div>
                                    <div class="suggestion-address">{{ suggestion.address }}</div>
                                </div>
                            </div>
                        </div>
                        <span v-if="newJobErrors.deliveryAddress" class="error-message">{{
                            newJobErrors.deliveryAddress }}</span>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="deliveryCity" class="form-label">City *</label>
                            <input type="text" id="deliveryCity" v-model="newJobForm.dropoffInfo.city"
                                class="form-input" :class="{ 'error': newJobErrors.deliveryCity }"
                                placeholder="Enter city" />
                            <span v-if="newJobErrors.deliveryCity" class="error-message">{{
                                newJobErrors.deliveryCity }}</span>
                        </div>
                        <div class="form-group">
                            <label for="deliveryState" class="form-label">State *</label>
                            <select id="deliveryState" v-model="newJobForm.dropoffInfo.state" class="form-input"
                                :class="{ 'error': newJobErrors.deliveryState }">
                                <option value="" disabled>Select state</option>
                                <option value="Bagmati">Bagmati</option>
                                <option value="Gandaki">Gandaki</option>
                                <option value="Lumbini">Lumbini</option>
                                <option value="Karnali">Karnali</option>
                                <option value="Sudurpashchim">Sudurpashchim</option>
                                <option value="Province No. 1">Province No. 1</option>
                                <option value="Province No. 2">Province No. 2</option>
                            </select>
                            <span v-if="newJobErrors.deliveryState" class="error-message">{{
                                newJobErrors.deliveryState }}</span>
                        </div>
                        <div class="form-group">
                            <label for="deliveryZipCode" class="form-label">Zip Code *</label>
                            <input type="text" id="deliveryZipCode" v-model="newJobForm.dropoffInfo.zipCode"
                                class="form-input" :class="{ 'error': newJobErrors.deliveryZipCode }"
                                placeholder="Enter zip code" />
                            <span v-if="newJobErrors.deliveryZipCode" class="error-message">{{
                                newJobErrors.deliveryZipCode }}</span>
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Delivery Coordinates</label>
                        <div class="coordinates-display">
                            <span>Lat: {{ newJobForm.dropoffInfo.latitude || 'Not set' }}</span>
                            <span>Lng: {{ newJobForm.dropoffInfo.longitude || 'Not set' }}</span>
                        </div>
                    </div>
                </div>

                <!-- Map Container -->
                <div class="form-section">
                    <h3 class="section-title">
                        <i class="fas fa-map"></i>
                        Select Location on Map
                    </h3>
                    <div class="map-container">
                        <div id="job-create-map" class="map"></div>
                        <div class="map-controls">
                            <button @click="selecting = 'pickup'" :class="{ active: selecting === 'pickup' }"
                                class="map-control" title="Select Pickup">
                                <i class="fas fa-circle"></i>
                                Pickup
                            </button>
                            <button @click="selecting = 'dropoff'" :class="{ active: selecting === 'dropoff' }"
                                class="map-control" title="Select Dropoff">
                                <i class="fas fa-map-marker-alt"></i>
                                Dropoff
                            </button>
                            <button @click="fitMap" class="map-control" title="Fit Map">
                                <i class="fas fa-expand-arrows-alt"></i>
                            </button>
                        </div>
                        <div class="map-legend">
                            <div class="legend-title">Legend</div>
                            <div class="legend-items">
                                <div class="legend-item">
                                    <div class="legend-marker start"></div>
                                    <span>Pickup Point</span>
                                </div>
                                <div class="legend-item">
                                    <div class="legend-marker end"></div>
                                    <span>Dropoff Point</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Job Details -->
                <div class="form-section">
                    <h3 class="section-title">
                        <i class="fas fa-clipboard-list"></i>
                        Job Details
                    </h3>
                    <div class="form-group">
                        <label class="form-label">Special Requirements</label>
                        <div class="checkbox-group">
                            <label class="checkbox-container">
                                <input type="checkbox" v-model="newJobForm.addOns.fragileItems" />
                                <span class="checkmark"></span>
                                Fragile Items
                            </label>
                            <label class="checkbox-container">
                                <input type="checkbox" v-model="newJobForm.addOns.heavyItems" />
                                <span class="checkmark"></span>
                                Heavy Items (>50lbs)
                            </label>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="specialInstructions" class="form-label">Special Instructions</label>
                        <textarea id="specialInstructions" v-model="newJobForm.note" class="form-textarea"
                            placeholder="Enter any special instructions for this job" rows="3"></textarea>
                    </div>
                </div>

                <!-- Driver Assignment -->
                <div class="form-section">
                    <h3 class="section-title">
                        <i class="fas fa-user-tie"></i>
                        Driver Assignment
                    </h3>
                    <div class="form-group">
                        <label for="assignedTo" class="form-label">Assign Driver *</label>
                        <select id="assignedTo" v-model="newJobForm.assignedTo" class="form-input driver-select"
                            :class="{ 'error': newJobErrors.assignedTo }" :disabled="isLoadingDrivers">
                            <option value="" disabled>Select a driver</option>
                            <option v-if="availableDrivers.length === 0 && !isLoadingDrivers" disabled>
                                No drivers available
                            </option>
                            <option v-for="driver in availableDrivers" :key="driver._id" :value="driver._id">
                                {{ driver.firstName }} {{ driver.lastName }} - {{ driver.phone }}
                            </option>
                        </select>
                        <span v-if="newJobErrors.assignedTo" class="error-message">{{
                            newJobErrors.assignedTo }}</span>
                        <span v-if="isLoadingDrivers" class="loading-message">
                            <i class="fas fa-spinner fa-spin"></i> Loading drivers...
                        </span>
                        <span v-if="driverFetchError" class="error-message">{{ driverFetchError }}</span>
                    </div>
                    <div v-if="newJobForm.assignedTo" class="driver-info">
                        <div class="selected-driver">
                            <div class="driver-details">
                                <h4>{{ getDriverName(newJobForm.assignedTo) }}</h4>
                                <p>{{ getDriverPhone(newJobForm.assignedTo) }}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Form Messages -->
                <div v-if="createJobSuccess" class="form-success">
                    <i class="fas fa-check-circle"></i>
                    {{ createJobSuccess }}
                </div>
                <div v-if="createJobError || newJobErrors.general" class="form-error">
                    <i class="fas fa-exclamation-circle"></i>
                    {{ createJobError || newJobErrors.general }}
                </div>

                <!-- Form Actions -->
                <div class="form-actions">
                    <button type="button" @click="cancel" class="cancel-btn">
                        Cancel
                    </button>
                    <button type="submit" class="create-btn" :disabled="isCreatingJob">
                        <span v-if="!isCreatingJob">
                            <i class="fas fa-plus"></i>
                            Create Job
                        </span>
                        <span v-else class="loading-spinner">
                            <i class="fas fa-spinner fa-spin"></i>
                            Creating Job...
                        </span>
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import apiClient from '@/api/axios';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

const router = useRouter();
const authStore = useAuthStore();

const MAPTILER_API_KEY = import.meta.env.VITE_MAPTILER_API_KEY || 'YOUR_MAPTILER_API_KEY_HERE';
const NEPAL_BOUNDS = [
    [80.058, 26.347], // Southwest
    [88.201, 30.447], // Northeast
];

const newJobForm = ref({
    customerInfo: {
        name: '',
        email: '',
        phone: '',
        company: '',
    },
    pickupInfo: {
        address: '',
        city: '',
        state: '',
        zipCode: '',
        contactPerson: '',
        contactPhone: '',
        instructions: '',
        latitude: null,
        longitude: null,
    },
    dropoffInfo: {
        address: '',
        city: '',
        state: '',
        zipCode: '',
        contactPerson: '',
        contactPhone: '',
        instructions: '',
        latitude: null,
        longitude: null,
    },
    addOns: {
        fragileItems: false,
        heavyItems: false,
    },
    assignedTo: '',
    note: '',
});
const newJobErrors = ref({});
const isCreatingJob = ref(false);
const createJobError = ref('');
const createJobSuccess = ref('');
const availableDrivers = ref([]);
const pickupSearch = ref('');
const dropoffSearch = ref('');
const pickupSuggestions = ref([]);
const dropoffSuggestions = ref([]);
const selecting = ref('pickup');
const map = ref(null);
const pickupMarker = ref(null);
const dropoffMarker = ref(null);
const isLoadingDrivers = ref(false);
const driverFetchError = ref('');

const fetchDrivers = async () => {
    if (authStore.user?.role !== 'admin') {
        driverFetchError.value = 'Unauthorized: Only admins can fetch drivers.';
        router.push('/login');
        return;
    }
    isLoadingDrivers.value = true;
    driverFetchError.value = '';
    try {
        console.log('Fetching drivers from /user/getUsers with role=driver');
        const response = await apiClient.get('/user/getUsers', {
            params: { role: 'driver' },
            headers: {
                Authorization: `Bearer ${authStore.token}`,
            },
        });
        console.log('Driver fetch response:', response.data);
        // Extract the 'users' array from response.data
        availableDrivers.value = Array.isArray(response.data.users) ? response.data.users : [];
        if (availableDrivers.value.length === 0) {
            driverFetchError.value = 'No drivers found in the system.';
        }
    } catch (error) {
        console.error('Error fetching drivers:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
        });
        driverFetchError.value =
            error.response?.data?.message || 'Failed to load drivers. Please try again.';
        if (error.response?.status === 401 || error.response?.status === 403) {
            authStore.logout();
            router.push('/login');
        }
        availableDrivers.value = [];
    } finally {
        isLoadingDrivers.value = false;
    }
};

const initializeMap = async () => {
    await nextTick(); // Ensure DOM is ready
    try {
        const mapContainer = document.getElementById('job-create-map');
        if (!mapContainer) {
            throw new Error("Container 'job-create-map' not found.");
        }

        map.value = new maplibregl.Map({
            container: 'job-create-map',
            style: `https://api.maptiler.com/maps/streets-v2/style.json?key=${MAPTILER_API_KEY}`,
            center: [85.3240, 27.7172], // Kathmandu, Nepal [lng, lat]
            zoom: 7,
            minZoom: 6,
            maxZoom: 18,
            maxBounds: NEPAL_BOUNDS,
        });

        map.value.on('load', () => {
            map.value.addControl(new maplibregl.NavigationControl(), 'top-right');
            if (newJobForm.value.pickupInfo.latitude && newJobForm.value.pickupInfo.longitude) {
                addMarker('pickup', [
                    newJobForm.value.pickupInfo.longitude,
                    newJobForm.value.pickupInfo.latitude,
                ], newJobForm.value.pickupInfo.address);
            }
            if (newJobForm.value.dropoffInfo.latitude && newJobForm.value.dropoffInfo.longitude) {
                addMarker('dropoff', [
                    newJobForm.value.dropoffInfo.longitude,
                    newJobForm.value.dropoffInfo.latitude,
                ], newJobForm.value.dropoffInfo.address);
            }
        });

        map.value.on('click', onMapClick);
        map.value.on('error', (e) => {
            console.error('Maplibre error:', e.error);
            createJobError.value = 'Failed to initialize map. Please check your MapTiler API key.';
        });
    } catch (error) {
        console.error('Error initializing map:', error);
        createJobError.value = 'Failed to initialize map. Please try again.';
    }
};

const addMarker = (type, coordinates, title) => {
    const markerElement = document.createElement('div');
    markerElement.className = `custom-marker ${type}`;
    markerElement.innerHTML = type === 'pickup' ? '<i class="fas fa-circle"></i>' : '<i class="fas fa-map-marker-alt"></i>';

    const marker = new maplibregl.Marker({ element: markerElement })
        .setLngLat(coordinates)
        .setPopup(new maplibregl.Popup().setHTML(`<strong>${title || type.charAt(0).toUpperCase() + type.slice(1)} Point</strong>`))
        .addTo(map.value);

    if (type === 'pickup') {
        if (pickupMarker.value) pickupMarker.value.remove();
        pickupMarker.value = marker;
    } else {
        if (dropoffMarker.value) dropoffMarker.value.remove();
        dropoffMarker.value = marker;
    }
};

const onMapClick = async (e) => {
    const coordinates = [e.lngLat.lng, e.lngLat.lat];
    try {
        const response = await fetch(
            `https://api.maptiler.com/geocoding/${coordinates[1]},${coordinates[0]}.json?key=${MAPTILER_API_KEY}`
        );
        if (!response.ok) throw new Error('Reverse geocoding failed');
        const data = await response.json();
        const address = data.features[0]?.place_name || `${coordinates[1].toFixed(4)}, ${coordinates[0].toFixed(4)}`;
        const city = data.features[0]?.context?.find(c => c.id.includes('place'))?.text || '';
        const state = data.features[0]?.context?.find(c => c.id.includes('region'))?.text || '';

        if (selecting.value === 'pickup') {
            newJobForm.value.pickupInfo.latitude = coordinates[1].toString();
            newJobForm.value.pickupInfo.longitude = coordinates[0].toString();
            newJobForm.value.pickupInfo.address = address;
            newJobForm.value.pickupInfo.city = city;
            newJobForm.value.pickupInfo.state = state;
            addMarker('pickup', coordinates, address);
            pickupSearch.value = address;
            pickupSuggestions.value = [];
        } else {
            newJobForm.value.dropoffInfo.latitude = coordinates[1].toString();
            newJobForm.value.dropoffInfo.longitude = coordinates[0].toString();
            newJobForm.value.dropoffInfo.address = address;
            newJobForm.value.dropoffInfo.city = city;
            newJobForm.value.dropoffInfo.state = state;
            addMarker('dropoff', coordinates, address);
            dropoffSearch.value = address;
            dropoffSuggestions.value = [];
        }
    } catch (error) {
        console.error('Reverse geocoding error:', error);
        createJobError.value = 'Failed to fetch address for selected location.';
    }
};

const searchLocation = async (type) => {
    const query = type === 'pickup' ? pickupSearch.value : dropoffSearch.value;
    if (!query.trim()) return;

    try {
        const response = await fetch(
            `https://api.maptiler.com/geocoding/${encodeURIComponent(query)}.json?key=${MAPTILER_API_KEY}&limit=5&bbox=80.058,26.347,88.201,30.447`
        );
        if (!response.ok) throw new Error('Geocoding request failed');
        const data = await response.json();
        const suggestions = data.features.map((feature, index) => ({
            id: index,
            name: feature.text || feature.place_name,
            address: feature.place_name,
            coordinates: feature.center,
            city: feature.context?.find(c => c.id.includes('place'))?.text || '',
            state: feature.context?.find(c => c.id.includes('region'))?.text || '',
        }));
        if (type === 'pickup') {
            pickupSuggestions.value = suggestions;
        } else {
            dropoffSuggestions.value = suggestions;
        }
    } catch (error) {
        console.error('Geocoding error:', error);
        createJobError.value = 'Failed to search for locations. Please try again.';
    }
};

const selectSuggestion = (type, suggestion) => {
    if (type === 'pickup') {
        newJobForm.value.pickupInfo.latitude = suggestion.coordinates[1].toString();
        newJobForm.value.pickupInfo.longitude = suggestion.coordinates[0].toString();
        newJobForm.value.pickupInfo.address = suggestion.address;
        newJobForm.value.pickupInfo.city = suggestion.city;
        newJobForm.value.pickupInfo.state = suggestion.state;
        pickupSearch.value = suggestion.address;
        pickupSuggestions.value = [];
        addMarker('pickup', suggestion.coordinates, suggestion.address);
    } else {
        newJobForm.value.dropoffInfo.latitude = suggestion.coordinates[1].toString();
        newJobForm.value.dropoffInfo.longitude = suggestion.coordinates[0].toString();
        newJobForm.value.dropoffInfo.address = suggestion.address;
        newJobForm.value.dropoffInfo.city = suggestion.city;
        newJobForm.value.dropoffInfo.state = suggestion.state;
        dropoffSearch.value = suggestion.address;
        dropoffSuggestions.value = [];
        addMarker('dropoff', suggestion.coordinates, suggestion.address);
    }
    if (map.value) {
        map.value.setCenter(suggestion.coordinates);
    }
};

const fitMap = () => {
    if (!map.value) return;
    const bounds = new maplibregl.LngLatBounds();
    if (newJobForm.value.pickupInfo.latitude && newJobForm.value.pickupInfo.longitude) {
        bounds.extend([newJobForm.value.pickupInfo.longitude, newJobForm.value.pickupInfo.latitude]);
    }
    if (newJobForm.value.dropoffInfo.latitude && newJobForm.value.dropoffInfo.longitude) {
        bounds.extend([newJobForm.value.dropoffInfo.longitude, newJobForm.value.dropoffInfo.latitude]);
    }
    if (!bounds.isEmpty()) {
        map.value.fitBounds(bounds, { padding: 50 });
    } else {
        map.value.setCenter([85.3240, 27.7172]);
        map.value.setZoom(7);
    }
};

const validateNewJobForm = () => {
    newJobErrors.value = {};
    if (!newJobForm.value.customerInfo.name.trim()) {
        newJobErrors.value.customerName = 'Customer name is required';
    }
    if (!newJobForm.value.customerInfo.email.trim()) {
        newJobErrors.value.customerEmail = 'Customer email is required';
    } else if (!isValidEmail(newJobForm.value.customerInfo.email)) {
        newJobErrors.value.customerEmail = 'Please enter a valid email address';
    }
    if (!newJobForm.value.customerInfo.phone.trim()) {
        newJobErrors.value.customerPhone = 'Customer phone is required';
    } else if (!isValidPhone(newJobForm.value.customerInfo.phone)) {
        newJobErrors.value.customerPhone = 'Please enter a valid Nepal phone number (+977 followed by 10 digits)';
    }
    if (!newJobForm.value.pickupInfo.address.trim()) {
        newJobErrors.value.pickupAddress = 'Pickup address is required';
    }
    if (!newJobForm.value.pickupInfo.city.trim()) {
        newJobErrors.value.pickupCity = 'Pickup city is required';
    }
    if (!newJobForm.value.pickupInfo.state.trim()) {
        newJobErrors.value.pickupState = 'Pickup state is required';
    }
    if (!newJobForm.value.pickupInfo.zipCode.trim()) {
        newJobErrors.value.pickupZipCode = 'Pickup zip code is required';
    }
    if (!newJobForm.value.dropoffInfo.address.trim()) {
        newJobErrors.value.deliveryAddress = 'Delivery address is required';
    }
    if (!newJobForm.value.dropoffInfo.city.trim()) {
        newJobErrors.value.deliveryCity = 'Delivery city is required';
    }
    if (!newJobForm.value.dropoffInfo.state.trim()) {
        newJobErrors.value.deliveryState = 'Delivery state is required';
    }
    if (!newJobForm.value.dropoffInfo.zipCode.trim()) {
        newJobErrors.value.deliveryZipCode = 'Delivery zip code is required';
    }
    if (!newJobForm.value.assignedTo) {
        newJobErrors.value.assignedTo = 'Please assign a driver';
    }
    const isWithinNepal = (lat, lon) => {
        const latitude = parseFloat(lat);
        const longitude = parseFloat(lon);
        return (
            !isNaN(latitude) &&
            !isNaN(longitude) &&
            latitude >= 26.347 &&
            latitude <= 30.447 &&
            longitude >= 80.058 &&
            longitude <= 88.201
        );
    };
    if (!newJobForm.value.pickupInfo.latitude || !newJobForm.value.pickupInfo.longitude ||
        !isWithinNepal(newJobForm.value.pickupInfo.latitude, newJobForm.value.pickupInfo.longitude)) {
        newJobErrors.value.pickupCoords = 'Pickup coordinates are invalid or outside Nepal';
    }
    if (!newJobForm.value.dropoffInfo.latitude || !newJobForm.value.dropoffInfo.longitude ||
        !isWithinNepal(newJobForm.value.dropoffInfo.latitude, newJobForm.value.dropoffInfo.longitude)) {
        newJobErrors.value.dropoffCoords = 'Delivery coordinates are invalid or outside Nepal';
    }
    return Object.keys(newJobErrors.value).length === 0;
};

const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const isValidPhone = (phone) => {
    const phoneRegex = /^\+977[1-9]\d{9}$/;
    return phoneRegex.test(phone);
};

const parseValidationErrors = (error) => {
    if (error.response?.data?.errors) {
        const errors = {};
        error.response.data.errors.forEach((err) => {
            const field = err.param ? err.param.split('.').pop() : err.field;
            errors[field] = err.msg;
        });
        return errors;
    } else if (error.response?.data?.message) {
        return { general: error.response.data.message };
    }
    return { general: 'An unexpected error occurred' };
};

const createNewJob = async () => {
    if (!validateNewJobForm()) return;
    isCreatingJob.value = true;
    createJobError.value = '';
    createJobSuccess.value = '';
    try {
        const selectedDriver = availableDrivers.value.find((d) => d._id === newJobForm.value.assignedTo);
        if (!selectedDriver) {
            newJobErrors.value.assignedTo = 'Selected driver not found';
            isCreatingJob.value = false;
            return;
        }
        const jobData = {
            driverInfo: {
                id: newJobForm.value.assignedTo,
                name: `${selectedDriver.firstName} ${selectedDriver.lastName}`,
                phone: selectedDriver.phone,
            },
            pickupInfo: {
                name: newJobForm.value.customerInfo.name,
                phone: newJobForm.value.customerInfo.phone,
                email: newJobForm.value.customerInfo.email,
                latitude: newJobForm.value.pickupInfo.latitude,
                longitude: newJobForm.value.pickupInfo.longitude,
            },
            dropoffInfo: {
                name: newJobForm.value.customerInfo.name,
                phone: newJobForm.value.customerInfo.phone,
                email: newJobForm.value.customerInfo.email,
                latitude: newJobForm.value.dropoffInfo.latitude,
                longitude: newJobForm.value.dropoffInfo.longitude,
            },
            currentCoords: {
                latitude: null,
                longitude: null,
            },
            status: 'pending',
            note: newJobForm.value.note,
            addOns: {
                fragileItems: newJobForm.value.addOns.fragileItems,
                heavyItem: newJobForm.value.addOns.heavyItems,
            },
            isUrgent: newJobForm.value.addOns.fragileItems || newJobForm.value.addOns.heavyItems,
        };
        const response = await apiClient.post('/job/createJob', jobData, {
            headers: {
                Authorization: `Bearer ${authStore.token}`,
            },
        });
        const newJob = response.data;
        createJobSuccess.value = `Job ${newJob._id} created successfully and assigned to ${selectedDriver.firstName} ${selectedDriver.lastName}`;
        setTimeout(() => {
            router.push('/home');
        }, 2000);
    } catch (error) {
        console.error('Error creating job:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
        });
        if (error.response?.status === 401 || error.response?.status === 403) {
            createJobError.value = 'Unauthorized. Only admins can create jobs.';
            authStore.logout();
            router.push('/login');
        } else if (error.response?.status === 400) {
            const validationErrors = parseValidationErrors(error);
            newJobErrors.value = { ...newJobErrors.value, ...validationErrors };
            createJobError.value = 'Please correct the errors in the form.';
        } else {
            createJobError.value = error.response?.data?.message || 'Failed to create job. Please try again.';
        }
    } finally {
        isCreatingJob.value = false;
    }
};

const getDriverName = (driverId) => {
    const driver = availableDrivers.value.find((d) => d._id === driverId);
    return driver ? `${driver.firstName} ${driver.lastName}` : 'Unknown';
};

const getDriverPhone = (driverId) => {
    const driver = availableDrivers.value.find((d) => d._id === driverId);
    return driver ? driver.phone : 'N/A';
};

const resetNewJobForm = () => {
    newJobForm.value = {
        customerInfo: {
            name: '',
            email: '',
            phone: '',
            company: '',
        },
        pickupInfo: {
            address: '',
            city: '',
            state: '',
            zipCode: '',
            contactPerson: '',
            contactPhone: '',
            instructions: '',
            latitude: null,
            longitude: null,
        },
        dropoffInfo: {
            address: '',
            city: '',
            state: '',
            zipCode: '',
            contactPerson: '',
            contactPhone: '',
            instructions: '',
            latitude: null,
            longitude: null,
        },
        addOns: {
            fragileItems: false,
            heavyItems: false,
        },
        assignedTo: '',
        note: '',
    };
    newJobErrors.value = {};
    createJobError.value = '';
    createJobSuccess.value = '';
    pickupSearch.value = '';
    dropoffSearch.value = '';
    pickupSuggestions.value = [];
    dropoffSuggestions.value = [];
    selecting.value = 'pickup';
};

const cancel = () => {
    if (map.value) {
        map.value.remove();
        map.value = null;
    }
    if (pickupMarker.value) {
        pickupMarker.value.remove();
        pickupMarker.value = null;
    }
    if (dropoffMarker.value) {
        dropoffMarker.value.remove();
        dropoffMarker.value = null;
    }
    router.push('/home');
};

onMounted(async () => {
    if (!authStore.isAuthenticated || authStore.user?.role !== 'admin') {
        createJobError.value = 'Unauthorized. Only admins can create jobs.';
        router.push('/login');
        return;
    }
    console.log('authStore state:', {
        isAuthenticated: authStore.isAuthenticated,
        user: authStore.user,
        token: authStore.token,
    });
    await fetchDrivers();
    await initializeMap();
});

onUnmounted(() => {
    if (map.value) {
        map.value.remove();
        map.value = null;
    }
});
</script>

<style scoped>
@import './createjobview.css';

.loading-message {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #555;
    font-size: 14px;
    margin-top: 5px;
}
</style>
