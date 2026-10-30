/**
 * Escudo perimetral de manejo global de errores discretos.
 * Captura cualquier fallo inesperado en controladores o middlewares,
 * registra la traza completa únicamente en la consola privada del servidor
 * y responde al cliente con un formato JSON limpio, estricto y sin fugas de información.
 */
function errorMiddleware(err, req, res, next) {
  // Registro seguro y privado en consola del servidor (para depuración interna)
  console.error('🛡️ [ESCUDO_ERROR_INTERNO]', {
    timestamp: new Date().toISOString(),
    metodo: req.method,
    url: req.originalUrl,
    ip: req.ip,
    nombre: err.name,
    mensaje: err.message,
    stack: err.stack,
  });

  // Manejo de JSON malformado en el cuerpo de la petición
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      ok: false,
      mensaje: 'Formato JSON inválido en el cuerpo de la solicitud',
    });
  }

  // Manejo de errores de carga de archivos (Multer)
  if (err.name === 'MulterError') {
    return res.status(400).json({
      ok: false,
      mensaje: `Error en la carga de archivos: ${err.message}`,
    });
  }

  // Errores con código de estado HTTP explícito definido previamente
  const statusCode = typeof err.status === 'number' && err.status >= 400 && err.status < 600
    ? err.status
    : 500;

  // Respuesta hermética al cliente: nunca expone trazas de código ni rutas internas
  return res.status(statusCode).json({
    ok: false,
    mensaje: statusCode === 500
      ? 'Error interno al procesar la solicitud'
      : (err.message || 'Error al procesar la solicitud'),
  });
}

module.exports = errorMiddleware;
