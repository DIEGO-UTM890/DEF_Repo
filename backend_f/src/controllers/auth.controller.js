const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDb } = require('../config/db');
const { getSupabaseClient, TABLAS } = require('../config/supabase');

/**
 * Genera un token JWT firmado para la sesión del usuario.
 */
function generarToken(payload) {
  const secret = process.env.JWT_SECRET || 'secret_fallback_cadena_larga_para_desarrollo_local_64_caracteres_minimos';
  const expiresIn = process.env.JWT_EXPIRES_IN || '8h';
  return jwt.sign(payload, secret, { expiresIn });
}

/**
 * Controlador de Inicio de Sesión
 * Protegido por limitador de tasa perimetral estricto (5 intentos cada 15 min).
 */
async function login(req, res, next) {
  try {
    const { correo, password } = req.body;

    // 1. Verificación en Supabase o MongoDB si están activos
    const supabase = getSupabaseClient();
    const db = getDb();

    let usuarioEncontrado = null;

    if (supabase) {
      // Búsqueda en la tabla exacta 'usuario'
      const { data, error } = await supabase
        .from(TABLAS.USUARIO)
        .select('*')
        .eq('correo', correo.toLowerCase())
        .maybeSingle();

      if (!error && data) {
        usuarioEncontrado = data;
      }
    } else if (db) {
      // Búsqueda alternativa en MongoDB (acepta 'correo' y 'correo_institucional')
      const col = db.collection('usuarios');
      const correoNorm = correo.toLowerCase();
      usuarioEncontrado = await col.findOne({
        $or: [
          { correo: correoNorm },
          { correo_institucional: correoNorm },
        ],
      });
    }

    // Si aún no hay BD conectada o usuario de demo institucional
    if (!usuarioEncontrado) {
      // Credenciales institucionales de demostración para pruebas iniciales (todos los roles UTM Desk)
      const DEMO_USERS = [
        {
          id: 'demo-admin-id',
          nombre: 'Lic. Andrea Moguel Carrillo',
          correo: 'andrea.moguel@utmerida.edu.mx',
          rol: 'admin',
          password: 'admin123',
        },
        {
          id: 'demo-superadmin-id',
          nombre: 'Ing. Super Administrador Cloud',
          correo: 'superadmin@utmerida.edu.mx',
          rol: 'superadmin',
          password: 'superadmin123',
        },
        {
          id: 'demo-coordinador-id',
          nombre: 'Ing. Roberto Solís Castillo',
          correo: 'roberto.solis@utmerida.edu.mx',
          rol: 'coordinador',
          password: 'coordinador123',
        },
        {
          id: 'demo-tecnico-id',
          nombre: 'Carlos Eduardo Méndez Pech',
          correo: 'carlos.mendez@utmerida.edu.mx',
          rol: 'tecnico',
          password: 'tecnico123',
        },
        {
          id: 'demo-directivo-id',
          nombre: 'Mtra. Silvia Escalante Medina',
          correo: 'silvia.escalante@utmerida.edu.mx',
          rol: 'directivo',
          password: 'directivo123',
        },
        {
          id: 'demo-reportante1-id',
          nombre: 'Dra. Laura Beatriz Gómez',
          correo: 'laura.gomez@utmerida.edu.mx',
          rol: 'reportante',
          password: 'reportante123',
        },
        {
          id: 'demo-reportante2-id',
          nombre: 'Mtro. Jorge Alberto Cetina Uc',
          correo: 'jorge.cetina@utmerida.edu.mx',
          rol: 'reportante',
          password: 'reportante123',
        },
        // Credencial legacy de compatibilidad
        {
          id: 'demo-admin-legacy-id',
          nombre: 'Administrador UTM Desk',
          correo: 'admin@utm.mx',
          rol: 'admin',
          password: 'AdminUTM2026!',
        },
      ];

      const demoMatch = DEMO_USERS.find(
        (u) => u.correo.toLowerCase() === correo.toLowerCase() && u.password === password
      );

      if (demoMatch) {
        const token = generarToken({
          id: demoMatch.id,
          nombre: demoMatch.nombre,
          correo: demoMatch.correo,
          rol: demoMatch.rol,
        });

        return res.status(200).json({
          ok: true,
          mensaje: 'Inicio de sesión exitoso (Sesión institucional UTM Desk)',
          token,
          usuario: {
            id: demoMatch.id,
            nombre: demoMatch.nombre,
            correo: demoMatch.correo,
            rol: demoMatch.rol,
          },
        });
      }

      // Comprobar si existe una solicitud de registro pendiente para este correo
      let solicitudPendiente = null;
      if (db) {
        solicitudPendiente = await db.collection('solicitudes_registro').findOne({
          correo: correo.toLowerCase(),
          estado: 'pendiente',
        });
      } else {
        const { SOLICITUDES_MEMORIA } = require('./solicitudes.controller');
        solicitudPendiente = SOLICITUDES_MEMORIA.find(
          (s) => s.correo === correo.toLowerCase() && s.estado === 'pendiente'
        );
      }

      if (solicitudPendiente) {
        return res.status(403).json({
          ok: false,
          mensaje: 'Tu solicitud de registro para el rol de ' + (solicitudPendiente.rol_solicitado || 'usuario') + ' se encuentra en revisión. Un Administrador o Coordinador debe aprobarla antes de ingresar.',
        });
      }

      return res.status(401).json({
        ok: false,
        mensaje: 'Credenciales de acceso incorrectas',
      });
    }

    // 2. Validación de contraseña encriptada
    const passwordField = usuarioEncontrado.password_hash || usuarioEncontrado.password;
    // Si el usuario viene de mockData sin hash (modo MongoDB con datos legacy), comparar plano
    let match = false;
    if (passwordField && passwordField.startsWith('$2')) {
      match = await bcrypt.compare(password, passwordField);
    } else {
      // Contraseña en texto plano (datos demo importados sin hash)
      match = passwordField === password;
    }
    if (!match) {
      return res.status(401).json({
        ok: false,
        mensaje: 'Credenciales de acceso incorrectas',
      });
    }

    // 3. Firma del Token JWT — normalizar campos de nombre y correo
    const nombreUsuario =
      usuarioEncontrado.nombre ||
      usuarioEncontrado.nombre_completo ||
      'Usuario Institucional';
    const correoUsuario =
      usuarioEncontrado.correo ||
      usuarioEncontrado.correo_institucional ||
      correo;

    const token = generarToken({
      id: usuarioEncontrado.id || usuarioEncontrado._id,
      nombre: nombreUsuario,
      correo: correoUsuario,
      rol: usuarioEncontrado.rol || 'reportante',
    });

    return res.status(200).json({
      ok: true,
      mensaje: 'Inicio de sesión exitoso',
      token,
      usuario: {
        id: usuarioEncontrado.id || usuarioEncontrado._id,
        nombre: nombreUsuario,
        correo: correoUsuario,
        rol: usuarioEncontrado.rol || 'reportante',
      },
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * Controlador de Registro de Nuevos Usuarios
 */
async function registro(req, res, next) {
  try {
    const { nombre, correo, password, rol, telefono } = req.body;

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const supabase = getSupabaseClient();
    const db = getDb();

    // Documento para Supabase (esquema diferente)
    const nuevoUsuarioSupabase = {
      nombre,
      correo: correo.toLowerCase(),
      password_hash: passwordHash,
      rol: rol || 'estudiante',
      telefono: telefono || null,
      activo: true,
      creado_en: new Date().toISOString(),
    };

    // Documento para MongoDB (debe cumplir con el validador $jsonSchema estricto)
    const nuevoUsuarioMongo = {
      matricula_o_empleado: `USR-${Date.now().toString(36).toUpperCase()}`,
      nombre_completo: nombre,
      correo_institucional: correo.toLowerCase(),
      password_hash: passwordHash,
      rol: rol || 'reportante',
      area_asignada: 'general',
      activo: true,
      fecha_registro: new Date().toISOString(),
    };

    if (supabase) {
      const { data, error } = await supabase
        .from(TABLAS.USUARIO)
        .insert([nuevoUsuarioSupabase])
        .select('id, nombre, correo, rol, creado_en')
        .single();

      if (error) {
        if (error.code === '23505') {
          return res.status(409).json({
            ok: false,
            mensaje: 'El correo electrónico ya está registrado',
          });
        }
        throw error;
      }

      const token = generarToken(data);
      return res.status(201).json({
        ok: true,
        mensaje: 'Usuario registrado exitosamente',
        token,
        usuario: data,
      });
    }

    if (db) {
      const col = db.collection('usuarios');
      const existe = await col.findOne({
        $or: [
          { correo_institucional: nuevoUsuarioMongo.correo_institucional },
          { correo: nuevoUsuarioMongo.correo_institucional },
        ],
      });
      if (existe) {
        return res.status(409).json({
          ok: false,
          mensaje: 'El correo electrónico ya está registrado',
        });
      }

      const result = await col.insertOne(nuevoUsuarioMongo);
      const userClean = {
        id: result.insertedId,
        nombre: nuevoUsuarioMongo.nombre_completo,
        correo: nuevoUsuarioMongo.correo_institucional,
        rol: nuevoUsuarioMongo.rol,
      };

      const token = generarToken(userClean);
      return res.status(201).json({
        ok: true,
        mensaje: 'Usuario registrado exitosamente',
        token,
        usuario: userClean,
      });
    }

    // Fallback de demostración segura si no hay conexión a base de datos
    const demoUser = {
      id: 'usr_' + Date.now(),
      nombre: nuevoUsuarioSupabase.nombre,
      correo: nuevoUsuarioSupabase.correo,
      rol: nuevoUsuarioSupabase.rol,
    };
    const token = generarToken(demoUser);

    return res.status(201).json({
      ok: true,
      mensaje: 'Usuario registrado exitosamente (Modo diferido)',
      token,
      usuario: demoUser,
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * Obtener perfil del usuario autenticado
 */
async function perfil(req, res, next) {
  try {
    return res.status(200).json({
      ok: true,
      usuario: req.user,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  login,
  registro,
  perfil,
};
