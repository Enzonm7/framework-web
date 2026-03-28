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
      // On choisit la base sur laquelle filtrer
      const baseList = state.searchQuery ? state.results : state.featuredArtworks

      let filtered = [...baseList]
      if (state.filters.source !== 'all') {
        filtered = filtered.filter(art => art.source === state.filters.source)
      }

      if (state.filters.period !== 'all') {
        filtered = filtered.filter(art => {
          const period = guessPeriod(art.date)
          return period === state.filters.period
        })
      }

      if (state.filters.type !== 'all') {
        filtered = filtered.filter(art => {
          return guessType(art.medium) === state.filters.type
        })
      }

      return filtered
    },

    hasActiveFilters(state) {
      return Object.values(state.filters).some(value => value !== 'all')
    }
  },

  actions: {
    // on accepte un displayQuery (ex: "Fleurs") pour l'interface, 
    // et on utilise query (ex: "Flowers") pour la vraie recherche
    async performSearch(query, displayQuery = null) {
      if (!query || query.trim().length === 0) {
        return
      }
      // Si displayQuery est fourni on l'utilise pour le store (barre de recherche), sinon le query par défaut
      this.searchQuery = displayQuery ? displayQuery.trim() : query.trim()
      this.isLoading = true
      this.errorMessage = ''
      this.results = []

      try {
        // En revanche, on fait l'appel API avec la vraie query (ex: "Flowers")
        const allResults = await searchAll(query.trim())
        this.results = allResults
      } catch (error) {
        this.errorMessage = 'Erreur lors de la recherche. Veuillez réessayer.'
        console.error('artworkStore — erreur recherche :', error)
      } finally {
        this.isLoading = false
      }
    },

    async loadFeaturedArtworks() {
      this.featuredArtworks = []
      this.isFeaturedLoading = true
      try {
        const randomTerm = FEATURED_TERMS[Math.floor(Math.random() * FEATURED_TERMS.length)]
        const results = await searchAll(randomTerm)
        // On mélange et on garde 12 œuvres max avec une image
        const seen = new Set()
        this.featuredArtworks = results
          .filter(art => {
            if (!art.thumbnail && !art.image) return false
            const key = `${art.source}-${art.id}`
            if (seen.has(key)) return false
            seen.add(key)
            return true
          })
          .sort(() => Math.random() - 0.5)
          .slice(0, 12)
      } catch (error) {
        console.error('artworkStore — erreur featured :', error)
      } finally {
        this.isFeaturedLoading = false
      }
    },

    setFilter(filterName, value) {
      if (this.filters.hasOwnProperty(filterName)) {
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

function guessPeriod(dateStr) {
  if (!dateStr) return 'unknown'
  const match = dateStr.match(/(\d{4})/)
  if (!match) return 'unknown'

  const year = parseInt(match[1], 10)

  if (year < 500) return 'ancient'
  if (year < 1500) return 'medieval'
  if (year < 1900) return 'modern'
  return 'contemporary'
}

function guessType(medium) {
  if (!medium) return 'other'

  const m = medium.toLowerCase()

  if (m.includes('oil') || m.includes('acrylic') || m.includes('tempera') ||
      m.includes('watercolor') || m.includes('gouache') || m.includes('peinture') ||
      m.includes('canvas') || m.includes('fresco')) {
    return 'painting'
  }

  if (m.includes('sculpt') || m.includes('bronze') || m.includes('marble') ||
      m.includes('stone') || m.includes('ceramic') || m.includes('terracotta') ||
      m.includes('wood') || m.includes('ivory')) {
    return 'sculpture'
  }

  if (m.includes('photograph') || m.includes('gelatin') || m.includes('daguerreotype') ||
      m.includes('photo') || m.includes('silver print')) {
    return 'photograph'
  }

  if (m.includes('engrav') || m.includes('etch') || m.includes('lithograph') ||
      m.includes('woodcut') || m.includes('print') || m.includes('gravure') ||
      m.includes('estampe')) {
    return 'print'
  }

  if (m.includes('draw') || m.includes('pencil') || m.includes('chalk') ||
      m.includes('charcoal') || m.includes('ink') || m.includes('pastel') ||
      m.includes('crayon') || m.includes('dessin')) {
    return 'drawing'
  }

  return 'other'
}