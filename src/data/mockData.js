// Datos sintéticos iniciales basados en las especificaciones oficiales de UTM Desk

export const INITIAL_USERS = [
  {
    _id: "6713f1a9c8d4e12345678901",
    matricula_o_empleado: "EMP-2026-089",
    nombre_completo: "Carlos Eduardo Méndez Pech",
    correo_institucional: "carlos.mendez@utmerida.edu.mx",
    password: "tecnico123",
    rol: "tecnico",
    area_asignada: "computo_redes",
    activo: true,
    fecha_registro: "2026-10-19T14:00:00.000Z"
  },
  {
    _id: "6713f1a9c8d4e12345678905",
    matricula_o_empleado: "DOC-2026-014",
    nombre_completo: "Dra. Laura Beatriz Gómez",
    correo_institucional: "laura.gomez@utmerida.edu.mx",
    password: "reportante123",
    rol: "reportante",
    area_asignada: "academico",
    activo: true,
    fecha_registro: "2026-10-15T08:30:00.000Z"
  },
  {
    _id: "6713f1a9c8d4e12345678906",
    matricula_o_empleado: "DOC-2026-022",
    nombre_completo: "Mtro. Jorge Alberto Cetina Uc",
    correo_institucional: "jorge.cetina@utmerida.edu.mx",
    password: "reportante123",
    rol: "reportante",
    area_asignada: "academico",
    activo: true,
    fecha_registro: "2026-10-16T10:00:00.000Z"
  },
  {
    _id: "6713f1a9c8d4e12345678908",
    matricula_o_empleado: "ADM-2026-003",
    nombre_completo: "Ing. Roberto Solís Castillo",
    correo_institucional: "roberto.solis@utmerida.edu.mx",
    password: "coordinador123",
    rol: "coordinador",
    area_asignada: "general",
    activo: true,
    fecha_registro: "2026-09-01T09:00:00.000Z"
  },
  {
    _id: "6713f1a9c8d4e12345678910",
    matricula_o_empleado: "DIR-2026-001",
    nombre_completo: "Mtra. Silvia Escalante Medina",
    correo_institucional: "silvia.escalante@utmerida.edu.mx",
    password: "directivo123",
    rol: "directivo",
    area_asignada: "general",
    activo: true,
    fecha_registro: "2026-08-15T11:00:00.000Z"
  },
  {
    _id: "6713f1a9c8d4e12345678912",
    matricula_o_empleado: "SIS-2026-001",
    nombre_completo: "Lic. Andrea Moguel Carrillo",
    correo_institucional: "andrea.moguel@utmerida.edu.mx",
    password: "admin123",
    rol: "admin",
    area_asignada: "general",
    activo: true,
    fecha_registro: "2026-08-01T08:00:00.000Z"
  },
  {
    _id: "6713f1a9c8d4e12345678915",
    matricula_o_empleado: "ROOT-2026-001",
    nombre_completo: "Ing. Super Administrador Cloud",
    correo_institucional: "superadmin@utmerida.edu.mx",
    password: "superadmin123",
    rol: "superadmin",
    area_asignada: "general",
    activo: true,
    fecha_registro: "2026-07-01T08:00:00.000Z"
  },
  {
    _id: "6ae4d0525591169843d4c830",
    matricula_o_empleado: "SUPER-2026-001",
    nombre_completo: "Lizandro Reyes",
    correo_institucional: "lizandro.reyes@utmetropolitana.edu.mx",
    password: "superadmin123",
    rol: "superadmin",
    area_asignada: "general",
    activo: true,
    fecha_registro: "2026-10-30T10:00:00.000Z"
  }
];

