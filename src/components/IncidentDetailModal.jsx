import React, { useState } from 'react';
import { 
  CATEGORIES_CONFIG, 
  PRIORIDADES, 
  ESTADOS,
  ROLES_CONFIG 
} from '../data/mockData';
import { 
  X, 
  Clock, 
  Building2, 
  Tag, 
  FileText, 
  User, 
  History, 
  CheckCircle2, 
  AlertTriangle, 
  Plus, 
  Send,
  ExternalLink,
  Laptop,
  Wrench,
  GraduationCap
} from 'lucide-react';

export default function IncidentDetailModal({ 
  incident, 
  onClose, 
  onUpdateIncident,
  currentRole,
  currentRoleUser
}) {
  const [nuevoEstado, setNuevoEstado] = useState(incident.estado);
  const [comentarioBitacora, setComentarioBitacora] = useState('');
  const [horasNuevas, setHorasNuevas] = useState(0);
  const [nuevaEtiqueta, setNuevaEtiqueta] = useState('');
  const [activeTab, setActiveTab] = useState('expediente'); // 'expediente' | 'bitacora' | 'acciones'

  const roleConfig = ROLES_CONFIG[currentRole] || ROLES_CONFIG.reportante;
  const canUpdate = roleConfig.canEditStatus;
  const canClose = roleConfig.canCloseTicket || roleConfig.id === 'superadmin';

  const estadoInfo = ESTADOS.find(e => e.id === incident.estado) || ESTADOS[0];
  const prioridadInfo = PRIORIDADES.find(p => p.id === incident.prioridad) || PRIORIDADES[0];
  const categoriaInfo = CATEGORIES_CONFIG[incident.categoria] || CATEGORIES_CONFIG.computo_redes;

  // Actualización atómica de estado, bitácora y horas (RF-04)
  const handleGuardarAvance = (e) => {
    e.preventDefault();

    if (!comentarioBitacora.trim()) {
      alert('Ingresa una nota o descripción del avance para la bitácora.');
      return;
    }

    const horasSumar = Number(horasNuevas) || 0;
    const isNowResuelta = nuevoEstado === 'resuelta' && incident.estado !== 'resuelta';

    const nuevoRegistroBitacora = {
      fecha: new Date().toISOString(),
      autor: currentRoleUser?.nombre_completo || 'Personal UTM Desk',
      rol_autor: currentRole,
      estado_nuevo: nuevoEstado,
      horas_agregadas: horasSumar,
      comentario: comentarioBitacora.trim()
    };

    const updated = {
      ...incident,
      estado: nuevoEstado,
      horas_invertidas: (incident.horas_invertidas || 0) + horasSumar,
      ...(isNowResuelta ? { fecha_resolucion: new Date().toISOString() } : {}),
      historial_seguimiento: [
        ...(incident.historial_seguimiento || []),
        nuevoRegistroBitacora
      ]
    };

    onUpdateIncident(updated);
    setComentarioBitacora('');
    setHorasNuevas(0);
    alert('Bitácora y estado actualizados correctamente (Operación atómica simulada).');
  };

  // Agregar tag sin duplicados ($addToSet, RF-05)
  const handleAddTag = (e) => {
    e.preventDefault();
    const tagClean = nuevaEtiqueta.trim().startsWith('#') 
      ? nuevaEtiqueta.trim() 
      : `#${nuevaEtiqueta.trim()}`;

    if (!nuevaEtiqueta.trim()) return;

    if (incident.tags && incident.tags.includes(tagClean)) {
      alert(`La etiqueta "${tagClean}" ya existe en este reporte.`);
      return;
    }

    const updatedTags = [...(incident.tags || []), tagClean];
    onUpdateIncident({
      ...incident,
      tags: updatedTags
    });
    setNuevaEtiqueta('');
  };

  // Quitar tag ($pull, RF-05)
  const handleRemoveTag = (tagToRemove) => {
    const updatedTags = (incident.tags || []).filter(t => t !== tagToRemove);
    onUpdateIncident({
      ...incident,
      tags: updatedTags
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Header Modal */}
        <div className="p-6 sm:p-8 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between bg-slate-50/50 dark:bg-slate-800/30">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="font-mono text-base font-black px-3 py-1 rounded-xl bg-amber-500/10 text-amber-300 border border-amber-500/20">
                {incident.folio}
              </span>
              <span className={`text-xs font-bold px-3 py-1 rounded-xl border ${categoriaInfo.badgeBg}`}>
                {categoriaInfo.label}
              </span>
              <span className={`text-xs font-bold px-3 py-1 rounded-xl border ${estadoInfo.color}`}>
                Estado: {estadoInfo.label}
              </span>
              <span className={`text-xs font-bold px-3 py-1 rounded-xl border ${prioridadInfo.color}`}>
                Prioridad: {prioridadInfo.label}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {incident.titulo}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-2xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Pestañas internas del Modal */}
        <div className="px-6 border-b border-slate-100 dark:border-slate-800 flex gap-4 bg-white dark:bg-slate-900">
          <button
            onClick={() => setActiveTab('expediente')}
            className={`py-3.5 text-sm font-bold border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'expediente'
                ? 'border-amber-500 text-amber-500 dark:text-amber-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" /> Expediente y Detalles
          </button>
          <button
            onClick={() => setActiveTab('bitacora')}
            className={`py-3.5 text-sm font-bold border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'bitacora'
                ? 'border-amber-500 text-amber-500 dark:text-amber-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <History className="w-4 h-4" /> Bitácora ({incident.historial_seguimiento?.length || 0})
          </button>
          {canUpdate && (
            <button
              onClick={() => setActiveTab('acciones')}
              className={`py-3.5 text-sm font-bold border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
                activeTab === 'acciones'
                  ? 'border-amber-500 text-amber-500 dark:text-amber-400'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Wrench className="w-4 h-4" /> Actualizar Estatus & Horas
            </button>
          )}
        </div>

        {/* Contenido según pestaña */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1">

          {/* TAB 1: EXPEDIENTE Y DETALLES */}
          {activeTab === 'expediente' && (
            <div className="space-y-6">
              
              {/* Descripción */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Descripción del Reporte
                </span>
                <p className="text-slate-800 dark:text-slate-200 text-sm mt-1 leading-relaxed">
                  {incident.descripcion}
                </p>
              </div>

              {/* Grid Ubicación & Reportante */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Ubicación */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    <Building2 className="w-4 h-4 text-amber-500" />
                    Ubicación en Campus
                  </div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">
                    {incident.ubicacion?.edificio}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {incident.ubicacion?.aula_o_espacio} • {incident.ubicacion?.planta}
                  </div>
                </div>

                {/* Reportante */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    <User className="w-4 h-4 text-amber-500" />
                    Reportante Verificado
                  </div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">
                    {incident.reportante?.nombre}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {incident.reportante?.correo} ({incident.reportante?.tipo_usuario})
                  </div>
                </div>

              </div>

              {/* Subdocumento Polimórfico detalle_especifico */}
              <div className="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/20">
                <div className="flex items-center justify-between mb-3 border-b border-amber-500/20 pb-2">
                  <span className="text-xs font-black uppercase tracking-wider text-amber-300">
                    Detalle Específico ({categoriaInfo.label})
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    subdocumento polimórfico
                  </span>
                </div>

                {incident.categoria === 'computo_redes' && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-slate-500 block">Dispositivo:</span>
                      <strong className="text-slate-900 dark:text-white text-sm">{incident.detalle_especifico?.tipo_dispositivo || 'N/A'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">IP Asignada:</span>
                      <strong className="text-slate-900 dark:text-white font-mono text-sm">{incident.detalle_especifico?.direccion_ip || 'N/A'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">VLAN:</span>
                      <strong className="text-slate-900 dark:text-white text-sm">{incident.detalle_especifico?.vlan || 'N/A'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Puerto Uplink:</span>
                      <strong className="text-slate-900 dark:text-white font-mono text-sm">{incident.detalle_especifico?.puerto_uplink || 'N/A'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Equipos Afectados:</span>
                      <strong className="text-slate-900 dark:text-white text-sm">{incident.detalle_especifico?.equipos_afectados || 0} computadoras</strong>
                    </div>
                  </div>
                )}

                {incident.categoria === 'infraestructura' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-500 block">Tipo de Daño:</span>
                      <strong className="text-slate-900 dark:text-white text-sm capitalize">{incident.detalle_especifico?.tipo_dano || 'N/A'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Riesgo de Seguridad:</span>
                      <strong className="text-slate-900 dark:text-white text-sm uppercase">{incident.detalle_especifico?.riesgo_seguridad || 'Bajo'}</strong>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="text-slate-500 block">Materiales Requeridos:</span>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {Array.isArray(incident.detalle_especifico?.materiales_requeridos) 
                          ? incident.detalle_especifico.materiales_requeridos.map((mat, i) => (
                              <span key={i} className="px-2 py-0.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium">
                                {mat}
                              </span>
                            ))
                          : <span className="text-slate-400">Sin materiales especificados</span>
                        }
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-500 block">¿Requiere Contratista?:</span>
                      <strong className="text-slate-900 dark:text-white">
                        {incident.detalle_especifico?.requiere_contratista_externo ? 'Sí, especialista externo' : 'No, atendible internamente'}
                      </strong>
                    </div>
                  </div>
                )}

                {incident.categoria === 'academico' && (
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-500 block">Plataforma Afectada:</span>
                      <strong className="text-slate-900 dark:text-white text-sm">{incident.detalle_especifico?.plataforma_afectada || 'N/A'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Código de Curso:</span>
                      <strong className="text-slate-900 dark:text-white text-sm font-mono">{incident.detalle_especifico?.codigo_curso || 'N/A'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Periodo Escolar:</span>
                      <strong className="text-slate-900 dark:text-white text-sm">{incident.detalle_especifico?.periodo_escolar || 'N/A'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Estudiantes Impactados:</span>
                      <strong className="text-slate-900 dark:text-white text-sm">{incident.detalle_especifico?.estudiantes_impactados || 0} estudiantes</strong>
                    </div>
                  </div>
                )}
              </div>

              {/* Etiquetas / Tags (RF-05) */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <Tag className="w-4 h-4 text-amber-500" />
                    Etiquetas de Clasificación (RF-05: Sin Repetidos)
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {(incident.tags || []).map((t, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold"
                    >
                      {t}
                      {canUpdate && (
                        <button
                          onClick={() => handleRemoveTag(t)}
                          className="hover:text-rose-500 transition-colors"
                          title="Eliminar etiqueta ($pull)"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </span>
                  ))}

                  {canUpdate && (
                    <form onSubmit={handleAddTag} className="inline-flex items-center gap-1">
                      <input
                        type="text"
                        value={nuevaEtiqueta}
                        onChange={(e) => setNuevaEtiqueta(e.target.value)}
                        placeholder="+ #nueva_etiqueta"
                        className="px-2.5 py-1 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white"
                      />
                      <button
                        type="submit"
                        className="p-1 rounded-lg bg-amber-600 text-white hover:bg-amber-500 cursor-pointer"
                        title="Agregar ($addToSet)"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  )}
                </div>
              </div>

              {/* Evidencias Adjuntas en Supabase Storage (RF-03) */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Evidencias en Almacenamiento Externo (Supabase Storage)
                </h4>
                {incident.evidencias_adjuntas && incident.evidencias_adjuntas.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {incident.evidencias_adjuntas.map((ev, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          {ev.tipo_mime?.includes('image') ? (
                            <img
                              src={ev.url_storage}
                              alt={ev.nombre_archivo}
                              className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
                              <FileText className="w-6 h-6" />
                            </div>
                          )}
                          <div className="truncate">
                            <span className="text-xs font-bold text-slate-900 dark:text-white truncate block">
                              {ev.nombre_archivo}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {ev.peso_kb} KB • Enlace Temporal Activo
                            </span>
                          </div>
                        </div>

                        <a
                          href={ev.url_storage}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 rounded-xl text-amber-400 hover:bg-amber-500/10 transition-colors"
                          title="Abrir evidencia"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No se adjuntaron fotografías ni diagnósticos PDF para este reporte.</p>
                )}
              </div>

            </div>
          )}

          {/* TAB 2: HISTORIAL Y BITÁCORA */}
          {activeTab === 'bitacora' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Historial Cronológico de Seguimiento (Bitácora Acumulativa)
                </span>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  Horas Totales Invertidas: {incident.horas_invertidas || 0} hrs
                </span>
              </div>

              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                {(incident.historial_seguimiento || []).map((item, idx) => (
                  <div key={idx} className="relative">
                    <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-amber-500 border-4 border-white dark:border-slate-900"></div>
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900 dark:text-white">
                            {item.autor}
                          </span>
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                            {item.rol_autor}
                          </span>
                        </div>
                        <span className="text-xs text-slate-400">
                          {new Date(item.fecha).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                        {item.comentario}
                      </p>
                      <div className="mt-2 pt-2 border-t border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between text-xs text-slate-500">
                        <span>Nuevo estatus: <strong className="text-slate-800 dark:text-slate-200">{item.estado_nuevo}</strong></span>
                        {item.horas_agregadas > 0 && (
                          <span className="font-semibold text-amber-400">
                            +{item.horas_agregadas} hrs añadidas
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: ACCIONES OPERATIVAS DEL TÉCNICO / COORDINADOR (RF-04) */}
          {activeTab === 'acciones' && canUpdate && (
            <form onSubmit={handleGuardarAvance} className="space-y-6">
              <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
                <strong>Operación Atómica (RF-04):</strong> Al guardar, se actualizarán en un solo paso: el estado del reporte, se insertará la nueva nota en el historial y se incrementarán de forma acumulada las horas invertidas.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    Cambiar Estado del Reporte
                  </label>
                  <select
                    value={nuevoEstado}
                    onChange={(e) => setNuevoEstado(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white"
                  >
                    <option value="abierta">Abierta</option>
                    <option value="en_proceso">En Proceso</option>
                    <option value="en_espera">En Espera (esperando insumos/piezas)</option>
                    <option value="resuelta">Resuelta (Reparación terminada)</option>
                    {canClose && <option value="cerrada">Cerrada Definitivamente (Solo Coordinador)</option>}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    Horas de Trabajo a Sumar ($inc)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={horasNuevas}
                    onChange={(e) => setHorasNuevas(e.target.value)}
                    placeholder="0.0"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Nota de Bitácora / Acciones Realizadas <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={comentarioBitacora}
                  onChange={(e) => setComentarioBitacora(e.target.value)}
                  placeholder="Detalla qué acciones de reparación o diagnóstico realizaste..."
                  className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="submit"
                  className="px-6 py-3 rounded-2xl font-bold text-sm bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-600/25 flex items-center gap-2 cursor-pointer transition-all"
                >
                  <Send className="w-4 h-4" /> Registrar Avance Atómico
                </button>
              </div>
            </form>
          )}

        </div>

        {/* Footer Modal */}
        <div className="p-4 sm:p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            Creado el {new Date(incident.fecha_creacion).toLocaleDateString()}
            {incident.fecha_resolucion && ` • Resuelto el ${new Date(incident.fecha_resolucion).toLocaleDateString()}`}
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl font-bold text-xs bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
          >
            Cerrar Detalle
          </button>
        </div>

      </div>
    </div>
  );
}
