/**
 * incidencias.service.js — Servicio de Gestión de Incidencias Polimórficas (RF-01 a RF-06)
 * Conecta con las rutas del backend en /api/incidencias:
 *   - GET   /api/incidencias/search       (RF-06: buscador inteligente en español con textScore)
 *   - GET   /api/incidencias              (listar con filtros de categoría, estado, prioridad)
 *   - GET   /api/incidencias/:id          (obtener expediente completo)
 *   - POST  /api/incidencias              (RF-01, RF-02, RF-03: crear con folio Redis y subdocumento polimórfico)
 *   - PATCH /api/incidencias/:id          (RF-04: actualización atómica de estado, bitácora y horas con $set, $push, $inc)
 *   - PATCH /api/incidencias/:id/tags     (RF-05: gestión de etiquetas con $addToSet y $pull)
 *   - PATCH /api/incidencias/:id/asignar  (asignar técnico)
 */

import api from './api.js';
import { verificarBackend } from './auth.service.js';

/**
 * Normaliza una incidencia proveniente del backend al formato universal de componentes.
 */
export function normalizarIncidencia(inc) {
  if (!inc) return null;

  const id = inc._id || inc.id || `INC-${Date.now()}`;
  const folio = inc.folio || (typeof id === 'string' && id.startsWith('INC-') ? id : `INC-2026-${String(id).slice(-4).padStart(4, '0')}`);

  // Manejo de ubicación
  const edificio = inc.ubicacion?.edificio || inc.edificio || 'Edificio Principal';
  const aula_o_espacio = inc.ubicacion?.aula_o_espacio || inc.aula_oficina || inc.aula || 'General';
  const planta = inc.ubicacion?.planta || inc.planta || 'Planta Baja';

  // Manejo de reportante
  const reportante = inc.reportante || {
    usuario_id: inc.usuario_id || inc.usuarioSolicitante || 'sistema',
    nombre: inc.nombre_reportante || 'Usuario Institucional',
    correo: inc.correo_reportante || 'usuario@utmerida.edu.mx',
    tipo_usuario: inc.tipo_usuario || 'docente',
  };

  // Manejo de evidencias
  const evidencias = Array.isArray(inc.evidencias_adjuntas)
    ? inc.evidencias_adjuntas
    : Array.isArray(inc.evidencias)
    ? inc.evidencias.map((ev, idx) => ({
        nombre_archivo: typeof ev === 'string' ? `evidencia_${idx + 1}` : (ev.nombre || ev.originalname || 'evidencia'),
        url_storage: typeof ev === 'string' ? ev : (ev.url || ev.path),
        tipo_mime: ev.mimetype || 'image/jpeg',
        peso_kb: ev.peso_kb || 250,
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
          comentario: `Incidencia registrada con folio ${folio}.`,
          horas_agregadas: 0,
        },
      ];

  return {
    _id: id,
    folio,
    titulo: inc.titulo || 'Sin título',
    descripcion: inc.descripcion || '',
    categoria: inc.categoria || 'computo_redes',
    prioridad: inc.prioridad || 'media',
    estado: inc.estado || 'abierta',
    horas_invertidas: inc.horas_invertidas || 0,
    ubicacion: {
      edificio,
      aula_o_espacio,
      planta,
    },
    reportante,
    detalle_especifico: inc.detalle_especifico || {},
    tecnico_asignado: inc.tecnico_asignado || null,
    tags: inc.tags || [`#${inc.categoria || 'general'}`],
    evidencias_adjuntas: evidencias,
    historial_seguimiento: historial,
    fecha_creacion: inc.fecha_creacion || inc.creado_en || new Date().toISOString(),
    fecha_resolucion: inc.fecha_resolucion || null,
  };
}

/**
 * Listar incidencias con filtros opcionales.
 */
export async function listarIncidencias(filtros = {}) {
  const backendVivo = await verificarBackend();
  if (!backendVivo) return null;

  const queryParams = new URLSearchParams();
  if (filtros.estado) queryParams.append('estado', filtros.estado);
  if (filtros.categoria) queryParams.append('categoria', filtros.categoria);
  if (filtros.prioridad) queryParams.append('prioridad', filtros.prioridad);
  if (filtros.limit) queryParams.append('limit', filtros.limit);

  const qs = queryParams.toString() ? `?${queryParams.toString()}` : '';
  const response = await api.get(`/incidencias${qs}`);
  const lista = response.data || [];
  return lista.map(normalizarIncidencia);
}

/**
 * RF-06: Buscador inteligente en español ponderado por textScore
 */
export async function buscarIncidencias(termino) {
  const backendVivo = await verificarBackend();
  if (!backendVivo) return null;

  const response = await api.get(`/incidencias/search?q=${encodeURIComponent(termino)}`);
  const lista = response.data || [];
  return lista.map(normalizarIncidencia);
}

/**
 * Obtener detalle de incidencia por ID o Folio.
 */
export async function obtenerIncidenciaPorId(id) {
  const backendVivo = await verificarBackend();
  if (!backendVivo) return null;

  const response = await api.get(`/incidencias/${id}`);
  return normalizarIncidencia(response.data);
}

/**
 * RF-01, RF-02 y RF-03: Crear una nueva incidencia polimórfica en MongoDB Atlas
 * Envía datos al backend (POST /api/incidencias) respetando el esquema $jsonSchema polimórfico.
 */
export async function crearIncidencia(datosIncidencia, archivos = []) {
  const backendVivo = await verificarBackend();
  if (!backendVivo) {
    return normalizarIncidencia({
      ...datosIncidencia,
      id: `INC-${Date.now()}`,
      fecha_creacion: new Date().toISOString(),
    });
  }

  const payload = {
    titulo: datosIncidencia.titulo,
    descripcion: datosIncidencia.descripcion,
    categoria: datosIncidencia.categoria || 'computo_redes',
    prioridad: datosIncidencia.prioridad || 'media',
    ubicacion: datosIncidencia.ubicacion || {
      edificio: datosIncidencia.edificio || 'Edificio K',
      aula_o_espacio: datosIncidencia.aula_o_espacio || datosIncidencia.aula_oficina || 'General',
      planta: datosIncidencia.planta || 'Planta Baja',
    },
    detalle_especifico: datosIncidencia.detalle_especifico || {},
    tags: datosIncidencia.tags || [`#${datosIncidencia.categoria || 'general'}`],
    reportante: datosIncidencia.reportante,
  };

  let respuesta;
  if (archivos && archivos.length > 0) {
    const formData = new FormData();
    Object.entries(payload).forEach(([k, v]) => {
      if (typeof v === 'object' && v !== null) {
        formData.append(k, JSON.stringify(v));
      } else {
        formData.append(k, v);
      }
    });
    archivos.forEach((file) => formData.append('evidencias', file));
    respuesta = await api.upload('/incidencias', formData);
  } else {
    respuesta = await api.post('/incidencias', payload);
  }

  return normalizarIncidencia(respuesta.data || respuesta);
}

/**
 * RF-04: Actualización atómica de estado, bitácora y horas ($set, $push, $inc)
 */
export async function actualizarEstadoIncidencia(id, nuevoEstado, comentario = '', horasAgregadas = 0) {
  const backendVivo = await verificarBackend();
  if (!backendVivo) return null;

  const payload = {
    estado: nuevoEstado,
    comentario: comentario,
    horas_agregadas: Number(horasAgregadas) || 0,
  };

  const respuesta = await api.patch(`/incidencias/${id}`, payload);
  return respuesta.data ? normalizarIncidencia(respuesta.data) : null;
}

/**
 * RF-05: Gestión de etiquetas en arreglo embebido con $addToSet y $pull
 */
export async function gestionarEtiquetas(id, tag, accion = 'agregar') {
  const backendVivo = await verificarBackend();
  if (!backendVivo) return null;

  const payload = { tag, accion };
  const respuesta = await api.patch(`/incidencias/${id}/tags`, payload);
  return respuesta.tags || null;
}

/**
 * Asignar un técnico responsable.
 */
export async function asignarTecnico(id, tecnicoId, nombreTecnico = '', notas = '') {
  const backendVivo = await verificarBackend();
  if (!backendVivo) return null;

  const payload = {
    tecnicoId: String(tecnicoId),
    nombre_tecnico: nombreTecnico,
    notas_asignacion: notas,
  };

  const respuesta = await api.patch(`/incidencias/${id}/asignar`, payload);
  return respuesta.data ? normalizarIncidencia(respuesta.data) : null;
}

export default {
  listarIncidencias,
  buscarIncidencias,
  obtenerIncidenciaPorId,
  crearIncidencia,
  actualizarEstadoIncidencia,
  actualizarIncidencia: actualizarEstadoIncidencia,
  gestionarEtiquetas,
  asignarTecnico,
  normalizarIncidencia,
};
