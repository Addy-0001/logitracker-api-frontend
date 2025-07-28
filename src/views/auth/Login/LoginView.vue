<template>
    <div class="login-container">
        <div class="login-card">
            <div class="login-header">
                <img src="/logo.png" alt="LogiTracker Logo" class="login-logo" />
                <h1 class="login-title">Welcome Back</h1>
                <p class="login-subtitle">Sign in to your LogiTracker account</p>
            </div>

            <form @submit.prevent="handleLogin" class="login-form">
                <div class="form-group">
                    <label for="email" class="form-label">Email Address</label>
                    <input type="email" id="email" v-model="formData.email" class="form-input"
                        :class="{ 'error': errors.email }" placeholder="Enter your email" required />
                    <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
                </div>

                <div class="form-group">
                    <label for="password" class="form-label">Password</label>
                    <div class="password-input-container">
                        <input :type="showPassword ? 'text' : 'password'" id="password" v-model="formData.password"
                            class="form-input" :class="{ 'error': errors.password }" placeholder="Enter your password"
                            required />
                        <button type="button" @click="togglePasswordVisibility" class="password-toggle">
                            <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                        </button>
                    </div>
                    <span v-if="errors.password" class="error-message">{{ errors.password }}</span>
                </div>

                <div class="form-options">
                    <label class="checkbox-container">
                        <input type="checkbox" v-model="rememberMe" />
                        <span class="checkmark"></span>
                        Remember me
                    </label>
                    <a href="#" class="forgot-password">Forgot Password?</a>
                </div>

                <button type="submit" class="login-button" :disabled="isLoading" :class="{ 'loading': isLoading }">
                    <span v-if="!isLoading">Sign In</span>
                    <span v-else class="loading-spinner">
                        <i class="fas fa-spinner fa-spin"></i>
                        Signing In...
                    </span>
                </button>

                <div v-if="loginError" class="login-error">
                    <i class="fas fa-exclamation-circle"></i>
                    {{ loginError }}
                </div>
            </form>

            <div class="login-footer">
                <p>Don't have an account? <RouterLink to="/register" class="signup-link">Sign up here</RouterLink>
                </p>
            </div>
        </div>
    </div>
</template>

<script>
import './LoginView.css';
import { RouterLink } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import apiClient from '@/api/axios';

export default {
    name: 'LoginPage',
    data() {
        return {
            formData: {
                email: '',
                password: ''
            },
            errors: {},
            showPassword: false,
            rememberMe: false,
            isLoading: false,
            loginError: ''
        }
    },
    methods: {
        validateForm() {
            this.errors = {};

            // Email validation
            if (!this.formData.email) {
                this.errors.email = 'Email is required';
            } else if (!this.isValidEmail(this.formData.email)) {
                this.errors.email = 'Please enter a valid email address';
            }

            // Password validation
            if (!this.formData.password) {
                this.errors.password = 'Password is required';
            }

            return Object.keys(this.errors).length === 0;
        },

        isValidEmail(email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(email);
        },

        togglePasswordVisibility() {
            this.showPassword = !this.showPassword;
        },

        async handleLogin() {
            this.loginError = '';

            if (!this.validateForm()) {
                return;
            }

            this.isLoading = true;

            try {
                const response = await this.authenticateUser(this.formData);

                // Update Pinia store with auth data
                const authStore = useAuthStore();
                authStore.setAuthData({
                    token: response.token,
                    user: {
                        email: this.formData.email,
                        role: 'admin' // Backend ensures admin role
                    },
                    rememberMe: this.rememberMe
                });

                // Emit login success event
                this.$emit('login-success', {
                    email: this.formData.email,
                    rememberMe: this.rememberMe
                });

                // Redirect to dashboard
                this.$router.push('/');

            } catch (error) {
                // Handle specific errors
                if (error.response && error.response.data && error.response.data.message) {
                    const message = error.response.data.message;
                    if (message === 'Invalid credentials') {
                        this.loginError = 'Incorrect email or password. Please try again.';
                    } else if (message === 'Unauthorized Access') {
                        this.loginError = 'Only administrators are allowed to log in.';
                    } else {
                        this.loginError = message;
                    }
                } else {
                    this.loginError = 'An error occurred. Please try again later.';
                }
            } finally {
                this.isLoading = false;
            }
        },

        async authenticateUser(credentials) {
            const response = await apiClient.post('/auth/admin-login', {
                email: credentials.email,
                password: credentials.password
            });
            return response.data; // { success, message, token }
        }
    },

    mounted() {
        // Clear any existing errors when component mounts
        this.errors = {};
        this.loginError = '';

        // Check if user is authenticated and redirect if logged in
        const authStore = useAuthStore();
        if (authStore.isAuthenticated) {
            this.$router.push('/');
        }
    }
}
</script>