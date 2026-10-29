const { Router } = require('express');
const {
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

// Desglose por categoría
router.get('/por-categoria', metricasPorCategoria);

module.exports = router;
