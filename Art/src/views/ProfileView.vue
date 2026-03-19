<script setup>
import { computed } from 'vue'
import { useUserStore } from '../stores/Users.js'
import ArtworkCard from '../components/ArtworkCard.vue'

const userStore = useUserStore()

const favorites = computed(() => userStore.favorites)
const stats = computed(() => userStore.formattedStats)
const hasFavorites = computed(() => favorites.value.length > 0)

function handleClearFavorites() {
  if (window.confirm('Supprimer tous vos favoris ?')) {
    userStore.clearFavorites()
  }
}
</script>

<template>
  <div class="profile-view">
    <h1 class="page-title">Mon profil</h1>
    <section class="stats-section" aria-label="Statistiques de navigation">
      <h2>Statistiques de session</h2>
      <div class="stats-grid">
        <div class="stat-card">
          <span class="stat-number">{{ stats.searchCount }}</span>
          <span class="stat-label">Recherches</span>
        </div>
        <div class="stat-card">
          <span class="stat-number">{{ stats.artworksViewed }}</span>
          <span class="stat-label">Œuvres consultées</span>
        </div>
        <div class="stat-card">
          <span class="stat-number">{{ stats.sourcesExplored }}</span>
          <span class="stat-label">Sources explorées</span>
        </div>
        <div class="stat-card">
          <span class="stat-number">{{ favorites.length }}</span>
          <span class="stat-label">Favoris</span>
        </div>
      </div>
    </section>
    <section class="favorites-section" aria-label="Mes favoris">
      <div class="favorites-header">
        <h2>Mes favoris</h2>
        <button
          v-if="hasFavorites"
          class="btn btn-danger"
          @click="handleClearFavorites"
          aria-label="Supprimer tous les favoris"
        >
          Tout supprimer
        </button>
      </div>

      <div v-if="hasFavorites" class="favorites-grid">
        <ArtworkCard
          v-for="fav in favorites"
          :key="`${fav.source}-${fav.id}`"
          :artwork="fav"
        />
        <ArtworkCard
          v-for="fav in favorites"
          :key="`${fav.source}-${fav.id}`"
          :artwork="fav"
        />
      </div>
      <div v-else class="empty-favorites">
        <p>Vous n'avez pas encore de favoris.</p>
        <p>
          Explorez les œuvres et cliquez sur 🤍 pour en ajouter !
        </p>
        <router-link to="/explore" class="btn btn-primary">
          Explorer les œuvres
        </router-link>
      </div>
    </section>
  </div>
</template>

<style scoped>
.profile-view {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.page-title {
  font-size: 1.8rem;
  font-weight: 700;
}

.stats-section h2,
.favorites-header h2 {
  font-size: 1.3rem;
  margin-bottom: 1rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.stat-card {
  background: var(--color-surface);
  padding: 1.25rem;
  border-radius: var(--radius-md);
  text-align: center;
  border: 1px solid var(--color-border);
}

.stat-number {
  display: block;
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-accent);
}

.stat-label {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  margin-top: 0.25rem;
}

/* Favoris */
.favorites-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.favorites-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1.5rem;
}

.empty-favorites {
  text-align: center;
  padding: 3rem 1rem;
  background: var(--color-surface);
  border-radius: var(--radius-md);
  border: 1px dashed var(--color-border);
}

.empty-favorites p {
  margin-bottom: 0.75rem;
  color: var(--color-text-secondary);
}

.empty-favorites .btn {
  margin-top: 0.5rem;
}

@media (max-width: 600px) {
  .favorites-grid {
    grid-template-columns: 1fr;
  }
}
</style>
