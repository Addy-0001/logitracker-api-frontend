<template>
    <div class="user-management-container" style="padding-bottom: 100px;">
        <!-- Page Header -->
        <div class="page-header">
            <div class="header-content">
                <div class="header-title">
                    <h1>User Management</h1>
                    <p>Manage drivers, dispatchers, and system users</p>
                </div>
                <div class="header-actions">
                    <button class="export-btn" @click="exportUsers">
                        <i class="fas fa-download"></i>
                        Export Users
                    </button>
                    <button class="add-user-btn" @click="openAddUserModal">
                        <i class="fas fa-user-plus"></i>
                        Add User
                    </button>
                </div>
            </div>
        </div>

        <!-- User Statistics -->
        <div class="stats-section">
            <div class="stats-cards">
                <div class="stat-card">
                    <div class="stat-icon total">
                        <i class="fas fa-users"></i>
                    </div>
                    <div class="stat-content">
                        <h3>{{ userStats.total }}</h3>
                        <p>Total Users</p>
                        <span class="stat-trend positive">+{{ userStats.totalChange }}%</span>
                    </div>
                </div>

                <div class="stat-card">
                    <div class="stat-icon drivers">
                        <i class="fas fa-truck"></i>
                    </div>
                    <div class="stat-content">
                        <h3>{{ userStats.drivers }}</h3>
                        <p>Drivers</p>
                        <span class="stat-trend positive">+{{ userStats.driversChange }}%</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Controls Section -->
        <div class="controls-section">
            <div class="search-container">
                <div class="search-input-wrapper">
                    <i class="fas fa-search"></i>
                    <input type="text" v-model="searchQuery" placeholder="Search by name, email, or phone..."
                        class="search-input" @input="fetchUsers" />
                    <button v-if="searchQuery" @click="clearSearch" class="clear-search">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>

            <div class="view-actions">
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

                <div class="bulk-actions" v-if="selectedUsers.length > 0">
                    <span class="selected-count">{{ selectedUsers.length }} selected</span>
                    <button @click="bulkDelete" class="bulk-btn delete">
                        <i class="fas fa-trash"></i>
                        Delete
                    </button>
                </div>
            </div>
        </div>

        <!-- Users Section -->
        <div class="users-section">
            <div v-if="isLoading" class="loading-state">
                <i class="fas fa-spinner fa-spin"></i>
                Loading users...
            </div>
            <div v-else-if="error" class="error-state">
                <i class="fas fa-exclamation-circle"></i>
                {{ error }}
            </div>
            <div v-else-if="filteredUsers.length === 0" class="empty-state">
                <div class="empty-icon">
                    <i class="fas fa-users"></i>
                </div>
                <h3>No users found</h3>
                <p>Try adjusting your search criteria or filters</p>
                <button @click="clearFilters" class="clear-filters-btn">Clear All Filters</button>
            </div>

            <!-- List View -->
            <div v-else-if="viewMode === 'list'" class="users-list">
                <div class="list-header">
                    <div class="header-cell select">
                        <input type="checkbox" @change="toggleSelectAll" :checked="allSelected"
                            :indeterminate="someSelected" />
                    </div>
                    <div class="header-cell user">User</div>
                    <div class="header-cell role">Role</div>
                    <div class="header-cell department">Department</div>
                    <div class="header-cell status">Status</div>
                    <div class="header-cell last-active">Last Active</div>
                    <div class="header-cell actions">Actions</div>
                </div>

                <div v-for="user in paginatedUsers" :key="user._id" class="user-row"
                    :class="{ 'selected': selectedUsers.includes(user._id) }">
                    <div class="user-cell select">
                        <input type="checkbox" :value="user._id" v-model="selectedUsers" />
                    </div>

                    <div class="user-cell user">
                        <div class="user-info">
                            <div class="user-avatar">
                                <img :src="user.avatar ? `http://localhost:5000${user.avatar}` : '/default-avatar.png'"
                                    :alt="user.name" />
                                <span v-if="user.isOnline" class="online-indicator"></span>
                            </div>
                            <div class="user-details">
                                <span class="user-name">{{ user.name }}</span>
                                <span class="user-email">{{ user.email }}</span>
                                <span class="user-phone">{{ user.phone }}</span>
                            </div>
                        </div>
                    </div>

                    <div class="user-cell role">
                        <span :class="['role-badge', user.role]">
                            <i :class="getRoleIcon(user.role)"></i>
                            {{ formatRole(user.role) }}
                        </span>
                    </div>

                    <div class="user-cell department">
                        <span class="department-text">{{ formatDepartment(user.department) }}</span>
                    </div>

                    <div class="user-cell status">
                        <span :class="['status-badge', user.status]">
                            <i :class="getStatusIcon(user.status)"></i>
                            {{ formatStatus(user.status) }}
                        </span>
                    </div>

                    <div class="user-cell last-active">
                        <div class="activity-info">
                            <span class="activity-time">{{ formatLastActive(user.lastActive) }}</span>
                            <span class="activity-device">{{ user.lastDevice }}</span>
                        </div>
                    </div>

                    <div class="user-cell actions">
                        <div class="action-buttons">
                            <button @click="viewUserProfile(user)" class="action-btn view" title="View Profile">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button @click="editUser(user)" class="action-btn edit" title="Edit User">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button @click="showUserMenu(user)" class="action-btn menu" title="More Options">
                                <i class="fas fa-ellipsis-v"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Grid View -->
            <div v-else-if="viewMode === 'grid'" class="users-grid">
                <div v-for="user in paginatedUsers" :key="user._id" class="user-card"
                    :class="{ 'selected': selectedUsers.includes(user._id) }">
                    <div class="card-header">
                        <input type="checkbox" :value="user._id" v-model="selectedUsers" class="card-checkbox" />
                        <span :class="['status-indicator', user.status]"></span>
                    </div>

                    <div class="card-avatar">
                        <img :src="user.avatar ? `http://localhost:5000${user.avatar}` : '/default-avatar.png'"
                            :alt="user.name" />
                        <span v-if="user.isOnline" class="online-indicator"></span>
                    </div>

                    <div class="card-content">
                        <h4 class="user-name">{{ user.name }}</h4>
                        <p class="user-email">{{ user.email }}</p>
                        <p class="user-phone">{{ user.phone }}</p>

                        <div class="user-badges">
                            <span :class="['role-badge', user.role]">
                                <i :class="getRoleIcon(user.role)"></i>
                                {{ formatRole(user.role) }}
                            </span>
                            <span :class="['status-badge', user.status]">
                                {{ formatStatus(user.status) }}
                            </span>
                        </div>

                        <div class="user-meta">
                            <div class="meta-item">
                                <i class="fas fa-building"></i>
                                <span>{{ formatDepartment(user.department) }}</span>
                            </div>
                            <div class="meta-item">
                                <i class="fas fa-clock"></i>
                                <span>{{ formatLastActive(user.lastActive) }}</span>
                            </div>
                        </div>
                    </div>

                    <div class="card-actions">
                        <button @click="viewUserProfile(user)" class="card-action-btn primary">
                            <i class="fas fa-eye"></i>
                            View Profile
                        </button>
                        <button @click="editUser(user)" class="card-action-btn secondary">
                            <i class="fas fa-edit"></i>
                            Edit
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Pagination -->
        <div v-if="filteredUsers.length > 0" class="pagination-section">
            <div class="pagination-info">
                Showing {{ (currentPage - 1) * itemsPerPage + 1 }} to {{ Math.min(currentPage * itemsPerPage,
                    filteredUsers.length) }} of {{ filteredUsers.length }} users
            </div>
            <div class="pagination-controls">
                <button @click="currentPage--" :disabled="currentPage === 1" class="pagination-btn">
                    <i class="fas fa-chevron-left"></i>
                    Previous
                </button>
                <span class="page-numbers">
                    <button v-for="page in visiblePages" :key="page" @click="currentPage = page"
                        :class="['page-btn', { active: currentPage === page }]">
                        {{ page }}
                    </button>
                </span>
                <button @click="currentPage++" :disabled="currentPage === totalPages" class="pagination-btn">
                    Next
                    <i class="fas fa-chevron-right"></i>
                </button>
            </div>
        </div>

        <!-- Add/Edit User Modal -->
        <div v-if="showUserModal" class="modal-overlay" @click="closeUserModal">
            <div class="modal-container" @click.stop>
                <div class="modal-header">
                    <h2>{{ isEditMode ? 'Edit User' : 'Add New User' }}</h2>
                    <button @click="closeUserModal" class="modal-close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>

                <div class="modal-content">
                    <form @submit.prevent="saveUser" class="user-form">
                        <!-- Personal Information -->
                        <div class="form-section">
                            <h3 class="section-title">
                                <i class="fas fa-user"></i>
                                Personal Information
                            </h3>

                            <div class="avatar-section">
                                <div class="avatar-preview">
                                    <img :src="userForm.avatar || '/default-avatar.png'" alt="User Avatar" />
                                    <div class="avatar-upload">
                                        <label for="avatar-input" class="avatar-edit">
                                            <i class="fas fa-camera"></i>
                                        </label>
                                        <input type="file" id="avatar-input" accept="image/*"
                                            @change="handleAvatarChange" class="avatar-input" />
                                    </div>
                                </div>
                            </div>

                            <div class="form-row">
                                <div class="form-group">
                                    <label for="firstName" class="form-label">First Name *</label>
                                    <input type="text" id="firstName" v-model="userForm.firstName" class="form-input"
                                        :class="{ 'error': userErrors.firstName }" placeholder="Enter first name" />
                                    <span v-if="userErrors.firstName" class="error-message">{{ userErrors.firstName
                                    }}</span>
                                </div>

                                <div class="form-group">
                                    <label for="lastName" class="form-label">Last Name *</label>
                                    <input type="text" id="lastName" v-model="userForm.lastName" class="form-input"
                                        :class="{ 'error': userErrors.lastName }" placeholder="Enter last name" />
                                    <span v-if="userErrors.lastName" class="error-message">{{ userErrors.lastName
                                    }}</span>
                                </div>
                            </div>

                            <div class="form-row">
                                <div class="form-group">
                                    <label for="email" class="form-label">Email Address *</label>
                                    <input type="email" id="email" v-model="userForm.email" class="form-input"
                                        :class="{ 'error': userErrors.email }" placeholder="Enter email address"
                                        :disabled="isEditMode" />
                                    <span v-if="userErrors.email" class="error-message">{{ userErrors.email }}</span>
                                </div>

                                <div class="form-group">
                                    <label for="phone" class="form-label">Phone Number *</label>
                                    <input type="tel" id="phone" v-model="userForm.phone" class="form-input"
                                        :class="{ 'error': userErrors.phone }" placeholder="Enter phone number" />
                                    <span v-if="userErrors.phone" class="error-message">{{ userErrors.phone }}</span>
                                </div>
                            </div>
                        </div>

                        <!-- Role & Department -->
                        <div class="form-section">
                            <h3 class="section-title">
                                <i class="fas fa-user-tag"></i>
                                Role & Department
                            </h3>

                            <div class="form-row">
                                <div class="form-group">
                                    <label for="role" class="form-label">Role *</label>
                                    <select id="role" v-model="userForm.role" class="form-input"
                                        :class="{ 'error': userErrors.role }">
                                        <option value="" disabled>Select role</option>
                                        <option value="admin">Administrator</option>
                                        <option value="driver">Driver</option>
                                    </select>
                                    <span v-if="userErrors.role" class="error-message">{{ userErrors.role }}</span>
                                </div>

                                <div class="form-group">
                                    <label for="company" class="form-label">Company *</label>
                                    <input type="text" id="company" v-model="userForm.company" class="form-input"
                                        :class="{ 'error': userErrors.company }" placeholder="Enter company name" />
                                    <span v-if="userErrors.company" class="error-message">{{ userErrors.company
                                    }}</span>
                                </div>
                            </div>
                        </div>

                        <!-- Password Section -->
                        <div v-if="!isEditMode" class="form-section">
                            <h3 class="section-title">
                                <i class="fas fa-lock"></i>
                                Account Security
                            </h3>

                            <div class="form-row">
                                <div class="form-group">
                                    <label for="password" class="form-label">Password *</label>
                                    <div class="password-input-container">
                                        <input :type="showPassword ? 'text' : 'password'" id="password"
                                            v-model="userForm.password" class="form-input"
                                            :class="{ 'error': userErrors.password }" placeholder="Enter password" />
                                        <button type="button" @click="showPassword = !showPassword"
                                            class="password-toggle">
                                            <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                                        </button>
                                    </div>
                                    <span v-if="userErrors.password" class="error-message">{{ userErrors.password
                                    }}</span>
                                </div>

                                <div class="form-group">
                                    <label for="confirmPassword" class="form-label">Confirm Password *</label>
                                    <input type="password" id="confirmPassword" v-model="userForm.confirmPassword"
                                        class="form-input" :class="{ 'error': userErrors.confirmPassword }"
                                        placeholder="Confirm password" />
                                    <span v-if="userErrors.confirmPassword" class="error-message">{{
                                        userErrors.confirmPassword }}</span>
                                </div>
                            </div>
                        </div>

                        <!-- Form Messages -->
                        <div v-if="userFormSuccess" class="form-success">
                            <i class="fas fa-check-circle"></i>
                            {{ userFormSuccess }}
                        </div>

                        <div v-if="userFormError" class="form-error">
                            <i class="fas fa-exclamation-circle"></i>
                            {{ userFormError }}
                        </div>

                        <!-- Form Actions -->
                        <div class="form-actions">
                            <button type="button" @click="closeUserModal" class="cancel-btn">
                                Cancel
                            </button>
                            <button type="submit" class="save-btn" :disabled="isSavingUser">
                                <span v-if="!isSavingUser">
                                    <i class="fas fa-save"></i>
                                    {{ isEditMode ? 'Update User' : 'Create User' }}
                                </span>
                                <span v-else class="loading-spinner">
                                    <i class="fas fa-spinner fa-spin"></i>
                                    {{ isEditMode ? 'Updating...' : 'Creating...' }}
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
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import apiClient from '@/api/axios';

