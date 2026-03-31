<script setup>
import { computed, ref } from 'vue'
import { useUserStore } from '@/stores/Users'

const userStore      = useUserStore()
const favoritesCount = computed(() => userStore.favoritesCount)
const isMenuOpen     = ref(false)

function toggleMenu() {
    isMenuOpen.value = !isMenuOpen.value
}

function closeMenu() {
    isMenuOpen.value = false
}

async function handleLogout() {
    closeMenu()
    await userStore.logout()
}
</script>

<template>
    <nav class="navbar" aria-label="Navigation principale">
        <div class="navbar-inner">
            <RouterLink to="/" class="navbar-brand" @click="closeMenu">
                <span class="brand-art">Art</span><span class="brand-lens">Lens</span>
            </RouterLink>

            <button
                class="menu-toggle"
                @click="toggleMenu"
                :aria-expanded="isMenuOpen"
                aria-label="Ouvrir le menu"
            >
                <span v-if="!isMenuOpen">☰</span>
                <span v-else>✕</span>
            </button>

            <ul class="navbar-links" :class="{ open: isMenuOpen }">
                <li>
                    <RouterLink to="/" @click="closeMenu">Accueil</RouterLink>
                </li>
                <li>
                    <RouterLink to="/explore" @click="closeMenu">Explorer</RouterLink>
                </li>
                <li>
                    <RouterLink to="/profile" @click="closeMenu" class="nav-profile-link">
                        <template v-if="userStore.isAuthenticated">
                            {{ userStore.user.username }}
                        </template>
                        <template v-else>
                            Profil
                        </template>
                        <span v-if="favoritesCount > 0" class="badge">
                            {{ favoritesCount }}
                        </span>
                    </RouterLink>
                </li>

                <li v-if="userStore.isAuthenticated">
                    <button class="navbar-logout" @click="handleLogout">
                        Déconnexion
                    </button>
                </li>

                <template v-else>
                    <li>
                        <RouterLink to="/login" @click="closeMenu" class="nav-link-auth">
                            Connexion
                        </RouterLink>
                    </li>
                    <li>
                        <RouterLink to="/register" @click="closeMenu" class="nav-link-register">
                            S'inscrire
                        </RouterLink>
                    </li>
                </template>
            </ul>
        </div>
    </nav>
</template>

<style scoped>
.navbar {
    background-color: #2A1A0E;
    border-bottom: 2px solid var(--color-gold-dark);
    position: sticky;
    top: 0;
    z-index: 100;
}

.navbar-inner {
    display: flex;
    justify-content: space-between;
    align-items: center;
    max-width: 1280px;
    margin: 0 auto;
    padding: 0.8rem 1.5rem;
}

.navbar-brand {
    font-family: var(--font-heading);
    font-size: 1.5rem;
    font-style: italic;
    text-decoration: none;
    letter-spacing: 0.02em;
    transition: opacity 0.2s;
}

.navbar-brand:hover {
    opacity: 0.85;
    text-decoration: none;
}

.brand-art {
    color: var(--color-gold);
}

.brand-lens {
    color: var(--color-parchment-light, #FDFAF3);
}

.navbar-links {
    display: flex;
    list-style: none;
    gap: 1.75rem;
    margin: 0;
    padding: 0;
    align-items: center;
}

.navbar-links a {
    text-decoration: none;
    color: #E8DFC8;
    font-weight: 400;
    font-size: 0.9rem;
    letter-spacing: 0.02em;
    padding: 0.2rem 0;
    border-bottom: 1.5px solid transparent;
    transition: color 0.2s ease, border-color 0.2s ease;
}

.navbar-links a:hover {
    color: var(--color-gold-light);
    border-bottom-color: var(--color-gold-light);
    text-decoration: none;
}

.navbar-links a.router-link-active {
    color: var(--color-gold);
    border-bottom-color: var(--color-gold);
}

.navbar-logout {
    background: none;
    border: none;
    color: #9A8A78;
    font-weight: 400;
    font-size: 0.9rem;
    cursor: pointer;
    padding: 0.2rem 0;
    transition: color 0.2s;
    letter-spacing: 0.02em;
}

.navbar-logout:hover {
    color: #D98080;
}

.nav-link-register {
    padding: 0.4rem 1rem !important;
    background: var(--color-accent) !important;
    color: #FFF8F0 !important;
    border-radius: var(--radius-sm) !important;
    font-weight: 700 !important;
    border-bottom: none !important;
    transition: background 0.2s, opacity 0.2s !important;
    letter-spacing: 0.03em !important;
}

.nav-link-register:hover {
    background: var(--color-accent-hover) !important;
    color: #FFF8F0 !important;
    border-bottom-color: transparent !important;
}

.nav-link-auth {
    color: #C8B99A !important;
}

.badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background-color: var(--color-gold);
    color: #2A1A0E;
    font-size: 0.65rem;
    font-weight: 700;
    min-width: 17px;
    height: 17px;
    border-radius: 9px;
    padding: 0 4px;
    margin-left: 5px;
    vertical-align: middle;
}

.menu-toggle {
    display: none;
    background: none;
    border: none;
    font-size: 1.4rem;
    cursor: pointer;
    color: var(--color-gold);
}

@media (max-width: 640px) {
    .menu-toggle {
        display: block;
    }

    .navbar-links {
        display: none;
        flex-direction: column;
        align-items: flex-start;
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: #2A1A0E;
        border-bottom: 2px solid var(--color-gold-dark);
        padding: 1rem 1.5rem;
        gap: 0.9rem;
    }

    .navbar-links.open {
        display: flex;
    }
}
</style>
