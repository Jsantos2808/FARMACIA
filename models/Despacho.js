/**
 * ============================================================
 * MODELO: Despacho (Historial)
 * ============================================================
 * Cada documento es un registro de trazabilidad de una salida
 * de inventario. Se crea SOLO cuando el despacho es exitoso
 * (REGLA DE TRAZABILIDAD).
 *
 * Campos:
 * - fecha            → cuándo se realizó el despacho
 * - medicamento      → referencia al Medicamento (ObjectId)
 * - codigoMedicamento / nombreMedicamento → copia para lectura rápida
 * - cantidadDespachada
 * - recetaValidada   → indica si se confirmó la receta en ese despacho
 */
const mongoose = require('mongoose');

const despachoSchema = new mongoose.Schema(
  {
    fecha: {
      type: Date,
      default: Date.now
    },
    // Relación con el medicamento despachado (para consultas con populate)
    medicamento: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Medicamento',
      required: true
    },
    // Guardamos código y nombre para que el historial se lea sin joins
    codigoMedicamento: {
      type: String,
      required: true
    },
    nombreMedicamento: {
      type: String,
      required: true
    },
    cantidadDespachada: {
      type: Number,
      required: [true, 'La cantidad despachada es obligatoria'],
      min: [1, 'La cantidad despachada debe ser al menos 1']
    },
    // Indica si en ese despacho se validó/entregó la receta
    recetaValidada: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Despacho', despachoSchema);
