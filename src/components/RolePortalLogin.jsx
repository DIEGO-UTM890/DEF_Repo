import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  Unlock, 
  KeyRound, 
  User, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles,
  ArrowLeft,
  ArrowRight,
  Shield,
  Wrench,
  ClipboardCheck,
  BarChart3,
  Zap,
  Building2,
  Loader2,
  Wifi,
  WifiOff,
  UserPlus,
  Mail,
  Hash,
  FileText,
  Clock,
  X,
  Layers,
  Activity,
  ChevronRight,
  Check
} from 'lucide-react';
import { ROLES_CONFIG } from '../data/mockData';
import authService from '../services/auth.service';
import solicitudesService from '../services/solicitudes.service';

const ROLE_ICONS = {
  reportante: User,
  tecnico: Wrench,
  coordinador: ClipboardCheck,
  directivo: BarChart3,
  admin: ShieldCheck,
  superadmin: Zap
};

export default function RolePortalLogin({ 
  users, 
  onAuthenticate,
  initialRole = null
}) {
  const [selectedRole, setSelectedRole] = useState(initialRole);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [backendOnline, setBackendOnline] = useState(null);

  // Estado del Modal de Solicitud de Registro
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [regNombre, setRegNombre] = useState('');
  const [regMatricula, setRegMatricula] = useState('');
  const [regCorreo, setRegCorreo] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRol, setRegRol] = useState('reportante');
  const [regArea, setRegArea] = useState('general');
  const [regMotivo, setRegMotivo] = useState('');
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState(null);

  useEffect(() => {
    let montado = true;
    authService.verificarBackend().then(online => {
      if (montado) setBackendOnline(online);
    });
    return () => { montado = false; };
  }, []);

  const roleInfo = selectedRole ? ROLES_CONFIG[selectedRole] : null;

  // Filtrar cuentas demo disponibles para el rol
  const eligibleUsers = selectedRole 
    ? users.filter(u => u.rol === selectedRole && u.activo !== false)
    : [];

  const handleSelectRole = (roleKey) => {
    setSelectedRole(roleKey);
    setIdentifier('');
    setPassword('');
    setError('');
    setIsSuccess(false);
    setSuccessMessage('');
  };

  const handleQuickFill = (user) => {
    setIdentifier(user.correo_institucional);
    setPassword(user.password || 'utm2026');
    setError('');
  };

  const handleDirectLogin = (user) => {
    setError('');
    setIsSuccess(true);
    setSuccessMessage(`¡Acceso validado! Ingresando a la consola de ${roleInfo?.title || user.rol}...`);
    setTimeout(() => {
      onAuthenticate(user);
    }, 350);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const cleanId = identifier.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!cleanId || !cleanPass) {
      setError('Por favor ingresa tu identificador institucional y contraseña.');
      return;
    }

    setIsLoading(true);
    try {
      const { usuario, modoOffline } = await authService.login(cleanId, cleanPass, users);
      setIsSuccess(true);
      const destinationTitle = ROLES_CONFIG[usuario.rol]?.title || usuario.rol;
      setSuccessMessage(
        modoOffline
          ? `Sesión verificada (Modo Local). Abriendo panel de ${destinationTitle}...`
          : `Sesión autenticada vía API. Abriendo panel de ${destinationTitle}...`
      );
      setTimeout(() => {
        onAuthenticate(usuario);
      }, 350);
    } catch (err) {
      setError(err.message || 'Error al validar credenciales de acceso.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegError('');

    if (!regNombre.trim() || !regCorreo.trim() || !regPassword.trim()) {
      setRegError('Completa todos los campos obligatorios (*).');
      return;
    }

    if (regPassword.length < 8) {
      setRegError('La contraseña debe contener al menos 8 caracteres para seguridad institucional.');
      return;
    }

    setRegLoading(true);
    try {
      const res = await solicitudesService.crearSolicitud({
        nombre: regNombre.trim(),
        correo: regCorreo.trim().toLowerCase(),
        password: regPassword,
        rol_solicitado: regRol,
        area_asignada: regArea,
        matricula_o_empleado: regMatricula.trim() || undefined,
        motivo: regMotivo.trim() || undefined,
      });

      setRegSuccess({
        folio: res.id || `SOL-${Date.now().toString(36).toUpperCase()}`,
        mensaje: res.mensaje || 'Tu solicitud ha sido enviada con éxito.',
        rol: ROLES_CONFIG[regRol]?.title || regRol,
      });
    } catch (err) {
      setRegError(err.message || 'No se pudo registrar la solicitud.');
    } finally {
      setRegLoading(false);
    }
  };

  const resetRegisterForm = () => {
    setRegNombre('');
    setRegMatricula('');
    setRegCorreo('');
    setRegPassword('');
    setRegRol('reportante');
    setRegArea('general');
    setRegMotivo('');
    setRegError('');
    setRegSuccess(null);
    setIsRegisterOpen(false);
  };

  // ──────────────────────────────────────────────────────────────────────────
  // MODAL DE REGISTRO / ALTA DE CUENTA
  // ──────────────────────────────────────────────────────────────────────────
  const renderRegisterModal = () => {
    if (!isRegisterOpen) return null;

    return (
      <div className="fixed inset-0 z-50 bg-[#0B0C0E]/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
        <div className="bg-[#121316] border border-slate-700/60 w-full max-w-xl rounded-2xl p-6 sm:p-8 shadow-2xl relative my-8 text-left">
          
          <button
            type="button"
            onClick={resetRegisterForm}
            className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {regSuccess ? (
            <div className="text-center py-6 space-y-4">
              <div className="inline-flex p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold text-slate-100 tracking-tight">
                Solicitud Registrada con Éxito
              </h3>
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 space-y-2 text-left">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Folio Institucional:</span>
                  <span className="font-mono font-bold text-amber-400">{regSuccess.folio}</span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Rol Solicitado:</span>
                  <span className="font-semibold text-slate-200">{regSuccess.rol}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Estado Inicial:</span>
                  <span className="inline-flex items-center gap-1 font-semibold text-amber-400 px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-[11px]">
                    <Clock className="w-3 h-3" /> Pendiente de Aprobación
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                Siguiendo las políticas de seguridad institucional de la UTM, tu cuenta requiere validación por la Administración. Podrás acceder en cuanto sea aprobada.
              </p>
              <button
                type="button"
                onClick={resetRegisterForm}
                className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-sm transition-all cursor-pointer shadow-lg shadow-amber-600/20"
              >
                Volver al Portal de Acceso
              </button>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-2">
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Alta de Cuenta Institucional</span>
                </div>
                <h3 className="text-2xl font-bold text-slate-100 tracking-tight">
                  Solicitud de Acceso al Campus
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Tu solicitud será enviada a la consola de administración institucional para su validación y activación.
                </p>
              </div>

              {regError && (
                <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
                  <span>{regError}</span>
                </div>
              )}

              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                      Nombre Completo *
                    </label>
                    <input
                      type="text"
                      required
                      value={regNombre}
                      onChange={(e) => setRegNombre(e.target.value)}
                      placeholder="Ej. Ing. Laura Gómez"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/60 text-slate-100 placeholder:text-slate-600 text-xs font-medium focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/40"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                      Matrícula o N° Empleado
                    </label>
                    <input
                      type="text"
                      value={regMatricula}
                      onChange={(e) => setRegMatricula(e.target.value)}
                      placeholder="DOC-2026-031 o EMP-089"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/60 text-slate-100 placeholder:text-slate-600 text-xs font-medium focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/40"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                      Correo Institucional *
                    </label>
                    <input
                      type="email"
                      required
                      value={regCorreo}
                      onChange={(e) => setRegCorreo(e.target.value)}
                      placeholder="usuario@utmerida.edu.mx"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/60 text-slate-100 placeholder:text-slate-600 text-xs font-medium focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/40"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                      Contraseña * (mín 8 car.)
                    </label>
                    <input
                      type="password"
                      required
                      minLength={8}
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/60 text-slate-100 placeholder:text-slate-600 text-xs font-medium focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/40"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                      Rol Solicitado *
                    </label>
                    <select
                      value={regRol}
                      onChange={(e) => setRegRol(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700/60 text-slate-100 text-xs font-medium focus:outline-none focus:border-amber-500"
                    >
                      <option value="reportante">Reportante (Docente / Alumno / Personal)</option>
                      <option value="tecnico">Técnico Operativo (Soporte)</option>
                      <option value="coordinador">Coordinador de Campus</option>
                      <option value="directivo">Directivo Institucional</option>
                      <option value="admin">Administrador de Accesos</option>
                      <option value="superadmin">Super Administrador (Cloud & Auditoría)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                      Área o División
                    </label>
                    <select
                      value={regArea}
                      onChange={(e) => setRegArea(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700/60 text-slate-100 text-xs font-medium focus:outline-none focus:border-amber-500"
                    >
                      <option value="general">General Campus</option>
                      <option value="computo_redes">Cómputo y Redes</option>
                      <option value="infraestructura">Infraestructura y Mantenimiento</option>
                      <option value="academico">Académico / Docencia</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Motivo o Justificación del Acceso
                  </label>
                  <textarea
                    rows={2}
                    value={regMotivo}
                    onChange={(e) => setRegMotivo(e.target.value)}
                    placeholder="Describe brevemente tu área de adscripción o rol en el campus..."
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700/60 text-slate-100 placeholder:text-slate-600 text-xs font-medium focus:outline-none focus:border-amber-500 resize-none"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={resetRegisterForm}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={regLoading}
                    className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 shadow-md shadow-amber-600/25"
                  >
                    {regLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                    <span>Enviar Solicitud</span>
                  </button>
                </div>
              </form>
            </>
          )}

        </div>
      </div>
    );
  };

  // ──────────────────────────────────────────────────────────────────────────
  // ESTRUCTURA PRINCIPAL: SPLIT-SCREEN CORPORATIVO (2 COLUMNAS)
  // ──────────────────────────────────────────────────────────────────────────
  return (
    <div className="w-full max-w-[1650px] mx-auto my-2 sm:my-6 rounded-3xl border border-slate-800/80 bg-[#121316]/90 backdrop-blur-2xl shadow-2xl overflow-hidden flex flex-col lg:flex-row items-stretch animate-in fade-in duration-300 relative">
      
      {/* Glow de acento sutil en esquina */}
      <div className="absolute -top-32 -left-32 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* ===================================================================== */}
      {/* COLUMNA IZQUIERDA: VISUAL CORPORATIVO INSTITUCIONAL */}
      {/* ===================================================================== */}
      <div className="lg:w-5/12 xl:w-4/12 p-8 sm:p-12 flex flex-col justify-between relative overflow-hidden bg-gradient-to-br from-[#0B0C0E] via-[#121316] to-[#1C1D22] border-b lg:border-b-0 lg:border-r border-slate-800/80">
        
        {/* Textura sutil de cuadrícula de fondo */}
        <div className="absolute inset-0 bg-grid-pattern opacity-25 pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-600/10 rounded-full blur-2xl pointer-events-none"></div>

        {/* Sección Superior: Badge Institucional y Estado de Conexión */}
        <div className="relative z-10 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-xs font-semibold text-slate-300 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span>UTM Campus Mérida</span>
            </div>

            <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${
              backendOnline === true
                ? 'bg-emerald-950/40 border-emerald-700/50 text-emerald-300'
                : backendOnline === false
                ? 'bg-slate-900 border-slate-800 text-slate-400'
                : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}>
              {backendOnline === true ? (
                <>
                  <Wifi className="w-3 h-3 text-emerald-400 animate-pulse" />
                  <span>API :4000 Activa</span>
                </>
              ) : backendOnline === false ? (
                <>
                  <WifiOff className="w-3 h-3 text-slate-400" />
                  <span>Modo Local / Demo</span>
                </>
              ) : (
                <>
                  <Loader2 className="w-3 h-3 text-slate-400 animate-spin" />
                  <span>Comprobando...</span>
                </>
              )}
            </div>
          </div>

          {/* Logo y Encabezado de Impacto */}
          <div className="space-y-4 pt-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-500 flex items-center justify-center text-white shadow-xl shadow-amber-600/25 border border-amber-400/30">
              <Shield className="w-8 h-8" />
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-amber-400 block mb-1">
                Mesa Central de Servicios
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-100 tracking-tight leading-tight">
                UTM<span className="text-amber-400">Desk</span> Enterprise
              </h1>
            </div>

            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              Plataforma institucional de gestión técnica, fiscalización y trazabilidad operativa de incidencias para la Universidad Tecnológica Metropolitana.
            </p>
          </div>

          {/* Tarjetas de Características Corporativas */}
          <div className="space-y-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 flex-shrink-0 mt-0.5">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-200">Acceso Basado en Roles (RBAC)</h4>
                <p className="text-[11px] text-slate-400 leading-normal">
                  Paneles segmentados y permisos específicos para personal administrativo, técnico y directivo.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 flex-shrink-0 mt-0.5">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-200">Trazabilidad y SLAs en Tiempo Real</h4>
                <p className="text-[11px] text-slate-400 leading-normal">
                  Control de ciclo de vida con bitácora cronológica inmutable y reportes analíticos para toma de decisiones.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 flex-shrink-0 mt-0.5">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-200">Cobertura Integral de Campus</h4>
                <p className="text-[11px] text-slate-400 leading-normal">
                  Atención en laboratorios CTI, redes, aulas y sistemas académicos del campus central.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sección Inferior Izquierda: Botón de Registro y Nota Institucional */}
        <div className="relative z-10 pt-8 mt-6 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-[11px] text-slate-400">
            ¿Aún no tienes cuenta asignada?
          </div>
          <button
            type="button"
            onClick={() => {
              setRegRol(selectedRole || 'reportante');
              setIsRegisterOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 hover:text-amber-200 border border-amber-500/30 text-xs font-semibold transition-all cursor-pointer shadow-sm"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Solicitar Registro</span>
          </button>
        </div>

      </div>

      {/* ===================================================================== */}
      {/* COLUMNA DERECHA: ÁREA INTERACTIVA (SELECTOR DE ROLES O LOGIN) */}
      {/* ===================================================================== */}
      <div className="lg:w-7/12 xl:w-8/12 p-6 sm:p-10 flex flex-col justify-center bg-slate-900/40 relative">
        
        {/* CASO A: SELECTOR DE PORTALES POR ROL */}
        {!selectedRole ? (
          <div className="space-y-6">
            
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700/60 text-xs font-semibold text-slate-300 mb-2">
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                <span>Portales Especializados</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
                Selecciona tu Portal de Trabajo
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm mt-1">
                Ingresa al panel correspondiente a tu rol institucional para gestionar expedientes y accesos.
              </p>
            </div>

            {/* Cuadrícula de Tarjetas de Roles (3 columnas en pantallas grandes para balance perfecto de 6 roles) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {Object.entries(ROLES_CONFIG).map(([key, config]) => {
                const Icon = ROLE_ICONS[key] || User;

                return (
                  <div
                    key={key}
                    onClick={() => handleSelectRole(key)}
                    className="group p-4 sm:p-5 rounded-2xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-amber-500/50 transition-all duration-200 cursor-pointer flex flex-col justify-between shadow-sm hover:shadow-xl hover:shadow-amber-500/5 relative overflow-hidden"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 group-hover:bg-amber-500/20 group-hover:text-amber-300 transition-colors flex items-center justify-center">
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-slate-400">
                          <Lock className="w-2.5 h-2.5 text-slate-400" />
                          <span>Seguro</span>
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-200 group-hover:text-amber-300 transition-colors mb-1">
                        {config.title}
                      </h3>

                      <p className="text-slate-400 text-xs leading-relaxed line-clamp-2">
                        {config.description}
                      </p>
                    </div>

                    <div className="pt-3.5 mt-3 border-t border-slate-700/60 flex items-center justify-between text-xs">
                      <span className="font-semibold text-amber-400 group-hover:text-amber-300 transition-colors flex items-center gap-1">
                        <span>Ingresar</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                      <span className="text-[10px] font-medium text-slate-400">
                        req. acceso
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Banner de Ayuda inferior */}
            <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5 text-slate-300">
                <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>¿Primera vez en el sistema o requieres cambio de rol?</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setRegRol('reportante');
                  setIsRegisterOpen(true);
                }}
                className="text-xs font-semibold text-amber-400 hover:text-amber-300 underline cursor-pointer"
              >
                Solicitar Validación
              </button>
            </div>

          </div>
        ) : (
          /* CASO B: FORMULARIO DE LOGIN PARA EL ROL SELECCIONADO */
          <div className="space-y-6 max-w-lg mx-auto w-full">
            
            {/* Botón Volver */}
            <button
              onClick={() => setSelectedRole(null)}
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-200 bg-slate-800/70 hover:bg-slate-800 px-3.5 py-2 rounded-xl border border-slate-700/60 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Ver todos los portales</span>
            </button>

            {/* Cabecera del Rol Seleccionado */}
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-400 flex items-center justify-center flex-shrink-0">
                {React.createElement(ROLE_ICONS[selectedRole] || User, { className: 'w-6 h-6' })}
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                  Autenticación de Acceso
                </div>
                <h3 className="text-lg font-bold text-slate-100">
                  {roleInfo?.title}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                  {roleInfo?.description}
                </p>
              </div>
            </div>

            {/* Mensajes de Alerta */}
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            {isSuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span className="font-bold">{successMessage}</span>
              </div>
            )}

            {/* Formulario de Credenciales */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Correo Institucional o Matrícula
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => { setIdentifier(e.target.value); setError(''); }}
                    placeholder="usuario@utmerida.edu.mx o EMP-2026-..."
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950/70 border border-slate-700/60 text-slate-100 placeholder:text-slate-500 text-xs font-medium focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/40 transition-all"
                    autoComplete="username"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Contraseña de Acceso
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(''); }}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-3 rounded-xl bg-slate-950/70 border border-slate-700/60 text-slate-100 placeholder:text-slate-500 text-xs font-medium focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/40 transition-all"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-200 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || isSuccess}
                className="w-full py-3.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-600/25 transition-all duration-200 active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ShieldCheck className="w-4 h-4" />
                )}
                <span>Validar Credenciales y Entrar al Panel</span>
              </button>
            </form>

            {/* Cuentas de Demostración para este Rol */}
            {eligibleUsers.length > 0 && (
              <div className="pt-4 border-t border-slate-800 space-y-2.5">
                <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Cuentas activas autorizadas para este panel:
                </span>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {eligibleUsers.map((u) => (
                    <div 
                      key={u._id}
                      className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="truncate">
                        <div className="font-semibold text-slate-200 truncate">{u.nombre_completo}</div>
                        <div className="text-[11px] text-slate-400 font-mono truncate">
                          {u.correo_institucional}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => handleQuickFill(u)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-[11px] border border-slate-700 transition-colors cursor-pointer"
                        >
                          Usar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDirectLogin(u)}
                          disabled={isSuccess}
                          className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold text-[11px] transition-colors cursor-pointer shadow-sm"
                        >
                          Entrar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Enlace para solicitar registro para este rol */}
            <div className="pt-3 text-center border-t border-slate-800/80">
              <p className="text-xs text-slate-400">
                ¿No cuentas con acceso para este panel?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setRegRol(selectedRole);
                    setIsRegisterOpen(true);
                  }}
                  className="text-amber-400 hover:text-amber-300 font-semibold underline cursor-pointer inline-flex items-center gap-1 ml-1"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Solicitar cuenta de {roleInfo?.title || 'este rol'}</span>
                </button>
              </p>
            </div>

          </div>
        )}

      </div>

      {/* Modal de Solicitud de Registro */}
      {renderRegisterModal()}

    </div>
  );
}
