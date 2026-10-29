/**
 * estadisticas.service.js — Servicio de Analítica y KPIs
 * Conecta con las rutas del backend en /api/estadisticas:
 *   - GET /api/estadisticas/resumen
 *   - GET /api/estadisticas/por-categoria
 */

import api from './api.js';
import { verificarBackend } from './auth.service.js';

/**
 * Obtener resumen de KPIs globales (cacheado en Redis por el backend).
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
  obtenerResumenEstadisticas,
  obtenerEstadisticasPorCategoria,
};
