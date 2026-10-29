/**
 * incidencias.service.js — Servicio de Gestión de Incidencias
 * Conecta con las rutas del backend en /api/incidencias:
 *   - GET   /api/incidencias          (listar con filtros)
 *   - GET   /api/incidencias/:id      (obtener detalle)
 *   - POST  /api/incidencias          (crear con o sin evidencias adjuntas)
 *   - PATCH /api/incidencias/:id/estado  (cambiar estado con resolución)
 *   - PATCH /api/incidencias/:id/asignar (asignar técnico)
 */

import api from './api.js';
import { verificarBackend } from './auth.service.js';

// Mapeo bidireccional de categorías para compatibilidad entre frontend y backend
const CATEGORIA_MAP_TO_BACKEND = {
  'computo_redes': 'redes_conectividad',
  'audiovisual': 'audiovisual',
  'software': 'software',
  'hardware': 'hardware',
  'infraestructura': 'infraestructura',
  'redes_conectividad': 'redes_conectividad',
  'acceso_cuentas': 'acceso_cuentas',
  'otro': 'otro',
};

/**
 * Normaliza una incidencia proveniente del backend al formato que consumen los componentes del frontend.
 */
export function normalizarIncidencia(inc) {
  if (!inc) return null;

  const id = inc._id || inc.id || `INC-${Date.now()}`;
  const folio = inc.folio || (typeof id === 'string' && id.startsWith('INC-') ? id : `INC-2026-${String(id).slice(-4).padStart(4, '0')}`);

  // Manejo de ubicación
  const edificio = inc.ubicacion?.edificio || inc.edificio || 'Edificio Principal';
  const aula_o_espacio = inc.ubicacion?.aula_o_espacio || inc.aula_oficina || inc.aula || 'General';

  // Manejo de reportante
  const reportante = inc.reportante || {
    usuario_id: inc.usuario_id || inc.usuarioSolicitante || 'sistema',
    nombre: inc.nombre_reportante || 'Usuario Institucional',
    correo: inc.correo_reportante || 'usuario@utm.mx',
    tipo_usuario: inc.tipo_usuario || 'estudiante',
  };

  // Manejo de técnico asignado
  let tecnico_asignado = inc.tecnico_asignado || null;
  if (!tecnico_asignado && inc.tecnico_id) {
    tecnico_asignado = {
      usuario_id: inc.tecnico_id,
      nombre: inc.nombre_tecnico || 'Técnico Asignado',
      correo: inc.correo_tecnico || 'soporte@utm.mx',
    };
  }

  // Manejo de evidencias
  const evidencias = Array.isArray(inc.evidencias_adjuntas)
    ? inc.evidencias_adjuntas
    : Array.isArray(inc.evidencias)
    ? inc.evidencias.map((ev, idx) => ({
        nombre_archivo: typeof ev === 'string' ? `evidencia_${idx + 1}` : (ev.nombre || ev.originalname || 'evidencia'),
        url_storage: typeof ev === 'string' ? ev : (ev.url || ev.path),
        tipo_mime: ev.mimetype || 'image/jpeg',
      }))
    : [];

  // Manejo de historial
  const historial = Array.isArray(inc.historial_seguimiento)
    ? inc.historial_seguimiento
    : [
        {
          fecha: inc.fecha_creacion || new Date().toISOString(),
          autor: reportante.nombre || 'Sistema UTM Desk',
          rol_autor: 'sistema',
          estado_nuevo: inc.estado || 'abierta',
          comentario: 'Incidencia registrada en el sistema UTM Desk.',
        },
      ];

  return {
    _id: id,
    folio,
    titulo: inc.titulo || 'Sin título',
    descripcion: inc.descripcion || '',
    categoria: inc.categoria || 'otro',
    prioridad: inc.prioridad || 'media',
    estado: inc.estado || 'abierta',
    horas_invertidas: inc.horas_invertidas || 0,
    ubicacion: {
      edificio,
      aula_o_espacio,
      planta: inc.ubicacion?.planta || 'Planta Baja',
    },
    reportante,
    tecnico_asignado,
    tags: inc.tags || [`#${inc.categoria || 'general'}`],
    evidencias_adjuntas: evidencias,
    historial_seguimiento: historial,
    fecha_creacion: inc.fecha_creacion || inc.creado_en || new Date().toISOString(),
    fecha_resolucion: inc.fecha_resolucion || null,
  };
}

