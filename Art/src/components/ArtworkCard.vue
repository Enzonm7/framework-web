<!-- ArtworkCard.vue — Carte d'œuvre d'art réutilisable -->

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/Users.js'

const props = defineProps({
  artwork: { type: Object, required: true }
})

const userStore = useUserStore()
const router = useRouter()

const isFav = computed(() =>
  userStore.isFavorite(props.artwork.source, props.artwork.id)
)

const sourceLabel = computed(() => {
  const labels = { met: 'Met Museum', harvard: 'Harvard Art', europeana: 'Europeana' }
  return labels[props.artwork.source] || props.artwork.source
})

const detailRoute = computed(() => ({
  name: 'artwork-detail',
  params: { source: props.artwork.source, id: props.artwork.id }
}))

function toggleFavorite() {
  if (!userStore.isAuthenticated) {
    alert("Pour ajouter aux favoris, connectez-vous.")
    router.push({ name: 'login' })
    return
  }
  userStore.toggleFavorite(props.artwork)
}
</script>

<template>
  <router-link
    :to="detailRoute"
    class="artwork-card"
    :aria-label="`Voir le détail de ${artwork.title}`"
  >
    <div class="card-image-wrapper">
      <img
        :src="artwork.thumbnail || artwork.image"
        :alt="artwork.title || 'Œuvre sans titre'"
        class="card-image"
        loading="lazy"
      />

      <span class="source-badge" :class="`source-${artwork.source}`">
        {{ sourceLabel }}
      </span>
    </div>

    <div class="card-body">
      <h3 class="card-title">{{ artwork.title || 'Sans titre' }}</h3>
      <p class="card-artist">{{ artwork.artist || 'Artiste inconnu' }}</p>
      <p class="card-date">{{ artwork.date || '' }}</p>
    </div>

    <button
      class="favorite-btn"
      :class="{ active: isFav }"
      @click.stop.prevent="toggleFavorite"
      :aria-label="isFav ? 'Retirer des favoris' : 'Ajouter aux favoris'"
      :aria-pressed="isFav"
    >
      {{ isFav ? '❤️' : '🤍' }}
    </button>
  </router-link>
</template>

<style scoped>
.artwork-card {
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: var(--radius-md);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  text-decoration: none;
  color: var(--color-text);
  position: relative;
}

.artwork-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-lg);
}

/* Image */
.card-image-wrapper {
  position: relative;
  width: 100%;
  height: 220px;
  overflow: hidden;
  background: var(--color-surface);
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.artwork-card:hover .card-image {
  transform: scale(1.03);
}

/* Badge source */
.source-badge {
  position: absolute;
  top: 0.5rem;
  left: 0.5rem;
  padding: 0.2rem 0.5rem;
  border-radius: var(--radius-sm);
  font-size: 0.7rem;
  font-weight: 600;
  color: #fff;
  background: rgba(0, 0, 0, 0.6);
}

.source-met { background: rgba(180, 50, 50, 0.85); }
.source-harvard { background: rgba(165, 42, 42, 0.85); }
.source-europeana { background: rgba(0, 51, 153, 0.85); }

/* Corps texte */
.card-body {
  padding: 0.75rem;
  flex: 1;
}

.card-title {
  font-size: 0.95rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
  /* Tronquer les titres longs */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-artist {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  margin-bottom: 0.15rem;
}

.card-date {
  font-size: 0.8rem;
  color: #999;
}

/* Bouton favori */
.favorite-btn {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  cursor: pointer;
  transition: transform 0.15s ease;
  z-index: 2;
}

.favorite-btn:hover {
  transform: scale(1.15);
}

.favorite-btn.active {
  background: rgba(255, 255, 255, 1);
}
</style>
