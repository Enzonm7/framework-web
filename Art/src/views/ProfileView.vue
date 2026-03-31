<script setup>
import { computed } from 'vue'
import { useUserStore } from '../stores/Users.js'
import ArtworkCard from '../components/ArtworkCard.vue'

const userStore = useUserStore()

const favorites  = computed(() => userStore.favorites)
const stats      = computed(() => userStore.formattedStats)
const hasFavorites = computed(() => favorites.value.length > 0)

async function handleLogout() {
    await userStore.logout()
}

function handleClearFavorites() {
    if (window.confirm('Supprimer tous vos favoris ?')) {
        userStore.clearFavorites()
    }
}
</script>

<template>
    <div class="profile-view">

        <section class="user-section" aria-label="Informations du compte">
            <div v-if="userStore.isAuthenticated" class="user-card">
                <div class="user-avatar" aria-hidden="true">
                    {{ userStore.user.username.charAt(0).toUpperCase() }}
                </div>
                <div class="user-info">
                    <h1 class="user-name">{{ userStore.user.username }}</h1>
                    <p class="user-email">{{ userStore.user.email }}</p>
                </div>
                <button class="btn btn-outline btn-logout" @click="handleLogout">
                    Déconnexion
                </button>
            </div>

            <div v-else class="guest-card">
                <h1 class="page-title">Mon profil</h1>
                <p class="guest-text">
                    Connectez-vous pour sauvegarder vos favoris et vos statistiques sur tous vos appareils.
                </p>
                <div class="guest-actions">
                    <RouterLink to="/login" class="btn btn-primary">Se connecter</RouterLink>
                    <RouterLink to="/register" class="btn btn-outline">Créer un compte</RouterLink>
                </div>
            </div>
        </section>

        <section class="stats-section" aria-label="Statistiques de navigation">
            <h2>Statistiques{{ userStore.isAuthenticated ? '' : ' de session' }}</h2>
            <div class="stats-grid">
                <div class="stat-card">
                    <span class="stat-number">{{ stats.searchCount }}</span>
                    <span class="stat-label">Recherches</span>
                </div>
                <div class="stat-card">
                    <span class="stat-number">{{ stats.artworksViewed }}</span>
                    <span class="stat-label">Œuvres consultées</span>
                </div>
                <div class="stat-card">
                    <span class="stat-number">{{ stats.sourcesExplored }}</span>
                    <span class="stat-label">Sources explorées</span>
                </div>
                <div class="stat-card">
                    <span class="stat-number">{{ favorites.length }}</span>
                    <span class="stat-label">Favoris</span>
                </div>
            </div>
        </section>

        <section class="favorites-section" aria-label="Mes favoris">
            <div class="favorites-header">
                <h2>Mes favoris</h2>
                <button
                    v-if="hasFavorites"
                    class="btn btn-danger"
                    @click="handleClearFavorites"
                    aria-label="Supprimer tous les favoris"
                >
                    Tout supprimer
                </button>
            </div>

            <div v-if="hasFavorites" class="favorites-grid">
                <ArtworkCard
                    v-for="fav in favorites"
                    :key="`${fav.source}-${fav.id}`"
                    :artwork="fav"
                />
            </div>

            <div v-else class="empty-favorites">
                <p>Vous n'avez pas encore de favoris.</p>
                <p>Explorez les œuvres et cliquez sur 🤍 pour en ajouter !</p>
                <RouterLink to="/explore" class="btn btn-primary">
                    Explorer les œuvres
                </RouterLink>
            </div>
        </section>
    </div>
</template>

<style scoped>
.profile-view {
    display: flex;
    flex-direction: column;
    gap: 2rem;
}

.user-card {
    display: flex;
    align-items: center;
    gap: 1.25rem;
    background: var(--color-surface);
    padding: 1.5rem;
    border-radius: var(--radius-md, 8px);
    border: 1px solid var(--color-border);
    flex-wrap: wrap;
}

.user-avatar {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: var(--color-accent);
    color: #fff;
    font-size: 1.5rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.user-info {
    flex: 1;
    min-width: 0;
}

.user-name {
    font-size: 1.3rem;
    font-weight: 700;
    margin: 0 0 0.2rem;
}

.user-email {
    font-size: 0.9rem;
    color: var(--color-text-secondary);
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.btn-logout {
    margin-left: auto;
}

.guest-card {
    background: var(--color-surface);
    padding: 2rem;
    border-radius: var(--radius-md, 8px);
    border: 1px dashed var(--color-border);
    text-align: center;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    align-items: center;
}

.page-title {
    font-size: 1.8rem;
    font-weight: 700;
    margin: 0;
}

.guest-text {
    color: var(--color-text-secondary);
    max-width: 420px;
    margin: 0;
}

.guest-actions {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    justify-content: center;
}

.stats-section h2,
.favorites-header h2 {
    font-size: 1.3rem;
    margin-bottom: 1rem;
}

.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
}

.stat-card {
    background: var(--color-surface);
    padding: 1.25rem;
    border-radius: var(--radius-md, 8px);
    text-align: center;
    border: 1px solid var(--color-border);
}

.stat-number {
    display: block;
    font-family: var(--font-heading);
    font-size: 2rem;
    font-weight: 700;
    color: var(--color-accent);
}

.stat-label {
    font-size: 0.85rem;
    color: var(--color-text-secondary);
    margin-top: 0.25rem;
}

.favorites-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.favorites-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 1.5rem;
}

.empty-favorites {
    text-align: center;
    padding: 3rem 1rem;
    background: var(--color-surface);
    border-radius: var(--radius-md, 8px);
    border: 1px dashed var(--color-border);
}

.empty-favorites p {
    margin-bottom: 0.75rem;
    color: var(--color-text-secondary);
}

.empty-favorites .btn {
    margin-top: 0.5rem;
}

.btn {
    display: inline-block;
    padding: 0.6rem 1.2rem;
    border-radius: 6px;
    font-weight: 600;
    font-size: 0.9rem;
    cursor: pointer;
    text-decoration: none;
    transition: background 0.2s, border-color 0.2s, opacity 0.2s;
    border: 2px solid transparent;
}

.btn-primary {
    background: var(--color-accent);
    color: #fff;
    border-color: var(--color-accent);
}

.btn-primary:hover {
    background: var(--color-accent-hover);
    border-color: var(--color-accent-hover);
}

.btn-outline {
    background: transparent;
    color: var(--color-accent);
    border-color: var(--color-accent);
}

.btn-outline:hover {
    background: var(--color-accent);
    color: #FFF8F0;
}

.btn-danger {
    background: transparent;
    color: var(--color-error);
    border-color: var(--color-error);
}

.btn-danger:hover {
    background: var(--color-error);
    color: #FFF8F0;
}

@media (max-width: 600px) {
    .favorites-grid {
        grid-template-columns: 1fr;
    }

    .user-card {
        flex-direction: column;
        align-items: flex-start;
    }

    .btn-logout {
        margin-left: 0;
        align-self: flex-start;
    }
}
</style>
