<template>
    <div class="signup-container">
        <div class="signup-card">
            <div class="signup-header">
                <img src="/logo.png" alt="LogiTracker Logo" class="signup-logo" />
                <h1 class="signup-title">Create Account</h1>
                <p class="signup-subtitle">Join LogiTracker and streamline your logistics</p>
            </div>

            <form @submit.prevent="handleSignup" class="signup-form">
                <div class="form-row">
                    <div class="form-group">
                        <label for="firstName" class="form-label">First Name</label>
                        <input type="text" id="firstName" v-model="formData.firstName" class="form-input"
                            :class="{ 'error': errors.firstName }" placeholder="Enter your first name" required />
                        <span v-if="errors.firstName" class="error-message">{{ errors.firstName }}</span>
                    </div>

                    <div class="form-group">
                        <label for="lastName" class="form-label">Last Name</label>
                        <input type="text" id="lastName" v-model="formData.lastName" class="form-input"
                            :class="{ 'error': errors.lastName }" placeholder="Enter your last name" required />
                        <span v-if="errors.lastName" class="error-message">{{ errors.lastName }}</span>
                    </div>
                </div>

                <div class="form-group">
                    <label for="email" class="form-label">Email Address</label>
                    <input type="email" id="email" v-model="formData.email" class="form-input"
                        :class="{ 'error': errors.email }" placeholder="Enter your email address" required />
                    <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
                </div>

                <div class="form-group">
                    <label for="phone" class="form-label">Phone Number</label>
                    <input type="tel" id="phone" v-model="formData.phone" class="form-input"
                        :class="{ 'error': errors.phone }" placeholder="Enter your phone number" required />
                    <span v-if="errors.phone" class="error-message">{{ errors.phone }}</span>
                </div>

                <div class="form-group">
                    <label for="password" class="form-label">Password</label>
                    <div class="password-input-container">
                        <input :type="showPassword ? 'text' : 'password'" id="password" v-model="formData.password"
                            class="form-input" :class="{ 'error': errors.password }" placeholder="Create a password"
                            required />
                        <button type="button" @click="togglePasswordVisibility" class="password-toggle">
                            <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                        </button>
                    </div>
                    <div class="password-strength">
                        <div class="strength-bar">
                            <div class="strength-fill" :class="passwordStrengthClass"
                                :style="{ width: passwordStrengthWidth }"></div>
                        </div>
                        <span class="strength-text">{{ passwordStrengthText }}</span>
                    </div>
                    <span v-if="errors.password" class="error-message">{{ errors.password }}</span>
                </div>

                <div class="form-group">
                    <label for="confirmPassword" class="form-label">Confirm Password</label>
                    <div class="password-input-container">
                        <input :type="showConfirmPassword ? 'text' : 'password'" id="confirmPassword"
                            v-model="formData.confirmPassword" class="form-input"
                            :class="{ 'error': errors.confirmPassword }" placeholder="Confirm your password" required />
                        <button type="button" @click="toggleConfirmPasswordVisibility" class="password-toggle">
                            <i :class="showConfirmPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                        </button>
                    </div>
                    <span v-if="errors.confirmPassword" class="error-message">{{ errors.confirmPassword }}</span>
                </div>

                <div class="form-group">
                    <label class="checkbox-container">
                        <input type="checkbox" v-model="agreeToTerms" />
                        <span class="checkmark"></span>
                        I agree to the <a href="#" class="terms-link">Terms of Service</a> and <a href="#"
                            class="terms-link">Privacy Policy</a>
                    </label>
                    <span v-if="errors.terms" class="error-message">{{ errors.terms }}</span>
                </div>

                <div class="form-group">
                    <label class="checkbox-container">
                        <input type="checkbox" v-model="subscribeNewsletter" />
                        <span class="checkmark"></span>
                        Subscribe to our newsletter for updates and tips
                    </label>
                </div>

                <button type="submit" class="signup-button" :disabled="isLoading" :class="{ 'loading': isLoading }">
                    <span v-if="!isLoading">Create Account</span>
                    <span v-else class="loading-spinner">
                        <i class="fas fa-spinner fa-spin"></i>
                        Creating Account...
                    </span>
                </button>

                <div v-if="signupError" class="signup-error">
                    <i class="fas fa-exclamation-circle"></i>
                    {{ signupError }}
                </div>

                <div v-if="signupSuccess" class="signup-success">
                    <i class="fas fa-check-circle"></i>
                    {{ signupSuccess }}
                </div>
            </form>

            <div class="signup-footer">
                <p>Already have an account? <RouterLink to="/login" class="login-link">Sign in here</RouterLink>
                </p>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, defineEmits, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import apiClient from '@/api/axios';
import './SignupView.css';
import { RouterLink } from 'vue-router';

// Define custom events
const emit = defineEmits(['signup-success']);

// Reactive state
const formData = ref({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
});

const errors = ref({});
const showPassword = ref(false);
const showConfirmPassword = ref(false);
const agreeToTerms = ref(false);
const subscribeNewsletter = ref(false);
const isLoading = ref(false);
const signupError = ref('');
const signupSuccess = ref('');

const router = useRouter();
const authStore = useAuthStore();

// Computed properties
const passwordStrength = computed(() => {
    const password = formData.value.password;
    if (!password) return 0;

    let strength = 0;

    // Length check
    if (password.length >= 8) strength += 1;
    if (password.length >= 12) strength += 1;

    // Character variety checks
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
    if (!formData.value.password) return '';
    if (strength <= 1) return 'Weak';
    if (strength <= 3) return 'Medium';
    return 'Strong';
});

