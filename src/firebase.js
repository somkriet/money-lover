import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// ── วางค่า Firebase config ของคุณที่นี่ ──────────────────────────────────
// ไปที่ Firebase Console → Project Settings → General → Your apps → Web app
// แล้วคัดลอกค่า firebaseConfig มาวาง
const firebaseConfig = {
  apiKey: "AIzaSyDwMH-Zv3J-na6vBRpDPGFpaLSwM5aLS8I",
  authDomain: "money-lover-98f41.firebaseapp.com",
  projectId: "money-lover-98f41",
  storageBucket: "money-lover-98f41.firebasestorage.app",
  messagingSenderId: "585107409018",
  appId: "1:585107409018:web:e1c6efd128fd050ebb53c3",
  measurementId: "G-G5QSFXC9F8"
}
// ─────────────────────────────────────────────────────────────────────────

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db   = getFirestore(app)
