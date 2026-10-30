const { z } = require('zod');

const ROLES_VALIDOS = ['admin', 'coordinador', 'tecnico', 'docente', 'estudiante', 'personal'];

const registroUsuarioSchema = z.object({
  nombre: z
    .string({ required_error: 'El nombre es requerido' })
    .trim()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  correo: z
    .string({ required_error: 'El correo electrónico es requerido' })
    .trim()
    .email('El formato del correo electrónico no es válido')
    .toLowerCase(),
  password: z
    .string({ required_error: 'La contraseña es requerida' })
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(128, 'La contraseña no puede exceder 128 caracteres'),
  rol: z
    .enum(ROLES_VALIDOS, {
      errorMap: () => ({ message: `El rol debe ser uno de: ${ROLES_VALIDOS.join(', ')}` }),
    })
    .default('estudiante'),
  telefono: z
    .string()
    .trim()
    .regex(/^[0-9+() -]{7,20}$/, 'Formato de teléfono no válido')
    .optional(),
});

const loginUsuarioSchema = z.object({
  correo: z
    .string({ required_error: 'El correo electrónico es requerido' })
    .trim()
    .email('El formato del correo electrónico no es válido')
    .toLowerCase(),
  password: z
    .string({ required_error: 'La contraseña es requerida' })
    .min(1, 'La contraseña no puede estar vacía'),
});

const actualizarUsuarioSchema = z.object({
  nombre: z.string().trim().min(3).max(100).optional(),
  rol: z.enum(ROLES_VALIDOS).optional(),
  telefono: z.string().trim().regex(/^[0-9+() -]{7,20}$/).optional(),
  activo: z.boolean().optional(),
});

module.exports = {
  ROLES_VALIDOS,
  registroUsuarioSchema,
  loginUsuarioSchema,
  actualizarUsuarioSchema,
};
