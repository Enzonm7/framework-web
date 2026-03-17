// Agrégateur des 3 APIs d'art

import { searchMet } from './metMuseum.js'
import { searchHarvard } from './harvardArt.js'
import { searchEuropeana } from './europeana.js'

const SOURCES = [
  { name: 'met', label: 'Met Museum', fn: searchMet },
  { name: 'harvard', label: 'Harvard Art Museums', fn: searchHarvard },
  { name: 'europeana', label: 'Europeana', fn: searchEuropeana }
]

/** Recherche simultanée sur les 3 APIs et fusionne les résultats. */
export async function searchAll(query, limitPerSource = 8) {
  const promises = SOURCES.map(source => source.fn(query, limitPerSource))
  const results = await Promise.allSettled(promises)

  const allArtworks = []
  const sourceStatus = {}

  results.forEach((result, index) => {
    const source = SOURCES[index]

    if (result.status === 'fulfilled') {
      sourceStatus[source.name] = {
        success: true,
        count: result.value.length
      }
      allArtworks.push(...result.value)
    } else {
      sourceStatus[source.name] = {
        success: false,
        error: result.reason?.message || 'Erreur inconnue'
      }
      console.warn(`${source.label} — échec :`, result.reason?.message)
    }
  })

  console.log('Recherche terminée :', sourceStatus)

  const withImages = allArtworks.filter(art => art.image || art.thumbnail)

  return shuffleResults(withImages)
}

/** Récupère le détail d'une œuvre selon sa source. */
export async function getArtworkDetail(source, id) {
  switch (source) {
    case 'met': {
      const { getMetDetail } = await import('./metMuseum.js')
      return getMetDetail(id)
    }
    case 'harvard': {
      const { getHarvardDetail } = await import('./harvardArt.js')
      return getHarvardDetail(id)
    }
    case 'europeana': {
      const { getEuropeanaDetail } = await import('./europeana.js')
      return getEuropeanaDetail(id)
    }
    default:
      throw new Error(`Source inconnue : ${source}`)
  }
}

/** Mélange un tableau (Fisher-Yates). */
function shuffleResults(array) {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}