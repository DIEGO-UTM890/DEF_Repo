const { z } = require('zod');

const CATEGORIAS_VALIDAS = [
  'hardware',
  'software',
  'redes_conectividad',
  'audiovisual',
  'infraestructura',
  'acceso_cuentas',
  'otro',
];

const PRIORIDADES_VALIDAS = ['baja', 'media', 'alta', 'urgente'];
const ESTADOS_VALIDOS = ['abierta', 'asignada', 'en_proceso', 'en_espera', 'resuelta', 'cerrada'];

const crearIncidenciaSchema = z.object({
  titulo: z
    .string({ required_error: 'El título de la incidencia es requerido' })
    .trim()
    .min(5, 'El título debe tener al menos 5 caracteres')
    .max(150, 'El título no puede exceder 150 caracteres'),
  descripcion: z
    .string({ required_error: 'La descripción detallada es requerida' })
    .trim()
    .min(10, 'La descripción debe tener al menos 10 caracteres')
    .max(2000, 'La descripción no puede exceder 2000 caracteres'),
  categoria: z.enum(CATEGORIAS_VALIDAS, {
    errorMap: () => ({ message: `Categoría inválida. Opciones: ${CATEGORIAS_VALIDAS.join(', ')}` }),
  }),
  prioridad: z.enum(PRIORIDADES_VALIDAS).default('media'),
  edificio: z.string().trim().min(2, 'Especifica el edificio o campus').max(80),
  aula_oficina: z.string().trim().min(1, 'Especifica el aula, laboratorio u oficina').max(80),
  dispositivo_afectado: z.string().trim().max(100).optional(),
});

const actualizarEstadoIncidenciaSchema = z.object({
  estado: z.enum(ESTADOS_VALIDOS, {
    errorMap: () => ({ message: `Estado inválido. Opciones: ${ESTADOS_VALIDOS.join(', ')}` }),
  }),
  comentarios_resolucion: z.string().trim().max(1000).optional(),
});

const asignarTecnicoSchema = z.object({
  tecnicoId: z.string().trim().min(1, 'El ID del técnico es obligatorio'),
  notas_asignacion: z.string().trim().max(500).optional(),
});

module.exports = {
  CATEGORIAS_VALIDAS,
  PRIORIDADES_VALIDAS,
  ESTADOS_VALIDOS,
  crearIncidenciaSchema,
  actualizarEstadoIncidenciaSchema,
  asignarTecnicoSchema,
};
