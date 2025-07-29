<template>
    <div class="dashboard-container" style="padding-bottom: 100px;">
        <!-- Error and Loading States -->
        <div v-if="isLoading" class="loading-state">
            <div class="loading-spinner">
                <div class="spinner-ring"></div>
                <div class="spinner-ring"></div>
                <div class="spinner-ring"></div>
            </div>
            <p>Loading jobs...</p>
        </div>

        <div v-if="errorMessage" class="error-state">
            <div class="error-icon">
                <i class="fas fa-exclamation-circle"></i>
            </div>
            <h3>Something went wrong</h3>
            <p>{{ errorMessage }}</p>
            <button @click="refreshData" class="retry-btn">
                <i class="fas fa-redo"></i>
                Try Again
            </button>
        </div>

        <!-- Dashboard Header -->
        <div class="dashboard-header">
            <div class="header-content">
                <div class="header-title">
                    <h1>Dashboard</h1>
                    <p class="header-subtitle">{{ currentDate }} • {{ ongoingJobs.length }} active jobs</p>
                </div>
                <div class="header-actions">
                    <button class="refresh-btn" @click="refreshData" :disabled="isRefreshing">
                        <i :class="['fas fa-sync-alt', { 'fa-spin': isRefreshing }]"></i>
                        {{ isRefreshing ? 'Refreshing...' : 'Refresh' }}
                    </button>
                    <button v-if="authStore.user?.role === 'admin'" class="new-job-btn" @click="navigateToCreateJob">
                        <i class="fas fa-plus"></i>
                        New Job
                    </button>
                </div>
            </div>
        </div>

        <!-- Summary Cards -->
        <div class="summary-section">
            <div class="summary-cards">
                <div class="summary-card in-transit">
                    <div class="card-background"></div>
                    <div class="card-icon">
                        <i class="fas fa-truck"></i>
                    </div>
                    <div class="card-content">
                        <h3>{{ summaryStats.inTransit }}</h3>
                        <p>In Transit</p>
                        <div class="trend-indicator up">
                            <i class="fas fa-arrow-up"></i>
                            <span>+12%</span>
                        </div>
                    </div>
                </div>

                <div class="summary-card pending">
                    <div class="card-background"></div>
                    <div class="card-icon">
                        <i class="fas fa-clock"></i>
                    </div>
                    <div class="card-content">
                        <h3>{{ summaryStats.pending }}</h3>
                        <p>Pending</p>
                        <div class="trend-indicator down">
                            <i class="fas fa-arrow-down"></i>
                            <span>-5%</span>
                        </div>
                    </div>
                </div>

                <div class="summary-card urgent">
                    <div class="card-background"></div>
                    <div class="card-icon">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <div class="card-content">
                        <h3>{{ summaryStats.urgent }}</h3>
                        <p>Urgent</p>
                        <div class="trend-indicator neutral">
                            <i class="fas fa-minus"></i>
                            <span>0%</span>
                        </div>
                    </div>
                </div>

                <div class="summary-card delivered">
                    <div class="card-background"></div>
                    <div class="card-icon">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <div class="card-content">
                        <h3>{{ summaryStats.deliveredToday }}</h3>
                        <p>Delivered Today</p>
                        <div class="trend-indicator up">
                            <i class="fas fa-arrow-up"></i>
                            <span>+8%</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Filters and Search -->
        <div class="controls-section">
            <div class="search-container">
                <div class="search-input-wrapper">
                    <i class="fas fa-search search-icon"></i>
                    <input type="text" v-model="searchQuery" placeholder="Search by job ID, customer, or destination..."
                        class="search-input" />
                    <button v-if="searchQuery" @click="clearSearch" class="clear-search">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>

            <div class="filters-container">
                <div class="filter-group">
                    <label>Status:</label>
                    <select v-model="selectedStatus" class="filter-select">
                        <option value="">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="in-transit">In Transit</option>
                        <option value="delayed">Delayed</option>
                        <option value="delivered">Delivered</option>
                    </select>
                </div>

                <div class="filter-group">
                    <label>Priority:</label>
                    <select v-model="selectedPriority" class="filter-select">
                        <option value="">All Priorities</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                    </select>
                </div>

                <div class="filter-group">
                    <label>Date Range:</label>
                    <select v-model="selectedDateRange" class="filter-select">
                        <option value="today">Today</option>
                        <option value="week">This Week</option>
                        <option value="month">This Month</option>
                        <option value="custom">Custom Range</option>
                    </select>
                </div>

                <button @click="clearFilters" class="clear-filters-btn">
                    <i class="fas fa-filter"></i>
                    Clear Filters
                </button>
            </div>

            <div class="view-toggle">
                <button @click="viewMode = 'list'" :class="['view-btn', { active: viewMode === 'list' }]">
                    <i class="fas fa-list"></i>
                    List
                </button>
                <button @click="viewMode = 'grid'" :class="['view-btn', { active: viewMode === 'grid' }]">
                    <i class="fas fa-th-large"></i>
                    Grid
                </button>
            </div>
        </div>

        <!-- Jobs List/Grid -->
        <div class="jobs-section">
            <div v-if="!isLoading && filteredJobs.length === 0" class="empty-state">
                <div class="empty-icon">
                    <i class="fas fa-search"></i>
                </div>
                <h3>No jobs found</h3>
                <p>Try adjusting your search criteria or filters</p>
                <button @click="clearFilters" class="clear-filters-btn">Clear All Filters</button>
            </div>

            <!-- Grid View -->
            <div v-else-if="viewMode === 'grid'" class="jobs-grid">
                <div v-for="job in filteredJobs" :key="job._id" class="job-card"
                    :class="{ 'urgent': job.priority === 'high', 'delayed': job.status === 'delayed' }">

                    <div class="job-card-header">
                        <div class="job-id-section">
                            <span class="job-id">{{ job._id.slice(-8) }}</span>
                            <span v-if="job.isUrgent" class="urgent-indicator">
                                <i class="fas fa-exclamation-circle"></i>
                            </span>
                        </div>
                        <div class="job-status">
                            <span :class="['status-badge', job.status]">
                                <i :class="getStatusIcon(job.status)"></i>
                                {{ formatStatus(job.status) }}
                            </span>
                        </div>
                    </div>

                    <div class="job-card-content">
                        <div class="customer-section">
                            <div class="customer-avatar">
                                <span>{{ getCustomerInitials(job.customerInfo.name) }}</span>
                            </div>
                            <div class="customer-info">
                                <h4>{{ job.customerInfo.name }}</h4>
                                <p>{{ job.customerInfo.email }}</p>
                            </div>
                        </div>

                        <div class="route-section">
                            <div class="route-item pickup">
                                <div class="route-marker">
                                    <i class="fas fa-circle"></i>
                                </div>
                                <div class="route-details">
                                    <span class="route-label">Pickup</span>
                                    <span class="route-location">{{ job.pickupInfo.city || 'Unknown' }}, {{
                                        job.pickupInfo.state || 'N/A' }}</span>
                                </div>
                            </div>

                            <div class="route-connector">
                                <div class="route-line"></div>
                                <div class="route-truck">
                                    <i class="fas fa-truck"></i>
                                </div>
                            </div>

                            <div class="route-item delivery">
                                <div class="route-marker">
                                    <i class="fas fa-map-marker-alt"></i>
                                </div>
                                <div class="route-details">
                                    <span class="route-label">Delivery</span>
                                    <span class="route-location">{{ job.dropoffInfo.city || 'Unknown' }}, {{
                                        job.dropoffInfo.state || 'N/A' }}</span>
                                </div>
                            </div>
                        </div>

                        <div class="progress-section">
                            <div class="progress-header">
                                <span>Progress</span>
                                <span class="progress-percentage">{{ job.progress }}%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" :style="{ width: job.progress + '%' }" :class="job.status">
                                </div>
                            </div>
                        </div>

                        <div class="job-meta">
                            <div class="meta-item">
                                <i class="fas fa-clock"></i>
                                <span>ETA: {{ job.eta }}</span>
                            </div>
                            <div class="meta-item">
                                <i class="fas fa-calendar"></i>
                                <span>{{ formatDate(job.createdAt) }}</span>
                            </div>
                        </div>
                    </div>

                    <div class="job-card-actions">
                        <button @click="viewJobDetails(job)" class="card-action-btn primary">
                            <i class="fas fa-eye"></i>
                            View Details
                        </button>
                    </div>
                </div>
            </div>

            <!-- List View -->
            <div v-else-if="viewMode === 'list'" class="jobs-list">
                <div class="list-header">
                    <div class="header-cell job-id">Job ID</div>
                    <div class="header-cell customer">Customer</div>
                    <div class="header-cell route">Route</div>
                    <div class="header-cell status">Status</div>
                    <div class="header-cell priority">Priority</div>
                    <div class="header-cell progress">Progress</div>
                    <div class="header-cell eta">ETA</div>
                    <div class="header-cell actions">Actions</div>
                </div>

                <div v-for="job in filteredJobs" :key="job._id" class="job-row"
                    :class="{ 'urgent': job.priority === 'high', 'delayed': job.status === 'delayed' }">

                    <div class="job-cell job-id">
                        <span class="job-id-text">{{ job._id.slice(-8) }}</span>
                        <span v-if="job.isUrgent" class="urgent-indicator">
                            <i class="fas fa-exclamation-circle"></i>
                        </span>
                    </div>

                    <div class="job-cell customer">
                        <div class="customer-info">
                            <div class="customer-avatar small">
                                <span>{{ getCustomerInitials(job.customerInfo.name) }}</span>
                            </div>
                            <div>
                                <span class="customer-name">{{ job.customerInfo.name }}</span>
                                <span class="customer-contact">{{ job.customerInfo.email }}</span>
                            </div>
                        </div>
                    </div>

                    <div class="job-cell route">
                        <div class="route-info">
                            <div class="route-from">
                                <i class="fas fa-circle origin"></i>
                                {{ job.pickupInfo.city || 'Unknown' }}, {{ job.pickupInfo.state || 'N/A' }}
                            </div>
                            <div class="route-to">
                                <i class="fas fa-map-marker-alt destination"></i>
                                {{ job.dropoffInfo.city || 'Unknown' }}, {{ job.dropoffInfo.state || 'N/A' }}
                            </div>
                        </div>
                    </div>

                    <div class="job-cell status">
                        <span :class="['status-badge', job.status]">
                            <i :class="getStatusIcon(job.status)"></i>
                            {{ formatStatus(job.status) }}
                        </span>
                    </div>

                    <div class="job-cell priority">
                        <span :class="['priority-badge', job.priority]">
                            {{ job.priority.toUpperCase() }}
                        </span>
                    </div>

                    <div class="job-cell progress">
                        <div class="progress-container">
                            <div class="progress-bar">
                                <div class="progress-fill" :style="{ width: job.progress + '%' }" :class="job.status">
                                </div>
                            </div>
                            <span class="progress-text">{{ job.progress }}%</span>
                        </div>
                    </div>

                    <div class="job-cell eta">
                        <div class="eta-info">
                            <span class="eta-time">{{ job.eta }}</span>
                            <span :class="['eta-status', getETAStatus(job.etaStatus)]">
                                {{ job.etaStatus }}
                            </span>
                        </div>
                    </div>

                    <div class="job-cell actions">
                        <div class="action-buttons">
                            <button @click="viewJobDetails(job)" class="action-btn view" title="View Details">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button @click="trackJob(job)" class="action-btn track" title="Track">
                                <i class="fas fa-map-marker-alt"></i>
                            </button>
                            <button @click="contactCustomer(job)" class="action-btn contact" title="Contact">
                                <i class="fas fa-phone"></i>
                            </button>
                            <button v-if="authStore.user?.role === 'admin'" @click="showJobMenu(job)"
                                class="action-btn menu" title="More Options">
                                <i class="fas fa-ellipsis-v"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import apiClient from '@/api/axios';
