import React, { useState } from 'react';
import UserManagement from '../UserManagement';
import { 
  Zap, 
  Database, 
  Server, 
  HardDrive, 
  Activity, 
  Trash2, 
  ShieldAlert, 
  CheckCircle2,
  Terminal,
  RefreshCw
} from 'lucide-react';

export default function SuperAdminDashboard({ incidents, users, onUpdateUsers, currentUser }) {
  const [runningTTLCheck, setRunningTTLCheck] = useState(false);
  const [ttlResult, setTtlResult] = useState(null);

  // Simulación de auditoría de índice TTL de 60 días (RNF-02: expireAfterSeconds: 5,184,000)
  const handleCheckTTL = () => {
    setRunningTTLCheck(true);
    setTimeout(() => {
      setRunningTTLCheck(false);
      setTtlResult({
        coleccion: 'incidencias_campus',
        indice: 'idx_ttl_fecha_resolucion',
        tiempo_expiracion: '5,184,000 segundos (60 días)',
        documentos_activos: incidents.length,
        documentos_caducados: 0,
        estado: 'OK - Sin desbordamiento de memoria M0'
      });
    }, 1000);
  };

  return (
    <div className="space-y-8">
      
      {/* Banner de Cabecera Super Admin */}
      <div className="bg-gradient-to-r from-[#121316] via-[#1C1D22] to-[#2C2D35]/40 border border-slate-700/60 rounded-3xl p-6 sm:p-10 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-2 border border-amber-500/20">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Consola Máster de Infraestructura Cloud & Mantenimiento</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Super Administrador del Sistema
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-xl">
            Monitoreo en tiempo real de MongoDB Atlas (M0), Upstash Redis (Contador Atómico) y Supabase Storage (Archivos y Evidencias).
          </p>
        </div>

        <button
          onClick={handleCheckTTL}
          disabled={runningTTLCheck}
          className="px-6 py-3.5 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-600/20 flex items-center justify-center gap-2 active:scale-95 transition-all flex-shrink-0 cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${runningTTLCheck ? 'animate-spin' : ''}`} />
          <span>{runningTTLCheck ? 'Auditando...' : 'Verificar Limpieza TTL 60 Días'}</span>
        </button>
      </div>

      {/* Estado de los 3 Servicios en la Nube (RNF-01, RNF-02, RNF-03) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* MongoDB Atlas M0 */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
              <Database className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
              Operativo
            </span>
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">MongoDB Atlas M0</h3>
            <p className="text-xs text-slate-400 mt-0.5">Persistencia Documental Polimórfica</p>
          </div>
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
            <div className="flex justify-between">
              <span>Almacenamiento Usado:</span>
              <strong className="font-mono text-emerald-600">1.8 MB / 512 MB</strong>
            </div>
            <div className="flex justify-between">
              <span>Colecciones Activas:</span>
              <strong className="font-mono">incidencias_campus, usuarios</strong>
            </div>
            <div className="flex justify-between">
              <span>Validación $jsonSchema:</span>
              <strong className="text-emerald-600">Habilitada</strong>
            </div>
          </div>
        </div>

        {/* Upstash Redis */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-2xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400">
              <Server className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
              Atómico
            </span>
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Upstash Redis</h3>
            <p className="text-xs text-slate-400 mt-0.5">Contador Concurrente de Folios</p>
          </div>
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
            <div className="flex justify-between">
              <span>Comando Concurrente:</span>
              <strong className="font-mono text-rose-600">INCR folio:2026</strong>
            </div>
            <div className="flex justify-between">
              <span>Garantía de Duplicados:</span>
              <strong className="text-emerald-600">0 Colisiones</strong>
            </div>
            <div className="flex justify-between">
              <span>Latencia Promedio:</span>
              <strong className="font-mono">14 ms</strong>
            </div>
          </div>
        </div>

        {/* Supabase Storage */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
              <HardDrive className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
              Privado
            </span>
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Supabase Storage</h3>
            <p className="text-xs text-slate-400 mt-0.5">Bucket de Evidencias y PDFs</p>
          </div>
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
            <div className="flex justify-between">
              <span>Seguridad de Acceso:</span>
              <strong className="text-blue-600">Enlaces Firmados Temporales</strong>
            </div>
            <div className="flex justify-between">
              <span>Límite Capa Gratuita:</span>
              <strong className="font-mono">1 GB Bucket</strong>
            </div>
            <div className="flex justify-between">
              <span>Binarios en MongoDB:</span>
              <strong className="text-emerald-600">0% (Solo Metadatos)</strong>
            </div>
          </div>
        </div>

      </div>

      {/* Resultado de Auditoría de Índice TTL */}
      {ttlResult && (
        <div className="p-6 bg-slate-900 text-white rounded-3xl border border-slate-800 shadow-lg space-y-3 font-mono text-xs animate-in fade-in">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
            <CheckCircle2 className="w-5 h-5" />
            <span>Auditoría de Depuración Automática TTL Exitosa</span>
          </div>
          <pre className="p-4 rounded-2xl bg-black/50 text-slate-300 overflow-x-auto text-[11px] leading-relaxed">
{JSON.stringify(ttlResult, null, 2)}
          </pre>
          <div className="text-slate-400 text-[11px]">
            * Conforme a la regla de negocio: los reportes resueltos se conservan exactamente 60 días antes de ser eliminados por el motor de Atlas.
          </div>
        </div>
      )}

      {/* Módulo Integrado de Control de Cuentas y Solicitudes Institucionales (RF-08) */}
      <div className="pt-6 border-t border-slate-800">
        <UserManagement users={users} onUpdateUsers={onUpdateUsers} currentUser={currentUser} />
      </div>

    </div>
  );
}
