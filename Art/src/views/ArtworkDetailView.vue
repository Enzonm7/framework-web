<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { getArtworkDetail } from '@/services/artAggregator.js'
import { useUserStore } from '@/stores/Users.js'
import { useArtworkStore } from '@/stores/Artwork'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const artworkStore = useArtworkStore()

const artwork = ref(null)
const loading = ref(true)
const error = ref(null)
const lightboxImage = ref(null)

const sourceLabel = computed(() => {
  if (!artwork.value) return ''
  const labels = { met: 'Met Museum', harvard: 'Harvard Art Museums', europeana: 'Europeana' }
  return labels[artwork.value.source] || artwork.value.source
})

const artistLife = computed(() => {
  if (!artwork.value) return ''
  const begin = artwork.value.artistBeginDate
  const end   = artwork.value.artistEndDate
  const nat   = artwork.value.artistNationality || artwork.value.culture || ''
  if (begin || end || nat) {
    const dates = begin || end ? `(${[begin, end].filter(Boolean).join(' – ')})` : ''
    return [nat, dates].filter(Boolean).join(' ')
  }
  return ''
})

const hasAcquisition = computed(() => {
  if (!artwork.value) return false
  return !!(artwork.value.creditLine || artwork.value.accessionNumber || artwork.value.accessionYear)
})

const hasLocation = computed(() => {
  if (!artwork.value) return false
  return !!(artwork.value.galleryNumber || artwork.value.repository || artwork.value.country || artwork.value.city || artwork.value.dataProvider || artwork.value.provider)
})

const hasContext = computed(() => {
  if (!artwork.value) return false
  return !!(artwork.value.culture || artwork.value.period || artwork.value.dynasty || artwork.value.reign || artwork.value.century)
})

const hasPeople = computed(() => {
  if (!artwork.value) return false
  return !!(artwork.value.allPeople && artwork.value.allPeople.length > 1)
})

const hasExtraText = computed(() => {
  if (!artwork.value) return false
  return !!(artwork.value.description || artwork.value.labeltext || artwork.value.provenance)
})

const isFav = computed(() => {
  if (!artwork.value) return false
  return userStore.isFavorite(artwork.value.source, artwork.value.id)
})

function toggleFavorite() {
  if (artwork.value) {
    userStore.toggleFavorite(artwork.value)
  }
}

function openLightbox(url) {
  lightboxImage.value = url
}

function closeLightbox() {
  lightboxImage.value = null
}

