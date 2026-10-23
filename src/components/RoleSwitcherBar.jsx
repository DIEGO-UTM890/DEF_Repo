import React from 'react';
import { ROLES_CONFIG } from '../data/mockData';
import { 
  User, 
  Wrench, 
  ClipboardCheck, 
  BarChart3, 
  ShieldCheck, 
  Sparkles,
  Zap
} from 'lucide-react';

const ROLE_ICONS = {
  reportante: User,
  tecnico: Wrench,
  coordinador: ClipboardCheck,
  directivo: BarChart3,
  admin: ShieldCheck,
  superadmin: Zap
};

export default function RoleSwitcherBar({ currentRole, setCurrentRole }) {
  return (
    <aside aria-label="Selector de Perfil en Simulación" className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 rounded-3xl p-3 sm:p-4 mb-6 shadow-sm">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
        
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-sm">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] font-black uppercase tracking-wider text-slate-400">
              Simulador de Vistas Especializadas (UTM Desk)
            </div>
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Haz clic en cualquier rol para transformar la app a su interfaz dedicada:
            </div>
          </div>
        </div>

        {/* Botones de Roles Directos con Propósito Claro */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:flex items-center gap-1.5 w-full lg:w-auto">
          {Object.entries(ROLES_CONFIG).map(([key, config]) => {
            const Icon = ROLE_ICONS[key] || User;
            const isSelected = currentRole === key;

            return (
              <button
                key={key}
                onClick={() => setCurrentRole(key)}
                className={`flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all duration-150 active:scale-95 ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25 ring-2 ring-blue-500/20'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700/80'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-500'}`} />
                <span>{config.title.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>

      </div>
    </aside>
  );
}