import { jwtDecode } from 'jwt-decode';
import { getRoute } from '@/api/orsService';

const router = useRouter();
const authStore = useAuthStore();

const currentDate = ref(new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
}));
const isRefreshing = ref(false);
const viewMode = ref('grid');
const searchQuery = ref('');
const selectedStatus = ref('');
const selectedPriority = ref('');
const selectedDateRange = ref('week');
const ongoingJobs = ref([]);
const isLoading = ref(false);
const errorMessage = ref('');
const availableDrivers = ref([]);

const summaryStats = computed(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return {
        inTransit: ongoingJobs.value.filter((job) => job.status === 'in-transit').length,
        pending: ongoingJobs.value.filter((job) => job.status === 'pending').length,
        urgent: ongoingJobs.value.filter((job) => job.isUrgent).length,
        deliveredToday: ongoingJobs.value.filter(
            (job) =>
                job.status === 'delivered' &&
                new Date(job.createdAt).setHours(0, 0, 0, 0) === today.getTime()
        ).length,
    };
});

const filteredJobs = computed(() => {
    let jobs = ongoingJobs.value;
    if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        jobs = jobs.filter(
            (job) =>
                job._id.toLowerCase().includes(query) ||
                job.customerInfo.name.toLowerCase().includes(query) ||
                (job.pickupInfo.city && job.pickupInfo.city.toLowerCase().includes(query)) ||
                (job.dropoffInfo.city && job.dropoffInfo.city.toLowerCase().includes(query))
        );
    }
    if (selectedStatus.value) {
        jobs = jobs.filter((job) => job.status === selectedStatus.value);
    }
    if (selectedPriority.value) {
        jobs = jobs.filter((job) => job.priority === selectedPriority.value);
    }
    if (selectedDateRange.value !== 'custom') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (selectedDateRange.value === 'today') {
            jobs = jobs.filter(
                (job) => new Date(job.createdAt).setHours(0, 0, 0, 0) === today.getTime()
            );
        } else if (selectedDateRange.value === 'week') {
            const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
            jobs = jobs.filter((job) => new Date(job.createdAt) >= weekAgo);
        } else if (selectedDateRange.value === 'month') {
            const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
            jobs = jobs.filter((job) => new Date(job.createdAt) >= monthAgo);
        }
    }
    return jobs;
});

