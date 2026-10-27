const { Router } = require('express');
const {
  listarUsuarios,
  obtenerUsuarioPorId,
  actualizarUsuario,
  eliminarUsuario,
} = require('../controllers/usuarios.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');
const validateMiddleware = require('../middlewares/validate.middleware');
const { actualizarUsuarioSchema } = require('../schemas/usuario.schema');

const router = Router();

// Todas las rutas de administración de usuarios requieren autenticación
router.use(authMiddleware);

// Listar usuarios (solo coordinadores y administradores)
router.get('/', roleMiddleware('admin', 'coordinador'), listarUsuarios);

// Obtener detalle de usuario por ID
router.get('/:id', roleMiddleware('admin', 'coordinador'), obtenerUsuarioPorId);

// Actualizar usuario
router.put(
  '/:id',
  roleMiddleware('admin'),
  validateMiddleware(actualizarUsuarioSchema),
  actualizarUsuario
);

// Desactivar usuario
router.delete('/:id', roleMiddleware('admin'), eliminarUsuario);

module.exports = router;
