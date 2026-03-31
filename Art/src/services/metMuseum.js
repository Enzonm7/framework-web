import axios from "axios";

const metApi = axios.create({
    baseURL: 'https://collectionapi.metmuseum.org/public/collection/v1'
})

// Cache en mémoire pour éviter de répéter les mêmes requêtes pendant la session.
// L'API Met est lente (une requête par objet) — sans cache, naviguer entre pages
// ou relancer une recherche identique referait toutes les requêtes.
// TTL de 5 min : les données musée ne changent pas en temps réel.
const CACHE_TTL = 5 * 60 * 1000
const detailCache = new Map() // id → { data, ts }
const searchCache = new Map() // query → { ids, ts }

function isFresh(entry) {
    return entry && (Date.now() - entry.ts < CACHE_TTL)
}

export async function searchMet(query, limit = 5) {
    try {
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

        const limitedIDs = objectIDs.slice(0, limit)

        // L'API Met ne retourne que les IDs lors de la recherche.
        // Il faut faire une requête par objet pour obtenir les détails.
        // On les lance toutes en parallèle et on gère les erreurs individuellement
        // pour ne pas bloquer les autres si un objet est inaccessible.
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
        artistRole: raw.artistRole || '',
        artistNationality: raw.artistNationality || '',
        artistBeginDate: raw.artistBeginDate ? raw.artistBeginDate.trim() : '',
        artistEndDate: raw.artistEndDate ? raw.artistEndDate.trim() : '',

        date: raw.objectDate || 'Date inconnue',
        objectBeginDate: raw.objectBeginDate || null,
        objectEndDate: raw.objectEndDate || null,

        image: raw.primaryImage || raw.primaryImageSmall || null,
        thumbnail: raw.primaryImageSmall || raw.primaryImage || null,
        additionalImages: raw.additionalImages || [],

        medium: raw.medium || '',
        dimensions: raw.dimensions || '',
        classification: raw.classification || '',

        department: raw.department || '',
        culture: raw.culture || '',
        period: raw.period || '',
        dynasty: raw.dynasty || '',
        reign: raw.reign || '',

        country: raw.country || '',
        city: raw.city || '',
        region: raw.region || '',

        creditLine: raw.creditLine || '',
        accessionNumber: raw.accessionNumber || '',
        accessionYear: raw.accessionYear || '',

        galleryNumber: raw.GalleryNumber || '',
        repository: raw.repository || '',
        isHighlight: raw.isHighlight || false,
        isPublicDomain: raw.isPublicDomain || false,

        tags: raw.tags ? raw.tags.map(t => t.term) : [],
        url: raw.objectURL || ''
    }
}
