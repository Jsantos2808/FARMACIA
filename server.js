/**
 * ============================================================
 * SERVIDOR PRINCIPAL - API Farmacia
 * ============================================================
 * Punto de entrada de la aplicación.
 * 1. Carga variables de entorno (.env)
 * 2. Conecta a MongoDB Atlas
 * 3. Monta las rutas REST
 * 4. Escucha en el puerto definido (default 3000)
 */
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const conectarDB = require('./config/db');
const Medicamento = require('./models/Medicamento');
const Despacho = require('./models/Despacho');

// Importar rutas
const medicamentosRoutes = require('./routes/medicamentos');
const despachosRoutes = require('./routes/despachos');

const app = express();

// ---------- Middlewares ----------
app.use(cors()); // Permite peticiones desde Postman / navegador
app.use(express.json()); // Parsea el body JSON de las peticiones

// ---------- Conexión a la base de datos ----------
conectarDB();

// Estilos compartidos para páginas HTML del navegador
const estilos = `
  body { font-family: Segoe UI, sans-serif; max-width: 900px; margin: 40px auto; padding: 0 16px; color: #1a1a1a; background: #f7faf8; }
  h1 { color: #0b6b4f; }
  a { color: #0b6b4f; font-weight: 600; }
  code { background: #eee; padding: 2px 6px; border-radius: 4px; }
  li { margin: 8px 0; }
  table { width: 100%; border-collapse: collapse; margin-top: 16px; background: #fff; }
  th, td { border: 1px solid #cfd8d3; padding: 10px; text-align: left; }
  th { background: #0b6b4f; color: #fff; }
  tr:nth-child(even) { background: #f3faf6; }
  .vacio { color: #666; margin-top: 16px; }
  .nav { margin-bottom: 20px; }
`;

// ---------- Página principal ----------
app.get('/', (req, res) => {
  res.type('html').send(`<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>API Farmacia</title>
  <style>${estilos}</style>
</head>
<body>
  <h1>API REST — Farmacia</h1>
  <h2>Pruebas rápidas</h2>
  <ul>
    <li><a href="/ver/medicamentos">Ver inventario (medicamentos)</a></li>
    <li><a href="/ver/despachos">Ver historial (despachos)</a></li>
  </ul>
  <h2>Endpoints</h2>
  <ul>
    <li><code>POST /api/medicamentos</code> — registrar medicamento</li>
    <li><code>GET /api/medicamentos</code> — listar inventario</li>
    <li><code>POST /api/despachos</code> — despachar (reglas de negocio)</li>
    <li><code>GET /api/despachos</code> — historial de despachos</li>
  </ul>
</body>
</html>`);
});

// ---------- Vistas HTML (para ver datos en el navegador sin pantalla blanca) ----------
app.get('/ver/medicamentos', async (req, res) => {
  try {
    const medicamentos = await Medicamento.find().sort({ nombre: 1 });

    const filas = medicamentos.length
      ? medicamentos
          .map(
            (m) => `<tr>
          <td>${m.codigo}</td>
          <td>${m.nombre}</td>
          <td>${m.cantidadStock}</td>
          <td>${new Date(m.fechaCaducidad).toLocaleDateString('es-ES')}</td>
          <td>${m.requiereReceta ? 'Sí' : 'No'}</td>
          <td>${m.stockMinimo}</td>
        </tr>`
          )
          .join('')
      : '';

    res.type('html').send(`<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <title>Inventario</title>
  <style>${estilos}</style>
</head>
<body>
  <p class="nav"><a href="/">← Volver al inicio</a></p>
  <h1>Inventario de medicamentos</h1>
  ${
    medicamentos.length
      ? `<table>
        <thead>
          <tr>
            <th>Código</th>
            <th>Nombre</th>
            <th>Stock</th>
            <th>Caducidad</th>
            <th>Requiere receta</th>
            <th>Stock mínimo</th>
          </tr>
        </thead>
        <tbody>${filas}</tbody>
      </table>`
      : '<p class="vacio">No hay medicamentos registrados aún. Úsalos con Postman (POST /api/medicamentos).</p>'
  }
  <p style="margin-top:20px;">JSON de la API: <a href="/api/medicamentos">/api/medicamentos</a></p>
</body>
</html>`);
  } catch (error) {
    res.status(500).send(`Error: ${error.message}`);
  }
});

app.get('/ver/despachos', async (req, res) => {
  try {
    const despachos = await Despacho.find().sort({ fecha: -1 });

    const filas = despachos.length
      ? despachos
          .map(
            (d) => `<tr>
          <td>${new Date(d.fecha).toLocaleString('es-ES')}</td>
          <td>${d.codigoMedicamento}</td>
          <td>${d.nombreMedicamento}</td>
          <td>${d.cantidadDespachada}</td>
          <td>${d.recetaValidada ? 'Sí' : 'No'}</td>
        </tr>`
          )
          .join('')
      : '';

    res.type('html').send(`<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <title>Historial de despachos</title>
  <style>${estilos}</style>
</head>
<body>
  <p class="nav"><a href="/">← Volver al inicio</a></p>
  <h1>Historial de despachos</h1>
  ${
    despachos.length
      ? `<table>
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Código</th>
            <th>Medicamento</th>
            <th>Cantidad</th>
            <th>Receta validada</th>
          </tr>
        </thead>
        <tbody>${filas}</tbody>
      </table>`
      : '<p class="vacio">Aún no hay despachos. Prueba en Postman: POST /api/despachos con codigo y cantidad.</p>'
  }
  <p style="margin-top:20px;">JSON de la API: <a href="/api/despachos">/api/despachos</a></p>
</body>
</html>`);
  } catch (error) {
    res.status(500).send(`Error: ${error.message}`);
  }
});

// ---------- Rutas JSON de la API (para Postman) ----------
app.use('/api/medicamentos', medicamentosRoutes);
app.use('/api/despachos', despachosRoutes);

// Ruta 404 para endpoints no existentes
app.use((req, res) => {
  res.status(404).json({
    exito: false,
    mensaje: `Ruta no encontrada: ${req.method} ${req.originalUrl}`
  });
});

// ---------- Arranque del servidor ----------
const PORT = process.env.PORT || 3000;

const servidor = app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

// Si el puerto ya está ocupado (EADDRINUSE), muestra un mensaje claro
servidor.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`El puerto ${PORT} ya está en uso.`);
    console.error('Cierra la otra terminal que tenga el servidor, o ejecuta:');
    console.error(`  netstat -ano | findstr :${PORT}`);
    console.error('y luego: taskkill /PID <numero> /F');
    process.exit(1);
  }
  throw error;
});
