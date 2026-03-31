// Ce fichier initialise la connexion à Firebase.
// Les clés ici sont publiques par design (Firebase les expose côté client).
// La sécurité repose sur les règles Firestore, pas sur le secret de ces clés.
import { initializeApp } from 'firebase/app'
import { getAuth }        from 'firebase/auth'
import { getFirestore }   from 'firebase/firestore'

const firebaseConfig = {
  apiKey:            "AIzaSyBCH65VD_4Kv5YqRYLh3onPmdtK85onBRU",
  authDomain:        "artlens-6b956.firebaseapp.com",
  projectId:         "artlens-6b956",
  storageBucket:     "artlens-6b956.firebasestorage.app",
  messagingSenderId: "415087645178",
  appId:             "1:415087645178:web:0335445f8ee5f70b8d9443",
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db   = getFirestore(app)