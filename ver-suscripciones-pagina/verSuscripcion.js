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

    const html = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>Suscripciones activas</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background: #f4f6f9;
            margin: 0;
            padding: 20px;
          }
          h1 {
            text-align: center;
            color: #333;
          }
          .search-box {
            display: flex;
            justify-content: center;
            margin-bottom: 20px;
          }
          .search-box input {
            padding: 10px;
            border: 1px solid #ccc;
            border-radius: 8px 0 0 8px;
            outline: none;
            width: 300px;
          }
          .search-box button {
            padding: 10px 20px;
            border: none;
            background: #007bff;
            color: white;
            border-radius: 0 8px 8px 0;
            cursor: pointer;
          }
          .search-box button:hover {
            background: #0056b3;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            background: white;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
          }
          th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #ddd;
          }
          th {
            background: #007bff;
            color: white;
          }
          tr:hover {
            background: #f1f1f1;
          }
        </style>
      </head>
      <body>
        <h1>📋 Suscripciones activas</h1>
        
        <div class="search-box">
          <form method="get" action="/ver-suscripciones-pagina">
            <input type="text" name="search" placeholder="Buscar por email" value="${
              search || ""
            }" />
            <button type="submit">Buscar</button>
          </form>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Email</th>
              <th>Plan</th>
            </tr>
          </thead>
          <tbody>
            ${
              usuarios.length > 0
                ? usuarios
                    .map(
                      (s) => `
              <tr>
                <td>${s.nombre}</td>
                <td>${s.email.split("%40").join("@")}</td>
                <td>${s.planActivo?"Plan Activo ✅":"Sin Plan❌"}</td>
              </tr>
            `
                    )
                    .join("")
                : `<tr><td colspan="4" style="text-align:center;">No se encontraron suscripciones</td></tr>`
            }
          </tbody>
        </table>
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
