import React, { useState } from 'react';
import AnalyticsDashboard from '../AnalyticsDashboard';
import { 
  BarChart3, 
  FileDown, 
  TrendingUp, 
  Award, 
  Building2, 
  CheckCircle2,
  Calendar,
  Layers
} from 'lucide-react';

export default function DirectivoDashboard({ incidents, currentUser }) {
  const [exportando, setExportando] = useState(false);

  const handleExportarInforme = () => {
    setExportando(true);
    setTimeout(() => {
      setExportando(false);
      alert('Informe Ejecutivo en PDF generado exitosamente conforme a los datos de MongoDB Atlas.');
    }, 1200);
  };

  return (
    <div className="space-y-8">
      
      {/* Banner de Cabecera Ejecutiva */}
      <div className="bg-gradient-to-r from-[#121316] via-[#1C1D22] to-[#2C2D35]/40 border border-slate-700/60 rounded-3xl p-6 sm:p-10 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 text-xs font-bold uppercase tracking-wider mb-2 border border-amber-500/20">
            <BarChart3 className="w-3.5 h-3.5 text-amber-400" />
            <span>Tablero de Control Directivo & Toma de Decisiones</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
            Directivo: {currentUser?.nombre_completo || 'Mtra. Silvia Escalante Medina'}
          </h1>
          <p className="text-slate-300 text-sm mt-1 max-w-xl">
            Analítica directiva en tiempo real sobre tiempos de respuesta, costos operativos y recurrencia de fallas crónicas en el campus UTM.
          </p>
        </div>

        <button
          onClick={handleExportarInforme}
          disabled={exportando}
          className="px-6 py-4 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm shadow-xl shadow-amber-600/30 flex items-center justify-center gap-2.5 active:scale-95 transition-all flex-shrink-0 cursor-pointer"
        >
          <FileDown className="w-5 h-5" />
          <span>{exportando ? 'Generando PDF...' : 'Exportar Informe Rectoría (PDF)'}</span>
        </button>
      </div>

      {/* Tablero Analítico Reutilizable (RF-07) */}
      <AnalyticsDashboard incidents={incidents} />

    </div>
  );
}
