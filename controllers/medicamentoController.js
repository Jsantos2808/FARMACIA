/**
 * ============================================================
 * CONTROLADOR: Medicamentos
 * ============================================================
 * Contiene la lógica de:
 * - POST /api/medicamentos  → registrar medicamento
 * - GET  /api/medicamentos  → listar inventario
 */
const Medicamento = require('../models/Medicamento');

/**
 * Registrar un nuevo medicamento en el inventario
 * Body esperado (JSON):
 * {
 *   "codigo": "MED001",
 *   "nombre": "Paracetamol 500mg",
 *   "cantidadStock": 100,
 *   "fechaCaducidad": "2027-12-31",
 *   "requiereReceta": false,
 *   "stockMinimo": 5          // opcional (default 5)
 * }
 */
const crearMedicamento = async (req, res) => {
  try {
    const { codigo, nombre, cantidadStock, fechaCaducidad, requiereReceta, stockMinimo } = req.body;

    // Validación básica de campos obligatorios
    if (!codigo || !nombre || cantidadStock === undefined || !fechaCaducidad) {
      return res.status(400).json({
        exito: false,
        mensaje: 'Faltan campos obligatorios: codigo, nombre, cantidadStock, fechaCaducidad'
      });
    }

    // Verificar que no exista otro medicamento con el mismo código
    const existe = await Medicamento.findOne({ codigo: codigo.toUpperCase().trim() });
    if (existe) {
      return res.status(400).json({
        exito: false,
        mensaje: `Ya existe un medicamento con el código ${codigo}`
      });
    }

    const medicamento = await Medicamento.create({
      codigo,
      nombre,
      cantidadStock,
      fechaCaducidad,
      requiereReceta: requiereReceta ?? false,
      stockMinimo: stockMinimo ?? 5
    });

    return res.status(201).json({
      exito: true,
      mensaje: 'Medicamento registrado correctamente',
      data: medicamento
    });
  } catch (error) {
    // Errores de validación de Mongoose (min, required, etc.)
    return res.status(400).json({
      exito: false,
      mensaje: 'Error al registrar el medicamento',
      error: error.message
    });
  }
};

/**
 * Listar todo el inventario de medicamentos
 */
const listarMedicamentos = async (req, res) => {
  try {
    const medicamentos = await Medicamento.find().sort({ nombre: 1 });

    return res.status(200).json({
      exito: true,
      total: medicamentos.length,
      data: medicamentos
    });
  } catch (error) {
    return res.status(500).json({
      exito: false,
      mensaje: 'Error al obtener el inventario',
      error: error.message
    });
  }
};

module.exports = {
  crearMedicamento,
  listarMedicamentos
};
