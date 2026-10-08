/**
 * Script de prueba de conexión a MongoDB Atlas
 * Uso: node testConnection.js
 */
require('dotenv').config();
const mongoose = require('mongoose');

async function probarConexion() {
  const uri = process.env.MONGODB_URI;

  if (!uri || uri.includes('<') || uri.includes('XXXXX')) {
    console.error('ERROR: Configura MONGODB_URI en el archivo .env con la URI real de Atlas.');
    process.exit(1);
  }

  // Ocultar password en consola al mostrar la URI
  const uriSegura = uri.replace(/:([^@]+)@/, ':****@');
  console.log('Intentando conectar a:', uriSegura);

  try {
    const conexion = await mongoose.connect(uri);
    console.log('----------------------------------------');
    console.log('CONEXION EXITOSA');
    console.log('Host:', conexion.connection.host);
    console.log('Base de datos:', conexion.connection.name);
    console.log('Estado:', conexion.connection.readyState === 1 ? 'conectado' : 'otro');
    console.log('----------------------------------------');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('----------------------------------------');
    console.error('FALLO LA CONEXION');
    console.error('Motivo:', error.message);
    console.error('----------------------------------------');
    console.error('Revisa:');
    console.error('1) Usuario y contraseña en .env');
    console.error('2) Network Access en Atlas (tu IP o 0.0.0.0/0)');
    console.error('3) Que el cluster este activo (no paused)');
    process.exit(1);
  }
}

probarConexion();
