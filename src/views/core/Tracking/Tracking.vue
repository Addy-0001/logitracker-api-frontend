<template>
    <div class="route-visualization" style="padding-bottom: 100px; margin-bottom: 100px;">
        <!-- Header Section -->
        <div class="route-header">
            <div class="header-content">
                <div class="header-title">
                    <h1>Route Visualization</h1>
                    <p>Plan and visualize optimal delivery routes</p>
                </div>
                <div class="header-actions">
                    <button @click="clearRoute" class="action-btn clear" :disabled="!currentRoute">
                        <i class="fas fa-trash"></i>
                        Clear Route
                    </button>
                    <button @click="exportRoute" class="action-btn export" :disabled="!currentRoute">
                        <i class="fas fa-download"></i>
                        Export
                    </button>
                </div>
            </div>
        </div>

        <!-- Main Content -->
        <div class="route-content" style="padding-bottom: 100px; margin-bottom: 100px;">
            <!-- Control Panel -->
            <div class="control-panel">
                <div class="panel-section">
                    <h3>
                        <i class="fas fa-route"></i>
                        Route Planning
                    </h3>

                    <!-- Route Input Form -->
                    <div class="route-form">
                        <div class="input-group">
                            <label for="start-location">
                                <i class="fas fa-circle start-icon"></i>
                                Start Location
                            </label>
                            <div class="location-input">
                                <input id="start-location" type="text" v-model="startLocation"
                                    @keyup.enter="searchLocation('start')" placeholder="Enter start address..."
                                    class="location-field" />
                                <button @click="searchLocation('start')" class="search-btn"
                                    :disabled="!startLocation.trim()">
                                    <i class="fas fa-search"></i>
                                </button>
                                <button @click="useCurrentLocation('start')" class="location-btn"
                                    title="Use current location">
                                    <i class="fas fa-crosshairs"></i>
                                </button>
                            </div>
                            <div v-if="startSuggestions.length > 0" class="suggestions">
                                <div v-for="suggestion in startSuggestions" :key="suggestion.id"
                                    @click="selectSuggestion('start', suggestion)" class="suggestion-item">
                                    <i class="fas fa-map-marker-alt"></i>
                                    <div class="suggestion-text">
                                        <div class="suggestion-name">{{ suggestion.name }}</div>
                                        <div class="suggestion-address">{{ suggestion.address }}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="input-group">
                            <label for="end-location">
                                <i class="fas fa-map-marker-alt end-icon"></i>
                                End Location
                            </label>
                            <div class="location-input">
                                <input id="end-location" type="text" v-model="endLocation"
                                    @keyup.enter="searchLocation('end')" placeholder="Enter destination address..."
                                    class="location-field" />
                                <button @click="searchLocation('end')" class="search-btn"
                                    :disabled="!endLocation.trim()">
                                    <i class="fas fa-search"></i>
                                </button>
                                <button @click="useCurrentLocation('end')" class="location-btn"
                                    title="Use current location">
                                    <i class="fas fa-crosshairs"></i>
                                </button>
                            </div>
                            <div v-if="endSuggestions.length > 0" class="suggestions">
                                <div v-for="suggestion in endSuggestions" :key="suggestion.id"
                                    @click="selectSuggestion('end', suggestion)" class="suggestion-item">
                                    <i class="fas fa-map-marker-alt"></i>
                                    <div class="suggestion-text">
                                        <div class="suggestion-name">{{ suggestion.name }}</div>
                                        <div class="suggestion-address">{{ suggestion.address }}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Route Options -->
                        <div class="route-options">
                            <h4>Route Preferences</h4>
                            <div class="options-grid">
                                <div class="option-item">
                                    <label for="route-preference">Optimize For</label>
                                    <select id="route-preference" v-model="routePreference" class="option-select">
                                        <option value="fastest">Fastest Route</option>
                                        <option value="shortest">Shortest Distance</option>
                                        <option value="recommended">Recommended</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <!-- Calculate Route Button -->
                        <button @click="calculateRoute" :disabled="!canCalculateRoute || isCalculating"
                            class="calculate-btn">
                            <i :class="['fas', isCalculating ? 'fa-spinner fa-spin' : 'fa-route']"></i>
                            {{ isCalculating ? 'Calculating...' : 'Calculate Route' }}
                        </button>
                    </div>
                </div>

                <!-- Route Information -->
                <div v-if="currentRoute" class="panel-section route-info">
                    <h3>
                        <i class="fas fa-info-circle"></i>
                        Route Information
                    </h3>

                    <div class="route-stats">
                        <div class="stat-item">
                            <div class="stat-icon">
                                <i class="fas fa-road"></i>
                            </div>
                            <div class="stat-content">
                                <div class="stat-value">{{ formatDistance(currentRoute.distance) }}</div>
                                <div class="stat-label">Total Distance</div>
                            </div>
                        </div>

                        <div class="stat-item">
                            <div class="stat-icon">
                                <i class="fas fa-clock"></i>
                            </div>
                            <div class="stat-content">
                                <div class="stat-value">{{ formatDuration(currentRoute.duration) }}</div>
                                <div class="stat-label">Estimated Time</div>
                            </div>
                        </div>

                        <div class="stat-item">
                            <div class="stat-icon">
                                <i class="fas fa-gas-pump"></i>
                            </div>
                            <div class="stat-content">
                                <div class="stat-value">{{ calculateFuelCost(currentRoute.distance) }}</div>
                                <div class="stat-label">Fuel Cost</div>
                            </div>
                        </div>
                    </div>

                </div>

                <!-- Alternative Routes -->
                <div v-if="alternativeRoutes.length > 0" class="panel-section alternatives">
                    <h3>
                        <i class="fas fa-random"></i>
                        Alternative Routes
                    </h3>

                    <div class="alternatives-list">
                        <div v-for="(route, index) in alternativeRoutes" :key="index"
                            @click="selectAlternativeRoute(index)" class="alternative-item"
                            :class="{ selected: selectedAlternative === index }">
                            <div class="alternative-header">
                                <span class="route-name">Route {{ index + 2 }}</span>
                                <span class="route-badge" :class="route.type">{{ route.type }}</span>
                            </div>
                            <div class="alternative-stats">
                                <span class="alt-distance">{{ formatDistance(route.distance) }}</span>
                                <span class="alt-duration">{{ formatDuration(route.duration) }}</span>
                                <span class="alt-difference" :class="route.difference > 0 ? 'slower' : 'faster'">
                                    {{ route.difference > 0 ? '+' : '' }}{{ Math.round(route.difference) }} min
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Map Container -->
            <div class="map-container">
                <div id="route-map" class="map"></div>

                <!-- Map Controls -->
                <div class="map-controls">
                    <button @click="fitRoute" class="map-control" title="Fit Route" :disabled="!currentRoute">
                        <i class="fas fa-expand-arrows-alt"></i>
                    </button>
                    <button @click="centerMap" class="map-control" title="Center Map">
                        <i class="fas fa-crosshairs"></i>
                    </button>
                    <button @click="toggleMapStyle" class="map-control" title="Toggle Map Style">
                        <i class="fas fa-layer-group"></i>
                    </button>
                    <button @click="toggleTraffic" class="map-control" title="Toggle Traffic"
                        :class="{ active: showTraffic }">
                        <i class="fas fa-traffic-light"></i>
                    </button>
                </div>

                <!-- Map Legend -->
                <div class="map-legend">
                    <div class="legend-title">Legend</div>
                    <div class="legend-items">
                        <div class="legend-item">
                            <div class="legend-marker start"></div>
                            <span>Start Point</span>
                        </div>
                        <div class="legend-item">
                            <div class="legend-marker end"></div>
                            <span>End Point</span>
                        </div>
                        <div class="legend-item">
                            <div class="legend-line main"></div>
                            <span>Main Route</span>
                        </div>
                        <div v-if="alternativeRoutes.length > 0" class="legend-item">
                            <div class="legend-line alternative"></div>
                            <span>Alternative</span>
                        </div>
                    </div>
                </div>

                <!-- Loading Overlay -->
                <div v-if="isCalculating" class="map-loading">
                    <div class="loading-content">
                        <i class="fas fa-spinner fa-spin"></i>
                        <p>Calculating optimal route...</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Error Modal -->
        <div v-if="showError" class="error-modal" @click="closeError">
            <div class="error-content" @click.stop>
                <div class="error-icon">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <h3>{{ errorTitle }}</h3>
                <p>{{ errorMessage }}</p>
                <button @click="closeError" class="error-close">Close</button>
            </div>
        </div>
    </div>
