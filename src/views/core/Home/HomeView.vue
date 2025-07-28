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
                    <button v-if="authStore.user?.role === 'admin'" class="new-job-btn" @click="openNewJobModal">
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

        <!-- Create Job Modal -->
        <div v-if="showNewJobModal && authStore.user?.role === 'admin'" class="modal-overlay" @click="closeNewJobModal">
            <div class="modal-container" @click.stop>
                <div class="modal-header">
                    <h2>Create New Job</h2>
                    <button @click="closeNewJobModal" class="modal-close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>

                <div class="modal-content">
                    <form @submit.prevent="createNewJob" class="create-job-form">
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
                                        placeholder="Enter phone number" />
                                    <span v-if="newJobErrors.customerPhone" class="error-message">{{
                                        newJobErrors.customerPhone }}</span>
                                </div>
                            </div>
                        </div>

                        <!-- Pickup Information -->
                        <div class="form-section">
                            <h3 class="section-title">
                                <i class="fas fa-map-marker-alt pickup-icon"></i>
                                Pickup Information
                            </h3>

                            <div class="form-group">
                                <label for="pickupAddress" class="form-label">Address *</label>
                                <input type="text" id="pickupAddress" v-model="newJobForm.pickupInfo.address"
                                    class="form-input" :class="{ 'error': newJobErrors.pickupAddress }"
                                    placeholder="Enter pickup address" />
                                <span v-if="newJobErrors.pickupAddress" class="error-message">{{
                                    newJobErrors.pickupAddress }}</span>
                            </div>

                            <div class="form-row">
                                <div class="form-group">
                                    <label for="pickupCity" class="form-label">City *</label>
                                    <input type="text" id="pickupCity" v-model="newJobForm.pickupInfo.city"
                                        class="form-input" :class="{ 'error': newJobErrors.pickupCity }"
                                        placeholder="Enter city" />
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

                            <div class="form-row">
                                <div class="form-group">
                                    <label for="pickupContact" class="form-label">Contact Person</label>
                                    <input type="text" id="pickupContact" v-model="newJobForm.pickupInfo.contactPerson"
                                        class="form-input" placeholder="Enter contact person" />
                                </div>

                                <div class="form-group">
                                    <label for="pickupContactPhone" class="form-label">Contact Phone</label>
                                    <input type="tel" id="pickupContactPhone"
                                        v-model="newJobForm.pickupInfo.contactPhone" class="form-input"
                                        placeholder="Enter contact phone" />
                                </div>
                            </div>

                            <div class="form-group">
                                <label for="pickupInstructions" class="form-label">Special Instructions</label>
                                <textarea id="pickupInstructions" v-model="newJobForm.pickupInfo.instructions"
                                    class="form-textarea" placeholder="Enter any special pickup instructions"
                                    rows="2"></textarea>
                            </div>
                        </div>

                        <!-- Delivery Information -->
                        <div class="form-section">
                            <h3 class="section-title">
                                <i class="fas fa-map-marker-alt delivery-icon"></i>
                                Delivery Information
                            </h3>

                            <div class="form-group">
                                <label for="deliveryAddress" class="form-label">Address *</label>
                                <input type="text" id="deliveryAddress" v-model="newJobForm.dropoffInfo.address"
                                    class="form-input" :class="{ 'error': newJobErrors.deliveryAddress }"
                                    placeholder="Enter delivery address" />
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

                            <div class="form-row">
                                <div class="form-group">
                                    <label for="deliveryContact" class="form-label">Contact Person</label>
                                    <input type="text" id="deliveryContact"
                                        v-model="newJobForm.dropoffInfo.contactPerson" class="form-input"
                                        placeholder="Enter contact person" />
                                </div>

                                <div class="form-group">
                                    <label for="deliveryContactPhone" class="form-label">Contact Phone</label>
                                    <input type="tel" id="deliveryContactPhone"
                                        v-model="newJobForm.dropoffInfo.contactPhone" class="form-input"
                                        placeholder="Enter contact phone" />
                                </div>
                            </div>

                            <div class="form-group">
                                <label for="deliveryInstructions" class="form-label">Special Instructions</label>
                                <textarea id="deliveryInstructions" v-model="newJobForm.dropoffInfo.instructions"
                                    class="form-textarea" placeholder="Enter any special delivery instructions"
                                    rows="2"></textarea>
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
                                    :class="{ 'error': newJobErrors.assignedTo }">
                                    <option value="" disabled>Select a driver</option>
                                    <option v-for="driver in availableDrivers" :key="driver._id" :value="driver._id">
                                        {{ driver.firstName }} {{ driver.lastName }} - {{ driver.phone }}
                                    </option>
                                </select>
                                <span v-if="newJobErrors.assignedTo" class="error-message">{{
                                    newJobErrors.assignedTo }}</span>
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

                        <div v-if="createJobError" class="form-error">
                            <i class="fas fa-exclamation-circle"></i>
                            {{ createJobError }}
                        </div>

                        <!-- Form Actions -->
                        <div class="form-actions">
                            <button type="button" @click="closeNewJobModal" class="cancel-btn">
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
import './homeview.css';

