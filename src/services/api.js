/**
 * api.js — Cliente HTTP central de UTM Desk
 * Todas las peticiones pasan por /api (proxied a http://localhost:4000 por Vite).
 * Adjunta el token JWT automáticamente y maneja errores de forma consistente.
 */

const BASE_URL = '/api';

/**
 * Obtiene el token JWT almacenado en localStorage.
 */
function getToken() {
  return localStorage.getItem('utmdesk_jwt') || null;
}

/**
 * Guarda el token JWT en localStorage.
 */
export function setToken(token) {
  if (token) {
    localStorage.setItem('utmdesk_jwt', token);
  } else {
    localStorage.removeItem('utmdesk_jwt');
  }
}

/**
 * Petición genérica con manejo centralizado de errores.
 * @param {string} endpoint  - Ruta relativa, ej: '/auth/login'
 * @param {RequestInit} options - Opciones fetch adicionales
 * @returns {Promise<any>}   - Datos de la respuesta JSON
 */
export async function request(endpoint, options = {}) {
  const token = getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  // Si se envía FormData, dejar que el navegador ponga el Content-Type (multipart)
  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Si la respuesta es 401, el token expiró o es inválido → limpiar sesión
  if (response.status === 401) {
    setToken(null);
    localStorage.removeItem('utmdesk_active_user');
    // Disparar evento para que App.jsx detecte el cierre de sesión forzado
    window.dispatchEvent(new CustomEvent('utmdesk:logout'));
    throw new Error('Sesión expirada. Por favor vuelve a iniciar sesión.');
  }

  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error(`Error inesperado del servidor (${response.status})`);
  }

  if (!response.ok) {
    const msg = data?.mensaje || data?.message || `Error ${response.status}`;
    throw new Error(msg);
  }

  return data;
}

// Métodos de conveniencia
export const api = {
  get:    (endpoint, opts = {}) => request(endpoint, { method: 'GET', ...opts }),
  post:   (endpoint, body, opts = {}) => request(endpoint, { method: 'POST', body: JSON.stringify(body), ...opts }),
  put:    (endpoint, body, opts = {}) => request(endpoint, { method: 'PUT',  body: JSON.stringify(body), ...opts }),
  patch:  (endpoint, body, opts = {}) => request(endpoint, { method: 'PATCH', body: JSON.stringify(body), ...opts }),
  delete: (endpoint, opts = {}) => request(endpoint, { method: 'DELETE', ...opts }),

  /** Para subir archivos con FormData */
  upload: (endpoint, formData, opts = {}) =>
    request(endpoint, { method: 'POST', body: formData, ...opts }),
};

export default api;
