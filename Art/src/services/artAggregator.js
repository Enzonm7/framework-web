import { searchMet } from './metMuseum.js'
import { searchHarvard } from './harvard.js'
import { searchEuropeana } from './europeana.js'

const SOURCES = [
  { name: 'met',       label: 'Met Museum',        fn: searchMet },
  { name: 'harvard',   label: 'Harvard Art Museums', fn: searchHarvard },
  { name: 'europeana', label: 'Europeana',           fn: searchEuropeana }
]

// Recherche progressive : les 3 APIs sont appelées en parallèle.
// Dès qu'une API répond, onPartialResult est appelé immédiatement
// sans attendre les autres. Ça permet d'afficher les résultats au fur
// et à mesure dans l'interface plutôt que d'attendre la plus lente.
export async function searchAll(query, limitPerSource = 5, onPartialResult = null) {
  const allArtworks = []
  const sourceStatus = {}

  const promises = SOURCES.map(source =>
    source.fn(query, limitPerSource)
      .then(results => {
        // On filtre les œuvres sans image — inutilisables dans la galerie
        const withImages = results.filter(art => art.image || art.thumbnail)
        sourceStatus[source.name] = { success: true, count: withImages.length }
        allArtworks.push(...withImages)

        if (onPartialResult && withImages.length > 0) {
          onPartialResult(withImages, source.name)
        }
        return withImages
      })
      .catch(err => {
        // Une API en échec ne bloque pas les autres
        sourceStatus[source.name] = { success: false, error: err?.message || 'Erreur inconnue' }
        console.warn(`${source.label} — échec :`, err?.message)
        return []
      })
  )

  // allSettled (et non all) : on attend toutes les APIs même si certaines échouent
  await Promise.allSettled(promises)

  console.log('Recherche terminée :', sourceStatus)
  return shuffleResults(allArtworks)
}

// Récupère le détail complet d'une œuvre selon sa source.
// L'ID vient de l'URL (toujours une string) mais chaque API attend un type différent :
// Met Museum attend un number, Harvard et Europeana attendent une string.
export async function getArtworkDetail(source, id) {
  let fixedId = id
  if (source === 'met') {
    fixedId = Number(id)
    if (isNaN(fixedId)) throw new Error('ID Met Museum invalide')
  }
  if (source === 'harvard') {
    fixedId = String(id)
  }
  if (source === 'europeana') {
    fixedId = String(id)
  }
  switch (source) {
    case 'met': {
      const { getMetDetail } = await import('./metMuseum.js')
      const result = await getMetDetail(fixedId)
      if (!result || !result.id) throw new Error('Œuvre Met introuvable')
      return result
    }
    case 'harvard': {
      const { getHarvardDetail } = await import('./harvard.js')
      const result = await getHarvardDetail(fixedId)
      if (!result || !result.id) throw new Error('Œuvre Harvard introuvable')
      return result
    }
    case 'europeana': {
      const { getEuropeanaDetail } = await import('./europeana.js')
      const result = await getEuropeanaDetail(fixedId)
      if (!result || !result.id) throw new Error('Œuvre Europeana introuvable')
      return result
    }
    default:
      throw new Error(`Source inconnue : ${source}`)
  }
}

function shuffleResults(array) {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}
