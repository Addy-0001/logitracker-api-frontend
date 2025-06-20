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
                    <button class="new-job-btn" @click="openNewJobModal">
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

                <div v-for="job in filteredJobs" :key="job.id" class="job-row"
                    :class="{ 'urgent': job.priority === 'high', 'delayed': job.status === 'delayed' }">
                    <div class="job-cell job-id">
                        <span class="job-id-text">{{ job.id }}</span>
                        <span v-if="job.isUrgent" class="urgent-indicator">
                            <i class="fas fa-exclamation-circle"></i>
                        </span>
                    </div>

                    <div class="job-cell customer">
                        <div class="customer-info">
                            <span class="customer-name">{{ job.customer }}</span>
                            <span class="customer-contact">{{ job.contact }}</span>
                        </div>
                    </div>

                    <div class="job-cell route">
                        <div class="route-info">
                            <div class="route-from">
                                <i class="fas fa-circle origin"></i>
                                {{ job.origin }}
                            </div>
                            <div class="route-to">
                                <i class="fas fa-map-marker-alt destination"></i>
                                {{ job.destination }}
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
                            <button @click="showJobMenu(job)" class="action-btn menu" title="More Options">
                                <i class="fas fa-ellipsis-v"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Grid View -->
            <div v-else-if="viewMode === 'grid'" class="jobs-grid">
                <div v-for="job in filteredJobs" :key="job.id" class="job-card"
                    :class="{ 'urgent': job.priority === 'high', 'delayed': job.status === 'delayed' }">
                    <div class="job-card-header">
                        <div class="job-id-section">
                            <span class="job-id">{{ job.id }}</span>
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
                            <h4>{{ job.customer }}</h4>
                            <p>{{ job.contact }}</p>
                        </div>

                        <div class="route-section">
                            <div class="route-item">
                                <i class="fas fa-circle origin"></i>
                                <span>{{ job.origin }}</span>
                            </div>
                            <div class="route-arrow">
                                <i class="fas fa-arrow-down"></i>
                            </div>
                            <div class="route-item">
                                <i class="fas fa-map-marker-alt destination"></i>
                                <span>{{ job.destination }}</span>
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
        <div v-if="showNewJobModal" class="modal-overlay" @click="closeNewJobModal">
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
                                    <input type="text" id="customerName" v-model="newJobForm.customer.name"
                                        class="form-input" :class="{ 'error': newJobErrors.customerName }"
                                        placeholder="Enter customer name" />
                                    <span v-if="newJobErrors.customerName" class="error-message">{{
                                        newJobErrors.customerName }}</span>
                                </div>

                                <div class="form-group">
                                    <label for="customerCompany" class="form-label">Company</label>
                                    <input type="text" id="customerCompany" v-model="newJobForm.customer.company"
                                        class="form-input" placeholder="Enter company name" />
                                </div>
                            </div>

                            <div class="form-row">
                                <div class="form-group">
                                    <label for="customerEmail" class="form-label">Email *</label>
                                    <input type="email" id="customerEmail" v-model="newJobForm.customer.email"
                                        class="form-input" :class="{ 'error': newJobErrors.customerEmail }"
                                        placeholder="Enter email address" />
                                    <span v-if="newJobErrors.customerEmail" class="error-message">{{
                                        newJobErrors.customerEmail }}</span>
                                </div>

                                <div class="form-group">
                                    <label for="customerPhone" class="form-label">Phone *</label>
                                    <input type="tel" id="customerPhone" v-model="newJobForm.customer.phone"
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
                                <input type="text" id="pickupAddress" v-model="newJobForm.pickup.address"
                                    class="form-input" :class="{ 'error': newJobErrors.pickupAddress }"
                                    placeholder="Enter pickup address" />
                                <span v-if="newJobErrors.pickupAddress" class="error-message">{{
                                    newJobErrors.pickupAddress }}</span>
                            </div>

                            <div class="form-row">
                                <div class="form-group">
                                    <label for="pickupCity" class="form-label">City *</label>
                                    <input type="text" id="pickupCity" v-model="newJobForm.pickup.city"
                                        class="form-input" :class="{ 'error': newJobErrors.pickupCity }"
                                        placeholder="Enter city" />
                                    <span v-if="newJobErrors.pickupCity" class="error-message">{{
                                        newJobErrors.pickupCity }}</span>
                                </div>

                                <div class="form-group">
                                    <label for="pickupState" class="form-label">State *</label>
                                    <select id="pickupState" v-model="newJobForm.pickup.state" class="form-input"
                                        :class="{ 'error': newJobErrors.pickupState }">
                                        <option value="" disabled>Select state</option>
                                        <option value="AL">Alabama</option>
                                        <option value="CA">California</option>
                                        <option value="FL">Florida</option>
                                        <option value="IL">Illinois</option>
                                        <option value="NY">New York</option>
                                        <option value="TX">Texas</option>
                                    </select>
                                    <span v-if="newJobErrors.pickupState" class="error-message">{{
                                        newJobErrors.pickupState }}</span>
                                </div>

                                <div class="form-group">
                                    <label for="pickupZipCode" class="form-label">Zip Code *</label>
                                    <input type="text" id="pickupZipCode" v-model="newJobForm.pickup.zipCode"
                                        class="form-input" :class="{ 'error': newJobErrors.pickupZipCode }"
                                        placeholder="Enter zip code" />
                                    <span v-if="newJobErrors.pickupZipCode" class="error-message">{{
                                        newJobErrors.pickupZipCode }}</span>
                                </div>
                            </div>

                            <div class="form-row">
                                <div class="form-group">
                                    <label for="pickupContact" class="form-label">Contact Person</label>
                                    <input type="text" id="pickupContact" v-model="newJobForm.pickup.contactPerson"
                                        class="form-input" placeholder="Enter contact person" />
                                </div>

                                <div class="form-group">
                                    <label for="pickupContactPhone" class="form-label">Contact Phone</label>
                                    <input type="tel" id="pickupContactPhone" v-model="newJobForm.pickup.contactPhone"
                                        class="form-input" placeholder="Enter contact phone" />
                                </div>
                            </div>

                            <div class="form-group">
                                <label for="pickupInstructions" class="form-label">Special Instructions</label>
                                <textarea id="pickupInstructions" v-model="newJobForm.pickup.instructions"
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
                                <input type="text" id="deliveryAddress" v-model="newJobForm.delivery.address"
                                    class="form-input" :class="{ 'error': newJobErrors.deliveryAddress }"
                                    placeholder="Enter delivery address" />
                                <span v-if="newJobErrors.deliveryAddress" class="error-message">{{
                                    newJobErrors.deliveryAddress }}</span>
                            </div>

                            <div class="form-row">
                                <div class="form-group">
                                    <label for="deliveryCity" class="form-label">City *</label>
                                    <input type="text" id="deliveryCity" v-model="newJobForm.delivery.city"
                                        class="form-input" :class="{ 'error': newJobErrors.deliveryCity }"
                                        placeholder="Enter city" />
                                    <span v-if="newJobErrors.deliveryCity" class="error-message">{{
                                        newJobErrors.deliveryCity }}</span>
                                </div>

                                <div class="form-group">
                                    <label for="deliveryState" class="form-label">State *</label>
                                    <select id="deliveryState" v-model="newJobForm.delivery.state" class="form-input"
                                        :class="{ 'error': newJobErrors.deliveryState }">
                                        <option value="" disabled>Select state</option>
                                        <option value="AL">Alabama</option>
                                        <option value="CA">California</option>
                                        <option value="FL">Florida</option>
                                        <option value="IL">Illinois</option>
                                        <option value="NY">New York</option>
                                        <option value="TX">Texas</option>
                                    </select>
                                    <span v-if="newJobErrors.deliveryState" class="error-message">{{
                                        newJobErrors.deliveryState }}</span>
                                </div>

                                <div class="form-group">
                                    <label for="deliveryZipCode" class="form-label">Zip Code *</label>
                                    <input type="text" id="deliveryZipCode" v-model="newJobForm.delivery.zipCode"
                                        class="form-input" :class="{ 'error': newJobErrors.deliveryZipCode }"
                                        placeholder="Enter zip code" />
                                    <span v-if="newJobErrors.deliveryZipCode" class="error-message">{{
                                        newJobErrors.deliveryZipCode }}</span>
                                </div>
                            </div>

                            <div class="form-row">
                                <div class="form-group">
                                    <label for="deliveryContact" class="form-label">Contact Person</label>
                                    <input type="text" id="deliveryContact" v-model="newJobForm.delivery.contactPerson"
                                        class="form-input" placeholder="Enter contact person" />
                                </div>

                                <div class="form-group">
                                    <label for="deliveryContactPhone" class="form-label">Contact Phone</label>
                                    <input type="tel" id="deliveryContactPhone"
                                        v-model="newJobForm.delivery.contactPhone" class="form-input"
                                        placeholder="Enter contact phone" />
                                </div>
                            </div>

                            <div class="form-group">
                                <label for="deliveryInstructions" class="form-label">Special Instructions</label>
                                <textarea id="deliveryInstructions" v-model="newJobForm.delivery.instructions"
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

                            <div class="form-row">
                                <div class="form-group">
                                    <label for="jobType" class="form-label">Job Type *</label>
                                    <select id="jobType" v-model="newJobForm.jobDetails.type" class="form-input"
                                        :class="{ 'error': newJobErrors.jobType }">
                                        <option value="" disabled>Select job type</option>
                                        <option value="delivery">Standard Delivery</option>
                                        <option value="pickup">Pickup Only</option>
                                        <option value="express">Express Delivery</option>
                                        <option value="fragile">Fragile Items</option>
                                        <option value="bulk">Bulk Transport</option>
                                        <option value="same-day">Same Day Delivery</option>
                                    </select>
                                    <span v-if="newJobErrors.jobType" class="error-message">{{ newJobErrors.jobType
                                    }}</span>
                                </div>

                                <div class="form-group">
                                    <label for="jobPriority" class="form-label">Priority</label>
                                    <select id="jobPriority" v-model="newJobForm.jobDetails.priority"
                                        class="form-input">
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                    </select>
                                </div>
                            </div>

                            <div class="form-row">
                                <div class="form-group">
                                    <label for="scheduledDate" class="form-label">Scheduled Date *</label>
                                    <input type="date" id="scheduledDate" v-model="newJobForm.jobDetails.scheduledDate"
                                        class="form-input" :class="{ 'error': newJobErrors.scheduledDate }"
                                        :min="new Date().toISOString().split('T')[0]" />
                                    <span v-if="newJobErrors.scheduledDate" class="error-message">{{
                                        newJobErrors.scheduledDate }}</span>
                                </div>

                                <div class="form-group">
                                    <label for="scheduledTime" class="form-label">Scheduled Time *</label>
                                    <input type="time" id="scheduledTime" v-model="newJobForm.jobDetails.scheduledTime"
                                        class="form-input" :class="{ 'error': newJobErrors.scheduledTime }" />
                                    <span v-if="newJobErrors.scheduledTime" class="error-message">{{
                                        newJobErrors.scheduledTime }}</span>
                                </div>

                                <div class="form-group">
                                    <label for="estimatedDuration" class="form-label">Estimated Duration (hours)</label>
                                    <input type="number" id="estimatedDuration"
                                        v-model.number="newJobForm.jobDetails.estimatedDuration" class="form-input"
                                        placeholder="Enter estimated hours" min="0.5" step="0.5" />
                                </div>
                            </div>

                            <div class="form-group">
                                <label class="form-label">Special Requirements</label>
                                <div class="checkbox-group">
                                    <label class="checkbox-container">
                                        <input type="checkbox" v-model="newJobForm.jobDetails.requiresSignature" />
                                        <span class="checkmark"></span>
                                        Requires Signature
                                    </label>

                                    <label class="checkbox-container">
                                        <input type="checkbox" v-model="newJobForm.jobDetails.fragileItems" />
                                        <span class="checkmark"></span>
                                        Fragile Items
                                    </label>

                                    <label class="checkbox-container">
                                        <input type="checkbox" v-model="newJobForm.jobDetails.heavyItems" />
                                        <span class="checkmark"></span>
                                        Heavy Items (>50lbs)
                                    </label>
                                </div>
                            </div>

                            <div class="form-group">
                                <label for="specialInstructions" class="form-label">Special Instructions</label>
                                <textarea id="specialInstructions" v-model="newJobForm.jobDetails.specialInstructions"
                                    class="form-textarea" placeholder="Enter any special instructions for this job"
                                    rows="3"></textarea>
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

                        <!-- Additional Notes -->
                        <div class="form-section">
                            <h3 class="section-title">
                                <i class="fas fa-sticky-note"></i>
                                Additional Notes
                            </h3>

                            <div class="form-group">
                                <label for="jobNotes" class="form-label">Internal Notes</label>
                                <textarea id="jobNotes" v-model="newJobForm.notes" class="form-textarea"
                                    placeholder="Enter any internal notes or comments about this job"
                                    rows="3"></textarea>
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

