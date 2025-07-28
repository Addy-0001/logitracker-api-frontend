<template>
    <div class="dashboard-container" style="padding-bottom: 100px;">
        <!-- Error and Loading States -->
        <div v-if="isLoading" class="loading-state">
            <i class="fas fa-spinner fa-spin"></i>
            Loading jobs...
        </div>
        <div v-if="errorMessage" class="error-state">
            <i class="fas fa-exclamation-circle"></i>
            {{ errorMessage }}
            <button @click="refreshData" class="retry-btn">Retry</button>
        </div>

        <!-- Dashboard Header -->
        <div class="dashboard-header">
            <div class="header-content">
                <div class="header-title">
                    <h1>Dashboard</h1>
                    <p>{{ currentDate }} • {{ ongoingJobs.length }} active jobs</p>
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
                <div class="summary-card">
                    <div class="card-icon in-transit">
                        <i class="fas fa-truck"></i>
                    </div>
                    <div class="card-content">
                        <h3>{{ summaryStats.inTransit }}</h3>
                        <p>In Transit</p>
                    </div>
                </div>
                <div class="summary-card">
                    <div class="card-icon pending">
                        <i class="fas fa-clock"></i>
                    </div>
                    <div class="card-content">
                        <h3>{{ summaryStats.pending }}</h3>
                        <p>Pending</p>
                    </div>
                </div>
                <div class="summary-card">
                    <div class="card-icon urgent">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <div class="card-content">
                        <h3>{{ summaryStats.urgent }}</h3>
                        <p>Urgent</p>
                    </div>
                </div>
                <div class="summary-card">
                    <div class="card-icon delivered">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <div class="card-content">
                        <h3>{{ summaryStats.deliveredToday }}</h3>
                        <p>Delivered Today</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Filters and Search -->
        <div class="controls-section">
            <div class="search-container">
                <div class="search-input-wrapper">
                    <i class="fas fa-search"></i>
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
                        <span class="job-id-text">{{ job._id }}</span>
                        <span v-if="job.isUrgent" class="urgent-indicator">
                            <i class="fas fa-exclamation-circle"></i>
                        </span>
                    </div>
                    <div class="job-cell customer">
                        <div class="customer-info">
                            <span class="customer-name">{{ job.customerInfo.name }}</span>
                            <span class="customer-contact">{{ job.customerInfo.email }}</span>
                        </div>
                    </div>
                    <div class="job-cell route">
                        <div class="route-info">
                            <div class="route-from">
                                <i class="fas fa-circle origin"></i>
                                {{ job.pickupInfo.city }}, {{ job.pickupInfo.state }}
                            </div>
                            <div class="route-to">
                                <i class="fas fa-map-marker-alt destination"></i>
                                {{ job.dropoffInfo.city }}, {{ job.dropoffInfo.state }}
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

            <!-- Grid View -->
            <div v-else-if="viewMode === 'grid'" class="jobs-grid">
                <div v-for="job in filteredJobs" :key="job._id" class="job-card"
                    :class="{ 'urgent': job.priority === 'high', 'delayed': job.status === 'delayed' }">
                    <div class="job-card-header">
                        <div class="job-id-section">
                            <span class="job-id">{{ job._id }}</span>
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
                            <h4>{{ job.customerInfo.name }}</h4>
                            <p>{{ job.customerInfo.email }}</p>
                        </div>
                        <div class="route-section">
                            <div class="route-item">
                                <i class="fas fa-circle origin"></i>
                                <span>{{ job.pickupInfo.city }}, {{ job.pickupInfo.state }}</span>
                            </div>
                            <div class="route-arrow">
                                <i class="fas fa-arrow-down"></i>
                            </div>
                            <div class="route-item">
                                <i class="fas fa-map-marker-alt destination"></i>
                                <span>{{ job.dropoffInfo.city }}, {{ job.dropoffInfo.state }}</span>
                            </div>
                        </div>
                        <div class="progress-section">
                            <div class="progress-header">
                                <span>Progress</span>
                                <span>{{ job.progress }}%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" :style="{ width: job.progress + '%' }" :class="job.status">
                                </div>
                            </div>
                        </div>
                        <div class="eta-section">
                            <div class="eta-label">ETA:</div>
                            <div class="eta-value">{{ job.eta }}</div>
                            <span :class="['eta-status', getETAStatus(job.etaStatus)]">
                                {{ job.etaStatus }}
                            </span>
                        </div>
                    </div>
                    <div class="job-card-actions">
                        <button @click="viewJobDetails(job)" class="card-action-btn primary">
                            <i class="fas fa-eye"></i>
                            View Details
                        </button>
                        <button @click="trackJob(job)" class="card-action-btn secondary">
                            <i class="fas fa-map-marker-alt"></i>
                            Track
                        </button>
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
const selectedDateRange = ref('today');
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
                job.pickupInfo.city.toLowerCase().includes(query) ||
                job.dropoffInfo.city.toLowerCase().includes(query)
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
        name: job.customerInfo?.name || 'Unknown',
        email: job.customerInfo?.email || 'N/A',
    },
    pickupInfo: {
        city: job.pickupInfo?.city || 'Unknown',
        state: job.pickupInfo?.state || 'Unknown',
        latitude: job.pickupInfo?.latitude || null,
        longitude: job.pickupInfo?.longitude || null,
    },
    dropoffInfo: {
        city: job.dropoffInfo?.city || 'Unknown',
        state: job.dropoffInfo?.state || 'N/A',
        latitude: job.dropoffInfo?.latitude || null,
        longitude: job.dropoffInfo?.longitude || null,
    },
    status: job.status || 'pending',
    priority: job.isUrgent ? 'high' : 'medium',
    progress: 0, // Placeholder; backend does not provide
    eta: calculateETA(job), // Computed ETA
    isUrgent: job.isUrgent || false,
    etaStatus: 'on-time', // Static fallback
    createdAt: job.createdAt || new Date().toISOString(),
});

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
    selectedDateRange.value = 'today';
    fetchJobs();
};

const getStatusIcon = (status) => {
    const icons = {
        pending: 'fas fa-clock',
        'in-transit': 'fas fa-truck',
        delayed: 'fas fa-exclamation-triangle',
        delivered: 'fas fa-check-circle',
        cancelled: 'fas fa-times-circle',
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

const calculateETA = async (job) => {
    try {
        if (job.pickupInfo.latitude && job.pickupInfo.longitude && job.dropoffInfo.latitude && job.dropoffInfo.longitude) {
            const route = await getRoute(
                [job.pickupInfo.longitude, job.pickupInfo.latitude],
                [job.dropoffInfo.longitude, job.dropoffInfo.latitude]
            );
            const durationSeconds = route.features[0].properties.summary.duration;
            const eta = new Date(Date.now() + durationSeconds * 1000);
            return eta.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
            });
        }
        return 'N/A';
    } catch (error) {
        console.error('Error calculating ETA:', error);
        return 'N/A';
    }
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
@import './homeview.css';

/* Existing styles remain unchanged */
.loading-state,
.error-state {
    text-align: center;
    padding: 20px;
    background: #fff;
    border-radius: 8px;
    margin: 20px 0;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.loading-state i,
.error-state i {
    font-size: 24px;
    margin-right: 10px;
}

.error-state {
    color: #d32f2f;
}

.retry-btn {
    margin-top: 10px;
    padding: 8px 16px;
    background: #1976d2;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

.retry-btn:hover {
    background: #1565c0;
}

/* ... (rest of the styles remain unchanged) */
</style>
