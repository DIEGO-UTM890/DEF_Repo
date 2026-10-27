/**
 * Escudo de autorización basado en roles (RBAC).
 * Verifica que el usuario autenticado cuente con los permisos necesarios.
 * 
 * @param {...string} rolesPermitidos - Lista de roles permitidos (ej. 'admin', 'tecnico', 'coordinador')
 */
function roleMiddleware(...rolesPermitidos) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        ok: false,
        mensaje: 'Usuario no autenticado',
      });
    }

    const rolUsuario = req.user.rol || req.user.role;

    if (!rolUsuario || !rolesPermitidos.includes(rolUsuario)) {
      return res.status(403).json({
        ok: false,
        mensaje: 'Acceso denegado: No cuentas con los privilegios suficientes para este recurso',
      });
    }

    return next();
  };
}

module.exports = roleMiddleware;