// Methods
const validateForm = () => {
    errors.value = {};

    // First name validation
    if (!formData.value.firstName.trim()) {
        errors.value.firstName = 'First name is required';
    } else if (formData.value.firstName.trim().length < 2) {
        errors.value.firstName = 'First name must be at least 2 characters';
    }

    // Last name validation
    if (!formData.value.lastName.trim()) {
        errors.value.lastName = 'Last name is required';
    } else if (formData.value.lastName.trim().length < 2) {
        errors.value.lastName = 'Last name must be at least 2 characters';
    }

    // Email validation
    if (!formData.value.email) {
        errors.value.email = 'Email is required';
    } else if (!isValidEmail(formData.value.email)) {
        errors.value.email = 'Please enter a valid email address';
    }

    // Phone validation
    if (!formData.value.phone.trim()) {
        errors.value.phone = 'Phone number is required';
    } else if (!isValidPhone(formData.value.phone)) {
        errors.value.phone = 'Please enter a valid phone number';
    }

    // Password validation
    if (!formData.value.password) {
        errors.value.password = 'Password is required';
    } else if (formData.value.password.length < 8) {
        errors.value.password = 'Password must be at least 8 characters';
    } else if (!/[a-z]/.test(formData.value.password)) {
        errors.value.password = 'Password must contain at least one lowercase letter';
    } else if (!/[A-Z]/.test(formData.value.password)) {
        errors.value.password = 'Password must contain at least one uppercase letter';
    } else if (!/[0-9]/.test(formData.value.password)) {
        errors.value.password = 'Password must contain at least one number';
    } else if (!/[!@#$%^&*]/.test(formData.value.password)) {
        errors.value.password = 'Password must contain at least one special character';
    }

    // Confirm password validation
    if (!formData.value.confirmPassword) {
        errors.value.confirmPassword = 'Please confirm your password';
    } else if (formData.value.password !== formData.value.confirmPassword) {
        errors.value.confirmPassword = 'Passwords do not match';
    }

    // Terms agreement validation
    if (!agreeToTerms.value) {
        errors.value.terms = 'You must agree to the Terms of Service and Privacy Policy';
    }

    return Object.keys(errors.value).length === 0;
};

const isValidEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
};

const isValidPhone = (phone) => {
    const regex = /^\+?[1-9]\d{1,14}$/;
    return regex.test(phone);
};

const togglePasswordVisibility = () => {
    showPassword.value = !showPassword.value;
};

const toggleConfirmPasswordVisibility = () => {
    showConfirmPassword.value = !showConfirmPassword.value;
};

const handleSignup = async () => {
    signupError.value = '';
    signupSuccess.value = '';

    if (!validateForm()) {
        return;
    }

    isLoading.value = true;

    try {
        const response = await registerUser({
            firstName: formData.value.firstName,
            lastName: formData.value.lastName,
            email: formData.value.email,
            phone: formData.value.phone,
            password: formData.value.password,
            confirmPassword: formData.value.confirmPassword,
            role: 'driver'
        });

        console.log('Signup response:', {
            status: response.status,
            data: response.data,
        });

        // Set success message
        signupSuccess.value = 'Account created successfully! Redirecting to login...';

        // Emit signup success event
        emit('signup-success', {
            email: formData.value.email,
            firstName: formData.value.firstName,
            lastName: formData.value.lastName,
            phone: formData.value.phone,
            subscribeNewsletter: subscribeNewsletter.value,
        });

        // Reset form and redirect to login after a brief delay
        setTimeout(() => {
            resetForm();
            router.push('/login');
        }, 2000);
    } catch (error) {
        console.error('Signup error:', {
            message: error.message,
            response: error.response
                ? {
                    status: error.response.status,
                    data: error.response.data,
                }
                : null,
        });

        // Handle backend errors
        if (error.response && error.response.data) {
            const { message, errors } = error.response.data;
            if (message === 'User already exists') {
                signupError.value = 'An account with this email already exists.';
            } else if (message === 'Phone number is already used') {
                signupError.value = 'This phone number is already in use.';
            } else if (errors && Array.isArray(errors)) {
                errors.forEach((err) => {
                    errors.value[err.param] = err.msg;
                });
                signupError.value = 'Please correct the errors in the form.';
            } else if (message) {
                signupError.value = message;
            } else {
                signupError.value = 'Registration failed. Please try again later.';
            }
        } else {
            signupError.value = error.message || 'Network error. Please check your connection and try again.';
        }
    } finally {
        isLoading.value = false;
    }
};

const registerUser = async (userData) => {
    const response = await apiClient.post('/auth/signup', userData);
    console.log('Raw Axios response:', response);
    return {
        status: response.status,
        data: response.data,
    };
};

const resetForm = () => {
    formData.value = {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
    };
    agreeToTerms.value = false;
    subscribeNewsletter.value = false;
    errors.value = {};
    signupError.value = '';
    signupSuccess.value = '';
};

// Check authentication status on mount
onMounted(() => {
    if (authStore.isAuthenticated) {
        const user = authStore.getUser;
        if (user && user.role === 'admin') {
            router.push('/dashboard');
        } else {
            authStore.logout();
            router.push('/login');
        }
    }
});

// Lifecycle hook equivalent
resetForm();
</script>