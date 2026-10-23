import React, { useState } from 'react';
import { 
  Wrench, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Tag, 
  ChevronRight, 
  Send,
  Building2,
  PlusCircle,
  Filter,
  FileCheck
} from 'lucide-react';
import { ESTADOS, PRIORIDADES, CATEGORIES_CONFIG } from '../../data/mockData';

export default function TecnicoDashboard({ 
  incidents, 
  onSelectIncident, 
  onNewIncident, 
  currentUser 
}) {
  const [filterArea, setFilterArea] = useState('computo_redes');

  // Filtrar según área asignada del técnico o todas
  const areaIncidents = incidents.filter(i => {
    if (filterArea === 'todas') return true;
    return i.categoria === filterArea;
  });

  const abiertas = areaIncidents.filter(i => i.estado === 'abierta');
  const enProceso = areaIncidents.filter(i => i.estado === 'en_proceso');
  const enEspera = areaIncidents.filter(i => i.estado === 'en_espera');
  const resueltas = areaIncidents.filter(i => i.estado === 'resuelta');

  const totalHorasTecnico = incidents.reduce((acc, curr) => acc + (curr.horas_invertidas || 0), 0);

  return (
    <div className="space-y-8">
      
      {/* Banner de Cabecera Técnica */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 border border-blue-900/40 rounded-3xl p-6 sm:p-10 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold uppercase tracking-wider mb-2 border border-blue-500/30">
            <Wrench className="w-3.5 h-3.5 text-blue-400" />
            <span>Consola de Trabajo del Técnico Operativo</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
            Técnico: {currentUser?.nombre_completo || 'Carlos Méndez Pech'}
          </h1>
          <p className="text-slate-300 text-sm mt-1 max-w-xl">
            Área Asignada: <strong className="text-blue-400 capitalize">{currentUser?.area_asignada?.replace('_', ' ') || 'Cómputo y Redes'}</strong> • Registro de bitácoras, insumos y control de horas de mantenimiento.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-center">
            <span className="text-[11px] uppercase tracking-wider font-bold text-slate-300 block">
              Horas Acumuladas
            </span>
            <div className="text-3xl font-black text-blue-400 mt-0.5">
              {totalHorasTecnico} <span className="text-sm text-slate-300">hrs</span>
            </div>
          </div>

          <button
            onClick={onNewIncident}
            className="px-5 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <PlusCircle className="w-5 h-5" />
            <span>Levantar Ticket Técnico</span>
          </button>
        </div>
      </div>

      {/* Selector de Área para pruebas */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
          <Filter className="w-4 h-4 text-blue-600" />
          <span>Cola de tickets por especialidad:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setFilterArea('computo_redes')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterArea === 'computo_redes'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            Cómputo y Redes
          </button>
          <button
            onClick={() => setFilterArea('infraestructura')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterArea === 'infraestructura'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            Infraestructura
          </button>
          <button
            onClick={() => setFilterArea('academico')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterArea === 'academico'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            Académico
          </button>
          <button
            onClick={() => setFilterArea('todas')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterArea === 'todas'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            Todas ({incidents.length})
          </button>
        </div>
      </div>

      {/* Columnas Kanban de Trabajo Técnico (Atención Inmediata) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Columna 1: En Proceso (Atención Actual) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50">
            <span className="font-bold text-xs uppercase tracking-wider text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
              <Wrench className="w-4 h-4" /> En Proceso ({enProceso.length})
            </span>
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
          </div>

          <div className="space-y-3">
            {enProceso.length === 0 ? (
              <div className="p-6 text-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-xs text-slate-400">
                No tienes incidencias en proceso en este momento.
              </div>
            ) : (
              enProceso.map(inc => (
                <div
                  key={inc._id}
                  onClick={() => onSelectIncident(inc)}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-800 shadow-sm hover:shadow-md cursor-pointer transition-all space-y-2 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-black text-blue-600 dark:text-blue-400">
                      {inc.folio}
                    </span>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                      {inc.horas_invertidas || 0} hrs invertidas
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors line-clamp-1">
                    {inc.titulo}
                  </h4>

                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                    {inc.descripcion}
                  </p>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5" /> {inc.ubicacion?.edificio}
                    </span>
                    <span className="font-bold text-blue-600 flex items-center gap-1">
                      Bitácora <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Columna 2: Abiertas (Por Diagnosticar / Tomar) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-900/50">
            <span className="font-bold text-xs uppercase tracking-wider text-sky-700 dark:text-sky-300 flex items-center gap-1.5">
              <Clock className="w-4 h-4" /> Abiertas / Nuevas ({abiertas.length})
            </span>
          </div>

          <div className="space-y-3">
            {abiertas.length === 0 ? (
              <div className="p-6 text-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-xs text-slate-400">
                Todo despejado en incidencias nuevas.
              </div>
            ) : (
              abiertas.map(inc => (
                <div
                  key={inc._id}
                  onClick={() => onSelectIncident(inc)}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-blue-400 cursor-pointer transition-all space-y-2 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-black text-sky-600 dark:text-sky-400">
                      {inc.folio}
                    </span>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                      Prioridad {inc.prioridad}
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors line-clamp-1">
                    {inc.titulo}
                  </h4>

                  <div className="text-xs text-slate-500">
                    Reportado por: <strong>{inc.reportante?.nombre}</strong>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
                    <span>{inc.ubicacion?.aula_o_espacio}</span>
                    <span className="font-bold text-sky-600 flex items-center gap-1">
                      Iniciar Atención <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Columna 3: En Espera / Resueltas Recientes */}
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50">
            <span className="font-bold text-xs uppercase tracking-wider text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Resueltas Recientes ({resueltas.length})
            </span>
          </div>

          <div className="space-y-3">
            {resueltas.map(inc => (
              <div
                key={inc._id}
                onClick={() => onSelectIncident(inc)}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 opacity-80 hover:opacity-100 cursor-pointer transition-all space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    {inc.folio}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {inc.horas_invertidas} hrs
                  </span>
                </div>
                <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 truncate">
                  {inc.titulo}
                </h4>
                <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                  ✓ Marcada como resuelta
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
