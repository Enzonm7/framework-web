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

import { useUserStore } from './stores/Users'
const userStore = useUserStore()

// On attend que init() soit terminé avant de monter l'app.
// Sans ça, NavBar afficherait "non connecté" pendant un instant même si
// l'utilisateur avait une session Firebase active — car Firebase restaure
// la session de manière asynchrone via IndexedDB.
userStore.init().finally(() => {
    app.mount('#app')
})
