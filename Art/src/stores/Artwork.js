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
      let filtered = [...state.results]
      if (state.filters.source !== 'all') {
        filtered = filtered.filter(art => art.source === state.filters.source)
      }

      if (state.filters.period !== 'all') {
        filtered = filtered.filter(art => {
          const period = guessPeriod(art.date)
          return period === state.filters.period
        })
      }

      return filtered
    },

    hasActiveFilters(state) {
      return Object.values(state.filters).some(value => value !== 'all')
    }
  },

  actions: {
    async performSearch(query) {
      if (!query || query.trim().length === 0) {
        return
      }
      this.searchQuery = query.trim()
      this.isLoading = true
      this.errorMessage = ''
      this.results = []

      try {
        const allResults = await searchAll(this.searchQuery)
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
        this.featuredArtworks = results
          .filter(art => art.thumbnail || art.image)
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
