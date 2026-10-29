const { Redis } = require('@upstash/redis');

let redisClient = null;

/**
 * Inicializa y retorna el cliente Upstash Redis.
 * Es compatible con arquitecturas serverless y REST HTTP.
 */
function getRedisClient() {
  if (redisClient) {
    return redisClient;
  }

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token || url.includes('your-upstash')) {
    console.warn(' [Upstash Redis] UPSTASH_REDIS_REST_URL / TOKEN no configurados. Caché en modo offline/mock.');
    return null;
  }

  try {
    redisClient = new Redis({
      url,
      token,
    });
    console.log(' [Upstash Redis] Cliente de caché inicializado.');
    return redisClient;
  } catch (error) {
    console.error(' [Upstash Redis] Error al inicializar Redis:', error.message);
    return null;
  }
}

module.exports = {
  getRedisClient,
};
