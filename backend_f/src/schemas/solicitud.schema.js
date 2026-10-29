const { z } = require('zod');

const ROLES_SOLICITABLES = [
  'reportante',
  'tecnico',
  'coordinador',
  'directivo',
  'admin',
];

const AREAS_VALIDAS = [
  'computo_redes',
  'infraestructura',
  'academico',
  'general',
];

const solicitudRegistroSchema = z.object({
  nombre: z
    .string({ required_error: 'El nombre es requerido' })
    .trim()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),

  correo: z
    .string({ required_error: 'El correo institucional es requerido' })
    .trim()
    .email('El formato del correo no es válido')
    .toLowerCase(),

  password: z
    .string({ required_error: 'La contraseña es requerida' })
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(128, 'La contraseña no puede exceder 128 caracteres'),

  rol_solicitado: z.enum(ROLES_SOLICITABLES, {
    errorMap: () => ({
      message: `El rol solicitado debe ser uno de: ${ROLES_SOLICITABLES.join(', ')}`,
    }),
  }),

  area_asignada: z.enum(AREAS_VALIDAS, {
    errorMap: () => ({
      message: `El área debe ser: ${AREAS_VALIDAS.join(', ')}`,
    }),
  }).default('general'),

  matricula_o_empleado: z
    .string()
    .trim()
    .min(3, 'Matrícula/N° empleado requerido')
    .max(30, 'Demasiado largo')
    .optional(),

  motivo: z
    .string()
    .trim()
    .max(500, 'El motivo no puede exceder 500 caracteres')
    .optional(),
});

module.exports = {
  solicitudRegistroSchema,
  ROLES_SOLICITABLES,
  AREAS_VALIDAS,
};

