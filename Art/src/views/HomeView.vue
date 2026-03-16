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
    <div class="">
        <section>
            <h1>Bienvenue sur ArtLens</h1>
            <p>
                Explorez des milliers d'œuvres d'art provenant des plus grands musées du monde. 
                Met Museum, Harvard Art Museums et Europeana réunis en un seul endroit.
            </p>

            <RouterLink to="/explore">
                Explorer les œuvres
            </RouterLink>
        </section>
        
        <section class="">
            <h2>À la une</h2>
            <div v-if="isLoading" class="">
                Chargement des oeuvres vedettes...
            </div>

            <div v-else-if="errorMessage" class="">
                {{ errorMessage }}
            </div>

            <div v-else-if="hasFeatured" class="">
                <div
                    v-for="artwork in featuredArtworks"
                    :key="artwork.id"
                    class=""
                >
                    <img 
                        :src="artwork.image" 
                        :alt="artwork.title || 'Œuvre sans titre'"
                    />
                    <div>
                        <h3>{{ artwork.title || 'Sans titre' }}</h3>
                        <p>{{ artwork.artist || 'Artiste inconnu' }}</p>
                    </div>
                </div>
            </div>

            <div>
                Aucune œuvre vedette disponible pour le moment.
            </div>
        </section>

        <section>
            <h2>Trois musées, une plateforme</h2>
            <div>
                <div>
                    <h3>Met Museum</h3>
                    <p>Plus de 470 000 œuvres du Metropolitan Museum of Art de New York.</p>
                </div>
                <div>
                    <h3>Harvard Art Museums</h3>
                    <p>Les collections des musées d'art de l'Université Harvard.</p>
                </div>
                <div>
                    <h3>Europeana</h3>
                    <p>Le patrimoine culturel européen numérisé et accessible à tous.</p>
                </div>
            </div>
        </section>
    </div>
</template>

<style scoped>
</style>