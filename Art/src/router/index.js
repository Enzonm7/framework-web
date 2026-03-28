import { createRouter, createWebHistory } from 'vue-router'

import HomeView          from '@/views/HomeView.vue'
import ExploreView       from '@/views/ExploreView.vue'
import ArtworkDetailView from '@/views/ArtworkDetailView.vue'
import ProfileView       from '@/views/ProfileView.vue'
import LoginView         from '@/views/LoginView.vue'
import RegisterView      from '@/views/RegisterView.vue'
import NotFoundView      from '@/views/NotFoundView.vue'

const routes = [
  { path: '/',                    name: 'home',           component: HomeView },
  { path: '/explore',             name: 'explore',        component: ExploreView },
  { path: '/artwork/:source/:id', name: 'artwork-detail', component: ArtworkDetailView },
  { path: '/profile',             name: 'profile',        component: ProfileView },
  { path: '/login',               name: 'login',          component: LoginView },
  { path: '/register',            name: 'register',       component: RegisterView },
  { path: '/:pathMatch(.*)*',     name: 'not-found',      component: NotFoundView }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    return savedPosition ?? { top: 0 }
  }
})

// Rediriger vers /profile si déjà connecté et qu'on essaie d'aller sur /login ou /register
router.beforeEach(async (to) => {
  if (to.name !== 'login' && to.name !== 'register') return

  // Import dynamique du store pour éviter les dépendances circulaires
  const { useUserStore } = await import('@/stores/Users')
  try {
    const userStore = useUserStore()
    if (userStore.isAuthenticated) {
      return { name: 'profile' }
    }
  } catch {
    // Pinia pas encore prête — on laisse passer
  }
})

export default router
