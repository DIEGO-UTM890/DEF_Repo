import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import RoleSwitcherBar from './components/RoleSwitcherBar';
import ReportForm from './components/ReportForm';
import IncidentList from './components/IncidentList';
import IncidentDetailModal from './components/IncidentDetailModal';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import UserManagement from './components/UserManagement';
import MobileBottomNav from './components/MobileBottomNav';

// Vistas dedicadas por Rol
import ReportanteDashboard from './components/views/ReportanteDashboard';
import TecnicoDashboard from './components/views/TecnicoDashboard';
import CoordinadorDashboard from './components/views/CoordinadorDashboard';
import DirectivoDashboard from './components/views/DirectivoDashboard';
import AdminDashboard from './components/views/AdminDashboard';
import SuperAdminDashboard from './components/views/SuperAdminDashboard';

import { INITIAL_INCIDENTS, INITIAL_USERS, ROLES_CONFIG } from './data/mockData';
import { Database, Server, HardDrive } from 'lucide-react';

export default function App() {
  // Manejo del Tema Claro / Oscuro con persistencia
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('utmdesk_theme') || 'light';
  });

  // Manejo del Rol Activo para simulación interactiva
  const [currentRole, setCurrentRole] = useState(() => {
    return localStorage.getItem('utmdesk_role') || 'reportante';
  });

  // Pestaña actual: 'role_dashboard' (por defecto muestra la interfaz del rol) | 'list' | 'new' | 'stats' | 'users'
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

  // Estado de Usuarios con persistencia local
  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem('utmdesk_users');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
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

  useEffect(() => {
    localStorage.setItem('utmdesk_role', currentRole);
  }, [currentRole]);

  // Al cambiar de rol, regresar a la vista del dashboard de ese rol
  const handleSelectRole = (newRole) => {
    setCurrentRole(newRole);
    setCurrentTab('role_dashboard');
  };

  // Obtener usuario activo representativo según el rol
  const currentRoleUser = users.find(u => u.rol === currentRole) || users[0];
  const roleConfig = ROLES_CONFIG[currentRole] || ROLES_CONFIG.reportante;

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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      
      {/* Barra de Navegación Principal */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        theme={theme}
        setTheme={setTheme}
        currentRole={currentRole}
        setCurrentRole={handleSelectRole}
        incidentsCount={incidents.length}
      />

      {/* Contenido Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-20 md:pb-12">
        
        {/* Selector Rápido de Roles (Llamativo y Directo para Probar cada Vista) */}
        <RoleSwitcherBar
          currentRole={currentRole}
          setCurrentRole={handleSelectRole}
        />

        {/* ============================================================== */}
        {/* RENDERIZADO DINÁMICO SEGÚN PESTAÑA O DASHBOARD DE ROL */}
        {/* ============================================================== */}

        {/* 1. Vista de Formulario de Nuevo Reporte */}
        {currentTab === 'new' && (
          <ReportForm
            onAddIncident={handleAddIncident}
            onCancel={() => setCurrentTab('role_dashboard')}
            currentRoleUser={currentRoleUser}
          />
        )}

        {/* 2. Vista de Explorador General de Incidencias */}
        {currentTab === 'list' && (
          <IncidentList
            incidents={incidents}
            onSelectIncident={setSelectedIncident}
            onNewIncident={() => setCurrentTab('new')}
            currentRole={currentRole}
            currentRoleUser={currentRoleUser}
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
          />
        )}

        {/* 5. INTERFACES ESPECIALIZADAS POR CADA ROL */}
        {currentTab === 'role_dashboard' && (
          <>
            {/* Interfaz Rol 1: Reportante */}
            {currentRole === 'reportante' && (
              <ReportanteDashboard
                incidents={incidents}
                onNewIncident={() => setCurrentTab('new')}
                onSelectIncident={setSelectedIncident}
                currentUser={currentRoleUser}
              />
            )}

            {/* Interfaz Rol 2: Técnico Operativo */}
            {currentRole === 'tecnico' && (
              <TecnicoDashboard
                incidents={incidents}
                onSelectIncident={setSelectedIncident}
                onNewIncident={() => setCurrentTab('new')}
                currentUser={currentRoleUser}
              />
            )}

            {/* Interfaz Rol 3: Coordinador */}
            {currentRole === 'coordinador' && (
              <CoordinadorDashboard
                incidents={incidents}
                onSelectIncident={setSelectedIncident}
                onUpdateIncident={handleUpdateIncident}
                currentUser={currentRoleUser}
              />
            )}

            {/* Interfaz Rol 4: Directivo */}
            {currentRole === 'directivo' && (
              <DirectivoDashboard
                incidents={incidents}
                currentUser={currentRoleUser}
              />
            )}

            {/* Interfaz Rol 5: Administrador del Sistema */}
            {currentRole === 'admin' && (
              <AdminDashboard
                users={users}
                onUpdateUsers={setUsers}
                currentUser={currentRoleUser}
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

      </main>

      {/* Modal de Detalle de Incidencia / Expediente */}
      {selectedIncident && (
        <IncidentDetailModal
          incident={selectedIncident}
          onClose={() => setSelectedIncident(null)}
          onUpdateIncident={handleUpdateIncident}
          currentRole={currentRole}
          currentRoleUser={currentRoleUser}
        />
      )}

      {/* Barra de Navegación Móvil Inferior */}
      <MobileBottomNav
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        currentRole={currentRole}
        incidentsCount={incidents.length}
      />

      {/* Footer Informativo de la Arquitectura */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 text-xs text-slate-500 dark:text-slate-400 transition-colors hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 dark:text-slate-200">UTM Desk</span>
            <span>•</span>
            <span>Universidad Tecnológica Metropolitana (Mérida)</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1">
              <Database className="w-3.5 h-3.5 text-emerald-500" /> MongoDB Atlas M0
            </span>
            <span className="flex items-center gap-1">
              <Server className="w-3.5 h-3.5 text-rose-500" /> Upstash Redis
            </span>
            <span className="flex items-center gap-1">
              <HardDrive className="w-3.5 h-3.5 text-blue-500" /> Supabase Storage
            </span>
          </div>
        </div>
      </footer>

    </div>
  );
}
