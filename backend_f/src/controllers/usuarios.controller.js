const { ObjectId } = require('mongodb');
const { getDb } = require('../config/db');
const { getSupabaseClient, TABLAS } = require('../config/supabase');

const COLECCION_USUARIOS = 'usuarios';

/**
 * Listar usuarios del sistema (RF-08: Gestión de perfiles por Administrador)
 */
async function listarUsuarios(req, res, next) {
  try {
    const db = getDb();
    const supabase = getSupabaseClient();

    if (db) {
      const usuarios = await db
        .collection(COLECCION_USUARIOS)
        .find({}, { projection: { password_hash: 0, password: 0 } })
        .sort({ fecha_registro: -1 })
        .toArray();

      return res.status(200).json({ ok: true, data: usuarios });
    }

    if (supabase) {
      const { data, error } = await supabase
        .from(TABLAS.USUARIO)
        .select('*')
        .order('id', { ascending: false });

      if (!error && data) {
        return res.status(200).json({ ok: true, data });
      }
    }

    // Datos demostrativos institucionales basados en la Tabla 7 y mockData
    return res.status(200).json({
      ok: true,
      data: [
        {
          _id: '6713f1a9c8d4e12345678901',
          matricula_o_empleado: 'EMP-2026-089',
          nombre_completo: 'Carlos Eduardo Méndez Pech',
          correo_institucional: 'carlos.mendez@utmerida.edu.mx',
          rol: 'tecnico',
          area_asignada: 'computo_redes',
          activo: true,
          fecha_registro: '2026-10-19T14:00:00.000Z',
        },
        {
          _id: '6713f1a9c8d4e12345678905',
          matricula_o_empleado: 'DOC-2026-014',
          nombre_completo: 'Dra. Laura Beatriz Gómez',
          correo_institucional: 'laura.gomez@utmerida.edu.mx',
          rol: 'reportante',
          area_asignada: 'academico',
          activo: true,
          fecha_registro: '2026-10-15T08:30:00.000Z',
        },
        {
          _id: '6713f1a9c8d4e12345678908',
          matricula_o_empleado: 'ADM-2026-003',
          nombre_completo: 'Ing. Roberto Solís Castillo',
          correo_institucional: 'roberto.solis@utmerida.edu.mx',
          rol: 'coordinador',
          area_asignada: 'general',
          activo: true,
          fecha_registro: '2026-09-01T09:00:00.000Z',
        },
        {
          _id: '6713f1a9c8d4e12345678912',
          matricula_o_empleado: 'SIS-2026-001',
          nombre_completo: 'Lic. Andrea Moguel Carrillo',
          correo_institucional: 'andrea.moguel@utmerida.edu.mx',
          rol: 'admin',
          area_asignada: 'general',
          activo: true,
          fecha_registro: '2026-08-01T08:00:00.000Z',
        },
      ],
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * Obtener detalle de un usuario por su ID o Matrícula
 */
async function obtenerUsuarioPorId(req, res, next) {
  try {
    const { id } = req.params;
    const db = getDb();

    if (db) {
      const col = db.collection(COLECCION_USUARIOS);
      let query = { matricula_o_empleado: id };
      if (ObjectId.isValid(id)) {
        query = { $or: [{ _id: new ObjectId(id) }, { matricula_o_empleado: id }] };
      }

      const usuario = await col.findOne(query, { projection: { password_hash: 0 } });
      if (!usuario) {
        return res.status(404).json({ ok: false, mensaje: 'Usuario no encontrado' });
      }
      return res.status(200).json({ ok: true, data: usuario });
    }

    return res.status(200).json({
      ok: true,
      data: {
        _id: id,
        nombre_completo: 'Usuario UTM',
        correo_institucional: 'usuario@utmerida.edu.mx',
        rol: 'tecnico',
        activo: true,
      },
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * Actualizar datos de un usuario (cambio de rol, área, activación/desactivación) (RF-08)
 */
async function actualizarUsuario(req, res, next) {
  try {
    const { id } = req.params;
    const camposActualizar = req.body;
    const db = getDb();

    if (db) {
      const col = db.collection(COLECCION_USUARIOS);
      let query = { matricula_o_empleado: id };
      if (ObjectId.isValid(id)) {
        query = { $or: [{ _id: new ObjectId(id) }, { matricula_o_empleado: id }] };
      }

      await col.updateOne(query, { $set: camposActualizar });
      const actualizado = await col.findOne(query, { projection: { password_hash: 0 } });

      return res.status(200).json({
        ok: true,
        mensaje: 'Perfil de usuario actualizado exitosamente en MongoDB Atlas',
        data: actualizado,
      });
    }

    return res.status(200).json({
      ok: true,
      mensaje: 'Perfil de usuario actualizado exitosamente',
      data: { _id: id, ...camposActualizar },
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * Desactivar o suspender usuario (lógico) (RF-08)
 */
async function eliminarUsuario(req, res, next) {
  try {
    const { id } = req.params;
    const db = getDb();

    if (db) {
      const col = db.collection(COLECCION_USUARIOS);
      let query = { matricula_o_empleado: id };
      if (ObjectId.isValid(id)) {
        query = { $or: [{ _id: new ObjectId(id) }, { matricula_o_empleado: id }] };
      }

      await col.updateOne(query, { $set: { activo: false } });
    }

    return res.status(200).json({
      ok: true,
      mensaje: `Cuenta de usuario ${id} suspendida correctamente`,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  listarUsuarios,
  obtenerUsuarioPorId,
  actualizarUsuario,
  eliminarUsuario,
};
