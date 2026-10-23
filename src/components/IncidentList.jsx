import React, { useState, useMemo } from 'react';
import { 
  CATEGORIES_CONFIG, 
  PRIORIDADES, 
  ESTADOS,
  ROLES_CONFIG 
} from '../data/mockData';
import { 
  Search, 
  Filter, 
  PlusCircle, 
  Building2, 
  Clock, 
  Tag, 
  Paperclip, 
  ChevronRight,
  AlertCircle,
  Laptop,
  Wrench,
  GraduationCap
} from 'lucide-react';

export default function IncidentList({ 
  incidents, 
  onSelectIncident, 
  onNewIncident, 
  currentRole,
  currentRoleUser 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('todas');
  const [selectedStatus, setSelectedStatus] = useState('todas');

  const roleConfig = ROLES_CONFIG[currentRole] || ROLES_CONFIG.reportante;

  // Filtrado y Buscador Inteligente en Español (RF-06)
  const filteredIncidents = useMemo(() => {
    return incidents.filter(inc => {
      // Filtro de alcance por rol (Tabla 3): Reportante solo ve sus propios reportes
      if (roleConfig.filterOnlyOwn && currentRoleUser) {
        if (inc.reportante?.correo !== currentRoleUser.correo_institucional &&
            inc.reportante?.usuario_id !== currentRoleUser._id) {
          return false;
        }
      }

      // Filtro de Categoría
      if (selectedCategory !== 'todas' && inc.categoria !== selectedCategory) {
        return false;
      }

      // Filtro de Estado
      if (selectedStatus !== 'todas' && inc.estado !== selectedStatus) {
        return false;
      }

      // Buscador inteligente en español (título, descripción, folio, tags)
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const inFolio = inc.folio?.toLowerCase().includes(query);
        const inTitulo = inc.titulo?.toLowerCase().includes(query);
        const inDesc = inc.descripcion?.toLowerCase().includes(query);
        const inTags = inc.tags?.some(t => t.toLowerCase().includes(query));
        const inEdificio = inc.ubicacion?.edificio?.toLowerCase().includes(query);

        return inFolio || inTitulo || inDesc || inTags || inEdificio;
      }

      return true;
    });
  }, [incidents, selectedCategory, selectedStatus, searchTerm, roleConfig, currentRoleUser]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      
      {/* Banner Superior de Bienvenida con Propósito Claro */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 rounded-3xl p-6 sm:p-10 text-white shadow-xl shadow-blue-900/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-bold uppercase tracking-wider mb-3">
            <span>Mesa de Ayuda Universitaria</span>
            <span>•</span>
            <span className="text-blue-200">Campus Mérida</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
            Gestión Centralizada de Incidencias
          </h1>
          <p className="text-blue-100/90 text-sm sm:text-base mt-2 leading-relaxed">
            Reporta problemas de cómputo, infraestructura física o servicios académicos y monitorea su resolución en tiempo real con folio único.
          </p>
        </div>

        {roleConfig.canCreate && (
          <button
            onClick={onNewIncident}
            className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-white text-blue-700 hover:bg-blue-50 font-black text-sm sm:text-base shadow-lg shadow-black/15 transition-all flex items-center justify-center gap-2.5 active:scale-95 flex-shrink-0"
          >
            <PlusCircle className="w-5 h-5 text-blue-600" />
            <span>+ Levantar Reporte</span>
          </button>
        )}
      </div>

      {/* Barra de Filtros y Búsqueda: Pocos Controles pero muy Potentes */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        
        {/* Buscador inteligente */}
        <div className="relative">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por folio (INC-2026-...), palabra clave, falla, etiqueta o edificio..."
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
          />
        </div>

        {/* Filtros tipo Píldoras */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          
          {/* Categorías */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-bold text-slate-400 mr-1 hidden sm:inline">Categoría:</span>
            <button
              onClick={() => setSelectedCategory('todas')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedCategory === 'todas'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              Todas ({incidents.length})
            </button>
            {Object.entries(CATEGORIES_CONFIG).map(([key, cat]) => (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedCategory === key
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {cat.shortLabel}
              </button>
            ))}
          </div>

          {/* Estados */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-bold text-slate-400 mr-1 hidden sm:inline">Estado:</span>
            <button
              onClick={() => setSelectedStatus('todas')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedStatus === 'todas'
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              Todos
            </button>
            {ESTADOS.map(st => (
              <button
                key={st.id}
                onClick={() => setSelectedStatus(st.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedStatus === st.id
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

        </div>

      </div>

      {/* Lista de Tarjetas de Incidencias */}
      {filteredIncidents.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
          <AlertCircle className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
            No se encontraron incidencias
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-sm mx-auto">
            Prueba ajustando los filtros de categoría y estado, o realiza una búsqueda con otras palabras.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredIncidents.map((inc) => {
            const cat = CATEGORIES_CONFIG[inc.categoria] || CATEGORIES_CONFIG.computo_redes;
            const est = ESTADOS.find(e => e.id === inc.estado) || ESTADOS[0];
            const prio = PRIORIDADES.find(p => p.id === inc.prioridad) || PRIORIDADES[0];

            return (
              <div
                key={inc._id}
                onClick={() => onSelectIncident(inc)}
                className="group p-5 sm:p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700/60 transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  
                  {/* Encabezado de la Tarjeta */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="font-mono text-xs font-black tracking-wider px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 border border-slate-200 dark:border-slate-700">
                      {inc.folio}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${prio.color}`}>
                        {prio.label}
                      </span>
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${est.color}`}>
                        {est.label}
                      </span>
                    </div>
                  </div>

                  {/* Título */}
                  <h3 className="font-black text-slate-900 dark:text-white text-base sm:text-lg tracking-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1 mb-1.5">
                    {inc.titulo}
                  </h3>

                  {/* Descripción resumida */}
                  <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm line-clamp-2 leading-relaxed mb-4">
                    {inc.descripcion}
                  </p>

                  {/* Metadatos y Ubicación */}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mb-3">
                    <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                      <Building2 className="w-3.5 h-3.5 text-blue-500" />
                      {inc.ubicacion?.edificio}
                    </span>
                    <span>•</span>
                    <span>{inc.ubicacion?.aula_o_espacio}</span>
                    {inc.evidencias_adjuntas?.length > 0 && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1 font-medium text-blue-600 dark:text-blue-400">
                          <Paperclip className="w-3.5 h-3.5" />
                          {inc.evidencias_adjuntas.length} adjunto(s)
                        </span>
                      </>
                    )}
                  </div>

                  {/* Tags */}
                  {inc.tags && inc.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {inc.tags.map((t, idx) => (
                        <span key={idx} className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}

                </div>

                {/* Footer de la Tarjeta */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{inc.horas_invertidas || 0} hrs invertidas</span>
                  </div>

                  <span className="font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    Ver Expediente <ChevronRight className="w-4 h-4" />
                  </span>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
