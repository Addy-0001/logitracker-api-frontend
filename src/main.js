import './assets/styles/main.css';
// import 'leaflet/dist/leaflet.css';
// import 'leaflet/dist/leaflet.css';
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);
app.mount('#app');