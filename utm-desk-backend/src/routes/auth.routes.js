const { Router } = require('express');
const rateLimit = require('express-rate-limit');
const { login, registro, perfil } = require('../controllers/auth.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const validateMiddleware = require('../middlewares/validate.middleware');
const { loginUsuarioSchema, registroUsuarioSchema } = require('../schemas/usuario.schema');

const router = Router();

// Escudo perimetral estricto contra ataques de fuerza bruta en inicio de sesión
const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // Máximo 5 peticiones cada 15 minutos por IP
  standardHeaders: true,
  legacyHeaders: false,
  statusCode: 429,
  message: {
    ok: false,
    mensaje: 'Demasiados intentos de acceso desde esta dirección IP. Bloqueo temporal activado por 15 minutos.',
  },
});

// Ruta de Login protegida por rate limiter y validación Zod
router.post('/login', loginRateLimiter, validateMiddleware(loginUsuarioSchema), login);

// Ruta de Registro de usuarios con validación Zod
router.post('/registro', validateMiddleware(registroUsuarioSchema), registro);

// Ruta de Perfil protegida por Token JWT
router.get('/perfil', authMiddleware, perfil);

module.exports = router;
