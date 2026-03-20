<template>
  <div class="artwork-detail">
    <div v-if="loading" class="loading">Chargement...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else-if="artwork" class="artwork-content">
      <button @click="$router.back()" class="back-btn">← Retour</button>
      <div class="artwork-layout">
        <div class="artwork-image">
          <img v-if="artwork.image" :src="artwork.image" :alt="artwork.title" />
          <div v-else class="no-image">Aucune image disponible</div>
        </div>
        <div class="artwork-info">
          <h1>{{ artwork.title }}</h1>
          <p v-if="artwork.artist"><strong>Artiste :</strong> {{ artwork.artist }}</p>
          <p v-if="artwork.date"><strong>Date :</strong> {{ artwork.date }}</p>
          <p v-if="artwork.medium"><strong>Médium :</strong> {{ artwork.medium }}</p>
          <p v-if="artwork.dimensions"><strong>Dimensions :</strong> {{ artwork.dimensions }}</p>
          <p v-if="artwork.department"><strong>Département :</strong> {{ artwork.department }}</p>
          <p v-if="artwork.source"><strong>Source :</strong> {{ artwork.source }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getArtworkDetail } from '@/services/artAggregator.js'

const route = useRoute()
const artwork = ref(null)
const loading = ref(true)
const error = ref(null)

onMounted(async () => {
  const { source, id } = route.params
  try {
    const data = await getArtworkDetail(source, id)
    artwork.value = {
      title: data.title || 'Sans titre',
      artist: data.artist || 'Artiste inconnu',
      date: data.date || 'Date inconnue',
      medium: data.medium || '',
      dimensions: data.dimensions || '',
      department: data.department || '',
      image: data.image || data.thumbnail || null,
      source: data.source || source
    }
  } catch (e) {
    if (e.message.includes('Source inconnue')) {
      error.value = `Source inconnue : ${source}`
    } else {
      error.value = 'Erreur lors du chargement de l\'œuvre.'
    }
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.artwork-detail {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.back-btn {
  margin-bottom: 1.5rem;
  background: none;
  border: 1px solid var(--color-border, #ccc);
  padding: 0.5rem 1rem;
  cursor: pointer;
  border-radius: 4px;
}

.artwork-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

@media (max-width: 768px) {
  .artwork-layout {
    grid-template-columns: 1fr;
  }
}

.artwork-image img {
  width: 100%;
  height: auto;
  border-radius: 8px;
}

.no-image {
  background: #f0f0f0;
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  color: #999;
}

.artwork-info h1 {
  margin-bottom: 1rem;
}

.artwork-info p {
  margin-bottom: 0.5rem;
}

.loading, .error {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.error {
  color: #e53e3e;
}
</style>
