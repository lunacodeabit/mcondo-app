import { db } from "./lib/firebase";
import { collection, getCountFromServer } from "firebase/firestore";

// 🔹 PRUEBA DE CONEXIÓN FIRESTORE
(async () => {
  try {
    const coll = collection(db, "_healthcheck");
    const count = await getCountFromServer(coll);
    console.log("✅ Firestore conectado correctamente");
  } catch (err) {
    console.error("❌ Error conectando con Firestore:", err);
  }
})();