<script>
import "./homeview.css";
import apiClient from '@/api/axios';
import { useRouter } from 'vue-router';

export default {
    name: 'Dashboard',
    setup() {
        const router = useRouter();
        return { router };
    },
    data() {
        return {
            currentDate: new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }),
            isRefreshing: false,
            showNewJobModal: false,
            viewMode: 'grid',
            searchQuery: '',
            selectedStatus: '',
            selectedPriority: '',
            selectedDateRange: 'today',
            ongoingJobs: [],
            isLoading: false,
            errorMessage: '',
            summaryStats: {
                inTransit: 0,
                pending: 0,
                urgent: 0,
                deliveredToday: 0
            },
            availableDrivers: [],
            newJobForm: {
                customer: {
                    name: '',
                    email: '',
                    phone: '',
                    company: ''
                },
                pickup: {
                    address: '',
                    city: '',
                    state: '',
                    zipCode: '',
                    contactPerson: '',
                    contactPhone: '',
                    instructions: ''
                },
                delivery: {
                    address: '',
                    city: '',
                    state: '',
                    zipCode: '',
                    contactPerson: '',
                    contactPhone: '',
                    instructions: ''
                },
                jobDetails: {
                    type: '',
                    priority: 'medium',
                    scheduledDate: '',
                    scheduledTime: '',
                    estimatedDuration: null,
                    specialInstructions: '',
                    requiresSignature: false,
                    fragileItems: false,
                    heavyItems: false
                },
                assignedTo: '',
                notes: ''
            },
            newJobErrors: {},
            isCreatingJob: false,
            createJobError: '',
            createJobSuccess: ''
        };
    },
    computed: {
        filteredJobs() {
            return this.ongoingJobs;
        }
    },
    async created() {
        await Promise.all([
            this.fetchJobs(),
            this.fetchSummaryStats(),
            this.fetchDrivers()
        ]);
    },
    methods: {
        mapJob(job) {
            let jobDetails;
            try {
                jobDetails = typeof job.jobDetails === 'string' ? JSON.parse(job.jobDetails) : job.jobDetails;
            } catch (e) {
                console.error('Error parsing jobDetails:', e);
                jobDetails = {
                    type: 'unknown',
                    priority: 'medium',
                    scheduledDate: null,
                    scheduledTime: '',
                    estimatedDuration: null,
                    specialInstructions: '',
                    requiresSignature: false,
                    fragileItems: false,
                    heavyItems: false
                };
            }
            return {
                id: job._id,
                customer: job.customer.name,
                contact: job.customer.email,
                origin: `${job.pickup.city}, ${job.pickup.state}`,
                destination: `${job.delivery.city}, ${job.delivery.state}`,
                status: job.status,
                priority: jobDetails.priority,
                progress: job.progress,
                eta: job.eta || this.calculateETA(),
                etaStatus: job.etaStatus,
                isUrgent: job.isUrgent,
                createdAt: job.createdAt
            };
        },
        async fetchJobs() {
            this.isLoading = true;
            this.errorMessage = '';
            try {
                const response = await apiClient.get('/jobs', {
                    params: {
                        search: this.searchQuery || undefined,
                        status: this.selectedStatus || undefined,
                        priority: this.selectedPriority || undefined
                    }
                });
                console.log('GET /jobs response:', response.data, 'Length:', response.data.length);
                this.ongoingJobs = response.data.map(this.mapJob);
            } catch (error) {
                console.error('Error fetching jobs:', error);
                if (error.response?.status === 401 || error.response?.status === 403) {
                    this.errorMessage = 'Session expired. Please log in again.';
                    this.router.push('/login');
                } else {
                    this.errorMessage = error.response?.data?.message || 'Failed to load jobs. Please try again.';
                }
            } finally {
                this.isLoading = false;
            }
        },
        async fetchSummaryStats() {
            try {
                const response = await apiClient.get('/jobs/summary');
                this.summaryStats = response.data;
            } catch (error) {
                console.error('Error fetching summary stats:', error);
                this.errorMessage = error.response?.data?.message || 'Failed to load summary stats.';
            }
        },
        async fetchDrivers() {
            try {
                const response = await apiClient.get('/users/drivers');
                this.availableDrivers = response.data;
            } catch (error) {
                console.error('Error fetching drivers:', error);
                this.errorMessage = error.response?.data?.message || 'Failed to load drivers. Please try again.';
            }
        },
        async refreshData() {
            this.isRefreshing = true;
            try {
                await Promise.all([
                    this.fetchJobs(),
                    this.fetchSummaryStats(),
                    this.fetchDrivers()
                ]);
            } finally {
                this.isRefreshing = false;
            }
        },
        clearSearch() {
            this.searchQuery = '';
            this.fetchJobs();
        },
        clearFilters() {
            this.searchQuery = '';
            this.selectedStatus = '';
            this.selectedPriority = '';
            this.selectedDateRange = 'today';
            this.fetchJobs();
        },
        getStatusIcon(status) {
            const icons = {
                'pending': 'fas fa-clock',
                'in-transit': 'fas fa-truck',
                'delayed': 'fas fa-exclamation-triangle',
                'delivered': 'fas fa-check-circle'
            };
            return icons[status] || 'fas fa-circle';
        },
        formatStatus(status) {
            return status.split('-').map(word =>
                word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ');
        },
        getETAStatus(status) {
            return status ? status.toLowerCase() : '';
        },
        viewJobDetails(job) {
            this.router.push(`/job/${job.id}`);
        },
        trackJob(job) {
            console.log('Tracking job:', job.id);
        },
        contactCustomer(job) {
            console.log('Contacting customer for job:', job.id);
        },
        showJobMenu(job) {
            console.log('Showing menu for job:', job.id);
        },
        openNewJobModal() {
            this.showNewJobModal = true;
            this.resetNewJobForm();
        },
        closeNewJobModal() {
            this.showNewJobModal = false;
            this.resetNewJobForm();
        },
        resetNewJobForm() {
            this.newJobForm = {
                customer: {
                    name: '',
                    email: '',
                    phone: '',
                    company: ''
                },
                pickup: {
                    address: '',
                    city: '',
                    state: '',
                    zipCode: '',
                    contactPerson: '',
                    contactPhone: '',
                    instructions: ''
                },
                delivery: {
                    address: '',
                    city: '',
                    state: '',
                    zipCode: '',
                    contactPerson: '',
                    contactPhone: '',
                    instructions: ''
                },
                jobDetails: {
                    type: '',
                    priority: 'medium',
                    scheduledDate: '',
                    scheduledTime: '',
                    estimatedDuration: null,
                    specialInstructions: '',
                    requiresSignature: false,
                    fragileItems: false,
                    heavyItems: false
                },
                assignedTo: '',
                notes: ''
            };
            this.newJobErrors = {};
            this.createJobError = '';
            this.createJobSuccess = '';
        },
        validateNewJobForm() {
            this.newJobErrors = {};
            if (!this.newJobForm.customer.name.trim()) {
                this.newJobErrors.customerName = 'Customer name is required';
            }
            if (!this.newJobForm.customer.email.trim()) {
                this.newJobErrors.customerEmail = 'Customer email is required';
            } else if (!this.isValidEmail(this.newJobForm.customer.email)) {
                this.newJobErrors.customerEmail = 'Please enter a valid email address';
            }
            if (!this.newJobForm.customer.phone.trim()) {
                this.newJobErrors.customerPhone = 'Customer phone is required';
            }
            if (!this.newJobForm.pickup.address.trim()) {
                this.newJobErrors.pickupAddress = 'Pickup address is required';
            }
            if (!this.newJobForm.pickup.city.trim()) {
                this.newJobErrors.pickupCity = 'Pickup city is required';
            }
            if (!this.newJobForm.pickup.state.trim()) {
                this.newJobErrors.pickupState = 'Pickup state is required';
            }
            if (!this.newJobForm.pickup.zipCode.trim()) {
                this.newJobErrors.pickupZipCode = 'Pickup zip code is required';
            }
            if (!this.newJobForm.delivery.address.trim()) {
                this.newJobErrors.deliveryAddress = 'Delivery address is required';
            }
            if (!this.newJobForm.delivery.city.trim()) {
                this.newJobErrors.deliveryCity = 'Delivery city is required';
            }
            if (!this.newJobForm.delivery.state.trim()) {
                this.newJobErrors.deliveryState = 'Delivery state is required';
            }
            if (!this.newJobForm.delivery.zipCode.trim()) {
                this.newJobErrors.deliveryZipCode = 'Delivery zip code is required';
            }
            if (!this.newJobForm.jobDetails.type) {
                this.newJobErrors.jobType = 'Job type is required';
            }
            if (!this.newJobForm.jobDetails.scheduledDate) {
                this.newJobErrors.scheduledDate = 'Scheduled date is required';
            }
            if (!this.newJobForm.jobDetails.scheduledTime) {
                this.newJobErrors.scheduledTime = 'Scheduled time is required';
            }
            if (!this.newJobForm.assignedTo) {
                this.newJobErrors.assignedTo = 'Please assign a driver';
            }
            return Object.keys(this.newJobErrors).length === 0;
        },
        isValidEmail(email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(email);
        },
        parseValidationErrors(error) {
            if (error.response?.data?.error?.includes('validation failed')) {
                const errors = {};
                const errorDetails = error.response.data.error.match(/([^:]+): ([^,]+)/g);
                if (errorDetails) {
                    errorDetails.forEach(detail => {
                        const [, field, message] = detail.match(/([^:]+): (.+)/);
                        if (field.includes('jobDetails')) {
                            errors.jobDetails = message;
                        } else if (field.includes('assignedTo')) {
                            errors.assignedTo = message;
                        } else {
                            errors[field] = message;
                        }
                    });
                }
                return errors;
            }
            return null;
        },
        async createNewJob() {
            if (!this.validateNewJobForm()) {
                return;
            }
            this.isCreatingJob = true;
            this.createJobError = '';
            this.createJobSuccess = '';
            try {
                const jobData = {
                    ...this.newJobForm,
                    jobDetails: JSON.stringify(this.newJobForm.jobDetails)
                };
                const response = await apiClient.post('/jobs', jobData);
                const newJob = response.data;
                await this.fetchJobs();
                await this.fetchSummaryStats();
                const assignedDriver = this.availableDrivers.find(d => d._id === newJob.assignedTo);
                this.createJobSuccess = `Job ${newJob._id} created successfully and assigned to ${assignedDriver ? `${assignedDriver.firstName} ${assignedDriver.lastName}` : 'Unassigned'}`;
                setTimeout(() => {
                    this.closeNewJobModal();
                }, 2000);
            } catch (error) {
                if (error.response?.status === 401 || error.response?.status === 403) {
                    this.createJobError = 'Session expired. Please log in again.';
                    this.router.push('/login');
                } else {
                    const validationErrors = this.parseValidationErrors(error);
                    if (validationErrors) {
                        this.newJobErrors = { ...this.newJobErrors, ...validationErrors };
                        this.createJobError = 'Please correct the errors in the form.';
                    } else {
                        this.createJobError = error.response?.data?.error || error.response?.data?.message || 'Failed to create job. Please try again.';
                    }
                }
                console.error('Error creating job:', error);
            } finally {
                this.isCreatingJob = false;
            }
        },
        calculateETA() {
            const now = new Date();
            const hoursToAdd = Math.floor(Math.random() * 4) + 4;
            const eta = new Date(now.getTime() + (hoursToAdd * 60 * 60 * 1000));
            return eta.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            });
        },
        getDriverName(driverId) {
            const driver = this.availableDrivers.find(d => d._id === driverId);
            return driver ? `${driver.firstName} ${driver.lastName}` : 'Unknown';
        },
        getDriverPhone(driverId) {
            const driver = this.availableDrivers.find(d => d._id === driverId);
            return driver ? driver.phone : 'N/A';
        }
    },
    watch: {
        searchQuery: function () {
            this.fetchJobs();
        },
        selectedStatus: function () {
            this.fetchJobs();
        },
        selectedPriority: function () {
            this.fetchJobs();
        },
        selectedDateRange: function () {
            this.fetchJobs();
        }
    }
};
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