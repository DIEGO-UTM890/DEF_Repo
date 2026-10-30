const { Router } = require('express');
const {
  metricasDirectivas,
  obtenerResumenEstadisticas,
  metricasPorCategoria,
} = require('../controllers/estadisticas.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

const router = Router();

// Métricas reservadas para personal administrativo y de soporte
router.use(authMiddleware);
router.use(roleMiddleware('admin', 'coordinador', 'tecnico'));

// Resumen general de KPIs y tiempos
router.get('/resumen', obtenerResumenEstadisticas);

// RF-07: Métricas directivas con Aggregation Pipelines (Pipeline 1 por edificio y Pipeline 2 top tags)
router.get('/metricas', metricasDirectivas);

// Desglose por categoría
router.get('/por-categoria', metricasPorCategoria);

module.exports = router;
