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
        s.email.split("%40").join("@").toLowerCase().split("+").join("")==search.toLowerCase()
      );
    } else {
      usuarios = []
    }

    const html = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>Suscripciones activas</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: system-ui, sans-serif;
            background: #f8f9fa;
            margin: 0;
            padding: 16px;
          }
          h1 {
            text-align: center;
            color: #222;
            font-size: 1.5rem;
            margin-bottom: 20px;
          }
          .search-box {
            display: flex;
            margin-bottom: 20px;
          }
          .search-box input {
            flex: 1;
            padding: 12px;
            border: 1px solid #ccc;
            border-radius: 8px 0 0 8px;
            outline: none;
            font-size: 1rem;
          }
          .search-box button {
            padding: 12px 20px;
            border: none;
            background: #007bff;
            color: white;
            border-radius: 0 8px 8px 0;
            cursor: pointer;
            font-size: 1rem;
          }
          .search-box button:hover {
            background: #0056b3;
          }
          .card {
            background: white;
            border-radius: 12px;
            padding: 16px;
            margin-bottom: 12px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
          }
          .card h2 {
            font-size: 1.1rem;
            margin: 0 0 8px;
            color: #007bff;
          }
          .card p {
            margin: 4px 0;
            color: #555;
            font-size: 0.95rem;
          }
          /* Versión desktop: muestra en grilla */
          @media(min-width: 768px) {
            .cards-container {
              display: grid;
              grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
              gap: 16px;
            }
            h1 {
              font-size: 2rem;
            }
          }
        </style>
      </head>
      <body>
        <h1>📋 Suscripciones activas</h1>

        <form method="get" action="/ver-suscripciones-pagina" class="search-box">
          <input type="text" name="search" placeholder="Buscar por nombre o email" value="${search || ""}" />
          <button type="submit">Buscar</button>
        </form>

        <div class="cards-container">
          ${
            usuarios.length > 0
              ? usuarios
                  .map(
                    (s) => `
              <div class="card">
                <h2>${s.nombre}</h2>
                <p><strong>Email:</strong> ${s.email.split("%40").join("@")}</p>
                <p><strong>Plan:</strong> ${s.planActivo?"Plan Activo ✅":"Sin Plan❌"}</p>
              </div>
            `
                  )
                  .join("")
              : `<p style="text-align:center;">No se encontraron usuarios</p>`
          }
        </div>
      </body>
      </html>
    `;
    res.send(html);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al obtener suscripciones");
  }
});

export default router;
