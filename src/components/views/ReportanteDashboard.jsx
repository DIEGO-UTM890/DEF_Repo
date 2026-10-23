import React from 'react';
import { 
  PlusCircle, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  Building2, 
  HelpCircle,
  PhoneCall,
  Laptop,
  Wrench,
  GraduationCap
} from 'lucide-react';
import { ESTADOS, PRIORIDADES, CATEGORIES_CONFIG } from '../../data/mockData';

export default function ReportanteDashboard({ 
  incidents, 
  onNewIncident, 
  onSelectIncident, 
  currentUser 
}) {
  // Filtrar solo los reportes del reportante (Tabla 3)
  const myIncidents = incidents.filter(i => {
    return i.reportante?.correo === currentUser?.correo_institucional ||
           i.reportante?.usuario_id === currentUser?._id ||
           i.reportante?.nombre?.includes('Laura') ||
           i.reportante?.nombre?.includes('Jorge');
  });

  const abiertas = myIncidents.filter(i => i.estado === 'abierta').length;
  const enProceso = myIncidents.filter(i => i.estado === 'en_proceso' || i.estado === 'en_espera').length;
  const resueltas = myIncidents.filter(i => i.estado === 'resuelta' || i.estado === 'cerrada').length;

  return (
    <div className="space-y-8">
      
      {/* Banner Principal del Reportante: Amigable y Directo */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-800 rounded-3xl p-6 sm:p-10 text-white shadow-xl shadow-blue-900/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider mb-3">
            <span>Portal del Estudiante y Docente</span>
            <span>•</span>
            <span className="text-blue-200">UTM Desk</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
            Hola, {currentUser?.nombre_completo || 'Docente UTM'}
          </h1>
          <p className="text-blue-100/90 text-sm sm:text-base mt-2 leading-relaxed">
            ¿Detectaste alguna falla en tu aula, laboratorio o en el aula virtual? Levanta tu ticket y recibe seguimiento paso a paso.
          </p>
        </div>

        {/* Botón Principal Gigante: Propósito Claro */}
        <button
          onClick={onNewIncident}
          className="w-full md:w-auto px-8 py-5 rounded-3xl bg-white text-blue-700 hover:bg-blue-50 font-black text-base sm:text-lg shadow-xl shadow-black/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 flex-shrink-0"
        >
          <PlusCircle className="w-6 h-6 text-blue-600" />
          <span>+ Reportar Nueva Falla</span>
        </button>
      </div>

      {/* Resumen de Mis Reportes en 3 Tarjetas Grandes */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-sky-100 dark:bg-sky-950/80 text-sky-600 dark:text-sky-400">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase text-slate-400">Pendientes</span>
            <div className="text-2xl font-black text-slate-900 dark:text-white">{abiertas}</div>
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400">
            <Wrench className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase text-slate-400">En Atención</span>
            <div className="text-2xl font-black text-slate-900 dark:text-white">{enProceso}</div>
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase text-slate-400">Solucionadas</span>
            <div className="text-2xl font-black text-slate-900 dark:text-white">{resueltas}</div>
          </div>
        </div>
      </div>

      {/* Lista de Mis Reportes Enviados */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
              Mis Reportes Registrados
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Solo tú y el equipo técnico asignado tienen acceso al seguimiento de estos folios.
            </p>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            {myIncidents.length} expediente(s)
          </span>
        </div>

        {myIncidents.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <h4 className="font-bold text-slate-700 dark:text-slate-300">Aún no has levantado ningún reporte</h4>
            <p className="text-xs text-slate-400 mt-1 mb-4">Cuando reportes una falla en el campus, aparecerá aquí con su folio único.</p>
            <button
              onClick={onNewIncident}
              className="px-5 py-2.5 rounded-xl font-bold text-xs bg-blue-600 text-white hover:bg-blue-700"
            >
              + Levantar mi primer reporte
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {myIncidents.map(inc => {
              const est = ESTADOS.find(e => e.id === inc.estado) || ESTADOS[0];
              const prio = PRIORIDADES.find(p => p.id === inc.prioridad) || PRIORIDADES[0];
              const cat = CATEGORIES_CONFIG[inc.categoria] || CATEGORIES_CONFIG.computo_redes;

              return (
                <div
                  key={inc._id}
                  onClick={() => onSelectIncident(inc)}
                  className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
                >
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-black px-2.5 py-0.5 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                        {inc.folio}
                      </span>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${est.color}`}>
                        {est.label}
                      </span>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${prio.color}`}>
                        Prioridad {prio.label}
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-900 dark:text-white text-base group-hover:text-blue-600 transition-colors">
                      {inc.titulo}
                    </h3>

                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5" />
                        {inc.ubicacion?.edificio} • {inc.ubicacion?.aula_o_espacio}
                      </span>
                      <span>•</span>
                      <span>{new Date(inc.fecha_creacion).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <button className="px-4 py-2 rounded-xl text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 group-hover:bg-blue-600 group-hover:text-white transition-all flex items-center gap-1 self-end sm:self-auto">
                    <span>Ver Avance</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Guía Rápida para el Usuario (Accesible y Claro para Adultos Mayores) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-start gap-4">
          <div className="p-3 rounded-2xl bg-amber-100 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400 flex-shrink-0">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1">
              ¿Cómo funciona el proceso de atención?
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Al enviar tu reporte, el sistema le asigna un número de folio correlativo único (ej: INC-2026-0042). Un técnico operativo de la UTM lo revisará, acudirá a tu aula o laboratorio y registrará cada acción en la bitácora.
            </p>
          </div>
        </div>

        <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-start gap-4">
          <div className="p-3 rounded-2xl bg-indigo-100 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex-shrink-0">
            <PhoneCall className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1">
              Soporte de Urgencia en el Campus
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              En caso de contingencia eléctrica grave o fuga de agua en laboratorio, contacta de inmediato a la coordinación general en el Edificio A o comunícate a la extensión 104 del campus.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