</template>

<script>
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

export default {
    name: 'RouteVisualization',
    data() {
        return {
            // Map instance
            map: null,
            mapStyle: 'streets-v2',
            showTraffic: false,

            // Location inputs
            startLocation: '',
            endLocation: '',
            startCoords: null,
            endCoords: null,

            // Suggestions
            startSuggestions: [],
            endSuggestions: [],

            // Route options
            routeProfile: 'driving-car',
            routePreference: 'fastest',


            // Route data
            currentRoute: null,
            alternativeRoutes: [],
            selectedAlternative: -1,
            highlightedInstruction: -1,

            // UI state
            isCalculating: false,
            showError: false,
            errorTitle: '',
            errorMessage: '',

            // Map markers and layers
            startMarker: null,
            endMarker: null,
            routeLayer: null,
            alternativeRouteLayers: [],

            // Replace the API configuration section:
            // API configuration
            mapTilerKey: import.meta.env.VITE_MAPTILER_API_KEY,
            orsKey: import.meta.env.VITE_ORS_API_KEY
        }
    },

    computed: {
        canCalculateRoute() {
            return this.startCoords && this.endCoords && !this.isCalculating
        }
    },

    mounted() {
        this.initializeMap()
    },

    beforeUnmount() {
        if (this.map) {
            this.map.remove()
        }
    },

    methods: {
        async initializeMap() {
            try {
                this.map = new maplibregl.Map({
                    container: 'route-map',
                    style: `https://api.maptiler.com/maps/${this.mapStyle}/style.json?key=${this.mapTilerKey}`,
                    center: [84.1240, 28.3949], // Center Nepal, reordered [lng, lat]
                    zoom: 7,
                    attributionControl: true,
                    maxBounds: [
                        [80.058, 26.347],
                        [88.2015, 30.447]
                    ]
                })

                this.map.on('click', this.onMapClick)

                this.map.on('load', () => {
                    console.log('Map loaded successfully')
                    this.map.addControl(new maplibregl.NavigationControl(), 'top-right')
                })

                this.map.on('error', (e) => {
                    console.error('Maplibre error:', e.error)
                })

            } catch (error) {
                console.error('Error initializing map:', error)
                this.showErrorModal('Map Error', 'Failed to initialize the map. Please check your MapTiler API key.')
            }
        },

        async searchLocation(type) {
            const query = type === 'start' ? this.startLocation : this.endLocation
            if (!query.trim()) return

            try {
                // Use MapTiler Geocoding API
                const response = await fetch(
                    `https://api.maptiler.com/geocoding/${encodeURIComponent(query)}.json?key=${this.mapTilerKey}&limit=5`
                )

                if (!response.ok) {
                    throw new Error('Geocoding request failed')
                }

                const data = await response.json()
                const suggestions = data.features.map((feature, index) => ({
                    id: index,
                    name: feature.text || feature.place_name,
                    address: feature.place_name,
                    coordinates: feature.center
                }))

                if (type === 'start') {
                    this.startSuggestions = suggestions
                } else {
                    this.endSuggestions = suggestions
                }

            } catch (error) {
                console.error('Geocoding error:', error)
                this.showErrorModal('Search Error', 'Failed to search for locations. Please try again.')
            }
        },

        selectSuggestion(type, suggestion) {
            if (type === 'start') {
                this.startLocation = suggestion.name
                this.startCoords = suggestion.coordinates
                this.startSuggestions = []
                this.addMarker('start', suggestion.coordinates, suggestion.name)
            } else {
                this.endLocation = suggestion.name
                this.endCoords = suggestion.coordinates
                this.endSuggestions = []
                this.addMarker('end', suggestion.coordinates, suggestion.name)
            }
        },

        async useCurrentLocation(type) {
            if (!navigator.geolocation) {
                this.showErrorModal('Location Error', 'Geolocation is not supported by this browser.')
                return
            }

            try {
                const position = await new Promise((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject, {
                        enableHighAccuracy: true,
                        timeout: 10000,
                        maximumAge: 60000
                    })
                })

                const coords = [position.coords.longitude, position.coords.latitude]

                // Reverse geocode to get address
                const response = await fetch(
                    `https://api.maptiler.com/geocoding/${coords[1]},${coords[0]}.json?key=${this.mapTilerKey}`
                )

                const data = await response.json()
                const address = data.features[0]?.place_name || 'Current Location'

                if (type === 'start') {
                    this.startLocation = address
                    this.startCoords = coords
                    this.addMarker('start', coords, address)
                } else {
                    this.endLocation = address
                    this.endCoords = coords
                    this.addMarker('end', coords, address)
                }

            } catch (error) {
                console.error('Geolocation error:', error)
                this.showErrorModal('Location Error', 'Failed to get your current location.')
            }
        },

        addMarker(type, coordinates, title) {
            const markerElement = document.createElement('div')
            markerElement.className = `custom-marker ${type}`
            markerElement.innerHTML = type === 'start' ? '🟢' : '🔴'

            const marker = new maplibregl.Marker(markerElement)
                .setLngLat(coordinates)
                .setPopup(new maplibregl.Popup().setHTML(`<strong>${title}</strong>`))
                .addTo(this.map)

            if (type === 'start') {
                if (this.startMarker) this.startMarker.remove()
                this.startMarker = marker
            } else {
                if (this.endMarker) this.endMarker.remove()
                this.endMarker = marker
            }
        },

        async calculateRoute() {
            if (!this.canCalculateRoute) return

            this.isCalculating = true
            this.currentRoute = null
            this.alternativeRoutes = []

            try {
                // Build ORS API request
                const coordinates = [this.startCoords, this.endCoords]
                const requestBody = {
                    coordinates,
                    profile: this.routeProfile,
                    preference: this.routePreference,
                    format: 'geojson',
                    options: {
                        avoid_features: []
                    },
                    instructions: true,
                    alternative_routes: {
                        target_count: 2,
                        weight_factor: 1.4
                    }
                }

                const response = await fetch(
                    `https://api.openrouteservice.org/v2/directions/${this.routeProfile}/geojson`,
                    {
                        method: 'POST',
                        headers: {
                            'Authorization': this.orsKey,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(requestBody)
                    }
                )

                if (!response.ok) {
                    throw new Error(`ORS API error: ${response.statusText}`)
                }

                const data = await response.json()

                if (data.features && data.features.length > 0) {
                    // Process main route
                    const mainRoute = data.features[0]
                    this.currentRoute = {
                        geometry: mainRoute.geometry,
                        distance: mainRoute.properties.segments[0].distance,
                        duration: mainRoute.properties.segments[0].duration,
                        instructions: this.processInstructions(mainRoute.properties.segments[0].steps)
                    }

                    // Process alternative routes
                    if (data.features.length > 1) {
                        this.alternativeRoutes = data.features.slice(1).map((route, index) => ({
                            geometry: route.geometry,
                            distance: route.properties.segments[0].distance,
                            duration: route.properties.segments[0].duration,
                            type: index === 0 ? 'scenic' : 'alternative',
                            difference: (route.properties.segments[0].duration - this.currentRoute.duration) / 60
                        }))
                    }

                    // Display routes on map
                    this.displayRouteOnMap()
                    this.fitRoute()

                } else {
                    throw new Error('No route found')
                }

            } catch (error) {
                console.error('Route calculation error:', error)
                this.showErrorModal('Route Error', 'Failed to calculate route. Please check your locations and try again.')
            } finally {
                this.isCalculating = false
            }
        },

        processInstructions(steps) {
            return steps.map(step => ({
                text: step.instruction,
                distance: step.distance,
                duration: step.duration,
                type: step.type
            }))
        },

        displayRouteOnMap() {
            // Remove existing route layers
            this.clearRouteFromMap()

            if (!this.currentRoute) return

            // Add main route
            this.map.addSource('main-route', {
                type: 'geojson',
                data: {
                    type: 'Feature',
                    geometry: this.currentRoute.geometry
                }
            })

            this.map.addLayer({
                id: 'main-route',
                type: 'line',
                source: 'main-route',
                layout: {
                    'line-join': 'round',
                    'line-cap': 'round'
                },
                paint: {
                    'line-color': '#720707',
                    'line-width': 6,
                    'line-opacity': 0.8
                }
            })

            // Add alternative routes
            this.alternativeRoutes.forEach((route, index) => {
                const sourceId = `alt-route-${index}`
                const layerId = `alt-route-${index}`

                this.map.addSource(sourceId, {
                    type: 'geojson',
                    data: {
                        type: 'Feature',
                        geometry: route.geometry
                    }
                })

                this.map.addLayer({
                    id: layerId,
                    type: 'line',
                    source: sourceId,
                    layout: {
                        'line-join': 'round',
                        'line-cap': 'round'
                    },
                    paint: {
                        'line-color': '#6c757d',
                        'line-width': 4,
                        'line-opacity': 0.6,
                        'line-dasharray': [2, 2]
                    }
                })
            })
        },

        clearRouteFromMap() {
            // Remove main route
            if (this.map.getLayer('main-route')) {
                this.map.removeLayer('main-route')
                this.map.removeSource('main-route')
            }

            // Remove alternative routes
            this.alternativeRoutes.forEach((_, index) => {
                const layerId = `alt-route-${index}`
                const sourceId = `alt-route-${index}`

                if (this.map.getLayer(layerId)) {
                    this.map.removeLayer(layerId)
                    this.map.removeSource(sourceId)
                }
            })
        },

        selectAlternativeRoute(index) {
            this.selectedAlternative = index
            const selectedRoute = this.alternativeRoutes[index]

            // Swap main route with selected alternative
            const tempRoute = { ...this.currentRoute }
            this.currentRoute = {
                geometry: selectedRoute.geometry,
                distance: selectedRoute.distance,
                duration: selectedRoute.duration,
                instructions: [] // Alternative routes don't have detailed instructions
            }

            // Update alternative routes array
            this.alternativeRoutes[index] = {
                geometry: tempRoute.geometry,
                distance: tempRoute.distance,
                duration: tempRoute.duration,
                type: 'alternative',
                difference: (tempRoute.duration - this.currentRoute.duration) / 60
            }

            // Redraw routes
            this.displayRouteOnMap()
        },

        highlightInstruction(index) {
            this.highlightedInstruction = index
            // Here you could add map highlighting for the specific instruction
        },

        fitRoute() {
            if (!this.currentRoute || !this.map) return

            const coordinates = this.currentRoute.geometry.coordinates
            const bounds = coordinates.reduce((bounds, coord) => {
                return bounds.extend(coord)
            }, new maplibregl.LngLatBounds(coordinates[0], coordinates[0]))

            this.map.fitBounds(bounds, { padding: 50 })
        },

        centerMap() {
            if (this.startCoords && this.endCoords) {
                const centerLng = (this.startCoords[0] + this.endCoords[0]) / 2
                const centerLat = (this.startCoords[1] + this.endCoords[1]) / 2
                this.map.setCenter([centerLng, centerLat])
            }
        },

        toggleMapStyle() {
            this.mapStyle = this.mapStyle === 'streets-v2' ? 'satellite' : 'streets-v2'
            this.map.setStyle(`https://api.maptiler.com/maps/${this.mapStyle}/style.json?key=${this.mapTilerKey}`)

            // Re-add route layers after style change
            this.map.once('styledata', () => {
                if (this.currentRoute) {
                    this.displayRouteOnMap()
                }
            })
        },

        toggleTraffic() {
            this.showTraffic = !this.showTraffic
            // Implementation would depend on traffic data source
            console.log('Traffic toggled:', this.showTraffic)
        },

        clearRoute() {
            this.currentRoute = null
            this.alternativeRoutes = []
            this.selectedAlternative = -1
            this.highlightedInstruction = -1
            this.clearRouteFromMap()

            if (this.startMarker) {
                this.startMarker.remove()
                this.startMarker = null
            }
            if (this.endMarker) {
                this.endMarker.remove()
                this.endMarker = null
            }

            this.startLocation = ''
            this.endLocation = ''
            this.startCoords = null
            this.endCoords = null
            this.startSuggestions = []
            this.endSuggestions = []
        },

        exportRoute() {
            if (!this.currentRoute) return

            const routeData = {
                start: {
                    location: this.startLocation,
                    coordinates: this.startCoords
                },
                end: {
                    location: this.endLocation,
                    coordinates: this.endCoords
                },
                route: this.currentRoute,
                alternatives: this.alternativeRoutes,
                options: {
                    profile: this.routeProfile,
                    preference: this.routePreference,
                },
                exportedAt: new Date().toISOString()
            }

            const blob = new Blob([JSON.stringify(routeData, null, 2)], { type: 'application/json' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `route-${Date.now()}.json`
            a.click()
            URL.revokeObjectURL(url)
        },

        onMapClick(e) {
            const coordinates = [e.lngLat.lng, e.lngLat.lat]

            if (!this.startCoords) {
                this.startCoords = coordinates
                this.startLocation = `${coordinates[1].toFixed(4)}, ${coordinates[0].toFixed(4)}`
                this.addMarker('start', coordinates, 'Start Point')
            } else if (!this.endCoords) {
                this.endCoords = coordinates
                this.endLocation = `${coordinates[1].toFixed(4)}, ${coordinates[0].toFixed(4)}`
                this.addMarker('end', coordinates, 'End Point')
            }
        },

        formatDistance(meters) {
            if (meters < 1000) {
                return `${Math.round(meters)} m`
            } else {
                return `${(meters / 1000).toFixed(1)} km`
            }
        },

        formatDuration(seconds) {
            const hours = Math.floor(seconds / 3600)
            const minutes = Math.floor((seconds % 3600) / 60)

            if (hours > 0) {
                return `${hours}h ${minutes}m`
            } else {
                return `${minutes}m`
            }
        },

        calculateFuelCost(distance) {
            const fuelEfficiency = 8 // L/100km
            const fuelPrice = 1.5 // per liter
            const cost = (distance / 1000) * (fuelEfficiency / 100) * fuelPrice
            return `$${cost.toFixed(2)}`
        },

        getInstructionIcon(type) {
            const iconMap = {
                'turn-left': 'fas fa-arrow-left',
                'turn-right': 'fas fa-arrow-right',
                'turn-straight': 'fas fa-arrow-up',
                'turn-slight-left': 'fas fa-arrow-left',
                'turn-slight-right': 'fas fa-arrow-right',
                'turn-sharp-left': 'fas fa-arrow-left',
                'turn-sharp-right': 'fas fa-arrow-right',
                'uturn': 'fas fa-undo',
                'arrive': 'fas fa-flag-checkered',
                'depart': 'fas fa-play'
            }
            return iconMap[type] || 'fas fa-arrow-up'
        },

        showErrorModal(title, message) {
            this.errorTitle = title
            this.errorMessage = message
            this.showError = true
        },

        closeError() {
            this.showError = false
        }
    }
}
</script>


<style scoped>
@import './tracking.css';
</style>