export const INITIAL_INCIDENTS = [
  {
    _id: "6713f4b2c8d4e12345678999",
    folio: "INC-2026-0042",
    titulo: "Falla de conexión en Switch principal del Laboratorio 2",
    descripcion: "Las computadoras no tienen salida a internet y el puerto principal marca luz ámbar.",
    categoria: "computo_redes",
    prioridad: "alta",
    estado: "resuelta",
    horas_invertidas: 3.5,
    reportante: {
      usuario_id: "6713f1a9c8d4e12345678905",
      nombre: "Dra. Laura Beatriz Gómez",
      correo: "laura.gomez@utmerida.edu.mx",
      tipo_usuario: "docente"
    },
    ubicacion: {
      edificio: "Edificio K",
      aula_o_espacio: "Laboratorio de Redes 2",
      planta: "Planta Alta"
    },
    detalle_especifico: {
      tipo_dispositivo: "Switch 24 Puertos",
      direccion_ip: "192.168.40.2",
      vlan: 40,
      puerto_uplink: "Gi0/24",
      equipos_afectados: 28
    },
    tags: ["#switch", "#sin_red", "#vlan_40"],
    evidencias_adjuntas: [
      {
        nombre_archivo: "foto_switch_puerto24.jpg",
        tipo_mime: "image/jpeg",
        peso_kb: 380,
        url_storage: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=600&q=80",
        fecha_carga: "2026-10-19T09:15:00.000Z"
      }
    ],
    historial_seguimiento: [
      {
        fecha: "2026-10-19T09:00:00.000Z",
        autor: "Sistema UTM Desk",
        rol_autor: "sistema",
        estado_nuevo: "abierta",
        horas_agregadas: 0,
        comentario: "Reporte creado con folio INC-2026-0042."
      },
      {
        fecha: "2026-10-19T12:30:00.000Z",
        autor: "Carlos Eduardo Méndez Pech",
        rol_autor: "tecnico",
        estado_nuevo: "resuelta",
        horas_agregadas: 3.5,
        comentario: "Se cambió el conector dañado en el puerto Gi0/24 y regresó la red."
      }
    ],
    fecha_creacion: "2026-10-19T09:00:00.000Z",
    fecha_resolucion: "2026-10-19T12:30:00.000Z"
  },
  {
    _id: "6713f4b2c8d4e12345678a01",
    folio: "INC-2026-0043",
    titulo: "Filtración de agua en el techo del Aula 12",
    descripcion: "Durante la lluvia hay goteo constante sobre el área de pupitres.",
    categoria: "infraestructura",
    prioridad: "media",
    estado: "en_proceso",
    horas_invertidas: 1.5,
    reportante: {
      usuario_id: "6713f1a9c8d4e12345678906",
      nombre: "Mtro. Jorge Alberto Cetina Uc",
      correo: "jorge.cetina@utmerida.edu.mx",
      tipo_usuario: "docente"
    },
    ubicacion: {
      edificio: "Edificio B",
      aula_o_espacio: "Aula 12",
      planta: "Planta Baja"
    },
    detalle_especifico: {
      tipo_dano: "fuga de agua en techo",
      riesgo_seguridad: "medio",
      materiales_requeridos: ["sellador impermeabilizante", "placa de yeso", "pintura vinílica"],
      requiere_contratista_externo: false
    },
    tags: ["#filtracion", "#techo", "#aula_12"],
    evidencias_adjuntas: [
      {
        nombre_archivo: "goteo_aula12.jpg",
        tipo_mime: "image/jpeg",
        peso_kb: 512,
        url_storage: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80",
        fecha_carga: "2026-10-20T08:10:00.000Z"
      }
    ],
    historial_seguimiento: [
      {
        fecha: "2026-10-20T08:00:00.000Z",
        autor: "Sistema UTM Desk",
        rol_autor: "sistema",
        estado_nuevo: "abierta",
        horas_agregadas: 0,
        comentario: "Reporte creado con folio INC-2026-0043."
      },
      {
        fecha: "2026-10-20T11:00:00.000Z",
        autor: "Rosa María Chan Pool",
        rol_autor: "tecnico",
        estado_nuevo: "en_proceso",
        horas_agregadas: 1.5,
        comentario: "Se localizó el punto de filtración y se colocó cubeta provisional."
      }
    ],
    fecha_creacion: "2026-10-20T08:00:00.000Z"
  },
  {
    _id: "6713f4b2c8d4e12345678b02",
    folio: "INC-2026-0044",
    titulo: "Sin acceso al aula virtual del curso de Bases de Datos",
    descripcion: "Los estudiantes reciben error de autenticación al ingresar al curso en la plataforma institucional.",
    categoria: "academico",
    prioridad: "alta",
    estado: "abierta",
    horas_invertidas: 0,
    reportante: {
      usuario_id: "6713f1a9c8d4e12345678907",
      nombre: "Ing. Mariana Pat Canché",
      correo: "mariana.pat@utmerida.edu.mx",
      tipo_usuario: "docente"
    },
    ubicacion: {
      edificio: "Edificio A",
      aula_o_espacio: "Sala de Docentes",
      planta: "Planta Baja"
    },
    detalle_especifico: {
      plataforma_afectada: "Moodle/LMS",
      codigo_curso: "BDN-501",
      periodo_escolar: "Septiembre-Diciembre 2026",
      estudiantes_impactados: 35
    },
    tags: ["#lms", "#acceso", "#bdn_501"],
    evidencias_adjuntas: [
      {
        nombre_archivo: "error_login_lms.png",
        tipo_mime: "image/png",
        peso_kb: 215,
        url_storage: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80",
        fecha_carga: "2026-10-20T10:05:00.000Z"
      }
    ],
    historial_seguimiento: [
      {
        fecha: "2026-10-20T10:00:00.000Z",
        autor: "Sistema UTM Desk",
        rol_autor: "sistema",
        estado_nuevo: "abierta",
        horas_agregadas: 0,
        comentario: "Reporte creado con folio INC-2026-0044."
      }
    ],
    fecha_creacion: "2026-10-20T10:00:00.000Z"
  },
  {
    _id: "6713f4b2c8d4e12345678c03",
    folio: "INC-2026-0045",
    titulo: "Aire acondicionado gotea y no enfría en Laboratorio CTI-3",
    descripcion: "El minisplit presenta ruido de ventilador y tira agua sobre los escritorios de cómputo.",
    categoria: "infraestructura",
    prioridad: "alta",
    estado: "en_espera",
    horas_invertidas: 2.0,
    reportante: {
      usuario_id: "6713f1a9c8d4e12345678905",
      nombre: "Dra. Laura Beatriz Gómez",
      correo: "laura.gomez@utmerida.edu.mx",
      tipo_usuario: "docente"
    },
    ubicacion: {
      edificio: "Edificio K",
      aula_o_espacio: "Laboratorio CTI-3",
      planta: "Planta Baja"
    },
    detalle_especifico: {
      tipo_dano: "climatización y fuga de condensado",
      riesgo_seguridad: "medio",
      materiales_requeridos: ["gas refrigerante R410A", "manguera de desagüe 5/8"],
      requiere_contratista_externo: true
    },
    tags: ["#aire_acondicionado", "#climatizacion", "#cti_3"],
    evidencias_adjuntas: [],
    historial_seguimiento: [
      {
        fecha: "2026-10-21T11:00:00.000Z",
        autor: "Sistema UTM Desk",
        rol_autor: "sistema",
        estado_nuevo: "abierta",
        horas_agregadas: 0,
        comentario: "Reporte creado con folio INC-2026-0045."
      },
      {
        fecha: "2026-10-21T13:30:00.000Z",
        autor: "Carlos Eduardo Méndez Pech",
        rol_autor: "tecnico",
        estado_nuevo: "en_espera",
        horas_agregadas: 2.0,
        comentario: "Se diagnosticó falta de refrigerante y se solicitó insumos a almacén."
      }
    ],
    fecha_creacion: "2026-10-21T11:00:00.000Z"
  },
  {
    _id: "6713f4b2c8d4e12345678d04",
    folio: "INC-2026-0046",
    titulo: "Punto de acceso Wi-Fi intermitente en explanada principal",
    descripcion: "El AP Cisco del Edificio D se desconecta cada 15 minutos saturando la red móvil.",
    categoria: "computo_redes",
    prioridad: "media",
    estado: "abierta",
    horas_invertidas: 0,
    reportante: {
      usuario_id: "6713f1a9c8d4e12345678906",
      nombre: "Mtro. Jorge Alberto Cetina Uc",
      correo: "jorge.cetina@utmerida.edu.mx",
      tipo_usuario: "docente"
    },
    ubicacion: {
      edificio: "Edificio D",
      aula_o_espacio: "Explanada y Cafetería",
      planta: "Planta Baja"
    },
    detalle_especifico: {
      tipo_dispositivo: "Access Point Wi-Fi 6",
      direccion_ip: "192.168.10.85",
      vlan: 10,
      puerto_uplink: "Gi0/12",
      equipos_afectados: 60
    },
    tags: ["#wifi", "#ap_cisco", "#intermitente"],
    evidencias_adjuntas: [],
    historial_seguimiento: [
      {
        fecha: "2026-10-22T08:30:00.000Z",
        autor: "Sistema UTM Desk",
        rol_autor: "sistema",
        estado_nuevo: "abierta",
        horas_agregadas: 0,
        comentario: "Reporte creado con folio INC-2026-0046."
      }
    ],
    fecha_creacion: "2026-10-22T08:30:00.000Z"
  }
];

