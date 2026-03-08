import { defineStore } from 'pinia'

const STORAGE_KEY = 'artlens-favorites'

function loadFavorites() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.warn('userStore — erreur lecture localStorage :', error)
    return []
  }
}

function saveFavorites(favorites) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites))
  } catch (error) {
    console.warn('userStore — erreur écriture localStorage :', error)
  }
}

export const useUserStore = defineStore('user', {
  state: () => ({
    favorites: loadFavorites(),

    stats: {
      searchCount: 0,
      artworksViewed: 0,    
      sourcesExplored: new Set() 
    }
  }),

  getters: {
    isFavorite(state) {
      return (source, id) => {
        return state.favorites.some(
          fav => fav.source === source && fav.id === id
        )
      }
    },

    favoritesCount(state) {
      return state.favorites.length
    },

    formattedStats(state) {
      return {
        searchCount: state.stats.searchCount,
        artworksViewed: state.stats.artworksViewed,
        sourcesExplored: state.stats.sourcesExplored.size
      }
    }
  },

  actions: {
    toggleFavorite(artwork) {
      const index = this.favorites.findIndex(
        fav => fav.source === artwork.source && fav.id === artwork.id
      )

      if (index !== -1) {
        this.favorites.splice(index, 1)
      } else {
        this.favorites.push({
          id: artwork.id,
          source: artwork.source,
          title: artwork.title,
          artist: artwork.artist,
          thumbnail: artwork.thumbnail,
          date: artwork.date
        })
      }
      saveFavorites(this.favorites)
    },

    clearFavorites() {
      this.favorites = []
      saveFavorites(this.favorites)
    },

    incrementSearchCount() {
      this.stats.searchCount++
    },

    recordArtworkView(source) {
      this.stats.artworksViewed++
      if (source) {
        this.stats.sourcesExplored.add(source)
      }
    }
  }
})
