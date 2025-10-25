// src/lib/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// 🔹 Configuración de tu proyecto Firebase (usa tus datos reales)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// 🔹 Inicializa la app principal
const app = initializeApp(firebaseConfig);

// 🔹 Crea las instancias de autenticación y base de datos
const auth = getAuth(app);
const db = getFirestore(app);

// ✅ Exporta las instancias para poder usarlas en otros archivos
export { app, auth, db };
