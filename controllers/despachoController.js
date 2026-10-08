/**
 * ============================================================
 * CONTROLADOR: Despachos (MÓDULO PRINCIPAL)
 * ============================================================
 * Aquí se aplican TODAS las reglas de negocio del enunciado:
 *
 * 1) CADUCIDAD            → no despachar si ya venció
 * 2) STOCK INSUFICIENTE   → no despachar más de lo disponible
 * 3) MEDICAMENTOS CONTROLADOS → exigir confirmación de receta
 * 4) ALERTA STOCK MÍNIMO  → advertir si stock restante <= stockMinimo
 * 5) TRAZABILIDAD         → guardar historial en colección Despachos
 *
 * Body esperado (JSON) en POST /api/despachos:
 * {
 *   "codigo": "MED001",          // o "nombre": "Paracetamol 500mg"
 *   "cantidad": 2,
 *   "recetaEntregada": true      // obligatorio si requiereReceta = true
 * }
 */
const Medicamento = require('../models/Medicamento');
const Despacho = require('../models/Despacho');

const crearDespacho = async (req, res) => {
  try {
    const { codigo, nombre, cantidad, recetaEntregada } = req.body;

    // ---------- Validación de entrada ----------
    if ((!codigo && !nombre) || cantidad === undefined) {
      return res.status(400).json({
        exito: false,
        mensaje: 'Debe enviar codigo o nombre del medicamento, y la cantidad a despachar'
      });
    }

    if (typeof cantidad !== 'number' || cantidad <= 0) {
      return res.status(400).json({
        exito: false,
        mensaje: 'La cantidad debe ser un número mayor a 0'
      });
    }

    // Buscar por código (prioridad) o por nombre
    let medicamento;
    if (codigo) {
      medicamento = await Medicamento.findOne({ codigo: codigo.toUpperCase().trim() });
    } else {
      // Búsqueda por nombre (sin distinguir mayúsculas/minúsculas)
      medicamento = await Medicamento.findOne({
        nombre: { $regex: new RegExp(`^${nombre.trim()}$`, 'i') }
      });
    }

    if (!medicamento) {
      return res.status(404).json({
        exito: false,
        mensaje: 'Medicamento no encontrado en el inventario'
      });
    }

    // =========================================================
    // REGLA 1 — CADUCIDAD
    // Si la fecha actual es MAYOR a la fecha de caducidad,
    // se RECHAZA el despacho.
    // =========================================================
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0); // comparar solo fechas (sin hora)

    const caducidad = new Date(medicamento.fechaCaducidad);
    caducidad.setHours(0, 0, 0, 0);

    if (hoy > caducidad) {
      return res.status(400).json({
        exito: false,
        mensaje: 'Despacho rechazado: el medicamento está caducado',
        detalle: {
          fechaCaducidad: medicamento.fechaCaducidad,
          fechaActual: hoy
        }
      });
    }

    // =========================================================
    // REGLA 2 — STOCK INSUFICIENTE
    // No se puede despachar una cantidad mayor a la disponible.
    // =========================================================
    if (cantidad > medicamento.cantidadStock) {
      return res.status(400).json({
        exito: false,
        mensaje: 'Despacho rechazado: stock insuficiente',
        detalle: {
          stockDisponible: medicamento.cantidadStock,
          cantidadSolicitada: cantidad
        }
      });
    }

    // =========================================================
    // REGLA 3 — MEDICAMENTOS CONTROLADOS (requiereReceta)
    // Si el medicamento exige receta, el cliente DEBE enviar
    // recetaEntregada: true. Si no lo trae o es false → rechazo.
    // =========================================================
    let recetaValidada = false;

    if (medicamento.requiereReceta === true) {
      // Aceptamos true booleano o el string "true" (por si se prueba desde form)
      const confirmaReceta =
        recetaEntregada === true ||
        recetaEntregada === 'true' ||
        recetaEntregada === 1 ||
        recetaEntregada === '1';

      if (!confirmaReceta) {
        return res.status(400).json({
          exito: false,
          mensaje:
            'Despacho rechazado: este medicamento requiere receta. Envíe recetaEntregada: true',
          detalle: {
            medicamento: medicamento.nombre,
            requiereReceta: true
          }
        });
      }

      recetaValidada = true;
    }

    // ---------- Actualizar stock (resta la cantidad despachada) ----------
    medicamento.cantidadStock -= cantidad;
    await medicamento.save();

    // =========================================================
    // REGLA 5 — TRAZABILIDAD
    // Todo despacho exitoso se guarda en la colección "Despachos"
    // para mantener el historial de salidas.
    // =========================================================
    const registroDespacho = await Despacho.create({
      fecha: new Date(),
      medicamento: medicamento._id,
      codigoMedicamento: medicamento.codigo,
      nombreMedicamento: medicamento.nombre,
      cantidadDespachada: cantidad,
      recetaValidada
    });

    // =========================================================
    // REGLA 4 — ALERTA DE STOCK MÍNIMO
    // Si el stock restante es <= stockMinimo, se incluye
    // el mensaje: "Alerta: Reabastecimiento necesario"
    // =========================================================
    const respuesta = {
      exito: true,
      mensaje: 'Despacho realizado correctamente',
      data: {
        despacho: registroDespacho,
        stockRestante: medicamento.cantidadStock
      }
    };

    if (medicamento.cantidadStock <= medicamento.stockMinimo) {
      respuesta.alerta = 'Alerta: Reabastecimiento necesario';
      respuesta.detalleAlerta = {
        stockRestante: medicamento.cantidadStock,
        stockMinimo: medicamento.stockMinimo
      };
    }

    return res.status(201).json(respuesta);
  } catch (error) {
    return res.status(500).json({
      exito: false,
      mensaje: 'Error al procesar el despacho',
      error: error.message
    });
  }
};

/**
 * (Extra útil para la práctica) Listar el historial de despachos
 * GET /api/despachos
 */
const listarDespachos = async (req, res) => {
  try {
    const despachos = await Despacho.find().sort({ fecha: -1 });

    return res.status(200).json({
      exito: true,
      total: despachos.length,
      data: despachos
    });
  } catch (error) {
    return res.status(500).json({
      exito: false,
      mensaje: 'Error al obtener el historial de despachos',
      error: error.message
    });
  }
};

module.exports = {
  crearDespacho,
  listarDespachos
};
