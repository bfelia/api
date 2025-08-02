import express from "express";
const app = express();
import dotenv from "dotenv";
import webhookRouter from "./suscripciones/webhook.js";
import validarCorteRouter from "./cortes/validarCorte.js"
import crearSuscripcionRouter from "./suscripciones/crearSuscripcion.js"
dotenv.config();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 3000

app.use("/crear-suscripcion", crearSuscripcionRouter)

app.use("/webhook", webhookRouter);

app.use("/validar-corte", validarCorteRouter);

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
