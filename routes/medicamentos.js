/**
 * Rutas de Medicamentos
 * POST /api/medicamentos → registrar
 * GET  /api/medicamentos → listar inventario
 */
const express = require('express');
const router = express.Router();
const {
  crearMedicamento,
  listarMedicamentos
} = require('../controllers/medicamentoController');

router.post('/', crearMedicamento);
router.get('/', listarMedicamentos);

module.exports = router;
{
  "codigo"; "MED002",
  "nombre"; "Ibuprofeno 400mg",
  "cantidadStock"; 15,
  "fechaCaducidad"; "2027-08-20",
  "requiereReceta"; false
}