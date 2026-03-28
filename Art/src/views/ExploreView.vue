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

// Tags de suggestion pour guider les débutants avec leurs équivalents en anglais pour de meilleurs résultats
const SUGGESTION_TAGS = [
  { label: 'Fleurs', query: 'Flowers' },
  { label: 'Paysage', query: 'Landscape' },
  { label: 'Portrait', query: 'Portrait' },
  { label: 'Sculpture', query: 'Sculpture' },
  { label: 'Mythologie', query: 'Mythology' },
  { label: 'Marine', query: 'Seascape' },
  { label: 'Architecture', query: 'Architecture' },
  { label: 'Danse', query: 'Dance' }
]

onMounted(() => {
  artworkStore.loadFeaturedArtworks()
})

async function handleSearch(query) {
  searchTerm.value = query
  userStore.incrementSearchCount()
  await artworkStore.performSearch(query)
}

async function handleTagClick(tagObject) {
  // Si le tag cliqué est déjà actif → on désactive (toggle)
  if (searchTerm.value === tagObject.label) {
    searchTerm.value = ''
    artworkStore.searchQuery = '' // Nettoyage au niveau du store aussi
    artworkStore.clearResults()
    artworkStore.loadFeaturedArtworks()
    return
  }

  // Sinon → on lance la recherche avec ce tag
  searchTerm.value = tagObject.label
  userStore.incrementSearchCount()
  // On passe le mot en anglais à la fonction performSearch 
  await artworkStore.performSearch(tagObject.query, tagObject.label)
}

function handleFilterChange(filterName, value) {
  artworkStore.setFilter(filterName, value)
}

function handleResetFilters() {
  artworkStore.resetFilters()
}


const isSearchMode = computed(() => !!artworkStore.searchQuery)
</script>

<template>
  <div>
    <div class="explore-view">
      <h1 class="page-title">Explorez les œuvres</h1>

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

      <FilterPanel
        :filters="artworkStore.filters"
        :has-active-filters="artworkStore.hasActiveFilters"
        @filter-change="handleFilterChange"
        @reset-filters="handleResetFilters"
      />
    </div>

    <section class="results-section" aria-label="Résultats de recherche">
      <LoadingIcon v-if="artworkStore.isLoading" />

      <div v-else-if="artworkStore.errorMessage" class="message-error" role="alert">
        {{ artworkStore.errorMessage }}
      </div>

      <!-- Résultats (Recherche OU Sélection du moment filtrée) -->
      <template v-else-if="artworkStore.filteredResults.length > 0">
        <p class="results-count" v-if="artworkStore.searchQuery">
          {{ artworkStore.filteredResults.length }} œuvre(s) trouvée(s)
          <span v-if="artworkStore.hasActiveFilters">
            (sur {{ artworkStore.totalResults }})
          </span>
        </p>
        <p class="featured-label" v-else> 
          Sélection du moment
          <span v-if="artworkStore.hasActiveFilters" class="filter-count-info">
             (Mise à jour selon vos filtres)
          </span>
        </p>
        
        <div class="results-grid">
          <ArtworkCard
            v-for="artwork in artworkStore.filteredResults"
            :key="`${artwork.source}-${artwork.id}`"
            :artwork="artwork"
          />
        </div>
      </template>

      <!-- Aucun résultat après recherche (ou après un filtre trop strict sur la sélection) -->
      <div
        v-else-if="!artworkStore.isLoading"
        class="empty-state"
      >
        <p v-if="artworkStore.searchQuery">Aucune œuvre trouvée pour « {{ artworkStore.searchQuery }} ».</p>
        <p v-else>Aucune œuvre de la sélection du moment ne correspond à ces filtres.</p>
        <p v-if="artworkStore.hasActiveFilters">Essayez de <em>réinitialiser vos filtres</em> ou d'en utiliser de moins stricts.</p>
        <p v-else>Essayez avec d'autres termes : <em>Monet, sculpture, portrait…</em></p>
      </div>
    </section>
  </div>
</template>

<style scoped>
.explore-view {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.page-title {
  font-size: 1.8rem;
  font-weight: 700;
}

/* Tags de suggestion */
.suggestion-tags {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tags-label {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  margin-right: 0.25rem;
}

.tag-btn {
  padding: 0.35rem 0.8rem;
  border-radius: 999px;
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text);
  font-size: 0.85rem;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s, transform 0.1s;
}

.tag-btn:hover {
  background: var(--color-accent);
  border-color: var(--color-accent);
  color: #fff;
  transform: translateY(-1px);
}

.tag-btn.active {
  background: var(--color-accent);
  border-color: var(--color-accent);
  color: #fff;
  box-shadow: 0 0 0 2px rgba(var(--color-accent-rgb, 59, 93, 138), 0.2);
}

/* Résultats */
.results-section {
  min-height: 200px;
}

.results-count {
  color: var(--color-text-secondary);
  margin-bottom: 1rem;
  font-size: 0.95rem;
}

.featured-label {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text-secondary);
  margin-bottom: 1rem;
}

.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1.5rem;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--color-text-secondary);
}

.empty-state p {
  margin-bottom: 0.5rem;
}

.empty-state em {
  color: var(--color-accent);
}

.message-error {
  color: red;
  padding: 1rem;
}

@media (max-width: 600px) {
  .results-grid {
    grid-template-columns: 1fr;
  }

  .suggestion-tags {
    gap: 0.4rem;
  }
}
</style>