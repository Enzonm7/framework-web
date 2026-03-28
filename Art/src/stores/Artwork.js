import { defineStore } from 'pinia'
import { searchAll } from '../services/artAggregator.js'

const FEATURED_TERMS = [
  'landscape', 'portrait', 'sculpture', 'mythology',
  'flower', 'renaissance', 'impressionism', 'abstract'
]

export const useArtworkStore = defineStore('artwork', {
  state: () => ({
    results: [],
    featuredArtworks: [],
    isFeaturedLoading: false,
    searchQuery: '',

    isLoading: false,
    errorMessage: '',
    filters: {
      source: 'all',
      period: 'all',
      type: 'all'
    }
  }),

  getters: {
    totalResults(state) {
      return state.results.length
    },

    filteredResults(state) {
      const baseList = state.searchQuery ? state.results : state.featuredArtworks

      let filtered = [...baseList]
      if (state.filters.source !== 'all') {
        filtered = filtered.filter(art => art.source === state.filters.source)
      }

      if (state.filters.period !== 'all') {
        filtered = filtered.filter(art => guessPeriod(art.date) === state.filters.period)
      }

      if (state.filters.type !== 'all') {
        filtered = filtered.filter(art => guessType(art.medium) === state.filters.type)
      }

      return filtered
    },

    hasActiveFilters(state) {
      return Object.values(state.filters).some(value => value !== 'all')
    }
  },

  actions: {
    async performSearch(query, displayQuery = null) {
      if (!query || query.trim().length === 0) return

      this.searchQuery = displayQuery ? displayQuery.trim() : query.trim()
      this.isLoading = true
      this.errorMessage = ''
      this.results = []

      try {
        // Chargement progressif : on ajoute les résultats dès que chaque API répond
        await searchAll(query.trim(), 5, (partialResults) => {
          this.results = deduplicateAndShuffle([...this.results, ...partialResults])
        })
      } catch (error) {
        this.errorMessage = 'Erreur lors de la recherche. Veuillez réessayer.'
        console.error('artworkStore — erreur recherche :', error)
      } finally {
        this.isLoading = false
      }
    },

    async loadFeaturedArtworks() {
      // Vérification de cache : ne recharge pas si déjà chargé
      if (this.featuredArtworks.length > 0) return

      this.isFeaturedLoading = true
      try {
        const randomTerm = FEATURED_TERMS[Math.floor(Math.random() * FEATURED_TERMS.length)]
        const seen = new Set()

        // Chargement progressif : on affiche les œuvres au fur et à mesure
        await searchAll(randomTerm, 4, (partialResults) => {
          const newItems = partialResults.filter(art => {
            if (!art.thumbnail && !art.image) return false
            const key = `${art.source}-${art.id}`
            if (seen.has(key)) return false
            seen.add(key)
            return true
          })
          // On limite à 12 au total
          const remaining = 12 - this.featuredArtworks.length
          if (remaining > 0) {
            this.featuredArtworks = [
              ...this.featuredArtworks,
              ...newItems.slice(0, remaining)
            ]
          }
        })
      } catch (error) {
        console.error('artworkStore — erreur featured :', error)
      } finally {
        this.isFeaturedLoading = false
      }
    },

    setFilter(filterName, value) {
      if (Object.prototype.hasOwnProperty.call(this.filters, filterName)) {
        this.filters[filterName] = value
      }
    },

    resetFilters() {
      this.filters.source = 'all'
      this.filters.period = 'all'
      this.filters.type = 'all'
    },

    clearResults() {
      this.results = []
      this.searchQuery = ''
      this.errorMessage = ''
      this.resetFilters()
    }
  }
})

/** Dédoublonne et mélange aléatoirement un tableau d'œuvres. */
function deduplicateAndShuffle(artworks) {
  const seen = new Set()
  const unique = artworks.filter(art => {
    const key = `${art.source}-${art.id}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
  // Mélange léger pour éviter que la même source soit toujours en tête
  for (let i = unique.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[unique[i], unique[j]] = [unique[j], unique[i]]
  }
  return unique
}

function guessPeriod(dateStr) {
  if (!dateStr) return 'unknown'
  const match = dateStr.match(/(\d{4})/)
  if (!match) return 'unknown'
  const year = parseInt(match[1], 10)
  if (year < 500)  return 'ancient'
  if (year < 1500) return 'medieval'
  if (year < 1900) return 'modern'
  return 'contemporary'
}

function guessType(medium) {
  if (!medium) return 'other'
  const m = medium.toLowerCase()

  if (m.includes('oil') || m.includes('acrylic') || m.includes('tempera') ||
      m.includes('watercolor') || m.includes('gouache') || m.includes('peinture') ||
      m.includes('canvas') || m.includes('fresco')) return 'painting'

  if (m.includes('sculpt') || m.includes('bronze') || m.includes('marble') ||
      m.includes('stone') || m.includes('ceramic') || m.includes('terracotta') ||
      m.includes('wood') || m.includes('ivory')) return 'sculpture'

  if (m.includes('photograph') || m.includes('gelatin') || m.includes('daguerreotype') ||
      m.includes('photo') || m.includes('silver print')) return 'photograph'

  if (m.includes('engrav') || m.includes('etch') || m.includes('lithograph') ||
      m.includes('woodcut') || m.includes('print') || m.includes('gravure') ||
      m.includes('estampe')) return 'print'

  if (m.includes('draw') || m.includes('pencil') || m.includes('chalk') ||
      m.includes('charcoal') || m.includes('ink') || m.includes('pastel') ||
      m.includes('crayon') || m.includes('dessin')) return 'drawing'

  return 'other'
}
