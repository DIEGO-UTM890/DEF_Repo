const { Router } = require('express');
const {
  listarIncidencias,
  crearIncidencia,
  obtenerIncidenciaPorId,
  actualizarEstadoIncidencia,
  asignarTecnico,
} = require('../controllers/incidencias.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');
const validateMiddleware = require('../middlewares/validate.middleware');
const uploadMiddleware = require('../middlewares/upload.middleware');
const {
  crearIncidenciaSchema,
  actualizarEstadoIncidenciaSchema,
  asignarTecnicoSchema,
} = require('../schemas/incidencia.schema');

const router = Router();

// Todas las rutas de incidencias requieren token válido
router.use(authMiddleware);

// Listar incidencias
router.get('/', listarIncidencias);

// Obtener detalle de incidencia por ID
router.get('/:id', obtenerIncidenciaPorId);

// Crear nueva incidencia (permite adjuntar hasta 5 archivos como evidencias)
router.post(
  '/',
  uploadMiddleware.array('evidencias', 5),
  validateMiddleware(crearIncidenciaSchema),
  crearIncidencia
);

// Actualizar estado de la incidencia (técnicos, coordinadores y administradores)
router.patch(
  '/:id/estado',
  roleMiddleware('admin', 'coordinador', 'tecnico'),
  validateMiddleware(actualizarEstadoIncidenciaSchema),
  actualizarEstadoIncidencia
);

// Asignar técnico responsable a la incidencia
router.patch(
  '/:id/asignar',
  roleMiddleware('admin', 'coordinador'),
  validateMiddleware(asignarTecnicoSchema),
  asignarTecnico
);

module.exports = router;
