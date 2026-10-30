const path = require('path');
const dotenv = require('dotenv');
const { MongoClient } = require('mongodb');

// Cargar variables de entorno desde .env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function verificarConexionCompleta() {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.DB_NAME || 'utm_desk_db';

  console.log('\n============================================================');
  console.log('🔍 [DIAGNÓSTICO OFICIAL] Verificación de Conexión a MongoDB');
  console.log('============================================================');
  console.log(`📡 Base de datos objetivo: ${dbName}`);

  if (!uri || uri.includes('ChangeThisPassword')) {
    console.error('❌ MONGODB_URI no está configurada correctamente en el archivo backend_f/.env');
    process.exit(1);
  }

  // Ocultar contraseña en el log por seguridad
  const uriEnmascarada = uri.replace(/:(.*?)@/, ':******@');
  console.log(`🔗 Cluster URI: ${uriEnmascarada}`);

  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 6000,
  });

  try {
    const t0 = Date.now();
    await client.connect();
    const tiempoConexion = Date.now() - t0;
    console.log(`\n✅ 1. Conexión de red establecida con éxito (${tiempoConexion} ms).`);

    // 1. Comando PING al clúster
    const pingRes = await client.db('admin').command({ ping: 1 });
    console.log(`✅ 2. Ping de respuesta del servidor MongoDB Atlas:`, pingRes);

    const db = client.db(dbName);

    // 2. Comprobar colecciones y conteo de documentos
    console.log('\n📊 3. Inspección de colecciones y datos almacenados:');
    const colecciones = await db.listCollections().toArray();
    
    if (colecciones.length === 0) {
      console.log('   ⚠️ No se encontraron colecciones aún. Ejecuta: npm run init-db');
    } else {
      for (const col of colecciones) {
        const total = await db.collection(col.name).countDocuments();
        console.log(`   📁 Colección "${col.name}": ${total} documentos guardados.`);
      }
    }

    // 3. Prueba de lectura de datos reales
    console.log('\n🔍 4. Muestra de persistencia real en la nube:');
    
    // Solicitud más reciente
    const ultSol = await db.collection('solicitudes_registro').findOne({}, { sort: { fecha_solicitud: -1 } });
    if (ultSol) {
      console.log(`   📝 Última solicitud registrada:`);
      console.log(`      - Folio/ID: ${ultSol._id}`);
      console.log(`      - Nombre: ${ultSol.nombre}`);
      console.log(`      - Correo: ${ultSol.correo}`);
      console.log(`      - Rol Solicitado: ${ultSol.rol_solicitado}`);
      console.log(`      - Estado: ${ultSol.estado}`);
    }

    // Usuario más reciente
    const ultUser = await db.collection('usuarios').findOne({}, { sort: { fecha_registro: -1 } });
    if (ultUser) {
      console.log(`   👤 Último usuario en colección 'usuarios':`);
      console.log(`      - ID: ${ultUser._id}`);
      console.log(`      - Nombre: ${ultUser.nombre_completo || ultUser.nombre}`);
      console.log(`      - Correo: ${ultUser.correo_institucional || ultUser.correo}`);
      console.log(`      - Rol: ${ultUser.rol}`);
    }

    // Incidencia más reciente
    const ultInc = await db.collection('incidencias_campus').findOne({}, { sort: { fecha_creacion: -1 } });
    if (ultInc) {
      console.log(`   🎫 Última incidencia registrada:`);
      console.log(`      - Folio: ${ultInc.folio}`);
      console.log(`      - Título: ${ultInc.titulo}`);
      console.log(`      - Categoría: ${ultInc.categoria}`);
      console.log(`      - Estado: ${ultInc.estado}`);
    }

    // 4. Prueba rápida de escritura y eliminación (Round-trip test)
    console.log('\n🧪 5. Prueba de escritura y lectura atómica (Round-trip test):');
    const testDoc = {
      _test: true,
      descripcion: 'Prueba de escritura temporal',
      fecha: new Date(),
    };
    const colTest = db.collection('_healthcheck_ping');
    const insertRes = await colTest.insertOne(testDoc);
    console.log(`   ✔️ Escritura exitosa con ID temporal: ${insertRes.insertedId}`);

    await colTest.deleteOne({ _id: insertRes.insertedId });
    console.log(`   ✔️ Eliminación y limpieza del documento temporal exitosa.`);

    console.log('\n============================================================');
    console.log('🎉 RESULTADO: LA BASE DE DATOS ESTÁ 100% CONECTADA Y OPERATIVA');
    console.log('   Los datos se están almacenando y leyendo correctamente en MongoDB Atlas.');
    console.log('============================================================\n');

  } catch (error) {
    console.error('\n❌ Error al conectar con MongoDB Atlas:');
    console.error(error.message);
    process.exit(1);
  } finally {
    await client.close();
  }
}

verificarConexionCompleta();
