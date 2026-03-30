<script setup>
import { computed, onMounted, ref } from 'vue'
import { searchAll } from '@/services/artAggregator'

const featuredArtworks = ref([])
const isLoading = ref(true)
const errorMessage = ref('')
const flippedCards = ref(new Set())

const hasFeatured = computed(() => featuredArtworks.value.length > 0)

function toggleFlip(artworkId) {
  if (flippedCards.value.has(artworkId)) {
    flippedCards.value.delete(artworkId)
  } else {
    flippedCards.value.add(artworkId)
  }
}

function isFlipped(artworkId) {
  return flippedCards.value.has(artworkId)
}

onMounted(async () => {
  try {
    const results = await searchAll('impressionism', 15)
    featuredArtworks.value = results.slice(0, 10)
  } catch (error) {
    errorMessage.value = 'Impossible de charger les œuvres vedettes.'
    console.error('HomeView — erreur chargement :', error)
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div class="home-view">
    <section class="hero" aria-label="Bienvenue sur ArtLens">
      <h1 class="hero-title">Bienvenue sur <span class="accent">ArtLens</span></h1>
      <p class="hero-subtitle">
        Explorez des milliers d'œuvres d'art provenant des plus grands musées du monde.
        Met Museum, Harvard Art Museums et Europeana réunis en un seul endroit.
      </p>
      <RouterLink to="/explore" class="cta-button" aria-label="Commencer l'exploration">
        Explorer les œuvres
      </RouterLink>
    </section>

    <section class="featured-section" aria-label="Œuvres à la une">
      <h2>À la une</h2>

      <div v-if="isLoading" class="loading-message">
        Chargement des oeuvres vedettes...
      </div>

      <div v-else-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>

      <div v-else-if="hasFeatured" class="featured-grid">
        <div
          v-for="artwork in featuredArtworks"
          :key="artwork.id"
          class="featured-card"
          :class="{ flipped: isFlipped(artwork.id) }"
          @click="toggleFlip(artwork.id)"
        >
          <div class="card-face card-front">
            <img
              :src="artwork.image || artwork.thumbnail"
              :alt="artwork.title || 'Œuvre sans titre'"
              class="featured-image"
              loading="lazy"
            />
          </div>

          <div class="card-face card-back">
            <h3>{{ artwork.title || 'Sans titre' }}</h3>
            <p class="back-artist">{{ artwork.artist || 'Artiste inconnu' }}</p>
            <p class="back-date">{{ artwork.date || 'Date inconnue' }}</p>
            <p class="back-source">{{ artwork.source }}</p>
            <RouterLink
              :to="`/artwork/${artwork.source}/${artwork.id}`"
              class="back-link"
              @click.stop
            >
              Voir le détail →
            </RouterLink>
          </div>
        </div>
      </div>

      <div v-else class="empty-message">
        Aucune œuvre vedette disponible pour le moment.
      </div>
    </section>

    <section class="sources-section" aria-label="Nos sources">
      <h2>Trois musées, une plateforme</h2>
      <div class="sources-grid">
        <a href="https://www.metmuseum.org/" target="_blank" rel="noopener noreferrer" class="source-card">
          <h3>Met Museum</h3>
          <p>Plus de 470 000 œuvres du Metropolitan Museum of Art de New York.</p>
        </a>
        <a href="https://harvardartmuseums.org/" target="_blank" rel="noopener noreferrer" class="source-card">
          <h3>Harvard Art Museums</h3>
          <p>Les collections des musées d'art de l'Université Harvard.</p>
        </a>
        <a href="https://www.europeana.eu/" target="_blank" rel="noopener noreferrer" class="source-card">
          <h3>Europeana</h3>
          <p>Le patrimoine culturel européen numérisé et accessible à tous.</p>
        </a>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home-view {
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

.hero {
  text-align: center;
  padding: 3rem 1rem;
}

.hero-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.accent {
  color: var(--color-accent);
}

.hero-subtitle {
  font-size: 1.15rem;
  color: #555;
  max-width: 600px;
  margin: 0 auto 2rem;
  line-height: 1.6;
}

.cta-button {
  display: inline-block;
  padding: 0.75rem 2rem;
  background-color: var(--color-accent);
  color: #fff;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 600;
  transition: background-color 0.2s ease;
}

.cta-button:hover {
  background-color: #3b5d8a;
}

.featured-section h2,
.sources-section h2 {
  text-align: center;
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
}

.featured-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1.5rem;
}

.featured-card {
  position: relative;
  height: 280px;
  perspective: 800px;
  cursor: pointer;
}

.card-face {
  position: absolute;
  inset: 0;
  border-radius: 8px;
  overflow: hidden;
  backface-visibility: hidden;
  transition: transform 0.6s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.card-front {
  transform: rotateY(0deg);
  display: flex;
  flex-direction: column;
}

.card-back {
  transform: rotateY(180deg);
  background: var(--color-surface);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 1.5rem;
  gap: 0.5rem;
  border: 1px solid var(--color-border);
}

.featured-card.flipped .card-front {
  transform: rotateY(-180deg);
}

.featured-card.flipped .card-back {
  transform: rotateY(0deg);
}

.featured-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.featured-info {
  padding: 0.75rem;
  background: #fff;
}

.featured-info h3 {
  font-size: 0.9rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-back h3 {
  font-size: 0.95rem;
  font-weight: 700;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.back-artist {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
}

.back-date {
  font-size: 0.8rem;
  color: #999;
}

.back-source {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--color-accent);
  font-weight: 600;
}

.back-link {
  margin-top: 0.5rem;
  font-size: 0.85rem;
  color: var(--color-accent);
  text-decoration: none;
  font-weight: 600;
  padding: 0.3rem 0.8rem;
  border: 1px solid var(--color-accent);
  border-radius: var(--radius-sm);
  transition: background 0.2s, color 0.2s;
}

.back-link:hover {
  background: var(--color-accent);
  color: #fff;
}

.sources-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.source-card {
  background: var(--color-surface);
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid var(--color-border);
  text-decoration: none;
  color: inherit;
  display: block;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}

.source-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border-color: var(--color-accent);
}

.source-card h3 {
  margin-bottom: 0.5rem;
}

.source-card p {
  color: #666;
  font-size: 0.95rem;
  line-height: 1.5;
}

.loading-message,
.error-message,
.empty-message {
  text-align: center;
  padding: 2rem;
  color: #888;
}

.error-message {
  color: #c0392b;
}

@media (max-width: 600px) {
  .hero-title {
    font-size: 1.8rem;
  }

  .featured-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  }

  .featured-card {
    height: 240px;
  }
}
</style>