/**
 * usuarios.service.js — Servicio de Gestión de Usuarios
 * Conecta con las rutas del backend en /api/usuarios:
 *   - GET    /api/usuarios      (listar usuarios - admin/coordinador)
 *   - GET    /api/usuarios/:id  (obtener usuario por ID)
 *   - PUT    /api/usuarios/:id  (actualizar usuario - admin)
 *   - DELETE /api/usuarios/:id  (desactivar usuario - admin)
 */

import api from './api.js';
import { verificarBackend } from './auth.service.js';

/**
 * Normaliza un usuario del backend al formato usado en los componentes de la interfaz.
 */
export function normalizarUsuario(u) {
  if (!u) return null;
  return {
    _id: String(u._id || u.id),
    nombre_completo: u.nombre || u.nombre_completo,
    correo_institucional: u.correo || u.correo_institucional,
    rol: u.rol || 'reportante',
    area_asignada: u.area_asignada || 'general',
    telefono: u.telefono || '',
    activo: u.activo !== false,
    matricula_o_empleado: u.matricula_o_empleado || `EMP-${String(u._id || u.id).slice(-4)}`,
    fecha_registro: u.creado_en || u.fecha_registro || new Date().toISOString(),
  };
}

/**
 * Listar todos los usuarios.
 */
export async function listarUsuarios() {
  const backendVivo = await verificarBackend();
  if (!backendVivo) return null;

  const res = await api.get('/usuarios');
  const lista = res.data || [];
  return lista.map(normalizarUsuario);
}

/**
 * Obtener un usuario por ID.
 */
export async function obtenerUsuarioPorId(id) {
  const backendVivo = await verificarBackend();
  if (!backendVivo) return null;

  const res = await api.get(`/usuarios/${id}`);
  return normalizarUsuario(res.data);
}

/**
 * Actualizar datos de un usuario.
 */
export async function actualizarUsuario(id, datos) {
  const backendVivo = await verificarBackend();
  if (!backendVivo) return null;

  const res = await api.put(`/usuarios/${id}`, datos);
  return res.data ? normalizarUsuario(res.data) : null;
}

/**
 * Desactivar un usuario (soft-delete).
 */
export async function eliminarUsuario(id) {
  const backendVivo = await verificarBackend();
  if (!backendVivo) return null;

  return await api.delete(`/usuarios/${id}`);
}

export default {
  listarUsuarios,
  obtenerUsuarioPorId,
  actualizarUsuario,
  eliminarUsuario,
  normalizarUsuario,
};
