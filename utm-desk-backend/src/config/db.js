const { MongoClient, ServerApiVersion } = require('mongodb');

let dbClient = null;
let dbInstance = null;

/**
 * Conecta con el clúster de MongoDB Atlas de forma segura.
 * Gestiona reconexiones y evita caídas si la URI no está configurada aún en desarrollo.
 */
async function connectDB() {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.DB_NAME || 'utm_desk_db';

  if (!uri || uri.includes('ChangeThisPassword')) {
    console.warn('⚠️ [MongoDB] MONGODB_URI no configurada o usando plantilla. La conexión a base de datos NoSQL operará en modo diferido.');
    return null;
  }

  if (dbInstance) {
    return dbInstance;
  }

  try {
    dbClient = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
    });

    await dbClient.connect();
    dbInstance = dbClient.db(dbName);
    console.log(`✅ [MongoDB] Conectado exitosamente a la base de datos: ${dbName}`);
    return dbInstance;
  } catch (error) {
    console.error('❌ [MongoDB] Error de conexión a MongoDB Atlas:', error.message);
    return null;
  }
}

/**
 * Retorna la instancia de base de datos activa o null.
 */
function getDb() {
  return dbInstance;
}

/**
 * Cierra la conexión de MongoDB (útil para graceful shutdown).
 */
async function closeDB() {
  if (dbClient) {
    await dbClient.close();
    dbClient = null;
    dbInstance = null;
    console.log('🔒 [MongoDB] Conexión cerrada.');
  }
}

module.exports = {
  connectDB,
  getDb,
  closeDB,
};
