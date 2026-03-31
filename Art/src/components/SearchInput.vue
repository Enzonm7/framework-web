<script setup>
import { ref } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['search', 'update:modelValue'])
const inputValue = ref(props.modelValue)

function handleSubmit() {
  const trimmed = inputValue.value.trim()
  if (trimmed.length > 0) {
    emit('search', trimmed)
    emit('update:modelValue', trimmed)
  }
}

function clearInput() {
  inputValue.value = ''
  emit('update:modelValue', '')
}
</script>

<template>
  <form
    class="search-form"
    @submit.prevent="handleSubmit"
    role="search"
    aria-label="Rechercher des œuvres d'art"
  >
    <div class="search-input-wrapper">
      <input
        v-model="inputValue"
        type="text"
        class="input-field search-field"
        placeholder="Rechercher une œuvre, un artiste, une époque…"
        aria-label="Terme de recherche"
      />

      <button
        v-if="inputValue.length > 0"
        type="button"
        class="clear-btn"
        @click="clearInput"
        aria-label="Effacer la recherche"
      >
        ✕
      </button>
    </div>

    <button type="submit" class="btn btn-primary search-btn">
      Rechercher
    </button>
  </form>
</template>

<style scoped>
.search-form {
  display: flex;
  gap: 0.75rem;
  align-items: stretch;
}

.search-input-wrapper {
  flex: 1;
  position: relative;
}

.search-field {
  padding-right: 2.5rem;
}

.clear-btn {
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--color-text-muted);
  font-size: 0.9rem;
  padding: 0.25rem;
  transition: color 0.15s;
}

.clear-btn:hover {
  color: var(--color-accent);
}

.search-btn {
  white-space: nowrap;
}

@media (max-width: 480px) {
  .search-form {
    flex-direction: column;
  }

  .search-btn {
    width: 100%;
  }
}
</style>