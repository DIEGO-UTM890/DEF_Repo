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
  Sparkles 
} from 'lucide-react';
import { ROLES_CONFIG } from '../data/mockData';

export default function RoleAuthGate({ 
  targetRole, 
  users, 
  onAuthenticate, 
  onCancel 
}) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const roleInfo = ROLES_CONFIG[targetRole] || {
    id: targetRole,
    title: targetRole,
    description: 'Consola protegida de la plataforma.'
  };

  // Encontrar usuarios demo válidos para este rol
  const eligibleUsers = users.filter(u => u.rol === targetRole && u.activo !== false);

  const handleQuickFill = (user) => {
    setIdentifier(user.correo_institucional);
    setPassword(user.password || 'utm2026');
    setError('');
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

    // Buscar usuario por correo institucional o por matrícula
    const matchedUser = users.find(u => 
      u.correo_institucional?.toLowerCase() === cleanId || 
      u.matricula_o_empleado?.toLowerCase() === cleanId
    );

    if (!matchedUser) {
      setError('Credenciales incorrectas: No se encontró ningún usuario con ese correo o matrícula.');
      return;
    }

    // Validar contraseña de forma flexible
    const validPasswords = [
      (matchedUser.password || '').toLowerCase(),
      'utm2026',
      `${matchedUser.rol}123`.toLowerCase()
    ];

    if (!validPasswords.includes(cleanPass.toLowerCase())) {
      setError(`Contraseña incorrecta. Por favor verifica tus datos (contraseña por defecto: ${matchedUser.password || 'utm2026'}).`);
      return;
    }

    // Validar estado de la cuenta
    if (matchedUser.activo === false) {
      setError('Acceso denegado: Esta cuenta se encuentra inactiva o suspendida en el sistema.');
      return;
    }

    // Autenticación exitosa
    setIsSuccess(true);
    setTimeout(() => {
      onAuthenticate(matchedUser);
    }, 600);
  };

  return (
    <div className="max-w-xl mx-auto py-8 px-4 animate-in fade-in zoom-in-95 duration-200">
      <div className="bg-[#1C1D22] border border-[#2C2D35] rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
        
        {/* Glow decorativo suave */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Encabezado con Icono de Candado */}
        <div className="text-center mb-8 relative">
          <div className="inline-flex p-4 rounded-3xl bg-[#121316] border border-[#2C2D35] text-amber-300 shadow-inner mb-4">
            {isSuccess ? (
              <Unlock className="w-10 h-10 text-[#10B981] animate-bounce" />
            ) : (
              <Lock className="w-10 h-10 text-amber-500" />
            )}
          </div>
          
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#121316] border border-[#2C2D35] text-xs font-bold text-amber-300 uppercase tracking-wider mb-2">
            <span>Acceso Restringido</span>
            <span>•</span>
            <span>Pestaña de {roleInfo.title}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight">
            Validación de Identidad
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-2 max-w-md mx-auto leading-relaxed">
            {roleInfo.description}
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
            <div className="font-bold">¡Acceso autorizado! Entrando a la consola...</div>
          </div>
        )}

        {/* Formulario de Login */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Correo Institucional o Matrícula
            </label>
            <div className="relative">
              <User className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={identifier}
                onChange={(e) => { setIdentifier(e.target.value); setError(''); }}
                placeholder="ej: usuario@utmerida.edu.mx o EMP-2026-..."
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-[#121316] border border-[#2C2D35] text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-500 text-sm font-medium transition-colors"
                autoComplete="username"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Contraseña de Acceso
            </label>
            <div className="relative">
              <KeyRound className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                placeholder="••••••••"
                className="w-full pl-12 pr-12 py-3.5 rounded-2xl bg-[#121316] border border-[#2C2D35] text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-500 text-sm font-medium transition-colors"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-100 transition-colors cursor-pointer"
                aria-label={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSuccess}
            className="w-full py-4 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-black text-sm sm:text-base shadow-lg shadow-amber-600/25 border border-amber-400/30 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <ShieldCheck className="w-5 h-5" />
            <span>Validar Credenciales y Entrar</span>
          </button>
        </form>

        {/* Ayudante de Credenciales para Pruebas / Demostración */}
        {eligibleUsers.length > 0 && (
          <div className="mt-8 pt-6 border-t border-[#2C2D35]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Cuentas autorizadas para este rol:
              </span>
            </div>

            <div className="space-y-2">
              {eligibleUsers.map((u) => (
                <div 
                  key={u._id}
                  className="p-3 rounded-2xl bg-[#121316] border border-[#2C2D35] flex items-center justify-between gap-3 text-xs"
                >
                  <div className="truncate">
                    <div className="font-bold text-slate-100 truncate">{u.nombre_completo}</div>
                    <div className="text-[11px] text-slate-400 font-mono truncate">
                      {u.correo_institucional} • Pass: <span className="text-amber-400 font-bold">{u.password || 'utm2026'}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleQuickFill(u)}
                    className="px-3 py-1.5 rounded-xl bg-[#1C1D22] hover:bg-amber-600 text-amber-300 hover:text-white border border-[#2C2D35] font-bold text-[11px] transition-colors flex-shrink-0 cursor-pointer"
                  >
                    Usar
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