/**
 * Listar incidencias con filtros opcionales.
 * @param {Object} filtros - { estado, prioridad, limit }
 */
export async function listarIncidencias(filtros = {}) {
  const backendVivo = await verificarBackend();
  if (!backendVivo) {
    return null; // El frontend usará el estado local
  }

  const queryParams = new URLSearchParams();
  if (filtros.estado) queryParams.append('estado', filtros.estado);
  if (filtros.prioridad) queryParams.append('prioridad', filtros.prioridad);
  if (filtros.limit) queryParams.append('limit', filtros.limit);

  const qs = queryParams.toString() ? `?${queryParams.toString()}` : '';
  const response = await api.get(`/incidencias${qs}`);
  const lista = response.data || [];
  return lista.map(normalizarIncidencia);
}

/**
 * Obtener detalle de incidencia por ID.
 */
export async function obtenerIncidenciaPorId(id) {
  const backendVivo = await verificarBackend();
  if (!backendVivo) return null;

  const response = await api.get(`/incidencias/${id}`);
  return normalizarIncidencia(response.data);
}

/**
 * Crear una nueva incidencia.
 * Envía datos al backend (POST /api/incidencias) asegurando el esquema requerido por Zod.
 * Si contiene archivos en `evidencias`, usa FormData multipart.
 */
export async function crearIncidencia(datosIncidencia, archivos = []) {
  const backendVivo = await verificarBackend();
  if (!backendVivo) {
    // Si no hay backend, creamos el objeto normalizado para almacenamiento local
    return normalizarIncidencia({
      ...datosIncidencia,
      id: `INC-${Date.now()}`,
      fecha_creacion: new Date().toISOString(),
    });
  }

  // Mapear campos al esquema estricto del backend:
  // { titulo, descripcion, categoria, prioridad, edificio, aula_oficina, dispositivo_afectado }
  const categoriaBackend = CATEGORIA_MAP_TO_BACKEND[datosIncidencia.categoria] || 'otro';
  const edificio = datosIncidencia.ubicacion?.edificio || datosIncidencia.edificio || 'Edificio Principal';
  const aula_oficina = datosIncidencia.ubicacion?.aula_o_espacio || datosIncidencia.aula_oficina || 'General';

  const payload = {
    titulo: datosIncidencia.titulo,
    descripcion: datosIncidencia.descripcion,
    categoria: categoriaBackend,
    prioridad: datosIncidencia.prioridad || 'media',
    edificio,
    aula_oficina,
    dispositivo_afectado: datosIncidencia.detalle_especifico?.tipo_dispositivo || datosIncidencia.dispositivo_afectado || 'No especificado',
  };

  let respuesta;
  if (archivos && archivos.length > 0) {
    const formData = new FormData();
    Object.entries(payload).forEach(([k, v]) => formData.append(k, v));
    archivos.forEach(file => formData.append('evidencias', file));
    respuesta = await api.upload('/incidencias', formData);
  } else {
    respuesta = await api.post('/incidencias', payload);
  }

  return normalizarIncidencia(respuesta.data || respuesta);
}

/**
 * Actualizar el estado de una incidencia (requiere rol técnico, coordinador o admin).
 */
export async function actualizarEstadoIncidencia(id, nuevoEstado, comentariosResolucion = '') {
  const backendVivo = await verificarBackend();
  if (!backendVivo) return null;

  const payload = {
    estado: nuevoEstado,
    ...(comentariosResolucion ? { comentarios_resolucion: comentariosResolucion } : {}),
  };

  const respuesta = await api.patch(`/incidencias/${id}/estado`, payload);
  return respuesta.data ? normalizarIncidencia(respuesta.data) : null;
}

/**
 * Asignar un técnico responsable (requiere rol coordinador o admin).
 */
export async function asignarTecnico(id, tecnicoId, notas = '') {
  const backendVivo = await verificarBackend();
  if (!backendVivo) return null;

  const payload = {
    tecnicoId: String(tecnicoId),
    ...(notas ? { notas_asignacion: notas } : {}),
  };

  const respuesta = await api.patch(`/incidencias/${id}/asignar`, payload);
  return respuesta.data ? normalizarIncidencia(respuesta.data) : null;
}

export default {
  listarIncidencias,
  obtenerIncidenciaPorId,
  crearIncidencia,
  actualizarEstadoIncidencia,
  asignarTecnico,
  normalizarIncidencia,
};
