const { Router } = require('express');
const {
  listarIncidencias,
  crearIncidencia,
  obtenerIncidenciaPorId,
  actualizarEstadoIncidencia,
  asignarTecnico,
  buscarIncidencias,
  gestionarEtiquetas,
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

// RF-06: Búsqueda inteligente de texto completo en español con textScore
router.get('/search', buscarIncidencias);

// Obtener detalle de incidencia por ID o Folio
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

// RF-04: Actualización atómica de estado, bitácora y horas (PATCH /api/incidencias/:id)
router.patch(
  '/:id',
  roleMiddleware('admin', 'coordinador', 'tecnico'),
  actualizarEstadoIncidencia
);

// RF-05: Gestión de etiquetas en arreglo tags con $addToSet y $pull (PATCH /api/incidencias/:id/tags)
router.patch(
  '/:id/tags',
  roleMiddleware('admin', 'coordinador', 'tecnico'),
  gestionarEtiquetas
);

// Asignar técnico responsable a la incidencia
router.patch(
  '/:id/asignar',
  roleMiddleware('admin', 'coordinador'),
  validateMiddleware(asignarTecnicoSchema),
  asignarTecnico
);

module.exports = router;
