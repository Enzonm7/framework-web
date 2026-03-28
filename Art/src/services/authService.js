import axios from 'axios'

// Instance axios dédiée à l'API PHP
// withCredentials = true pour envoyer automatiquement le cookie de session
const api = axios.create({
    baseURL: '/api',
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' }
})

export const authService = {
    /** Crée un compte et ouvre une session. */
    async register(username, email, password) {
        const { data } = await api.post('/auth/register.php', { username, email, password })
        return data // { id, username, email }
    },

    /** Authentifie l'utilisateur et ouvre une session. */
    async login(email, password) {
        const { data } = await api.post('/auth/login.php', { email, password })
        return data // { id, username, email }
    },

    /** Ferme la session côté serveur. */
    async logout() {
        await api.post('/auth/logout.php')
    },

    /**
     * Vérifie si une session est déjà active (utilisé au chargement de l'app).
     * Lance une erreur 401 si non connecté.
     */
    async getMe() {
        const { data } = await api.get('/auth/me.php')
        return data // { id, username, email }
    },

    /** Récupère la liste des favoris de l'utilisateur connecté. */
    async getFavorites() {
        const { data } = await api.get('/favorites/get.php')
        return data // [{ id, source, title, artist, thumbnail, date }, ...]
    },

    /**
     * Ajoute ou retire une œuvre des favoris.
     * @param {Object} artwork - { id, source, title, artist, thumbnail, date }
     * @returns {{ action: 'added'|'removed', isFavorite: boolean }}
     */
    async toggleFavorite(artwork) {
        const { data } = await api.post('/favorites/toggle.php', {
            id:        artwork.id,
            source:    artwork.source,
            title:     artwork.title     ?? '',
            artist:    artwork.artist    ?? '',
            thumbnail: artwork.thumbnail ?? '',
            date:      artwork.date      ?? '',
        })
        return data
    },

    /** Récupère les stats persistées de l'utilisateur connecté. */
    async getStats() {
        const { data } = await api.get('/stats/get.php')
        return data // { searchCount, artworksViewed, sourcesExplored }
    },

    /**
     * Met à jour une statistique en arrière-plan.
     * @param {'search'|'view'} type
     * @param {string|null} source - ex: 'met', 'harvard', 'europeana'
     */
    async updateStat(type, source = null) {
        await api.post('/stats/update.php', { type, source })
    }
}
