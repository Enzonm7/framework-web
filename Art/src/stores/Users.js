import { defineStore } from 'pinia'
import { authService } from '../services/authService.js'

const LS_KEY = 'artlens-favorites'

export const useUserStore = defineStore('user', {
    state: () => ({
        /** Utilisateur connecté : { id, username, email } ou null */
        user: null,

        isLoading: false,
        authError: '',

        favorites: [],

        stats: {
            searchCount:     0,
            artworksViewed:  0,
            sourcesExplored: 0,   // nombre (pas un Set)
        }
    }),

    getters: {
        isAuthenticated: state => !!state.user,

        isFavorite: state => (source, id) =>
            state.favorites.some(
                f => f.source === source && String(f.id) === String(id)
            ),

        favoritesCount: state => state.favorites.length,

        formattedStats: state => state.stats,
    },

    actions: {
        // ----------------------------------------------------------------
        //  Initialisation au démarrage de l'app
        // ----------------------------------------------------------------
        // Appelé au démarrage dans main.js avant le premier rendu.
        // Stratégie : on essaie de récupérer une session Firebase existante.
        // Si connecté → on charge depuis Firestore.
        // Si non connecté → on charge les favoris sauvegardés en localStorage.
        async init() {
            try {
                const user = await authService.getMe()
                this.user = user
                await this._loadFromApi()
            } catch {
                // Pas de session active — charger les favoris locaux
                this._loadFromLocalStorage()
            }
        },

        // ----------------------------------------------------------------
        //  Inscription
        // ----------------------------------------------------------------
        async register(username, email, password) {
            this.isLoading = true
            this.authError = ''
            try {
                const user = await authService.register(username, email, password)
                this.user = user
                // Nouveau compte : état vide
                this.favorites = []
                this.stats = { searchCount: 0, artworksViewed: 0, sourcesExplored: 0 }
            } catch (err) {
                this.authError = err.response?.data?.error || 'Erreur lors de l\'inscription'
                throw err
            } finally {
                this.isLoading = false
            }
        },

        // ----------------------------------------------------------------
        //  Connexion
        // ----------------------------------------------------------------
        async login(email, password) {
            this.isLoading = true
            this.authError = ''
            try {
                const user = await authService.login(email, password)
                this.user = user
                await this._loadFromApi()
            } catch (err) {
                this.authError = err.response?.data?.error || 'Identifiants incorrects'
                throw err
            } finally {
                this.isLoading = false
            }
        },

        // ----------------------------------------------------------------
        //  Déconnexion
        // ----------------------------------------------------------------
        async logout() {
            try {
                await authService.logout()
            } catch {
                // On vide quand même le store même si la requête échoue
            }
            this.user     = null
            this.favorites = []
            this.stats    = { searchCount: 0, artworksViewed: 0, sourcesExplored: 0 }
        },

        // ----------------------------------------------------------------
        //  Favoris
        // ----------------------------------------------------------------
        // Double logique selon l'état de connexion :
        // - Connecté → synchronisation avec Firestore via authService
        // - Non connecté → stockage local uniquement (localStorage)
        async toggleFavorite(artwork) {
            if (this.user) {
                const result = await authService.toggleFavorite(artwork)
                if (result.isFavorite) {
                    this.favorites.push({
                        id:        artwork.id,
                        source:    artwork.source,
                        title:     artwork.title,
                        artist:    artwork.artist,
                        thumbnail: artwork.thumbnail,
                        date:      artwork.date,
                    })
                } else {
                    const idx = this.favorites.findIndex(
                        f => f.source === artwork.source && String(f.id) === String(artwork.id)
                    )
                    if (idx !== -1) this.favorites.splice(idx, 1)
                }
            } else {
                const idx = this.favorites.findIndex(
                    f => f.source === artwork.source && String(f.id) === String(artwork.id)
                )
                if (idx !== -1) {
                    this.favorites.splice(idx, 1)
                } else {
                    this.favorites.push({
                        id:        artwork.id,
                        source:    artwork.source,
                        title:     artwork.title,
                        artist:    artwork.artist,
                        thumbnail: artwork.thumbnail,
                        date:      artwork.date,
                    })
                }
                this._saveToLocalStorage()
            }
        },

        clearFavorites() {
            this.favorites = []
            if (!this.user) this._saveToLocalStorage()
        },

        // ----------------------------------------------------------------
        //  Statistiques
        // ----------------------------------------------------------------
        incrementSearchCount() {
            this.stats.searchCount++
            if (this.user) {
                authService.updateStat('search').catch(() => {})
            }
        },

        recordArtworkView(source) {
            this.stats.artworksViewed++
            if (this.user) {
                authService.updateStat('view', source).catch(() => {})
            }
        },

        // ----------------------------------------------------------------
        //  Helpers privés
        // ----------------------------------------------------------------
        async _loadFromApi() {
            const [favorites, stats] = await Promise.all([
                authService.getFavorites(),
                authService.getStats(),
            ])
            this.favorites = favorites
            this.stats     = stats
        },

        _loadFromLocalStorage() {
            try {
                const stored = localStorage.getItem(LS_KEY)
                this.favorites = stored ? JSON.parse(stored) : []
            } catch {
                this.favorites = []
            }
        },

        _saveToLocalStorage() {
            try {
                localStorage.setItem(LS_KEY, JSON.stringify(this.favorites))
            } catch {
                // quota dépassé ou navigation privée
            }
        },
    }
})
