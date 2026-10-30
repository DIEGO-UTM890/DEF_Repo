import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  Check, 
  X, 
  Search,
  Building,
  Mail,
  BadgeAlert,
  Clock,
  CheckCircle2,
  AlertCircle,
  Inbox,
  UserCheck,
  UserX,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  RefreshCw
} from 'lucide-react';
import { ROLES_CONFIG } from '../data/mockData';
import solicitudesService from '../services/solicitudes.service';

export default function UserManagement({ users, onUpdateUsers, currentUser }) {
  // Pestaña principal: 'usuarios' (directorio activo) | 'solicitudes' (pendientes de aprobación)
  const [activeTab, setActiveTab] = useState('usuarios');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Solicitudes de Registro
  const [solicitudes, setSolicitudes] = useState([]);
  const [filtroEstadoSol, setFiltroEstadoSol] = useState('pendiente'); // 'pendiente' | 'todas' | 'aprobada' | 'rechazada'
  const [actionNotice, setActionNotice] = useState(null); // { type: 'success' | 'error', text }
  const [processingId, setProcessingId] = useState(null);
  const [cargandoSol, setCargandoSol] = useState(false);

  // Formulario nuevo usuario manual
  const [matricula, setMatricula] = useState('');
  const [nombreCompleto, setNombreCompleto] = useState('');
  const [correo, setCorreo] = useState('');
  const [rol, setRol] = useState('reportante');
  const [area, setArea] = useState('computo_redes');

  // Cargar solicitudes de registro (re-consulta la API y sincroniza)
  const cargarSolicitudes = async () => {
    setCargandoSol(true);
    try {
      const data = await solicitudesService.listarSolicitudes('todas');
      setSolicitudes(data || []);
    } catch (err) {
      console.error('Error al cargar solicitudes:', err);
    } finally {
      setCargandoSol(false);
    }
  };

  useEffect(() => {
    cargarSolicitudes();
  }, []);

  const pendientesCount = solicitudes.filter(s => s.estado === 'pendiente').length;

  // Alternar estado activo/inactivo (RF-08)
  const toggleUserActive = (userId) => {
    const updated = users.map(u => {
      if (u._id === userId) {
        return { ...u, activo: !u.activo };
      }
      return u;
    });
    onUpdateUsers(updated);
  };

  // Cambiar rol de usuario (RF-08)
  const handleChangeRole = (userId, newRole) => {
    const updated = users.map(u => {
      if (u._id === userId) {
        return { ...u, rol: newRole };
      }
      return u;
    });
    onUpdateUsers(updated);
  };

  // Crear nuevo perfil manual (RF-08)
  const handleCreateUser = (e) => {
    e.preventDefault();
    if (!matricula || !nombreCompleto || !correo) {
      alert('Por favor completa todos los campos requeridos.');
      return;
    }

    const newUser = {
      _id: Date.now().toString(16) + 'c8d4e123',
      matricula_o_empleado: matricula,
      nombre_completo: nombreCompleto,
      correo_institucional: correo,
      password: 'utm2026',
      rol,
      area_asignada: area,
      activo: true,
      fecha_registro: new Date().toISOString()
    };

    onUpdateUsers([newUser, ...users]);
    setShowAddModal(false);
    setMatricula('');
    setNombreCompleto('');
    setCorreo('');
  };

  // ─── APROBAR SOLICITUD DE REGISTRO ──────────────────────────────────────────
  const handleAprobarSolicitud = async (sol) => {
    setProcessingId(sol._id);
    setActionNotice(null);
    try {
      const res = await solicitudesService.aprobarSolicitud(sol._id, currentUser);

      // Crear cuenta en la lista activa de usuarios
      const yaExiste = users.some(u => 
        u.correo_institucional?.toLowerCase() === sol.correo.toLowerCase()
      );

      if (!yaExiste) {
        const nuevoUsuarioActivo = {
          _id: sol._id || Date.now().toString(16),
          matricula_o_empleado: sol.matricula_o_empleado || `EMP-${Date.now().toString().slice(-4)}`,
          nombre_completo: sol.nombre,
          correo_institucional: sol.correo,
          password: sol.password || 'utm2026',
          rol: sol.rol_solicitado || 'reportante',
          area_asignada: sol.area_asignada || 'general',
          activo: true,
          fecha_registro: new Date().toISOString(),
        };
        onUpdateUsers([nuevoUsuarioActivo, ...users]);
      }

      await cargarSolicitudes();
      setActionNotice({
        type: 'success',
        text: `¡Cuenta aprobada! ${sol.nombre} ahora tiene acceso activo al panel de ${ROLES_CONFIG[sol.rol_solicitado]?.title || sol.rol_solicitado}.`
      });
    } catch (err) {
      setActionNotice({
        type: 'error',
        text: err.message || 'Error al aprobar la solicitud.'
      });
    } finally {
      setProcessingId(null);
    }
  };

  // ─── RECHAZAR SOLICITUD DE REGISTRO ─────────────────────────────────────────
  const handleRechazarSolicitud = async (sol) => {
    const motivo = prompt(
      `Indica el motivo de rechazo para la solicitud de ${sol.nombre}:`,
      'No se pudo verificar la vinculación institucional en los registros de la UTM.'
    );
    if (motivo === null) return; // Cancelado por el usuario

    setProcessingId(sol._id);
    setActionNotice(null);
    try {
      await solicitudesService.rechazarSolicitud(sol._id, motivo, currentUser);
      await cargarSolicitudes();
      setActionNotice({
        type: 'success',
        text: `Solicitud de ${sol.nombre} rechazada correctamente.`
      });
    } catch (err) {
      setActionNotice({
        type: 'error',
        text: err.message || 'Error al rechazar la solicitud.'
      });
    } finally {
      setProcessingId(null);
    }
  };

  const filteredUsers = users.filter(u => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      u.nombre_completo?.toLowerCase().includes(q) ||
      u.correo_institucional?.toLowerCase().includes(q) ||
      u.matricula_o_empleado?.toLowerCase().includes(q)
    );
  });

  const solicitudesFiltradas = solicitudes.filter(s => {
    if (filtroEstadoSol !== 'todas' && s.estado !== filtroEstadoSol) return false;
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      s.nombre?.toLowerCase().includes(q) ||
      s.correo?.toLowerCase().includes(q) ||
      s.matricula_o_empleado?.toLowerCase().includes(q) ||
      s.rol_solicitado?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 w-full pb-16">
      
      {/* Header con Título y Botón de Alta Manual */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-amber-400 mb-1">
            <Users className="w-4 h-4" />
            <span>Colección Auxiliar: usuarios (RF-08)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
            Administración de Perfiles y Accesos
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Validación de solicitudes de registro, asignación de roles y control de acceso institucional UTM Desk.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs shadow-lg shadow-amber-600/20 flex items-center justify-center gap-2 self-start sm:self-auto cursor-pointer transition-all hover:scale-102 active:scale-98"
        >
          <UserPlus className="w-4 h-4" />
          <span>+ Alta Manual Directa</span>
        </button>
      </div>

      {/* Banner de Notificación de Acción */}
      {actionNotice && (
        <div className={`p-3.5 rounded-xl border text-xs sm:text-sm font-medium flex items-center justify-between gap-3 animate-in fade-in duration-200 ${
          actionNotice.type === 'success'
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
            : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
        }`}>
          <div className="flex items-center gap-2.5">
            {actionNotice.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            )}
            <span>{actionNotice.text}</span>
          </div>
          <button
            onClick={() => setActionNotice(null)}
            className="text-xs font-semibold underline opacity-80 hover:opacity-100 cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      )}

      {/* Pestañas de Navegación: Directorio vs Solicitudes Pendientes */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('usuarios')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'usuarios'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
                : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Cuentas Registradas</span>
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
              activeTab === 'usuarios'
                ? 'bg-amber-700 text-white'
                : 'bg-slate-700 text-slate-300'
            }`}>
              {users.length}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab('solicitudes');
              cargarSolicitudes();
            }}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer relative ${
              activeTab === 'solicitudes'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
                : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60'
            }`}
          >
            <Inbox className="w-4 h-4" />
            <span>Solicitudes de Registro</span>
            {pendientesCount > 0 ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {pendientesCount} pendientes
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-700 text-slate-400">
                0
              </span>
            )}
          </button>
        </div>

        {/* Filtros de Solicitudes y Botón de Recarga si la pestaña está activa */}
        {activeTab === 'solicitudes' && (
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
            <span className="text-slate-400 text-[11px] uppercase mr-1">Filtrar:</span>
            {['pendiente', 'todas', 'aprobada', 'rechazada'].map(estadoKey => (
              <button
                key={estadoKey}
                onClick={() => setFiltroEstadoSol(estadoKey)}
                className={`px-2.5 py-1 rounded-lg capitalize transition-colors cursor-pointer ${
                  filtroEstadoSol === estadoKey
                    ? 'bg-amber-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/60'
                }`}
              >
                {estadoKey}
              </button>
            ))}

            <button
              onClick={cargarSolicitudes}
              disabled={cargandoSol}
              title="Actualizar bandeja de solicitudes en tiempo real"
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 flex items-center gap-1.5 transition-all cursor-pointer ml-1"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${cargandoSol ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Actualizar</span>
            </button>
          </div>
        )}
      </div>

      {/* Buscador Común */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={
              activeTab === 'usuarios'
                ? "Buscar usuario por nombre, correo institucional o matrícula/empleado..."
                : "Buscar solicitud por nombre, correo institucional, matrícula o rol solicitado..."
            }
            className="w-full pl-12 pr-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* ===================================================================== */}
      {/* VISTA 1: LISTADO DE USUARIOS ACTIVOS */}
      {/* ===================================================================== */}
      {activeTab === 'usuarios' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden animate-in fade-in duration-150">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4">Usuario & Matrícula</th>
                  <th className="px-6 py-4">Rol Operativo</th>
                  <th className="px-6 py-4">Área Asignada</th>
                  <th className="px-6 py-4">Estado Cuenta</th>
                  <th className="px-6 py-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400 text-xs">
                      No se encontraron usuarios coincidentes con la búsqueda.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => {
                    const roleBadge = ROLES_CONFIG[u.rol]?.badge || 'bg-slate-100 text-slate-700';

                    return (
                      <tr key={u._id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-900 dark:text-white">
                            {u.nombre_completo}
                          </div>
                          <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                            <span className="font-mono text-amber-500 dark:text-amber-400 font-bold">{u.matricula_o_empleado}</span>
                            <span>•</span>
                            <span>{u.correo_institucional}</span>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <select
                            value={u.rol}
                            onChange={(e) => handleChangeRole(u._id, e.target.value)}
                            className={`text-xs font-bold px-2.5 py-1 rounded-xl border outline-none bg-white dark:bg-slate-800 cursor-pointer ${roleBadge}`}
                          >
                            {Object.entries(ROLES_CONFIG).map(([key, val]) => (
                              <option key={key} value={key}>{val.title}</option>
                            ))}
                          </select>
                        </td>

                        <td className="px-6 py-4 text-xs font-semibold text-slate-700 dark:text-slate-300 capitalize">
                          {u.area_asignada?.replace('_', ' ')}
                        </td>

                        <td className="px-6 py-4">
                          <button
                            onClick={() => toggleUserActive(u._id)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                              u.activo
                                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                                : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                            }`}
                          >
                            {u.activo ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                            <span>{u.activo ? 'Activa' : 'Desactivada'}</span>
                          </button>
                        </td>

                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => toggleUserActive(u._id)}
                            className="text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white underline cursor-pointer"
                          >
                            {u.activo ? 'Suspender' : 'Reactivar'}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* VISTA 2: PANEL DE VALIDACIÓN Y ACEPTACIÓN DE SOLICITUDES DE REGISTRO */}
      {/* ===================================================================== */}
      {activeTab === 'solicitudes' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          {solicitudesFiltradas.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Bandeja de Solicitudes al Día
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                No hay solicitudes en estado <span className="font-bold text-amber-500 uppercase">{filtroEstadoSol}</span> en este momento.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {solicitudesFiltradas.map((sol) => {
                const configRol = ROLES_CONFIG[sol.rol_solicitado];
                const esPendiente = sol.estado === 'pendiente';

                return (
                  <div
                    key={sol._id}
                    className={`p-6 rounded-3xl border transition-all ${
                      esPendiente
                        ? 'bg-white dark:bg-slate-900 border-amber-500/40 shadow-lg'
                        : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 opacity-80'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      
                      {/* Datos del Solicitante */}
                      <div className="space-y-1.5 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                            {sol.nombre}
                          </h3>

                          {/* Badge de Rol Solicitado */}
                          <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-full border ${configRol?.badge || 'bg-slate-100 text-slate-800'}`}>
                            {configRol?.title || sol.rol_solicitado}
                          </span>

                          {/* Badge de Estado */}
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                            sol.estado === 'pendiente'
                              ? 'bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300'
                              : sol.estado === 'aprobada'
                              ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300'
                              : 'bg-rose-100 text-rose-900 dark:bg-rose-950/60 dark:text-rose-300 border-rose-300'
                          }`}>
                            {sol.estado}
                          </span>
                        </div>

                        <div className="text-xs text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-3">
                          <span className="font-mono text-amber-500 dark:text-amber-400 font-bold">
                            {sol.matricula_o_empleado || 'Sin matrícula'}
                          </span>
                          <span>•</span>
                          <span className="font-medium text-slate-700 dark:text-slate-300">
                            {sol.correo}
                          </span>
                          <span>•</span>
                          <span className="capitalize text-slate-500">
                            Área: {sol.area_asignada?.replace('_', ' ') || 'General'}
                          </span>
                          <span>•</span>
                          <span className="text-[11px] text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(sol.fecha_solicitud || Date.now()).toLocaleString()}
                          </span>
                        </div>

                        {/* Motivo o Justificación */}
                        {sol.motivo && (
                          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-300 mt-2">
                            <span className="font-bold text-slate-900 dark:text-white mr-1">Justificación del acceso:</span>
                            {sol.motivo}
                          </div>
                        )}

                        {/* Datos de Revisión (si ya fue atendida) */}
                        {!esPendiente && sol.revisado_por && (
                          <div className="text-[11px] text-slate-400 pt-1">
                            Revisado por: <span className="font-bold text-slate-300">{sol.revisado_por}</span>
                            {sol.fecha_revision && ` el ${new Date(sol.fecha_revision).toLocaleString()}`}
                            {sol.motivo_rechazo && ` • Causa: ${sol.motivo_rechazo}`}
                          </div>
                        )}
                      </div>

                      {/* Botones de Aprobación / Rechazo (Solo si está pendiente) */}
                      {esPendiente ? (
                        <div className="flex items-center gap-2 self-start lg:self-center flex-shrink-0">
                          <button
                            onClick={() => handleRechazarSolicitud(sol)}
                            disabled={processingId === sol._id}
                            className="px-4 py-2.5 rounded-2xl border border-rose-300 dark:border-rose-800/70 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                          >
                            <UserX className="w-4 h-4" />
                            <span>Rechazar</span>
                          </button>

                          <button
                            onClick={() => handleAprobarSolicitud(sol)}
                            disabled={processingId === sol._id}
                            className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-emerald-600/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-50 hover:scale-105 active:scale-95"
                          >
                            <UserCheck className="w-4 h-4" />
                            <span>Aprobar y Activar Cuenta</span>
                          </button>
                        </div>
                      ) : (
                        <div className="text-xs font-bold text-slate-400 flex items-center gap-1">
                          {sol.estado === 'aprobada' ? (
                            <span className="text-emerald-500 flex items-center gap-1">
                              <CheckCircle2 className="w-4 h-4" /> Cuenta Activa
                            </span>
                          ) : (
                            <span className="text-rose-400 flex items-center gap-1">
                              <X className="w-4 h-4" /> Rechazada
                            </span>
                          )}
                        </div>
                      )}

                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Modal de Alta Manual Directa (Admin) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                Dar de Alta Nuevo Usuario Directo
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  Matrícula o N° Empleado
                </label>
                <input
                  type="text"
                  required
                  value={matricula}
                  onChange={(e) => setMatricula(e.target.value)}
                  placeholder="EMP-2026-090 o MAT-2026-112"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  required
                  value={nombreCompleto}
                  onChange={(e) => setNombreCompleto(e.target.value)}
                  placeholder="Ej. Ing. Juan Manuel Chi"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  Correo Institucional (@utmerida.edu.mx)
                </label>
                <input
                  type="email"
                  required
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  placeholder="juan.chi@utmerida.edu.mx"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                    Rol Inicial
                  </label>
                  <select
                    value={rol}
                    onChange={(e) => setRol(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                  >
                    {Object.entries(ROLES_CONFIG).map(([key, val]) => (
                      <option key={key} value={key}>{val.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                    Área Asignada
                  </label>
                  <select
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                  >
                    <option value="computo_redes">Cómputo y Redes</option>
                    <option value="infraestructura">Infraestructura</option>
                    <option value="academico">Académico</option>
                    <option value="general">General Campus</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/20 cursor-pointer"
                >
                  Guardar Perfil
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
