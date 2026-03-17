<!-- LoadingSpinner.vue — Indicateur de chargement -->

<script setup>
defineProps({
  message: { type: String, default: 'Chargement en cours…' }
})
</script>

<template>
  <div class="loading-spinner" role="status" aria-live="polite">
    <div class="spinner" aria-hidden="true"></div>
    <p class="loading-text">{{ message }}</p>
    <slot></slot>
  </div>
</template>

<style scoped>
.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  gap: 1rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  color: var(--color-text-secondary);
  font-size: 0.95rem;
}
</style>