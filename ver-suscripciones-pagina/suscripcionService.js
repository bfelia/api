// services/suscripcionesService.js
import {db} from "../firebase.js"; // tu conexión a Firestore u otra DB

export const obtenerSuscripcionesActivas = async () => {
  const snapshot = await db.collection("usuarios").get();
  return snapshot.docs.map(doc => doc.data());
};
