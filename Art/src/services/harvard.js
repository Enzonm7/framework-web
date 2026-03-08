import axios from 'axios'

const API_KEY = import.meta.env.VITE_HARVARD_API_KEY || ''

const harvardApi = axios.create({
  baseURL: 'https://api.harvardartmuseums.org',
  params: {
    apikey: API_KEY
  }
})


export async function searchHarvard(query, limit = 10) {
  if (!API_KEY) {
    console.warn('Harvard API — clé manquante (VITE_HARVARD_API_KEY)')
    return []
  }

  try {
    const response = await harvardApi.get('/object', {
      params: {
        keyword: query,
        size: limit,
        hasimage: 1,
        fields: 'objectid,title,people,dated,primaryimageurl,classification,medium,department,culture,period,url'
      }
    })

    const records = response.data.records || []

    return records.map(normalizeHarvardObject)
  } catch (error) {
    console.error('Harvard API — erreur de recherche :', error.message)
    throw error
  }
}

export async function getHarvardDetail(objectID) {
  if (!API_KEY) {
    throw new Error('Clé API Harvard manquante')
  }

  try {
    const response = await harvardApi.get(`/object/${objectID}`)
    return normalizeHarvardObject(response.data)
  } catch (error) {
    console.error(`Harvard API — erreur détail #${objectID} :`, error.message)
    throw error
  }
}

function normalizeHarvardObject(raw) {
  const artist = raw.people && raw.people.length > 0
    ? raw.people[0].name
    : 'Artiste inconnu'

  return {
    id: raw.objectid,
    source: 'harvard',
    title: raw.title || 'Sans titre',
    artist: artist,
    date: raw.dated || 'Date inconnue',
    image: raw.primaryimageurl || null,
    thumbnail: raw.primaryimageurl || null,
    medium: raw.medium || '',
    department: raw.department || '',
    culture: raw.culture || '',
    period: raw.period || '',
    url: raw.url || ''
  }
}
