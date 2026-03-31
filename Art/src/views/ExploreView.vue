<script setup>
import { ref, onMounted, computed } from 'vue'
import SearchInput from '@/components/SearchInput.vue'
import { useArtworkStore } from '@/stores/Artwork'
import { useUserStore } from '@/stores/Users'
import LoadingIcon from '@/components/LoadingIcon.vue'
import ArtworkCard from '@/components/ArtworkCard.vue'
import FilterPanel from '@/components/FilterPanel.vue'

const artworkStore = useArtworkStore()
const userStore = useUserStore()
const searchTerm = ref(artworkStore.searchQuery || '')

const SUGGESTION_TAGS = [
  { label: 'Fleurs',         query: 'Flowers' },
  { label: 'Paysage',        query: 'Landscape' },
  { label: 'Portrait',       query: 'Portrait' },
  { label: 'Sculpture',      query: 'Sculpture' },
  { label: 'Mythologie',     query: 'Mythology' },
  { label: 'Marine',         query: 'Seascape' },
  { label: 'Architecture',   query: 'Architecture' },
  { label: 'Danse',          query: 'Dance' },
  { label: 'Renaissance',    query: 'Renaissance' },
  { label: 'Impressionnisme',query: 'Impressionism' },
]

onMounted(async () => {
  await artworkStore.loadFeaturedArtworks()
  await artworkStore.enrichEuropeanaDetails()
})

async function handleSearch(query) {
  searchTerm.value = query
  userStore.incrementSearchCount()
  await artworkStore.performSearch(query)
}

async function handleTagClick(tagObject) {
  if (searchTerm.value === tagObject.label) {
    handleClearAll()
    return
  }
  searchTerm.value = tagObject.label
  userStore.incrementSearchCount()
  await artworkStore.performSearch(tagObject.query, tagObject.label)
}

function handleFilterChange(filterName, value) {
  artworkStore.setFilter(filterName, value)
}

function handleResetFilters() {
  artworkStore.resetFilters()
}

function handleClearAll() {
  searchTerm.value = ''
  artworkStore.clearAll()
}

const isLoading      = computed(() => artworkStore.isFeaturedLoading || artworkStore.isLoading)
const isSearchMode   = computed(() => !!artworkStore.searchQuery)
const hasActiveState = computed(() => isSearchMode.value || artworkStore.hasActiveFilters)

const filteredCount  = computed(() => artworkStore.filteredResults?.length ?? 0)
const totalCount     = computed(() => artworkStore.browseTotal ?? 0)
const currentPage    = computed(() => artworkStore.currentPage)
const totalPages     = computed(() => artworkStore.totalPages)
const pageArtworks   = computed(() => artworkStore.paginatedResults ?? [])

const pageButtons = computed(() => {
  const total = totalPages.value
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const cur = currentPage.value
  const pages = new Set([1, total])
  for (let i = Math.max(2, cur - 2); i <= Math.min(total - 1, cur + 2); i++) pages.add(i)
  const sorted = [...pages].sort((a, b) => a - b)
  const result = []
  let prev = 0
  for (const p of sorted) {
    if (p - prev > 1) result.push('…')
    result.push(p)
    prev = p
  }
  return result
})

