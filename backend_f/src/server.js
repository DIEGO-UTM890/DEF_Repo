const path = require('path');
const dotenv = require('dotenv');

// Cargar variables de entorno desde el archivo .env de la raíz del backend
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = require('./app');
const { connectDB, closeDB } = require('./config/db');
const { getRedisClient } = require('./config/redis');
const { getSupabaseClient } = require('./config/supabase');

const PORT = process.env.PORT || 4000;

async function iniciarServidor() {
  console.log(' [UTM Desk Backend] Iniciando escudo perimetral del servidor...');

  // 1. Inicializar conexiones a fuentes de datos
  try {
    await connectDB();
  } catch (err) {
    console.warn(' [MongoDB] No se pudo inicializar la conexión inicial:', err.message);
  }

  try {
    getRedisClient();
  } catch (err) {
    console.warn(' [Redis] No se pudo inicializar cliente Redis:', err.message);
  }

  try {
    getSupabaseClient();
  } catch (err) {
    console.warn(' [Supabase] No se pudo inicializar cliente Supabase:', err.message);
  }

  // 2. Levantar escucha HTTP
  const servidor = app.listen(PORT, () => {
    console.log('================================================================');
    console.log(`  UTM DESK BACKEND - ESCUDOS DE SEGURIDAD ACTIVOS`);
    console.log(`  Servidor escuchando en: http://localhost:${PORT}`);
    console.log(`  Helmet: Activado (X-Powered-By oculto, cabeceras seguras)`);
    console.log(`  Rate Limit: Global (100 req/15m) | Login (5 intentos/15m)`);
    console.log(`  Filtro NoSQL Sanitize: Activado (elimina $ y .)`);
    console.log(`  Límite de Payload JSON: 10kb`);
    console.log(`  Middleware de Errores Discretos: Activado`);
    console.log('================================================================');
  });

  // Manejo de apagado ordenado (Graceful Shutdown)
  const shutdown = async (signal) => {
    console.log(`\n Recibida señal ${signal}. Cerrando servidor de forma ordenada...`);
    servidor.close(async () => {
      await closeDB();
      console.log(' Servidor apagado exitosamente.');
      process.exit(0);
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

iniciarServidor().catch((error) => {
  console.error(' Error fatal al arrancar el servidor:', error);
  process.exit(1);
});
