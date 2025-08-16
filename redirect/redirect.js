// redirect.js
import express from "express";
const router = express.Router();

router.get("/", (req, res) => {
  const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8" />
      <title>BeardHook - Confirmación</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <style>
        body {
          margin: 0;
          font-family: system-ui, sans-serif;
          background: #1a1a18;
          color: white;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          text-align: center;
          padding: 20px;
        }
        header img {
          max-width: 180px;
          margin-bottom: 30px;
        }
        h1 {
          font-size: 1.8rem;
          margin-bottom: 16px;
        }
        p {
          font-size: 1.1rem;
          line-height: 1.4;
          max-width: 400px;
        }
        .highlight {
          font-weight: bold;
          color: #00ffcc;
        }
      </style>
    </head>
    <body>
      <header>
        <img src="https://api.beardhook.com/logo.png" alt="BeardHook Logo" />
      </header>
      <main>
        <h1>¡Gracias por tu suscripción! 🙌</h1>
        <p>Tu pago se está procesando. En un máximo de <span class="highlight">5 minutos</span> será validado.</p>
        <p>Por favor, <span class="highlight">cerrá la app y volvé a abrirla</span> para continuar.</p>
      </main>
    </body>
    </html>
  `;
  res.send(html);
});

export default router;
