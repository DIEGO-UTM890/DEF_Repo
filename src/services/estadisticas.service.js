/**
 * estadisticas.service.js — Servicio de Analítica y KPIs Directivos (RF-07)
 * Conecta con las rutas del backend en /api/analitica y /api/estadisticas:
 *   - GET /api/analitica/metricas (Pipeline 1 y Pipeline 2)
 *   - GET /api/estadisticas/resumen
 *   - GET /api/estadisticas/por-categoria
 */

import api from './api.js';
import { verificarBackend } from './auth.service.js';

/**
 * RF-07: Obtener métricas directivas calculadas con Aggregation Pipelines en MongoDB Atlas
 * - Pipeline 1: Horas invertidas y promedio por edificio
 * - Pipeline 2: Top 10 fallas más frecuentes (etiquetas)
 */
export async function obtenerMetricasDirectivas() {
  const backendVivo = await verificarBackend();
  if (!backendVivo) return null;

  try {
    const res = await api.get('/analitica/metricas');
    return res.data;
  } catch (err) {
    console.warn('Fallback a /estadisticas/resumen:', err.message);
    const res = await api.get('/estadisticas/resumen');
    return res.data;
  }
}

/**
 * Obtener resumen de KPIs globales (con soporte de caché Upstash Redis).
 */
export async function obtenerResumenEstadisticas() {
  const backendVivo = await verificarBackend();
  if (!backendVivo) return null;

  const res = await api.get('/estadisticas/resumen');
  return res.data;
}

/**
 * Obtener estadísticas desglosadas por categoría.
 */
export async function obtenerEstadisticasPorCategoria() {
  const backendVivo = await verificarBackend();
  if (!backendVivo) return null;

  const res = await api.get('/estadisticas/por-categoria');
  return res.data;
}

export default {
  obtenerMetricasDirectivas,
  obtenerResumenEstadisticas,
  obtenerEstadisticasPorCategoria,
};
