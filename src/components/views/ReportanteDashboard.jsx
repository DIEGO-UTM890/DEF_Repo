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
      
      {/* Banner Principal del Reportante: Tono sobrio, desaturado y elegante */}
      <div className="bg-gradient-to-r from-[#1E293B] via-[#161D2B] to-[#1E1B4B] rounded-3xl p-6 sm:p-10 text-[#F1F5F9] shadow-xl border border-[#2A3447] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2A3447]/70 border border-[#2A3447] backdrop-blur-md text-xs font-bold uppercase tracking-wider mb-3">
            <span className="text-[#F1F5F9]">Portal del Estudiante y Docente</span>
            <span className="text-[#94A3B8]">•</span>
            <span className="text-[#818CF8]">UTM Desk</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight text-[#F1F5F9]">
            Hola, {currentUser?.nombre_completo || 'Docente UTM'}
          </h1>
          <p className="text-[#94A3B8] text-sm sm:text-base mt-2 leading-relaxed">
            ¿Detectaste alguna falla en tu aula, laboratorio o en el aula virtual? Levanta tu ticket y recibe seguimiento paso a paso.
          </p>
        </div>

        {/* Botón Principal Gigante: Color Primario de Acción #4F46E5 */}
        <button
          onClick={onNewIncident}
          className="w-full md:w-auto px-8 py-5 rounded-3xl bg-[#4F46E5] hover:bg-[#4338CA] text-[#F1F5F9] font-black text-base sm:text-lg shadow-xl shadow-[#4F46E5]/25 border border-[#6366F1]/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 flex-shrink-0 cursor-pointer"
        >
          <PlusCircle className="w-6 h-6 text-[#F1F5F9]" />
          <span>+ Reportar Nueva Falla</span>
        </button>
      </div>

      {/* Resumen de Mis Reportes en 3 Tarjetas Grandes con superficie #161D2B y borde #2A3447 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white dark:bg-[#161D2B] rounded-3xl border border-slate-200 dark:border-[#2A3447] shadow-sm flex items-center gap-4 transition-colors">
          <div className="p-3.5 rounded-2xl bg-sky-100 dark:bg-[#1E293B] text-sky-600 dark:text-sky-400 border border-transparent dark:border-[#2A3447]">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase text-slate-500 dark:text-[#94A3B8]">Pendientes</span>
            <div className="text-2xl font-black text-slate-900 dark:text-[#F1F5F9]">{abiertas}</div>
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-[#161D2B] rounded-3xl border border-slate-200 dark:border-[#2A3447] shadow-sm flex items-center gap-4 transition-colors">
          <div className="p-3.5 rounded-2xl bg-indigo-100 dark:bg-[#1E293B] text-indigo-600 dark:text-[#818CF8] border border-transparent dark:border-[#2A3447]">
            <Wrench className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase text-slate-500 dark:text-[#94A3B8]">En Atención</span>
            <div className="text-2xl font-black text-slate-900 dark:text-[#F1F5F9]">{enProceso}</div>
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-[#161D2B] rounded-3xl border border-slate-200 dark:border-[#2A3447] shadow-sm flex items-center gap-4 transition-colors">
          <div className="p-3.5 rounded-2xl bg-emerald-100 dark:bg-[#10B981]/15 text-[#10B981] border border-transparent dark:border-[#10B981]/30">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase text-slate-500 dark:text-[#94A3B8]">Solucionadas</span>
            <div className="text-2xl font-black text-slate-900 dark:text-[#F1F5F9]">{resueltas}</div>
          </div>
        </div>
      </div>

      {/* Lista de Mis Reportes Enviados */}
      <div className="bg-white dark:bg-[#161D2B] rounded-3xl border border-slate-200 dark:border-[#2A3447] shadow-sm p-6 sm:p-8 space-y-4 transition-colors">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#2A3447] pb-4">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-[#F1F5F9] tracking-tight">
              Mis Reportes Registrados
            </h2>
            <p className="text-xs text-slate-500 dark:text-[#94A3B8] mt-0.5">
              Solo tú y el equipo técnico asignado tienen acceso al seguimiento de estos folios.
            </p>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 dark:bg-[#1E293B] text-slate-600 dark:text-[#94A3B8] border border-transparent dark:border-[#2A3447]">
            {myIncidents.length} expediente(s)
          </span>
        </div>

        {myIncidents.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="w-10 h-10 text-slate-400 dark:text-[#94A3B8] mx-auto mb-2" />
            <h4 className="font-bold text-slate-800 dark:text-[#F1F5F9]">Aún no has levantado ningún reporte</h4>
            <p className="text-xs text-slate-500 dark:text-[#94A3B8] mt-1 mb-4">Cuando reportes una falla en el campus, aparecerá aquí con su folio único.</p>
            <button
              onClick={onNewIncident}
              className="px-5 py-2.5 rounded-xl font-bold text-xs bg-[#4F46E5] hover:bg-[#4338CA] text-[#F1F5F9] shadow-md transition-colors"
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
                  className="p-5 rounded-2xl border border-slate-200 dark:border-[#2A3447] hover:border-[#4F46E5] dark:hover:border-[#4F46E5] bg-slate-50/50 dark:bg-[#0B0F17]/70 hover:bg-white dark:hover:bg-[#161D2B] transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
                >
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-black px-2.5 py-0.5 rounded-lg bg-indigo-100 dark:bg-[#4F46E5]/20 text-[#4F46E5] dark:text-[#818CF8] border border-transparent dark:border-[#4F46E5]/30">
                        {inc.folio}
                      </span>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${est.color}`}>
                        {est.label}
                      </span>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${prio.color}`}>
                        Prioridad {prio.label}
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-900 dark:text-[#F1F5F9] text-base group-hover:text-[#818CF8] transition-colors">
                      {inc.titulo}
                    </h3>

                    <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-[#94A3B8]">
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5" />
                        {inc.ubicacion?.edificio} • {inc.ubicacion?.aula_o_espacio}
                      </span>
                      <span>•</span>
                      <span>{new Date(inc.fecha_creacion).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <button className="px-4 py-2 rounded-xl text-xs font-bold text-[#4F46E5] dark:text-[#818CF8] bg-indigo-50 dark:bg-[#4F46E5]/15 border border-transparent dark:border-[#4F46E5]/30 group-hover:bg-[#4F46E5] group-hover:text-[#F1F5F9] transition-all flex items-center gap-1 self-end sm:self-auto cursor-pointer">
                    <span>Ver Avance</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Guía Rápida para el Usuario */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-6 bg-white dark:bg-[#161D2B] rounded-3xl border border-slate-200 dark:border-[#2A3447] shadow-sm flex items-start gap-4 transition-colors">
          <div className="p-3 rounded-2xl bg-amber-100 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400 border border-transparent dark:border-amber-800/40 flex-shrink-0">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 dark:text-[#F1F5F9] text-sm mb-1">
              ¿Cómo funciona el proceso de atención?
            </h4>
            <p className="text-xs text-slate-500 dark:text-[#94A3B8] leading-relaxed">
              Al enviar tu reporte, el sistema le asigna un número de folio correlativo único (ej: INC-2026-0042). Un técnico operativo de la UTM lo revisará, acudirá a tu aula o laboratorio y registrará cada acción en la bitácora.
            </p>
          </div>
        </div>

        <div className="p-6 bg-white dark:bg-[#161D2B] rounded-3xl border border-slate-200 dark:border-[#2A3447] shadow-sm flex items-start gap-4 transition-colors">
          <div className="p-3 rounded-2xl bg-indigo-100 dark:bg-[#4F46E5]/20 text-[#4F46E5] dark:text-[#818CF8] border border-transparent dark:border-[#4F46E5]/30 flex-shrink-0">
            <PhoneCall className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 dark:text-[#F1F5F9] text-sm mb-1">
              Soporte de Urgencia en el Campus
            </h4>
            <p className="text-xs text-slate-500 dark:text-[#94A3B8] leading-relaxed">
              En caso de contingencia eléctrica grave o fuga de agua en laboratorio, contacta de inmediato a la coordinación general en el Edificio A o comunícate a la extensión 104 del campus.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
