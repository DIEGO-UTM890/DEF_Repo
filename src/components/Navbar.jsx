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
  Building2,
  ChevronDown
} from 'lucide-react';
import { ROLES_CONFIG } from '../data/mockData';

export default function Navbar({ 
  currentTab, 
  setCurrentTab, 
  theme, 
  setTheme, 
  currentRole, 
  setCurrentRole,
  incidentsCount
}) {
  const roleConfig = ROLES_CONFIG[currentRole] || ROLES_CONFIG.reportante;

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const navItems = [
    { id: 'list', label: 'Incidencias', icon: ListOrdered, badge: incidentsCount },
    ...(roleConfig.canCreate ? [{ id: 'new', label: 'Nuevo Reporte', icon: PlusCircle, isHighlight: true }] : []),
    ...(roleConfig.canViewStats ? [{ id: 'stats', label: 'Estadísticas', icon: BarChart3 }] : []),
    ...(roleConfig.canManageUsers ? [{ id: 'users', label: 'Gestión Usuarios', icon: Users }] : []),
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo y Nombre Institucional */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentTab('list')}>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/25 ring-2 ring-blue-500/20">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  UTM<span className="text-blue-600 dark:text-blue-400">Desk</span>
                </span>
                <span className="hidden sm:inline-block text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  Campus Mérida
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
                Mesa Central de Incidencias Universitarias
              </p>
            </div>
          </div>

          {/* Navegación Desktop */}
          <nav className="hidden md:flex items-center gap-1.5 bg-slate-100/80 dark:bg-slate-800/80 p-1.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
                    item.isHighlight && !isActive
                      ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                      : isActive
                      ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-700/50'
                  }`}
                  aria-label={item.label}
                >
                  <Icon className={`w-4 h-4 ${item.isHighlight && !isActive ? 'text-white' : ''}`} />
                  <span>{item.label}</span>
                  {item.badge !== undefined && (
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Controles de Accesibilidad y Perfil */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Selector de Tema */}
            <button
              onClick={toggleTheme}
              className="p-3 rounded-2xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 transition-transform active:scale-95"
              title={theme === 'dark' ? 'Cambiar a Tema Claro' : 'Cambiar a Tema Oscuro'}
              aria-label="Alternar tema"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-amber-400" />
              ) : (
                <Moon className="w-5 h-5 text-slate-700" />
              )}
            </button>

            {/* Selector de Rol interactivo para probar los perfiles */}
            <div className="relative group">
              <div className="flex items-center gap-2 px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-medium">
                <UserCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <div className="hidden sm:block text-left">
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold">
                    Rol en Simulación
                  </div>
                  <div className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1">
                    {roleConfig.title}
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </div>
                <select
                  value={currentRole}
                  onChange={(e) => setCurrentRole(e.target.value)}
                  className="sm:hidden bg-transparent font-bold text-slate-800 dark:text-slate-100 outline-none"
                  aria-label="Seleccionar rol"
                >
                  {Object.entries(ROLES_CONFIG).map(([key, val]) => (
                    <option key={key} value={key} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                      {val.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Menú desplegable en desktop al hacer hover o clic */}
              <div className="hidden sm:group-hover:block absolute right-0 mt-1 w-64 p-2 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                  Cambiar Rol de Prueba
                </div>
                <div className="mt-1 space-y-1">
                  {Object.entries(ROLES_CONFIG).map(([key, val]) => (
                    <button
                      key={key}
                      onClick={() => setCurrentRole(key)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors flex items-center justify-between ${
                        currentRole === key
                          ? 'bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 font-bold'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span>{val.title}</span>
                      {currentRole === key && (
                        <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </header>
  );
}
