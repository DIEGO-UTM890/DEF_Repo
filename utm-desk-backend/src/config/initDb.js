const path = require('path');
const dotenv = require('dotenv');
const { MongoClient, ServerApiVersion } = require('mongodb');

// Cargar variables de entorno desde el .env del backend
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// ==============================================================================
// 1. ESQUEMA DE SEGUNDA ADUANA NATIVA: COLECCIÓN 'usuarios'
// ==============================================================================
const usuariosValidator = {
  $jsonSchema: {
    bsonType: 'object',
    required: [
      'matricula_o_empleado',
      'nombre_completo',
      'correo_institucional',
      'password_hash',
      'rol',
      'area_asignada',
      'activo',
      'fecha_registro',
    ],
    additionalProperties: false,
    properties: {
      _id: {
        bsonType: 'objectId',
        description: 'Identificador único BSON ObjectId generado por MongoDB',
      },
      matricula_o_empleado: {
        bsonType: 'string',
        description: 'Matrícula de estudiante o número de empleado institucional (Obligatorio)',
      },
      nombre_completo: {
        bsonType: 'string',
        description: 'Nombre y apellidos completos del usuario universitario (Obligatorio)',
      },
      correo_institucional: {
        bsonType: 'string',
        description: 'Correo institucional (Obligatorio)',
      },
      password_hash: {
        bsonType: 'string',
        description: 'Hash de contraseña encriptado con bcrypt (Obligatorio)',
      },
      rol: {
        enum: ['reportante', 'tecnico', 'coordinador', 'admin'],
        description: 'Rol permitido: únicamente reportante, tecnico, coordinador o admin',
      },
      area_asignada: {
        enum: ['computo_redes', 'infraestructura', 'academico', 'general'],
        description: 'Área universitaria asignada: computo_redes, infraestructura, academico o general',
      },
      activo: {
        bsonType: 'bool',
        description: 'Bandera booleana de estado de cuenta (Obligatorio)',
      },
      fecha_registro: {
        bsonType: ['date', 'string'],
        description: 'Fecha de registro de la cuenta (Obligatorio)',
      },
    },
  },
};

