<template>
    <div class="user-details-container" style="padding-bottom: 100px;">
        <!-- Header Section -->
        <div class="page-header">
            <div class="header-content">
                <div class="breadcrumb">
                    <span class="breadcrumb-item" @click="goBack">
                        <i class="fas fa-users"></i>
                        User Management
                    </span>
                    <i class="fas fa-chevron-right breadcrumb-separator"></i>
                    <span class="breadcrumb-current">User Details</span>
                </div>
                <h1>User Profile</h1>
            </div>
            <div class="header-actions">
                <button @click="goBack" class="back-btn">
                    <i class="fas fa-arrow-left"></i>
                    Back
                </button>
            </div>
        </div>

        <!-- Main Content -->
        <div class="user-details-content">
            <!-- Loading State -->
            <div v-if="isLoading" class="loading-state">
                <div class="loading-spinner">
                    <i class="fas fa-spinner fa-spin"></i>
                </div>
                <h3>Loading User Details</h3>
                <p>Please wait while we fetch the user information...</p>
            </div>

            <!-- Error State -->
            <div v-else-if="errorMessage" class="error-state">
                <div class="error-icon">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <h3>Error Loading User</h3>
                <p>{{ errorMessage }}</p>
                <button @click="fetchUserDetails" class="retry-btn">
                    <i class="fas fa-refresh"></i>
                    Try Again
                </button>
            </div>

            <!-- User Details -->
            <div v-else-if="user" class="user-profile">
                <!-- Profile Header Card -->
                <div class="profile-header-card">
                    <div class="profile-background"></div>
                    <div class="profile-content">
                        <div class="profile-avatar">
                            <img :src="user.profileImage" :alt="`${user.firstName} ${user.lastName}`"
                                @error="handleImageError" />
                            <div class="avatar-status" :class="getOnlineStatus()">
                                <i :class="getStatusIcon()"></i>
                            </div>
                        </div>
                        <div class="profile-info">
                            <h2 class="user-name">{{ user.firstName }} {{ user.lastName }}</h2>
                            <div class="user-role">
                                <span :class="['role-badge', user.role]">
                                    <i :class="getRoleIcon(user.role)"></i>
                                    {{ formatRole(user.role) }}
                                </span>
                            </div>
                            <div class="user-contact">
                                <div class="contact-item">
                                    <i class="fas fa-envelope"></i>
                                    <a :href="`mailto:${user.email}`">{{ user.email }}</a>
                                </div>
                                <div class="contact-item">
                                    <i class="fas fa-phone"></i>
                                    <a :href="`tel:${user.phone}`">{{ user.phone }}</a>
                                </div>
                            </div>
                        </div>
                        <div class="profile-actions">
                            <button @click="callUser" class="action-btn call">
                                <i class="fas fa-phone"></i>
                                Call
                            </button>
                            <button @click="emailUser" class="action-btn email">
                                <i class="fas fa-envelope"></i>
                                Email
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Information Cards -->
                <div class="info-cards-grid">
                    <!-- Personal Information -->
                    <div class="info-card">
                        <div class="card-header">
                            <h3>
                                <i class="fas fa-user"></i>
                                Personal Information
                            </h3>
                        </div>
                        <div class="card-content">
                            <div class="info-grid">
                                <div class="info-item">
                                    <label>First Name</label>
                                    <span>{{ user.firstName }}</span>
                                </div>
                                <div class="info-item">
                                    <label>Last Name</label>
                                    <span>{{ user.lastName }}</span>
                                </div>
                                <div class="info-item">
                                    <label>Email Address</label>
                                    <span>{{ user.email }}</span>
                                </div>
                                <div class="info-item">
                                    <label>Phone Number</label>
                                    <span>{{ user.phone }}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Account Information -->
                    <div class="info-card">
                        <div class="card-header">
                            <h3>
                                <i class="fas fa-user-cog"></i>
                                Account Information
                            </h3>
                        </div>
                        <div class="card-content">
                            <div class="info-grid">
                                <div class="info-item">
                                    <label>User ID</label>
                                    <span class="user-id">{{ user._id }}</span>
                                </div>
                                <div class="info-item">
                                    <label>Role</label>
                                    <span :class="['role-badge', user.role]">
                                        <i :class="getRoleIcon(user.role)"></i>
                                        {{ formatRole(user.role) }}
                                    </span>
                                </div>
                                <div class="info-item">
                                    <label>Status</label>
                                    <span :class="['status-badge', user.status || 'active']">
                                        <i :class="getStatusIcon(user.status)"></i>
                                        {{ formatStatus(user.status) }}
                                    </span>
                                </div>
                                <div class="info-item">
                                    <label>Account Created</label>
                                    <span>{{ formatDate(user.createdAt) }}</span>
                                </div>
                                <div class="info-item">
                                    <label>Last Updated</label>
                                    <span>{{ formatDate(user.updatedAt) }}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Driver Information (if applicable) -->
                    <div v-if="user.role === 'driver' && user.driverInfo" class="info-card">
                        <div class="card-header">
                            <h3>
                                <i class="fas fa-truck"></i>
                                Driver Information
                            </h3>
                        </div>
                        <div class="card-content">
                            <div class="info-grid">
                                <div class="info-item">
                                    <label>License Number</label>
                                    <span>{{ user.driverInfo.licenseNumber || 'N/A' }}</span>
                                </div>
                                <div class="info-item">
                                    <label>License Expiry</label>
                                    <span :class="getLicenseExpiryClass(user.driverInfo.licenseExpiry)">
                                        {{ formatDate(user.driverInfo.licenseExpiry) || 'N/A' }}
                                    </span>
                                </div>
                                <div class="info-item">
                                    <label>Vehicle Type</label>
                                    <span>{{ formatVehicleType(user.driverInfo.vehicleType) }}</span>
                                </div>
                                <div class="info-item">
                                    <label>Vehicle Plate</label>
                                    <span>{{ user.driverInfo.vehiclePlate || 'N/A' }}</span>
                                </div>
                                <div class="info-item">
                                    <label>Experience</label>
                                    <span>{{ user.driverInfo.experience || 'N/A' }} years</span>
                                </div>
                                <div class="info-item">
                                    <label>Rating</label>
                                    <div class="rating-display">
                                        <div class="stars">
                                            <i v-for="n in 5" :key="n"
                                                :class="n <= (user.driverInfo.rating || 0) ? 'fas fa-star' : 'far fa-star'">
                                            </i>
                                        </div>
                                        <span class="rating-text">{{ user.driverInfo.rating || 0 }}/5</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>


            </div>

            <!-- Not Found State -->
            <div v-else class="not-found-state">
                <div class="not-found-icon">
                    <i class="fas fa-user-slash"></i>
                </div>
                <h3>User Not Found</h3>
                <p>The requested user could not be found in the system.</p>
                <button @click="goBack" class="back-btn">
                    <i class="fas fa-arrow-left"></i>
                    Back to User Management
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import apiClient from '@/api/axios';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const user = ref(null);
const isLoading = ref(false);
const errorMessage = ref('');
const recentActivities = ref([
    {
        id: 1,
        type: 'login',
        title: 'User Login',
        description: 'Logged in from mobile device',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
    },
    {
        id: 2,
        type: 'job',
        title: 'Job Completed',
        description: 'Successfully completed delivery job #JOB-001',
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000) // 5 hours ago
    },
    {
        id: 3,
        type: 'update',
        title: 'Profile Updated',
        description: 'Updated phone number and address',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
    }
]);

