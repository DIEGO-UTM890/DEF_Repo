import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import ReportForm from './components/ReportForm';
import IncidentList from './components/IncidentList';
import IncidentDetailModal from './components/IncidentDetailModal';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import UserManagement from './components/UserManagement';
import MobileBottomNav from './components/MobileBottomNav';
import RolePortalLogin from './components/RolePortalLogin';

// Vistas dedicadas por Rol
import ReportanteDashboard from './components/views/ReportanteDashboard';
import TecnicoDashboard from './components/views/TecnicoDashboard';
import CoordinadorDashboard from './components/views/CoordinadorDashboard';
import DirectivoDashboard from './components/views/DirectivoDashboard';
import AdminDashboard from './components/views/AdminDashboard';
import SuperAdminDashboard from './components/views/SuperAdminDashboard';

import { INITIAL_INCIDENTS, INITIAL_USERS, ROLES_CONFIG } from './data/mockData';
import { logout as authLogout } from './services/auth.service';
import { Database, Server, HardDrive } from 'lucide-react';

export default function App() {
  // Manejo del Tema Claro / Oscuro con persistencia
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('utmdesk_theme') || 'dark';
  });

  // Usuario autenticado activo en el sistema (null si no ha iniciado sesión)
  const [activeUser, setActiveUser] = useState(() => {
    const saved = localStorage.getItem('utmdesk_active_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return null;
  });

  // Rol activo derivado del usuario logueado o por defecto reportante
  const currentRole = activeUser?.rol || 'reportante';

  // Pestaña actual: 'role_dashboard' (consola del rol) | 'list' | 'new' | 'stats' | 'users'
  const [currentTab, setCurrentTab] = useState('role_dashboard');

  // Estado de Incidencias con persistencia local
  const [incidents, setIncidents] = useState(() => {
    const saved = localStorage.getItem('utmdesk_incidents');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_INCIDENTS;
  });

  // Estado de Usuarios con persistencia local y auto-reparación de credenciales
  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem('utmdesk_users');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const existingIds = new Set(parsed.map(u => u._id));
          const existingEmails = new Set(parsed.map(u => u.correo_institucional?.toLowerCase()));

          const updated = parsed.map(u => {
            const initial = INITIAL_USERS.find(iu => 
              iu._id === u._id || 
              iu.correo_institucional?.toLowerCase() === u.correo_institucional?.toLowerCase()
            );
            return {
              ...u,
              password: initial?.password || u.password || 'utm2026',
              activo: u.activo !== false
            };
          });

          // Asegurar que todos los roles demo de INITIAL_USERS estén disponibles
          INITIAL_USERS.forEach(iu => {
            if (!existingIds.has(iu._id) && !existingEmails.has(iu.correo_institucional?.toLowerCase())) {
              updated.push(iu);
            }
          });

          return updated;
        }
      } catch (e) {
        console.error('Error al leer usuarios de localStorage:', e);
      }
    }
    return INITIAL_USERS;
  });

  // Incidencia seleccionada para el modal de detalle
  const [selectedIncident, setSelectedIncident] = useState(null);

  // Sincronizar tema con elemento <html>
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('utmdesk_theme', theme);
  }, [theme]);

  // Persistir incidencias y usuarios
  useEffect(() => {
    localStorage.setItem('utmdesk_incidents', JSON.stringify(incidents));
  }, [incidents]);

  useEffect(() => {
    localStorage.setItem('utmdesk_users', JSON.stringify(users));
  }, [users]);

  // Persistir usuario activo
  useEffect(() => {
    if (activeUser) {
      localStorage.setItem('utmdesk_active_user', JSON.stringify(activeUser));
    } else {
      localStorage.removeItem('utmdesk_active_user');
    }
  }, [activeUser]);

  // Iniciar sesión con un usuario validado
  const handleAuthenticate = (user) => {
    setActiveUser(user);
    setCurrentTab('role_dashboard');
  };

  // Cerrar sesión y regresar al portal de acceso por roles
  const handleLogout = () => {
    // Limpiar JWT del localStorage
    localStorage.removeItem('utmdesk_jwt');
    setActiveUser(null);
    setCurrentTab('role_dashboard');
    setSelectedIncident(null);
  };

  // Escuchar el evento global de logout forzado por JWT expirado (disparado desde api.js)
  useEffect(() => {
    const onForceLogout = () => {
      setActiveUser(null);
      setCurrentTab('role_dashboard');
      setSelectedIncident(null);
    };
    window.addEventListener('utmdesk:logout', onForceLogout);
    return () => window.removeEventListener('utmdesk:logout', onForceLogout);
  }, []);

  // Agregar nuevo reporte
  const handleAddIncident = (newIncident) => {
    setIncidents(prev => [newIncident, ...prev]);
  };

  // Actualizar reporte existente
  const handleUpdateIncident = (updatedIncident) => {
    setIncidents(prev => prev.map(inc => inc._id === updatedIncident._id ? updatedIncident : inc));
    setSelectedIncident(updatedIncident);
  };

  return (
    <div className="min-h-screen bg-[#121316] text-[#F0F1F5] flex flex-col font-sans transition-colors duration-200 selection:bg-amber-500/25 selection:text-white">
      
      {/* Barra de Navegación Principal */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        theme={theme}
        setTheme={setTheme}
        activeUser={activeUser}
        incidentsCount={incidents.length}
        onLogout={handleLogout}
      />

      {/* Contenido Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-20 md:pb-12">
        
        {/* ============================================================== */}
        {/* CASO 1: SIN SESIÓN ACTIVA (BLOQUEO TOTAL) */}
        {/* Muestra únicamente los Portales de Acceso y Login por Rol */}
        {/* ============================================================== */}
        {!activeUser ? (
          <RolePortalLogin
            users={users}
            onAuthenticate={handleAuthenticate}
            onResetDemoData={() => {
              setUsers(INITIAL_USERS);
              localStorage.setItem('utmdesk_users', JSON.stringify(INITIAL_USERS));
            }}
          />
        ) : (
          /* ============================================================== */
          /* CASO 2: SESIÓN AUTENTICADA (ACCESO AL PANEL DEL ROL) */
          /* ============================================================== */
          <>
            {/* 1. Vista de Formulario de Nuevo Reporte */}
            {currentTab === 'new' && (
              <ReportForm
                onAddIncident={handleAddIncident}
                onCancel={() => setCurrentTab('role_dashboard')}
                currentRoleUser={activeUser}
              />
            )}

            {/* 2. Vista de Explorador General de Incidencias */}
            {currentTab === 'list' && (
              <IncidentList
                incidents={incidents}
                onSelectIncident={setSelectedIncident}
                onNewIncident={() => setCurrentTab('new')}
                currentRole={currentRole}
                currentRoleUser={activeUser}
              />
            )}

            {/* 3. Vista General de Estadísticas */}
            {currentTab === 'stats' && (
              <AnalyticsDashboard
                incidents={incidents}
              />
            )}

            {/* 4. Vista General de Gestión de Usuarios */}
            {currentTab === 'users' && (
              <UserManagement
                users={users}
                onUpdateUsers={setUsers}
                currentUser={activeUser}
              />
            )}

            {/* 5. INTERFACES ESPECIALIZADAS POR ROL */}
            {currentTab === 'role_dashboard' && (
              <>
                {/* Interfaz Rol 1: Reportante */}
                {currentRole === 'reportante' && (
                  <ReportanteDashboard
                    incidents={incidents}
                    onNewIncident={() => setCurrentTab('new')}
                    onSelectIncident={setSelectedIncident}
                    currentUser={activeUser}
                  />
                )}

                {/* Interfaz Rol 2: Técnico Operativo */}
                {currentRole === 'tecnico' && (
                  <TecnicoDashboard
                    incidents={incidents}
                    onSelectIncident={setSelectedIncident}
                    onNewIncident={() => setCurrentTab('new')}
                    currentUser={activeUser}
                  />
                )}

                {/* Interfaz Rol 3: Coordinador */}
                {currentRole === 'coordinador' && (
                  <CoordinadorDashboard
                    incidents={incidents}
                    onSelectIncident={setSelectedIncident}
                    onUpdateIncident={handleUpdateIncident}
                    currentUser={activeUser}
                  />
                )}

                {/* Interfaz Rol 4: Directivo */}
                {currentRole === 'directivo' && (
                  <DirectivoDashboard
                    incidents={incidents}
                    currentUser={activeUser}
                  />
                )}

                {/* Interfaz Rol 5: Administrador del Sistema */}
                {currentRole === 'admin' && (
                  <AdminDashboard
                    users={users}
                    onUpdateUsers={setUsers}
                    currentUser={activeUser}
                  />
                )}

                {/* Interfaz Rol 6: Super Admin */}
                {currentRole === 'superadmin' && (
                  <SuperAdminDashboard
                    incidents={incidents}
                    users={users}
                  />
                )}
              </>
            )}
          </>
        )}

      </main>

      {/* Modal de Detalle de Incidencia / Expediente (Solo accesible si hay sesión) */}
      {activeUser && selectedIncident && (
        <IncidentDetailModal
          incident={selectedIncident}
          onClose={() => setSelectedIncident(null)}
          onUpdateIncident={handleUpdateIncident}
          currentRole={currentRole}
          currentRoleUser={activeUser}
        />
      )}

      {/* Barra de Navegación Móvil Inferior (Solo visible si hay sesión) */}
      {activeUser && (
        <MobileBottomNav
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          currentRole={currentRole}
          incidentsCount={incidents.length}
        />
      )}

      {/* Footer Informativo de la Arquitectura */}
      <footer className="border-t border-slate-800/80 bg-[#121316] py-6 text-xs text-slate-400 transition-colors hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-200">UTM Desk</span>
            <span>•</span>
            <span>Universidad Tecnológica Metropolitana (Mérida)</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <Database className="w-3.5 h-3.5 text-emerald-400" /> MongoDB Atlas M0
            </span>
            <span className="flex items-center gap-1">
              <Server className="w-3.5 h-3.5 text-amber-400" /> Upstash Redis
            </span>
            <span className="flex items-center gap-1">
              <HardDrive className="w-3.5 h-3.5 text-slate-300" /> Supabase Storage
            </span>
          </div>
        </div>
      </footer>

    </div>
  );
}
