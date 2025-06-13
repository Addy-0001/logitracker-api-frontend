<template>
    <div class="profile-container">
        <div class="profile-sidebar">
            <div class="profile-user">
                <div class="profile-avatar">
                    <img :src="user.avatar || '/default-avatar.png'" alt="User Avatar" />
                    <div class="avatar-upload">
                        <label for="avatar-input" class="avatar-edit">
                            <i class="fas fa-camera"></i>
                        </label>
                        <input type="file" id="avatar-input" accept="image/*" @change="handleAvatarChange"
                            class="avatar-input" />
                    </div>
                </div>
                <h3 class="profile-name">{{ user.firstName }} {{ user.lastName }}</h3>
                <p class="profile-company">{{ user.company }}</p>
            </div>

            <div class="profile-nav">
                <button v-for="section in sections" :key="section.id" @click="activeSection = section.id"
                    :class="['nav-item', { active: activeSection === section.id }]">
                    <i :class="section.icon"></i>
                    {{ section.name }}
                </button>
            </div>

            <button @click="handleLogout" class="logout-button">
                <i class="fas fa-sign-out-alt"></i>
                Logout
            </button>
        </div>

        <div class="profile-content">
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

                    <div class="form-group">
                        <label for="position" class="form-label">Job Position</label>
                        <input type="text" id="position" v-model="personalInfo.position" class="form-input"
                            :class="{ 'error': errors.position }" placeholder="Enter your job position" />
                        <span v-if="errors.position" class="error-message">{{ errors.position }}</span>
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

            <!-- Company Information Section -->
            <div v-if="activeSection === 'company'" class="profile-section">
                <div class="section-header">
                    <h2>Company Information</h2>
                    <p>Update your company details</p>
                </div>

                <form @submit.prevent="updateCompanyInfo" class="profile-form">
                    <div class="form-group">
                        <label for="companyName" class="form-label">Company Name</label>
                        <input type="text" id="companyName" v-model="companyInfo.name" class="form-input"
                            :class="{ 'error': errors.companyName }" placeholder="Enter your company name" />
                        <span v-if="errors.companyName" class="error-message">{{ errors.companyName }}</span>
                    </div>

                    <div class="form-group">
                        <label for="industry" class="form-label">Industry</label>
                        <select id="industry" v-model="companyInfo.industry" class="form-input"
                            :class="{ 'error': errors.industry }">
                            <option value="" disabled>Select your industry</option>
                            <option value="logistics">Logistics & Transportation</option>
                            <option value="manufacturing">Manufacturing</option>
                            <option value="retail">Retail & E-commerce</option>
                            <option value="healthcare">Healthcare</option>
                            <option value="food">Food & Beverage</option>
                            <option value="other">Other</option>
                        </select>
                        <span v-if="errors.industry" class="error-message">{{ errors.industry }}</span>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label for="size" class="form-label">Company Size</label>
                            <select id="size" v-model="companyInfo.size" class="form-input"
                                :class="{ 'error': errors.size }">
                                <option value="" disabled>Select company size</option>
                                <option value="1-10">1-10 employees</option>
                                <option value="11-50">11-50 employees</option>
                                <option value="51-200">51-200 employees</option>
                                <option value="201-500">201-500 employees</option>
                                <option value="501+">501+ employees</option>
                            </select>
                            <span v-if="errors.size" class="error-message">{{ errors.size }}</span>
                        </div>

                        <div class="form-group">
                            <label for="website" class="form-label">Website</label>
                            <input type="url" id="website" v-model="companyInfo.website" class="form-input"
                                :class="{ 'error': errors.website }" placeholder="https://example.com" />
                            <span v-if="errors.website" class="error-message">{{ errors.website }}</span>
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="address" class="form-label">Address</label>
                        <textarea id="address" v-model="companyInfo.address" class="form-textarea"
                            :class="{ 'error': errors.address }" placeholder="Enter your company address"
                            rows="3"></textarea>
                        <span v-if="errors.address" class="error-message">{{ errors.address }}</span>
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

            <!-- Preferences Section -->
            <div v-if="activeSection === 'preferences'" class="profile-section">
                <div class="section-header">
                    <h2>Account Preferences</h2>
                    <p>Manage your account settings</p>
                </div>

                <form @submit.prevent="updatePreferences" class="profile-form">
                    <div class="form-group">
                        <label class="form-label">Email Notifications</label>
                        <div class="preference-options">
                            <label class="checkbox-container">
                                <input type="checkbox" v-model="preferences.emailShipmentUpdates" />
                                <span class="checkmark"></span>
                                Shipment updates
                            </label>

                            <label class="checkbox-container">
                                <input type="checkbox" v-model="preferences.emailWeeklyReports" />
                                <span class="checkmark"></span>
                                Weekly reports
                            </label>

                            <label class="checkbox-container">
                                <input type="checkbox" v-model="preferences.emailNewFeatures" />
                                <span class="checkmark"></span>
                                New features and updates
                            </label>

                            <label class="checkbox-container">
                                <input type="checkbox" v-model="preferences.emailMarketing" />
                                <span class="checkmark"></span>
                                Marketing and promotional emails
                            </label>
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Dashboard Preferences</label>
                        <div class="preference-options">
                            <label class="checkbox-container">
                                <input type="checkbox" v-model="preferences.showRecentShipments" />
                                <span class="checkmark"></span>
                                Show recent shipments on dashboard
                            </label>

                            <label class="checkbox-container">
                                <input type="checkbox" v-model="preferences.showAnalytics" />
                                <span class="checkmark"></span>
                                Show analytics widgets
                            </label>

                            <label class="checkbox-container">
                                <input type="checkbox" v-model="preferences.enableNotifications" />
                                <span class="checkmark"></span>
                                Enable browser notifications
                            </label>
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="language" class="form-label">Language</label>
                        <select id="language" v-model="preferences.language" class="form-input">
                            <option value="en">English</option>
                            <option value="es">Spanish</option>
                            <option value="fr">French</option>
                            <option value="de">German</option>
                            <option value="zh">Chinese</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="timezone" class="form-label">Timezone</label>
                        <select id="timezone" v-model="preferences.timezone" class="form-input">
                            <option value="UTC-8">Pacific Time (UTC-8)</option>
                            <option value="UTC-5">Eastern Time (UTC-5)</option>
                            <option value="UTC+0">Greenwich Mean Time (UTC+0)</option>
                            <option value="UTC+1">Central European Time (UTC+1)</option>
                            <option value="UTC+8">China Standard Time (UTC+8)</option>
                        </select>
                    </div>

                    <div class="form-actions">
                        <button type="submit" class="save-button" :disabled="isLoading">
                            <span v-if="!isLoading">Save Preferences</span>
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
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import apiClient from '@/api/axios';
import './profileview.css';

