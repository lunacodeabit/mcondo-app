// src/lib/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// 🔹 Importa la configuración correcta desde el otro archivo
import { firebaseConfig } from '../firebase/config';

// 🔹 Inicializa la app principal con la configuración importada
const app = initializeApp(firebaseConfig);

// 🔹 Crea las instancias de autenticación y base de datos
const auth = getAuth(app);
const db = getFirestore(app);

// ✅ Exporta las instancias para poder usarlas en otros archivos
export { app, auth, db };
