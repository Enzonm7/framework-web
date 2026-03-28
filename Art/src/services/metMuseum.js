import axios from "axios";

const metApi = axios.create({
    baseURL: 'https://collectionapi.metmuseum.org/public/collection/v1'
})

// Cache en mémoire avec TTL de 5 minutes
const CACHE_TTL = 5 * 60 * 1000
const detailCache = new Map() // objectID -> { data, ts }
const searchCache = new Map() // query -> { ids: [...], ts }

function isFresh(entry) {
    return entry && (Date.now() - entry.ts < CACHE_TTL)
}

export async function searchMet(query, limit = 5) {
    try {
        // Cache de la liste d'IDs (coûteux en réseau même si léger)
        let objectIDs
        const cachedSearch = searchCache.get(query)
        if (isFresh(cachedSearch)) {
            objectIDs = cachedSearch.ids
        } else {
            const searchResponse = await metApi.get('/search', {
                params: { q: query, hasImages: true }
            })
            objectIDs = searchResponse.data.objectIDs || []
            searchCache.set(query, { ids: objectIDs, ts: Date.now() })
        }

        if (objectIDs.length === 0) return []

        // On ne prend que les IDs nécessaires
        const limitedIDs = objectIDs.slice(0, limit)

        // Pour chaque ID : cache individuel ou requête HTTP
        const detailPromises = limitedIDs.map(id => {
            const cached = detailCache.get(id)
            if (isFresh(cached)) {
                return Promise.resolve({ status: 'fulfilled', value: cached.data })
            }
            return metApi.get(`/objects/${id}`)
                .then(res => {
                    const normalized = normalizeMetObject(res.data)
                    detailCache.set(id, { data: normalized, ts: Date.now() })
                    return { status: 'fulfilled', value: normalized }
                })
                .catch(err => ({ status: 'rejected', reason: err }))
        })

        const results = await Promise.all(detailPromises)
        return results
            .filter(r => r.status === 'fulfilled')
            .map(r => r.value)

    } catch (error) {
        console.error('Met Museum API — erreur de recherche :', error.message)
        throw error
    }
}

export async function getMetDetail(objectID) {
    const cached = detailCache.get(objectID)
    if (isFresh(cached)) return cached.data

    try {
        const response = await metApi.get(`/objects/${objectID}`)
        const normalized = normalizeMetObject(response.data)
        detailCache.set(objectID, { data: normalized, ts: Date.now() })
        return normalized
    } catch (error) {
        console.error(`Met Museum API — erreur détail #${objectID} :`, error.message)
        throw error
    }
}

function normalizeMetObject(raw) {
    return {
        id: raw.objectID,
        source: 'met',
        title: raw.title || 'Sans titre',
        artist: raw.artistDisplayName || 'Artiste inconnu',
        date: raw.objectDate || 'Date inconnue',
        image: raw.primaryImage || raw.primaryImageSmall || null,
        thumbnail: raw.primaryImageSmall || raw.primaryImage || null,
        medium: raw.medium || '',
        department: raw.department || '',
        culture: raw.culture || '',
        period: raw.period || '',
        url: raw.objectURL || ''
    }
}