function goToPage(page) {
  if (typeof page !== 'number') return
  artworkStore.setPage(page)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<template>
  <div class="explore-view">

    <div class="explore-header">
      <div class="header-text">
        <h1 class="page-title">Explorer les œuvres</h1>
        <p class="page-subtitle">
          Recherchez parmi des milliers d'œuvres issues du Met Museum, Harvard Art et Europeana.
        </p>
      </div>

      <button
        v-if="hasActiveState"
        class="btn-clear-all"
        @click="handleClearAll"
        title="Effacer la recherche et les filtres — afficher toutes les œuvres"
      >
        ✕ Tout effacer
      </button>
    </div>

    <div class="search-area">
      <SearchInput
        :model-value="searchTerm"
        @search="handleSearch"
      />

      <div class="suggestion-tags" aria-label="Suggestions de recherche">
        <span class="tags-label">Inspirations :</span>
        <button
          v-for="tag in SUGGESTION_TAGS"
          :key="tag.label"
          class="tag-btn"
          :class="{ active: searchTerm === tag.label }"
          @click="handleTagClick(tag)"
        >
          {{ tag.label }}
        </button>
      </div>
    </div>

    <FilterPanel
      :filters="artworkStore.filters"
      :has-active-filters="artworkStore.hasActiveFilters"
      @filter-change="handleFilterChange"
      @reset-filters="handleResetFilters"
    />

    <section class="results-section" aria-label="Résultats">

      <div v-if="isLoading" class="results-loading">
        <LoadingIcon />
        <p class="loading-text">
          {{ artworkStore.isFeaturedLoading
              ? 'Chargement des collections…'
              : 'Recherche en cours…' }}
        </p>
      </div>

      <div v-else-if="artworkStore.errorMessage" class="message-error" role="alert">
        {{ artworkStore.errorMessage }}
      </div>

      <template v-else-if="filteredCount > 0">
        <div class="results-header">
          <div class="results-meta">
            <template v-if="isSearchMode">
              <span class="results-count">
                <strong>{{ filteredCount }}</strong>
                œuvre{{ filteredCount > 1 ? 's' : '' }}
                <span v-if="artworkStore.hasActiveFilters" class="results-filtered">
                  filtrée{{ filteredCount > 1 ? 's' : '' }} sur {{ totalCount }}
                </span>
                pour <em>« {{ artworkStore.searchQuery }} »</em>
              </span>
            </template>
            <template v-else>
              <span class="results-count">
                <strong>{{ filteredCount }}</strong>
                œuvre{{ filteredCount > 1 ? 's' : '' }}
                <span v-if="artworkStore.hasActiveFilters" class="results-filtered">
                  filtrée{{ filteredCount > 1 ? 's' : '' }} sur {{ totalCount }}
                </span>
                <span v-else class="results-label"> — toutes les collections</span>
              </span>
            </template>
          </div>

          <div class="source-legend" aria-hidden="true">
            <span class="legend-item"><span class="legend-dot dot-met"></span> Met</span>
            <span class="legend-item"><span class="legend-dot dot-harvard"></span> Harvard</span>
            <span class="legend-item"><span class="legend-dot dot-europeana"></span> Europeana</span>
          </div>
        </div>

        <div class="results-grid">
          <ArtworkCard
            v-for="artwork in pageArtworks"
            :key="`${artwork.source}-${artwork.id}`"
            :artwork="artwork"
          />
        </div>

        <nav v-if="totalPages > 1" class="pagination" aria-label="Navigation des pages">
          <button
            class="page-btn page-arrow"
            :disabled="currentPage === 1"
            @click="goToPage(currentPage - 1)"
            aria-label="Page précédente"
          >
            ←
          </button>

          <button
            v-for="p in pageButtons"
            :key="p"
            class="page-btn"
            :class="{ active: p === currentPage, ellipsis: p === '…' }"
            :disabled="p === '…'"
            @click="goToPage(p)"
            :aria-label="p === '…' ? undefined : `Page ${p}`"
            :aria-current="p === currentPage ? 'page' : undefined"
          >
            {{ p }}
          </button>

          <button
            class="page-btn page-arrow"
            :disabled="currentPage === totalPages"
            @click="goToPage(currentPage + 1)"
            aria-label="Page suivante"
          >
            →
          </button>
        </nav>
      </template>

      <div v-else-if="!isLoading" class="empty-state">
        <p class="empty-icon">🔍</p>
        <p v-if="artworkStore.searchQuery" class="empty-title">
          Aucune œuvre pour « {{ artworkStore.searchQuery }} »
        </p>
        <p v-else class="empty-title">Aucun résultat pour ces filtres</p>
        <p class="empty-hint" v-if="artworkStore.hasActiveFilters">
          Essayez de réinitialiser les filtres pour voir plus d'œuvres.
        </p>
        <p class="empty-hint" v-else>
          Essayez : <em>Monet, sculpture, portrait, baroque…</em>
        </p>
        <button v-if="hasActiveState" class="btn-clear-all mt" @click="handleClearAll">
          ✕ Tout effacer et voir toutes les œuvres
        </button>
      </div>

      <div v-if="artworkStore.isFeaturedLoading && filteredCount > 0" class="loading-more">
        <LoadingIcon />
        <span>Chargement de nouvelles œuvres…</span>
      </div>

    </section>
  </div>
</template>

<style scoped>
.explore-view {
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
}

.explore-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--color-border-light);
  flex-wrap: wrap;
}

.header-text { flex: 1; min-width: 0; }

.page-title {
  font-family: var(--font-heading);
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: 0.3rem;
}

