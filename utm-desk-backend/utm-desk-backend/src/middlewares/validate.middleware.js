const { ZodError } = require('zod');

/**
 * Escudo de validación estricta de datos entrantes con esquemas Zod.
 * Bloquea cualquier payload malformado antes de llegar a los controladores.
 * 
 * @param {import('zod').ZodSchema} schema
 * @param {'body' | 'query' | 'params'} target
 */
function validateMiddleware(schema, target = 'body') {
  return async (req, res, next) => {
    try {
      const dataToValidate = req[target] || {};
      const parsedData = await schema.parseAsync(dataToValidate);
      req[target] = parsedData;
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errores = error.issues.map((issue) => ({
          campo: issue.path.join('.'),
          mensaje: issue.message,
        }));

        return res.status(400).json({
          ok: false,
          mensaje: 'Datos de solicitud inválidos o incompletos',
          errores,
        });
      }

      return next(error);
    }
  };
}

module.exports = validateMiddleware;
