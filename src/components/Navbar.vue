<template>
    <nav v-if="isAuthenticated" class="navbar">
        <div class="navbar-container">
            <!-- Logo and Brand -->
            <RouterLink to="/" class="navbar-brand">
                <img src="/logo.png" alt="LogiTracker Logo" class="navbar-logo" />
                <h1 class="navbar-title">LogiTracker</h1>
            </RouterLink>
        </div>
    </nav>
</template>

<script>
import { RouterLink } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import '@/assets/styles/navbar.css';

export default {
    name: 'Navbar',
    computed: {
        isAuthenticated() {
            const authStore = useAuthStore();
            return authStore.isAuthenticated;
        }
    }
}
</script>