.page-subtitle {
  color: var(--color-text-secondary);
  font-size: 0.92rem;
}

.btn-clear-all {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 1.1rem;
  background: transparent;
  border: 1.5px solid var(--color-border);
  border-radius: 999px;
  color: var(--color-text-secondary);
  font-size: 0.83rem;
  font-weight: 700;
  cursor: pointer;
  transition: border-color 0.2s, color 0.2s, background 0.2s;
  white-space: nowrap;
}

.btn-clear-all:hover {
  border-color: var(--color-accent);
  color: var(--color-accent);
  background: rgba(123, 53, 34, 0.05);
}

.btn-clear-all.mt { margin-top: 1rem; }

.search-area {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

.suggestion-tags {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.45rem;
}

.tags-label {
  font-size: 0.78rem;
  color: var(--color-text-muted);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  margin-right: 0.2rem;
}

.tag-btn {
  padding: 0.3rem 0.8rem;
  border-radius: 999px;
  border: 1.5px solid var(--color-border);
  background: var(--color-parchment-light);
  color: var(--color-text-secondary);
  font-size: 0.82rem;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s, color 0.15s, transform 0.1s;
}

.tag-btn:hover {
  background: var(--color-accent);
  border-color: var(--color-accent);
  color: #FFF8F0;
  transform: translateY(-1px);
}

.tag-btn.active {
  background: var(--color-accent);
  border-color: var(--color-accent);
  color: #FFF8F0;
  box-shadow: 0 2px 8px rgba(123, 53, 34, 0.25);
}

.results-section { min-height: 300px; }

.results-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 4rem;
}

.loading-text {
  color: var(--color-text-muted);
  font-size: 0.9rem;
  font-style: italic;
}

.results-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.25rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--color-border-light);
  gap: 1rem;
  flex-wrap: wrap;
}

.results-count {
  font-size: 0.9rem;
  color: var(--color-text-secondary);
}

.results-count strong {
  color: var(--color-text);
  font-size: 1rem;
}

.results-count em {
  color: var(--color-accent);
  font-style: italic;
}

.results-filtered { color: var(--color-gold-dark); }
.results-label    { color: var(--color-text-muted); font-size: 0.85rem; }

.source-legend {
  display: flex;
  gap: 0.9rem;
  align-items: center;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.78rem;
  color: var(--color-text-muted);
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.dot-met       { background: rgba(120, 40, 20, 0.75); }
.dot-harvard   { background: rgba(100, 20, 20, 0.75); }
.dot-europeana { background: rgba(20, 50, 110, 0.75); }

.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1.25rem;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 4rem 1rem;
}

.empty-icon  { font-size: 2.5rem; margin-bottom: 1rem; }

.empty-title {
  font-family: var(--font-heading);
  font-size: 1.2rem;
  margin-bottom: 0.6rem;
  color: var(--color-text);
}

.empty-hint { font-size: 0.9rem; color: var(--color-text-muted); }
.empty-hint em { color: var(--color-accent); font-style: italic; }

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--color-border-light);
}

.page-btn {
  min-width: 36px;
  height: 36px;
  padding: 0 0.6rem;
  border-radius: var(--radius-sm);
  border: 1.5px solid var(--color-border);
  background: var(--color-parchment-light);
  color: var(--color-text-secondary);
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s, color 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.page-btn:hover:not(:disabled):not(.ellipsis) {
  background: var(--color-accent);
  border-color: var(--color-accent);
  color: #FFF8F0;
}

.page-btn.active {
  background: var(--color-accent);
  border-color: var(--color-accent);
  color: #FFF8F0;
  box-shadow: 0 2px 8px rgba(123, 53, 34, 0.25);
}

.page-btn:disabled {
  opacity: 0.35;
  cursor: default;
}

.page-btn.ellipsis {
  border-color: transparent;
  background: transparent;
  cursor: default;
  color: var(--color-text-muted);
}

.page-arrow {
  font-size: 1rem;
  font-weight: 700;
}

.loading-more {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  padding: 0.75rem;
  margin-top: 1rem;
  font-size: 0.82rem;
  color: var(--color-text-muted);
  font-style: italic;
}

@media (max-width: 600px) {
  .results-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
  }
  .explore-header { flex-direction: column; align-items: flex-start; }
  .page-title     { font-size: 1.6rem; }
  .source-legend  { display: none; }
  .page-btn       { min-width: 32px; height: 32px; font-size: 0.8rem; }
}
</style>