const mapJob = (job) => ({
    _id: job._id,
    customerInfo: {
        name: job.pickupInfo?.name || job.dropoffInfo?.name || 'Unknown Customer',
        email: job.pickupInfo?.email || job.dropoffInfo?.email || 'N/A',
    },
    pickupInfo: {
        city: extractCityFromCoords(job.pickupInfo?.latitude, job.pickupInfo?.longitude) || 'Unknown',
        state: 'Nepal',
        latitude: job.pickupInfo?.latitude || null,
        longitude: job.pickupInfo?.longitude || null,
        name: job.pickupInfo?.name || 'Unknown',
        phone: job.pickupInfo?.phone || 'N/A',
        email: job.pickupInfo?.email || 'N/A'
    },
    dropoffInfo: {
        city: extractCityFromCoords(job.dropoffInfo?.latitude, job.dropoffInfo?.longitude) || 'Unknown',
        state: 'Nepal',
        latitude: job.dropoffInfo?.latitude || null,
        longitude: job.dropoffInfo?.longitude || null,
        name: job.dropoffInfo?.name || 'Unknown',
        phone: job.dropoffInfo?.phone || 'N/A',
        email: job.dropoffInfo?.email || 'N/A'
    },
    driverInfo: job.driverInfo || null,
    status: job.status || 'pending',
    priority: job.isUrgent ? 'high' : 'medium',
    progress: calculateProgress(job.status),
    eta: calculateETA(job),
    isUrgent: job.isUrgent || false,
    etaStatus: 'on-time',
    createdAt: job.createdAt || new Date().toISOString(),
    addOns: job.addOns || {},
    note: job.note || 'none',
    currentCoords: job.currentCoords || { latitude: null, longitude: null }
});

