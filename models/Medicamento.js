/**
 * ============================================================
 * MODELO: Medicamento
 * ============================================================
 * Representa cada producto del inventario de la farmacia.
 *
 * Campos según el enunciado:
 * - codigo          → identificador único del medicamento
 * - nombre          → nombre comercial / genérico
 * - cantidadStock   → unidades disponibles
 * - fechaCaducidad  → se usa en la REGLA DE CADUCIDAD al despachar
 * - requiereReceta  → se usa en la REGLA DE MEDICAMENTOS CONTROLADOS
 * - stockMinimo     → se usa en la ALERTA DE STOCK MÍNIMO (default: 5)
 */
const mongoose = require('mongoose');

const medicamentoSchema = new mongoose.Schema(
  {
    codigo: {
      type: String,
      required: [true, 'El código del medicamento es obligatorio'],
      unique: true,
      trim: true,
      uppercase: true
    },
    nombre: {
      type: String,
      required: [true, 'El nombre del medicamento es obligatorio'],
      trim: true
    },
    cantidadStock: {
      type: Number,
      required: [true, 'La cantidad en stock es obligatoria'],
      min: [0, 'El stock no puede ser negativo']
    },
    fechaCaducidad: {
      type: Date,
      required: [true, 'La fecha de caducidad es obligatoria']
    },
    // REGLA DE NEGOCIO (Medicamentos Controlados):
    // Si es true, el despacho EXIGE confirmar que se entregó la receta.
    requiereReceta: {
      type: Boolean,
      required: true,
      default: false
    },
    // REGLA DE NEGOCIO (Alerta de Stock Mínimo):
    // Valor umbral; por defecto 5 según el enunciado.
    stockMinimo: {
      type: Number,
      default: 5,
      min: [0, 'El stock mínimo no puede ser negativo']
    }
  },
  {
    // timestamps agrega createdAt y updatedAt automáticamente
    timestamps: true
  }
);

module.exports = mongoose.model('Medicamento', medicamentoSchema);
