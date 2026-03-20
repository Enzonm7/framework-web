<script setup>
import { ref } from 'vue';
import SearchInput from '@/components/SearchInput.vue';
import { useArtworkStore } from '@/stores/Artwork';
import { useUserStore } from '@/stores/Users';
import LoadingIcon from '@/components/LoadingIcon.vue';
import ArtworkCard from '@/components/ArtworkCard.vue';
import FilterPanel from '@/components/FilterPanel.vue';

const artworkStore = useArtworkStore()
const userStore = useUserStore()
const searchTerm = ref(artworkStore.searchQuery || '')

async function handleSearch(query) {
  searchTerm.value = query
  userStore.incrementSearchCount()
  await artworkStore.performSearch(query)
}

/**
 * Gestion du changement de filtre, émis par FilterPanel.
 */
function handleFilterChange(filterName, value) {
  artworkStore.setFilter(filterName, value)
}

/**
 * Réinitialise tous les filtres.
 */
function handleResetFilters() {
  artworkStore.resetFilters()
}
</script>

<template>
    <div class="explore-view">
        <h1 class="page-title">Explorez les œuvres</h1>
        <SearchInput
            :model-value="searchTerm"
            @search="handleSearch"
        />

        <FilterPanel
            :filters="artworkStore.filters"
            :has-active-filters="artworkStore.hasActiveFilters"
            @filter-change="handleFilterChange"
            @reset-filters="handleResetFilters"
        />
    </div>

    <section class="results-section" aria-label="Résultats de recherche">
        <LoadingIcon v-if="artworkStore.isLoading"/>

        <div v-else-if="artworkStore.errorMessage" class="message-error" role="alert">
            {{ artworkStore.errorMessage }}
        </div>

        <template v-else-if="artworkStore.filteredResults.length > 0">
            <p class="results-count">
                {{ artworkStore.filteredResults.length }} œuvre(s) trouvée(s)
                <span v-if="artworkStore.hasActiveFilters">
                    ({{ artworkStore.totalResults }} au total)
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

        <div
            v-else-if="artworkStore.searchQuery && !artworkStore.isLoading"
            class="empty-state"
        >
            <p>Aucune œuvre trouvée pour « {{ artworkStore.searchQuery }} ».</p>
            <p>Essayez avec d'autres termes : <em>Monet, sculpture, portrait…</em></p>
        </div>
        <div v-else class="empty-state initial">
            <p>🔍 Recherchez une œuvre pour commencer l'exploration.</p>
            <p>>Essayez : <em>Monet, Van Gogh, landscape, portrait…</em></p>
        </div>
    </section>
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

.results-section {
  min-height: 200px;
}

.results-count {
  color: var(--color-text-secondary);
  margin-bottom: 1rem;
  font-size: 0.95rem;
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

.empty-state.initial {
  background: var(--color-surface);
  border-radius: var(--radius-md);
  border: 1px dashed var(--color-border);
}

.empty-state p {
  margin-bottom: 0.5rem;
}

.empty-state em {
  color: var(--color-accent);
}

@media (max-width: 600px) {
  .results-grid {
    grid-template-columns: 1fr;
  }
}
</style>