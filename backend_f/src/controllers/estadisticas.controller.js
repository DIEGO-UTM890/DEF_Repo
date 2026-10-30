const { getDb } = require('../config/db');
const { getRedisClient } = require('../config/redis');

const COLECCION_INCIDENCIAS = 'incidencias_campus';

/**
 * RF-07: Reportes estadísticos directivos con Aggregation Pipelines
 * - Pipeline 1: $match, $group por 'ubicacion.edificio' calculando $avg y $sum de horas_invertidas.
 * - Pipeline 2: $unwind de 'tags', $sortByCount para obtener las 10 etiquetas más frecuentes.
 */
async function metricasDirectivas(req, res, next) {
  try {
    const db = getDb();

    if (db) {
      const col = db.collection(COLECCION_INCIDENCIAS);

      // Pipeline 1: Agregación por Edificio (promedio y total de horas)
      const pipelineEdificios = [
        { $match: {} },
        {
          $group: {
            _id: '$ubicacion.edificio',
            promedio_horas: { $avg: '$horas_invertidas' },
            total_horas: { $sum: '$horas_invertidas' },
            total_incidencias: { $sum: 1 },
          },
        },
        { $sort: { total_horas: -1 } },
      ];

      // Pipeline 2: Ranking de 10 etiquetas más recurrentes
      const pipelineTags = [
        { $unwind: '$tags' },
        {
          $group: {
            _id: '$tags',
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ];

      const [resumenEdificios, topTags, conteoEstados] = await Promise.all([
        col.aggregate(pipelineEdificios).toArray(),
        col.aggregate(pipelineTags).toArray(),
        col
          .aggregate([
            {
              $group: {
                _id: '$estado',
                count: { $sum: 1 },
              },
            },
          ])
          .toArray(),
      ]);

      const estadosMap = {};
      conteoEstados.forEach((e) => {
        estadosMap[e._id] = e.count;
      });

      const totalIncidencias = Object.values(estadosMap).reduce((a, b) => a + b, 0);
      const totalHorasCampus = resumenEdificios.reduce((a, b) => a + (b.total_horas || 0), 0);
      const promedioHorasGlobal = totalIncidencias > 0 ? (totalHorasCampus / totalIncidencias).toFixed(1) : 0;

      return res.status(200).json({
        ok: true,
        fuente: 'mongodb_atlas_pipelines',
        data: {
          resumen_general: {
            total_incidencias: totalIncidencias,
            abiertas: estadosMap.abierta || 0,
            en_proceso: (estadosMap.en_proceso || 0) + (estadosMap.en_espera || 0),
            resueltas: estadosMap.resuelta || 0,
            cerradas: estadosMap.cerrada || 0,
            horas_totales_campus: totalHorasCampus,
            promedio_horas_resolucion: Number(promedioHorasGlobal),
          },
          pipeline_1_edificios: resumenEdificios.map((ed) => ({
            edificio: ed._id || 'General',
            promedio_horas: Number((ed.promedio_horas || 0).toFixed(1)),
            total_horas: ed.total_horas || 0,
            total_incidencias: ed.total_incidencias || 0,
          })),
          pipeline_2_top_tags: topTags.map((t) => ({
            tag: t._id,
            conteo: t.count,
          })),
          fecha_calculo: new Date().toISOString(),
        },
      });
    }

    // Datos demostrativos directivos en caso de operar sin conexión en vivo
    return res.status(200).json({
      ok: true,
      fuente: 'modo_demostracion',
      data: {
        resumen_general: {
          total_incidencias: 48,
          abiertas: 12,
          en_proceso: 18,
          resueltas: 15,
          cerradas: 3,
          horas_totales_campus: 163.5,
          promedio_horas_resolucion: 3.4,
        },
        pipeline_1_edificios: [
          { edificio: 'Edificio K (Laboratorios CTI)', promedio_horas: 3.8, total_horas: 68.5, total_incidencias: 18 },
          { edificio: 'Edificio B (Aulas y Tutorías)', promedio_horas: 3.1, total_horas: 46.5, total_incidencias: 15 },
          { edificio: 'Edificio A (Dirección)', promedio_horas: 2.8, total_horas: 28.0, total_incidencias: 10 },
          { edificio: 'Edificio D (Cafetería y Biblioteca)', promedio_horas: 4.1, total_horas: 20.5, total_incidencias: 5 },
        ],
        pipeline_2_top_tags: [
          { tag: '#switch', conteo: 12 },
          { tag: '#sin_red', conteo: 11 },
          { tag: '#vlan_40', conteo: 9 },
          { tag: '#filtracion', conteo: 8 },
          { tag: '#techo', conteo: 7 },
          { tag: '#aula_12', conteo: 6 },
          { tag: '#moodle', conteo: 5 },
          { tag: '#climatizacion', conteo: 4 },
          { tag: '#wifi', conteo: 4 },
          { tag: '#laboratorio', conteo: 3 },
        ],
        fecha_calculo: new Date().toISOString(),
      },
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * Resumen general de métricas del sistema con caché Upstash Redis
 */
async function obtenerResumenEstadisticas(req, res, next) {
  try {
    const redis = getRedisClient();
    const CACHE_KEY = 'utm_desk:estadisticas:resumen';

    if (redis) {
      try {
        const cachedData = await redis.get(CACHE_KEY);
        if (cachedData) {
          return res.status(200).json({
            ok: true,
            fuente: 'cache_redis',
            data: cachedData,
          });
        }
      } catch (cacheErr) {
        console.warn('⚠️ Error al consultar caché Redis:', cacheErr.message);
      }
    }

    // Si no está en caché, delegar al pipeline
    return metricasDirectivas(req, res, next);
  } catch (error) {
    return next(error);
  }
}

/**
 * Desglose por categoría
 */
async function metricasPorCategoria(req, res, next) {
  try {
    const db = getDb();
    if (db) {
      const col = db.collection(COLECCION_INCIDENCIAS);
      const resultado = await col
        .aggregate([
          {
            $group: {
              _id: '$categoria',
              total: { $sum: 1 },
              horas: { $sum: '$horas_invertidas' },
            },
          },
        ])
        .toArray();

      return res.status(200).json({ ok: true, data: resultado });
    }

    return res.status(200).json({
      ok: true,
      data: [
        { _id: 'computo_redes', total: 24, horas: 84.0 },
        { _id: 'infraestructura', total: 16, horas: 52.5 },
        { _id: 'academico', total: 8, horas: 27.0 },
      ],
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  metricasDirectivas,
  obtenerResumenEstadisticas,
  metricasPorCategoria,
};
