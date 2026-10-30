const { Router } = require('express');
const {
  listarIncidencias,
  crearIncidencia,
  obtenerIncidenciaPorId,
  actualizarEstadoIncidencia,
  gestionarEtiquetas,
  buscarIncidencias,
  asignarTecnico,
} = require('../controllers/incidencias.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');
const validateMiddleware = require('../middlewares/validate.middleware');
const uploadMiddleware = require('../middlewares/upload.middleware');
const {
  crearIncidenciaSchema,
  actualizarIncidenciaSchema,
  gestionarEtiquetasSchema,
  asignarTecnicoSchema,
} = require('../schemas/incidencia.schema');

const router = Router();

// Todas las rutas de incidencias requieren token válido
router.use(authMiddleware);

// RF-06: Buscador Inteligente en Español con textScore (se define antes de /:id)
router.get('/search', buscarIncidencias);

// Listar incidencias con filtros
router.get('/', listarIncidencias);

// Obtener detalle de incidencia por ID o Folio
router.get('/:id', obtenerIncidenciaPorId);

// RF-01, RF-02 y RF-03: Crear nueva incidencia polimórfica (con o sin evidencias)
router.post(
  '/',
  uploadMiddleware.array('evidencias', 5),
  validateMiddleware(crearIncidenciaSchema),
  crearIncidencia
);

// RF-04: Actualización Atómica de Estado, Bitácora y Horas ($set, $push, $inc)
router.patch(
  '/:id',
  roleMiddleware('admin', 'coordinador', 'tecnico', 'superadmin'),
  validateMiddleware(actualizarIncidenciaSchema),
  actualizarEstadoIncidencia
);

// Alias de compatibilidad para actualizar estado
router.patch(
  '/:id/estado',
  roleMiddleware('admin', 'coordinador', 'tecnico', 'superadmin'),
  validateMiddleware(actualizarIncidenciaSchema),
  actualizarEstadoIncidencia
);

// RF-05: Gestión de etiquetas en arreglo embebido ($addToSet y $pull)
router.patch(
  '/:id/tags',
  roleMiddleware('admin', 'coordinador', 'tecnico', 'superadmin'),
  validateMiddleware(gestionarEtiquetasSchema),
  gestionarEtiquetas
);

// Asignar técnico responsable a la incidencia
router.patch(
  '/:id/asignar',
  roleMiddleware('admin', 'coordinador', 'superadmin'),
  validateMiddleware(asignarTecnicoSchema),
  asignarTecnico
);

module.exports = router;
