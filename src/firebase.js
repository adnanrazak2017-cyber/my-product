
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getDatabase } from 'firebase/database'

const firebaseConfig = {
  apiKey: "AIzaSyCWD1ir_1YfjX__maGiGCUhJ2_Gb00PP8c",
  authDomain: "name-it-family-location-alert.firebaseapp.com",
  databaseURL: "https://name-it-family-location-alert-default-rtdb.firebaseio.com",
  projectId: "name-it-family-location-alert",
  storageBucket: "name-it-family-location-alert.firebasestorage.app",
  messagingSenderId: "228805418782",
  appId: "1:228805418782:web:57c211bd522934e817b30f",
  measurementId: "G-PF5B5T3MZ0",
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const database = getDatabase(app)
