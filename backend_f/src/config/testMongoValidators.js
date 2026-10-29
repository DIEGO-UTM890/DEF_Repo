const path = require('path');
const dotenv = require('dotenv');
const { MongoClient, ObjectId } = require('mongodb');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function ejecutarPruebasDeValidacion() {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.DB_NAME || 'utm_desk_db';

  console.log('================================================================');
  console.log(' Verificación de Índices y Segunda Aduana en MongoDB');
  console.log('================================================================');

  if (!uri || uri.includes('ChangeThisPassword')) {
    console.error(' MONGODB_URI no configurada con credenciales reales en .env');
    process.exit(1);
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(dbName);
    const colIncidencias = db.collection('incidencias_campus');

    // --------------------------------------------------------------------------
    // PRUEBA 1: Verificación de Índices Estratégicos
    // --------------------------------------------------------------------------
    console.log('\n--- PRUEBA 1: Verificación de Índices en incidencias_campus ---');
    const indices = await colIncidencias.indexes();
    console.log(`Índices encontrados en la colección (${indices.length}):`);
    
    let tieneTTL = false;
    let tieneTexto = false;
    let tieneCompuesto = false;
    let tieneFolio = false;

    indices.forEach((idx) => {
      console.log(` • Nombre: ${idx.name}`);
      console.log(`   Llaves:`, JSON.stringify(idx.key));
      if (idx.expireAfterSeconds === 5184000) {
        tieneTTL = true;
        console.log(`    TTL Confirmado: expireAfterSeconds = ${idx.expireAfterSeconds}s (60 días exactos)`);
      }
      if (idx.default_language === 'spanish') {
        tieneTexto = true;
        console.log(`    Texto Español Confirmado: pesos =`, JSON.stringify(idx.weights));
      }
      if (idx.key.categoria && idx.key.estado && idx.key['ubicacion.edificio']) {
        tieneCompuesto = true;
        console.log(`    Compuesto de Rapidez Confirmado (RNF-03)`);
      }
      if (idx.unique && idx.key.folio) {
        tieneFolio = true;
        console.log(`    Único en Folio Confirmado`);
      }
    });

    if (tieneTTL && tieneTexto && tieneCompuesto && tieneFolio) {
      console.log(' RESULTADO PRUEBA 1: TODOS LOS ÍNDICES REQUERIDOS ESTÁN ACTIVOS.');
    } else {
      console.warn(' Falta algún índice por generar. Ejecuta primero npm run init-db');
    }

    // --------------------------------------------------------------------------
    // PRUEBA 2: Rechazo de $jsonSchema Polimórfico (Error 121)
    // --------------------------------------------------------------------------
    console.log('\n--- PRUEBA 2: Rechazo de Inserción Inválida (Aduana Polimórfica) ---');
    console.log('Intentando insertar documento tramposo:');
    console.log('categoria: "computo_redes" con campo incompatible "codigo_curso: BD-101"...');

    const documentoInvalido = {
      folio: 'TEST-FAIL-001',
      titulo: 'Fallo de router Wi-Fi en Biblioteca',
      descripcion: 'Prueba de validación polimórfica estricta',
      categoria: 'computo_redes',
      prioridad: 'alta',
      estado: 'abierta',
      horas_invertidas: 0,
      reportante: {
        usuario_id: new ObjectId(),
        nombre: 'Estudiante Prueba',
        correo: 'estudiante@utm.mx',
        tipo_usuario: 'estudiante',
      },
      ubicacion: {
        edificio: 'Biblioteca Central',
        aula_o_espacio: 'Sala de Cómputo 1',
        planta: 'Planta Baja',
      },
      // ERROR INTENCIONAL: Este campo pertenece a la rama 'academico', NO a 'computo_redes'
      detalle_especifico: {
        codigo_curso: 'BD-101',
      },
      tags: ['redes', 'wifi'],
      evidencias_adjuntas: [],
      historial_seguimiento: [],
      fecha_creacion: new Date(),
    };

    try {
      await colIncidencias.insertOne(documentoInvalido);
      console.error(' FALLO: MongoDB aceptó el documento inválido cuando debió rechazarlo.');
    } catch (err) {
      if (err.code === 121 || (err.message && err.message.includes('Document failed validation'))) {
        console.log(' RESULTADO PRUEBA 2: ÉXITO TOTAL.');
        console.log(`   Código de Error: ${err.code} (Document failed validation)`);
        console.log('   Mensaje nativo de MongoDB: La segunda aduana rechazó el documento por violación de esquema polimórfico.');
      } else {
        console.error(' Error inesperado diferente a 121:', err);
      }
    }

    // --------------------------------------------------------------------------
    // PRUEBA 3: Inserción Exitosa de Documento Válido
    // --------------------------------------------------------------------------
    console.log('\n--- PRUEBA 3: Inserción de Documento Válido de Cómputo y Redes ---');
    const documentoValido = {
      folio: 'FOLIO-TEST-' + Date.now(),
      titulo: 'Switch Catalyst en Laboratorio 3 sin enlace',
      descripcion: 'Pérdida de enlace uplink en switch de distribución',
      categoria: 'computo_redes',
      prioridad: 'critica',
      estado: 'abierta',
      horas_invertidas: 1.5,
      reportante: {
        usuario_id: new ObjectId(),
        nombre: 'Ing. Redes UTM',
        correo: 'redes@utm.mx',
        tipo_usuario: 'docente',
      },
      ubicacion: {
        edificio: 'Edificio de Cómputo',
        aula_o_espacio: 'Laboratorio de Redes 3',
        planta: 'Planta Alta',
      },
      detalle_especifico: {
        tipo_dispositivo: 'Switch Cisco Catalyst 2960',
        direccion_ip: '192.168.10.2',
        vlan: 100,
        puerto_uplink: 'GigabitEthernet0/1',
        equipos_afectados: 25,
      },
      tags: ['switch', 'catalyst', 'redes'],
      evidencias_adjuntas: [],
      historial_seguimiento: [
        { fecha: new Date().toISOString(), nota: 'Ticket registrado en sistema' },
      ],
      fecha_creacion: new Date(),
    };

    const resValido = await colIncidencias.insertOne(documentoValido);
    console.log(' RESULTADO PRUEBA 3: ÉXITO.');
    console.log(`   Documento insertado correctamente con _id: ${resValido.insertedId}`);

    // Limpieza de prueba
    await colIncidencias.deleteOne({ _id: resValido.insertedId });
    console.log('    Documento de prueba eliminado después de la validación.');

    console.log('\n================================================================');
    console.log(' Todas las pruebas de base de datos han concluido.');
    console.log('================================================================\n');
  } catch (error) {
    console.error(' Error durante la ejecución de pruebas:', error);
  } finally {
    await client.close();
  }
}

if (require.main === module) {
  ejecutarPruebasDeValidacion();
}

module.exports = { ejecutarPruebasDeValidacion };
