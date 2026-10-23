# UTM Desk - Mesa Central de Incidencias Universitarias

Sistema web y móvil responsivo para la gestión y seguimiento de incidencias en el campus de la Universidad Tecnológica Metropolitana (Mérida).

## 🚀 Características Principales

- **Arquitectura Adaptable por Rol:** Interfaces dedicadas y optimizadas para los 6 roles del sistema:
  - 👤 **Reportante:** Interfaz limpia para estudiantes y docentes con botón de reporte rápido y seguimiento con folio único.
  - 🛠️ **Técnico Operativo:** Consola técnica con columnas Kanban, contador de horas y bitácora acumulativa.
  - 📋 **Coordinador:** Supervisión global del campus, reasignación y cierre definitivo administrativo.
  - 📊 **Directivo:** Analítica ejecutiva con tiempo promedio de resolución por edificio y ranking de las 10 fallas más frecuentes.
  - ⚙️ **Administrador del Sistema:** Gestión centralizada de perfiles y accesos en la colección auxiliar `usuarios`.
  - 🛡️ **Super Admin:** Telemetría de servicios cloud (MongoDB Atlas M0, Upstash Redis y Supabase Storage) y verificación de limpieza TTL a 60 días.
- **Formulario Adaptable Polimórfico (RF-01):**
  - Cómputo y Redes: IP, VLAN, puerto uplink, equipos afectados.
  - Infraestructura: Tipo de daño, riesgo, materiales, contratista externo.
  - Servicios Académicos: Plataforma Moodle/LMS, código de curso, periodo escolar.
- **Folio Consecutivo Diario (RF-02):** Consecutivo institucional simulado (ej. `INC-2026-XXXX`).
- **Evidencias en la Nube (RF-03):** Dropzone con almacenamiento de metadatos y enlaces temporales.
- **Operaciones Atómicas (RF-04):** Actualización simultánea de estatus, historial acumulado de bitácora y horas trabajadas.
- **Tema Claro y Oscuro:** Selector persistente con alto contraste y diseño accesible.

## 🛠️ Tecnologías Utilizadas

- **Frontend:** React 19, Vite, Tailwind CSS v4, Lucide React.
- **Persistencia y Cloud:** MongoDB Atlas (M0), Upstash Redis, Supabase Storage.

## 💻 Instalación y Uso

1. Clonar el repositorio:
   ```bash
   git clone https://github.com/DIEGO-UTM890/DEF_Repo.git
   cd DEF_Repo/app  # o la carpeta raíz
   ```

2. Instalar dependencias:
   ```bash
   npm install
   ```

3. Iniciar el servidor de desarrollo:
   ```bash
   npm run dev
   ```

4. Compilar para producción:
   ```bash
   npm run build
   ```
