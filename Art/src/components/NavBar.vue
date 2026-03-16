<script setup>
import { useUserStore } from '@/stores/Users';
import { computed, ref } from 'vue';


const userStore = useUserStore()
const favoritesCount = computed(() => userStore.favorites?.length || 0)
const isMenuOpen = ref(false)

function toggleMenu() {
    isMenuOpen.value = !isMenuOpen.value
}

function closeMenu() {
    isMenuOpen.value = false
}

</script>

<template>
    <nav>
        <div>
            <RouterLink to="/" @click="closeMenu">
                ArtLens
            </RouterLink>
            <button
                @click="toggleMenu"
                :aria-expanded="isMenuOpen"
            >
                <span v-if="!isMenuOpen">☰</span>
                <span v-else>✕</span>
            </button>

            <ul :class="{ open: isMenuOpen}">
                <li>
                    <RouterLink to="/" @click="closeMenu">Accueil</RouterLink>
                </li>
                <li>
                    <RouterLink to="/explore" @click="closeMenu">Explorer</RouterLink>
                </li>
                <li>
                    <RouterLink to="/profile" @click="closeMenu">
                        Profil
                        <span v-if="favoritesCount > 0">
                            {{ favoritesCount }}
                        </span>
                    </RouterLink>
                </li>
            </ul>
        </div>
    </nav>
</template>