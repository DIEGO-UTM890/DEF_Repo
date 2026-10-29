const { createClient } = require('@supabase/supabase-js');

// Nombres de tablas exactos de acuerdo a las directivas de PostgreSQL / Supabase
const TABLAS = Object.freeze({
  ADMINISTRADOR: 'administrador',
  CITA: 'cita',
  CLIENTE: 'cliente',
  COTIZACION: 'cotizacion',
  EVIDENCIA: 'evidencia',
  ITEMINVENTARIO: 'iteminventario',
  LINEACOTIZACION: 'lineacotizacion',
  LINEAPEDIDO: 'lineapedido',
  MECANICO: 'mecanico',
  PEDIDO: 'pedido',
  RESENAS: 'resenas',
  SERVICIO: 'servicio',
  TALLER: 'taller',
  TICKETSOPORTE: 'ticketsoporte',
  USUARIO: 'usuario', // Tabla central de usuarios del sistema (NO usar 'usuarios')
  VEHICULO: 'vehiculo',
});

let supabaseInstance = null;

/**
 * Inicializa y retorna el cliente de Supabase con Service Role Key
 * para operaciones administrativas y almacenamiento seguro de evidencias.
 */
function getSupabaseClient() {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey || supabaseUrl.includes('your-project')) {
    console.warn(' [Supabase] SUPABASE_URL / SERVICE_ROLE_KEY no configurados. Operaciones relacionales en modo diferido.');
    return null;
  }

  try {
    supabaseInstance = createClient(supabaseUrl, serviceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
    console.log(' [Supabase] Cliente inicializado correctamente.');
    return supabaseInstance;
  } catch (error) {
    console.error(' [Supabase] Error al inicializar cliente Supabase:', error.message);
    return null;
  }
}

module.exports = {
  getSupabaseClient,
  TABLAS,
};