onMounted(async () => {
  const { source, id } = route.params
  try {
    let listArtwork = null
    const all = [...(artworkStore.featuredArtworks || []), ...(artworkStore.results || [])]
    listArtwork = all.find(a => a.source === source && String(a.id) === String(id))

    const data = await getArtworkDetail(source, id)

    artwork.value = {
      ...listArtwork,
      ...data,
      image: data.image || data.thumbnail || listArtwork?.image || listArtwork?.thumbnail || null,
      title: data.title || listArtwork?.title || 'Sans titre',
      artist: data.artist || listArtwork?.artist || 'Artiste inconnu',
      date: data.date || listArtwork?.date || 'Date inconnue',
    }
    userStore.recordArtworkView(source)
  } catch (e) {
    if (e.message && e.message.includes('Source inconnue')) {
      error.value = `Source inconnue : ${source}`
    } else if (e.message) {
      error.value = e.message
    } else {
      error.value = "Impossible de charger cette œuvre."
    }
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="detail-page">

    <div v-if="loading" class="state-center">
      <div class="loading-dots">
        <span></span><span></span><span></span>
      </div>
      <p>Chargement de l'œuvre…</p>
    </div>

    <div v-else-if="error" class="state-center state-error">
      <p class="state-icon">⚠</p>
      <p>{{ error }}</p>
      <button class="btn btn-secondary" @click="router.back()">← Retour</button>
    </div>

    <div v-else-if="artwork" class="detail-content">

      <div class="detail-nav">
        <button class="back-btn" @click="router.back()">
          ← Retour
        </button>
        <span class="source-chip" :class="`chip-${artwork.source}`">
          {{ sourceLabel }}
        </span>
      </div>

      <div class="detail-main">

        <div class="image-column">
          <div class="artwork-image-wrapper" v-if="artwork.image">
            <img
              :src="artwork.image"
              :alt="artwork.title"
              class="artwork-image"
              @click="openLightbox(artwork.image)"
            />
            <button class="zoom-hint" @click="openLightbox(artwork.image)" aria-label="Agrandir">
              ⤢
            </button>
          </div>
          <div v-else class="no-image">
            <span>Aucune image disponible</span>
          </div>

          <div v-if="artwork.additionalImages && artwork.additionalImages.length" class="additional-images">
            <p class="add-images-label">Autres vues</p>
            <div class="add-images-row">
              <img
                v-for="(img, i) in artwork.additionalImages.slice(0, 5)"
                :key="i"
                :src="img"
                :alt="`Vue ${i + 2} de ${artwork.title}`"
                class="add-image-thumb"
                loading="lazy"
                @click="openLightbox(img)"
              />
            </div>
          </div>
        </div>

        <div class="info-column">

          <div class="info-header">
            <h1 class="artwork-title">{{ artwork.title }}</h1>
            <p class="artwork-artist">
              {{ artwork.artist }}
              <em v-if="artistLife" class="artist-life"> — {{ artistLife }}</em>
            </p>
            <p v-if="artwork.artistRole" class="artist-role">{{ artwork.artistRole }}</p>
          </div>

          <div v-if="artwork.isHighlight" class="highlight-badge">
            ★ Œuvre phare de la collection
          </div>

          <div class="info-section">
            <h2 class="section-heading">Informations</h2>
            <dl class="info-grid">
              <template v-if="artwork.date">
                <dt>Date</dt>
                <dd>{{ artwork.date }}</dd>
              </template>
              <template v-if="artwork.medium">
                <dt>Médium</dt>
                <dd>{{ artwork.medium }}</dd>
              </template>
              <template v-if="artwork.technique">
                <dt>Technique</dt>
                <dd>{{ artwork.technique }}</dd>
              </template>
              <template v-if="artwork.dimensions">
                <dt>Dimensions</dt>
                <dd>{{ artwork.dimensions }}</dd>
              </template>
              <template v-if="artwork.format">
                <dt>Format</dt>
                <dd>{{ artwork.format }}</dd>
              </template>
              <template v-if="artwork.classification">
                <dt>Classification</dt>
                <dd>{{ artwork.classification }}</dd>
              </template>
              <template v-if="artwork.department">
                <dt>Département</dt>
                <dd>{{ artwork.department }}</dd>
              </template>
            </dl>
          </div>

          <div class="info-section" v-if="hasContext">
            <h2 class="section-heading">Contexte</h2>
            <dl class="info-grid">
              <template v-if="artwork.culture">
                <dt>Culture</dt>
                <dd>{{ artwork.culture }}</dd>
              </template>
              <template v-if="artwork.period">
                <dt>Période</dt>
                <dd>{{ artwork.period }}</dd>
              </template>
              <template v-if="artwork.century">
                <dt>Siècle</dt>
                <dd>{{ artwork.century }}</dd>
              </template>
              <template v-if="artwork.dynasty">
                <dt>Dynastie</dt>
                <dd>{{ artwork.dynasty }}</dd>
              </template>
              <template v-if="artwork.reign">
                <dt>Règne</dt>
                <dd>{{ artwork.reign }}</dd>
              </template>
              <template v-if="artwork.language">
                <dt>Langue</dt>
                <dd>{{ artwork.language }}</dd>
              </template>
            </dl>
          </div>

          <div class="info-section" v-if="hasPeople">
            <h2 class="section-heading">Contributeurs</h2>
            <ul class="people-list">
              <li v-for="p in artwork.allPeople" :key="p.name" class="person-item">
                <span class="person-name">{{ p.name }}</span>
                <span v-if="p.role" class="person-role">{{ p.role }}</span>
                <span v-if="p.displaydate" class="person-dates">{{ p.displaydate }}</span>
                <span v-if="p.birthplace || p.deathplace" class="person-places">
                  {{ [p.birthplace, p.deathplace].filter(Boolean).join(' → ') }}
                </span>
              </li>
            </ul>
          </div>

          <div class="info-section" v-if="hasAcquisition">
            <h2 class="section-heading">Acquisition</h2>
            <dl class="info-grid">
              <template v-if="artwork.creditLine">
                <dt>Crédit</dt>
                <dd>{{ artwork.creditLine }}</dd>
              </template>
              <template v-if="artwork.accessionNumber">
                <dt>N° d'accession</dt>
                <dd>{{ artwork.accessionNumber }}</dd>
              </template>
              <template v-if="artwork.accessionYear">
                <dt>Année d'entrée</dt>
                <dd>{{ artwork.accessionYear }}</dd>
              </template>
              <template v-if="artwork.copyright">
                <dt>Copyright</dt>
                <dd>{{ artwork.copyright }}</dd>
              </template>
            </dl>
          </div>

          <div class="info-section" v-if="hasLocation">
            <h2 class="section-heading">Localisation</h2>
            <dl class="info-grid">
              <template v-if="artwork.galleryNumber">
                <dt>Salle</dt>
                <dd>Galerie {{ artwork.galleryNumber }}</dd>
              </template>
              <template v-if="artwork.repository">
                <dt>Dépôt</dt>
                <dd>{{ artwork.repository }}</dd>
              </template>
              <template v-if="artwork.city || artwork.country">
                <dt>Lieu</dt>
                <dd>{{ [artwork.city, artwork.country].filter(Boolean).join(', ') }}</dd>
              </template>
              <template v-if="artwork.dataProvider">
                <dt>Fournisseur</dt>
                <dd>{{ artwork.dataProvider }}</dd>
              </template>
              <template v-if="artwork.provider">
                <dt>Agrégateur</dt>
                <dd>{{ artwork.provider }}</dd>
              </template>
            </dl>
          </div>

          <div class="info-section" v-if="artwork.rights">
            <h2 class="section-heading">Droits</h2>
            <p class="rights-text">{{ artwork.rights }}</p>
          </div>

          <div class="action-row">
            <button
              class="btn btn-secondary fav-btn"
              :class="{ 'fav-active': isFav }"
              @click="toggleFavorite"
            >
              {{ isFav ? '♥ Sauvegardé' : '♡ Sauvegarder' }}
            </button>
            <a
              v-if="artwork.url"
              :href="artwork.url"
              target="_blank"
              rel="noopener noreferrer"
              class="btn btn-primary museum-btn"
            >
              Voir sur {{ sourceLabel }} ↗
            </a>
            <a
              v-if="artwork.institutionUrl && artwork.dataProvider"
              :href="artwork.institutionUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="btn btn-secondary museum-btn"
            >
              Voir sur {{ artwork.dataProvider }} ↗
            </a>
          </div>
        </div>
      </div>

      <div v-if="hasExtraText" class="extra-section">
        <div v-if="artwork.description" class="extra-block">
          <h2 class="section-heading">Description</h2>
          <p class="extra-text">{{ artwork.description }}</p>
        </div>
        <div v-if="artwork.labeltext" class="extra-block">
          <h2 class="section-heading">Étiquette de musée</h2>
          <p class="extra-text">{{ artwork.labeltext }}</p>
        </div>
        <div v-if="artwork.provenance" class="extra-block">
          <h2 class="section-heading">Provenance</h2>
          <p class="extra-text">{{ artwork.provenance }}</p>
        </div>
      </div>

      <div v-if="artwork.tags && artwork.tags.length" class="tags-section">
        <h2 class="section-heading">Sujets & thèmes</h2>
        <div class="tags-list">
          <span v-for="tag in artwork.tags" :key="tag" class="tag-pill">
            {{ tag }}
          </span>
        </div>
      </div>

    </div>

    <Teleport to="body">
      <div v-if="lightboxImage" class="lightbox" @click="closeLightbox">
        <button class="lightbox-close" @click="closeLightbox" aria-label="Fermer">✕</button>
        <img :src="lightboxImage" alt="Vue agrandie" class="lightbox-img" @click.stop />
      </div>
    </Teleport>

  </div>
</template>

<style scoped>
.detail-page {
  max-width: 1280px;
  margin: 0 auto;
}

.state-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 5rem 2rem;
  text-align: center;
  color: var(--color-text-muted);
}

.state-error {
  color: var(--color-error);
}

.state-icon {
  font-size: 2.5rem;
}

.loading-dots {
  display: flex;
  gap: 0.5rem;
}

.loading-dots span {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: var(--color-gold);
  animation: pulse 1.2s ease-in-out infinite;
}

.loading-dots span:nth-child(2) { animation-delay: 0.2s; }
.loading-dots span:nth-child(3) { animation-delay: 0.4s; }

@keyframes pulse {
  0%, 80%, 100% { opacity: 0.2; transform: scale(0.8); }
  40%           { opacity: 1;   transform: scale(1); }
}

.detail-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.detail-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.back-btn {
  background: none;
  border: 1.5px solid var(--color-border);
  color: var(--color-text-secondary);
  padding: 0.45rem 1rem;
  border-radius: var(--radius-sm);
  font-size: 0.875rem;
  cursor: pointer;
  transition: border-color 0.2s, color 0.2s;
}

.back-btn:hover {
  border-color: var(--color-accent);
  color: var(--color-accent);
}

.source-chip {
  padding: 0.3rem 0.85rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: #FFF8F0;
}

.chip-met       { background: #78281A; }
.chip-harvard   { background: #641414; }
.chip-europeana { background: #143272; }

.detail-main {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2.5rem;
  align-items: start;
}

.image-column {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  position: sticky;
  top: 90px;
}

.artwork-image-wrapper {
  position: relative;
  border-radius: var(--radius-md);
  overflow: hidden;
  box-shadow: var(--shadow-xl);
  border: 1px solid var(--color-border-light);
  background: var(--color-surface);
  cursor: zoom-in;
}

.artwork-image {
  width: 100%;
  height: auto;
  display: block;
  transition: transform 0.3s ease;
}

.artwork-image-wrapper:hover .artwork-image {
  transform: scale(1.01);
}

.zoom-hint {
  position: absolute;
  bottom: 0.6rem;
  right: 0.6rem;
  background: rgba(42, 26, 14, 0.65);
  color: #FFF8F0;
  border: none;
  border-radius: var(--radius-sm);
  padding: 0.2rem 0.5rem;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background 0.15s;
}

.zoom-hint:hover {
  background: rgba(42, 26, 14, 0.85);
}

.no-image {
  background: var(--color-surface);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
  height: 340px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
  font-style: italic;
}

.additional-images {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.add-images-label {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-text-muted);
}

.add-images-row {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.add-image-thumb {
  width: 70px;
  height: 70px;
  object-fit: cover;
  border-radius: var(--radius-sm);
  border: 1.5px solid var(--color-border-light);
  cursor: zoom-in;
  transition: border-color 0.2s, transform 0.2s;
}

.add-image-thumb:hover {
  border-color: var(--color-gold);
  transform: scale(1.05);
}

.info-column {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.info-header {
  padding-bottom: 1.25rem;
  border-bottom: 1.5px solid var(--color-border-light);
}

.artwork-title {
  font-family: var(--font-heading);
  font-size: clamp(1.4rem, 3vw, 2rem);
  font-weight: 700;
  line-height: 1.25;
  color: var(--color-text);
  margin-bottom: 0.6rem;
}

.artwork-artist {
  font-size: 1.05rem;
  color: var(--color-text-secondary);
  font-weight: 400;
}

.artist-life {
  font-style: italic;
  color: var(--color-text-muted);
  font-size: 0.95rem;
}

.artist-role {
  font-size: 0.82rem;
  color: var(--color-text-muted);
  margin-top: 0.2rem;
  font-style: italic;
}

.highlight-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.3rem 0.85rem;
  background: linear-gradient(135deg, var(--color-gold) 0%, var(--color-gold-dark) 100%);
  color: #2A1A0E;
  border-radius: var(--radius-sm);
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.04em;
}

.info-section {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.section-heading {
  font-family: var(--font-heading);
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--color-gold-dark);
  padding-bottom: 0.3rem;
  border-bottom: 1px solid var(--color-border-light);
}

.info-grid {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.45rem 1.25rem;
}

.info-grid dt {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;
  padding-top: 0.05rem;
}

.info-grid dd {
  font-size: 0.9rem;
  color: var(--color-text);
  line-height: 1.5;
}

.people-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.person-item {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem 0.7rem;
  align-items: baseline;
  padding: 0.4rem 0;
  border-bottom: 1px solid var(--color-border-light);
}

.person-item:last-child {
  border-bottom: none;
}

.person-name {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-text);
}

.person-role {
  font-size: 0.8rem;
  color: var(--color-accent);
  font-style: italic;
}

.person-dates, .person-places {
  font-size: 0.78rem;
  color: var(--color-text-muted);
}

.rights-text {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  font-style: italic;
}

.action-row {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  padding-top: 0.5rem;
  border-top: 1px solid var(--color-border-light);
}

.fav-btn {
  font-size: 0.9rem;
  padding: 0.55rem 1.2rem;
}

.fav-btn.fav-active {
  background: var(--color-accent);
  color: #FFF8F0;
  border-color: var(--color-accent);
}

.museum-btn {
  font-size: 0.9rem;
  padding: 0.55rem 1.2rem;
  text-decoration: none;
}

.museum-btn:hover {
  text-decoration: none;
}

.extra-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1.75rem;
  background: var(--color-surface);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border-light);
}

.extra-block {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.extra-text {
  font-size: 0.95rem;
  line-height: 1.75;
  color: var(--color-text-secondary);
}

.tags-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.tag-pill {
  padding: 0.25rem 0.7rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 999px;
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  transition: background 0.15s, border-color 0.15s, color 0.15s;
  cursor: default;
}

.tag-pill:hover {
  background: var(--color-parchment-dark);
  border-color: var(--color-gold);
  color: var(--color-text);
}

.lightbox {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.88);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 1rem;
  cursor: zoom-out;
}

.lightbox-img {
  max-width: 92vw;
  max-height: 90vh;
  object-fit: contain;
  border-radius: var(--radius-sm);
  box-shadow: 0 8px 48px rgba(0, 0, 0, 0.6);
  cursor: default;
}

.lightbox-close {
  position: absolute;
  top: 1rem;
  right: 1.5rem;
  background: none;
  border: none;
  color: #FFF8F0;
  font-size: 1.8rem;
  cursor: pointer;
  opacity: 0.75;
  transition: opacity 0.15s;
}

.lightbox-close:hover {
  opacity: 1;
}

@media (max-width: 900px) {
  .detail-main {
    grid-template-columns: 1fr;
  }

  .image-column {
    position: static;
  }
}

@media (max-width: 600px) {
  .artwork-title {
    font-size: 1.4rem;
  }

  .info-grid {
    grid-template-columns: 1fr;
    gap: 0.3rem;
  }

  .info-grid dt {
    margin-top: 0.5rem;
  }
}
</style>
