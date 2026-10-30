/**
 * solicitudes.service.js — Servicio de Gestión de Solicitudes de Registro
 * Maneja el flujo de registro público y su aprobación/rechazo por administradores.
 */

import api from './api.js';
import { verificarBackend } from './auth.service.js';

const STORAGE_KEY = 'utmdesk_solicitudes';

// Solicitudes demostrativas iniciales para que el administrador siempre pueda probar
const INITIAL_DEMO_SOLICITUDES = [
  {
    _id: 'SOL-DEMO-01',
    nombre: 'Ing. Fernando Pech Cen',
    correo: 'fernando.pech@utmerida.edu.mx',
    rol_solicitado: 'tecnico',
    area_asignada: 'computo_redes',
    matricula_o_empleado: 'EMP-2026-104',
    motivo: 'Nuevo técnico contratado para soporte en laboratorios de cómputo.',
    estado: 'pendiente',
    fecha_solicitud: '2026-10-28T16:30:00.000Z',
  },
  {
    _id: 'SOL-DEMO-02',
    nombre: 'Lic. Mariana Canché Díaz',
    correo: 'mariana.canche@utmerida.edu.mx',
    rol_solicitado: 'reportante',
    area_asignada: 'academico',
    matricula_o_empleado: 'DOC-2026-045',
    motivo: 'Docente de la carrera de Tecnologías de la Información.',
    estado: 'pendiente',
    fecha_solicitud: '2026-10-28T17:15:00.000Z',
  },
];

function getLocalSolicitudes() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error al leer solicitudes locales:', e);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DEMO_SOLICITUDES));
  return INITIAL_DEMO_SOLICITUDES;
}

function saveLocalSolicitudes(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

/**
 * Enviar solicitud de registro (Pública)
 */
export async function crearSolicitud(datos) {
  const backendVivo = await verificarBackend();

  if (backendVivo) {
    try {
      const res = await api.post('/solicitudes', datos);

      // Sincronizar espejo en localStorage para disponibilidad inmediata en UI
      try {
        const locales = getLocalSolicitudes();
        const nuevaEnLocal = {
          _id: res.id || `SOL-${Date.now().toString(36).toUpperCase()}`,
          nombre: datos.nombre.trim(),
          correo: datos.correo.trim().toLowerCase(),
          password: datos.password,
          rol_solicitado: datos.rol_solicitado,
          area_asignada: datos.area_asignada || 'general',
          matricula_o_empleado: datos.matricula_o_empleado || `EMP-${Date.now().toString().slice(-4)}`,
          motivo: datos.motivo || 'Registro solicitado desde el portal institucional.',
          estado: 'pendiente',
          fecha_solicitud: new Date().toISOString(),
        };
        const sinDuplicados = locales.filter(s => s.correo?.toLowerCase() !== nuevaEnLocal.correo);
        sinDuplicados.unshift(nuevaEnLocal);
        saveLocalSolicitudes(sinDuplicados);
      } catch (mirrorErr) {
        console.warn('Advertencia espejo local:', mirrorErr);
      }

      return res;
    } catch (err) {
      throw err;
    }
  }

  // Fallback local / demo
  const locales = getLocalSolicitudes();
  const existe = locales.find(
    (s) => s.correo.toLowerCase() === datos.correo.trim().toLowerCase() && s.estado === 'pendiente'
  );

  if (existe) {
    throw new Error('Ya tienes una solicitud de registro pendiente con este correo institucional.');
  }

  const nueva = {
    _id: `SOL-${Date.now().toString(36).toUpperCase()}`,
    nombre: datos.nombre.trim(),
    correo: datos.correo.trim().toLowerCase(),
    password: datos.password,
    rol_solicitado: datos.rol_solicitado,
    area_asignada: datos.area_asignada || 'general',
    matricula_o_empleado: datos.matricula_o_empleado || `EMP-${Date.now().toString().slice(-4)}`,
    motivo: datos.motivo || 'Registro solicitado desde el portal institucional.',
    estado: 'pendiente',
    fecha_solicitud: new Date().toISOString(),
  };

  locales.unshift(nueva);
  saveLocalSolicitudes(locales);

  return {
    ok: true,
    mensaje: 'Solicitud enviada correctamente. El Administrador o Coordinador validará tu cuenta.',
    id: nueva._id,
  };
}

/**
 * Listar solicitudes con filtro de estado (admin / coordinador / superadmin)
 */
export async function listarSolicitudes(estado = 'pendiente') {
  const backendVivo = await verificarBackend();

  if (backendVivo) {
    try {
      const res = await api.get(`/solicitudes?estado=${estado}`);
      if (res && Array.isArray(res.data)) {
        // Guardar snapshot actualizado en local storage
        saveLocalSolicitudes(res.data);
        return res.data;
      }
    } catch (err) {
      console.warn('Fallo al obtener solicitudes del backend, usando almacenamiento local:', err.message);
    }
  }

  const locales = getLocalSolicitudes();
  if (estado === 'todas') return locales;
  return locales.filter((s) => s.estado === estado);
}

/**
 * Aprobar solicitud de registro
 */
export async function aprobarSolicitud(id, usuarioAprobador) {
  const backendVivo = await verificarBackend();
  let respuestaBackend = null;

  if (backendVivo) {
    try {
      respuestaBackend = await api.patch(`/solicitudes/${id}/aprobar`);
    } catch (err) {
      console.warn('Error en endpoint remoto de aprobación:', err.message);
    }
  }

  // Actualizar también almacenamiento local
  const locales = getLocalSolicitudes();
  const encontrada = locales.find((s) => s._id === id);
  if (encontrada) {
    encontrada.estado = 'aprobada';
    encontrada.fecha_revision = new Date().toISOString();
    encontrada.revisado_por = usuarioAprobador?.nombre_completo || 'Administrador';
    saveLocalSolicitudes(locales);
  }

  return {
    ok: true,
    solicitud: encontrada,
    mensaje: respuestaBackend?.mensaje || `Cuenta de ${encontrada?.nombre || 'usuario'} aprobada exitosamente.`,
  };
}

/**
 * Rechazar solicitud de registro
 */
export async function rechazarSolicitud(id, motivo, usuarioRevisor) {
  const backendVivo = await verificarBackend();
  let respuestaBackend = null;

  if (backendVivo) {
    try {
      respuestaBackend = await api.patch(`/solicitudes/${id}/rechazar`, {
        motivo_rechazo: motivo,
      });
    } catch (err) {
      console.warn('Error en endpoint remoto de rechazo:', err.message);
    }
  }

  const locales = getLocalSolicitudes();
  const encontrada = locales.find((s) => s._id === id);
  if (encontrada) {
    encontrada.estado = 'rechazada';
    encontrada.motivo_rechazo = motivo || 'Rechazada por la administración';
    encontrada.fecha_revision = new Date().toISOString();
    encontrada.revisado_por = usuarioRevisor?.nombre_completo || 'Administrador';
    saveLocalSolicitudes(locales);
  }

  return {
    ok: true,
    mensaje: respuestaBackend?.mensaje || 'Solicitud rechazada correctamente.',
  };
}

export default {
  crearSolicitud,
  listarSolicitudes,
  aprobarSolicitud,
  rechazarSolicitud,
};

