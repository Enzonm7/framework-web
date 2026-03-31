import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth'

import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  updateDoc,
  increment,
  collection,
  getDocs,
} from 'firebase/firestore'

import { auth, db } from '../firebase.js'

function statsRef(uid) {
  return doc(db, 'users', uid, 'stats', 'global')
}

function favRef(uid, source, id) {
  const key = `${source}_${String(id).replace(/\//g, '_')}`
  return doc(db, 'users', uid, 'favorites', key)
}

function favsCollection(uid) {
  return collection(db, 'users', uid, 'favorites')
}

async function ensureStats(uid) {
  const ref  = statsRef(uid)
  const snap = await getDoc(ref)
  if (!snap.exists()) {
    await setDoc(ref, { searchCount: 0, artworksViewed: 0, sourcesExplored: [] })
  }
}

// ─── Service ──────────────────────────────────────────────────

export const authService = {

  async register(username, email, password) {
    const { user } = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(user, { displayName: username })
    await ensureStats(user.uid)
    return { id: user.uid, username, email: user.email }
  },

  async login(email, password) {
    const { user } = await signInWithEmailAndPassword(auth, email, password)
    await ensureStats(user.uid)
    return {
      id:       user.uid,
      username: user.displayName || user.email.split('@')[0],
      email:    user.email,
    }
  },

  async logout() {
    await signOut(auth)
  },

  // Firebase persiste la session automatiquement dans IndexedDB.
  // onAuthStateChanged se résout immédiatement avec l'état courant.
  async getMe() {
    return new Promise((resolve, reject) => {
      const unsubscribe = auth.onAuthStateChanged(user => {
        unsubscribe()
        if (user) {
          resolve({
            id:       user.uid,
            username: user.displayName || user.email.split('@')[0],
            email:    user.email,
          })
        } else {
          reject(new Error('Non authentifié'))
        }
      })
    })
  },

  async getFavorites() {
    const user = auth.currentUser
    if (!user) return []
    const snap = await getDocs(favsCollection(user.uid))
    return snap.docs.map(d => d.data())
  },

  async toggleFavorite(artwork) {
    const user = auth.currentUser
    if (!user) throw new Error('Non authentifié')

    const ref  = favRef(user.uid, artwork.source, artwork.id)
    const snap = await getDoc(ref)

    if (snap.exists()) {
      await deleteDoc(ref)
      return { action: 'removed', isFavorite: false }
    } else {
      await setDoc(ref, {
        id:        String(artwork.id),
        source:    artwork.source,
        title:     artwork.title     || '',
        artist:    artwork.artist    || '',
        thumbnail: artwork.thumbnail || '',
        date:      artwork.date      || '',
      })
      return { action: 'added', isFavorite: true }
    }
  },

  async getStats() {
    const user = auth.currentUser
    if (!user) return { searchCount: 0, artworksViewed: 0, sourcesExplored: 0 }

    await ensureStats(user.uid)
    const snap = await getDoc(statsRef(user.uid))
    const data = snap.data()

    return {
      searchCount:     data.searchCount    || 0,
      artworksViewed:  data.artworksViewed || 0,
      sourcesExplored: Array.isArray(data.sourcesExplored)
        ? data.sourcesExplored.length
        : (data.sourcesExplored || 0),
    }
  },

  async updateStat(type, source = null) {
    const user = auth.currentUser
    if (!user) return

    const ref = statsRef(user.uid)

    if (type === 'search') {
      await updateDoc(ref, { searchCount: increment(1) })
    } else if (type === 'view') {
      const snap    = await getDoc(ref)
      const data    = snap.data() || {}
      const sources = Array.isArray(data.sourcesExplored) ? data.sourcesExplored : []

      const update = { artworksViewed: increment(1) }
      if (source && ['met', 'harvard', 'europeana'].includes(source) && !sources.includes(source)) {
        update.sourcesExplored = [...sources, source]
      }
      await updateDoc(ref, update)
    }
  },
}