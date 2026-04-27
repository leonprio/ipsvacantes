
import React from 'react';
import {
  XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer,
  Line, LineChart, ReferenceLine, Tooltip
} from 'recharts';
import { ComputedData } from '../types';
import { formatNumber } from '../utils/calculations';

interface VisualizationsProps {
  trendData: any[];
  metas: { altas: number; bajas: number; vacantes: number; porcentaje: number };
  data: ComputedData[];
}

// Paleta de ALTO CONTRASTE para Diseñador UX de Clase Mundial
const COLORS = {
  VACANTES: '#00D1FF', // Cyan Eléctrico (Super contraste)
  ALTAS: '#10B981',    // Esmeralda Vibrante
  BAJAS: '#FF3B3B',    // Rojo Intenso
  GRID: 'rgba(255, 255, 255, 0.05)',
  TEXT: '#64748B',     // Slate para ejes
  METAS: 'rgba(255, 255, 255, 0.4)', // Metas más visibles
};

/** Tooltip Minimalista de Alto Contraste */
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0f172a] border border-blue-500/40 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] px-5 py-4 backdrop-blur-md">
      <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-3">{label}</p>
      <div className="space-y-2.5">
        {payload.map((entry: any, i: number) => (
          <div key={i} className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px_rgba(entry.color,0.5)]" style={{ backgroundColor: entry.color }}></div>
              <span className="text-[11px] font-black text-white uppercase tracking-tight">{entry.name}</span>
            </div>
            <span className="text-base font-black text-white tabular-nums font-mono-data">{formatNumber(entry.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const Visualizations: React.FC<VisualizationsProps> = ({ trendData, metas }) => {
  const processedTrend = trendData.map(t => ({
    ...t,
    metaAltas: metas.altas,
    metaBajas: metas.bajas,
    metaVacantes: metas.vacantes,
  }));

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="bg-[#030712] p-6 md:p-10 rounded-[2.5rem] border border-white/5 shadow-2xl relative">
        {/* Header de la Gráfica */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div className="space-y-1.5">
            <h4 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter leading-none">
              TRAYECTORIA <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">ESTRATÉGICA</span>
            </h4>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em]">Historical Core Intelligence • 12 Semanas</p>
            </div>
          </div>

          {/* Leyenda Personalizada de Alto Impacto */}
          <div className="flex gap-5 px-6 py-3.5 bg-white/[0.02] rounded-2xl border border-white/5 shadow-inner">
            <div className="flex items-center gap-2.5">
              <div className="w-4 h-1 rounded-full bg-cyan-400"></div>
              <span className="text-[9px] font-black text-cyan-400 uppercase tracking-widest">Vacantes</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-4 h-1 rounded-full bg-emerald-500"></div>
              <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Altas</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-4 h-1 rounded-full bg-rose-500"></div>
              <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest">Bajas</span>
            </div>
          </div>
        </div>

        {/* Chart Container */}
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={processedTrend} margin={{ top: 20, right: 30, bottom: 20, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={COLORS.GRID} />

              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fill: COLORS.TEXT, fontSize: 11, fontWeight: 900 }}
                dy={15}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: COLORS.TEXT, fontSize: 12, fontWeight: 900 }}
                tickFormatter={(v) => formatNumber(v)}
                width={70}
              />

              <Tooltip content={<CustomTooltip />} />

              {/* Metas como Líneas de Referencia Sólidas Súper Visibles */}
              <ReferenceLine y={metas.vacantes} stroke={COLORS.VACANTES} strokeDasharray="3 3" strokeWidth={3} strokeOpacity={1} />
              <ReferenceLine y={metas.altas} stroke={COLORS.ALTAS} strokeDasharray="3 3" strokeWidth={3} strokeOpacity={1} />
              <ReferenceLine y={metas.bajas} stroke={COLORS.BAJAS} strokeDasharray="3 3" strokeWidth={3} strokeOpacity={1} />

              {/* LÍNEAS DE ALTO CONTRASTE - SIN ÁREAS SOMBREADAS (UX CLEAN) */}
              <Line
                type="monotone"
                dataKey="vacantes"
                stroke={COLORS.VACANTES}
                strokeWidth={5} // Más grueso
                dot={{ r: 6, fill: '#030712', stroke: COLORS.VACANTES, strokeWidth: 3 }}
                activeDot={{ r: 9, fill: COLORS.VACANTES }}
                name="Vacantes"
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="altas"
                stroke={COLORS.ALTAS}
                strokeWidth={3}
                dot={{ r: 4, fill: '#030712', stroke: COLORS.ALTAS, strokeWidth: 2 }}
                name="Altas"
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="bajas"
                stroke={COLORS.BAJAS}
                strokeWidth={3}
                dot={{ r: 4, fill: '#030712', stroke: COLORS.BAJAS, strokeWidth: 2 }}
                name="Bajas"
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Footer info sutil */}
        <div className="mt-8 pt-6 border-t border-white/5 flex justify-between items-center px-2">
          <p className="text-[8px] font-black text-slate-600 uppercase tracking-[0.3em]">IPS Intelligence Dashboard v9.5 • Full HDR Display</p>
          <div className="flex gap-4">
            <span className="text-[8px] font-black text-emerald-500/50 uppercase tracking-widest">Contraste: 100%</span>
            <span className="text-[8px] font-black text-blue-500/50 uppercase tracking-widest">UX: Optimized</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Visualizations;
