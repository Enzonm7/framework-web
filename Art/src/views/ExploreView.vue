<script setup>
import { ref } from 'vue';
import SearchInput from '@/components/SearchInput.vue';
import { useArtworkStore } from '@/stores/Artwork';
import { useUserStore } from '@/stores/Users';

const artworkStore = useArtworkStore()
const userStore = useUserStore()
const searchTerm = ref(artworkStore.searchQuery || '')

async function handleSearch(query) {
  searchTerm.value = query
  userStore.incrementSearchCount()
  await artworkStore.performSearch(query)
}
</script>

<template>
    <div>
        <h1>Explorez les œuvres</h1>
        <SearchInput
            :model-value="searchTerm"
            @search="handleSearch"
        />
    </div>
</template>

<style scoped>
</style>