const router = useRouter();
const authStore = useAuthStore();

const currentDate = ref(new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
}));
const isRefreshing = ref(false);
const showNewJobModal = ref(false);
const viewMode = ref('grid');
const searchQuery = ref('');
const selectedStatus = ref('');
const selectedPriority = ref('');
const selectedDateRange = ref('today');
const ongoingJobs = ref([]);
const isLoading = ref(false);
const errorMessage = ref('');
const availableDrivers = ref([]);
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
        // Implement tracking logic (e.g., redirect to Tracking.vue)
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

const openNewJobModal = () => {
    showNewJobModal.value = true;
    resetNewJobForm();
};

const closeNewJobModal = () => {
    showNewJobModal.value = false;
    resetNewJobForm();
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
        newJobErrors.value.customerPhone = 'Please enter a valid Nepal phone number (+977 followed by 9 digits)';
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
    if (!newJobForm.value.pickupInfo.latitude || !newJobForm.value.pickupInfo.longitude) {
        newJobErrors.value.pickupCoords = 'Pickup coordinates are required';
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
    if (!newJobForm.value.dropoffInfo.latitude || !newJobForm.value.dropoffInfo.longitude) {
        newJobErrors.value.dropoffCoords = 'Delivery coordinates are required';
    }
    if (!newJobForm.value.assignedTo) {
        newJobErrors.value.assignedTo = 'Please assign a driver';
    }
    return Object.keys(newJobErrors.value).length === 0;
};

const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const isValidPhone = (phone) => {
    const phoneRegex = /^\+977[1-9]\d{8}$/;
    return phoneRegex.test(phone);
};

// Placeholder geocoding function (replace with actual ORS or MapTiler geocoding API)
const geocodeAddress = async (address, city, state) => {
    // Mock implementation; replace with actual geocoding API call
    const mockCoords = {
        latitude: 27.7172, // Kathmandu default
        longitude: 85.3240,
    };
    return mockCoords;
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

const parseValidationErrors = (error) => {
    if (error.response?.data?.errors) {
        const errors = {};
        error.response.data.errors.forEach((err) => {
            const field = err.param.split('.').pop();
            errors[field] = err.msg;
        });
        return errors;
    }
    return null;
};

const createNewJob = async () => {
    // Geocode addresses to get coordinates
    try {
        const pickupCoords = await geocodeAddress(
            newJobForm.value.pickupInfo.address,
            newJobForm.value.pickupInfo.city,
            newJobForm.value.pickupInfo.state
        );
        const dropoffCoords = await geocodeAddress(
            newJobForm.value.dropoffInfo.address,
            newJobForm.value.dropoffInfo.city,
            newJobForm.value.dropoffInfo.state
        );
        newJobForm.value.pickupInfo.latitude = pickupCoords.latitude;
        newJobForm.value.pickupInfo.longitude = pickupCoords.longitude;
        newJobForm.value.dropoffInfo.latitude = dropoffCoords.latitude;
        newJobForm.value.dropoffInfo.longitude = dropoffCoords.longitude;
    } catch (error) {
        console.error('Error geocoding addresses:', error);
        newJobErrors.value.geocoding = 'Failed to fetch coordinates for addresses.';
        return;
    }

    if (!validateNewJobForm()) return;
    isCreatingJob.value = true;
    createJobError.value = '';
    createJobSuccess.value = '';
    try {
        const jobData = {
            customerInfo: newJobForm.value.customerInfo,
            pickupInfo: newJobForm.value.pickupInfo,
            dropoffInfo: newJobForm.value.dropoffInfo,
            addOns: newJobForm.value.addOns,
            assignedTo: newJobForm.value.assignedTo,
            note: newJobForm.value.note,
        };
        const response = await apiClient.post('/job/createJob', jobData);
        const newJob = response.data.job;
        await fetchJobs();
        const assignedDriver = availableDrivers.value.find((d) => d._id === newJob.assignedTo);
        createJobSuccess.value = `Job ${newJob._id} created successfully and assigned to ${assignedDriver ? `${assignedDriver.firstName} ${assignedDriver.lastName}` : 'Unassigned'
            }`;
        setTimeout(() => {
            closeNewJobModal();
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
            if (validationErrors) {
                newJobErrors.value = { ...newJobErrors.value, ...validationErrors };
                createJobError.value = 'Please correct the errors in the form.';
            } else {
                createJobError.value = error.response?.data?.message || 'Failed to create job. Please try again.';
            }
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
</style>