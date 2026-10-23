import React from 'react';
import UserManagement from '../UserManagement';
import { 
  ShieldCheck, 
  UserPlus, 
  KeyRound, 
  CheckCircle, 
  FileCode2, 
  Lock
} from 'lucide-react';

export default function AdminDashboard({ users, onUpdateUsers, currentUser }) {
  const activas = users.filter(u => u.activo).length;
  const inactivas = users.filter(u => !u.activo).length;

  return (
    <div className="space-y-8">
      
      {/* Banner de Cabecera de Administración */}
      <div className="bg-gradient-to-r from-rose-950 via-slate-900 to-rose-950 border border-rose-900/50 rounded-3xl p-6 sm:p-10 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold uppercase tracking-wider mb-2 border border-rose-500/30">
            <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
            <span>Módulo de Administración de Accesos & Identidad (RF-08)</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
            Administrador: {currentUser?.nombre_completo || 'Lic. Andrea Moguel Carrillo'}
          </h1>
          <p className="text-slate-300 text-sm mt-1 max-w-xl">
            Gestión centralizada de perfiles institucionales en la colección auxiliar <code className="font-mono text-rose-300 bg-rose-950/60 px-1 rounded">usuarios</code> de MongoDB Atlas.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md text-center">
            <span className="text-[10px] uppercase font-bold text-rose-200">Cuentas Activas</span>
            <div className="text-2xl font-black text-emerald-400 mt-0.5">{activas}</div>
          </div>
          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md text-center">
            <span className="text-[10px] uppercase font-bold text-rose-200">Suspendidas</span>
            <div className="text-2xl font-black text-rose-400 mt-0.5">{inactivas}</div>
          </div>
        </div>
      </div>

      {/* Gestión de Usuarios Componente Completo */}
      <UserManagement users={users} onUpdateUsers={onUpdateUsers} />

      {/* Nota Técnica de Seguridad y Colección Auxiliar */}
      <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-start gap-4">
        <div className="p-3 rounded-2xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex-shrink-0">
          <FileCode2 className="w-6 h-6" />
        </div>
        <div>
          <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1">
            Persistencia Aislada: Colección Auxiliar 'usuarios'
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Se almacena separada de las incidencias para evitar caducidad por TTL (60 días) y resguardar campos sensibles como <code className="font-mono text-xs">password_hash</code> y <code className="font-mono text-xs">matricula_o_empleado</code>. Cada incidencia únicamente contiene un subdocumento plano con nombre y correo del reportante para lecturas atómicas sin uniones ($lookup).
          </p>
        </div>
      </div>

    </div>
  );
}
