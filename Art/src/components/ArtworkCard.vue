<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/Users.js'

const props = defineProps({
  artwork: { type: Object, required: true }
})

const userStore = useUserStore()
const router = useRouter()
const imgError = ref(false)

function onImageError() {
  imgError.value = true
}

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
  // Si non connecté, on redirige vers /login plutôt que d'ignorer le clic
  if (!userStore.isAuthenticated) {
    router.push('/login')
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
        v-if="!imgError"
        :src="artwork.thumbnail || artwork.image"
        :alt="artwork.title || 'Œuvre sans titre'"
        class="card-image"
        loading="lazy"
        @error="onImageError"
      />
      <div v-else class="card-image-placeholder">
        <span class="placeholder-icon">🖼</span>
      </div>
      <div class="card-image-overlay" v-if="!imgError"></div>

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
      {{ isFav ? '♥' : '♡' }}
    </button>
  </router-link>
</template>

<style scoped>
.artwork-card {
  display: flex;
  flex-direction: column;
  background: var(--color-parchment-light);
  border-radius: var(--radius-md);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-border-light);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
  text-decoration: none;
  color: var(--color-text);
  position: relative;
}

.artwork-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
  text-decoration: none;
}

.card-image-wrapper {
  position: relative;
  width: 100%;
  height: 230px;
  overflow: hidden;
  background: var(--color-surface);
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.card-image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-surface);
  color: var(--color-text-muted);
}

.placeholder-icon {
  font-size: 2.5rem;
  opacity: 0.5;
}

.card-image-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, transparent 60%, rgba(42, 26, 14, 0.25) 100%);
  pointer-events: none;
}

.artwork-card:hover .card-image {
  transform: scale(1.04);
}

.source-badge {
  position: absolute;
  top: 0.6rem;
  left: 0.6rem;
  padding: 0.2rem 0.55rem;
  border-radius: 3px;
  font-size: 0.65rem;
  font-weight: 700;
  color: #FFF8F0;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.source-met       { background: rgba(120, 40, 20, 0.88); }
.source-harvard   { background: rgba(100, 20, 20, 0.88); }
.source-europeana { background: rgba(20, 50, 110, 0.88); }

.card-body {
  padding: 0.85rem 0.9rem 0.75rem;
  flex: 1;
  border-top: 1px solid var(--color-border-light);
}

.card-title {
  font-family: var(--font-heading);
  font-size: 0.92rem;
  font-weight: 600;
  margin-bottom: 0.3rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.35;
  color: var(--color-text);
}

.card-artist {
  font-size: 0.82rem;
  color: var(--color-text-secondary);
  margin-bottom: 0.1rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-date {
  font-size: 0.78rem;
  color: var(--color-text-muted);
}

.favorite-btn {
  position: absolute;
  top: 0.55rem;
  right: 0.55rem;
  background: rgba(253, 250, 243, 0.92);
  border: 1px solid rgba(200, 185, 154, 0.6);
  border-radius: 50%;
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  cursor: pointer;
  transition: transform 0.15s ease, background 0.15s;
  z-index: 2;
  color: var(--color-text-muted);
}

.favorite-btn:hover {
  transform: scale(1.18);
  background: rgba(253, 250, 243, 1);
}

.favorite-btn.active {
  color: var(--color-accent);
  background: rgba(253, 250, 243, 1);
}
</style>
