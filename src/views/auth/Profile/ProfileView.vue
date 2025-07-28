<template>
    <div class="profile-container">
        <div class="profile-sidebar">
            <div class="profile-user">
                <div class="profile-avatar">
                    <img :src="user.profileImage" alt="User Avatar" @error="user.profileImage = null" />
                    <div class="avatar-upload">
                        <label for="avatar-input" class="avatar-edit">
                            <i class="fas fa-camera"></i>
                        </label>
                        <input type="file" id="avatar-input" accept="image/*" @change="handleAvatarChange"
                            class="avatar-input" />
                    </div>
                </div>
                <h3 class="profile-name">{{ user.firstName }} {{ user.lastName }}</h3>
                <p class="profile-role">{{ user.role }}</p>
            </div>

            <div class="profile-nav">
                <button v-for="section in sections" :key="section.id" @click="activeSection = section.id"
                    :class="['profile-nav-item', { active: activeSection === section.id }]">
                    <i :class="section.icon"></i>
                    {{ section.name }}
                </button>
            </div>

            <router-link to="/logout" class="logout-button">
                <i class="fas fa-sign-out-alt"></i>
                Logout
            </router-link>
        </div>

        <div class="profile-content">
            <!-- Loading State -->
            <div v-if="isLoading && !user.firstName" class="loading-state">
                <i class="fas fa-spinner fa-spin"></i>
                Loading profile...
            </div>

            <div class="profile-header">
                <h1>My Profile</h1>
                <p>Manage your account information and settings</p>
            </div>

            <!-- Personal Information Section -->
            <div v-if="activeSection === 'personal'" class="profile-section">
                <div class="section-header">
                    <h2>Personal Information</h2>
                    <p>Update your personal details</p>
                </div>

                <form @submit.prevent="updatePersonalInfo" class="profile-form">
                    <div class="form-row">
                        <div class="form-group">
                            <label for="firstName" class="form-label">First Name</label>
                            <input type="text" id="firstName" v-model="personalInfo.firstName" class="form-input"
                                :class="{ 'error': errors.firstName }" placeholder="Enter your first name" />
                            <span v-if="errors.firstName" class="error-message">{{ errors.firstName }}</span>
                        </div>

                        <div class="form-group">
                            <label for="lastName" class="form-label">Last Name</label>
                            <input type="text" id="lastName" v-model="personalInfo.lastName" class="form-input"
                                :class="{ 'error': errors.lastName }" placeholder="Enter your last name" />
                            <span v-if="errors.lastName" class="error-message">{{ errors.lastName }}</span>
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="email" class="form-label">Email Address</label>
                        <input type="email" id="email" v-model="personalInfo.email" class="form-input"
                            :class="{ 'error': errors.email }" placeholder="Enter your email address" disabled />
                        <span class="input-note">Email address cannot be changed</span>
                    </div>

                    <div class="form-group">
                        <label for="phone" class="form-label">Phone Number</label>
                        <input type="tel" id="phone" v-model="personalInfo.phone" class="form-input"
                            :class="{ 'error': errors.phone }" placeholder="Enter your phone number" />
                        <span v-if="errors.phone" class="error-message">{{ errors.phone }}</span>
                    </div>

                    <div class="form-actions">
                        <button type="submit" class="save-button" :disabled="isLoading">
                            <span v-if="!isLoading">Save Changes</span>
                            <span v-else class="loading-spinner">
                                <i class="fas fa-spinner fa-spin"></i>
                                Saving...
                            </span>
                        </button>
                    </div>

                    <div v-if="updateSuccess" class="update-success">
                        <i class="fas fa-check-circle"></i>
                        {{ updateSuccess }}
                    </div>

                    <div v-if="updateError" class="update-error">
                        <i class="fas fa-exclamation-circle"></i>
                        {{ updateError }}
                    </div>
                </form>
            </div>

            <!-- Password Section -->
            <div v-if="activeSection === 'password'" class="profile-section">
                <div class="section-header">
                    <h2>Change Password</h2>
                    <p>Update your password</p>
                </div>

                <form @submit.prevent="updatePassword" class="profile-form">
                    <div class="form-group">
                        <label for="currentPassword" class="form-label">Current Password</label>
                        <div class="password-input-container">
                            <input :type="showCurrentPassword ? 'text' : 'password'" id="currentPassword"
                                v-model="passwordData.currentPassword" class="form-input"
                                :class="{ 'error': errors.currentPassword }"
                                placeholder="Enter your current password" />
                            <button type="button" @click="showCurrentPassword = !showCurrentPassword"
                                class="password-toggle">
                                <i :class="showCurrentPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                            </button>
                        </div>
                        <span v-if="errors.currentPassword" class="error-message">{{ errors.currentPassword }}</span>
                    </div>

                    <div class="form-group">
                        <label for="newPassword" class="form-label">New Password</label>
                        <div class="password-input-container">
                            <input :type="showNewPassword ? 'text' : 'password'" id="newPassword"
                                v-model="passwordData.newPassword" class="form-input"
                                :class="{ 'error': errors.newPassword }" placeholder="Enter your new password" />
                            <button type="button" @click="showNewPassword = !showNewPassword" class="password-toggle">
                                <i :class="showNewPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                            </button>
                        </div>
                        <span v-if="errors.newPassword" class="error-message">{{ errors.newPassword }}</span>

                        <div class="password-strength">
                            <div class="strength-bar">
                                <div class="strength-fill" :class="passwordStrengthClass"
                                    :style="{ width: passwordStrengthWidth }"></div>
                            </div>
                            <span class="strength-text">{{ passwordStrengthText }}</span>
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="confirmPassword" class="form-label">Confirm New Password</label>
                        <div class="password-input-container">
                            <input :type="showConfirmPassword ? 'text' : 'password'" id="confirmPassword"
                                v-model="passwordData.confirmPassword" class="form-input"
                                :class="{ 'error': errors.confirmPassword }" placeholder="Confirm your new password" />
                            <button type="button" @click="showConfirmPassword = !showConfirmPassword"
                                class="password-toggle">
                                <i :class="showConfirmPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                            </button>
                        </div>
                        <span v-if="errors.confirmPassword" class="error-message">{{ errors.confirmPassword }}</span>
                    </div>

                    <div class="form-actions">
                        <button type="submit" class="save-button" :disabled="isLoading">
                            <span v-if="!isLoading">Update Password</span>
                            <span v-else class="loading-spinner">
                                <i class="fas fa-spinner fa-spin"></i>
                                Updating...
                            </span>
                        </button>
                    </div>

                    <div v-if="updateSuccess" class="update-success">
                        <i class="fas fa-check-circle"></i>
                        {{ updateSuccess }}
                    </div>

                    <div v-if="updateError" class="update-error">
                        <i class="fas fa-exclamation-circle"></i>
                        {{ updateError }}
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import apiClient from '@/api/axios';
import { jwtDecode } from 'jwt-decode';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// Reactive state
const user = ref({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    profileImage: null,
    role: ''
});

