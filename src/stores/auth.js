import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        token: localStorage.getItem('authToken') || sessionStorage.getItem('authToken') || null,
        user: JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || null),
    }),
    getters: {
        isAuthenticated: (state) => !!state.token,
        getUser: (state) => state.user,
    },
    actions: {
        setAuthData({ token, user, rememberMe }) {
            this.token = token;
            this.user = user;
            const storage = rememberMe ? localStorage : sessionStorage;
            storage.setItem('authToken', token);
            storage.setItem('user', JSON.stringify(user));
            // Clear the other storage to avoid conflicts
            const otherStorage = rememberMe ? sessionStorage : localStorage;
            otherStorage.removeItem('authToken');
            otherStorage.removeItem('user');
        },
        logout() {
            this.token = null;
            this.user = null;
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            sessionStorage.removeItem('authToken');
            sessionStorage.removeItem('user');
        },
    },
});