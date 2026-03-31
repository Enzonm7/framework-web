<script setup>
import { computed, onMounted, ref } from 'vue';
import { useArtworkStore } from '@/stores/Artwork';

const artworkStore = useArtworkStore()
const flippedCards = ref(new Set())

const featuredArtworks = computed(() => artworkStore.featuredArtworks.slice(0, 10))
const isLoading = computed(() => artworkStore.isFeaturedLoading)
const hasFeatured = computed(() => featuredArtworks.value.length > 0)

onMounted(() => {
    artworkStore.loadFeaturedArtworks()
})

function toggleFlip(artworkId) {
  const next = new Set(flippedCards.value)
  if (next.has(artworkId)) {
    next.delete(artworkId)
  } else {
    next.add(artworkId)
  }
  flippedCards.value = next
}

function isFlipped(artworkId) {
  return flippedCards.value.has(artworkId)
}
</script>

<template>
    <div class="home-view">

        <section class="hero" aria-label="Bienvenue sur ArtLens">
            <p class="hero-eyebrow">Collection en ligne</p>
            <h1 class="hero-title">
                Explorez l'art des<br>
                <span class="hero-accent">plus grands musées</span>
            </h1>
            <p class="hero-subtitle">
                Met Museum, Harvard Art Museums et Europeana réunis en un seul endroit.
                Des milliers d'œuvres à portée de main.
            </p>
            <div class="hero-ornament">
                <span></span><span class="hero-diamond">◆</span><span></span>
            </div>
            <RouterLink to="/explore" class="cta-button" aria-label="Commencer l'exploration">
                Explorer les œuvres
            </RouterLink>
        </section>

        <section class="featured-section" aria-label="Œuvres à la une">
            <h2 class="section-title">Sélection du moment</h2>
            <p class="section-subtitle">Cliquez sur une œuvre pour la découvrir</p>

            <div v-if="isLoading && !hasFeatured" class="loading-message">
                <span class="loading-dot"></span>
                <span class="loading-dot"></span>
                <span class="loading-dot"></span>
            </div>

            <div v-else-if="!hasFeatured" class="empty-message">
                Aucune œuvre disponible pour le moment.
            </div>

            <div v-if="hasFeatured" class="featured-grid">
                <div
                    v-for="artwork in featuredArtworks"
                    :key="`${artwork.source}-${artwork.id}`"
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
                        <span class="front-source" :class="`source-${artwork.source}`">
                            {{ artwork.source === 'met' ? 'Met' : artwork.source === 'harvard' ? 'Harvard' : 'Europeana' }}
                        </span>
                    </div>

                    <div class="card-face card-back" @click.stop>
                        <div class="back-content">
                            <h3 class="back-title">{{ artwork.title || 'Sans titre' }}</h3>
                            <p class="back-artist">{{ artwork.artist || 'Artiste inconnu' }}</p>
                            <p class="back-date">{{ artwork.date || 'Date inconnue' }}</p>
                            <p class="back-source-label">{{ artwork.source === 'met' ? 'Met Museum' : artwork.source === 'harvard' ? 'Harvard Art' : 'Europeana' }}</p>
                        </div>
                        <RouterLink
                            :to="{ name: 'artwork-detail', params: { source: artwork.source, id: artwork.id } }"
                            class="back-link"
                            @click.stop
                        >
                            En savoir plus &rarr;
                        </RouterLink>
                    </div>
                </div>
            </div>
        </section>

        <section class="sources-section" aria-label="Nos sources">
            <h2 class="section-title">Trois musées, une plateforme</h2>
            <div class="sources-grid">
                <a href="https://www.metmuseum.org/" target="_blank" rel="noopener noreferrer" class="source-card">
                    <span class="source-icon">🏛</span>
                    <h3>Met Museum</h3>
                    <p>Plus de 470 000 œuvres du Metropolitan Museum of Art de New York.</p>
                </a>
                <a href="https://harvardartmuseums.org/" target="_blank" rel="noopener noreferrer" class="source-card">
                    <span class="source-icon">🎓</span>
                    <h3>Harvard Art Museums</h3>
                    <p>Les riches collections des musées d'art de l'Université Harvard.</p>
                </a>
                <a href="https://www.europeana.eu/" target="_blank" rel="noopener noreferrer" class="source-card">
                    <span class="source-icon">🌍</span>
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
  gap: 4rem;
}

.hero {
  text-align: center;
  padding: 3.5rem 1rem 2.5rem;
  background: linear-gradient(180deg, var(--color-surface) 0%, var(--color-background) 100%);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border-light);
}

.hero-eyebrow {
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--color-gold-dark);
  margin-bottom: 1rem;
}

.hero-title {
  font-family: var(--font-heading);
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: 700;
  line-height: 1.2;
  color: var(--color-text);
  margin-bottom: 1.25rem;
}

.hero-accent {
  color: var(--color-accent);
  font-style: italic;
}

