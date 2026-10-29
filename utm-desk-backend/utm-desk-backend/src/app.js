const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');

// Middlewares perimetrales y rutas
const errorMiddleware = require('./middlewares/error.middleware');
const authRoutes = require('./routes/auth.routes');
const usuariosRoutes = require('./routes/usuarios.routes');
const incidenciasRoutes = require('./routes/incidencias.routes');
const estadisticasRoutes = require('./routes/estadisticas.routes');

const app = express();

// ==============================================================================
// 1. ESCUDO PERIMETRAL: HELMET (Cabeceras HTTP Seguras y ocultar Express)
// ==============================================================================
// Se activa en la primera línea para eliminar X-Powered-By y aplicar cabeceras de protección
app.use(helmet());
app.disable('x-powered-by');

// ==============================================================================
// 2. ESCUDO PERIMETRAL: CORS (Control de Orígenes Permitidos)
// ==============================================================================
// Permite únicamente el origen configurado en FRONTEND_URL y peticiones sin origen (Postman / cURL)
const allowedOrigin = process.env.FRONTEND_URL || 'http://localhost:5173';
app.use(
  cors({
    origin: (origin, callback) => {
      // Peticiones sin origen (ej. Postman, herramientas móviles, pruebas locales)
      if (!origin || origin === allowedOrigin) {
        return callback(null, true);
      }
      return callback(new Error('Acceso no permitido por política CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ==============================================================================
// 3. ESCUDO PERIMETRAL: LÍMITE DE TAMAÑO EN PAYLOAD (Prevención DoS en memoria)
// ==============================================================================
// Limita el JSON entrante a un máximo de 10kb
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ==============================================================================
// 4. ESCUDO PERIMETRAL: MONGO SANITIZE (Filtro Anti-Inyección NoSQL)
// ==============================================================================
// Elimina cualquier clave en body, query o params que contenga '$' o '.'
app.use(mongoSanitize());

// ==============================================================================
// 5. ESCUDO PERIMETRAL: RATE LIMIT GLOBAL (Control de Saturación por IP)
// ==============================================================================
// Máximo 100 peticiones cada 15 minutos por dirección IP
const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  statusCode: 429,
  message: {
    ok: false,
    mensaje: 'Demasiadas solicitudes desde esta dirección IP. Intente nuevamente en 15 minutos.',
  },
});
app.use(globalRateLimiter);

// ==============================================================================
// 6. RUTAS DE COMPROBACIÓN Y SALUD (Pruebas 1 y 2)
// ==============================================================================

// Prueba 1: Endpoint de Salud institucional y verificación de cabeceras seguras
app.get('/api/health', (req, res) => {
  res.status(200).json({
    ok: true,
    mensaje: 'Servicio UTM Desk operativo',
    entorno: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });
});

// Prueba 2: Ruta temporal de eco para probar sanitización NoSQL
app.post('/api/test-sanitize', (req, res) => {
  res.status(200).json(req.body);
});

// ==============================================================================
// 7. ENRUTAMIENTO DE MÓDULOS DE NEGOCIO
// ==============================================================================
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/incidencias', incidenciasRoutes);
app.use('/api/estadisticas', estadisticasRoutes);

// Manejo de rutas inexistentes (404)
app.use((req, res) => {
  res.status(404).json({
    ok: false,
    mensaje: `Recurso no encontrado: ${req.method} ${req.originalUrl}`,
  });
});

// ==============================================================================
// 8. ESCUDO FINAL: MIDDLEWARE DE ERRORES DISCRETOS
// ==============================================================================
// Captura cualquier fallo inesperado sin exponer trazas internas al cliente
app.use(errorMiddleware);

module.exports = app;
