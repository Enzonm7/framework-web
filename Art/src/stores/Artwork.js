import { defineStore } from 'pinia'
import { searchAll } from '../services/artAggregator.js'

const EXPLORE_TERMS = [
  'portrait',       'landscape',     'mythology',      'flowers',
  'sculpture',      'impressionism', 'baroque',        'renaissance',
  'religious',      'animals',       'nude',           'still life',
  'watercolor',     'drawing',       'architecture',   'marine',
  'battle',         'dance',         'music',          'city',
  'ancient',        'medieval',      'expressionism',  'romanticism',
  'surrealism',     'realism',       'abstract',       'manuscript'
]

const ITEMS_PER_TERM = 10
const EXPLORE_CAP = 600
const PAGE_SIZE = 24

export const useArtworkStore = defineStore('artwork', {
  state: () => ({
    results: [],
    searchQuery: '',
    isLoading: false,
    errorMessage: '',

    featuredArtworks: [],
    isFeaturedLoading: false,

    currentPage: 1,

    filters: {
      source: 'all',
      period: 'all',
      type: 'all'
    }
  }),

  getters: {
    filteredResults(state) {
      const baseList = state.searchQuery ? state.results : state.featuredArtworks
      return applyFilters(baseList, state.filters)
    },

    hasActiveFilters(state) {
      return (
        state.filters.source !== 'all' ||
        state.filters.period !== 'all' ||
        state.filters.type !== 'all'
      )
    },

    browseTotal(state) {
      return state.searchQuery ? state.results.length : state.featuredArtworks.length
    },

    paginatedResults(state) {
      const start = (state.currentPage - 1) * PAGE_SIZE
      return this.filteredResults.slice(start, start + PAGE_SIZE)
    },

    totalPages() {
      return Math.max(1, Math.ceil(this.filteredResults.length / PAGE_SIZE))
    }
  },

  actions: {
    setPage(page) {
      this.currentPage = page
    },

    async performSearch(query, displayLabel) {
      this.currentPage = 1
      this.searchQuery = displayLabel || query
      this.results = []
      this.isLoading = true
      this.errorMessage = ''

      try {
        const accumulated = []
        await searchAll(query, 30, (partialResults) => {
          accumulated.push(...partialResults)
          this.results = deduplicateAndShuffle([...accumulated])
        })

        if (this.results.length === 0) {
          this.errorMessage = `Aucune œuvre trouvée pour « ${query} ».`
        }
      } catch (error) {
        console.error('artworkStore — erreur recherche :', error)
        this.errorMessage = 'Une erreur est survenue. Veuillez réessayer.'
      } finally {
        this.isLoading = false
      }
    },

    async loadFeaturedArtworks() {
  if (this.featuredArtworks.length > 0) return

  this.isFeaturedLoading = true
  const seen = new Set()
  const BATCH = 5

  try {
    for (let i = 0; i < EXPLORE_TERMS.length; i += BATCH) {
      if (this.featuredArtworks.length >= EXPLORE_CAP) break

      const batch = EXPLORE_TERMS.slice(i, i + BATCH)
      const batchResults = await Promise.all(
        batch.map(term => searchAll(term, ITEMS_PER_TERM).catch(() => []))
      )

      const newItems = batchResults.flat().filter(art => {
        if (!art.thumbnail && !art.image) return false
        const key = `${art.source}-${art.id}`
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })

      const remaining = EXPLORE_CAP - this.featuredArtworks.length
      if (remaining > 0 && newItems.length > 0) {
        this.featuredArtworks = [
          ...this.featuredArtworks,
          ...newItems.slice(0, remaining)
        ]
      }
    }
  } catch (error) {
    console.error('artworkStore — erreur featured :', error)
  } finally {
    this.isFeaturedLoading = false
  }
},

    async enrichEuropeanaDetails() {
      const all = this.searchQuery ? this.results : this.featuredArtworks
      const europeanaArts = all.filter(a => a.source === 'europeana' && !a._enriched)
      if (europeanaArts.length === 0) return

      // Import dynamique pour éviter les cycles
      const { getEuropeanaDetail } = await import('../services/europeana.js')

      const batchSize = 5
      for (let i = 0; i < europeanaArts.length; i += batchSize) {
        const batch = europeanaArts.slice(i, i + batchSize)
        const details = await Promise.all(
          batch.map(a => getEuropeanaDetail(a.id).catch(() => null))
        )
        details.forEach((detail, idx) => {
          if (detail && detail.id) {
            Object.assign(batch[idx], detail, { _enriched: true })
          }
        })
      }
    },

    setFilter(filterName, value) {
      if (Object.prototype.hasOwnProperty.call(this.filters, filterName)) {
        this.filters[filterName] = value
        this.currentPage = 1
      }
    },

    resetFilters() {
      this.filters.source = 'all'
      this.filters.period = 'all'
      this.filters.type = 'all'
      this.currentPage = 1
    },

    clearAll() {
      this.results = []
      this.searchQuery = ''
      this.errorMessage = ''
      this.currentPage = 1
      this.resetFilters()
    },

    // Legacy
    clearResults() {
      this.clearAll()
    }
  }
})

function applyFilters(list, filters) {
  let filtered = [...list]
  if (filters.source !== 'all') {
    filtered = filtered.filter(art => art.source === filters.source)
  }
  if (filters.period !== 'all') {
    filtered = filtered.filter(art => guessPeriod(art.date) === filters.period)
  }
  if (filters.type !== 'all') {
    filtered = filtered.filter(art => guessType(art.medium) === filters.type)
  }
  return filtered
}

function deduplicateAndShuffle(artworks) {
  const seen = new Set()
  const unique = artworks.filter(art => {
    const key = `${art.source}-${art.id}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
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
