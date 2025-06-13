<template>
    <nav v-if="isAuthenticated" class="bottom-navigation">
        <div class="nav-container">
            <RouterLink v-for="item in navItems" :key="item.name" :to="item.path" class="nav-item"
                :class="{ 'active': isActive(item.path) }">
                <div class="nav-icon">
                    <i :class="item.icon"></i>
                </div>
                <span class="nav-label">{{ item.name }}</span>
            </RouterLink>
        </div>
    </nav>
</template>

<script>
import { RouterLink } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import '@/assets/styles/bottomnavigation.css';

export default {
    name: 'BottomNavigation',
    data() {
        return {
            navItems: [
                {
                    name: 'Dashboard',
                    path: '/',
                    icon: 'fas fa-home'
                },
                {
                    name: 'Shipments',
                    path: '/shipments',
                    icon: 'fas fa-box'
                },
                {
                    name: 'Tracking',
                    path: '/tracking',
                    icon: 'fas fa-map-marker-alt'
                },
                {
                    name: 'Reports',
                    path: '/reports',
                    icon: 'fas fa-chart-bar'
                },
                {
                    name: 'Profile',
                    path: '/profile',
                    icon: 'fas fa-user'
                }
            ]
        }
    },
    computed: {
        isAuthenticated() {
            const authStore = useAuthStore();
            return authStore.isAuthenticated;
        }
    },
    methods: {
        isActive(path) {
            return this.$route.path === path;
        }
    }
}
</script>