/**
 * ============================================================
 * CONEXIÓN A MONGODB ATLAS (Mongoose)
 * ============================================================
 * Lee la URI desde el archivo .env (variable MONGODB_URI).
 * Usuario de Atlas configurado: jsantosa5_db_user
 */
const mongoose = require('mongoose');

const conectarDB = async () => {
  try {
    // mongoose.connect establece la conexión con el cluster de Atlas
    const conexion = await mongoose.connect(process.env.MONGODB_URI);

    console.log(`MongoDB conectado: ${conexion.connection.host}`);
    console.log(`Base de datos: ${conexion.connection.name}`);
  } catch (error) {
    console.error('Error al conectar con MongoDB:', error.message);
    // Si no hay conexión, detenemos la aplicación
    process.exit(1);
  }
};

module.exports = conectarDB;
