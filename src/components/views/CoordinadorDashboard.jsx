import React, { useState } from 'react';
import { 
  ClipboardCheck, 
  Building2, 
  CheckCircle2, 
  AlertOctagon, 
  UserCheck, 
  Tag, 
  Search,
  Lock,
  ArrowRight,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { ESTADOS, PRIORIDADES, CATEGORIES_CONFIG } from '../../data/mockData';

export default function CoordinadorDashboard({ 
  incidents, 
  onSelectIncident, 
  onUpdateIncident,
  currentUser 
}) {
  const [searchTerm, setSearchTerm] = useState('');

  // Atribución exclusiva del Coordinador: Dar cierre definitivo ("cerrada")
  const handleCierreDefinitivo = (e, incident) => {
    e.stopPropagation();
    if (confirm(`¿Confirmas el cierre administrativo definitivo de la incidencia ${incident.folio}?`)) {
      const updated = {
        ...incident,
        estado: 'cerrada',
        historial_seguimiento: [
          ...(incident.historial_seguimiento || []),
          {
            fecha: new Date().toISOString(),
            autor: currentUser?.nombre_completo || 'Ing. Roberto Solís (Coordinador)',
            rol_autor: 'coordinador',
            estado_nuevo: 'cerrada',
            horas_agregadas: 0,
            comentario: 'Caso validado y cerrado definitivamente por Coordinación Operativa de Campus.'
          }
        ]
      };
      onUpdateIncident(updated);
    }
  };

  const filtered = incidents.filter(i => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return i.folio?.toLowerCase().includes(q) ||
           i.titulo?.toLowerCase().includes(q) ||
           i.ubicacion?.edificio?.toLowerCase().includes(q);
  });

  const abiertas = incidents.filter(i => i.estado === 'abierta').length;
  const enProceso = incidents.filter(i => i.estado === 'en_proceso' || i.estado === 'en_espera').length;
  const resueltas = incidents.filter(i => i.estado === 'resuelta').length;
  const cerradas = incidents.filter(i => i.estado === 'cerrada').length;

  return (
    <div className="space-y-8">
      
      {/* Banner Principal de Coordinación */}
      <div className="bg-gradient-to-r from-[#121316] via-[#1C1D22] to-[#2C2D35]/40 rounded-3xl p-6 sm:p-10 text-white shadow-xl border border-slate-700/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-2 border border-amber-500/20">
            <ClipboardCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>Supervisión y Operación del Campus Completo</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Coordinador: {currentUser?.nombre_completo || 'Ing. Roberto Solís Castillo'}
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-xl">
            Supervisión integral de edificios, reasignación de cuadrillas y validación de cierre definitivo de reportes conforme a la Matriz de Control.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 w-full sm:w-auto">
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-700/60 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400">En Atención</span>
            <div className="text-2xl font-black text-amber-300 mt-0.5">{enProceso}</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-700/60 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400">Resueltas/Cerradas</span>
            <div className="text-2xl font-black text-emerald-400 mt-0.5">{resueltas + cerradas}</div>
          </div>
        </div>
      </div>

      {/* Buscador de Control de Campus */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
        <Search className="w-5 h-5 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Supervisar por folio, título, aula o edificio del campus..."
          className="w-full bg-transparent text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
        />
      </div>

      {/* Tabla Operativa de Coordinación con Acciones de Cierre */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              Supervisión de Casos en Curso
            </h3>
            <p className="text-xs text-slate-400">
              Permiso especial de Coordinador: Reasignar caso o dar cierre definitivo ("cerrada").
            </p>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
            Alcance: Todo el Campus UTM
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4">Folio & Incidencia</th>
                <th className="px-6 py-4">Ubicación</th>
                <th className="px-6 py-4">Estado Actual</th>
                <th className="px-6 py-4">Horas Técnicas</th>
                <th className="px-6 py-4 text-right">Acción de Coordinador</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map(inc => {
                const est = ESTADOS.find(e => e.id === inc.estado) || ESTADOS[0];

                return (
                  <tr
                    key={inc._id}
                    onClick={() => onSelectIncident(inc)}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black text-purple-600 dark:text-purple-400">
                          {inc.folio}
                        </span>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {inc.titulo}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        Reportante: {inc.reportante?.nombre} ({inc.reportante?.correo})
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">
                        {inc.ubicacion?.edificio}
                      </div>
                      <div className="text-xs text-slate-400">
                        {inc.ubicacion?.aula_o_espacio}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-xl border ${est.color}`}>
                        {est.label}
                      </span>
                    </td>

                    <td className="px-6 py-4 font-mono font-bold text-slate-700 dark:text-slate-300">
                      {inc.horas_invertidas || 0} hrs
                    </td>

                    <td className="px-6 py-4 text-right">
                      {inc.estado !== 'cerrada' ? (
                        <button
                          onClick={(e) => handleCierreDefinitivo(e, inc)}
                          className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-black text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 transition-all flex items-center gap-1.5 ml-auto"
                          title="Dar Cierre Definitivo"
                        >
                          <Lock className="w-3 h-3" />
                          <span>Cerrar Definitivo</span>
                        </button>
                      ) : (
                        <span className="text-xs text-emerald-600 font-bold flex items-center justify-end gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Cerrado
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
