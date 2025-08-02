import express from 'express';
import { admin } from '../firebase.js';
const router = express.Router();

router.post('/', async (req, res) => {
	console.log("QR funciona")
	const { userId, planId, timestamp, barberiaId } = req.body;
	console.log(req.body)

	// 1. Validar estructura
	if (!userId || !planId || !timestamp || !barberiaId) {
		return res.status(400).json({ ok: false, error: 'Datos incompletos' });
	}

	// 2. Validar expiración del QR
	const ahora = new Date();
	const fechaQR = new Date(timestamp);
	const diferenciaMin = (ahora - fechaQR) / 1000 / 60;
	if (diferenciaMin > 2) {
		return res.status(400).json({ ok: false, error: 'QR expirado, pedile al usuario que reinicie la app' });
	}

	// 3. Buscar al usuario en Firestore
	const userRef = admin.firestore().collection('usuarios').doc(userId);
	const userDoc = await userRef.get();
	if (!userDoc.exists) return res.status(404).json({ ok: false, error: 'Usuario no encontrado' });

	const userData = userDoc.data();
	const planActivo = userData.planActivo;
	if (!planActivo) return res.status(400).json({ ok: false, error: 'Plan del usuario no activo' });

	// Busco el plan en Firestore
	const planRef = admin.firestore().collection('planes').doc(planId);
	const planDoc = await planRef.get();
	if (!planDoc.exists) return res.status(404).json({ ok: false, error: 'Plan del usuario no encontrado' });
	const planData = planDoc.data();

	// 4. Verificar cortes disponibles
	const cortesUsados = userData.cortesDelMes?.length || 0;
	if (cortesUsados >= planData?.cortesMensuales || 0) {
		return res.status(400).json({ ok: false, error: 'No le quedan cortes disponibles al usuario' });
	}

	// 5. Verificar que el plan pertenezca a la barberia
	if (barberiaId != planData.barberiaId) {
		return res.status(400).json({ ok: false, error: 'El plan del usuario no es un plan de tu barbería' })
	}

	// genero el id del corte
	const corteId = `${Math.random().toString(36).substring(2, 10)}_${fechaQR}`;

	// 6. Verificar que el qr no se haya escaneado aun
	const cortes = userData.cortesDelMes.filter(corte => 
		corte.corteId === corteId
	)
	console.log(cortes)
	if(cortes.length!=0){
		return res.status(400).json({ ok: false, error: 'Este QR ya fue escaneado' })
	}

	// 7. Guardar el corte
	const nuevoCorte = {
		corteId: corteId,
		userId,
		planId,
		barberiaId,
		fecha: `${new Date().getFullYear()}-${new Date().getMonth()+1}-${new Date().getDate()}`,
	};

	// Busco la barberia
	const barberiaRef = admin.firestore().collection('barberias').doc(barberiaId);
	const barberiaSnap = await barberiaRef.get();
	const barberiaData = barberiaSnap.data();
	const clientesActivos = barberiaData.clientesActivos.map(cliente => {
		if(cliente.userId===userId) {
			return {
				...cliente,
				cortesRestantes: (cliente.cortesRestantes - 1) || 0
			}
		}
		return cliente;
	})
	
	await barberiaRef.update({
		cortesRealizados: admin.firestore.FieldValue.arrayUnion(nuevoCorte),
		clientesActivos: clientesActivos
	});

	await userRef.update({
		cortesDelMes: admin.firestore.FieldValue.arrayUnion(nuevoCorte)
	});

	return res.status(200).json({ ok: true, mensaje: `Corte validado con éxito para ${userData.nombre}` });
})

export default router