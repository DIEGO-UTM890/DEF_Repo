const path = require('path');
const dotenv = require('dotenv');
const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function seedDocente() {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.DB_NAME || 'utm_desk_db';

  if (!uri) {
    console.error('Error: No se encontró MONGODB_URI en el archivo .env');
    process.exit(1);
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Conectado exitosamente a MongoDB Atlas');
    const db = client.db(dbName);
    const colUsuarios = db.collection('usuarios');

    // Password exacto requerido: "lizandro 2026" (con espacio)
    const passwordEnPlano = 'lizandro 2026';
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(passwordEnPlano, salt);

    const usuarioProfesor = {
      matricula_o_empleado: 'DOC-2026-001',
      nombre: 'lizandro.reyes',
      nombre_completo: 'Lizandro Reyes Carrillo',
      correo: 'lizandro.reyes@utmetropolitana.edu.mx',
      correo_institucional: 'lizandro.reyes@utmetropolitana.edu.mx',
      password_hash: passwordHash,
      rol: 'superAdmin',
      area_asignada: 'general',
      activo: true,
      fecha_registro: new Date(),
      creado_en: new Date().toISOString()
    };

    // Upsert para insertar o actualizar si ya existía
    const result = await colUsuarios.updateOne(
      { 
        $or: [
          { correo_institucional: usuarioProfesor.correo_institucional },
          { correo: usuarioProfesor.correo }
        ] 
      },
      { $set: usuarioProfesor },
      { upsert: true }
    );

    console.log('\n======================================================');
    console.log('¡USUARIO SUPERADMIN DEL PROFESOR CONFIGURADO CON ÉXITO!');
    console.log('======================================================');
    console.log('Nombre / Usuario:    lizandro.reyes');
    console.log('Correo:              lizandro.reyes@utmetropolitana.edu.mx');
    console.log('Contraseña en texto: lizandro 2026 (con espacio)');
    console.log('Hash Bcrypt:        ', passwordHash);
    console.log('Rol:                 superAdmin');
    console.log('Activo:              true');
    console.log('Colección:           usuarios en', dbName);
    console.log('======================================================\n');
  } catch (err) {
    console.error('Error al insertar el usuario docente:', err);
  } finally {
    await client.close();
  }
}

seedDocente();
