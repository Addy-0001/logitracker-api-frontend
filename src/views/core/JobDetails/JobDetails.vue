<template>
    <div class="job-details-container" style="padding-bottom: 100px;">
        <!-- Loading State -->
        <div v-if="isLoading" class="loading-state">
            <i class="fas fa-spinner fa-spin"></i>
            Loading job details...
        </div>

        <!-- Error State -->
        <div v-if="errorMessage" class="error-state">
            <i class="fas fa-exclamation-circle"></i>
            {{ errorMessage }}
            <button @click="fetchJob" class="retry-btn">Retry</button>
        </div>

        <!-- Job Details -->
        <div v-if="job" class="job-details">
            <div class="job-header">
                <h1>Job #{{ job._id }}</h1>
                <button @click="goBack" class="back-btn">
                    <i class="fas fa-arrow-left"></i>
                    Back to Dashboard
                </button>
            </div>

            <div class="details-sections">
                <!-- Customer Information -->
                <div class="details-section">
                    <h3 class="section-title">
                        <i class="fas fa-user"></i>
                        Customer Information
                    </h3>
                    <div class="details-grid">
                        <div class="detail-item">
                            <label>Name:</label>
                            <span>{{ job.customer.name || 'N/A' }}</span>
                        </div>
                        <div class="detail-item">
                            <label>Email:</label>
                            <span>{{ job.customer.email || 'N/A' }}</span>
                        </div>
                        <div class="detail-item">
                            <label>Phone:</label>
                            <span>{{ job.customer.phone || 'N/A' }}</span>
                        </div>
                        <div class="detail-item">
                            <label>Company:</label>
                            <span>{{ job.customer.company || 'N/A' }}</span>
                        </div>
                    </div>
                </div>

                <!-- Pickup Information -->
                <div class="details-section">
                    <h3 class="section-title">
                        <i class="fas fa-map-marker-alt pickup-icon"></i>
                        Pickup Information
                    </h3>
                    <div class="details-grid">
                        <div class="detail-item">
                            <label>Address:</label>
                            <span>{{ job.pickup.address || 'N/A' }}</span>
                        </div>
                        <div class="detail-item">
                            <label>City:</label>
                            <span>{{ job.pickup.city || 'N/A' }}</span>
                        </div>
                        <div class="detail-item">
                            <label>State:</label>
                            <span>{{ job.pickup.state || 'N/A' }}</span>
                        </div>
                        <div class="detail-item">
                            <label>Zip Code:</label>
                            <span>{{ job.pickup.zipCode || 'N/A' }}</span>
                        </div>
                        <div class="detail-item">
                            <label>Contact Person:</label>
                            <span>{{ job.pickup.contactPerson || 'N/A' }}</span>
                        </div>
                        <div class="detail-item">
                            <label>Contact Phone:</label>
                            <span>{{ job.pickup.contactPhone || 'N/A' }}</span>
                        </div>
                        <div class="detail-item full-width">
                            <label>Instructions:</label>
                            <span>{{ job.pickup.instructions || 'N/A' }}</span>
                        </div>
                    </div>
                </div>

                <!-- Delivery Information -->
                <div class="details-section">
                    <h3 class="section-title">
                        <i class="fas fa-map-marker-alt delivery-icon"></i>
                        Delivery Information
                    </h3>
                    <div class="details-grid">
                        <div class="detail-item">
                            <label>Address:</label>
                            <span>{{ job.delivery.address || 'N/A' }}</span>
                        </div>
                        <div class="detail-item">
                            <label>City:</label>
                            <span>{{ job.delivery.city || 'N/A' }}</span>
                        </div>
                        <div class="detail-item">
                            <label>State:</label>
                            <span>{{ job.delivery.state || 'N/A' }}</span>
                        </div>
                        <div class="detail-item">
                            <label>Zip Code:</label>
                            <span>{{ job.delivery.zipCode || 'N/A' }}</span>
                        </div>
                        <div class="detail-item">
                            <label>Contact Person:</label>
                            <span>{{ job.delivery.contactPerson || 'N/A' }}</span>
                        </div>
                        <div class="detail-item">
                            <label>Contact Phone:</label>
                            <span>{{ job.delivery.contactPhone || 'N/A' }}</span>
                        </div>
                        <div class="detail-item full-width">
                            <label>Instructions:</label>
                            <span>{{ job.delivery.instructions || 'N/A' }}</span>
                        </div>
                    </div>
                </div>

                <!-- Job Details -->
                <div class="details-section">
                    <h3 class="section-title">
                        <i class="fas fa-clipboard-list"></i>
                        Job Details
                    </h3>
                    <div class="details-grid">
                        <div class="detail-item">
                            <label>Type:</label>
                            <span>{{ jobDetails.type || 'N/A' }}</span>
                        </div>
                        <div class="detail-item">
                            <label>Priority:</label>
                            <span :class="['priority-badge', jobDetails.priority]">
                                {{ jobDetails.priority ? jobDetails.priority.toUpperCase() : 'N/A' }}
                            </span>
                        </div>
                        <div class="detail-item">
                            <label>Scheduled Date:</label>
                            <span>{{ formatDate(jobDetails.scheduledDate) }}</span>
                        </div>
                        <div class="detail-item">
                            <label>Scheduled Time:</label>
                            <span>{{ jobDetails.scheduledTime || 'N/A' }}</span>
                        </div>
                        <div class="detail-item">
                            <label>Estimated Duration:</label>
                            <span>{{ jobDetails.estimatedDuration ? `${jobDetails.estimatedDuration} hours` : 'N/A'
                                }}</span>
                        </div>
                        <div class="detail-item full-width">
                            <label>Special Instructions:</label>
                            <span>{{ jobDetails.specialInstructions || 'N/A' }}</span>
                        </div>
                        <div class="detail-item">
                            <label>Requires Signature:</label>
                            <span>{{ jobDetails.requiresSignature ? 'Yes' : 'No' }}</span>
                        </div>
                        <div class="detail-item">
                            <label>Fragile Items:</label>
                            <span>{{ jobDetails.fragileItems ? 'Yes' : 'No' }}</span>
                        </div>
                        <div class="detail-item">
                            <label>Heavy Items:</label>
                            <span>{{ jobDetails.heavyItems ? 'Yes' : 'No' }}</span>
                        </div>
                    </div>
                </div>

                <!-- Driver Assignment -->
                <div class="details-section">
                    <h3 class="section-title">
                        <i class="fas fa-user-tie"></i>
                        Driver Assignment
                    </h3>
                    <div class="details-grid">
                        <div class="detail-item">
                            <label>Assigned Driver:</label>
                            <span>{{ driverName || 'Unassigned' }}</span>
                        </div>
                        <div class="detail-item">
                            <label>Driver Phone:</label>
                            <span>{{ driverPhone || 'N/A' }}</span>
                        </div>
                    </div>
                </div>

                <!-- Status and Progress -->
                <div class="details-section">
                    <h3 class="section-title">
                        <i class="fas fa-info-circle"></i>
                        Status and Progress
                    </h3>
                    <div class="details-grid">
                        <div class="detail-item">
                            <label>Status:</label>
                            <span :class="['status-badge', job.status]">
                                <i :class="getStatusIcon(job.status)"></i>
                                {{ formatStatus(job.status) }}
                            </span>
                        </div>
                        <div class="detail-item">
                            <label>Progress:</label>
                            <div class="progress-container">
                                <div class="progress-bar">
                                    <div class="progress-fill" :style="{ width: job.progress + '%' }"
                                        :class="job.status"></div>
                                </div>
                                <span class="progress-text">{{ job.progress }}%</span>
                            </div>
                        </div>
                        <div class="detail-item">
                            <label>ETA:</label>
                            <span>{{ job.eta || 'N/A' }}</span>
                        </div>
                        <div class="detail-item">
                            <label>ETA Status:</label>
                            <span :class="['eta-status', getETAStatus(job.etaStatus)]">
                                {{ job.etaStatus || 'N/A' }}
                            </span>
                        </div>
                    </div>
                </div>

                <!-- Additional Notes -->
                <div class="details-section">
                    <h3 class="section-title">
                        <i class="fas fa-sticky-note"></i>
                        Additional Notes
                    </h3>
                    <div class="details-grid">
                        <div class="detail-item full-width">
                            <label>Notes:</label>
                            <span>{{ job.notes || 'N/A' }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import apiClient from '@/api/axios';
import { useRouter, useRoute } from 'vue-router';
import './JobDetails.css';

export default {
    name: 'JobDetails',
    setup() {
        const router = useRouter();
        const route = useRoute();
        return { router, route };
    },
    data() {
        return {
            job: null,
            jobDetails: null,
            driverName: '',
            driverPhone: '',
            isLoading: false,
            errorMessage: '',
            availableDrivers: []
        };
    },
    async created() {
        await this.fetchDrivers();
        await this.fetchJob();
    },
    methods: {
        async fetchJob() {
            this.isLoading = true;
            this.errorMessage = '';
            try {
                const response = await apiClient.get(`/jobs/${this.route.params.id}`);
                console.log('GET /jobs/:id response:', response.data);
                this.job = response.data;
                try {
                    this.jobDetails = typeof this.job.jobDetails === 'string'
                        ? JSON.parse(this.job.jobDetails)
                        : this.job.jobDetails;
                } catch (e) {
                    console.error('Error parsing jobDetails:', e);
                    this.jobDetails = {
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
                const driver = this.availableDrivers.find(d => d._id === this.job.assignedTo);
                this.driverName = driver ? `${driver.firstName} ${driver.lastName}` : 'Unknown';
                this.driverPhone = driver ? driver.phone : 'N/A';
            } catch (error) {
                console.error('Error fetching job:', error);
                if (error.response?.status === 404) {
                    this.errorMessage = 'Job not found.';
                } else if (error.response?.status === 401 || error.response?.status === 403) {
                    this.errorMessage = 'Session expired. Please log in again.';
                    this.router.push('/login');
                } else {
                    this.errorMessage = error.response?.data?.message || 'Failed to load job details.';
                }
            } finally {
                this.isLoading = false;
            }
        },
        async fetchDrivers() {
            try {
                const response = await apiClient.get('/users/drivers');
                this.availableDrivers = response.data;
            } catch (error) {
                console.error('Error fetching drivers:', error);
                this.errorMessage = error.response?.data?.message || 'Failed to load drivers.';
            }
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
            return status ? status.split('-').map(word =>
                word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ') : 'N/A';
        },
        getETAStatus(status) {
            return status ? status.toLowerCase() : '';
        },
        formatDate(date) {
            if (!date) return 'N/A';
            return new Date(date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        },
        goBack() {
            this.router.push('/');
        }
    }
};
</script>