// Reactive state
const user = ref({
    firstName: '',
    lastName: '',
    email: '',
    company: '',
    avatar: null,
    phone: '',
    position: '',
    industry: '',
    size: '',
    website: '',
    address: '',
    preferences: {},
    role: '',
});

const sections = ref([
    { id: 'personal', name: 'Personal Information', icon: 'fas fa-user' },
    { id: 'company', name: 'Company Information', icon: 'fas fa-building' },
    { id: 'password', name: 'Password', icon: 'fas fa-lock' },
    { id: 'preferences', name: 'Preferences', icon: 'fas fa-cog' },
]);

const activeSection = ref('personal');

const personalInfo = ref({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    position: '',
});

const companyInfo = ref({
    name: '',
    industry: '',
    size: '',
    website: '',
    address: '',
});

const passwordData = ref({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
});

const preferences = ref({
    emailShipmentUpdates: true,
    emailWeeklyReports: true,
    emailNewFeatures: true,
    emailMarketing: false,
    showRecentShipments: true,
    showAnalytics: true,
    enableNotifications: false,
    language: 'en',
    timezone: 'UTC-5',
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

    // Length check
    if (password.length >= 8) strength += 1;
    if (password.length >= 12) strength += 1;

    // Character variety checks
    if (/[a-z]/.test(password)) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^a-zA-Z0-9]/.test(password)) strength += 1;

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
    return /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,4}[-\s.]?[0-9]{1,9}$/.test(phone);
};

