import React, { useState } from 'react';
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
  Building2
} from 'lucide-react';
import { ROLES_CONFIG } from '../data/mockData';

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
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const roleInfo = selectedRole ? ROLES_CONFIG[selectedRole] : null;

  // Encontrar usuarios demo válidos para el rol seleccionado
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
    setSuccessMessage(`¡Acceso autorizado! Entrando al panel de ${roleInfo?.title || user.rol}...`);
    setTimeout(() => {
      onAuthenticate(user);
    }, 400);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const cleanId = identifier.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!cleanId || !cleanPass) {
      setError('Por favor completa todos los campos de acceso.');
      return;
    }

    // Buscar usuario por correo institucional o por matrícula (tolerante a formato y prefijos)
    const matchedUser = users.find(u => {
      const email = u.correo_institucional?.toLowerCase().trim();
      const matricula = u.matricula_o_empleado?.toLowerCase().trim();
      const matriculaLimpia = matricula?.replace(/[^a-z0-9]/g, '');
      const idLimpio = cleanId.replace(/[^a-z0-9]/g, '');

      return (
        email === cleanId ||
        matricula === cleanId ||
        (matriculaLimpia && matriculaLimpia === idLimpio) ||
        (email && email.split('@')[0] === cleanId)
      );
    });

    if (!matchedUser) {
      setError('Credenciales incorrectas: No se encontró ningún usuario con ese correo o matrícula.');
      return;
    }

    // Validar contraseña de forma flexible (contraseña del usuario, contraseña maestra utm2026 o rol123)
    const validPasswords = [
      (matchedUser.password || '').trim().toLowerCase(),
      'utm2026',
      `${matchedUser.rol}123`.toLowerCase()
    ];

    if (!validPasswords.includes(cleanPass.toLowerCase())) {
      setError(`Contraseña incorrecta. Verifica tus datos o usa la contraseña "${matchedUser.password || 'utm2026'}".`);
      return;
    }

    // Validar estado de la cuenta
    if (matchedUser.activo === false) {
      setError('Acceso denegado: Esta cuenta se encuentra suspendida o inactiva en el sistema.');
      return;
    }

    // Autenticación exitosa
    setIsSuccess(true);
    const destinationTitle = ROLES_CONFIG[matchedUser.rol]?.title || matchedUser.rol;
    setSuccessMessage(`¡Acceso autorizado! Entrando al panel de ${destinationTitle}...`);
    
    setTimeout(() => {
      onAuthenticate(matchedUser);
    }, 400);
  };

  // VISTA 1: Selector de Portales de Roles Institucionales (Diseño original restaurado)
  if (!selectedRole) {
    return (
      <div className="max-w-6xl mx-auto py-8 px-4 animate-in fade-in duration-200">
        
        {/* Banner de Bienvenida y Seguridad */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#161D2B] border border-[#2A3447] text-xs font-bold text-[#818CF8] uppercase tracking-wider mb-4 shadow-sm">
            <Lock className="w-3.5 h-3.5 text-[#4F46E5]" />
            <span>Sistema Seguro de Incidencias • UTM Campus Mérida</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-[#F1F5F9] tracking-tight leading-tight">
            Portales de Acceso por Rol
          </h1>
          <p className="text-[#94A3B8] text-sm sm:text-base mt-3 leading-relaxed">
            Para proteger la privacidad y garantizar la trazabilidad de los expedientes, cada panel cuenta con acciones especializadas y requiere inicio de sesión con tus credenciales institucionales.
          </p>
        </div>

        {/* Cuadrícula de Paneles de Roles */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Object.entries(ROLES_CONFIG).map(([key, config]) => {
            const Icon = ROLE_ICONS[key] || User;

            return (
              <div
                key={key}
                onClick={() => handleSelectRole(key)}
                className="group p-6 bg-[#161D2B] rounded-3xl border border-[#2A3447] hover:border-[#4F46E5] shadow-xl hover:shadow-2xl transition-all duration-200 cursor-pointer flex flex-col justify-between relative overflow-hidden"
              >
                {/* Glow decorativo al hover */}
                <div className="absolute -top-12 -right-12 w-28 h-28 bg-[#4F46E5]/10 group-hover:bg-[#4F46E5]/20 rounded-full blur-2xl transition-all"></div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#1E293B] border border-[#2A3447] group-hover:border-[#4F46E5]/40 text-[#818CF8] flex items-center justify-center transition-colors">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#0B0F17] border border-[#2A3447] text-[#94A3B8]">
                      <Lock className="w-3 h-3 text-[#94A3B8]" />
                      <span>Protegido</span>
                    </span>
                  </div>

                  <h3 className="text-xl font-black text-[#F1F5F9] group-hover:text-[#818CF8] transition-colors mb-2">
                    {config.title}
                  </h3>

                  <p className="text-[#94A3B8] text-xs leading-relaxed mb-6">
                    {config.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#2A3447] flex items-center justify-between">
                  <span className="text-xs font-bold text-[#818CF8] group-hover:text-[#F1F5F9] transition-colors flex items-center gap-1.5">
                    <span>Iniciar Sesión</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                    req. contraseña
                  </span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    );
  }

  // VISTA 2: Formulario de Login Individual para el Rol Seleccionado
  const RoleIcon = ROLE_ICONS[selectedRole] || User;

  return (
    <div className="max-w-xl mx-auto py-8 px-4 animate-in fade-in zoom-in-95 duration-200">
      
      {/* Botón para regresar a la selección de roles */}
      <button
        onClick={() => setSelectedRole(null)}
        className="mb-6 inline-flex items-center gap-2 text-xs font-bold text-[#94A3B8] hover:text-[#F1F5F9] bg-[#161D2B] px-4 py-2.5 rounded-2xl border border-[#2A3447] hover:border-[#4F46E5] transition-all cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Volver a la selección de roles</span>
      </button>

      <div className="bg-[#161D2B] border border-[#2A3447] rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
        
        {/* Glow decorativo suave */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#4F46E5]/15 rounded-full blur-3xl pointer-events-none"></div>

        {/* Encabezado con Icono del Rol */}
        <div className="text-center mb-8 relative">
          <div className="inline-flex p-4 rounded-3xl bg-[#1E293B] border border-[#2A3447] text-[#818CF8] shadow-inner mb-4">
            {isSuccess ? (
              <Unlock className="w-10 h-10 text-[#10B981] animate-bounce" />
            ) : (
              <RoleIcon className="w-10 h-10 text-[#4F46E5]" />
            )}
          </div>
          
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1E293B] border border-[#2A3447] text-xs font-bold text-[#818CF8] uppercase tracking-wider mb-2">
            <span>Acceso al Panel</span>
            <span>•</span>
            <span>{roleInfo?.title}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-[#F1F5F9] tracking-tight">
            Autenticación de Acceso
          </h2>
          <p className="text-[#94A3B8] text-xs sm:text-sm mt-2 max-w-md mx-auto leading-relaxed">
            {roleInfo?.description}
          </p>
        </div>

        {/* Mensaje de Error */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
            <div className="leading-relaxed font-medium">{error}</div>
          </div>
        )}

        {/* Mensaje de Éxito */}
        {isSuccess && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-950/40 border border-[#10B981]/50 text-emerald-300 text-xs flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-[#10B981] flex-shrink-0" />
            <div className="font-bold">{successMessage || `¡Acceso autorizado! Entrando al panel de ${roleInfo?.title}...`}</div>
          </div>
        )}

        {/* Formulario de Login */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#94A3B8] mb-2">
              Correo Institucional o Matrícula
            </label>
            <div className="relative">
              <User className="w-5 h-5 text-[#94A3B8] absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={identifier}
                onChange={(e) => { setIdentifier(e.target.value); setError(''); }}
                placeholder="ej: usuario@utmerida.edu.mx o DOC-2026-..."
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-[#0B0F17] border border-[#2A3447] text-[#F1F5F9] placeholder:text-slate-600 focus:outline-none focus:border-[#4F46E5] text-sm font-medium transition-colors"
                autoComplete="username"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#94A3B8] mb-2">
              Contraseña de Acceso
            </label>
            <div className="relative">
              <KeyRound className="w-5 h-5 text-[#94A3B8] absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                placeholder="••••••••"
                className="w-full pl-12 pr-12 py-3.5 rounded-2xl bg-[#0B0F17] border border-[#2A3447] text-[#F1F5F9] placeholder:text-slate-600 focus:outline-none focus:border-[#4F46E5] text-sm font-medium transition-colors"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#F1F5F9] transition-colors cursor-pointer"
                aria-label={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSuccess}
            className="w-full py-4 rounded-2xl bg-[#4F46E5] hover:bg-[#4338CA] text-[#F1F5F9] font-black text-sm sm:text-base shadow-lg shadow-[#4F46E5]/25 border border-[#6366F1]/30 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <ShieldCheck className="w-5 h-5" />
            <span>Validar Credenciales y Entrar al Panel</span>
          </button>
        </form>

        {/* Cuentas de Demostración para este Rol */}
        {eligibleUsers.length > 0 && (
          <div className="mt-8 pt-6 border-t border-[#2A3447]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-[#94A3B8] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Cuentas autorizadas para este panel:
              </span>
            </div>

            <div className="space-y-2.5">
              {eligibleUsers.map((u) => (
                <div 
                  key={u._id}
                  className="p-3.5 rounded-2xl bg-[#0B0F17]/90 border border-[#2A3447] flex items-center justify-between gap-3 text-xs"
                >
                  <div className="truncate">
                    <div className="font-bold text-[#F1F5F9] truncate">{u.nombre_completo}</div>
                    <div className="text-[11px] text-[#94A3B8] font-mono truncate">
                      {u.correo_institucional}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Contraseña: <span className="text-amber-400 font-bold font-mono">{u.password || 'utm2026'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => handleQuickFill(u)}
                      className="px-3 py-1.5 rounded-xl bg-[#1E293B] hover:bg-[#2A3447] text-[#818CF8] hover:text-[#F1F5F9] border border-[#2A3447] font-bold text-[11px] transition-colors cursor-pointer"
                    >
                      Usar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDirectLogin(u)}
                      disabled={isSuccess}
                      className="px-3 py-1.5 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-[#F1F5F9] font-bold text-[11px] transition-colors cursor-pointer shadow-sm"
                    >
                      Entrar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
