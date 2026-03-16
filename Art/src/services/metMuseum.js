import axios from "axios";

const metApi = axios.create({
    baseURL: 'https://collectionapi.metmuseum.org/public/collection/v1'
})

export async function searchMet(query, limit = 10) {
    try {
        const searchResponse = await metApi.get('/search', {
        params: {
            q: query,
            hasImages: true
        }
        })
        const objectIDs = searchResponse.data.objectIDs

        if (!objectIDs || objectIDs.length === 0) {
        return []
        }

        const limitedIDs = objectIDs.slice(0, limit)
        const detailPromises = limitedIDs.map(id => metApi.get(`/objects/${id}`))
        const results = await Promise.allSettled(detailPromises)
        return results.filter(result => result.status === 'fulfilled').map(result => normalizeMetObject(result.value.data))
    } catch (error) {
        console.error('Met Museum API — erreur de recherche :', error.message)
        throw error
    }
}

export async function getMetDetail(objectID) {
    try {
        const response = await metApi.get(`/objects/${objectID}`)
        return normalizeMetObject(response.data)
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