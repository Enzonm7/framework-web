import { searchMet } from './metMuseum.js'
import { searchHarvard } from './harvardArt.js'
import { searchEuropeana } from './europeana.js'

export async function searchAll(query, limitPerSource = 8) {
  const results = await Promise.allSettled([
    searchMet(query, limitPerSource),
    searchHarvard(query, limitPerSource),
    searchEuropeana(query, limitPerSource)
  ])

  const allArtworks = []

  results.forEach((result, index) => {
    const sourceNames = ['Met Museum', 'Harvard Art', 'Europeana']

    if (result.status === 'fulfilled') {
      allArtworks.push(...result.value)
    } else {
      console.warn(
        `${sourceNames[index]} — recherche échouée :`,
        result.reason?.message || 'Erreur inconnue'
      )
    }
  })

  return allArtworks.filter(artwork => artwork.image || artwork.thumbnail)
}

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