import React, { useMemo } from 'react';
import { 
  BarChart3, 
  Building2, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp,
  Tag
} from 'lucide-react';

export default function AnalyticsDashboard({ incidents }) {

  // Cálculos estadísticos directivos (RF-07)
  const stats = useMemo(() => {
    const total = incidents.length;
    const resueltas = incidents.filter(i => i.estado === 'resuelta' || i.estado === 'cerrada').length;
    const enProceso = incidents.filter(i => i.estado === 'en_proceso' || i.estado === 'abierta').length;
    const totalHoras = incidents.reduce((acc, curr) => acc + (curr.horas_invertidas || 0), 0);
    const promedioHoras = total > 0 ? (totalHoras / total).toFixed(1) : 0;

    // Pipeline 1 simulado: $group por edificio con sum y avg de horas
    const horasPorEdificio = {};
    incidents.forEach(inc => {
      const ed = inc.ubicacion?.edificio || 'General';
      if (!horasPorEdificio[ed]) {
        horasPorEdificio[ed] = { count: 0, horas: 0 };
      }
      horasPorEdificio[ed].count += 1;
      horasPorEdificio[ed].horas += (inc.horas_invertidas || 0);
    });

    const edificioList = Object.entries(horasPorEdificio)
      .map(([edificio, data]) => ({
        edificio,
        count: data.count,
        horas: data.horas,
        promedio: (data.horas / (data.count || 1)).toFixed(1)
      }))
      .sort((a, b) => b.horas - a.horas);

    // Pipeline 2 simulado: $unwind de tags, $group, $sort y $limit 10
    const tagCount = {};
    incidents.forEach(inc => {
      (inc.tags || []).forEach(tag => {
        tagCount[tag] = (tagCount[tag] || 0) + 1;
      });
    });

    const topTags = Object.entries(tagCount)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const maxHorasEdificio = Math.max(...edificioList.map(e => e.horas), 1);

    return {
      total,
      resueltas,
      enProceso,
      totalHoras,
      promedioHoras,
      edificioList,
      topTags,
      maxHorasEdificio
    };
  }, [incidents]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-400 mb-1">
          <BarChart3 className="w-4 h-4" />
          <span>Panel de Analítica Directiva (RF-07)</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          Métricas y Tiempos de Resolución
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
          Monitoreo en tiempo real del campus UTM para directivos y coordinadores operativos.
        </p>
      </div>

      {/* Tarjetas de Indicadores Principales (KPIs Grandes y Accesibles) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-bold uppercase text-slate-400 block mb-1">
            Total Reportes
          </span>
          <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
            {stats.total}
          </div>
          <span className="text-[11px] font-medium text-slate-500 mt-1 block">
            Registrados en el ciclo
          </span>
        </div>

        <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-bold uppercase text-emerald-600 dark:text-emerald-400 block mb-1">
            Casos Solucionados
          </span>
          <div className="text-3xl sm:text-4xl font-black text-emerald-600 dark:text-emerald-400">
            {stats.resueltas}
          </div>
          <span className="text-[11px] font-medium text-slate-500 mt-1 block">
            {stats.total > 0 ? `${Math.round((stats.resueltas / stats.total) * 100)}% de efectividad` : '0%'}
          </span>
        </div>

        <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-bold uppercase text-amber-400 block mb-1">
            Horas Acumuladas
          </span>
          <div className="text-3xl sm:text-4xl font-black text-amber-400">
            {stats.totalHoras} <span className="text-lg font-bold">hrs</span>
          </div>
          <span className="text-[11px] font-medium text-slate-500 mt-1 block">
            Invertidas por técnicos
          </span>
        </div>

        <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-bold uppercase text-amber-600 dark:text-amber-400 block mb-1">
            Promedio por Caso
          </span>
          <div className="text-3xl sm:text-4xl font-black text-amber-600 dark:text-amber-400">
            {stats.promedioHoras} <span className="text-lg font-bold">hrs</span>
          </div>
          <span className="text-[11px] font-medium text-slate-500 mt-1 block">
            Tiempo de atención técnica
          </span>
        </div>

      </div>

      {/* Gráficas y Pipelines Analíticos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Pipeline 1: Horas por Edificio */}
        <div className="lg:col-span-2 p-6 sm:p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-amber-400" />
                Horas Invertidas por Edificio (Pipeline 1)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                $match, $group por edificio con $sum y $avg de horas invertidas
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {stats.edificioList.map((ed, idx) => {
              const porcentaje = Math.round((ed.horas / stats.maxHorasEdificio) * 100);
              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[200px] sm:max-w-none">
                      {ed.edificio}
                    </span>
                    <div className="flex items-center gap-3 text-slate-500">
                      <span>{ed.count} reporte(s)</span>
                      <strong className="text-slate-900 dark:text-white font-mono">{ed.horas} hrs</strong>
                    </div>
                  </div>
                  <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-600 to-amber-500 rounded-full transition-all duration-500"
                      style={{ width: `${porcentaje}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pipeline 2: Top 10 Fallas Más Frecuentes (Etiquetas) */}
        <div className="p-6 sm:p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Tag className="w-5 h-5 text-purple-600" />
              Top Fallas Campus (Pipeline 2)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              $unwind tags, $group, $sort y $limit 10
            </p>
          </div>

          <div className="space-y-2.5">
            {stats.topTags.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-xs font-semibold"
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center text-[10px] font-black">
                    {idx + 1}
                  </span>
                  <span className="text-slate-800 dark:text-slate-200">{item.tag}</span>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-bold">
                  {item.count} caso(s)
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
