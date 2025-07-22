<template>
    <div class="job-tracking-container">
        <!-- Loading State -->
        <div v-if="isLoading" class="loading-state">
            <i class="fas fa-spinner fa-spin"></i>
            Loading job tracking...
        </div>

        <!-- Error State -->
        <div v-if="errorMessage" class="error-state">
            <i class="fas fa-exclamation-circle"></i>
            {{ errorMessage }}
            <button @click="fetchJobData" class="retry-btn">Retry</button>
        </div>

        <!-- Job Tracking Content -->
        <div v-if="job && !isLoading" class="tracking-content">
            <!-- Header -->
            <div class="tracking-header">
                <div class="header-content">
                    <div class="header-left">
                        <button @click="goBack" class="back-btn">
                            <i class="fas fa-arrow-left"></i>
                            Back to Dashboard
                        </button>
                        <div class="job-title">
                            <h1>Live Tracking - Job #{{ job.id }}</h1>
                            <p>Real-time location and status updates</p>
                        </div>
                    </div>
                    <div class="header-right">
                        <div class="status-badge" :class="`status-${job.status}`">
                            <i :class="getStatusIcon(job.status)"></i>
                            {{ job.status.toUpperCase() }}
                        </div>
                        <button @click="refreshTracking" class="refresh-btn" :disabled="isRefreshing">
                            <i :class="['fas', isRefreshing ? 'fa-spinner fa-spin' : 'fa-sync-alt']"></i>
                            Refresh
                        </button>
                    </div>
                </div>
            </div>

            <!-- Main Tracking Content -->
            <div class="tracking-main">
                <!-- Map Section -->
                <div class="map-section">
                    <div id="job-tracking-map" class="tracking-map"></div>

                    <!-- Map Controls -->
                    <div class="map-controls">
                        <button @click="centerOnVehicle" class="map-control" title="Center on Vehicle">
                            <i class="fas fa-crosshairs"></i>
                        </button>
                        <button @click="fitRoute" class="map-control" title="Fit Route">
                            <i class="fas fa-expand-arrows-alt"></i>
                        </button>
                        <button @click="toggleMapStyle" class="map-control" title="Toggle Map Style">
                            <i class="fas fa-layer-group"></i>
                        </button>
                    </div>

                    <!-- Live Stats Overlay -->
                    <div class="live-stats">
                        <div class="stat-item">
                            <i class="fas fa-tachometer-alt"></i>
                            <div class="stat-content">
                                <div class="stat-value">{{ job.currentSpeed || 0 }} km/h</div>
                                <div class="stat-label">Current Speed</div>
                            </div>
                        </div>
                        <div class="stat-item">
                            <i class="fas fa-road"></i>
                            <div class="stat-content">
                                <div class="stat-value">{{ job.distance || 0 }} km</div>
                                <div class="stat-label">Total Distance</div>
                            </div>
                        </div>
                        <div class="stat-item">
                            <i class="fas fa-clock"></i>
                            <div class="stat-content">
                                <div class="stat-value">{{ job.estimatedTime || 0 }} min</div>
                                <div class="stat-label">ETA</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Info Panel -->
                <div class="info-panel">
                    <!-- Progress Timeline -->
                    <div class="panel-section">
                        <h3 class="section-title">
                            <i class="fas fa-route"></i>
                            Delivery Progress
                        </h3>
                        <div class="progress-timeline">
                            <div class="timeline-item"
                                :class="{ completed: job.pickupCompleted, active: job.status === 'pending' }">
                                <div class="timeline-icon">
                                    <i class="fas fa-circle"></i>
                                </div>
                                <div class="timeline-content">
                                    <div class="timeline-title">Pickup</div>
                                    <div class="timeline-location">{{ job.pickupLocation }}</div>
                                    <div class="timeline-time">{{ formatTime(job.pickupTime) }}</div>
                                </div>
                                <div class="timeline-status">
                                    <i v-if="job.pickupCompleted" class="fas fa-check-circle completed"></i>
                                    <i v-else-if="job.status === 'pending'" class="fas fa-clock pending"></i>
                                </div>
                            </div>

                            <div class="timeline-connector"
                                :class="{ active: job.status === 'active' || job.status === 'in-transit' }"></div>

                            <div class="timeline-item"
                                :class="{ active: job.status === 'active' || job.status === 'in-transit' }">
                                <div class="timeline-icon">
                                    <i class="fas fa-truck"></i>
                                </div>
                                <div class="timeline-content">
                                    <div class="timeline-title">In Transit</div>
                                    <div class="timeline-location">{{ job.currentLocation }}</div>
                                    <div class="timeline-time">{{ formatTime(job.lastUpdate) }}</div>
                                </div>
                                <div class="timeline-status">
                                    <div v-if="job.status === 'active' || job.status === 'in-transit'"
                                        class="progress-indicator">
                                        {{ job.progress }}%
                                    </div>
                                </div>
                            </div>

                            <div class="timeline-connector"
                                :class="{ completed: job.status === 'delivered' || job.status === 'completed' }"></div>

                            <div class="timeline-item"
                                :class="{ completed: job.status === 'delivered' || job.status === 'completed' }">
                                <div class="timeline-icon">
                                    <i class="fas fa-map-marker-alt"></i>
                                </div>
                                <div class="timeline-content">
                                    <div class="timeline-title">Delivery</div>
                                    <div class="timeline-location">{{ job.deliveryLocation }}</div>
                                    <div class="timeline-time">ETA: {{ formatTime(job.eta) }}</div>
                                </div>
                                <div class="timeline-status">
                                    <i v-if="job.status === 'delivered' || job.status === 'completed'"
                                        class="fas fa-check-circle completed"></i>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Driver Information -->
                    <div class="panel-section">
                        <h3 class="section-title">
                            <i class="fas fa-user-tie"></i>
                            Driver Information
                        </h3>
                        <div class="driver-card">
                            <div class="driver-avatar">
                                <img :src="job.driverInfo.avatar" :alt="job.driverInfo.name" />
                            </div>
                            <div class="driver-details">
                                <div class="driver-name">{{ job.driverInfo.name }}</div>
                                <div class="driver-phone">{{ job.driverInfo.phone }}</div>
                                <div class="driver-rating">
                                    <i v-for="n in 5" :key="n"
                                        :class="['fas fa-star', { active: n <= job.driverInfo.rating }]"></i>
                                    <span>{{ job.driverInfo.rating }}/5</span>
                                </div>
                            </div>
                            <div class="driver-actions">
                                <button @click="callDriver" class="action-btn call">
                                    <i class="fas fa-phone"></i>
                                    Call
                                </button>
                                <button @click="messageDriver" class="action-btn message">
                                    <i class="fas fa-sms"></i>
                                    SMS
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Vehicle Information -->
                    <div class="panel-section">
                        <h3 class="section-title">
                            <i class="fas fa-truck"></i>
                            Vehicle Information
                        </h3>
                        <div class="vehicle-info">
                            <div class="vehicle-item">
                                <i class="fas fa-truck"></i>
                                <span>{{ job.vehicleInfo.type }}</span>
                            </div>
                            <div class="vehicle-item">
                                <i class="fas fa-id-card"></i>
                                <span>{{ job.vehicleInfo.plate }}</span>
                            </div>
                            <div class="vehicle-item">
                                <i class="fas fa-palette"></i>
                                <span>{{ job.vehicleInfo.color }}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Customer Information -->
                    <div class="panel-section">
                        <h3 class="section-title">
                            <i class="fas fa-user"></i>
                            Customer Information
                        </h3>
                        <div class="customer-info">
                            <div class="info-item">
                                <label>Name:</label>
                                <span>{{ job.customer?.name || 'N/A' }}</span>
                            </div>
                            <div class="info-item">
                                <label>Phone:</label>
                                <span>{{ job.customer?.phone || 'N/A' }}</span>
                            </div>
                            <div class="info-item">
                                <label>Email:</label>
                                <span>{{ job.customer?.email || 'N/A' }}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Last Update -->
                    <div class="last-update">
                        <i class="fas fa-clock"></i>
                        Last updated: {{ formatTime(job.lastUpdate) }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { useRouter, useRoute } from 'vue-router'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

export default {
    name: 'JobTracking',
    setup() {
        const router = useRouter()
        const route = useRoute()
        return { router, route }
    },
    data() {
        return {
            // Job data
            job: null,

            // UI state
            isLoading: false,
            isRefreshing: false,
            errorMessage: '',

            // Map
            map: null,
            mapStyle: 'streets-v2',

            // Markers
            pickupMarker: null,
            deliveryMarker: null,
            vehicleMarker: null,

            // Real-time updates
            updateInterval: null,

            // API configuration
            mapTilerKey: import.meta.env.VITE_MAPTILER_API_KEY || 'pj6JP8mcZoHH4whFRfMA'
        }
    },

    async mounted() {
        await this.fetchJobData()
        this.initializeMap()
        this.startRealTimeUpdates()
    },

    beforeUnmount() {
        this.stopRealTimeUpdates()
        if (this.map) {
            this.map.remove()
        }
    },

    methods: {
        async fetchJobData() {
            this.isLoading = true
            this.errorMessage = ''

            try {
                // Try to fetch from API first
                const response = await fetch(`/api/jobs/${this.route.params.id}`)
                if (!response.ok) {
                    throw new Error('API not available')
                }
                this.job = await response.json()
            } catch (error) {
                console.warn('API not available, using mock data:', error)
                // Fallback to mock data
                this.job = this.getMockJobData()
            } finally {
                this.isLoading = false
            }
        },

        getMockJobData() {
            // Mock data based on job ID from route
            const jobId = this.route.params.id

            const mockJobs = {
                'job001': {
                    id: 'JOB001',
                    _id: 'job001',
                    status: 'active',
                    pickupLocation: 'Kathmandu Durbar Square',
                    deliveryLocation: 'Bhaktapur Durbar Square',
                    pickupTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
                    eta: new Date(Date.now() + 1 * 60 * 60 * 1000),
                    lastUpdate: new Date(Date.now() - 5 * 60 * 1000),
                    currentLocation: 'Thimi, Bhaktapur',
                    progress: 65,
                    pickupCompleted: true,
                    pickupCoords: [85.3240, 27.7172],
                    deliveryCoords: [85.4298, 27.6710],
                    currentCoords: [85.3890, 27.6810],
                    distance: 12.5,
                    estimatedTime: 45,
                    currentSpeed: 35,
                    driverInfo: {
                        name: 'Ram Bahadur Shrestha',
                        phone: '+977-9841234567',
                        avatar: '/avatar1.jpg',
                        rating: 4.8
                    },
                    vehicleInfo: {
                        type: 'Delivery Van',
                        plate: 'BA-12-PA-3456',
                        color: 'White'
                    },
                    customer: {
                        name: 'Sita Sharma',
                        email: 'sita.sharma@email.com',
                        phone: '+977-9801234567',
                        company: 'Heritage Crafts'
                    }
                },
                'job002': {
                    id: 'JOB002',
                    _id: 'job002',
                    status: 'pending',
                    pickupLocation: 'Patan Museum',
                    deliveryLocation: 'Swayambhunath Temple',
                    pickupTime: new Date(Date.now() + 30 * 60 * 1000),
                    eta: new Date(Date.now() + 2 * 60 * 60 * 1000),
                    lastUpdate: new Date(),
                    currentLocation: 'Patan Dhoka',
                    progress: 0,
                    pickupCompleted: false,
                    pickupCoords: [85.3206, 27.6734],
                    deliveryCoords: [85.2900, 27.7149],
                    currentCoords: [85.3206, 27.6734],
                    distance: 8.2,
                    estimatedTime: 25,
                    currentSpeed: 0,
                    driverInfo: {
                        name: 'Sita Gurung',
                        phone: '+977-9851234567',
                        avatar: '/avatar2.jpg',
                        rating: 4.6
                    },
                    vehicleInfo: {
                        type: 'Motorcycle',
                        plate: 'BA-45-PA-7890',
                        color: 'Red'
                    },
                    customer: {
                        name: 'John Smith',
                        email: 'john.smith@email.com',
                        phone: '+977-9802234567',
                        company: 'Tourist Guide Services'
                    }
                }
            }

            return mockJobs[jobId] || mockJobs['job001']
        },

        async refreshTracking() {
            this.isRefreshing = true
            await this.fetchJobData()
            this.updateMapMarkers()
            this.isRefreshing = false
        },

        initializeMap() {
            if (!this.job) return

            try {
                this.map = new maplibregl.Map({
                    container: 'job-tracking-map',
                    style: `https://api.maptiler.com/maps/${this.mapStyle}/style.json?key=${this.mapTilerKey}`,
                    center: this.job.currentCoords,
                    zoom: 12,
                    maxBounds: [
                        [80.058, 26.347], // Southwest Nepal
                        [88.2015, 30.447]  // Northeast Nepal
                    ]
                })

                this.map.on('load', () => {
                    this.addMapMarkers()
                    this.addRouteLayer()
                    this.fitRoute()
                })

            } catch (error) {
                console.error('Error initializing map:', error)
                this.errorMessage = 'Failed to initialize map'
            }
        },

        addMapMarkers() {
            if (!this.map || !this.job) return

            // Add pickup marker
            this.pickupMarker = new maplibregl.Marker({
                color: '#28a745',
                scale: 1.2
            })
                .setLngLat(this.job.pickupCoords)
                .setPopup(new maplibregl.Popup().setHTML(`
          <div class="map-popup">
            <strong>Pickup Location</strong><br>
            ${this.job.pickupLocation}<br>
            ${this.job.pickupCompleted ? 'Completed' : 'Pending'}
          </div>
        `))
                .addTo(this.map)

            // Add delivery marker
            this.deliveryMarker = new maplibregl.Marker({
                color: '#dc3545',
                scale: 1.2
            })
                .setLngLat(this.job.deliveryCoords)
                .setPopup(new maplibregl.Popup().setHTML(`
          <div class="map-popup">
            <strong>Delivery Location</strong><br>
            ${this.job.deliveryLocation}<br>
            ETA: ${this.formatTime(this.job.eta)}
          </div>
        `))
                .addTo(this.map)

            // Add vehicle marker
            this.vehicleMarker = new maplibregl.Marker({
                color: '#720707',
                scale: 1.5
            })
                .setLngLat(this.job.currentCoords)
                .setPopup(new maplibregl.Popup().setHTML(`
          <div class="map-popup">
            <strong>Current Location</strong><br>
            ${this.job.currentLocation}<br>
            Driver: ${this.job.driverInfo.name}<br>
            Speed: ${this.job.currentSpeed} km/h
          </div>
        `))
                .addTo(this.map)
        },

        addRouteLayer() {
            if (!this.map || !this.job) return

            // Create route line
            const routeCoordinates = [
                this.job.pickupCoords,
                this.job.currentCoords,
                this.job.deliveryCoords
            ]

            this.map.addSource('route', {
                type: 'geojson',
                data: {
                    type: 'Feature',
                    geometry: {
                        type: 'LineString',
                        coordinates: routeCoordinates
                    }
                }
            })

            this.map.addLayer({
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
            })
        },

        updateMapMarkers() {
            if (!this.map || !this.job) return

            // Update vehicle marker position
            if (this.vehicleMarker) {
                this.vehicleMarker.setLngLat(this.job.currentCoords)
                this.vehicleMarker.setPopup(new maplibregl.Popup().setHTML(`
          <div class="map-popup">
            <strong>Current Location</strong><br>
            ${this.job.currentLocation}<br>
            Driver: ${this.job.driverInfo.name}<br>
            Speed: ${this.job.currentSpeed} km/h
          </div>
        `))
            }

            // Update route
            if (this.map.getSource('route')) {
                const routeCoordinates = [
                    this.job.pickupCoords,
                    this.job.currentCoords,
                    this.job.deliveryCoords
                ]

                this.map.getSource('route').setData({
                    type: 'Feature',
                    geometry: {
                        type: 'LineString',
                        coordinates: routeCoordinates
                    }
                })
            }
        },

        centerOnVehicle() {
            if (this.map && this.job) {
                this.map.flyTo({
                    center: this.job.currentCoords,
                    zoom: 14,
                    duration: 1000
                })
            }
        },

        fitRoute() {
            if (!this.map || !this.job) return

            const coordinates = [
                this.job.pickupCoords,
                this.job.currentCoords,
                this.job.deliveryCoords
            ]

            const bounds = coordinates.reduce((bounds, coord) => {
                return bounds.extend(coord)
            }, new maplibregl.LngLatBounds(coordinates[0], coordinates[0]))

            this.map.fitBounds(bounds, { padding: 50 })
        },

        toggleMapStyle() {
            this.mapStyle = this.mapStyle === 'streets-v2' ? 'satellite' : 'streets-v2'
            if (this.map) {
                this.map.setStyle(`https://api.maptiler.com/maps/${this.mapStyle}/style.json?key=${this.mapTilerKey}`)
                this.map.once('styledata', () => {
                    this.addMapMarkers()
                    this.addRouteLayer()
                })
            }
        },

        startRealTimeUpdates() {
            // Update every 10 seconds for real-time tracking
            this.updateInterval = setInterval(() => {
                this.simulateRealTimeUpdate()
            }, 10000)
        },

        stopRealTimeUpdates() {
            if (this.updateInterval) {
                clearInterval(this.updateInterval)
            }
        },

        simulateRealTimeUpdate() {
            if (!this.job || this.job.status === 'completed' || this.job.status === 'delivered') {
                return
            }

            // Simulate location changes
            if (this.job.currentCoords && (this.job.status === 'active' || this.job.status === 'in-transit')) {
                // Small random movement
                this.job.currentCoords[0] += (Math.random() - 0.5) * 0.001
                this.job.currentCoords[1] += (Math.random() - 0.5) * 0.001

                // Update progress
                this.job.progress = Math.min(100, this.job.progress + Math.random() * 3)

                // Update speed
                this.job.currentSpeed = Math.floor(Math.random() * 60) + 10

                // Update last update time
                this.job.lastUpdate = new Date()

                // Update map markers
                this.updateMapMarkers()
            }
        },

        callDriver() {
            window.open(`tel:${this.job.driverInfo.phone}`)
        },

        messageDriver() {
            window.open(`sms:${this.job.driverInfo.phone}`)
        },

        goBack() {
            this.router.push('/')
        },

        getStatusIcon(status) {
            const icons = {
                active: 'fas fa-truck',
                'in-transit': 'fas fa-truck',
                pending: 'fas fa-clock',
                assigned: 'fas fa-user-check',
                completed: 'fas fa-check-circle',
                delivered: 'fas fa-check-circle',
                delayed: 'fas fa-exclamation-triangle'
            }
            return icons[status] || 'fas fa-question-circle'
        },

        formatTime(date) {
            if (!date) return 'N/A'
            return new Date(date).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
            })
        }
    }
}
</script>

