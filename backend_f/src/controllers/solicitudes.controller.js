const bcrypt = require('bcryptjs');
const { getDb } = require('../config/db');
const { getSupabaseClient, TABLAS } = require('../config/supabase');

// ── Almacén en memoria (fallback cuando no hay BD configurada) ─────────────────
// Permite que el sistema funcione en modo demo sin perder las solicitudes
const SOLICITUDES_MEMORIA = [];

/**
 * Genera un ID único legible para solicitudes en modo demo.
 */
function generarIdSolicitud() {
  return `SOL-${Date.now().toString(36).toUpperCase()}`;
}

// ──────────────────────────────────────────────────────────────────────────────
// POST /api/solicitudes  — Crear solicitud de registro (pública)
// ──────────────────────────────────────────────────────────────────────────────
async function crearSolicitud(req, res, next) {
  try {
    const { nombre, correo, password, rol_solicitado, area_asignada, matricula_o_empleado, motivo } = req.body;

    const db = getDb();
    const supabase = getSupabaseClient();

    // Verificar si ya existe una cuenta activa con ese correo
    let correoOcupado = false;

    if (supabase) {
      const { data } = await supabase
        .from(TABLAS.USUARIO)
        .select('id')
        .eq('correo', correo)
        .maybeSingle();
      correoOcupado = !!data;
    } else if (db) {
      const existe = await db.collection('usuarios').findOne({
        $or: [{ correo }, { correo_institucional: correo }],
      });
      correoOcupado = !!existe;
    }

    if (correoOcupado) {
      return res.status(409).json({
        ok: false,
        mensaje: 'Ya existe una cuenta registrada con ese correo institucional.',
      });
    }

    // Verificar solicitud pendiente previa del mismo correo
    let solicitudPrevia = null;
    if (db) {
      solicitudPrevia = await db
        .collection('solicitudes_registro')
        .findOne({ correo, estado: 'pendiente' });
    } else {
      solicitudPrevia = SOLICITUDES_MEMORIA.find(
        (s) => s.correo === correo && s.estado === 'pendiente'
      );
    }

    if (solicitudPrevia) {
      return res.status(409).json({
        ok: false,
        mensaje: 'Ya tienes una solicitud de registro pendiente con ese correo. Espera la respuesta del administrador.',
      });
    }

    // Hashear contraseña
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const nuevaSolicitud = {
      nombre,
      correo: correo.toLowerCase(),
      password_hash,
      rol_solicitado,
      area_asignada: area_asignada || 'general',
      matricula_o_empleado: matricula_o_empleado || null,
      motivo: motivo || null,
      estado: 'pendiente', // pendiente | aprobada | rechazada
      fecha_solicitud: new Date().toISOString(),
      revisado_por: null,
      fecha_revision: null,
    };

    let idGenerado;

    if (db) {
      const result = await db
        .collection('solicitudes_registro')
        .insertOne(nuevaSolicitud);
      idGenerado = result.insertedId.toString();
    } else {
      idGenerado = generarIdSolicitud();
      SOLICITUDES_MEMORIA.push({ ...nuevaSolicitud, _id: idGenerado });
    }

    return res.status(201).json({
      ok: true,
      mensaje:
        'Tu solicitud de registro ha sido enviada. Un administrador revisará tu cuenta y recibirás acceso una vez aprobada.',
      id: idGenerado,
    });
  } catch (error) {
    return next(error);
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// GET /api/solicitudes  — Listar solicitudes (admin / coordinador / superadmin)
// ──────────────────────────────────────────────────────────────────────────────
async function listarSolicitudes(req, res, next) {
  try {
    const { estado = 'pendiente' } = req.query;
    const db = getDb();

    if (db) {
      const filtro = {};
      if (estado && estado !== 'todas') filtro.estado = estado;

      const lista = await db
        .collection('solicitudes_registro')
        .find(filtro, { projection: { password_hash: 0 } })
        .sort({ fecha_solicitud: -1 })
        .toArray();

      return res.status(200).json({ ok: true, data: lista });
    }

    // Fallback en memoria
    const lista =
      estado === 'todas'
        ? SOLICITUDES_MEMORIA
        : SOLICITUDES_MEMORIA.filter((s) => s.estado === estado);

    // Nunca exponer password_hash
    const listaSegura = lista.map(({ password_hash, ...s }) => s);

    return res.status(200).json({ ok: true, data: listaSegura });
  } catch (error) {
    return next(error);
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// PATCH /api/solicitudes/:id/aprobar  — Aprobar y crear cuenta
// ──────────────────────────────────────────────────────────────────────────────
async function aprobarSolicitud(req, res, next) {
  try {
    const { id } = req.params;
    const revisor = req.user;
    const db = getDb();
    const supabase = getSupabaseClient();

    let solicitud = null;

    if (db) {
      const { ObjectId } = require('mongodb');
      try {
        solicitud = await db
          .collection('solicitudes_registro')
          .findOne({ _id: new ObjectId(id) });
      } catch {
        solicitud = await db
          .collection('solicitudes_registro')
          .findOne({ _id: id });
      }
    } else {
      solicitud = SOLICITUDES_MEMORIA.find((s) => s._id === id);
    }

    if (!solicitud) {
      return res.status(404).json({ ok: false, mensaje: 'Solicitud no encontrada.' });
    }
    if (solicitud.estado !== 'pendiente') {
      return res.status(409).json({
        ok: false,
        mensaje: `Esta solicitud ya fue ${solicitud.estado}.`,
      });
    }

    // Crear la cuenta activa en la BD
    // IMPORTANTE: Solo incluir los campos permitidos por el validador $jsonSchema
    // de la colección 'usuarios' (additionalProperties: false)
    const nuevaCuenta = {
      matricula_o_empleado: solicitud.matricula_o_empleado || `USR-${Date.now().toString(36).toUpperCase()}`,
      nombre_completo: solicitud.nombre,
      correo_institucional: solicitud.correo,
      password_hash: solicitud.password_hash,
      rol: solicitud.rol_solicitado,
      area_asignada: solicitud.area_asignada || 'general',
      activo: true,
      fecha_registro: new Date().toISOString(),
    };

    if (supabase) {
      await supabase.from(TABLAS.USUARIO).insert([{
        nombre: nuevaCuenta.nombre_completo,
        correo: nuevaCuenta.correo_institucional,
        password_hash: nuevaCuenta.password_hash,
        rol: nuevaCuenta.rol,
        activo: true,
        creado_en: nuevaCuenta.creado_en,
      }]);
    } else if (db) {
      await db.collection('usuarios').insertOne(nuevaCuenta);
    }

    // Marcar solicitud como aprobada
    const ahora = new Date().toISOString();
    if (db) {
      const { ObjectId } = require('mongodb');
      try {
        await db.collection('solicitudes_registro').updateOne(
          { _id: new ObjectId(id) },
          {
            $set: {
              estado: 'aprobada',
              revisado_por: revisor?.nombre || revisor?.correo || 'admin',
              fecha_revision: ahora,
            },
          }
        );
      } catch {
        await db.collection('solicitudes_registro').updateOne(
          { _id: id },
          {
            $set: {
              estado: 'aprobada',
              revisado_por: revisor?.nombre || revisor?.correo || 'admin',
              fecha_revision: ahora,
            },
          }
        );
      }
    } else {
      const idx = SOLICITUDES_MEMORIA.findIndex((s) => s._id === id);
      if (idx !== -1) {
        SOLICITUDES_MEMORIA[idx].estado = 'aprobada';
        SOLICITUDES_MEMORIA[idx].revisado_por = revisor?.nombre || 'admin';
        SOLICITUDES_MEMORIA[idx].fecha_revision = ahora;
      }
    }

    return res.status(200).json({
      ok: true,
      mensaje: `Cuenta de ${solicitud.nombre} aprobada y activada exitosamente.`,
    });
  } catch (error) {
    return next(error);
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// PATCH /api/solicitudes/:id/rechazar  — Rechazar solicitud
// ──────────────────────────────────────────────────────────────────────────────
async function rechazarSolicitud(req, res, next) {
  try {
    const { id } = req.params;
    const { motivo_rechazo } = req.body;
    const revisor = req.user;
    const db = getDb();

    const ahora = new Date().toISOString();

    if (db) {
      const { ObjectId } = require('mongodb');
      try {
        await db.collection('solicitudes_registro').updateOne(
          { _id: new ObjectId(id) },
          {
            $set: {
              estado: 'rechazada',
              revisado_por: revisor?.nombre || revisor?.correo || 'admin',
              motivo_rechazo: motivo_rechazo || 'No cumple requisitos institucionales.',
              fecha_revision: ahora,
            },
          }
        );
      } catch {
        await db.collection('solicitudes_registro').updateOne(
          { _id: id },
          {
            $set: {
              estado: 'rechazada',
              revisado_por: revisor?.nombre || revisor?.correo || 'admin',
              motivo_rechazo: motivo_rechazo || 'No cumple requisitos institucionales.',
              fecha_revision: ahora,
            },
          }
        );
      }
    } else {
      const idx = SOLICITUDES_MEMORIA.findIndex((s) => s._id === id);
      if (idx !== -1) {
        SOLICITUDES_MEMORIA[idx].estado = 'rechazada';
        SOLICITUDES_MEMORIA[idx].revisado_por = revisor?.nombre || 'admin';
        SOLICITUDES_MEMORIA[idx].motivo_rechazo =
          motivo_rechazo || 'No cumple requisitos institucionales.';
        SOLICITUDES_MEMORIA[idx].fecha_revision = ahora;
      }
    }

    return res.status(200).json({
      ok: true,
      mensaje: 'Solicitud rechazada.',
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  crearSolicitud,
  listarSolicitudes,
  aprobarSolicitud,
  rechazarSolicitud,
  SOLICITUDES_MEMORIA,
};

