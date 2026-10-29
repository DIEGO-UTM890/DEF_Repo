const jwt = require('jsonwebtoken');

/**
 * Escudo de autenticación perimetral.
 * Valida el encabezado Authorization: Bearer <token>.
 */
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      ok: false,
      mensaje: 'Acceso denegado: Token de autorización no proporcionado',
    });
  }

  const token = authHeader.split(' ')[1];
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    console.error('❌ [Auth Shield] JWT_SECRET no está definido en las variables de entorno.');
    return res.status(500).json({
      ok: false,
      mensaje: 'Error interno al procesar la solicitud',
    });
  }

  try {
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    return next();
  } catch (error) {
    // Si el token expiró o la firma es inválida, responde con 401 genérico y seguro
    return res.status(401).json({
      ok: false,
      mensaje: 'Token inválido o expirado',
    });
  }
}

module.exports = authMiddleware;