export const CATEGORIES_CONFIG = {
  computo_redes: {
    id: "computo_redes",
    label: "Cómputo y Redes",
    shortLabel: "Cómputo",
    description: "Switches, Wi-Fi, laboratorios, IPs, cableado y equipos de cómputo.",
    color: "amber",
    badgeBg: "bg-amber-500/10 text-amber-300 border-amber-500/20",
    accentColor: "border-amber-500/30 text-amber-400"
  },
  infraestructura: {
    id: "infraestructura",
    label: "Infraestructura y Mantenimiento",
    shortLabel: "Infraestructura",
    description: "Filtraciones, luminarias, aire acondicionado, cerraduras y albañilería.",
    color: "orange",
    badgeBg: "bg-orange-500/10 text-orange-300 border-orange-500/20",
    accentColor: "border-orange-500/30 text-orange-400"
  },
  academico: {
    id: "academico",
    label: "Servicios Académicos",
    shortLabel: "Académico",
    description: "Aula virtual (Moodle/LMS), portal de calificaciones y correo institucional.",
    color: "slate",
    badgeBg: "bg-slate-500/10 text-slate-300 border-slate-500/20",
    accentColor: "border-slate-500/30 text-slate-300"
  }
};

export const EDIFICIOS_UTM = [
  "Edificio A (Aulas y Dirección)",
  "Edificio B (Aulas y Tutorías)",
  "Edificio C (Laboratorios de Idiomas)",
  "Edificio D (Cafetería y Biblioteca)",
  "Edificio E (Auditorio y Vinculación)",
  "Edificio K (Laboratorios CTI y Redes)"
];

