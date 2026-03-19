<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

function goBack() {
  router.back()
}
</script>

<template>
  <div class="not-found-view" role="main" aria-label="Page non trouvée">
    <div class="not-found-content">
      <p class="error-code" aria-hidden="true">404</p>

      <h1>Page non trouvée</h1>
      <p class="error-message">
        L'œuvre que vous cherchez n'est dans aucun de nos musées…
        ou alors l'URL est incorrecte.
      </p>
      <div class="not-found-actions">
        <router-link to="/" class="btn btn-primary">
          Retour à l'accueil
        </router-link>
        <button class="btn btn-secondary" @click="goBack">
          ← Page précédente
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.not-found-view {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
}

.not-found-content {
  text-align: center;
  max-width: 500px;
}

.error-code {
  font-size: 6rem;
  font-weight: 800;
  color: var(--color-border);
  line-height: 1;
  margin-bottom: 0.5rem;
}

h1 {
  font-size: 1.5rem;
  margin-bottom: 0.75rem;
}

.error-message {
  color: var(--color-text-secondary);
  margin-bottom: 2rem;
  line-height: 1.5;
}

.not-found-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}
</style>
