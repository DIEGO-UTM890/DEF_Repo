import React from 'react';
import { ROLES_CONFIG } from '../data/mockData';
import { 
  User, 
  Wrench, 
  ClipboardCheck, 
  BarChart3, 
  ShieldCheck, 
  Sparkles,
  Zap,
  Lock,
  Unlock,
  LogOut,
  Shield
} from 'lucide-react';

const ROLE_ICONS = {
  reportante: User,
  tecnico: Wrench,
  coordinador: ClipboardCheck,
  directivo: BarChart3,
  admin: ShieldCheck,
  superadmin: Zap
};

export default function RoleSwitcherBar({ 
  currentRole, 
  setCurrentRole, 
  authenticatedUsers = {}, 
  onLogoutRole 
}) {
  const currentAuthUser = authenticatedUsers[currentRole];

  return (
    <aside aria-label="Pestañas de Roles Institucionales" className="bg-[#161D2B] border border-[#2A3447] rounded-3xl p-4 sm:p-5 mb-6 shadow-xl transition-colors">
      <div className="flex flex-col gap-4">
        
        {/* Cabecera de Pestañas con Descripción */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#4F46E5]/20 border border-[#4F46E5]/40 flex items-center justify-center text-[#818CF8]">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-black uppercase tracking-wider text-[#94A3B8]">
                Pestañas de Roles Protegidos por Contraseña
              </div>
              <div className="text-xs sm:text-sm font-bold text-[#F1F5F9]">
                Cada rol cuenta con acciones exclusivas y requiere validación de acceso:
              </div>
            </div>
          </div>

          {/* Información de Sesión Activa si está autenticado */}
          {currentAuthUser && (
            <div className="flex items-center gap-3 bg-[#0B0F17] px-3.5 py-1.5 rounded-2xl border border-[#2A3447] text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
                <span className="text-[#94A3B8]">Sesión:</span>
                <span className="font-bold text-[#F1F5F9] max-w-[140px] truncate">{currentAuthUser.nombre_completo}</span>
              </div>
              <button
                onClick={() => onLogoutRole(currentRole)}
                className="text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1 hover:underline ml-1 cursor-pointer"
                title="Cerrar sesión de este rol"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Bloquear</span>
              </button>
            </div>
          )}
        </div>

        {/* Pestañas de Cada Rol con Estado de Candado */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {Object.entries(ROLES_CONFIG).map(([key, config]) => {
            const Icon = ROLE_ICONS[key] || User;
            const isSelected = currentRole === key;
            const isAuth = !!authenticatedUsers[key];

            return (
              <button
                key={key}
                onClick={() => setCurrentRole(key)}
                className={`flex items-center justify-between p-3 rounded-2xl text-xs font-bold transition-all duration-150 border cursor-pointer active:scale-95 ${
                  isSelected
                    ? 'bg-[#4F46E5] text-[#F1F5F9] border-[#6366F1]/50 shadow-lg shadow-[#4F46E5]/25 ring-2 ring-[#4F46E5]/20'
                    : isAuth
                    ? 'bg-[#1E293B] text-[#F1F5F9] border-[#2A3447] hover:border-[#4F46E5]/60 hover:bg-[#161D2B]'
                    : 'bg-[#0B0F17]/80 text-[#94A3B8] border-[#2A3447] hover:text-[#F1F5F9] hover:bg-[#1E293B]'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <Icon className={`w-4 h-4 flex-shrink-0 ${isSelected ? 'text-[#F1F5F9]' : isAuth ? 'text-[#10B981]' : 'text-[#94A3B8]'}`} />
                  <span className="truncate">{config.title.split(' ')[0]}</span>
                </div>

                <div className="ml-1 flex-shrink-0">
                  {isAuth ? (
                    <span className="inline-flex p-1 rounded-full bg-[#10B981]/20 text-[#10B981]" title="Sesión activa y validada">
                      <Unlock className="w-3 h-3" />
                    </span>
                  ) : (
                    <span className="inline-flex p-1 rounded-full bg-[#2A3447] text-[#94A3B8]" title="Requiere contraseña">
                      <Lock className="w-3 h-3" />
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

      </div>
    </aside>
  );
}
