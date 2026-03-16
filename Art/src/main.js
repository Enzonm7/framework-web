import './assets/base.css'
import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import { createPinia } from 'pinia'
import { router } from 'vue-router'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')