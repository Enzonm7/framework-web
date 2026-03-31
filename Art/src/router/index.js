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
  // savedPosition est défini quand l'utilisateur clique sur Précédent/Suivant
  // du navigateur — on restaure alors la position exacte. Sinon on remonte en haut.
  scrollBehavior(to, from, savedPosition) {
    return savedPosition ?? { top: 0 }
  }
})

// Guard : redirige vers /profile si l'utilisateur est déjà connecté
// et tente d'accéder à /login ou /register.
// L'import du store est dynamique pour éviter une dépendance circulaire
// (le router est importé dans main.js avant que Pinia soit prêt).
router.beforeEach(async (to) => {
  if (to.name !== 'login' && to.name !== 'register') return

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
