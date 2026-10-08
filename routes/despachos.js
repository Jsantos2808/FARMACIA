/**
 * Rutas de Despachos (módulo principal)
 * POST /api/despachos → despachar (aplica reglas de negocio)
 * GET  /api/despachos → historial (útil para demostrar trazabilidad)
 */
const express = require('express');
const router = express.Router();
const {
  crearDespacho,
  listarDespachos
} = require('../controllers/despachoController');

router.post('/', crearDespacho);
router.get('/', listarDespachos);

module.exports = router;
