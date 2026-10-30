import React, { useState } from 'react';
import { 
  CATEGORIES_CONFIG, 
  EDIFICIOS_UTM, 
  PRIORIDADES 
} from '../data/mockData';
import { 
  Laptop, 
  Wrench, 
  GraduationCap, 
  UploadCloud, 
  FileText, 
  Image as ImageIcon, 
  CheckCircle2, 
  AlertCircle,
  X,
  ArrowRight
} from 'lucide-react';

export default function ReportForm({ onAddIncident, onCancel, currentRoleUser }) {
  // Estado universal
  const [categoria, setCategoria] = useState('computo_redes');
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [prioridad, setPrioridad] = useState('media');
  const [edificio, setEdificio] = useState(EDIFICIOS_UTM[0]);
  const [aulaEspacio, setAulaEspacio] = useState('');
  const [planta, setPlanta] = useState('Planta Baja');
  
  // Datos del reportante
  const [nombreReportante, setNombreReportante] = useState(currentRoleUser?.nombre_completo || 'Dra. Laura Beatriz Gómez');
  const [correoReportante, setCorreoReportante] = useState(currentRoleUser?.correo_institucional || 'laura.gomez@utmerida.edu.mx');
  const [tipoUsuario, setTipoUsuario] = useState('docente');

  // Subdocumento polimórfico detalle_especifico
  // Cómputo y Redes
  const [tipoDispositivo, setTipoDispositivo] = useState('Switch');
  const [direccionIp, setDireccionIp] = useState('192.168.10.15');
  const [vlan, setVlan] = useState(20);
  const [puertoUplink, setPuertoUplink] = useState('Gi0/1');
  const [equiposAfectados, setEquiposAfectados] = useState(15);

  // Infraestructura
  const [tipoDano, setTipoDano] = useState('fuga de agua en techo');
  const [riesgoSeguridad, setRiesgoSeguridad] = useState('medio');
  const [materialesRequeridos, setMaterialesRequeridos] = useState('sellador impermeabilizante, pintura');
  const [requiereContratista, setRequiereContratista] = useState(false);

  // Académico
  const [plataformaAfectada, setPlataformaAfectada] = useState('Moodle / Aula Virtual');
  const [codigoCurso, setCodigoCurso] = useState('BDN-501');
  const [periodoEscolar, setPeriodoEscolar] = useState('Septiembre - Diciembre 2026');
  const [estudiantesImpactados, setEstudiantesImpactados] = useState(30);

  // Evidencias (fotos / pdf)
  const [evidencias, setEvidencias] = useState([]);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [newFolioCreated, setNewFolioCreated] = useState('');

  // Manejo de carga de archivos simulados
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    const newItems = files.map(file => ({
      nombre_archivo: file.name,
      tipo_mime: file.type || 'image/jpeg',
      peso_kb: Math.round(file.size / 1024) || 240,
      url_storage: URL.createObjectURL(file),
      fecha_carga: new Date().toISOString()
    }));
    setEvidencias(prev => [...prev, ...newItems]);
  };

  const removeEvidence = (index) => {
    setEvidencias(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!titulo.trim() || !descripcion.trim()) {
      alert('Por favor completa el título y la descripción del reporte.');
      return;
    }

    // Armar subdocumento polimórfico detalle_especifico según categoría (RF-01)
    let detalle_especifico = {};
    let initialTag = '#reporte';

    if (categoria === 'computo_redes') {
      detalle_especifico = {
        tipo_dispositivo: tipoDispositivo,
        direccion_ip: direccionIp,
        vlan: Number(vlan) || 1,
        puerto_uplink: puertoUplink,
        equipos_afectados: Number(equiposAfectados) || 1
      };
      initialTag = `#${tipoDispositivo.toLowerCase().replace(/\s+/g, '_')}`;
    } else if (categoria === 'infraestructura') {
      detalle_especifico = {
        tipo_dano: tipoDano,
        riesgo_seguridad: riesgoSeguridad,
        materiales_requeridos: materialesRequeridos.split(',').map(m => m.trim()).filter(Boolean),
        requiere_contratista_externo: requiereContratista
      };
      initialTag = `#${tipoDano.toLowerCase().replace(/\s+/g, '_').substring(0, 15)}`;
    } else if (categoria === 'academico') {
      detalle_especifico = {
        plataforma_afectada: plataformaAfectada,
        codigo_curso: codigoCurso,
        periodo_escolar: periodoEscolar,
        estudiantes_impactados: Number(estudiantesImpactados) || 1
      };
      initialTag = `#${codigoCurso.toLowerCase().replace(/\s+/g, '_')}`;
    }

    // Generar consecutivo diario simulado (RF-02)
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const folioGenerado = `INC-2026-${randomNum}`;

    const newIncident = {
      _id: Date.now().toString(16) + 'c8d4e123',
      folio: folioGenerado,
      titulo,
      descripcion,
      categoria,
      prioridad,
      estado: 'abierta',
      horas_invertidas: 0,
      reportante: {
        usuario_id: currentRoleUser?._id || '6713f1a9c8d4e12345678905',
        nombre: nombreReportante,
        correo: correoReportante,
        tipo_usuario: tipoUsuario
      },
      ubicacion: {
        edificio,
        aula_o_espacio: aulaEspacio || 'General',
        planta
      },
      detalle_especifico,
      tags: [initialTag, `#${categoria}`],
      evidencias_adjuntas: evidencias,
      historial_seguimiento: [
        {
          fecha: new Date().toISOString(),
          autor: 'Sistema UTM Desk',
          rol_autor: 'sistema',
          estado_nuevo: 'abierta',
          horas_agregadas: 0,
          comentario: `Reporte creado con folio ${folioGenerado}.`
        }
      ],
      fecha_creacion: new Date().toISOString()
    };

    onAddIncident(newIncident);
    setNewFolioCreated(folioGenerado);
    setSubmittedSuccess(true);
  };

  if (submittedSuccess) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-8 sm:p-10 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl text-center">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-6 ring-8 ring-emerald-50 dark:ring-emerald-950/30">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <span className="inline-block text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800 mb-3">
          Reporte Registrado con Éxito
        </span>
        <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
          Folio Asignado
        </h2>
        <div className="my-5 p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/80 font-mono text-2xl font-black text-amber-400 border border-slate-200 dark:border-slate-700 tracking-wider inline-block">
          {newFolioCreated}
        </div>
        <p className="text-slate-600 dark:text-slate-300 text-sm max-w-md mx-auto mb-8">
          Tu incidencia ya está en estado <strong className="text-slate-900 dark:text-white">Abierta</strong> y ha sido canalizada al equipo técnico correspondiente de la UTM.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => {
              setSubmittedSuccess(false);
              setTitulo('');
              setDescripcion('');
              setEvidencias([]);
            }}
            className="px-6 py-3.5 rounded-2xl font-bold text-sm bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            Levantar Otro Reporte
          </button>
          <button
            onClick={onCancel}
            className="px-6 py-3.5 rounded-2xl font-bold text-sm bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            Ver en Mis Incidencias <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto pb-16">
      
      {/* Encabezado del Formulario */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
            Formulario Adaptable de Incidencias (RF-01)
          </span>
          {onCancel && (
            <button
              onClick={onCancel}
              className="text-slate-400 hover:text-slate-200 text-sm font-semibold flex items-center gap-1 cursor-pointer"
            >
              Cancelar
            </button>
          )}
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          Levantar Nuevo Reporte
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base mt-1">
          Completa los datos del incidente. El formulario adaptará sus campos automáticamente según la categoría seleccionada.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">

        {/* PASO 1: Selector de Categoría (Visual, Botones Grandes e Intuitivos) */}
        <div className="p-6 sm:p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <label className="block text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-4">
            1. Selecciona la Categoría de la Falla
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Opción Cómputo */}
            <button
              type="button"
              onClick={() => setCategoria('computo_redes')}
              className={`p-5 rounded-2xl border-2 text-left transition-all duration-200 flex flex-col justify-between cursor-pointer ${
                categoria === 'computo_redes'
                  ? 'border-amber-500/80 bg-amber-500/10 dark:bg-amber-500/15 ring-2 ring-amber-500/20'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-transparent'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`p-3 rounded-xl ${categoria === 'computo_redes' ? 'bg-amber-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
                  <Laptop className="w-6 h-6" />
                </div>
                {categoria === 'computo_redes' && <CheckCircle2 className="w-5 h-5 text-amber-400" />}
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">Cómputo y Redes</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Switches, Wi-Fi, laboratorios, IPs, puertos de red y equipos de cómputo.
                </p>
              </div>
            </button>

            {/* Opción Infraestructura */}
            <button
              type="button"
              onClick={() => setCategoria('infraestructura')}
              className={`p-5 rounded-2xl border-2 text-left transition-all duration-200 flex flex-col justify-between cursor-pointer ${
                categoria === 'infraestructura'
                  ? 'border-amber-500/80 bg-amber-500/10 dark:bg-amber-500/15 ring-2 ring-amber-500/20'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-transparent'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`p-3 rounded-xl ${categoria === 'infraestructura' ? 'bg-amber-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
                  <Wrench className="w-6 h-6" />
                </div>
                {categoria === 'infraestructura' && <CheckCircle2 className="w-5 h-5 text-amber-400" />}
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">Infraestructura</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Filtraciones, luminarias, aire acondicionado, cerraduras e instalaciones.
                </p>
              </div>
            </button>

            {/* Opción Académico */}
            <button
              type="button"
              onClick={() => setCategoria('academico')}
              className={`p-5 rounded-2xl border-2 text-left transition-all duration-200 flex flex-col justify-between cursor-pointer ${
                categoria === 'academico'
                  ? 'border-amber-500/80 bg-amber-500/10 dark:bg-amber-500/15 ring-2 ring-amber-500/20'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-transparent'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`p-3 rounded-xl ${categoria === 'academico' ? 'bg-amber-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
                  <GraduationCap className="w-6 h-6" />
                </div>
                {categoria === 'academico' && <CheckCircle2 className="w-5 h-5 text-amber-400" />}
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">Servicios Académicos</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Aula virtual Moodle, portal de calificaciones y cuentas institucionales.
                </p>
              </div>
            </button>

          </div>
        </div>

        {/* PASO 2: Campos Universales de la Incidencia */}
        <div className="p-6 sm:p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-800 pb-3">
            2. Información General de la Incidencia
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                Título del Problema <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ej. Falla de conexión en Switch del Laboratorio 2"
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-white text-sm font-medium"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                Descripción Detallada <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={3}
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Explica detalladamente qué ocurre, síntomas visibles y momento en que inició..."
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-white text-sm font-medium leading-relaxed"
              />
            </div>

            {/* Ubicación y Prioridad */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                  Edificio del Campus
                </label>
                <select
                  value={edificio}
                  onChange={(e) => setEdificio(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white"
                >
                  {EDIFICIOS_UTM.map(ed => (
                    <option key={ed} value={ed}>{ed}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                  Aula o Espacio Específico
                </label>
                <input
                  type="text"
                  value={aulaEspacio}
                  onChange={(e) => setAulaEspacio(e.target.value)}
                  placeholder="Ej. Lab Redes 2 / Aula 14"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                  Prioridad Estimada
                </label>
                <select
                  value={prioridad}
                  onChange={(e) => setPrioridad(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white"
                >
                  {PRIORIDADES.map(p => (
                    <option key={p.id} value={p.id}>{p.label}</option>
                  ))}
                </select>
              </div>
            </div>

          </div>
        </div>

        {/* PASO 3: Subdocumento Polimórfico detalle_especifico (RF-01) */}
        <div className="p-6 sm:p-8 bg-amber-500/5 dark:bg-[#121316] rounded-3xl border-2 border-dashed border-amber-500/30 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                Campos Especializados de la Categoría
              </span>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Detalle Específico: {CATEGORIES_CONFIG[categoria].label}
              </h3>
            </div>
            <span className="text-xs bg-amber-500/10 text-amber-300 font-bold px-2.5 py-1 rounded-full border border-amber-500/20">
              $jsonSchema Polimórfico
            </span>
          </div>

          {/* Bloque Dinámico: CÓMPUTO Y REDES */}
          {categoria === 'computo_redes' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Tipo de Dispositivo
                </label>
                <input
                  type="text"
                  value={tipoDispositivo}
                  onChange={(e) => setTipoDispositivo(e.target.value)}
                  placeholder="Switch 24 Puertos / AP Cisco"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Dirección IP
                </label>
                <input
                  type="text"
                  value={direccionIp}
                  onChange={(e) => setDireccionIp(e.target.value)}
                  placeholder="192.168.40.2"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-mono text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  VLAN
                </label>
                <input
                  type="number"
                  value={vlan}
                  onChange={(e) => setVlan(e.target.value)}
                  placeholder="40"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Puerto Uplink
                </label>
                <input
                  type="text"
                  value={puertoUplink}
                  onChange={(e) => setPuertoUplink(e.target.value)}
                  placeholder="Gi0/24"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Equipos Afectados (Cantidad)
                </label>
                <input
                  type="number"
                  value={equiposAfectados}
                  onChange={(e) => setEquiposAfectados(e.target.value)}
                  placeholder="28"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white"
                />
              </div>
            </div>
          )}

          {/* Bloque Dinámico: INFRAESTRUCTURA */}
          {categoria === 'infraestructura' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Tipo de Daño Específico
                </label>
                <input
                  type="text"
                  value={tipoDano}
                  onChange={(e) => setTipoDano(e.target.value)}
                  placeholder="Fuga de agua en techo / Falla en minisplit"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Riesgo de Seguridad
                </label>
                <select
                  value={riesgoSeguridad}
                  onChange={(e) => setRiesgoSeguridad(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white"
                >
                  <option value="bajo">Bajo (No representa peligro inminente)</option>
                  <option value="medio">Medio (Riesgo moderado a equipos o paso)</option>
                  <option value="alto">Alto (Peligro eléctrico, colapso o lesión)</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Materiales Estimados Requeridos (separados por coma)
                </label>
                <input
                  type="text"
                  value={materialesRequeridos}
                  onChange={(e) => setMaterialesRequeridos(e.target.value)}
                  placeholder="Sellador impermeabilizante, yeso, pintura vinílica"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white"
                />
              </div>

              <div className="sm:col-span-2 flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <input
                  type="checkbox"
                  id="contratista"
                  checked={requiereContratista}
                  onChange={(e) => setRequiereContratista(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                />
                <label htmlFor="contratista" className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 cursor-pointer">
                  ¿Requiere intervención de proveedor o contratista externo especializado?
                </label>
              </div>
            </div>
          )}

          {/* Bloque Dinámico: ACADÉMICO */}
          {categoria === 'academico' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Plataforma Afectada
                </label>
                <input
                  type="text"
                  value={plataformaAfectada}
                  onChange={(e) => setPlataformaAfectada(e.target.value)}
                  placeholder="Moodle / LMS institucional"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Código de Asignatura / Curso
                </label>
                <input
                  type="text"
                  value={codigoCurso}
                  onChange={(e) => setCodigoCurso(e.target.value)}
                  placeholder="BDN-501"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Periodo Escolar
                </label>
                <input
                  type="text"
                  value={periodoEscolar}
                  onChange={(e) => setPeriodoEscolar(e.target.value)}
                  placeholder="Septiembre - Diciembre 2026"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Estudiantes Impactados (Aprox)
                </label>
                <input
                  type="number"
                  value={estudiantesImpactados}
                  onChange={(e) => setEstudiantesImpactados(e.target.value)}
                  placeholder="35"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white"
                />
              </div>
            </div>
          )}

        </div>

        {/* PASO 4: Carga de Evidencias y Diagnósticos (RF-03) */}
        <div className="p-6 sm:p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                4. Fotografías o Diagnóstico en PDF (RF-03)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Almacenamiento en Supabase Storage privado con enlaces temporales seguros.
              </p>
            </div>
            <span className="text-xs text-slate-400 font-medium">Opcional</span>
          </div>

          {/* Área de Dropzone */}
          <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-amber-500/50 dark:hover:border-amber-500/50 rounded-2xl cursor-pointer bg-slate-50/50 dark:bg-slate-800/40 transition-colors">
            <UploadCloud className="w-10 h-10 text-slate-400 dark:text-slate-500 mb-2" />
            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
              Haz clic para seleccionar o arrastra fotos / PDF aquí
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              Formatos soportados: JPG, PNG, PDF (Máx. 10 MB)
            </span>
            <input
              type="file"
              multiple
              accept="image/*,application/pdf"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          {/* Lista de Evidencias Adjuntas */}
          {evidencias.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {evidencias.map((ev, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="p-2 rounded-lg bg-amber-500/10 text-amber-300">
                      {ev.tipo_mime.includes('image') ? <ImageIcon className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                        {ev.nombre_archivo}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {ev.peso_kb} KB • Supabase Storage
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeEvidence(idx)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-200 dark:hover:bg-slate-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Botón de Enviar Acción Principal */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
          <div className="text-xs text-slate-500 dark:text-slate-400 text-center sm:text-left">
            Al registrar, se asignará un folio correlativo único <span className="font-mono font-bold text-amber-400">INC-2026-XXXX</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="w-full sm:w-auto px-6 py-4 rounded-2xl font-bold text-sm bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                Cancelar
              </button>
            )}
            <button
              type="submit"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-base bg-amber-600 hover:bg-amber-500 text-white shadow-xl shadow-amber-600/25 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Generar y Enviar Reporte</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>

      </form>
    </div>
  );
}
