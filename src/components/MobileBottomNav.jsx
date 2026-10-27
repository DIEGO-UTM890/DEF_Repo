import React from 'react';
import { 
  ShieldAlert,
  ListOrdered, 
  PlusCircle, 
  BarChart3, 
  Users 
} from 'lucide-react';
import { ROLES_CONFIG } from '../data/mockData';

export default function MobileBottomNav({ 
  currentTab, 
  setCurrentTab, 
  currentRole,
  incidentsCount
}) {
  const roleConfig = ROLES_CONFIG[currentRole] || ROLES_CONFIG.reportante;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 px-3 py-2 flex items-center justify-around shadow-2xl">
      
      {/* Consola de Rol */}
      <button
        onClick={() => setCurrentTab('role_dashboard')}
        className={`flex flex-col items-center justify-center p-2 rounded-2xl flex-1 transition-all ${
          currentTab === 'role_dashboard'
            ? 'text-blue-600 dark:text-blue-400 font-bold'
            : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
        }`}
      >
        <ShieldAlert className="w-5 h-5" />
        <span className="text-[11px] mt-1">Consola</span>
      </button>

      {/* Incidencias */}
      <button
        onClick={() => setCurrentTab('list')}
        className={`flex flex-col items-center justify-center p-2 rounded-2xl flex-1 transition-all ${
          currentTab === 'list'
            ? 'text-blue-600 dark:text-blue-400 font-bold'
            : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
        }`}
      >
        <div className="relative">
          <ListOrdered className="w-5 h-5" />
          {incidentsCount > 0 && (
            <span className="absolute -top-1.5 -right-2 w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] font-bold flex items-center justify-center">
              {incidentsCount}
            </span>
          )}
        </div>
        <span className="text-[11px] mt-1">Tickets</span>
      </button>

      {/* Nuevo Reporte Botón Destacado */}
      {roleConfig.canCreate && (
        <button
          onClick={() => setCurrentTab('new')}
          className="flex flex-col items-center justify-center px-4 py-1.5 -mt-4 rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/30 active:scale-95 transition-transform"
        >
          <PlusCircle className="w-6 h-6" />
          <span className="text-[11px] font-bold mt-0.5">Reportar</span>
        </button>
      )}

      {/* Estadísticas */}
      {roleConfig.canViewStats && (
        <button
          onClick={() => setCurrentTab('stats')}
          className={`flex flex-col items-center justify-center p-2 rounded-2xl flex-1 transition-all ${
            currentTab === 'stats'
              ? 'text-blue-600 dark:text-blue-400 font-bold'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <BarChart3 className="w-5 h-5" />
          <span className="text-[11px] mt-1">Métricas</span>
        </button>
      )}

      {/* Gestión Usuarios */}
      {roleConfig.canManageUsers && (
        <button
          onClick={() => setCurrentTab('users')}
          className={`flex flex-col items-center justify-center p-2 rounded-2xl flex-1 transition-all ${
            currentTab === 'users'
              ? 'text-blue-600 dark:text-blue-400 font-bold'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Users className="w-5 h-5" />
          <span className="text-[11px] mt-1">Usuarios</span>
        </button>
      )}

    </div>
  );
}
