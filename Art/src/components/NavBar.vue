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
                ArtLens
            </RouterLink>

            <button
                class="menu-toggle"
                @click="toggleMenu"
                :aria-expanded="isMenuOpen"
                aria-label="Ouvrir le menu de navigation"
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
                    <RouterLink to="/profile" @click="closeMenu">
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

                <!-- Connecté : bouton de déconnexion -->
                <li v-if="userStore.isAuthenticated">
                    <button class="navbar-logout" @click="handleLogout">
                        Déconnexion
                    </button>
                </li>

                <!-- Non connecté : liens connexion / inscription -->
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
    background-color: #fff;
    border-bottom: 1px solid var(--color-border);
    position: sticky;
    top: 0;
    z-index: 100;
}

.navbar-inner {
    display: flex;
    justify-content: space-between;
    align-items: center;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0.75rem 1rem;
}

.navbar-brand {
    font-size: 1.3rem;
    font-weight: 700;
    color: var(--color-text);
    text-decoration: none;
}

.navbar-links {
    display: flex;
    list-style: none;
    gap: 1.5rem;
    margin: 0;
    padding: 0;
    align-items: center;
}

.navbar-links a {
    text-decoration: none;
    color: var(--color-text);
    font-weight: 500;
    padding: 0.25rem 0;
    transition: color 0.2s ease;
}

.navbar-links a:hover,
.navbar-links a.router-link-active {
    color: var(--color-accent);
}

/* Bouton de déconnexion stylisé comme un lien */
.navbar-logout {
    background: none;
    border: none;
    color: var(--color-text-secondary);
    font-weight: 500;
    font-size: inherit;
    cursor: pointer;
    padding: 0.25rem 0;
    transition: color 0.2s;
}

.navbar-logout:hover {
    color: #c0392b;
}

/* Bouton "S'inscrire" mis en évidence */
.nav-link-register {
    padding: 0.35rem 0.85rem !important;
    background: var(--color-accent);
    color: #fff !important;
    border-radius: 6px;
    font-weight: 600 !important;
    transition: background 0.2s !important;
}

.nav-link-register:hover {
    background: #3b5d8a;
    color: #fff !important;
}

/* Badge compteur de favoris */
.badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background-color: var(--color-accent);
    color: #fff;
    font-size: 0.7rem;
    font-weight: 700;
    min-width: 18px;
    height: 18px;
    border-radius: 9px;
    padding: 0 5px;
    margin-left: 4px;
    vertical-align: middle;
}

/* Bouton hamburger — caché sur desktop */
.menu-toggle {
    display: none;
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: var(--color-text);
}

/* ── Responsive mobile ── */
@media (max-width: 600px) {
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
        background: #fff;
        border-bottom: 1px solid var(--color-border);
        padding: 1rem;
        gap: 0.75rem;
    }

    .navbar-links.open {
        display: flex;
    }
}
</style>