const fetchUserDetails = async () => {
    isLoading.value = true;
    errorMessage.value = '';
    const userId = route.params.id;

    try {
        console.log(`Fetching user details for ID: ${userId}`);
        const response = await apiClient.get(`/user/getProfile/${userId}`, {
            headers: {
                Authorization: `Bearer ${authStore.token}`,
            },
        });

        console.log('User fetch response:', response.data);
        user.value = response.data.user;

        if (!user.value) {
            errorMessage.value = 'User not found.';
        }
    } catch (error) {
        console.error('Error fetching user details:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
        });

        if (error.response?.status === 401 || error.response?.status === 403) {
            errorMessage.value = 'Unauthorized. Please log in again.';
            authStore.logout();
            router.push('/login');
        } else if (error.response?.status === 404) {
            errorMessage.value = 'User not found.';
        } else {
            errorMessage.value = error.response?.data?.message || 'Failed to load user details. Please try again.';
        }
    } finally {
        isLoading.value = false;
    }
};

const handleImageError = (event) => {
    event.target.src = 'https://res.cloudinary.com/de1lvlqme/image/upload/v1749566197/vecteezy_default-profile-account-unknown-icon-black-silhouette_20765399_ldtak0.jpg';
};

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Kathmandu',
    });
};

const formatRelativeTime = (date) => {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
};