// ==============================================================================
// 2. ESQUEMA DE SEGUNDA ADUANA POLIMÓRFICA: COLECCIÓN 'incidencias_campus' (RF-01)
// ==============================================================================
const incidenciasCampusValidator = {
  $jsonSchema: {
    bsonType: 'object',
    required: [
      'folio',
      'titulo',
      'descripcion',
      'categoria',
      'prioridad',
      'estado',
      'horas_invertidas',
      'reportante',
      'ubicacion',
      'detalle_especifico',
      'tags',
      'evidencias_adjuntas',
      'historial_seguimiento',
      'fecha_creacion',
    ],
    additionalProperties: false,
    properties: {
      _id: {
        bsonType: 'objectId',
        description: 'Identificador único de incidencia BSON',
      },
      folio: {
        bsonType: 'string',
        description: 'Folio único institucional de la incidencia (ej. INC-2026-0001)',
      },
      titulo: {
        bsonType: 'string',
        description: 'Título conciso de la incidencia',
      },
      descripcion: {
        bsonType: 'string',
        description: 'Descripción detallada de la problemática',
      },
      categoria: {
        enum: ['computo_redes', 'infraestructura', 'academico'],
        description: 'Categoría institucional obligatoria',
      },
      prioridad: {
        enum: ['baja', 'media', 'alta', 'critica'],
        description: 'Nivel de urgencia de atención',
      },
      estado: {
        enum: ['abierta', 'en_proceso', 'en_espera', 'resuelta', 'cerrada'],
        description: 'Estado del ciclo de vida del ticket',
      },
      horas_invertidas: {
        bsonType: ['double', 'int', 'long', 'decimal'],
        description: 'Horas técnicas dedicadas a la resolución de la incidencia',
      },
      reportante: {
        bsonType: 'object',
        required: ['usuario_id', 'nombre', 'correo', 'tipo_usuario'],
        additionalProperties: false,
        properties: {
          usuario_id: {
            bsonType: ['objectId', 'string'],
            description: 'Identificador de referencia del usuario reportante',
          },
          nombre: {
            bsonType: 'string',
            description: 'Nombre del reportante',
          },
          correo: {
            bsonType: 'string',
            description: 'Correo electrónico de contacto',
          },
          tipo_usuario: {
            enum: ['estudiante', 'docente', 'administrativo'],
            description: 'Tipo de usuario universitario',
          },
        },
      },
      ubicacion: {
        bsonType: 'object',
        required: ['edificio', 'aula_o_espacio', 'planta'],
        additionalProperties: false,
        properties: {
          edificio: {
            bsonType: 'string',
            description: 'Nombre o clave del edificio en campus',
          },
          aula_o_espacio: {
            bsonType: 'string',
            description: 'Aula, laboratorio, auditorio o espacio físico',
          },
          planta: {
            bsonType: ['string', 'int'],
            description: 'Planta o nivel (ej. Baja, 1, 2)',
          },
        },
      },
      detalle_especifico: {
        bsonType: 'object',
        description: 'Subdocumento polimórfico validado según la categoría elegida',
      },
      tags: {
        bsonType: 'array',
        items: {
          bsonType: 'string',
        },
        description: 'Etiquetas de búsqueda y categorización',
      },
      evidencias_adjuntas: {
        bsonType: 'array',
        description: 'Arreglo de referencias a evidencias fotográficas o documentales',
      },
      historial_seguimiento: {
        bsonType: 'array',
        description: 'Bitácora cronológica de actualizaciones y notas',
      },
      fecha_creacion: {
        bsonType: ['date', 'string'],
        description: 'Marca temporal de apertura del reporte',
      },
      fecha_resolucion: {
        bsonType: 'date',
        description: 'Marca de tiempo BSON Date exclusiva de incidencias resueltas (Activa el reloj TTL de 60 días)',
      },
    },
    // Validación Polimórfica Estricta con oneOf (RF-01)
    oneOf: [
      // Rama 1: Cómputo y Redes
      {
        properties: {
          categoria: { enum: ['computo_redes'] },
          detalle_especifico: {
            bsonType: 'object',
            required: ['tipo_dispositivo', 'direccion_ip', 'vlan', 'puerto_uplink', 'equipos_afectados'],
            additionalProperties: false,
            properties: {
              tipo_dispositivo: { bsonType: 'string' },
              direccion_ip: { bsonType: 'string' },
              vlan: { bsonType: ['int', 'string', 'double'] },
              puerto_uplink: { bsonType: 'string' },
              equipos_afectados: { bsonType: ['int', 'long', 'double'] },
            },
          },
        },
      },
      // Rama 2: Infraestructura Universitaria
      {
        properties: {
          categoria: { enum: ['infraestructura'] },
          detalle_especifico: {
            bsonType: 'object',
            required: ['tipo_dano', 'riesgo_seguridad', 'materiales_requeridos', 'requiere_contratista_externo'],
            additionalProperties: false,
            properties: {
              tipo_dano: { bsonType: 'string' },
              riesgo_seguridad: { enum: ['bajo', 'medio', 'alto'] },
              materiales_requeridos: {
                bsonType: 'array',
                items: { bsonType: 'string' },
              },
              requiere_contratista_externo: { bsonType: 'bool' },
            },
          },
        },
      },
      // Rama 3: Sistemas Académicos
      {
        properties: {
          categoria: { enum: ['academico'] },
          detalle_especifico: {
            bsonType: 'object',
            required: ['plataforma_afectada', 'codigo_curso', 'periodo_escolar', 'estudiantes_impactados'],
            additionalProperties: false,
            properties: {
              plataforma_afectada: { bsonType: 'string' },
              codigo_curso: { bsonType: 'string' },
              periodo_escolar: { bsonType: 'string' },
              estudiantes_impactados: { bsonType: ['int', 'long', 'double'] },
            },
          },
        },
      },
    ],
  },
};

