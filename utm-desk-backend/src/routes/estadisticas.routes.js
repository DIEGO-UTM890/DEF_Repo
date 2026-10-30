const { Router } = require('express');
const {
  metricasDirectivas,
  obtenerResumenEstadisticas,
  metricasPorCategoria,
} = require('../controllers/estadisticas.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

const router = Router();

// Métricas reservadas para directivos, coordinadores, administradores y técnicos
router.use(authMiddleware);
router.use(roleMiddleware('admin', 'coordinador', 'directivo', 'tecnico', 'superadmin'));

// RF-07: Endpoint oficial de métricas directivas con Aggregation Pipelines (Pipeline 1 y Pipeline 2)
router.get('/metricas', metricasDirectivas);

// Resumen general de KPIs y tiempos (con soporte de caché Redis)
router.get('/resumen', obtenerResumenEstadisticas);

// Desglose por categoría
router.get('/por-categoria', metricasPorCategoria);

module.exports = router;
