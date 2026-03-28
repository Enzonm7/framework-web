import './assets/base.css'
import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import { createPinia } from 'pinia'
import router from './router'

const app   = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// Vérifier la session existante avant le premier rendu
import { useUserStore } from './stores/Users'
const userStore = useUserStore()
userStore.init().finally(() => {
    app.mount('#app')
})