// ==============================================================================
// 3. FUNCIÓN PRINCIPAL DE INICIALIZACIÓN
// ==============================================================================
async function inicializarBaseDeDatos() {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.DB_NAME || 'utm_desk_db';

  console.log('================================================================');
  console.log('🚀 [MongoDB Atlas] Iniciando Script de Aduanas e Índices Nativos');
  console.log(`🌐 Base de datos objetivo: ${dbName}`);
  console.log('================================================================');

  if (!uri || uri.includes('ChangeThisPassword')) {
    console.error('❌ [Error] MONGODB_URI no contiene una cadena de conexión válida en .env');
    console.log('👉 Configura tu clúster M0 en MongoDB Atlas y pega tu URI en el archivo .env.');
    process.exit(1);
  }

  const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
    serverSelectionTimeoutMS: 8000,
  });

  try {
    await client.connect();
    console.log('✅ Conexión establecida con el clúster de MongoDB Atlas.');
    const db = client.db(dbName);

    // Obtener colecciones existentes
    const coleccionesExistentes = (await db.listCollections().toArray()).map((c) => c.name);

    // --------------------------------------------------------------------------
    // A. APLICAR ADUANA $jsonSchema: Colección 'usuarios'
    // --------------------------------------------------------------------------
    console.log('\n🔒 [Segunda Aduana] Configurando validador para colección: usuarios...');
    if (coleccionesExistentes.includes('usuarios')) {
      await db.command({
        collMod: 'usuarios',
        validator: usuariosValidator,
        validationLevel: 'strict',
        validationAction: 'error',
      });
      console.log('   ✔️ Validador strict y action error actualizado con collMod.');
    } else {
      await db.createCollection('usuarios', {
        validator: usuariosValidator,
        validationLevel: 'strict',
        validationAction: 'error',
      });
      console.log('   ✔️ Colección usuarios creada con validador strict.');
    }

    // Índices de usuarios
    console.log('⚡ [Índices] Creando índices únicos para colección: usuarios...');
    const colUsuarios = db.collection('usuarios');
    await colUsuarios.createIndex({ correo_institucional: 1 }, { unique: true, name: 'idx_usuarios_correo_unico' });
    await colUsuarios.createIndex({ matricula_o_empleado: 1 }, { unique: true, name: 'idx_usuarios_matricula_unica' });
    console.log('   ✔️ Índice único correo_institucional activo.');
    console.log('   ✔️ Índice único matricula_o_empleado activo.');

    // --------------------------------------------------------------------------
    // B. APLICAR ADUANA $jsonSchema POLIMÓRFICA: Colección 'incidencias_campus'
    // --------------------------------------------------------------------------
    console.log('\n🔒 [Segunda Aduana Polimórfica] Configurando validador para: incidencias_campus...');
    if (coleccionesExistentes.includes('incidencias_campus')) {
      await db.command({
        collMod: 'incidencias_campus',
        validator: incidenciasCampusValidator,
        validationLevel: 'strict',
        validationAction: 'error',
      });
      console.log('   ✔️ Validador polimórfico strict y action error actualizado con collMod.');
    } else {
      await db.createCollection('incidencias_campus', {
        validator: incidenciasCampusValidator,
        validationLevel: 'strict',
        validationAction: 'error',
      });
      console.log('   ✔️ Colección incidencias_campus creada con validador polimórfico strict.');
    }

    // --------------------------------------------------------------------------
    // C. CONFIGURACIÓN DE ÍNDICES ESTRATÉGICOS (RNF-02, RNF-03, RF-06)
    // --------------------------------------------------------------------------
    console.log('\n⚡ [Índices Estratégicos] Creando índices para: incidencias_campus...');
    const colIncidencias = db.collection('incidencias_campus');

    // 1. Índice Único sobre folio
    await colIncidencias.createIndex({ folio: 1 }, { unique: true, name: 'idx_incidencias_folio_unico' });
    console.log('   ✔️ [RF] Índice Único en folio activo.');

    // 2. Índice Compuesto de Rapidez (RNF-03)
    await colIncidencias.createIndex(
      { categoria: 1, estado: 1, 'ubicacion.edificio': 1 },
      { name: 'idx_compuesto_rapidez_categoria_estado_edificio' }
    );
    console.log('   ✔️ [RNF-03] Índice Compuesto de Rapidez { categoria, estado, ubicacion.edificio } activo.');

    // 3. Índice de Texto en Español (RF-06)
    await colIncidencias.createIndex(
      { titulo: 'text', descripcion: 'text' },
      {
        default_language: 'spanish',
        weights: { titulo: 10, descripcion: 5 },
        name: 'idx_texto_espanol_incidencias',
      }
    );
    console.log('   ✔️ [RF-06] Índice de Texto en Español ponderado (titulo: 10, descripcion: 5) activo.');

    // 4. Índice TTL de Limpieza Automática a los 60 Días (RNF-02)
    // 60 días * 24 horas * 3600 segundos = 5,184,000 segundos
    await colIncidencias.createIndex(
      { fecha_resolucion: 1 },
      {
        expireAfterSeconds: 5184000,
        name: 'idx_ttl_60_dias_fecha_resolucion',
      }
    );
    console.log('   ✔️ [RNF-02] Índice TTL de Limpieza Automática (5,184,000s = 60 días) activo.');

    console.log('\n================================================================');
    console.log('🎉 ¡Configuración de MongoDB Atlas completada con éxito total!');
    console.log('   - Segunda aduana estricta y polimórfica: 100% Blindada');
    console.log('   - Índices de rapidez, texto y TTL: Activos');
    console.log('================================================================\n');
  } catch (error) {
    console.error('❌ Error durante la inicialización de la base de datos:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('🔒 Conexión con MongoDB cerrada.');
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  inicializarBaseDeDatos();
}

module.exports = {
  inicializarBaseDeDatos,
  usuariosValidator,
  incidenciasCampusValidator,
};
