/**
 * auth.service.js — Servicio de Autenticación
 * Envuelve las rutas POST /api/auth/login, POST /api/auth/registro, GET /api/auth/perfil
 */

import api, { setToken } from './api.js';
import { INITIAL_USERS } from '../data/mockData.js';

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Normaliza el objeto de usuario del backend al formato que espera el frontend.
 * El backend puede devolver { id, nombre, correo, rol }
 * El frontend usa { _id, nombre_completo, correo_institucional, rol, activo, ... }
 */
function normalizarUsuario(backendUser) {
  return {
    _id: backendUser.id || backendUser._id,
    nombre_completo: backendUser.nombre || backendUser.nombre_completo,
    correo_institucional: backendUser.correo || backendUser.correo_institucional,
    rol: backendUser.rol || 'reportante',
    area_asignada: backendUser.area_asignada || 'general',
    activo: backendUser.activo !== false,
    matricula_o_empleado: backendUser.matricula_o_empleado || null,
    // Conserva el JWT payload si viene embebido
    _token: backendUser._token || null,
  };
}

// ─── Verificar si el backend está disponible ─────────────────────────────────

let _backendDisponible = null; // null = no comprobado, true/false = resultado

export async function verificarBackend() {
  if (_backendDisponible !== null) return _backendDisponible;
  try {
    const res = await fetch('/api/health', { signal: AbortSignal.timeout(3000) });
    _backendDisponible = res.ok;
  } catch {
    _backendDisponible = false;
  }
  return _backendDisponible;
}

/** Resetea la caché para volver a comprobar en el próximo intento */
export function resetearEstadoBackend() {
  _backendDisponible = null;
}

// ─── Login ───────────────────────────────────────────────────────────────────

/**
 * Inicia sesión.
 * 1. Intenta contra el backend real (POST /api/auth/login).
 * 2. Si el backend no está disponible → usa la lógica mock local para no romper la demo.
 *
 * @param {string} correo           - Correo institucional o matrícula
 * @param {string} password         - Contraseña
 * @param {Array}  usuariosMock     - Lista local de usuarios demo
 * @returns {{ usuario, modoOffline: boolean }}
 */
export async function login(correo, password, usuariosMock = []) {
  const backendVivo = await verificarBackend();

  if (backendVivo) {
    try {
      // El backend espera { correo, password } en el cuerpo (ver auth.controller.js)
      const data = await api.post('/auth/login', { correo: correo.trim().toLowerCase(), password });

      // Guardar JWT
      if (data.token) setToken(data.token);

      const usuario = normalizarUsuario(data.usuario);
      return { usuario, modoOffline: false };
    } catch (err) {
      // Si el backend rechaza las credenciales → relanzar error real
      throw err;
    }
  }

  // ── Modo Offline / Demo ──────────────────────────────────────────────────
  // Reproducir la lógica de RolePortalLogin para no interrumpir las demos
  const cleanId = correo.trim().toLowerCase();
  const cleanPass = password.trim();

  const todosLosUsuarios = usuariosMock.length > 0 ? usuariosMock : INITIAL_USERS;

  const matched = todosLosUsuarios.find(u => {
    const email = u.correo_institucional?.toLowerCase().trim();
    const matricula = u.matricula_o_empleado?.toLowerCase().trim();
    const matriculaLimpia = matricula?.replace(/[^a-z0-9]/g, '');
    const idLimpio = cleanId.replace(/[^a-z0-9]/g, '');
    return (
      email === cleanId ||
      matricula === cleanId ||
      (matriculaLimpia && matriculaLimpia === idLimpio) ||
      (email && email.split('@')[0] === cleanId)
    );
  });

  if (!matched) throw new Error('Credenciales incorrectas: usuario no encontrado.');

  const validPasswords = [
    (matched.password || '').trim().toLowerCase(),
    'utm2026',
    `${matched.rol}123`.toLowerCase(),
  ];

  if (!validPasswords.includes(cleanPass.toLowerCase())) {
    throw new Error(`Contraseña incorrecta. Usa "${matched.password || 'utm2026'}".`);
  }

  if (matched.activo === false) throw new Error('Cuenta suspendida o inactiva.');

  // No hay JWT en modo offline, pero seteamos un token demo para consistencia
  setToken(`demo_${matched._id}`);
  return { usuario: matched, modoOffline: true };
}

// ─── Logout ──────────────────────────────────────────────────────────────────

export function logout() {
  setToken(null);
  resetearEstadoBackend();
}

// ─── Perfil ──────────────────────────────────────────────────────────────────

export async function obtenerPerfil() {
  const data = await api.get('/auth/perfil');
  return normalizarUsuario(data.usuario);
}

export default { login, logout, obtenerPerfil, verificarBackend, resetearEstadoBackend };
