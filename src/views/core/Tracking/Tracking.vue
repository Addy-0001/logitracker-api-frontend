<template>
    <div class="tracking-container">
        <!-- Header Section -->
        <div class="tracking-header">
            <div class="header-content">
                <div class="header-title">
                    <h1>Real-Time Tracking</h1>
                    <p>Monitor ongoing deliveries and driver locations</p>
                </div>
                <div class="header-controls">
                    <div class="job-search">
                        <div class="search-input-wrapper">
                            <i class="fas fa-search"></i>
                            <input type="text" v-model="searchJobId" @keyup.enter="searchJob"
                                placeholder="Enter Job ID to track..." class="search-input" />
                            <button @click="searchJob" class="search-btn">
                                <i class="fas fa-location-arrow"></i>
                                Track
                            </button>
                        </div>
                    </div>
                    <div class="view-controls">
                        <button @click="toggleAutoRefresh" :class="['auto-refresh-btn', { active: autoRefresh }]">
                            <i :class="['fas', autoRefresh ? 'fa-pause' : 'fa-play']"></i>
                            {{ autoRefresh ? 'Pause' : 'Auto Refresh' }}
                        </button>
                        <button @click="refreshTracking" class="refresh-btn" :disabled="isRefreshing">
                            <i :class="['fas fa-sync-alt', { 'fa-spin': isRefreshing }]"></i>
                            Refresh
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Main Content -->
        <div class="tracking-content">
            <!-- Job Selection Panel -->
            <div v-if="!selectedJob" class="job-selection-panel">
                <div class="selection-content">
                    <div class="selection-icon">
                        <i class="fas fa-map-marked-alt"></i>
                    </div>
                    <h2>Select a Job to Track</h2>
                    <p>Enter a Job ID in the search box above or select from active jobs below</p>

                    <div class="active-jobs-list">
                        <h3>Active Jobs</h3>
                        <div class="jobs-grid">
                            <div v-for="job in activeJobs" :key="job.id" @click="selectJob(job.id)" class="job-card">
                                <div class="job-header">
                                    <span class="job-id">{{ job.id }}</span>
                                    <span :class="['job-status', job.status]">{{ formatStatus(job.status) }}</span>
                                </div>
                                <div class="job-details">
                                    <div class="job-route">
                                        <div class="route-point">
                                            <i class="fas fa-circle origin"></i>
                                            <span>{{ job.origin }}</span>
                                        </div>
                                        <div class="route-arrow">
                                            <i class="fas fa-arrow-right"></i>
                                        </div>
                                        <div class="route-point">
                                            <i class="fas fa-map-marker-alt destination"></i>
                                            <span>{{ job.destination }}</span>
                                        </div>
                                    </div>
                                    <div class="job-meta">
                                        <span class="driver">{{ job.driver }}</span>
                                        <span class="eta">ETA: {{ job.eta }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Tracking Interface -->
            <div v-else class="tracking-interface">
                <!-- Map Container -->
                <div class="map-section">
                    <div id="tracking-map" class="map-container"></div>

                    <!-- Map Controls -->
                    <div class="map-controls">
                        <button @click="centerOnVehicle" class="map-control-btn" title="Center on Vehicle">
                            <i class="fas fa-crosshairs"></i>
                        </button>
                        <button @click="fitRoute" class="map-control-btn" title="Fit Route">
                            <i class="fas fa-route"></i>
                        </button>
                        <button @click="toggleTraffic" class="map-control-btn" title="Toggle Traffic" disabled>
                            <i class="fas fa-traffic-light"></i>
                        </button>
                        <button @click="toggleSatellite" class="map-control-btn" title="Toggle Satellite" disabled>
                            <i class="fas fa-satellite"></i>
                        </button>
                    </div>

                    <!-- Map Legend -->
                    <div class="map-legend">
                        <div class="legend-item">
                            <div class="legend-marker pickup"></div>
                            <span>Pickup Location</span>
                        </div>
                        <div class="legend-item">
                            <div class="legend-marker delivery"></div>
                            <span>Delivery Location</span>
                        </div>
                        <div class="legend-item">
                            <div class="legend-marker vehicle"></div>
                            <span>Current Location</span>
                        </div>
                    </div>
                </div>

                <!-- Job Information Panel -->
                <div class="job-info-panel">
                    <div class="panel-header">
                        <div class="job-title">
                            <h2>{{ selectedJob.id }}</h2>
                            <span :class="['status-badge', selectedJob.status]">
                                <i :class="getStatusIcon(selectedJob.status)"></i>
                                {{ formatStatus(selectedJob.status) }}
                            </span>
                        </div>
                        <button @click="closeTracking" class="close-btn">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>

                    <div class="panel-content">
                        <!-- Progress Section -->
                        <div class="progress-section">
                            <h3>
                                <i class="fas fa-route"></i>
                                Progress
                            </h3>
                            <div class="progress-bar">
                                <div class="progress-fill" :style="{ width: selectedJob.progress + '%' }"></div>
                            </div>
                            <div class="progress-info">
                                <span>{{ selectedJob.progress }}% Complete</span>
                                <span>{{ selectedJob.distanceRemaining }} km remaining</span>
                            </div>
                        </div>

                        <!-- Driver Information -->
                        <div class="driver-section">
                            <h3>
                                <i class="fas fa-user"></i>
                                Driver Information
                            </h3>
                            <div class="driver-card">
                                <div class="driver-avatar">
                                    <img :src="selectedJob.driverInfo.avatar || '/default-avatar.png'"
                                        :alt="selectedJob.driverInfo.name" />
                                    <span v-if="selectedJob.driverInfo.isOnline" class="online-indicator"></span>
                                </div>
                                <div class="driver-details">
                                    <h4>{{ selectedJob.driverInfo.name }}</h4>
                                    <p>{{ selectedJob.driverInfo.phone }}</p>
                                    <div class="driver-stats">
                                        <span class="rating">
                                            <i class="fas fa-star"></i>
                                            {{ selectedJob.driverInfo.rating }}
                                        </span>
                                        <span class="vehicle">{{ selectedJob.driverInfo.vehicle }}</span>
                                    </div>
                                </div>
                                <div class="driver-actions">
                                    <button @click="callDriver" class="action-btn call">
                                        <i class="fas fa-phone"></i>
                                    </button>
                                    <button @click="messageDriver" class="action-btn message">
                                        <i class="fas fa-comment"></i>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Route Information -->
                        <div class="route-section">
                            <h3>
                                <i class="fas fa-map-marked-alt"></i>
                                Route Details
                            </h3>
                            <div class="route-timeline">
                                <div class="timeline-item completed">
                                    <div class="timeline-marker">
                                        <i class="fas fa-check"></i>
                                    </div>
                                    <div class="timeline-content">
                                        <h4>Pickup Completed</h4>
                                        <p>{{ selectedJob.pickupLocation }}</p>
                                        <span class="timestamp">{{ selectedJob.pickupTime }}</span>
                                    </div>
                                </div>

                                <div class="timeline-item active">
                                    <div class="timeline-marker">
                                        <i class="fas fa-truck"></i>
                                    </div>
                                    <div class="timeline-content">
                                        <h4>In Transit</h4>
                                        <p>Current location: {{ selectedJob.currentLocation }}</p>
                                        <span class="timestamp">Last updated: {{ formatTime(selectedJob.lastUpdate)
                                        }}</span>
                                    </div>
                                </div>

                                <div class="timeline-item pending">
                                    <div class="timeline-marker">
                                        <i class="fas fa-map-marker-alt"></i>
                                    </div>
                                    <div class="timeline-content">
                                        <h4>Delivery Destination</h4>
                                        <p>{{ selectedJob.deliveryLocation }}</p>
                                        <span class="timestamp">ETA: {{ selectedJob.eta }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Customer Information -->
                        <div class="customer-section">
                            <h3>
                                <i class="fas fa-user-tie"></i>
                                Customer Information
                            </h3>
                            <div class="customer-card">
                                <div class="customer-details">
                                    <h4>{{ selectedJob.customerInfo.name }}</h4>
                                    <p>{{ selectedJob.customerInfo.company }}</p>
                                    <p>{{ selectedJob.customerInfo.phone }}</p>
                                    <p>{{ selectedJob.customerInfo.email }}</p>
                                </div>
                                <div class="customer-actions">
                                    <button @click="callCustomer" class="action-btn call">
                                        <i class="fas fa-phone"></i>
                                    </button>
                                    <button @click="emailCustomer" class="action-btn email">
                                        <i class="fas fa-envelope"></i>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Live Updates -->
                        <div class="updates-section">
                            <h3>
                                <i class="fas fa-clock"></i>
                                Live Updates
                            </h3>
                            <div class="updates-list">
                                <div v-for="update in selectedJob.liveUpdates" :key="update.id" class="update-item">
                                    <div class="update-time">{{ formatTime(update.timestamp) }}</div>
                                    <div class="update-content">
                                        <i :class="update.icon"></i>
                                        <span>{{ update.message }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Job Actions -->
                        <div class="actions-section">
                            <button @click="shareTracking" class="action-button share">
                                <i class="fas fa-share-alt"></i>
                                Share Tracking Link
                            </button>
                            <button @click="downloadReport" class="action-button download">
                                <i class="fas fa-download"></i>
                                Download Report
                            </button>
                            <button @click="viewJobDetails" class="action-button details">
                                <i class="fas fa-info-circle"></i>
                                View Full Details
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Error Modal -->
        <div v-if="showError" class="error-modal">
            <div class="error-content">
                <div class="error-icon">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <h3>{{ errorTitle }}</h3>
                <p>{{ errorMessage }}</p>
                <button @click="closeError" class="error-close-btn">Close</button>
            </div>
        </div>
    </div>
</template>

<script>
// import './tracking.css';
import L from 'leaflet';
import MapConfig, { MapUtils } from '../../../../config/map-config';

export default {
    name: 'TrackingPage',
    data() {
        return {
            searchJobId: '',
            selectedJob: null,
            autoRefresh: true,
            isRefreshing: false,
            showError: false,
            errorTitle: '',
            errorMessage: '',
            map: null,
            vehicleMarker: null,
            pickupMarker: null,
            deliveryMarker: null,
            routeLine: null,
            tileLayer: null,
            refreshInterval: null,
            resizeObserver: null,
            lastResizeTime: 0,
            resizeDebounceDelay: 200, // Debounce resize events (ms)
            activeJobs: [],
            jobsData: {},
            mockJobsData: {
                'JOB-2025-001': {
                    id: 'JOB-2025-001',
                    status: 'in-transit',
                    progress: 60,
                    distanceRemaining: 80,
                    pickupLocation: 'Thamel, Kathmandu',
                    deliveryLocation: 'Lakeside, Pokhara',
                    currentLocation: 'Mugling, Bagmati',
                    pickupTime: '9:00 AM',
                    eta: '3:00 PM',
                    lastUpdate: new Date(),
                    pickupCoords: [27.7172, 85.3240], // Kathmandu
                    deliveryCoords: [28.2096, 83.9856], // Pokhara
                    currentCoords: [27.6833, 84.4167], // Mugling
                    driverInfo: {
                        name: 'Ramesh Shrestha',
                        phone: '+977 984-123-4567',
                        rating: 4.7,
                        vehicle: 'Truck - NP-1234',
                        avatar: null,
                        isOnline: true,
                    },
                    customerInfo: {
                        name: 'Himalayan Traders',
                        company: 'Himalayan Traders Pvt Ltd',
                        phone: '+977 985-987-6543',
                        email: 'contact@himalayantraders.com',
                    },
                    liveUpdates: [
                        {
                            id: 1,
                            timestamp: new Date(Date.now() - 5 * 60000),
                            icon: 'fas fa-truck',
                            message: 'Vehicle passed through Mugling',
                        },
                        {
                            id: 2,
                            timestamp: new Date(Date.now() - 15 * 60000),
                            icon: 'fas fa-gas-pump',
                            message: 'Driver stopped for fuel at Narayanghat',
                        },
                        {
                            id: 3,
                            timestamp: new Date(Date.now() - 30 * 60000),
                            icon: 'fas fa-route',
                            message: 'Route updated due to road conditions',
                        },
                        {
                            id: 4,
                            timestamp: new Date(Date.now() - 45 * 60000),
                            icon: 'fas fa-check',
                            message: 'Package picked up in Kathmandu',
                        },
                    ],
                },
                'JOB-2025-002': {
                    id: 'JOB-2025-002',
                    status: 'in-transit',
                    progress: 45,
                    distanceRemaining: 150,
                    pickupLocation: 'Main Road, Biratnagar',
                    deliveryLocation: 'Sauraha, Chitwan',
                    currentLocation: 'Itahari',
                    pickupTime: '7:30 AM',
                    eta: '4:30 PM',
                    lastUpdate: new Date(),
                    pickupCoords: [26.4542, 87.2797], // Biratnagar
                    deliveryCoords: [27.5824, 84.4936], // Chitwan
                    currentCoords: [26.6646, 87.2718], // Itahari
                    driverInfo: {
                        name: 'Sita Gurung',
                        phone: '+977 981-234-5678',
                        rating: 4.8,
                        vehicle: 'Van - NP-5678',
                        avatar: null,
                        isOnline: true,
                    },
                    customerInfo: {
                        name: 'Nepal Logistics',
                        company: 'Nepal Logistics Ltd',
                        phone: '+977 986-876-5432',
                        email: 'info@nepalogistics.com',
                    },
                    liveUpdates: [
                        {
                            id: 1,
                            timestamp: new Date(Date.now() - 10 * 60000),
                            icon: 'fas fa-truck',
                            message: 'Vehicle passed through Itahari',
                        },
                        {
                            id: 2,
                            timestamp: new Date(Date.now() - 25 * 60000),
                            icon: 'fas fa-exclamation-triangle',
                            message: 'Traffic delay reported near Dharan',
                        },
                        {
                            id: 3,
                            timestamp: new Date(Date.now() - 40 * 60000),
                            icon: 'fas fa-check',
                            message: 'Package picked up in Biratnagar',
                        },
                    ],
                },
                'JOB-2025-003': {
                    id: 'JOB-2025-003',
                    status: 'delayed',
                    progress: 30,
                    distanceRemaining: 200,
                    pickupLocation: 'Patan, Lalitpur',
                    deliveryLocation: 'Siddharthanagar, Bhairahawa',
                    currentLocation: 'Hetauda',
                    pickupTime: '8:00 AM',
                    eta: '6:00 PM',
                    lastUpdate: new Date(),
                    pickupCoords: [27.6766, 85.3147], // Lalitpur
                    deliveryCoords: [27.5067, 83.4526], // Bhairahawa
                    currentCoords: [27.4289, 85.0322], // Hetauda
                    driverInfo: {
                        name: 'Hari Thapa',
                        phone: '+977 982-345-6789',
                        rating: 4.5,
                        vehicle: 'Truck - NP-9012',
                        avatar: null,
                        isOnline: true,
                    },
                    customerInfo: {
                        name: 'Everest Enterprises',
                        company: 'Everest Enterprises',
                        phone: '+977 984-765-4321',
                        email: 'contact@everestent.com',
                    },
                    liveUpdates: [
                        {
                            id: 1,
                            timestamp: new Date(Date.now() - 10 * 60000),
                            icon: 'fas fa-truck',
                            message: 'Vehicle delayed in Hetauda due to roadblock',
                        },
                        {
                            id: 2,
                            timestamp: new Date(Date.now() - 20 * 60000),
                            icon: 'fas fa-exclamation-triangle',
                            message: 'Delay reported due to construction',
                        },
                        {
                            id: 3,
                            timestamp: new Date(Date.now() - 35 * 60000),
                            icon: 'fas fa-check',
                            message: 'Package picked up in Lalitpur',
                        },
                    ],
                },
            },
        };
    },

    async mounted() {
        await this.fetchActiveJobs();
        this.startAutoRefresh();
        this.setupResizeObserver();
    },

    beforeUnmount() {
        this.stopAutoRefresh();
        this.clearMap();
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }
    },

    methods: {
        async initializeMap() {
            await this.$nextTick();
            const mapContainer = document.getElementById('tracking-map');
            if (!mapContainer) {
                console.error('Map container #tracking-map not found');
                this.showErrorModal('Map Error', 'Unable to initialize map. Please try again.');
                return;
            }

            if (!this.map) {
                try {
                    this.map = L.map('tracking-map', {
                        zoomControl: true,
                        attributionControl: true,
                        maxBounds: MapConfig.maxBounds,
                        maxBoundsViscosity: MapConfig.maxBoundsViscosity,
                        minZoom: MapConfig.minZoom,
                        maxZoom: MapConfig.maxZoom,
                    }).setView(MapConfig.defaultCenter, MapConfig.defaultZoom);

                    this.tileLayer = L.tileLayer(MapConfig.tileLayers.osm.url, {
                        attribution: MapConfig.tileLayers.osm.attribution,
                        maxZoom: MapConfig.tileLayers.osm.maxZoom,
                        subdomains: MapConfig.tileLayers.osm.subdomains,
                        tileSize: 256,
                        useCache: MapConfig.tileLayers.osm.useCache,
                        cacheMaxAge: MapConfig.tileLayers.osm.cacheMaxAge,
                        cacheEmptyTile: MapConfig.tileLayers.osm.cacheEmptyTile,
                    });

                    this.tileLayer.on('tileerror', this.handleTileError);
                    this.tileLayer.on('tileload', () => console.log('Tile loaded'));
                    this.tileLayer.addTo(this.map);
                    this.map.on('click', this.onMapClick);

                    // Debounce initial size invalidation
                    setTimeout(() => {
                        if (this.map) {
                            this.map.invalidateSize();
                            console.log('Map initialized, size:', mapContainer.offsetWidth, mapContainer.offsetHeight);
                        }
                    }, this.resizeDebounceDelay);
                } catch (error) {
                    console.error('Map initialization failed:', error);
                    this.showErrorModal('Map Error', 'Failed to initialize map: ' + error.message);
                }
            }
        },

        handleTileError(error, tile) {
            const url = error.target.src;
            let retries = error.target._retryCount || 0;

            if (retries < MapConfig.retrySettings.maxRetries) {
                retries++;
                error.target._retryCount = retries;
                setTimeout(() => {
                    error.target.src = url;
                    console.log(`Retrying tile ${url} (attempt ${retries}/${MapConfig.retrySettings.maxRetries})`);
                }, MapConfig.retrySettings.retryDelay * retries);
            } else {
                console.error(`Failed to load tile ${url} after ${MapConfig.retrySettings.maxRetries} retries`);
                this.showErrorModal('Tile Load Error', 'Unable to load map tiles. Please try again later or check your connection.');
            }
        },

        setupResizeObserver() {
            if (typeof ResizeObserver === 'undefined') {
                window.addEventListener('resize', this.debounceResize);
                return;
            }
            const mapContainer = document.getElementById('tracking-map');
            if (mapContainer && this.map) {
                this.resizeObserver = new ResizeObserver(this.debounceResize);
                this.resizeObserver.observe(mapContainer);
            }
        },

        debounceResize() {
            const now = Date.now();
            if (now - this.lastResizeTime < this.resizeDebounceDelay) return;
            this.lastResizeTime = now;
            if (this.map) {
                this.map.invalidateSize();
            }
        },

        clearMap() {
            if (this.map) {
                this.map.off();
                this.map.remove();
                this.map = null;
                this.tileLayer = null;
            }
            this.vehicleMarker = null;
            this.pickupMarker = null;
            this.deliveryMarker = null;
            this.routeLine = null;
        },

        async fetchActiveJobs() {
            try {
                const response = await fetch('http://localhost:5000/jobs', {
                    headers: { 'Authorization': 'Bearer <your-token>' }, // Replace with actual token
                });
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                const jobs = await response.json();
                console.log('Fetched jobs:', jobs);

                this.activeJobs = jobs.filter(job => this.isValidJob(job)).map(job => ({
                    id: job.id,
                    origin: job.pickupLocation,
                    destination: job.deliveryLocation,
                    status: job.status,
                    driver: job.driverInfo?.name || 'Unknown',
                    eta: job.eta,
                    progress: job.progress,
                }));

                this.jobsData = jobs.reduce((acc, job) => {
                    if (this.isValidJob(job)) {
                        acc[job.id] = job;
                    }
                    return acc;
                }, {});

                if (this.activeJobs.length === 0) {
                    console.warn('No valid jobs from API, using mock data');
                    this.activeJobs = Object.values(this.mockJobsData).map(job => ({
                        id: job.id,
                        origin: job.pickupLocation,
                        destination: job.deliveryLocation,
                        status: job.status,
                        driver: job.driverInfo.name,
                        eta: job.eta,
                        progress: job.progress,
                    }));
                    this.jobsData = { ...this.mockJobsData };
                }
            } catch (error) {
                console.error('Failed to fetch jobs:', error);
                this.showErrorModal('API Error', 'Unable to fetch jobs. Using mock data.');
                this.activeJobs = Object.values(this.mockJobsData).map(job => ({
                    id: job.id,
                    origin: job.pickupLocation,
                    destination: job.deliveryLocation,
                    status: job.status,
                    driver: job.driverInfo.name,
                    eta: job.eta,
                    progress: job.progress,
                }));
                this.jobsData = { ...this.mockJobsData };
            }
        },

        async searchJob() {
            if (!this.searchJobId.trim()) {
                this.showErrorModal('Invalid Job ID', 'Please enter a valid Job ID to track.');
                return;
            }

            const jobId = this.searchJobId.trim().toUpperCase();

            if (this.jobsData[jobId]) {
                this.selectJob(jobId);
            } else {
                try {
                    const response = await fetch(`http://localhost:5000/jobs/${jobId}`, {
                        headers: { 'Authorization': 'Bearer <your-token>' }, // Replace with actual token
                    });
                    if (!response.ok) throw new Error(`HTTP ${response.status}`);
                    const job = await response.json();
                    if (this.isValidJob(job)) {
                        this.jobsData[jobId] = job;
                        this.activeJobs.push({
                            id: job.id,
                            origin: job.pickupLocation,
                            destination: job.deliveryLocation,
                            status: job.status,
                            driver: job.driverInfo?.name || 'Unknown',
                            eta: job.eta,
                            progress: job.progress,
                        });
                        this.selectJob(jobId);
                    } else {
                        this.showErrorModal('Invalid Job', `Job ID "${jobId}" has invalid data.`);
                    }
                } catch (error) {
                    console.error('Failed to fetch job:', error);
                    this.showErrorModal('Job Not Found', `Job ID "${jobId}" was not found or is not currently active.`);
                }
            }
        },

        isValidJob(job) {
            return (
                job &&
                job.id &&
                job.status &&
                job.progress !== undefined &&
                job.distanceRemaining !== undefined &&
                job.pickupLocation &&
                job.deliveryLocation &&
                job.currentLocation &&
                job.pickupTime &&
                job.eta &&
                job.lastUpdate &&
                Array.isArray(job.pickupCoords) && job.pickupCoords.length === 2 &&
                Array.isArray(job.deliveryCoords) && job.deliveryCoords.length === 2 &&
                Array.isArray(job.currentCoords) && job.currentCoords.length === 2 &&
                MapUtils.isValidNepalCoordinate(job.pickupCoords[0], job.pickupCoords[1]) &&
                MapUtils.isValidNepalCoordinate(job.deliveryCoords[0], job.deliveryCoords[1]) &&
                MapUtils.isValidNepalCoordinate(job.currentCoords[0], job.currentCoords[1]) &&
                job.driverInfo && job.driverInfo.name && job.driverInfo.phone &&
                job.customerInfo && job.customerInfo.name && job.customerInfo.phone &&
                Array.isArray(job.liveUpdates)
            );
        },

        async selectJob(jobId) {
            const jobData = this.jobsData[jobId];
            if (!jobData) {
                this.showErrorModal('Job Not Found', `Job ID "${jobId}" was not found.`);
                return;
            }

            this.selectedJob = jobData;
            this.searchJobId = jobId;

            await this.initializeMap();
            if (this.map) {
                this.updateMapForJob(jobData);
                this.setupResizeObserver();
            }
        },

        updateMapForJob(job) {
            if (!this.map || !job) return;

            this.clearMapMarkers();

            const validPickup = MapUtils.isValidNepalCoordinate(job.pickupCoords[0], job.pickupCoords[1]);
            const validDelivery = MapUtils.isValidNepalCoordinate(job.deliveryCoords[0], job.deliveryCoords[1]);
            const validCurrent = MapUtils.isValidNepalCoordinate(job.currentCoords[0], job.currentCoords[1]);

            if (!validPickup || !validDelivery || !validCurrent) {
                console.error('Invalid coordinates for job:', job.id, {
                    pickupCoords: job.pickupCoords,
                    deliveryCoords: job.deliveryCoords,
                    currentCoords: job.currentCoords,
                });
                this.showErrorModal('Invalid Coordinates', 'One or more coordinates are invalid or outside Nepal.');
                return;
            }

            try {
                this.pickupMarker = L.marker(job.pickupCoords, {
                    icon: L.icon(MapConfig.markers.pickup),
                })
                    .addTo(this.map)
                    .bindPopup(
                        `<b>Pickup Location</b><br>${job.pickupLocation}<br>Completed: ${job.pickupTime}`,
                        MapConfig.popupOptions
                    );

                this.deliveryMarker = L.marker(job.deliveryCoords, {
                    icon: L.icon(MapConfig.markers.delivery),
                })
                    .addTo(this.map)
                    .bindPopup(
                        `<b>Delivery Location</b><br>${job.deliveryLocation}<br>ETA: ${job.eta}`,
                        MapConfig.popupOptions
                    );

                this.vehicleMarker = L.marker(job.currentCoords, {
                    icon: L.icon(MapConfig.markers.vehicle),
                })
                    .addTo(this.map)
                    .bindPopup(
                        `<b>Current Location</b><br>${job.currentLocation}<br>Driver: ${job.driverInfo.name}`,
                        MapConfig.popupOptions
                    );

                this.routeLine = L.polyline([job.pickupCoords, job.currentCoords, job.deliveryCoords], MapConfig.routeStyles.default)
                    .addTo(this.map);

                this.fitRoute();
            } catch (error) {
                console.error('Error updating map for job:', error);
                this.showErrorModal('Map Update Error', 'Failed to update map markers: ' + error.message);
            }
        },

        clearMapMarkers() {
            if (this.pickupMarker) {
                this.map.removeLayer(this.pickupMarker);
                this.pickupMarker = null;
            }
            if (this.deliveryMarker) {
                this.map.removeLayer(this.deliveryMarker);
                this.deliveryMarker = null;
            }
            if (this.vehicleMarker) {
                this.map.removeLayer(this.vehicleMarker);
                this.vehicleMarker = null;
            }
            if (this.routeLine) {
                this.map.removeLayer(this.routeLine);
                this.routeLine = null;
            }
        },

        centerOnVehicle() {
            if (!this.map || !this.selectedJob || !this.selectedJob.currentCoords) {
                console.warn('Cannot center on vehicle: map or coordinates missing');
                return;
            }
            try {
                this.map.setView(this.selectedJob.currentCoords, 12);
            } catch (error) {
                console.error('Error centering on vehicle:', error);
                this.showErrorModal('Map Error', 'Failed to center on vehicle: ' + error.message);
            }
        },

        fitRoute() {
            if (!this.map || !this.selectedJob || !this.selectedJob.pickupCoords || !this.selectedJob.currentCoords || !this.selectedJob.deliveryCoords) {
                console.warn('Cannot fit route: map or coordinates missing');
                return;
            }
            try {
                const bounds = MapUtils.createBounds([
                    this.selectedJob.pickupCoords,
                    this.selectedJob.currentCoords,
                    this.selectedJob.deliveryCoords,
                ]);
                if (bounds) {
                    this.map.fitBounds(bounds, { padding: [20, 20] });
                }
            } catch (error) {
                console.error('Error fitting route:', error);
                this.showErrorModal('Map Error', 'Failed to fit route: ' + error.message);
            }
        },

        toggleTraffic() {
            console.log('Traffic layer not supported in OSM');
            this.showErrorModal('Feature Unavailable', 'Traffic layer is not supported with OpenStreetMap.');
        },

        toggleSatellite() {
            console.log('Satellite view not supported in OSM');
            this.showErrorModal('Feature Unavailable', 'Satellite view is not supported with OpenStreetMap.');
        },

        toggleAutoRefresh() {
            this.autoRefresh = !this.autoRefresh;
            if (this.autoRefresh) {
                this.startAutoRefresh();
            } else {
                this.stopAutoRefresh();
            }
        },

        startAutoRefresh() {
            if (this.refreshInterval) {
                clearInterval(this.refreshInterval);
            }

            this.refreshInterval = setInterval(() => {
                if (this.autoRefresh && this.selectedJob) {
                    this.updateJobData();
                }
            }, MapConfig.updateIntervals.vehiclePosition);
        },

        stopAutoRefresh() {
            if (this.refreshInterval) {
                clearInterval(this.refreshInterval);
                this.refreshInterval = null;
            }
        },

        async refreshTracking() {
            this.isRefreshing = true;
            try {
                await new Promise(resolve => setTimeout(resolve, 1000));
                if (this.selectedJob) {
                    await this.updateJobData();
                }
            } finally {
                this.isRefreshing = false;
            }
        },

        async updateJobData() {
            if (!this.selectedJob || !this.map) return;

            try {
                const jobId = this.selectedJob.id;
                const response = await fetch(`http://localhost:5000/jobs/${jobId}`, {
                    headers: { 'Authorization': 'Bearer <your-token>' }, // Replace with actual token
                });
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                const job = await response.json();

                if (this.isValidJob(job)) {
                    this.jobsData[jobId] = job;
                    this.selectedJob = job;

                    if (this.vehicleMarker) {
                        this.vehicleMarker.setLatLng(job.currentCoords);
                        this.vehicleMarker.setPopupContent(
                            `<b>Current Location</b><br>${job.currentLocation}<br>Driver: ${job.driverInfo.name}<br>Last updated: ${this.formatTime(job.lastUpdate)}`
                        );
                        this.routeLine.setLatLngs([job.pickupCoords, job.currentCoords, job.deliveryCoords]);
                    } else {
                        this.updateMapForJob(job);
                    }
                } else {
                    console.warn('Invalid job data from API, skipping update');
                }
            } catch (error) {
                console.error('Failed to update job data:', error);
                this.showErrorModal('Update Error', 'Failed to fetch job updates. Using mock data.');
                const job = this.selectedJob;
                const moveDistance = 0.01;
                const newLat = job.currentCoords[0] + (Math.random() - 0.5) * moveDistance;
                const newLng = job.currentCoords[1] + (Math.random() - 0.5) * moveDistance;

                if (MapUtils.isValidNepalCoordinate(newLat, newLng)) {
                    job.currentCoords = [newLat, newLng];
                    job.currentLocation = `En route near ${job.currentLocation.split(', ')[1] || job.currentLocation}`;
                }

                if (job.progress < 100) {
                    job.progress = Math.min(100, job.progress + Math.random() * 2);
                    job.distanceRemaining = Math.max(0, job.distanceRemaining - Math.random() * 5);
                }

                job.lastUpdate = new Date();

                if (Math.random() < 0.3) {
                    const updates = [
                        'Vehicle speed: 60 km/h',
                        'Traffic conditions: Normal',
                        'Next checkpoint in 15 minutes',
                        'Driver took a short break',
                        'Route optimized for faster delivery',
                    ];
                    job.liveUpdates.unshift({
                        id: Date.now(),
                        timestamp: new Date(),
                        icon: 'fas fa-info-circle',
                        message: updates[Math.floor(Math.random() * updates.length)],
                    });
                    job.liveUpdates = job.liveUpdates.slice(0, 10);
                }

                if (this.vehicleMarker && this.map) {
                    this.vehicleMarker.setLatLng(job.currentCoords);
                    this.vehicleMarker.setPopupContent(
                        `<b>Current Location</b><br>${job.currentLocation}<br>Driver: ${job.driverInfo.name}<br>Last updated: ${this.formatTime(job.lastUpdate)}`
                    );
                    this.routeLine.setLatLngs([job.pickupCoords, job.currentCoords, job.deliveryCoords]);
                }
            }
        },

        closeTracking() {
            this.selectedJob = null;
            this.searchJobId = '';
            this.clearMap();
        },

        formatStatus(status) {
            return status.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        },

        getStatusIcon(status) {
            const icons = {
                'pending': 'fas fa-clock',
                'in-transit': 'fas fa-truck',
                'delayed': 'fas fa-exclamation-triangle',
                'delivered': 'fas fa-check-circle',
            };
            return icons[status] || 'fas fa-circle';
        },

        formatTime(date) {
            return date.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
                timeZone: 'Asia/Kathmandu',
            });
        },

        callDriver() {
            if (this.selectedJob) {
                window.open(`tel:${this.selectedJob.driverInfo.phone}`);
            }
        },

        messageDriver() {
            console.log('Opening message interface for driver');
        },

        callCustomer() {
            if (this.selectedJob) {
                window.open(`tel:${this.selectedJob.customerInfo.phone}`);
            }
        },

        emailCustomer() {
            if (this.selectedJob) {
                window.open(`mailto:${this.selectedJob.customerInfo.email}`);
            }
        },

        shareTracking() {
            if (this.selectedJob) {
                const trackingUrl = `${window.location.origin}/track/${this.selectedJob.id}`;
                navigator.clipboard.writeText(trackingUrl).then(() => {
                    alert('Tracking link copied to clipboard!');
                });
            }
        },

        downloadReport() {
            console.log('Downloading tracking report...');
        },

        viewJobDetails() {
            console.log('Opening detailed job view...');
        },

        showErrorModal(title, message) {
            this.errorTitle = title;
            this.errorMessage = message;
            this.showError = true;
        },

        closeError() {
            this.showError = false;
        },

        onMapClick(e) {
            const lat = e.latlng.lat;
            const lng = e.latlng.lng;
            if (MapUtils.isValidNepalCoordinate(lat, lng)) {
                console.log('Map clicked at:', MapUtils.formatCoordinates(lat, lng));
            } else {
                console.warn('Map clicked outside Nepal bounds:', MapUtils.formatCoordinates(lat, lng));
                this.showErrorModal('Invalid Click', 'Please click within Nepal to interact with the map.');
            }
        },
    },
};
</script>

<style scoped>
@import './tracking.css';
</style>