const sections = ref([
    { id: 'personal', name: 'Personal Information', icon: 'fas fa-user' },
    { id: 'password', name: 'Password', icon: 'fas fa-lock' }
]);

const activeSection = ref('personal');

const personalInfo = ref({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
});

const passwordData = ref({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
});

const showCurrentPassword = ref(false);
const showNewPassword = ref(false);
const showConfirmPassword = ref(false);
const isLoading = ref(false);
const updateSuccess = ref('');
const updateError = ref('');
const errors = ref({});

const router = useRouter();
const authStore = useAuthStore();

// Computed properties
const passwordStrength = computed(() => {
    const password = passwordData.value.newPassword;
    if (!password) return 0;

    let strength = 0;
    if (password.length >= 6) strength += 1;
    if (password.length >= 12) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[!@#$%^&*]/.test(password)) strength += 1;
    return Math.min(strength, 5);
});

const passwordStrengthClass = computed(() => {
    const strength = passwordStrength.value;
    if (strength <= 1) return 'weak';
    if (strength <= 3) return 'medium';
    return 'strong';
});

const passwordStrengthWidth = computed(() => {
    return `${(passwordStrength.value / 5) * 100}%`;
});

const passwordStrengthText = computed(() => {
    const strength = passwordStrength.value;
    if (!passwordData.value.newPassword) return '';
    if (strength <= 1) return 'Weak';
    if (strength <= 3) return 'Medium';
    return 'Strong';
});

// Methods
const isValidPhone = (phone) => {
    const regex = /^\+977[1-9]\d{9}$/;
    return regex.test(phone);
};

const validatePersonalInfo = () => {
    errors.value = {};
    if (!personalInfo.value.firstName.trim()) {
        errors.value.firstName = 'First name is required';
    } else if (personalInfo.value.firstName.trim().length < 2) {
        errors.value.firstName = 'First name must be at least 2 characters';
    }
    if (!personalInfo.value.lastName.trim()) {
        errors.value.lastName = 'Last name is required';
    } else if (personalInfo.value.lastName.trim().length < 2) {
        errors.value.lastName = 'Last name must be at least 2 characters';
    }
    if (personalInfo.value.phone && !isValidPhone(personalInfo.value.phone)) {
        errors.value.phone = 'Please enter a valid Nepal phone number (+977 followed by 10 digits)';
    }
    return Object.keys(errors.value).length === 0;
};

const validatePasswordData = () => {
    errors.value = {};
    if (!passwordData.value.currentPassword) {
        errors.value.currentPassword = 'Current password is required';
    }
    if (!passwordData.value.newPassword) {
        errors.value.newPassword = 'New password is required';
    } else if (passwordData.value.newPassword.length < 6) {
        errors.value.newPassword = 'Password must be at least 6 characters';
    } else if (!/[a-z]/.test(passwordData.value.newPassword)) {
        errors.value.newPassword = 'Password must contain at least one lowercase letter';
    } else if (!/[A-Z]/.test(passwordData.value.newPassword)) {
        errors.value.newPassword = 'Password must contain at least one uppercase letter';
    } else if (!/[0-9]/.test(passwordData.value.newPassword)) {
        errors.value.newPassword = 'Password must contain at least one number';
    } else if (!/[!@#$%^&*]/.test(passwordData.value.newPassword)) {
        errors.value.newPassword = 'Password must contain at least one special character';
    }
    if (!passwordData.value.confirmPassword) {
        errors.value.confirmPassword = 'Please confirm your new password';
    } else if (passwordData.value.newPassword !== passwordData.value.confirmPassword) {
        errors.value.confirmPassword = 'Passwords do not match';
    }
    return Object.keys(errors.value).length === 0;
};

const fetchUserProfile = async () => {
    isLoading.value = true;
    updateError.value = '';

    try {
        const token = authStore.token;
        if (!token) {
            throw new Error('No authentication token found');
        }
        const decodedToken = jwtDecode(token);
        const userId = decodedToken.id;
        console.log('Fetching profile for userId:', userId, 'Token:', token);

        const response = await apiClient.get(`/user/getProfile/${userId}`);
        const userData = response.data.user || {};

        console.log('Profile response:', response.data);

        user.value = {
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            email: userData.email || '',
            phone: userData.phone || '',
            profileImage: userData.profileImage || null,
            role: userData.role || ''
        };

        personalInfo.value = {
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            email: userData.email || '',
            phone: userData.phone || ''
        };

        authStore.setAuthData({
            token: authStore.token,
            user: userData,
            rememberMe: !!localStorage.getItem('authToken')
        });
    } catch (error) {
        console.error('Fetch profile error:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
            userId: error.config?.url
        });

        if (error.response?.status === 401 || error.response?.status === 403) {
            updateError.value = 'Session expired or unauthorized. Please log in again.';
            authStore.logout();
            router.push('/login');
        } else if (error.response?.status === 404) {
            updateError.value = 'Profile not found. Please contact support or try logging in again.';
        } else {
            updateError.value = error.response?.data?.message || 'Failed to fetch profile data. Please try again.';
        }
    } finally {
        isLoading.value = false;
    }
};

const handleAvatarChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.match('image.*')) {
        updateError.value = 'Please select an image file';
        return;
    }

    if (file.size > 5 * 1024 * 1024) {
        updateError.value = 'Image size should not exceed 5MB';
        return;
    }

    isLoading.value = true;
    updateError.value = '';
    updateSuccess.value = '';

    try {
        const formData = new FormData();
        formData.append('avatar', file);

        const response = await apiClient.patch('/user/uploadAvatar', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });

        user.value.profileImage = response.data.profileImage;
        authStore.setAuthData({
            token: authStore.token,
            user: { ...authStore.getUser, profileImage: response.data.profileImage },
            rememberMe: !!localStorage.getItem('authToken')
        });

        updateSuccess.value = 'Profile picture updated successfully';
    } catch (error) {
        console.error('Avatar upload error:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
        });
        updateError.value = error.response?.data?.message || 'Failed to update profile picture. Please try again.';
    } finally {
        isLoading.value = false;
    }
};

