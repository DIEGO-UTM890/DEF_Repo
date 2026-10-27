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
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-[#161D2B]/90 backdrop-blur-md border-b border-slate-200 dark:border-[#2A3447] shadow-sm transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo y Nombre Institucional */}
          <div 
            className="flex items-center gap-3 cursor-pointer" 
            onClick={() => setCurrentTab('role_dashboard')}
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#4F46E5] to-[#4338CA] flex items-center justify-center text-[#F1F5F9] shadow-md shadow-[#4F46E5]/25 border border-[#6366F1]/30">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-[#F1F5F9]">
                  UTM<span className="text-[#4F46E5] dark:text-[#818CF8]">Desk</span>
                </span>
                <span className="hidden sm:inline-block text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#1E293B] text-[#818CF8] border border-[#2A3447]">
                  Campus Mérida
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-[#94A3B8] font-medium hidden sm:block">
                Mesa Central de Incidencias Universitarias
              </p>
            </div>
          </div>

          {/* Navegación Desktop (SOLO visible si hay sesión activa) */}
          {activeUser && (
            <nav className="hidden md:flex items-center gap-1.5 bg-[#0B0F17] p-1.5 rounded-2xl border border-[#2A3447]">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentTab(item.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 cursor-pointer ${
                      item.isHighlight && !isActive
                        ? 'bg-[#4F46E5] hover:bg-[#4338CA] text-[#F1F5F9] shadow-sm'
                        : isActive
                        ? 'bg-[#161D2B] text-[#818CF8] shadow-sm border border-[#2A3447]'
                        : 'text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#161D2B]'
                    }`}
                    aria-label={item.label}
                  >
                    <Icon className={`w-4 h-4 ${item.isHighlight && !isActive ? 'text-[#F1F5F9]' : ''}`} />
                    <span>{item.label}</span>
                    {item.badge !== undefined && (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#1E293B] text-[#94A3B8] border border-[#2A3447]">
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
              className="p-3 rounded-2xl text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#1E293B] border border-[#2A3447] transition-transform active:scale-95 cursor-pointer"
              title={theme === 'dark' ? 'Cambiar a Tema Claro' : 'Cambiar a Tema Oscuro'}
              aria-label="Alternar tema"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-amber-400" />
              ) : (
                <Moon className="w-5 h-5 text-slate-700" />
              )}
            </button>

            {/* Panel Superior Derecho: Sin menús desplegables que estorben */}
            {activeUser ? (
              <div className="flex items-center gap-2">
                
                {/* Cuadro de Perfil Estático (No desplegable) */}
                <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-[#0B0F17] border border-[#2A3447]">
                  <UserCircle2 className="w-5 h-5 text-[#10B981] flex-shrink-0" />
                  <div className="text-left">
                    <div className="text-[10px] text-[#94A3B8] uppercase tracking-wider font-bold flex items-center gap-1">
                      <span>Sesión Activa</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse"></span>
                    </div>
                    <div className="font-bold text-[#F1F5F9] text-xs max-w-[120px] sm:max-w-[180px] truncate">
                      {activeUser.nombre_completo}
                    </div>
                  </div>
                  <span className="hidden sm:inline-block text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#1E293B] text-[#818CF8] border border-[#2A3447]">
                    {roleConfig?.title?.split(' ')[0]}
                  </span>
                </div>

                {/* Botón Directo para Cerrar Sesión y salir al portal */}
                <button
                  onClick={onLogout}
                  className="px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-2xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                  title="Cerrar Sesión y volver al portal de roles"
                >
                  <LogOut className="w-4 h-4 text-rose-400" />
                  <span className="hidden sm:inline">Cerrar Sesión</span>
                </button>

              </div>
            ) : (
              /* Estado cuando no hay sesión */
              <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-[#0B0F17] border border-[#2A3447] text-xs font-bold text-[#94A3B8]">
                <Lock className="w-4 h-4 text-amber-400" />
                <span>Sin sesión activa</span>
              </div>
            )}

          </div>

        </div>
      </div>
    </header>
  );
}