const extractCityFromCoords = (lat, lng) => {
    // Simple city mapping based on coordinates for Nepal
    if (!lat || !lng) return null;

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    // Kathmandu area
    if (latitude >= 27.6 && latitude <= 27.8 && longitude >= 85.2 && longitude <= 85.4) {
        return 'Kathmandu';
    }
    // Pokhara area
    if (latitude >= 28.1 && latitude <= 28.3 && longitude >= 83.8 && longitude <= 84.1) {
        return 'Pokhara';
    }
    // Chitwan area
    if (latitude >= 27.5 && latitude <= 27.7 && longitude >= 84.2 && longitude <= 84.6) {
        return 'Chitwan';
    }

    return 'Nepal';
};

const calculateProgress = (status) => {
    const progressMap = {
        'pending': 0,
        'assigned': 10,
        'in-transit': 50,
        'out-for-delivery': 80,
        'delivered': 100,
        'delayed': 30,
        'cancelled': 0
    };
    return progressMap[status] || 0;
};

const fetchJobs = async () => {
    isLoading.value = true;
    errorMessage.value = '';
    try {
        const token = authStore.token;
        if (!token) throw new Error('No authentication token');
        const decodedToken = jwtDecode(token);
        const userId = decodedToken.id;
        const role = decodedToken.role;

        let response;
        if (role === 'driver') {
            response = await apiClient.get(`/job/getJobForDriver/${userId}`, {
                params: {
                    search: searchQuery.value || undefined,
                    status: selectedStatus.value || undefined,
                },
            });
        } else {
            response = await apiClient.get('/job', {
                params: {
                    search: searchQuery.value || undefined,
                    status: selectedStatus.value || undefined,
                },
            });
        }
        ongoingJobs.value = Array.isArray(response.data) ? response.data.map(mapJob) : [];
    } catch (error) {
        console.error('Error fetching jobs:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
        });
        if (error.response?.status === 401 || error.response?.status === 403) {
            errorMessage.value = 'Session expired. Please log in again.';
            authStore.logout();
            router.push('/login');
        } else {
            errorMessage.value = error.response?.data?.message || 'Failed to load jobs. Please try again.';
        }
    } finally {
        isLoading.value = false;
    }
};

