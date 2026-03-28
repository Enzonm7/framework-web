<script setup>

const props = defineProps({
  filters: {
    type: Object,
    required: true
  },
  hasActiveFilters: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['filter-change', 'reset-filters'])

const sourceOptions = [
  { value: 'all', label: 'Toutes les sources' },
  { value: 'met', label: ' Met Museum' },
  { value: 'harvard', label: ' Harvard Art' },
  { value: 'europeana', label: ' Europeana' }
]

const periodOptions = [
  { value: 'all', label: 'Toutes les époques' },
  { value: 'ancient', label: 'Antiquité (< 500)' },
  { value: 'medieval', label: 'Médiéval (500-1500)' },
  { value: 'modern', label: 'Moderne (1500-1900)' },
  { value: 'contemporary', label: 'Contemporain (1900+)' }
]

const typeOptions = [
  { value: 'all', label: 'Tous les types' },
  { value: 'painting', label: 'Peinture' },
  { value: 'sculpture', label: 'Sculpture' },
  { value: 'photograph', label: 'Photographie' },
  { value: 'print', label: 'Gravure / Estampe' },
  { value: 'drawing', label: 'Dessin' },
  { value: 'other', label: 'Autre' }
]

function onFilterChange(filterName, event) {
  emit('filter-change', filterName, event.target.value)
}
</script>

<template>
  <div class="filter-panel" aria-label="Filtres de recherche" role="group">
    <div class="filter-row">
      <div class="filter-group">
        <label for="filter-source" class="filter-label">Source</label>

        <select
          id="filter-source"
          class="input-field filter-select"
          :value="filters.source"
          @change="onFilterChange('source', $event)"
          aria-label="Filtrer par source"
        >

          <option
            v-for="option in sourceOptions"
            :key="option.value"
            :value="option.value"
          >
            {{ option.label }}
          </option>
        </select>
      </div>

      <div class="filter-group">
        <label for="filter-period" class="filter-label">Époque</label>
        <select
          id="filter-period"
          class="input-field filter-select"
          :value="filters.period"
          @change="onFilterChange('period', $event)"
          aria-label="Filtrer par époque"
        >
          <option
            v-for="option in periodOptions"
            :key="option.value"
            :value="option.value"
          >
            {{ option.label }}
          </option>
        </select>
      </div>

      <div class="filter-group">
        <label for="filter-type" class="filter-label">Type</label>
        <select
          id="filter-type"
          class="input-field filter-select"
          :value="filters.type"
          @change="onFilterChange('type', $event)"
          aria-label="Filtrer par type d'œuvre"
        >
          <option
            v-for="option in typeOptions"
            :key="option.value"
            :value="option.value"
          >
            {{ option.label }}
          </option>
        </select>
      </div>

      <!-- Bouton reset — affiché seulement si des filtres sont actifs -->
      <button
        v-if="hasActiveFilters"
        class="btn btn-secondary reset-btn"
        @click="emit('reset-filters')"
        aria-label="Réinitialiser les filtres"
      >
        Réinitialiser
      </button>
    </div>

    <slot></slot>
  </div>
</template>

<style scoped>
.filter-panel {
  padding: 1rem;
  background: var(--color-surface);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
}

.filter-row {
  display: flex;
  gap: 1rem;
  align-items: flex-end;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  min-width: 180px;
}

.filter-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.filter-select {
  min-width: 180px;
}

.reset-btn {
  align-self: flex-end;
  font-size: 0.85rem;
  padding: 0.5rem 1rem;
}

@media (max-width: 600px) {
  .filter-row {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-group {
    min-width: 100%;
  }

  .reset-btn {
    width: 100%;
  }
}
</style>