export default {
    name: 'UserManagement',
    setup() {
        const router = useRouter();
        const authStore = useAuthStore();

        const searchQuery = ref('');
        const selectedRole = ref('');
        const selectedStatus = ref('');
        const selectedDepartment = ref('');
        const viewMode = ref('grid');
        const currentPage = ref(1);
        const itemsPerPage = ref(10);
        const selectedUsers = ref([]);
        const showUserModal = ref(false);
        const isEditMode = ref(false);
        const isSavingUser = ref(false);
        const userFormSuccess = ref('');
        const userFormError = ref('');
        const showPassword = ref(false);
        const isLoading = ref(false);
        const error = ref('');
        const users = ref([]);
        const userStats = ref({
            total: 0,
            totalChange: 0,
            drivers: 0,
            driversChange: 0,
            dispatchers: 0,
            dispatchersChange: 0,
            active: 0,
            activeChange: 0,
        });

        const userForm = ref({
            _id: '',
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            role: '',
            company: '',
            avatar: null,
            avatarFile: null,
            password: '',
            confirmPassword: '',
        });

        const userErrors = ref({});

        const fetchUsers = async () => {
            isLoading.value = true;
            error.value = '';
            try {
                const params = {};
                if (searchQuery.value) params.search = searchQuery.value;
                if (selectedRole.value && ['admin', 'driver'].includes(selectedRole.value)) {
                    params.role = selectedRole.value;
                }

                const response = await apiClient.get('users/users', { params });
                users.value = response.data.users.map(user => ({
                    ...user,
                    firstName: user.firstName || '',
                    lastName: user.lastName || '',
                    email: user.email || '',
                    phone: user.phone || '',
                    role: user.role || '',
                    company: user.company || '',
                    avatar: user.avatar || null,
                    name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown',
                    status: 'active', // Mock status
                    department: '', // Mock department
                    isOnline: false, // Mock online status
                    lastActive: null, // Mock last active
                    lastDevice: '', // Mock last device
                }));
                userStats.value = {
                    ...response.data.stats,
                    totalChange: 0,
                    driversChange: 0,
                    dispatchersChange: 0,
                    activeChange: 0,
                };
            } catch (err) {
                error.value = err.response?.data?.message || 'Failed to fetch users';
                if (err.response?.status === 401 || err.response?.status === 403) {
                    authStore.logout();
                    router.push('/login');
                }
            } finally {
                isLoading.value = false;
            }
        };

        const filteredUsers = computed(() => {
            let filtered = [...users.value];
            if (selectedRole.value && !['admin', 'driver'].includes(selectedRole.value)) {
                filtered = filtered.filter(user => user.role === selectedRole.value);
            }
            if (selectedStatus.value) {
                filtered = filtered.filter(user => user.status === selectedStatus.value);
            }
            if (selectedDepartment.value) {
                filtered = filtered.filter(user => user.department === selectedDepartment.value);
            }
            return filtered;
        });

        const paginatedUsers = computed(() => {
            const start = (currentPage.value - 1) * itemsPerPage.value;
            const end = start + itemsPerPage.value;
            return filteredUsers.value.slice(start, end);
        });

        const totalPages = computed(() => Math.ceil(filteredUsers.value.length / itemsPerPage.value));

        const visiblePages = computed(() => {
            const pages = [];
            const start = Math.max(1, currentPage.value - 2);
            const end = Math.min(totalPages.value, currentPage.value + 2);
            for (let i = start; i <= end; i++) {
                pages.push(i);
            }
            return pages;
        });

        const allSelected = computed(() =>
            paginatedUsers.value.length > 0 &&
            paginatedUsers.value.every(user => selectedUsers.value.includes(user._id))
        );

        const someSelected = computed(() => selectedUsers.value.length > 0 && !allSelected.value);

        const clearSearch = () => {
            searchQuery.value = '';
            fetchUsers();
        };

        const clearFilters = () => {
            searchQuery.value = '';
            selectedRole.value = '';
            selectedStatus.value = '';
            selectedDepartment.value = '';
            fetchUsers();
        };

        const toggleSelectAll = () => {
            if (allSelected.value) {
                selectedUsers.value = selectedUsers.value.filter(
                    id => !paginatedUsers.value.some(user => user._id === id)
                );
            } else {
                const newSelections = paginatedUsers.value
                    .filter(user => !selectedUsers.value.includes(user._id))
                    .map(user => user._id);
                selectedUsers.value.push(...newSelections);
            }
        };

        const getRoleIcon = role => ({
            admin: 'fas fa-user-shield',
            driver: 'fas fa-truck',
            dispatcher: 'fas fa-headset',
            customer: 'fas fa-user',
        }[role] || 'fas fa-user');

        const getStatusIcon = status => ({
            active: 'fas fa-check-circle',
            inactive: 'fas fa-times-circle',
            pending: 'fas fa-clock',
            suspended: 'fas fa-ban',
        }[status] || 'fas fa-circle');

        const formatRole = role => ({
            admin: 'Administrator',
            driver: 'Driver',
            dispatcher: 'Dispatcher',
            customer: 'Customer',
        }[role] || role);

        const formatStatus = status => status.charAt(0).toUpperCase() + status.slice(1);

        const formatDepartment = department => ({
            operations: 'Operations',
            logistics: 'Logistics',
            'customer-service': 'Customer Service',
            management: 'Management',
        }[department] || department || 'N/A');

        const formatLastActive = () => 'N/A'; // Mocked as no lastActive field

        const openAddUserModal = () => {
            isEditMode.value = false;
            resetUserForm();
            showUserModal.value = true;
        };

        const editUser = user => {
            isEditMode.value = true;
            userForm.value = {
                _id: user._id || '',
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                email: user.email || '',
                phone: user.phone || '',
                role: user.role || '',
                company: user.company || '',
                avatar: user.avatar || null,
                avatarFile: null,
                password: '',
                confirmPassword: '',
            };
            showUserModal.value = true;
        };

        const closeUserModal = () => {
            showUserModal.value = false;
            resetUserForm();
        };

        const resetUserForm = () => {
            userForm.value = {
                _id: '',
                firstName: '',
                lastName: '',
                email: '',
                phone: '',
                role: '',
                company: '',
                avatar: null,
                avatarFile: null,
                password: '',
                confirmPassword: '',
            };
            userErrors.value = {};
            userFormSuccess.value = '';
            userFormError.value = '';
        };

        const validateUserForm = () => {
            userErrors.value = {};

            // Defensive checks to prevent undefined errors
            const firstName = userForm.value.firstName || '';
            const lastName = userForm.value.lastName || '';
            const email = userForm.value.email || '';
            const phone = userForm.value.phone || '';
            const company = userForm.value.company || '';

            if (!firstName.trim()) userErrors.value.firstName = 'First name is required';
            else if (firstName.trim().length < 2) userErrors.value.firstName = 'First name must be at least 2 characters';
            if (!lastName.trim()) userErrors.value.lastName = 'Last name is required';
            else if (lastName.trim().length < 2) userErrors.value.lastName = 'Last name must be at least 2 characters';
            if (!email.trim()) {
                userErrors.value.email = 'Email is required';
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                userErrors.value.email = 'Please enter a valid email address';
            }
            if (!phone.trim()) {
                userErrors.value.phone = 'Phone number is required';
            } else if (!/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,4}[-\s.]?[0-9]{1,9}$/.test(phone)) {
                userErrors.value.phone = 'Please enter a valid phone number';
            }
            if (!userForm.value.role) userErrors.value.role = 'Role is required';
            if (!company.trim()) userErrors.value.company = 'Company is required';

            if (!isEditMode.value) {
                if (!userForm.value.password) {
                    userErrors.value.password = 'Password is required';
                } else if (userForm.value.password.length < 8) {
                    userErrors.value.password = 'Password must be at least 8 characters';
                }
                if (!userForm.value.confirmPassword) {
                    userErrors.value.confirmPassword = 'Please confirm password';
                } else if (userForm.value.password !== userForm.value.confirmPassword) {
                    userErrors.value.confirmPassword = 'Passwords do not match';
                }
            }

            return Object.keys(userErrors.value).length === 0;
        };

        const handleAvatarChange = async event => {
            const file = event.target.files[0];
            if (!file) return;

            if (!file.type.match('image.*')) {
                userFormError.value = 'Please select an image file';
                return;
            }

            if (file.size > 5 * 1024 * 1024) {
                userFormError.value = 'Image size should not exceed 5MB';
                return;
            }

            userForm.value.avatarFile = file;
            const reader = new FileReader();
            reader.onload = e => {
                userForm.value.avatar = e.target.result;
            };
            reader.readAsDataURL(file);
        };

        const saveUser = async () => {
            if (!validateUserForm()) return;

            isSavingUser.value = true;
            userFormError.value = '';
            userFormSuccess.value = '';

            try {
                let avatarUrl = userForm.value.avatar;
                if (userForm.value.avatarFile) {
                    const formData = new FormData();
                    formData.append('avatar', userForm.value.avatarFile);
                    if (isEditMode.value) {
                        formData.append('userId', userForm.value._id);
                    }
                    const response = await apiClient.post('/users/avatar', formData, {
                        headers: { 'Content-Type': 'multipart/form-data' },
                    });
                    avatarUrl = response.data.avatar;
                }

                const userData = {
                    firstName: userForm.value.firstName,
                    lastName: userForm.value.lastName,
                    email: userForm.value.email,
                    phone: userForm.value.phone,
                    role: userForm.value.role,
                    company: userForm.value.company,
                    ...(avatarUrl && { avatar: avatarUrl }),
                };

                if (isEditMode.value) {
                    // Update user
                    const formData = new FormData();
                    Object.entries(userData).forEach(([key, value]) => {
                        formData.append(key, value);
                    });
                    formData.append('_id', userForm.value._id);
                    await apiClient.patch('/users/update', formData, {
                        headers: { 'Content-Type': 'multipart/form-data' },
                    });
                    userFormSuccess.value = 'User updated successfully';
                } else {
                    // Create new user
                    userData.password = userForm.value.password;
                    await apiClient.post('/auth/signup', userData);
                    userFormSuccess.value = 'User created successfully';
                }

                await fetchUsers();
                setTimeout(() => {
                    closeUserModal();
                }, 2000);
            } catch (err) {
                console.error('Save user error:', {
                    message: err.message,
                    response: err.response?.data,
                    status: err.response?.status,
                });
                userFormError.value = err.response?.data?.message || 'Failed to save user';
                if (err.response?.data?.errors) {
                    err.response.data.errors.forEach(error => {
                        userErrors.value[error.param] = error.msg;
                    });
                }
                if (err.response?.status === 401 || err.response?.status === 403) {
                    authStore.logout();
                    router.push('/login');
                }
            } finally {
                isSavingUser.value = false;
            }
        };

        const viewUserProfile = user => {
            router.push(`/profile/${user._id}`);
        };

        const showUserMenu = user => {
            console.log('Showing user menu:', user._id);
        };

        const bulkDelete = async () => {
            if (!confirm(`Are you sure you want to delete ${selectedUsers.value.length} users?`)) return;
            try {
                await apiClient.delete('/users/bulk-delete', { data: { userIds: selectedUsers.value } });
                await fetchUsers();
                selectedUsers.value = [];
            } catch (err) {
                error.value = err.response?.data?.message || 'Failed to delete users';
            }
        };

        const exportUsers = async () => {
            try {
                const response = await apiClient.get('/users/export', { responseType: 'blob' });
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', 'users.csv');
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } catch (err) {
                error.value = err.response?.data?.message || 'Failed to export users';
            }
        };

        onMounted(() => {
            if (!authStore.isAuthenticated || authStore.getUser?.role !== 'admin') {
                error.value = 'Admin access required';
                authStore.logout();
                router.push('/login');
                return;
            }
            fetchUsers();
        });

        return {
            searchQuery,
            selectedRole,
            selectedStatus,
            selectedDepartment,
            viewMode,
            currentPage,
            itemsPerPage,
            selectedUsers,
            showUserModal,
            isEditMode,
            isSavingUser,
            userFormSuccess,
            userFormError,
            showPassword,
            isLoading,
            error,
            users,
            userStats,
            userForm,
            userErrors,
            filteredUsers,
            paginatedUsers,
            totalPages,
            visiblePages,
            allSelected,
            someSelected,
            clearSearch,
            clearFilters,
            toggleSelectAll,
            getRoleIcon,
            getStatusIcon,
            formatRole,
            formatStatus,
            formatDepartment,
            formatLastActive,
            openAddUserModal,
            editUser,
            closeUserModal,
            resetUserForm,
            validateUserForm,
            handleAvatarChange,
            saveUser,
            viewUserProfile,
            showUserMenu,
            bulkDelete,
            exportUsers,
        };
    },
};
</script>

<style scoped>
@import './User.css';
</style>