const formatRole = (role) => {
    const roles = {
        'admin': 'Administrator',
        'driver': 'Driver',
        'dispatcher': 'Dispatcher',
        'customer': 'Customer'
    };
    return roles[role] || role?.charAt(0).toUpperCase() + role?.slice(1) || 'N/A';
};

const formatStatus = (status) => {
    return status?.charAt(0).toUpperCase() + status?.slice(1) || 'Active';
};

const formatDepartment = (department) => {
    const departments = {
        'operations': 'Operations',
        'logistics': 'Logistics',
        'customer-service': 'Customer Service',
        'management': 'Management'
    };
    return departments[department] || department || 'N/A';
};

const formatVehicleType = (type) => {
    const types = {
        'van': 'Van',
        'truck': 'Truck',
        'motorcycle': 'Motorcycle',
        'car': 'Car'
    };
    return types[type] || type || 'N/A';
};

const getRoleIcon = (role) => {
    const icons = {
        'admin': 'fas fa-user-shield',
        'driver': 'fas fa-truck',
        'dispatcher': 'fas fa-headset',
        'customer': 'fas fa-user'
    };
    return icons[role] || 'fas fa-user';
};

const getStatusIcon = (status) => {
    const icons = {
        'active': 'fas fa-check-circle',
        'inactive': 'fas fa-times-circle',
        'pending': 'fas fa-clock',
        'suspended': 'fas fa-ban'
    };
    return icons[status || 'active'] || 'fas fa-check-circle';
};

const getActivityIcon = (type) => {
    const icons = {
        'login': 'fas fa-sign-in-alt',
        'job': 'fas fa-truck',
        'update': 'fas fa-edit',
        'system': 'fas fa-cog'
    };
    return icons[type] || 'fas fa-circle';
};

const getOnlineStatus = () => {
    // Mock online status - in real app, this would come from the API
    return Math.random() > 0.5 ? 'online' : 'offline';
};

const getLicenseExpiryClass = (expiryDate) => {
    if (!expiryDate) return '';
    const expiry = new Date(expiryDate);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry < 0) return 'expired';
    if (daysUntilExpiry < 30) return 'expiring-soon';
    return '';
};

const calculateSuccessRate = () => {
    const total = user.value?.stats?.totalJobs || 0;
    const completed = user.value?.stats?.completedJobs || 0;
    return total > 0 ? Math.round((completed / total) * 100) : 0;
};

const goBack = () => {
    router.push('/users');
};


const callUser = () => {
    window.open(`tel:${user.value.phone}`);
};

const emailUser = () => {
    window.open(`mailto:${user.value.email}`);
};

const toggleUserStatus = async () => {
    // Implementation for toggling user status
    console.log('Toggle user status');
};

onMounted(async () => {
    if (!authStore.isAuthenticated || authStore.user?.role !== 'admin') {
        errorMessage.value = 'Unauthorized. Only admins can view user details.';
        router.push('/login');
        return;
    }

    console.log('authStore state:', {
        isAuthenticated: authStore.isAuthenticated,
        user: authStore.user,
        token: authStore.token,
    });

    await fetchUserDetails();
});
</script>

<style scoped>
@import './UserProfile.css';
</style>