const fetchDrivers = async () => {
    if (authStore.user?.role !== 'admin') return;
    try {
        const response = await apiClient.get('/user/getUsers', {
            params: { role: 'driver' },
        });
        availableDrivers.value = Array.isArray(response.data) ? response.data : [];
    } catch (error) {
        console.error('Error fetching drivers:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
        });
        errorMessage.value = error.response?.data?.message || 'Failed to load drivers. Please try again.';
    }
};

const refreshData = async () => {
    isRefreshing.value = true;
    try {
        await Promise.all([fetchJobs(), fetchDrivers()]);
    } finally {
        isRefreshing.value = false;
    }
};

const clearSearch = () => {
    searchQuery.value = '';
    fetchJobs();
};

const clearFilters = () => {
    searchQuery.value = '';
    selectedStatus.value = '';
    selectedPriority.value = '';
    selectedDateRange.value = 'week';
    fetchJobs();
};

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

const getETAStatus = (status) => {
    return status ? status.toLowerCase() : '';
};

const getCustomerInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
    });
};

const viewJobDetails = (job) => {
    router.push(`/job/${job._id}`);
};

const trackJob = async (job) => {
    try {
        const response = await apiClient.get(`/coordinate/getAllCoord/${job._id}`);
        console.log('Tracking job:', job._id, 'Coordinates:', response.data);
        router.push({ name: 'Tracking', params: { jobId: job._id } });
    } catch (error) {
        console.error('Error tracking job:', error);
        errorMessage.value = error.response?.data?.message || 'Failed to track job.';
    }
};

const contactCustomer = (job) => {
    console.log('Contacting customer for job:', job._id);
    // Implement contact logic (e.g., open mailto or tel link)
};

const showJobMenu = (job) => {
    console.log('Showing menu for job:', job._id);
    // Implement job menu logic
};

const navigateToCreateJob = () => {
    router.push('/create-job');
};

const calculateETA = (job) => {
    // Simple ETA calculation based on status
    const now = new Date();
    let etaHours = 2; // Default 2 hours

    switch (job.status) {
        case 'pending':
            etaHours = 4;
            break;
        case 'in-transit':
            etaHours = 1;
            break;
        case 'delivered':
            return 'Delivered';
        case 'delayed':
            etaHours = 6;
            break;
        default:
            etaHours = 2;
    }

    const eta = new Date(now.getTime() + etaHours * 60 * 60 * 1000);
    return eta.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    });
};

onMounted(async () => {
    if (!authStore.isAuthenticated) {
        errorMessage.value = 'Please log in to view the dashboard.';
        router.push('/login');
        return;
    }
    await Promise.all([fetchJobs(), fetchDrivers()]);
});

watch([searchQuery, selectedStatus, selectedPriority, selectedDateRange], () => {
    fetchJobs();
});
</script>

<style scoped>
/* Modern Dashboard Styles */
.dashboard-container {
    min-height: 100vh;
    background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
    padding: 2rem;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

/* Loading States */
.loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem 2rem;
    background: white;
    border-radius: 16px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    margin: 2rem 0;
}

.loading-spinner {
    position: relative;
    width: 60px;
    height: 60px;
    margin-bottom: 1rem;
}