<style scoped>
/* Main Container */
.job-tracking-container {
    min-height: 100vh;
    background-color: #f8f9fa;
}

/* Header */
.tracking-header {
    background: linear-gradient(135deg, #720707 0%, #8b0000 100%);
    color: white;
    padding: 1.5rem 2rem;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    max-width: 1400px;
    margin: 0 auto;
}

.header-left {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.back-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 6px;
    color: white;
    cursor: pointer;
    transition: all 0.3s ease;
}

.back-btn:hover {
    background: rgba(255, 255, 255, 0.2);
}

.job-title h1 {
    font-size: 1.8rem;
    font-weight: 700;
    margin: 0 0 0.25rem 0;
}

.job-title p {
    font-size: 0.9rem;
    opacity: 0.9;
    margin: 0;
}

.header-right {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.status-badge {
    padding: 0.5rem 1rem;
    border-radius: 20px;
    font-size: 0.9rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.status-badge.status-active {
    background: rgba(255, 255, 255, 0.2);
}

.status-badge.status-pending {
    background: #ffc107;
    color: #212529;
}

.status-badge.status-completed {
    background: #28a745;
}

.status-badge.status-delayed {
    background: #dc3545;
}

.refresh-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 6px;
    color: white;
    cursor: pointer;
    transition: all 0.3s ease;
}

.refresh-btn:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.2);
}

