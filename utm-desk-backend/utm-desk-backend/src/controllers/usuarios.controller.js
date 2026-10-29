const { getSupabaseClient, TABLAS } = require('../config/supabase');
const { getDb } = require('../config/db');

/**
 * Listar usuarios del sistema (solo administradores o coordinadores)
 */
async function listarUsuarios(req, res, next) {
  try {
    const supabase = getSupabaseClient();
    const db = getDb();

    if (supabase) {
      const { data, error } = await supabase
        .from(TABLAS.USUARIO)
        .select('id, nombre, correo, rol, telefono, activo, creado_en')
        .order('id', { ascending: false });

      if (error) throw error;
      return res.status(200).json({ ok: true, data });
    }

    if (db) {
      const usuarios = await db
        .collection('usuarios')
        .find({}, { projection: { password_hash: 0, password: 0 } })
        .toArray();
      return res.status(200).json({ ok: true, data: usuarios });
    }

    // Datos simulados de arranque si no hay conexión a base de datos
    return res.status(200).json({
      ok: true,
      data: [
        { id: 1, nombre: 'Coordinador General', correo: 'coordinacion@utm.mx', rol: 'coordinador', activo: true },
        { id: 2, nombre: 'Ing. Soporte Técnico', correo: 'soporte@utm.mx', rol: 'tecnico', activo: true },
      ],
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * Obtener detalle de un usuario por su ID
 */
async function obtenerUsuarioPorId(req, res, next) {
  try {
    const { id } = req.params;
    const supabase = getSupabaseClient();

    if (supabase) {
      const { data, error } = await supabase
        .from(TABLAS.USUARIO)
        .select('id, nombre, correo, rol, telefono, activo, creado_en')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        return res.status(404).json({ ok: false, mensaje: 'Usuario no encontrado' });
      }
      return res.status(200).json({ ok: true, data });
    }

    return res.status(200).json({
      ok: true,
      data: { id, nombre: 'Usuario UTM', correo: 'usuario@utm.mx', rol: 'estudiante' },
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * Actualizar datos de un usuario
 */
async function actualizarUsuario(req, res, next) {
  try {
    const { id } = req.params;
    const camposActualizar = req.body;

    const supabase = getSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase
        .from(TABLAS.USUARIO)
        .update(camposActualizar)
        .eq('id', id)
        .select('id, nombre, correo, rol, telefono, activo')
        .single();

      if (error) throw error;
      return res.status(200).json({ ok: true, mensaje: 'Usuario actualizado exitosamente', data });
    }

    return res.status(200).json({
      ok: true,
      mensaje: 'Usuario actualizado exitosamente',
      data: { id, ...camposActualizar },
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * Desactivar o eliminar usuario (lógico)
 */
async function eliminarUsuario(req, res, next) {
  try {
    const { id } = req.params;
    const supabase = getSupabaseClient();

    if (supabase) {
      const { error } = await supabase
        .from(TABLAS.USUARIO)
        .update({ activo: false })
        .eq('id', id);

      if (error) throw error;
    }

    return res.status(200).json({
      ok: true,
      mensaje: `Usuario ${id} desactivado correctamente`,
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
