import axios from 'axios'

const API_KEY = import.meta.env.VITE_EUROPEANA_API_KEY || ''

const europeanaApi = axios.create({
  baseURL: 'https://api.europeana.eu/record/v2',
  params: {
    wskey: API_KEY
  }
})

export async function searchEuropeana(query, limit = 10) {
  if (!API_KEY) {
    console.warn('Europeana API — clé manquante (VITE_EUROPEANA_API_KEY)')
    return []
  }

  try {
    const response = await europeanaApi.get('/search.json', {
      params: {
        query: query,
        rows: limit,
        qf: 'TYPE:IMAGE',
        profile: 'rich'
      }
    })

    const items = response.data.items || []

    return items.map(normalizeEuropeanaObject)
  } catch (error) {
    console.error('Europeana API — erreur de recherche :', error.message)
    throw error
  }
}

export async function getEuropeanaDetail(recordID) {
  if (!API_KEY) {
    throw new Error('Clé API Europeana manquante')
  }

  try {
    const encodedID = encodeURIComponent(recordID)
    const response = await europeanaApi.get(`/${encodedID}.json`)

    const record = response.data.object
    return normalizeEuropeanaDetail(record)
  } catch (error) {
    console.error(`Europeana API — erreur détail ${recordID} :`, error.message)
    throw error
  }
}

function normalizeEuropeanaObject(raw) {
  const title = Array.isArray(raw.title) ? raw.title[0] : (raw.title || 'Sans titre')
  const artist = Array.isArray(raw.dcCreator) ? raw.dcCreator[0] : 'Artiste inconnu'

  return {
    id: raw.id,
    source: 'europeana',
    title: title,
    artist: artist,
    date: extractYear(raw.year) || 'Date inconnue',
    image: raw.edmIsShownBy ? raw.edmIsShownBy[0] : null,
    thumbnail: raw.edmPreview ? raw.edmPreview[0] : null,
    medium: Array.isArray(raw.dcType) ? raw.dcType[0] : '',
    department: '',
    culture: Array.isArray(raw.country) ? raw.country[0] : '',
    period: '',
    url: raw.guid || ''
  }
}

function normalizeEuropeanaDetail(raw) {
  const proxy = raw.proxies ? raw.proxies[0] : {}
  const aggregation = raw.aggregations ? raw.aggregations[0] : {}

  const title = proxy.dcTitle
    ? Object.values(proxy.dcTitle)[0]?.[0]
    : 'Sans titre'

  const artist = proxy.dcCreator
    ? Object.values(proxy.dcCreator)[0]?.[0]
    : 'Artiste inconnu'

  const date = proxy.dcDate
    ? Object.values(proxy.dcDate)[0]?.[0]
    : 'Date inconnue'

  return {
    id: raw.about,
    source: 'europeana',
    title: title,
    artist: artist,
    date: date,
    image: aggregation.edmIsShownBy || null,
    thumbnail: aggregation.edmObject || null,
    medium: proxy.dcType ? Object.values(proxy.dcType)[0]?.[0] : '',
    department: '',
    culture: '',
    period: '',
    url: aggregation.edmIsShownAt || ''
  }
}

function extractYear(yearArray) {
  if (Array.isArray(yearArray) && yearArray.length > 0) {
    return yearArray[0]
  }
  return null
}