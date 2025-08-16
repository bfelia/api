import express from "express";
const router = express.Router();
import { MercadoPagoConfig, PreApproval } from "mercadopago";
import { db } from "../firebase.js"; // o tu archivo donde inicializás Firebase

console.log("ENV: ",process.env.ACCESS_TOKEN)

export const config = new MercadoPagoConfig({
  accessToken: process.env.ACCESS_TOKEN, // o tu token directo
});

router.post("/", async (req, res) => {
  try {
    const preapproval = new PreApproval(config);
    const { userId, barberiaId, planId, cortesPlan, monto, userEmail, nombreUsuario } = req.body;

    if (!userId || !barberiaId || !planId || !cortesPlan || !monto || !userEmail || !nombreUsuario) {
      return res.status(400).json({ error: 'Faltan datos necesarios para crear la suscripción.' });
    }

    // 1. Verificar si ya tiene una suscripción activa
    const doc = await db.collection('suscripciones_activas').doc(userId).get();

    if (doc.exists) {
      const data = doc.data();
      if (data.status === 'authorized') {
        return res.status(400).json({ error: 'Ya tenés una suscripción activa. Cancelala desde tu perfil para suscribirte a otro plan' });
      }
    }

    // 2. Crear el cuerpo de la suscripción
    const body = {
      reason: `${planId}_${cortesPlan}-user_${userId}_${nombreUsuario}-barberia_${barberiaId}`,
      auto_recurring: {
        frequency: 1,
        frequency_type: "months",
        transaction_amount: Number(monto),
        currency_id: "ARS",
        start_date: new Date().toISOString(),
        end_date: new Date(new Date().setFullYear(new Date().getFullYear() + 2)).toISOString(),
      },
      back_url: "https://beardhook.com",
      notification_url: "https://api.beardhook.com/webhook",
      payer_email: "matiasthompson@gmail.com", // Esto se reemplaza luego por el email real 
      external_reference: userId,
    };

    // 3. Crear suscripción en MP
    console.log("req.body recibido:", req.body);
    const newSuscriber = await preapproval.create({ body });

    console.log("✅ Suscripción creada:", newSuscriber);
    res.status(200).json({ init_point: newSuscriber.init_point });
  } catch (error) {
    console.error("❌ Error creando suscripción:", error);
    res.status(500).json({ error: error.message });
  }
});

// router.post("/cancelar-suscripcion", async (req, res) => {
//   console.log("cancelar-suscripcion, req.body ", req.body)
//   const { preapproval_id, userId } = req.body

//   try {
//     const mp = new PreApproval(config);

//     // actualizo la suscripcion en mercado pago
//     const result = await mp.update({id: preapproval_id,
//       body: {status: "cancelled"},
//     })
//     console.log("suscripcion actualizada correctamente! id: ", preapproval_id)

//     // actualizo el usuario en firestore
//     const usuarioRef = db.collection("usuarios").doc(userId);
//     await usuarioRef.update({
//       planActivo: false,
//     });
//     console.log("✅ Firestore actualizado correctamente cancelando la suscripcion.");

//     // actualizo la base de datos de suscripciones en firestore
//     const suscripcionesRef = db.collection('suscripciones_activas').doc(userId);
//     await suscripcionesRef.update({
//       status: 'cancelled',
//     });
//     console.log(`✅ Suscripción actualizada y cancelada para el usuario ${userId}`);


//     res.status(200).json({ mensaje: "Suscripción cancelada correctamente", result });
//   } catch (error) {
//     console.error("❌ Error al cancelar suscripción:", error);
//     res.status(500).json({ error: "No se pudo cancelar la suscripción" });
//   }

// })

export default router