.spinner-ring {
    position: absolute;
    width: 100%;
    height: 100%;
    border: 3px solid transparent;
    border-top: 3px solid #720707;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

.spinner-ring:nth-child(2) {
    animation-delay: 0.1s;
    border-top-color: #dc2626;
}

.spinner-ring:nth-child(3) {
    animation-delay: 0.2s;
    border-top-color: #f87171;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

.error-state {
    text-align: center;
    padding: 3rem 2rem;
    background: white;
    border-radius: 16px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    margin: 2rem 0;
}

.error-icon {
    width: 80px;
    height: 80px;
    margin: 0 auto 1rem;
    background: linear-gradient(135deg, #fee2e2, #fecaca);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #dc2626;
    font-size: 2rem;
}

.error-state h3 {
    color: #1f2937;
    margin-bottom: 0.5rem;
    font-size: 1.5rem;
    font-weight: 600;
}

.error-state p {
    color: #6b7280;
    margin-bottom: 1.5rem;
}

.retry-btn {
    background: linear-gradient(135deg, #720707, #dc2626);
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
}

.retry-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(114, 7, 7, 0.3);
}

/* Dashboard Header */
.dashboard-header {
    background: white;
    border-radius: 16px;
    padding: 2rem;
    margin-bottom: 2rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
}

.header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 1rem;
}

.header-title h1 {
    font-size: 2.5rem;
    font-weight: 700;
    background: linear-gradient(135deg, #720707, #dc2626);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 0.5rem;
}

.header-subtitle {
    color: #6b7280;
    font-size: 1rem;
    font-weight: 500;
}

.header-actions {
    display: flex;
    gap: 1rem;
    align-items: center;
}

.refresh-btn,
.new-job-btn {
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    border: none;
}

.refresh-btn {
    background: #f3f4f6;
    color: #374151;
}

.refresh-btn:hover {
    background: #e5e7eb;
    transform: translateY(-1px);
}

.new-job-btn {
    background: linear-gradient(135deg, #720707, #dc2626);
    color: white;
}

.new-job-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(114, 7, 7, 0.3);
}

/* Summary Cards */
.summary-section {
    margin-bottom: 2rem;
}

.summary-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5rem;
}

.summary-card {
    position: relative;
    background: white;
    border-radius: 16px;
    padding: 2rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    overflow: hidden;
    transition: all 0.3s ease;
}

.summary-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.card-background {
    position: absolute;
    top: 0;
    right: 0;
    width: 100px;
    height: 100px;
    border-radius: 50%;
    opacity: 0.1;
    transform: translate(30px, -30px);
}

.summary-card.in-transit .card-background {
    background: linear-gradient(135deg, #720707, #dc2626);
}

.summary-card.pending .card-background {
    background: linear-gradient(135deg, #f59e0b, #fbbf24);
}

.summary-card.urgent .card-background {
    background: linear-gradient(135deg, #ef4444, #f87171);
}

.summary-card.delivered .card-background {
    background: linear-gradient(135deg, #10b981, #34d399);
}

.card-icon {
    width: 60px;
    height: 60px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    color: white;
    margin-bottom: 1rem;
}

.summary-card.in-transit .card-icon {
    background: linear-gradient(135deg, #720707, #dc2626);
}

.summary-card.pending .card-icon {
    background: linear-gradient(135deg, #f59e0b, #fbbf24);
}

.summary-card.urgent .card-icon {
    background: linear-gradient(135deg, #ef4444, #f87171);
}

.summary-card.delivered .card-icon {
    background: linear-gradient(135deg, #10b981, #34d399);
}

.card-content h3 {
    font-size: 2.5rem;
    font-weight: 700;
    color: #1f2937;
    margin-bottom: 0.5rem;
}

.card-content p {
    color: #6b7280;
    font-weight: 500;
    margin-bottom: 1rem;
}

.trend-indicator {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.25rem 0.5rem;
    border-radius: 6px;
    font-size: 0.875rem;
    font-weight: 500;
}

.trend-indicator.up {
    background: #dcfce7;
    color: #16a34a;
}

.trend-indicator.down {
    background: #fee2e2;
    color: #dc2626;
}

.trend-indicator.neutral {
    background: #f3f4f6;
    color: #6b7280;
}

/* Controls Section */
.controls-section {
    background: white;
    border-radius: 16px;
    padding: 2rem;
    margin-bottom: 2rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
}

.search-container {
    margin-bottom: 1.5rem;
}

.search-input-wrapper {
    position: relative;
    max-width: 500px;
}

.search-icon {
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: #9ca3af;
    font-size: 1rem;
}

.search-input {
    width: 100%;
    padding: 1rem 1rem 1rem 3rem;
    border: 2px solid #e5e7eb;
    border-radius: 12px;
    font-size: 1rem;
    transition: all 0.2s ease;
    background: #f9fafb;
}

.search-input:focus {
    outline: none;
    border-color: #720707;
    background: white;
    box-shadow: 0 0 0 3px rgba(114, 7, 7, 0.1);
}

.clear-search {
    position: absolute;
    right: 0.5rem;
    top: 50%;
    transform: translateY(-50%);
    background: #e5e7eb;
    border: none;
    border-radius: 6px;
    width: 2rem;
    height: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
}

.clear-search:hover {
    background: #d1d5db;
}

.filters-container {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    align-items: end;
    margin-bottom: 1.5rem;
}

.filter-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.filter-group label {
    font-weight: 500;
    color: #374151;
    font-size: 0.875rem;
}

.filter-select {
    padding: 0.75rem 1rem;
    border: 2px solid #e5e7eb;
    border-radius: 8px;
    background: #f9fafb;
    font-size: 0.875rem;
    min-width: 150px;
    transition: all 0.2s ease;
}

.filter-select:focus {
    outline: none;
    border-color: #720707;
    background: white;
    box-shadow: 0 0 0 3px rgba(114, 7, 7, 0.1);
}

.clear-filters-btn {
    background: #f3f4f6;
    color: #374151;
    border: none;
    padding: 0.75rem 1rem;
    border-radius: 8px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
}

.clear-filters-btn:hover {
    background: #e5e7eb;
    transform: translateY(-1px);
}

.view-toggle {
    display: flex;
    background: #f3f4f6;
    border-radius: 8px;
    padding: 0.25rem;
    margin-left: auto;
}

.view-btn {
    padding: 0.5rem 1rem;
    border: none;
    background: transparent;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s ease;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 500;
    color: #6b7280;
}

.view-btn.active {
    background: white;
    color: #720707;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* Jobs Grid */
.jobs-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
    gap: 1.5rem;
}

.job-card {
    background: white;
    border-radius: 16px;
    padding: 1.5rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
}

.job-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.job-card.urgent {
    border-left: 4px solid #ef4444;
}

.job-card.delayed {
    border-left: 4px solid #f59e0b;
}

.job-card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
}

.job-id-section {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.job-id {
    font-family: 'JetBrains Mono', monospace;
    font-weight: 600;
    color: #374151;
    background: #f3f4f6;
    padding: 0.25rem 0.5rem;
    border-radius: 6px;
    font-size: 0.875rem;
}

.urgent-indicator {
    color: #ef4444;
    font-size: 1rem;
}

.status-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.5rem 0.75rem;
    border-radius: 8px;
    font-size: 0.875rem;
    font-weight: 500;
}

.status-badge.pending {
    background: #fef3c7;
    color: #d97706;
}

.status-badge.in-transit {
    background: #dbeafe;
    color: #2563eb;
}

.status-badge.delivered {
    background: #dcfce7;
    color: #16a34a;
}

.status-badge.delayed {
    background: #fee2e2;
    color: #dc2626;
}

.customer-section {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1.5rem;
}

.customer-avatar {
    width: 50px;
    height: 50px;
    border-radius: 12px;
    background: linear-gradient(135deg, #720707, #dc2626);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 600;
    font-size: 1rem;
}

.customer-avatar.small {
    width: 40px;
    height: 40px;
    font-size: 0.875rem;
}

.customer-info h4 {
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 0.25rem;
}

.customer-info p {
    color: #6b7280;
    font-size: 0.875rem;
}

.route-section {
    margin-bottom: 1.5rem;
}

.route-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 0.75rem;
}

.route-marker {
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.route-item.pickup .route-marker {
    color: #10b981;
}

.route-item.delivery .route-marker {
    color: #ef4444;
}

.route-details {
    flex: 1;
}

.route-label {
    display: block;
    font-size: 0.75rem;
    font-weight: 500;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.route-location {
    display: block;
    font-weight: 500;
    color: #1f2937;
}

.route-connector {
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0.5rem 0;
    position: relative;
}

.route-line {
    width: 2px;
    height: 20px;
    background: linear-gradient(to bottom, #10b981, #ef4444);
    border-radius: 1px;
}

.route-truck {
    position: absolute;
    background: white;
    border: 2px solid #720707;
    border-radius: 50%;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #720707;
    font-size: 0.75rem;
}

.progress-section {
    margin-bottom: 1.5rem;
}

.progress-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
}

.progress-header span:first-child {
    font-weight: 500;
    color: #374151;
}

.progress-percentage {
    font-weight: 600;
    color: #720707;
}

.progress-bar {
    height: 8px;
    background: #f3f4f6;
    border-radius: 4px;
    overflow: hidden;
}

.progress-fill {
    height: 100%;
    border-radius: 4px;
    transition: width 0.3s ease;
}

.progress-fill.pending {
    background: linear-gradient(90deg, #f59e0b, #fbbf24);
}

.progress-fill.in-transit {
    background: linear-gradient(90deg, #720707, #dc2626);
}

.progress-fill.delivered {
    background: linear-gradient(90deg, #10b981, #34d399);
}

.progress-fill.delayed {
    background: linear-gradient(90deg, #ef4444, #f87171);
}

.job-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    padding-top: 1rem;
    border-top: 1px solid #f3f4f6;
}

.meta-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #6b7280;
    font-size: 0.875rem;
}

.meta-item i {
    color: #9ca3af;
}

.job-card-actions {
    display: flex;
    gap: 0.75rem;
}

.card-action-btn {
    flex: 1;
    padding: 0.75rem 1rem;
    border-radius: 8px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    border: none;
}

.card-action-btn.primary {
    background: linear-gradient(135deg, #720707, #dc2626);
    color: white;
}

.card-action-btn.primary:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(114, 7, 7, 0.3);
}

.card-action-btn.secondary {
    background: #f3f4f6;
    color: #374151;
}

.card-action-btn.secondary:hover {
    background: #e5e7eb;
    transform: translateY(-1px);
}

/* Jobs List */
.jobs-list {
    background: white;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
}

.list-header {
    display: grid;
    grid-template-columns: 120px 200px 250px 120px 100px 120px 120px 120px;
    gap: 1rem;
    padding: 1rem 1.5rem;
    background: #f9fafb;
    border-bottom: 1px solid #e5e7eb;
    font-weight: 600;
    color: #374151;
    font-size: 0.875rem;
}

.job-row {
    display: grid;
    grid-template-columns: 120px 200px 250px 120px 100px 120px 120px 120px;
    gap: 1rem;
    padding: 1rem 1.5rem;
    border-bottom: 1px solid #f3f4f6;
    transition: all 0.2s ease;
    align-items: center;
}

.job-row:hover {
    background: #f9fafb;
}

.job-row.urgent {
    border-left: 4px solid #ef4444;
}

.job-row.delayed {
    border-left: 4px solid #f59e0b;
}

.job-cell {
    display: flex;
    align-items: center;
    font-size: 0.875rem;
}

.job-id-text {
    font-family: 'JetBrains Mono', monospace;
    font-weight: 600;
    color: #374151;
    background: #f3f4f6;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.75rem;
}

.customer-info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.customer-name {
    display: block;
    font-weight: 500;
    color: #1f2937;
}

.customer-contact {
    display: block;
    color: #6b7280;
    font-size: 0.75rem;
}

.route-info {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.route-from,
.route-to {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.75rem;
}

.route-from .origin {
    color: #10b981;
}

.route-to .destination {
    color: #ef4444;
}

.priority-badge {
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 500;
}

.priority-badge.high {
    background: #fee2e2;
    color: #dc2626;
}

.priority-badge.medium {
    background: #fef3c7;
    color: #d97706;
}

.priority-badge.low {
    background: #dcfce7;
    color: #16a34a;
}

.progress-container {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.progress-container .progress-bar {
    flex: 1;
    height: 6px;
}

.progress-text {
    font-size: 0.75rem;
    font-weight: 500;
    color: #374151;
    min-width: 35px;
}

.eta-info {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.eta-time {
    font-weight: 500;
    color: #1f2937;
}

.eta-status {
    font-size: 0.75rem;
    padding: 0.125rem 0.25rem;
    border-radius: 3px;
}

.eta-status.on-time {
    background: #dcfce7;
    color: #16a34a;
}

.action-buttons {
    display: flex;
    gap: 0.5rem;
}

.action-btn {
    width: 32px;
    height: 32px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.875rem;
}

.action-btn.view {
    background: #dbeafe;
    color: #2563eb;
}

.action-btn.view:hover {
    background: #bfdbfe;
    transform: translateY(-1px);
}

.action-btn.track {
    background: #dcfce7;
    color: #16a34a;
}

.action-btn.track:hover {
    background: #bbf7d0;
    transform: translateY(-1px);
}

.action-btn.contact {
    background: #fef3c7;
    color: #d97706;
}

.action-btn.contact:hover {
    background: #fde68a;
    transform: translateY(-1px);
}

.action-btn.menu {
    background: #f3f4f6;
    color: #6b7280;
}

.action-btn.menu:hover {
    background: #e5e7eb;
    transform: translateY(-1px);
}

/* Empty State */
.empty-state {
    text-align: center;
    padding: 4rem 2rem;
    background: white;
    border-radius: 16px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.empty-icon {
    width: 80px;
    height: 80px;
    margin: 0 auto 1rem;
    background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #9ca3af;
    font-size: 2rem;
}

.empty-state h3 {
    color: #1f2937;
    margin-bottom: 0.5rem;
    font-size: 1.5rem;
    font-weight: 600;
}

.empty-state p {
    color: #6b7280;
    margin-bottom: 1.5rem;
}

/* Responsive Design */
@media (max-width: 1200px) {

    .list-header,
    .job-row {
        grid-template-columns: 100px 180px 200px 100px 80px 100px 100px 100px;
        font-size: 0.8rem;
    }
}

@media (max-width: 768px) {
    .dashboard-container {
        padding: 1rem;
    }

    .header-content {
        flex-direction: column;
        align-items: flex-start;
    }

    .summary-cards {
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    }

    .filters-container {
        flex-direction: column;
        align-items: stretch;
    }

    .view-toggle {
        margin-left: 0;
        margin-top: 1rem;
    }

    .jobs-grid {
        grid-template-columns: 1fr;
    }

    .jobs-list {
        overflow-x: auto;
    }

    .list-header,
    .job-row {
        min-width: 800px;
    }
}

@media (max-width: 480px) {
    .summary-cards {
        grid-template-columns: 1fr;
    }

    .job-card {
        padding: 1rem;
    }

    .customer-section {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.75rem;
    }

    .job-card-actions {
        flex-direction: column;
    }
}
</style>
