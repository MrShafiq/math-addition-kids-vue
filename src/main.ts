import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

import 'bootstrap/dist/js/bootstrap.bundle.min.js'

// Import Vercel Analytics (will be tree-shaken in development)
import { inject } from '@vercel/analytics';

const app = createApp(App)
app.use(createPinia())

// Inject Vercel Analytics script in production
if (import.meta.env.PROD) {
  inject();
}

app.mount('#app') 