.hero-subtitle {
  font-size: 1.05rem;
  color: var(--color-text-secondary);
  max-width: 520px;
  margin: 0 auto 1.75rem;
  line-height: 1.7;
}

.hero-ornament {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin-bottom: 1.75rem;
}

.hero-ornament span:first-child,
.hero-ornament span:last-child {
  display: block;
  width: 60px;
  height: 1px;
  background: var(--color-gold);
  opacity: 0.6;
}

.hero-diamond {
  color: var(--color-gold);
  font-size: 0.6rem;
  opacity: 0.8;
}

.cta-button {
  display: inline-block;
  padding: 0.8rem 2.25rem;
  background-color: var(--color-accent);
  color: #FFF8F0;
  border-radius: var(--radius-sm);
  font-weight: 700;
  font-size: 0.9rem;
  letter-spacing: 0.04em;
  transition: background-color 0.2s ease, box-shadow 0.2s ease, transform 0.15s ease;
  box-shadow: 0 3px 10px rgba(123, 53, 34, 0.3);
}

.cta-button:hover {
  background-color: var(--color-accent-hover);
  box-shadow: 0 5px 16px rgba(123, 53, 34, 0.4);
  transform: translateY(-1px);
  text-decoration: none;
  color: #FFF8F0;
}

.section-title {
  font-family: var(--font-heading);
  font-size: 1.6rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 0.4rem;
  color: var(--color-text);
}

.section-subtitle {
  text-align: center;
  font-size: 0.9rem;
  color: var(--color-text-muted);
  margin-bottom: 1.75rem;
}

.featured-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
  gap: 1.25rem;
}

.featured-card {
  position: relative;
  height: 290px;
  perspective: 900px;
  cursor: pointer;
}

.card-face {
  position: absolute;
  inset: 0;
  border-radius: var(--radius-md);
  overflow: hidden;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  transition: transform 0.55s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: var(--shadow-md);
}

.card-front {
  transform: rotateY(0deg);
}

.card-back {
  transform: rotateY(180deg);
  background: var(--color-surface);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  text-align: center;
  padding: 1.5rem 1.25rem 1.25rem;
  border: 1px solid var(--color-border);
}

.featured-card.flipped .card-front {
  transform: rotateY(-180deg);
}

.featured-card.flipped .card-back {
  transform: rotateY(0deg);
}

.featured-card:hover {
  filter: brightness(1.02);
}

.featured-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.front-source {
  position: absolute;
  top: 0.55rem;
  left: 0.55rem;
  padding: 0.18rem 0.5rem;
  border-radius: 3px;
  font-size: 0.62rem;
  font-weight: 700;
  color: #FFF8F0;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.source-met       { background: rgba(120, 40, 20, 0.88); }
.source-harvard   { background: rgba(100, 20, 20, 0.88); }
.source-europeana { background: rgba(20, 50, 110, 0.88); }

.back-content {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  flex: 1;
  justify-content: center;
}

.back-title {
  font-family: var(--font-heading);
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--color-text);
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.3;
}

.back-artist {
  font-size: 0.82rem;
  color: var(--color-text-secondary);
}

.back-date {
  font-size: 0.78rem;
  color: var(--color-text-muted);
}

.back-source-label {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--color-gold-dark);
  font-weight: 700;
  margin-top: 0.15rem;
}

.back-link {
  display: inline-block;
  margin-top: 0.75rem;
  padding: 0.45rem 1.1rem;
  background: var(--color-accent);
  color: #FFF8F0;
  border-radius: var(--radius-sm);
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  transition: background 0.2s, transform 0.15s;
  text-decoration: none;
}

.back-link:hover {
  background: var(--color-accent-hover);
  transform: translateY(-1px);
  text-decoration: none;
}

.loading-message {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  padding: 3rem;
}

.loading-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-gold);
  animation: dot-pulse 1.2s ease-in-out infinite;
}

.loading-dot:nth-child(2) { animation-delay: 0.2s; }
.loading-dot:nth-child(3) { animation-delay: 0.4s; }

@keyframes dot-pulse {
  0%, 80%, 100% { opacity: 0.2; transform: scale(0.8); }
  40% { opacity: 1; transform: scale(1); }
}

.empty-message {
  text-align: center;
  padding: 2rem;
  color: var(--color-text-muted);
}

.sources-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1.25rem;
}

.source-card {
  background: var(--color-surface);
  padding: 1.75rem 1.5rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border-light);
  text-decoration: none;
  color: inherit;
  display: block;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}

.source-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-md);
  border-color: var(--color-gold);
  text-decoration: none;
}

.source-icon {
  font-size: 1.6rem;
  display: block;
  margin-bottom: 0.75rem;
}

.source-card h3 {
  font-family: var(--font-heading);
  font-size: 1.05rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--color-text);
}

.source-card p {
  color: var(--color-text-secondary);
  font-size: 0.9rem;
  line-height: 1.55;
}

@media (max-width: 640px) {
  .hero-title {
    font-size: 1.8rem;
  }

  .featured-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .featured-card {
    height: 240px;
  }
}
</style>