.refresh-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

/* Main Content */
.tracking-main {
    display: flex;
    max-width: 1400px;
    margin: 0 auto;
    gap: 2rem;
    padding: 2rem;
}

/* Map Section */
.map-section {
    flex: 2;
    position: relative;
    background: white;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    height: 600px;
}

.tracking-map {
    width: 100%;
    height: 100%;
}

.map-controls {
    position: absolute;
    top: 1rem;
    right: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    z-index: 1000;
}

.map-control {
    width: 40px;
    height: 40px;
    background: white;
    border: none;
    border-radius: 6px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #2c3e50;
    transition: all 0.3s ease;
}

.map-control:hover {
    background: #720707;
    color: white;
    transform: translateY(-1px);
}

/* Live Stats Overlay */
.live-stats {
    position: absolute;
    bottom: 1rem;
    left: 1rem;
    display: flex;
    gap: 1rem;
    z-index: 1000;
}

.stat-item {
    background: rgba(255, 255, 255, 0.95);
    padding: 1rem;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    gap: 0.75rem;
    min-width: 120px;
}

.stat-item i {
    color: #720707;
    font-size: 1.2rem;
}

.stat-content {
    flex: 1;
}

.stat-value {
    font-size: 1.1rem;
    font-weight: 700;
    color: #2c3e50;
    margin-bottom: 0.25rem;
}

