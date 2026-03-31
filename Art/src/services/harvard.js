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
        fields: 'objectid,title,people,dated,primaryimageurl,classification,medium,technique,department,culture,period,century,url,creditline,accessionyear,images'
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
  const firstPerson = raw.people && raw.people.length > 0 ? raw.people[0] : null
  const artist = firstPerson ? firstPerson.name : 'Artiste inconnu'

  const allPeople = raw.people
    ? raw.people.map(p => ({
        name: p.name || '',
        role: p.role || '',
        culture: p.culture || '',
        birthplace: p.birthplace || '',
        deathplace: p.deathplace || '',
        displaydate: p.displaydate || ''
      }))
    : []

  const additionalImages = raw.images
    ? raw.images
        .map(img => img.baseimageurl)
        .filter(url => url && url !== raw.primaryimageurl)
    : []

  return {
    id: raw.objectid,
    source: 'harvard',

    title: raw.title || 'Sans titre',
    artist: artist,
    allPeople: allPeople,

    date: raw.dated || 'Date inconnue',
    century: raw.century || '',

    image: raw.primaryimageurl || null,
    thumbnail: raw.primaryimageurl || null,
    additionalImages: additionalImages,

    medium: raw.medium || '',
    technique: raw.technique || '',
    dimensions: raw.dimensions || '',
    classification: raw.classification || '',

    department: raw.department || '',
    culture: raw.culture || '',
    period: raw.period || '',

    creditLine: raw.creditline || '',
    accessionYear: raw.accessionyear || '',
    copyright: raw.copyright || '',

    description: raw.description || '',
    labeltext: raw.labeltext || '',
    provenance: raw.provenance || '',

    url: raw.url || ''
  }
}
