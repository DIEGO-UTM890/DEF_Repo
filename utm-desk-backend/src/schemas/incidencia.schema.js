const { z } = require('zod');

// Categorías oficiales de UTM Desk (Tabla 8 y 10 del documento oficial)
const CATEGORIAS_VALIDAS = [
  'computo_redes',
  'infraestructura',
  'academico',
  // Compatibilidad legacy
  'redes_conectividad',
  'hardware',
  'software',
  'audiovisual',
  'acceso_cuentas',
  'otro',
];

const PRIORIDADES_VALIDAS = ['baja', 'media', 'alta', 'critica', 'urgente'];
const ESTADOS_VALIDOS = ['abierta', 'en_proceso', 'en_espera', 'resuelta', 'cerrada', 'asignada'];

// Subdocumentos polimórficos de detalle_especifico según categoría
const detalleComputoRedesSchema = z.object({
  tipo_dispositivo: z.string().trim().min(2, 'Especifica el tipo de dispositivo').max(100),
  direccion_ip: z.string().trim().max(50).optional().default('192.168.1.1'),
  vlan: z.union([z.number(), z.string()]).optional().default(1),
  puerto_uplink: z.string().trim().max(50).optional().default('Gi0/1'),
  equipos_afectados: z.union([z.number(), z.string()]).optional().default(1),
}).passthrough();

const detalleInfraestructuraSchema = z.object({
  tipo_dano: z.string().trim().min(2, 'Especifica el tipo de daño').max(100),
  riesgo_seguridad: z.enum(['bajo', 'medio', 'alto']).default('medio'),
  materiales_requeridos: z.union([z.array(z.string()), z.string()]).optional().default([]),
  requiere_contratista_externo: z.union([z.boolean(), z.string()]).optional().default(false),
}).passthrough();

const detalleAcademicoSchema = z.object({
  plataforma_afectada: z.string().trim().min(2, 'Especifica la plataforma afectada').max(100),
  codigo_curso: z.string().trim().max(50).optional().default('BDN-501'),
  periodo_escolar: z.string().trim().max(80).optional().default('Septiembre - Diciembre 2026'),
  estudiantes_impactados: z.union([z.number(), z.string()]).optional().default(1),
}).passthrough();

// Esquema de creación de incidencias (RF-01 con soporte polimórfico y plano)
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
  
  // Soporte de ubicación anidada (Tabla 9) o campos planos
  ubicacion: z.object({
    edificio: z.string().trim().min(2).max(80),
    aula_o_espacio: z.string().trim().min(1).max(80),
    planta: z.string().trim().max(50).optional().default('Planta Baja'),
  }).optional(),
  edificio: z.string().trim().min(2).max(80).optional(),
  aula_oficina: z.string().trim().min(1).max(80).optional(),
  dispositivo_afectado: z.string().trim().max(100).optional(),

  // Subdocumento polimórfico detalle_especifico (RF-01)
  detalle_especifico: z.union([
    detalleComputoRedesSchema,
    detalleInfraestructuraSchema,
    detalleAcademicoSchema,
    z.record(z.any()),
  ]).optional(),

  // Arreglos embebidos (Tabla 9)
  tags: z.array(z.string()).optional(),
  evidencias_adjuntas: z.array(z.any()).optional(),
  reportante: z.object({
    usuario_id: z.string().optional(),
    nombre: z.string().optional(),
    correo: z.string().optional(),
    tipo_usuario: z.string().optional(),
  }).optional(),
}).passthrough();

// Actualización atómica de estado, bitácora y horas (RF-04)
const actualizarIncidenciaSchema = z.object({
  estado: z.enum(ESTADOS_VALIDOS).optional(),
  comentario: z.string().trim().max(1000).optional(),
  comentarios_resolucion: z.string().trim().max(1000).optional(),
  horas_agregadas: z.union([z.number(), z.string()]).optional(),
  horas_invertidas: z.union([z.number(), z.string()]).optional(),
  fecha_resolucion: z.string().optional(),
}).passthrough();

// Gestión atómica de etiquetas con $addToSet y $pull (RF-05)
const gestionarEtiquetasSchema = z.object({
  tag: z.string().trim().min(1, 'La etiqueta no puede estar vacía').max(50),
  accion: z.enum(['agregar', 'remover']).optional().default('agregar'),
}).passthrough();

// Asignación de técnico responsable
const asignarTecnicoSchema = z.object({
  tecnicoId: z.string().trim().min(1, 'El ID del técnico es obligatorio'),
  nombre_tecnico: z.string().trim().max(100).optional(),
  notas_asignacion: z.string().trim().max(500).optional(),
}).passthrough();

module.exports = {
  CATEGORIAS_VALIDAS,
  PRIORIDADES_VALIDAS,
  ESTADOS_VALIDOS,
  crearIncidenciaSchema,
  actualizarIncidenciaSchema,
  actualizarEstadoIncidenciaSchema: actualizarIncidenciaSchema,
  gestionarEtiquetasSchema,
  asignarTecnicoSchema,
};