const isValidUrl = (url) => {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
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
        errors.value.phone = 'Please enter a valid phone number';
    }

    return Object.keys(errors.value).length === 0;
};

const validateCompanyInfo = () => {
    errors.value = {};

    if (!companyInfo.value.name.trim()) {
        errors.value.companyName = 'Company name is required';
    }

    if (!companyInfo.value.industry) {
        errors.value.industry = 'Please select an industry';
    }

    if (!companyInfo.value.size) {
        errors.value.size = 'Please select company size';
    }

    if (companyInfo.value.website && !isValidUrl(companyInfo.value.website)) {
        errors.value.website = 'Please enter a valid website URL';
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
    } else if (passwordData.value.newPassword.length < 8) {
        errors.value.newPassword = 'Password must be at least 8 characters';
    } else if (passwordStrength.value < 3) {
        errors.value.newPassword = 'Password is too weak. Use a mix of letters, numbers, and symbols';
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
        const response = await apiClient.get('/users/me');
        const userData = response.data;

        // Update reactive state
        user.value = {
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            email: userData.email || '',
            company: userData.company || '',
            avatar: userData.avatar || null,
            phone: userData.phone || '',
            position: userData.position || '',
            industry: userData.industry || '',
            size: userData.size || '',
            website: userData.website || '',
            address: userData.address || '',
            preferences: userData.preferences || preferences.value,
            role: userData.role || '',
        };

        // Sync form data
        personalInfo.value = {
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            email: userData.email || '',
            phone: userData.phone || '',
            position: userData.position || '',
        };

        companyInfo.value = {
            name: userData.company || '',
            industry: userData.industry || '',
            size: userData.size || '',
            website: userData.website || '',
            address: userData.address || '',
        };

        preferences.value = {
            emailShipmentUpdates: userData.preferences?.emailShipmentUpdates ?? true,
            emailWeeklyReports: userData.preferences?.emailWeeklyReports ?? true,
            emailNewFeatures: userData.preferences?.emailNewFeatures ?? true,
            emailMarketing: userData.preferences?.emailMarketing ?? false,
            showRecentShipments: userData.preferences?.showRecentShipments ?? true,
            showAnalytics: userData.preferences?.showAnalytics ?? true,
            enableNotifications: userData.preferences?.enableNotifications ?? false,
            language: userData.preferences?.language ?? 'en',
            timezone: userData.preferences?.timezone ?? 'UTC-5',
        };

        // Update auth store
        authStore.setAuthData({
            token: authStore.token,
            user: userData,
            rememberMe: !!localStorage.getItem('authToken'),
        });
    } catch (error) {
        updateError.value = error.response?.data?.message || 'Failed to fetch profile data. Please try again.';
        console.error('Fetch profile error:', error);
    } finally {
        isLoading.value = false;
    }
};

const handleAvatarChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Client-side validation
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

        const response = await apiClient.post('/users/avatar', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });

        user.value.avatar = response.data.avatar;
        authStore.setAuthData({
            token: authStore.token,
            user: { ...authStore.getUser, avatar: response.data.avatar },
            rememberMe: !!localStorage.getItem('authToken'),
        });

        updateSuccess.value = 'Profile picture updated successfully';
    } catch (error) {
        updateError.value = error.response?.data?.message || 'Failed to update profile picture. Please try again.';
        console.error('Avatar upload error:', error);
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
        const response = await apiClient.patch('/users/update', {
            firstName: personalInfo.value.firstName,
            lastName: personalInfo.value.lastName,
            phone: personalInfo.value.phone,
            position: personalInfo.value.position,
        });

        // Update reactive state
        user.value.firstName = personalInfo.value.firstName;
        user.value.lastName = personalInfo.value.lastName;
        user.value.phone = personalInfo.value.phone;
        user.value.position = personalInfo.value.position;

        // Update auth store
        authStore.setAuthData({
            token: authStore.token,
            user: { ...authStore.getUser, ...response.data },
            rememberMe: !!localStorage.getItem('authToken'),
        });

        updateSuccess.value = 'Personal information updated successfully';
    } catch (error) {
        updateError.value = error.response?.data?.message || 'Failed to update personal information. Please try again.';
        if (error.response?.data?.errors) {
            error.response.data.errors.forEach((err) => {
                errors.value[err.param] = err.msg;
            });
        }
        console.error('Update personal info error:', error);
    } finally {
        isLoading.value = false;
    }
};

const updateCompanyInfo = async () => {
    if (!validateCompanyInfo()) return;

    isLoading.value = true;
    updateError.value = '';
    updateSuccess.value = '';

    try {
        const response = await apiClient.patch('/users/update', {
            company: companyInfo.value.name,
            industry: companyInfo.value.industry,
            size: companyInfo.value.size,
            website: companyInfo.value.website,
            address: companyInfo.value.address,
        });

        // Update reactive state
        user.value.company = companyInfo.value.name;
        user.value.industry = companyInfo.value.industry;
        user.value.size = companyInfo.value.size;
        user.value.website = companyInfo.value.website;
        user.value.address = companyInfo.value.address;

        // Update auth store
        authStore.setAuthData({
            token: authStore.token,
            user: { ...authStore.getUser, ...response.data },
            rememberMe: !!localStorage.getItem('authToken'),
        });

        updateSuccess.value = 'Company information updated successfully';
    } catch (error) {
        updateError.value = error.response?.data?.message || 'Failed to update company information. Please try again.';
        if (error.response?.data?.errors) {
            error.response.data.errors.forEach((err) => {
                errors.value[err.param] = err.msg;
            });
        }
        console.error('Update company info error:', error);
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
        await apiClient.patch('/auth/change-password', {
            currentPassword: passwordData.value.currentPassword,
            newPassword: passwordData.value.newPassword,
        });

        updateSuccess.value = 'Password updated successfully';
        passwordData.value = {
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        };
    } catch (error) {
        updateError.value = error.response?.data?.message || 'Failed to update password. Please try again.';
        if (error.response?.data?.errors) {
            error.response.data.errors.forEach((err) => {
                errors.value[err.param] = err.msg;
            });
        }
        console.error('Update password error:', error);
    } finally {
        isLoading.value = false;
    }
};

const updatePreferences = async () => {
    isLoading.value = true;
    updateError.value = '';
    updateSuccess.value = '';

    try {
        const response = await apiClient.patch('/users/update', {
            preferences: preferences.value,
        });

        // Update reactive state
        user.value.preferences = preferences.value;

        // Update auth store
        authStore.setAuthData({
            token: authStore.token,
            user: { ...authStore.getUser, ...response.data },
            rememberMe: !!localStorage.getItem('authToken'),
        });

        updateSuccess.value = 'Preferences updated successfully';
    } catch (error) {
        updateError.value = error.response?.data?.message || 'Failed to update preferences. Please try again.';
        console.error('Update preferences error:', error);
    } finally {
        isLoading.value = false;
    }
};

const handleLogout = () => {
    router.push('/logout');
};

// Fetch user data on mount and check admin role
onMounted(async () => {
    if (authStore.isAuthenticated) {
        const user = authStore.getUser;
        if (user && user.role === 'admin') {
            await fetchUserProfile();
        } else {
            authStore.logout();
            router.push('/login');
        }
    } else {
        router.push('/login');
    }
});
</script>