export const PRIORIDADES = [
  { id: "baja", label: "Baja", color: "bg-slate-500/10 text-slate-300 border-slate-500/20" },
  { id: "media", label: "Media", color: "bg-amber-500/10 text-amber-300 border-amber-500/20" },
  { id: "alta", label: "Alta", color: "bg-orange-500/10 text-orange-300 border-orange-500/20" },
  { id: "critica", label: "Crítica", color: "bg-rose-500/10 text-rose-300 border-rose-500/20" }
];

export const ESTADOS = [
  { id: "abierta", label: "Abierta", color: "bg-sky-500/10 text-sky-300 border-sky-500/20" },
  { id: "en_proceso", label: "En Proceso", color: "bg-amber-500/10 text-amber-300 border-amber-500/20" },
  { id: "en_espera", label: "En Espera", color: "bg-orange-500/10 text-orange-300 border-orange-500/20" },
  { id: "resuelta", label: "Resuelta", color: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20" },
  { id: "cerrada", label: "Cerrada", color: "bg-slate-500/10 text-slate-400 border-slate-500/20" }
];

export const ROLES_CONFIG = {
  reportante: {
    id: "reportante",
    title: "Reportante",
    description: "Estudiante, docente o personal administrativo. Levanta reportes y consulta los propios.",
    badge: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
    canCreate: true,
    canEditStatus: false,
    canViewStats: false,
    canManageUsers: false,
    filterOnlyOwn: true
  },
  tecnico: {
    id: "tecnico",
    title: "Técnico Operativo",
    description: "Especialista de soporte. Atiende incidencias de su área, registra horas y bitácora.",
    badge: "bg-amber-500/10 text-amber-300 border-amber-500/20",
    canCreate: true,
    canEditStatus: true,
    canViewStats: false,
    canManageUsers: false,
    filterOnlyOwn: false
  },
  coordinador: {
    id: "coordinador",
    title: "Coordinador",
    description: "Supervisa todo el campus: reasigna, cierra casos y analiza estadísticas operativas.",
    badge: "bg-sky-500/10 text-sky-300 border-sky-500/20",
    canCreate: true,
    canEditStatus: true,
    canCloseTicket: true,
    canViewStats: true,
    canManageUsers: true,
    filterOnlyOwn: false
  },
  directivo: {
    id: "directivo",
    title: "Directivo",
    description: "Consulta analítica directiva del campus en tiempo real para toma de decisiones.",
    badge: "bg-slate-500/10 text-slate-300 border-slate-500/20",
    canCreate: true,
    canEditStatus: false,
    canViewStats: true,
    canManageUsers: false,
    filterOnlyOwn: false
  },
  admin: {
    id: "admin",
    title: "Administrador del Sistema",
    description: "Gestiona las cuentas y accesos de usuario (alta, rol, activación/desactivación).",
    badge: "bg-rose-500/10 text-rose-300 border-rose-500/20",
    canCreate: false,
    canEditStatus: false,
    canViewStats: true,
    canManageUsers: true,
    filterOnlyOwn: false
  },
  superadmin: {
    id: "superadmin",
    title: "Super Admin",
    description: "Mantenimiento integral de la App y control de auditoría de 60 días.",
    badge: "bg-amber-500/15 text-amber-200 border-amber-500/30",
    canCreate: true,
    canEditStatus: true,
    canCloseTicket: true,
    canViewStats: true,
    canManageUsers: true,
    filterOnlyOwn: false
  }
};
