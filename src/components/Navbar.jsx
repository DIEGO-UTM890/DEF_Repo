import React from 'react';
import { 
  ShieldAlert, 
  Sun, 
  Moon, 
  PlusCircle, 
  ListOrdered, 
  BarChart3, 
  Users, 
  UserCircle2, 
  Lock,
  LogOut,
  LayoutDashboard
} from 'lucide-react';
import { ROLES_CONFIG } from '../data/mockData';

export default function Navbar({ 
  currentTab, 
  setCurrentTab, 
  theme, 
  setTheme, 
  activeUser,
  incidentsCount,
  onLogout
}) {
  const roleConfig = activeUser ? (ROLES_CONFIG[activeUser.rol] || ROLES_CONFIG.reportante) : null;

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  // Rutas disponibles solo cuando hay una sesión activa validada
  const navItems = activeUser ? [
    { id: 'role_dashboard', label: 'Mi Consola', icon: LayoutDashboard },
    { id: 'list', label: 'Incidencias', icon: ListOrdered, badge: incidentsCount },
    ...(roleConfig?.canCreate ? [{ id: 'new', label: 'Nuevo Reporte', icon: PlusCircle, isHighlight: true }] : []),
    ...(roleConfig?.canViewStats ? [{ id: 'stats', label: 'Estadísticas', icon: BarChart3 }] : []),
    ...(roleConfig?.canManageUsers ? [{ id: 'users', label: 'Gestión Usuarios', icon: Users }] : []),
  ] : [];

  return (
    <header className="sticky top-0 z-40 bg-[#121316]/90 backdrop-blur-xl border-b border-slate-800/80 shadow-sm transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo y Nombre Institucional */}
          <div 
            className="flex items-center gap-3 cursor-pointer" 
            onClick={() => setCurrentTab('role_dashboard')}
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-amber-600/20 border border-amber-400/30">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-100">
                  UTM<span className="text-amber-400">Desk</span>
                </span>
                <span className="hidden sm:inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-900 text-amber-300 border border-slate-800">
                  Campus Mérida
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                Mesa Central de Incidencias & Servicios
              </p>
            </div>
          </div>

          {/* Navegación Desktop (SOLO visible si hay sesión activa) */}
          {activeUser && (
            <nav className="hidden md:flex items-center gap-1.5 bg-[#121316] p-1.5 rounded-2xl border border-slate-800">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentTab(item.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                      item.isHighlight && !isActive
                        ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-md shadow-amber-600/20'
                        : isActive
                        ? 'bg-slate-800 text-amber-300 shadow-sm border border-slate-700/60'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                    }`}
                    aria-label={item.label}
                  >
                    <Icon className={`w-4 h-4 ${item.isHighlight && !isActive ? 'text-white' : ''}`} />
                    <span>{item.label}</span>
                    {item.badge !== undefined && (
                      <span className="text-[11px] font-bold px-1.5 py-0.2 rounded-full bg-slate-900 text-slate-300 border border-slate-700">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          )}

          {/* Controles de Accesibilidad y Estado de Sesión */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Selector de Tema */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800 transition-all active:scale-95 cursor-pointer"
              title={theme === 'dark' ? 'Cambiar a Tema Claro' : 'Cambiar a Tema Oscuro'}
              aria-label="Alternar tema"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-slate-400 hover:text-amber-300" />
              ) : (
                <Moon className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {/* Panel Superior Derecho */}
            {activeUser ? (
              <div className="flex items-center gap-2">
                
                {/* Cuadro de Perfil Estático */}
                <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800">
                  <UserCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <div className="text-left">
                    <div className="text-[9px] text-slate-400 uppercase tracking-wider font-bold flex items-center gap-1">
                      <span>Sesión Activa</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    </div>
                    <div className="font-bold text-slate-200 text-xs max-w-[120px] sm:max-w-[180px] truncate">
                      {activeUser.nombre_completo}
                    </div>
                  </div>
                  <span className="hidden sm:inline-block text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-800 text-amber-300 border border-slate-700">
                    {roleConfig?.title?.split(' ')[0]}
                  </span>
                </div>

                {/* Botón Directo para Cerrar Sesión */}
                <button
                  onClick={onLogout}
                  className="px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                  title="Cerrar Sesión y volver al portal de roles"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-400" />
                  <span className="hidden sm:inline">Cerrar Sesión</span>
                </button>

              </div>
            ) : (
              /* Estado cuando no hay sesión */
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-400">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>Acceso Protegido</span>
              </div>
            )}

          </div>

        </div>
      </div>
    </header>
  );
}
