// Agrégateur des 3 APIs d'art

import { searchMet } from './metMuseum.js'
import { searchHarvard } from './harvard.js'
import { searchEuropeana } from './europeana.js'

const SOURCES = [
  { name: 'met',       label: 'Met Museum',        fn: searchMet },
  { name: 'harvard',   label: 'Harvard Art Museums', fn: searchHarvard },
  { name: 'europeana', label: 'Europeana',           fn: searchEuropeana }
]

/**
 * Recherche progressive : appelle le callback dès qu'une API répond,
 * sans attendre les plus lentes. Retourne aussi la promesse finale.
 *
 * @param {string}   query          - Terme de recherche
 * @param {number}   limitPerSource - Résultats max par source (défaut 5)
 * @param {Function} onPartialResult - callback(artworks[], sourceName) appelé dès qu'une source répond
 */
export async function searchAll(query, limitPerSource = 5, onPartialResult = null) {
  const allArtworks = []
  const sourceStatus = {}

  const promises = SOURCES.map(source =>
    source.fn(query, limitPerSource)
      .then(results => {
        const withImages = results.filter(art => art.image || art.thumbnail)
        sourceStatus[source.name] = { success: true, count: withImages.length }
        allArtworks.push(...withImages)

        // Notifier immédiatement le consommateur
        if (onPartialResult && withImages.length > 0) {
          onPartialResult(withImages, source.name)
        }
        return withImages
      })
      .catch(err => {
        sourceStatus[source.name] = { success: false, error: err?.message || 'Erreur inconnue' }
        console.warn(`${source.label} — échec :`, err?.message)
        return []
      })
  )

  await Promise.allSettled(promises)

  console.log('Recherche terminée :', sourceStatus)
  return shuffleResults(allArtworks)
}

/** Récupère le détail d'une œuvre selon sa source. */
export async function getArtworkDetail(source, id) {
  switch (source) {
    case 'met': {
      const { getMetDetail } = await import('./metMuseum.js')
      return getMetDetail(id)
    }
    case 'harvard': {
      const { getHarvardDetail } = await import('./harvard.js')
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
