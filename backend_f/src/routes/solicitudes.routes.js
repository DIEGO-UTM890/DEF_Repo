const { Router } = require('express');
const {
  crearSolicitud,
  listarSolicitudes,
  aprobarSolicitud,
  rechazarSolicitud,
} = require('../controllers/solicitudes.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');
const validateMiddleware = require('../middlewares/validate.middleware');
const { solicitudRegistroSchema } = require('../schemas/solicitud.schema');

const router = Router();

// Crear solicitud de registro — PÚBLICA (sin token, es el primer paso)
router.post('/', validateMiddleware(solicitudRegistroSchema), crearSolicitud);

// Las siguientes rutas requieren autenticación y rol con permisos de gestión
router.use(authMiddleware);

// Listar solicitudes pendientes (admin, coordinador, superadmin)
router.get(
  '/',
  roleMiddleware('admin', 'coordinador', 'superadmin'),
  listarSolicitudes
);

// Aprobar solicitud y activar cuenta
router.patch(
  '/:id/aprobar',
  roleMiddleware('admin', 'coordinador', 'superadmin'),
  aprobarSolicitud
);

// Rechazar solicitud
router.patch(
  '/:id/rechazar',
  roleMiddleware('admin', 'coordinador', 'superadmin'),
  rechazarSolicitud
);

module.exports = router;

