import express from "express";
import basicAuth from "express-basic-auth"; // autenticación básica
import { obtenerSuscripcionesActivas } from "./suscripcionService.js"; // tu función de DB

const router = express.Router();

router.use(
  basicAuth({
    users: { lucas: "Lucas#entradas" },
    challenge: true, // muestra ventana de login en navegador
  })
);

// Ruta para ver suscripciones
router.get("/", async (req, res) => {
  try {
    const { search } = req.query; // permite buscar por ?search=nombre
    let usuarios = await obtenerSuscripcionesActivas();

    if (search) {
      usuarios = usuarios.filter(s =>
        s.email.split("%40").join("@").toLowerCase().includes(search.toLowerCase())
      );
    }

    // Generamos HTML simple
    const html = `
      <h1>Suscripciones activas</h1>
      <form method="get" action="/ver-suscripciones">
        <input type="text" name="search" placeholder="Buscar mail de usuario" value="${search || ""}" />
        <button type="submit">Buscar</button>
      </form>
      <ul>
        ${usuarios
          .map(
            s =>
              `<li>${s.nombre} - ${s.planActivo?"Plan Activo":"Sin Plan"} - ${s.email.split("%40").join("@")}</li>`
          )
          .join("")}
      </ul>
    `;
    res.send(html);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al obtener suscripciones");
  }
});

export default router;