.stat-label {
    font-size: 0.8rem;
    color: #6c757d;
}

/* Info Panel */
.info-panel {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.panel-section {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.section-title {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-size: 1.2rem;
    font-weight: 600;
    color: #2c3e50;
    margin: 0 0 1.5rem 0;
}

.section-title i {
    color: #720707;
}

/* Progress Timeline */
.progress-timeline {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.timeline-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    border-radius: 8px;
    transition: all 0.3s ease;
}

.timeline-item.completed {
    background: #f8f9fa;
    border-left: 4px solid #28a745;
}

.timeline-item.active {
    background: #f8f9fa;
    border-left: 4px solid #720707;
}

.timeline-icon {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
    color: white;
    background: #6c757d;
}

.timeline-item.completed .timeline-icon {
    background: #28a745;
}

.timeline-item.active .timeline-icon {
    background: #720707;
}

.timeline-content {
    flex: 1;
}

.timeline-title {
    font-weight: 600;
    color: #2c3e50;
    margin-bottom: 0.25rem;
}

.timeline-location {
    color: #6c757d;
    margin-bottom: 0.25rem;
}

.timeline-time {
    font-size: 0.8rem;
    color: #6c757d;
}

.timeline-status {
    display: flex;
    align-items: center;
}

.timeline-status i.completed {
    color: #28a745;
    font-size: 1.2rem;
}

.timeline-status i.pending {
    color: #ffc107;
    font-size: 1.2rem;
}

.progress-indicator {
    background: #720707;
    color: white;
    padding: 0.25rem 0.5rem;
    border-radius: 12px;
    font-size: 0.8rem;
    font-weight: 600;
}

.timeline-connector {
    width: 2px;
    height: 20px;
    background: #e9ecef;
    margin-left: 20px;
    margin-top: -0.5rem;
    margin-bottom: -0.5rem;
}

.timeline-connector.active {
    background: #720707;
}

.timeline-connector.completed {
    background: #28a745;
}

/* Driver Card */
.driver-card {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.driver-avatar {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    overflow: hidden;
}

.driver-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.driver-details {
    flex: 1;
}

.driver-name {
    font-weight: 600;
    color: #2c3e50;
    margin-bottom: 0.25rem;
}

.driver-phone {
    color: #6c757d;
    margin-bottom: 0.5rem;
}

.driver-rating {
    display: flex;
    align-items: center;
    gap: 0.25rem;
}

.driver-rating i {
    color: #e9ecef;
    font-size: 0.8rem;
}

.driver-rating i.active {
    color: #ffc107;
}

.driver-rating span {
    font-size: 0.8rem;
    color: #6c757d;
    margin-left: 0.25rem;
}

.driver-actions {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.action-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 6px;
    font-size: 0.8rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
}

.action-btn.call {
    background: #28a745;
    color: white;
}

.action-btn.call:hover {
    background: #218838;
}

.action-btn.message {
    background: #17a2b8;
    color: white;
}

.action-btn.message:hover {
    background: #138496;
}

/* Vehicle Info */
.vehicle-info {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.vehicle-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    color: #6c757d;
}

.vehicle-item i {
    width: 20px;
    color: #720707;
}

/* Customer Info */
.customer-info {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.info-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.info-item label {
    font-weight: 500;
    color: #6c757d;
}

.info-item span {
    color: #2c3e50;
}

/* Last Update */
.last-update {
    background: #f8f9fa;
    padding: 1rem;
    border-radius: 8px;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #6c757d;
    font-size: 0.9rem;
}

.last-update i {
    color: #720707;
}

/* Loading and Error States */
.loading-state,
.error-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 400px;
    text-align: center;
    color: #6c757d;
}

.loading-state i,
.error-state i {
    font-size: 3rem;
    margin-bottom: 1rem;
}

.error-state {
    color: #dc3545;
}

.retry-btn {
    margin-top: 1rem;
    padding: 0.75rem 1.5rem;
    background: #720707;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: background-color 0.3s ease;
}

.retry-btn:hover {
    background: #8b0000;
}

/* Map Popup */
.map-popup {
    font-size: 0.9rem;
    line-height: 1.4;
}

.map-popup strong {
    color: #2c3e50;
}

/* Responsive Design */
@media (max-width: 1200px) {
    .tracking-main {
        flex-direction: column;
    }

    .map-section {
        height: 400px;
    }

    .live-stats {
        flex-direction: column;
        gap: 0.5rem;
    }

    .stat-item {
        min-width: auto;
    }
}

@media (max-width: 768px) {
    .header-content {
        flex-direction: column;
        gap: 1rem;
        text-align: center;
    }

    .header-left {
        flex-direction: column;
        gap: 0.5rem;
    }

    .tracking-main {
        padding: 1rem;
        gap: 1rem;
    }

    .driver-card {
        flex-direction: column;
        text-align: center;
    }

    .driver-actions {
        flex-direction: row;
        justify-content: center;
    }

    .live-stats {
        position: relative;
        bottom: auto;
        left: auto;
        margin-top: 1rem;
    }
}
</style>
