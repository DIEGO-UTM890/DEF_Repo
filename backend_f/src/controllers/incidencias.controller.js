const { getSupabaseClient, TABLAS } = require('../config/supabase');
const { getDb } = require('../config/db');

/**
 * Listar incidencias con filtros de estado y prioridad
 */
async function listarIncidencias(req, res, next) {
  try {
    const { estado, prioridad, limit = 50 } = req.query;
    const supabase = getSupabaseClient();
    const db = getDb();

    if (supabase) {
      let query = supabase
        .from(TABLAS.TICKETSOPORTE)
        .select('*')
        .order('id', { ascending: false })
        .limit(Number(limit));

      if (estado) query = query.eq('estado', estado);
      if (prioridad) query = query.eq('prioridad', prioridad);

      const { data, error } = await query;
      if (error) throw error;
      return res.status(200).json({ ok: true, data });
    }

    if (db) {
      const filtro = {};
      if (estado) filtro.estado = estado;
      if (prioridad) filtro.prioridad = prioridad;

      const incidencias = await db
        .collection('incidencias')
        .find(filtro)
        .sort({ fecha_creacion: -1 })
        .limit(Number(limit))
        .toArray();

      return res.status(200).json({ ok: true, data: incidencias });
    }

    // Datos demostrativos de inicio
    return res.status(200).json({
      ok: true,
      data: [
        {
          id: 'INC-2026-001',
          titulo: 'Falla de proyector en Aula Magna B',
          categoria: 'audiovisual',
          prioridad: 'alta',
          estado: 'en_proceso',
          edificio: 'Edificio de Ingeniería',
          aula_oficina: 'Aula Magna B',
          fecha_creacion: new Date().toISOString(),
        },
      ],
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * Registrar una nueva incidencia institucional con soporte para evidencias
 */
async function crearIncidencia(req, res, next) {
  try {
    const { titulo, descripcion, categoria, prioridad, edificio, aula_oficina, dispositivo_afectado } = req.body;
    const usuarioSolicitante = req.user ? req.user.id : null;
    const archivos = req.files || [];

    const supabase = getSupabaseClient();
    const db = getDb();

    const nuevaIncidencia = {
      titulo,
      descripcion,
      categoria,
      prioridad: prioridad || 'media',
      estado: 'abierta',
      edificio,
      aula_oficina,
      dispositivo_afectado: dispositivo_afectado || null,
      usuario_id: usuarioSolicitante,
      fecha_creacion: new Date().toISOString(),
    };

    let incidenciaId = null;

    if (supabase) {
      const { data, error } = await supabase
        .from(TABLAS.TICKETSOPORTE)
        .insert([nuevaIncidencia])
        .select()
        .single();

      if (error) throw error;
      incidenciaId = data.id;

      // Subida de evidencias a Supabase Storage si se enviaron archivos
      if (archivos.length > 0 && process.env.SUPABASE_BUCKET) {
        for (const file of archivos) {
          const fileExt = file.originalname.split('.').pop();
          const filePath = `ticket_${incidenciaId}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

          const { error: uploadError } = await supabase.storage
            .from(process.env.SUPABASE_BUCKET || 'evidencias')
            .upload(filePath, file.buffer, {
              contentType: file.mimetype,
            });

          if (!uploadError) {
            await supabase.from(TABLAS.EVIDENCIA).insert([
              {
                ticket_id: incidenciaId,
                ruta_archivo: filePath,
                nombre_original: file.originalname,
                tipo_mime: file.mimetype,
                tamano_bytes: file.size,
              },
            ]);
          }
        }
      }

      return res.status(201).json({
        ok: true,
        mensaje: 'Incidencia creada exitosamente',
        data,
      });
    }

    if (db) {
      const result = await db.collection('incidencias').insertOne(nuevaIncidencia);
      return res.status(201).json({
        ok: true,
        mensaje: 'Incidencia creada exitosamente',
        data: { id: result.insertedId, ...nuevaIncidencia },
      });
    }

    return res.status(201).json({
      ok: true,
      mensaje: 'Incidencia creada exitosamente (Modo demostración)',
      data: { id: 'INC-' + Date.now(), ...nuevaIncidencia },
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * Obtener detalles de una incidencia por ID
 */
async function obtenerIncidenciaPorId(req, res, next) {
  try {
    const { id } = req.params;
    const supabase = getSupabaseClient();

    if (supabase) {
      const { data, error } = await supabase
        .from(TABLAS.TICKETSOPORTE)
        .select('*, evidencia(*)')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        return res.status(404).json({ ok: false, mensaje: 'Incidencia no encontrada' });
      }

      return res.status(200).json({ ok: true, data });
    }

    return res.status(200).json({
      ok: true,
      data: {
        id,
        titulo: 'Incidencia de prueba',
        estado: 'abierta',
        fecha_creacion: new Date().toISOString(),
      },
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * Actualizar el estado de una incidencia
 */
async function actualizarEstadoIncidencia(req, res, next) {
  try {
    const { id } = req.params;
    const { estado, comentarios_resolucion } = req.body;
    const supabase = getSupabaseClient();

    if (supabase) {
      const updatePayload = {
        estado,
        ...(comentarios_resolucion && { comentarios_resolucion }),
        actualizado_en: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from(TABLAS.TICKETSOPORTE)
        .update(updatePayload)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return res.status(200).json({
        ok: true,
        mensaje: `Incidencia actualizada a estado: ${estado}`,
        data,
      });
    }

    return res.status(200).json({
      ok: true,
      mensaje: `Incidencia actualizada a estado: ${estado}`,
      data: { id, estado, comentarios_resolucion },
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * Asignar incidencia a un técnico
 */
async function asignarTecnico(req, res, next) {
  try {
    const { id } = req.params;
    const { tecnicoId, notas_asignacion } = req.body;
    const supabase = getSupabaseClient();

    if (supabase) {
      const { data, error } = await supabase
        .from(TABLAS.TICKETSOPORTE)
        .update({
          tecnico_id: tecnicoId,
          estado: 'asignada',
          notas_asignacion,
          actualizado_en: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return res.status(200).json({
        ok: true,
        mensaje: 'Técnico asignado exitosamente',
        data,
      });
    }

    return res.status(200).json({
      ok: true,
      mensaje: 'Técnico asignado exitosamente',
      data: { id, tecnicoId, estado: 'asignada' },
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  listarIncidencias,
  crearIncidencia,
  obtenerIncidenciaPorId,
  actualizarEstadoIncidencia,
  asignarTecnico,
};