const updatePersonalInfo = async () => {
    if (!validatePersonalInfo()) return;

    isLoading.value = true;
    updateError.value = '';
    updateSuccess.value = '';

    try {
        const response = await apiClient.patch('/user/updateProfile', {
            firstName: personalInfo.value.firstName,
            lastName: personalInfo.value.lastName,
            phone: personalInfo.value.phone
        });

        user.value.firstName = personalInfo.value.firstName;
        user.value.lastName = personalInfo.value.lastName;
        user.value.phone = personalInfo.value.phone;

        authStore.setAuthData({
            token: authStore.token,
            user: { ...authStore.getUser, ...response.data },
            rememberMe: !!localStorage.getItem('authToken')
        });

        updateSuccess.value = 'Personal information updated successfully';
    } catch (error) {
        console.error('Update personal info error:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
        });
        updateError.value = error.response?.data?.message || 'Failed to update personal information. Please try again.';
        if (error.response?.data?.errors) {
            error.response.data.errors.forEach((err) => {
                errors.value[err.param] = err.msg;
            });
        }
    } finally {
        isLoading.value = false;
    }
};

const updatePassword = async () => {
    if (!validatePasswordData()) return;

    isLoading.value = true;
    updateError.value = '';
    updateSuccess.value = '';

    try {
        await apiClient.patch('/user/changePassword', {
            currentPassword: passwordData.value.currentPassword,
            newPassword: passwordData.value.newPassword,
            confirmNewPassword: passwordData.value.confirmPassword
        });

        updateSuccess.value = 'Password updated successfully';
        passwordData.value = {
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
        };
    } catch (error) {
        console.error('Update password error:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
        });
        updateError.value = error.response?.data?.message || 'Failed to update password. Please try again.';
        if (error.response?.data?.errors) {
            error.response.data.errors.forEach((err) => {
                errors.value[err.param] = err.msg;
            });
        }
    } finally {
        isLoading.value = false;
    }
};

// Fetch user data on mount
onMounted(async () => {
    if (!authStore.isAuthenticated) {
        updateError.value = 'Please log in to view your profile.';
        router.push('/login');
        return;
    }
    await fetchUserProfile();
});
</script>

<style scoped>
@import "./profileview.css";

.loading-state {
    text-align: center;
    padding: 20px;
    background: #fff;
    border-radius: 8px;
    margin: 20px 0;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.loading-state i {
    font-size: 24px;
    margin-right: 10px;
}
</style>