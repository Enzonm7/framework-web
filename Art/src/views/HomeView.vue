<script setup>
import { computed, onMounted, ref } from 'vue';


const featuredArtworks = ref([])
const isLoading = ref(true)
const errorMessage = ref('')

const hasFeatured = computed(() => featuredArtworks.value.length > 0)

onMounted(async () => {
    try {
        const results = await searchMet('impressionism')
        featuredArtworks.value = results.filter(item => item.image).slice(0, 6)
    } catch (error) {
        errorMessage.value = 'Impossible de charger les œuvres vedettes.'
        console.error('HomeView — erreur chargement :', error)
    }   finally {
        isLoading.value = false
    }
    
})
</script>

<template>
    <div>
        <section>
            <h1>Bienvenue sur ArtLens</h1>
            <p>
                Explorez des milliers d'œuvres d'art provenant des plus grands musées du monde. 
                Met Museum, Harvard Art Museums et Europeana réunis en un seul endroit.
            </p>
        </section>
        
        <section>
            <h2>À la une</h2>
            <div v-if="isLoa"></div>
        </section>
    </div>
</template>