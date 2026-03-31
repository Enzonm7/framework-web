import axios from 'axios'

const API_KEY = import.meta.env.VITE_EUROPEANA_API_KEY || ''

const europeanaApi = axios.create({
  baseURL: 'https://api.europeana.eu/record/v2',
  params: { wskey: API_KEY }
})

export async function searchEuropeana(query, limit = 10) {
  if (!API_KEY) {
    console.warn('Europeana API — clé manquante (VITE_EUROPEANA_API_KEY)')
    return []
  }

  try {
    const response = await europeanaApi.get('/search.json', {
      params: {
        query,
        rows: limit,
        qf: 'TYPE:IMAGE',
        profile: 'rich'
      }
    })

    const items = response.data.items || []
    return items.map(normalizeEuropeanaSearch)
  } catch (error) {
    console.error('Europeana API — erreur de recherche :', error.message)
    throw error
  }
}

export async function getEuropeanaDetail(recordID) {
  if (!API_KEY) throw new Error('Clé API Europeana manquante')

  try {
    const response = await europeanaApi.get(`${recordID}.json`)
    const record = response.data.object
    return normalizeEuropeanaDetail(record)
  } catch (error) {
    console.error(`Europeana API — erreur détail ${recordID} :`, error.message)
    throw error
  }
}

function dcFirst(obj) {
  if (!obj) return null
  for (const lang of ['en', 'fr', 'de', 'nl', 'it', 'es', 'pt', 'def', 'und']) {
    if (obj[lang]?.[0]) return obj[lang][0]
  }
  const all = Object.values(obj).flat().filter(Boolean)
  return all[0] || null
}

function dcAll(obj) {
  if (!obj) return []
  return [...new Set(Object.values(obj).flat().filter(Boolean))]
}

function cleanCreator(str) {
  if (!str || typeof str !== 'string') return null
  const cleaned = str.replace(/^\[.*?\]:\s*/, '').trim()
  if (cleaned.length < 2) return null
  return cleaned
}

function normalizeEuropeanaSearch(raw) {
  const title = (Array.isArray(raw.title) ? raw.title[0] : raw.title) || 'Sans titre'

  let artist = 'Artiste inconnu'
  const creatorPool = [
    ...(Array.isArray(raw.dcCreator)      ? raw.dcCreator      : []),
    ...(Array.isArray(raw.dcContributor)  ? raw.dcContributor  : [])
  ]
  const cleanedCreators = creatorPool.map(cleanCreator).filter(Boolean)
  if (cleanedCreators.length > 0) artist = cleanedCreators[0]

  const date =
    (Array.isArray(raw.year)   ? raw.year[0]   : null) ||
    (Array.isArray(raw.dcDate) ? raw.dcDate[0] : null) ||
    'Date inconnue'

  const shownBy = raw.edmIsShownBy?.[0] || null
  const objImg  = raw.edmObject?.[0]    || null
  const preview = raw.edmPreview?.[0]   || null
  const imageUrl = shownBy || objImg || preview
  const thumbUrl = preview || shownBy || objImg

  const medium = Array.isArray(raw.dcType) ? raw.dcType[0] : ''

  const culture =
    (Array.isArray(raw.country)     ? raw.country[0]     : '') ||
    (Array.isArray(raw.edmCountry)  ? raw.edmCountry[0]  : '')

  const dataProvider = Array.isArray(raw.dataProvider) ? raw.dataProvider[0] : (raw.dataProvider || '')

  const url = raw.guid || ''

  return {
    id: raw.id,
    source: 'europeana',
    title,
    artist,
    date,
    image: imageUrl,
    thumbnail: thumbUrl || imageUrl,
    medium,
    department: '',
    culture,
    period: '',
    dataProvider,
    url
  }
}

