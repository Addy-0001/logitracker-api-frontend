import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/core/Home/HomeView.vue';
import LoginView from '@/views/auth/Login/LoginView.vue';
import SignupView from '@/views/auth/Register/SignupView.vue';
import ProfileView from '@/views/auth/Profile/ProfileView.vue';
import Shipment from '@/views/core/Shipment/Shipment.vue';
import Tracking from '@/views/core/Tracking/Tracking.vue';
import { useAuthStore } from '@/stores/auth';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/register',
      name: 'register',
      component: SignupView,
    },
    {
      path: '/logout',
      name: 'logout',
      beforeEnter: (to, from, next) => {
        const authStore = useAuthStore();
        authStore.logout();
        next({ name: 'home' });
      },
    },
    {
      path: '/profile',
      name: 'profile',
      component: ProfileView,
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: '/reports',
      name: 'reports',
      component: () => import('@/views/core/Reports/Reports.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: '/shipments',
      name: 'shipments',
      component: Shipment,
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: '/tracking',
      name: 'tracking',
      component: Tracking,
      meta: { requiresAuth: true, requiresAdmin: true },
    },
  ],
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();

  // Protect routes that require authentication
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'login' });
  }
  // Protect routes that require admin role
  else if (to.meta.requiresAdmin && authStore.isAuthenticated && authStore.getUser?.role !== 'admin') {
    authStore.logout();
    next({ name: 'login' });
  }
  // Redirect authenticated admins away from login/register
  else if (['login', 'register'].includes(to.name) && authStore.isAuthenticated && authStore.getUser?.role === 'admin') {
    next({ name: 'profile' });
  }
  else {
    next();
  }
});

export default router;