function normalizeEuropeanaDetail(raw) {
  if (!raw) return { source: 'europeana', title: 'Sans titre', artist: 'Artiste inconnu' }

  const proxies = raw.proxies || []
  const providerProxy  = proxies.find(p => !p.europeanaProxy) || proxies[0] || {}
  const europeanaProxy = proxies.find(p =>  p.europeanaProxy) || {}

  const aggregation    = raw.aggregations?.[0]    || {}
  const europeanaAgg   = raw.europeanaAggregation || {}

  const title =
    dcFirst(providerProxy.dcTitle)  ||
    dcFirst(europeanaProxy.dcTitle) ||
    'Sans titre'

  const creatorPool = [
    ...dcAll(providerProxy.dcCreator),
    ...dcAll(europeanaProxy.dcCreator),
    ...dcAll(providerProxy.dcContributor),
    ...dcAll(europeanaProxy.dcContributor)
  ]
  const cleanedCreators = creatorPool.map(cleanCreator).filter(Boolean)
  const artist = cleanedCreators[0] || 'Artiste inconnu'
  const allCreators = [...new Set(cleanedCreators)]

  const date =
    dcFirst(providerProxy.dcDate)  ||
    dcFirst(europeanaProxy.dcDate) ||
    raw.year?.[0]                  ||
    'Date inconnue'

  const description =
    dcFirst(providerProxy.dcDescription)  ||
    dcFirst(europeanaProxy.dcDescription) ||
    ''

  const medium =
    dcFirst(providerProxy.dcType)  ||
    dcFirst(europeanaProxy.dcType) ||
    ''

  const format =
    dcFirst(providerProxy.dcFormat)  ||
    dcFirst(europeanaProxy.dcFormat) ||
    ''

  const rights =
    dcFirst(providerProxy.dcRights)  ||
    dcFirst(europeanaProxy.dcRights) ||
    aggregation.edmRights?.[0]       ||
    ''

  const publisher =
    dcFirst(providerProxy.dcPublisher)  ||
    dcFirst(europeanaProxy.dcPublisher) ||
    ''

  const language =
    dcFirst(providerProxy.dcLanguage) ||
    raw.language?.[0]                 ||
    ''

  const identifier =
    dcFirst(providerProxy.dcIdentifier)  ||
    dcFirst(europeanaProxy.dcIdentifier) ||
    ''

  const subjects = [
    ...dcAll(providerProxy.dcSubject),
    ...dcAll(europeanaProxy.dcSubject)
  ].filter((v, i, arr) => arr.indexOf(v) === i)

  const shownBy  = aggregation.edmIsShownBy || null
  const objThumb = aggregation.edmObject    || null
  const preview  = europeanaAgg.edmPreview  || null

  const imageUrl = shownBy || objThumb || preview
  const thumbUrl = preview || shownBy || objThumb

  const webResources = aggregation.webResources || []
  const additionalImages = webResources
    .map(r => r.about)
    .filter(url =>
      url &&
      url !== shownBy &&
      url !== objThumb &&
      /\.(jpg|jpeg|png|webp|gif)(\?.*)?$/i.test(url)
    )
    .slice(0, 5)

  const culture = raw.country?.[0] || ''

  const dataProvider = aggregation.edmDataProvider?.[0] || ''
  const provider     = aggregation.edmProvider?.[0]     || ''

  const europeanaPortalUrl = europeanaAgg.edmLandingPage || `https://www.europeana.eu/en/item${raw.about}`
  const institutionUrl     = aggregation.edmIsShownAt    || ''

  return {
    id: raw.about,
    source: 'europeana',

    title,
    artist,
    date,

    image: imageUrl,
    thumbnail: thumbUrl || imageUrl,
    additionalImages,

    medium,
    format,
    dimensions: '',
    department: '',

    culture,
    period: '',
    language,

    description,
    tags: subjects,

    rights,
    publisher,
    identifier,

    creditLine:      publisher || dataProvider,
    accessionNumber: identifier,

    dataProvider,
    provider,

    url: europeanaPortalUrl,
    institutionUrl,

    allPeople: allCreators.length > 1
      ? allCreators.map(name => ({ name, role: 'Créateur' }))
      : []
  }
}
