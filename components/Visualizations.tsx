
import React from 'react';
import { 
  XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer, 
  Line, LineChart, ReferenceLine
} from 'recharts';
import { ComputedData } from '../types';
import { formatNumber } from '../utils/calculations';

interface VisualizationsProps {
  trendData: any[];
  metas: { altas: number; bajas: number; vacantes: number; porcentaje: number };
  data: ComputedData[];
}

const COLORS = {
  VACANTES: '#2563eb', // AZUL IPS PURO
  ALTAS: '#10b981',    // ESMERALDA
  BAJAS: '#f43f5e',    // ROSE
  TEXT: '#0f172a',     
  GRID: '#e2e8f0'
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
      <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
          <div className="space-y-1">
            <h4 className="text-3xl font-black text-slate-900 uppercase tracking-tighter leading-none">
              Trayectoria <span className="text-blue-600">Estratégica</span>
            </h4>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Historial Operativo Nacional</p>
          </div>
          
          {/* LEYENDA SUPERIOR ESTANDARIZADA */}
          <div className="flex flex-wrap gap-4 items-center bg-slate-50 px-6 py-4 rounded-2xl border border-slate-100 shadow-inner">
            <div className="flex items-center gap-2">
              <div className="w-6 h-1 bg-blue-600 border border-dashed border-white rounded-full"></div>
              <span className="text-[9px] font-black text-blue-600 uppercase tracking-wider">Meta Vacantes</span>
            </div>
            <div className="flex items-center gap-2 pl-4 border-l border-slate-200">
              <div className="w-6 h-1 bg-emerald-500 border border-dashed border-white rounded-full"></div>
              <span className="text-[9px] font-black text-emerald-600 uppercase tracking-wider">Meta Altas</span>
            </div>
            <div className="flex items-center gap-2 pl-4 border-l border-slate-200">
              <div className="w-6 h-1 bg-rose-500 border border-dashed border-white rounded-full"></div>
              <span className="text-[9px] font-black text-rose-500 uppercase tracking-wider">Meta Bajas</span>
            </div>
          </div>
        </div>

        <div className="h-[420px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            {/* SE ELIMINÓ EL TOOLTIP POR COMPLETO Y SE AJUSTARON MÁRGENES PARA EL EJE X */}
            <LineChart data={processedTrend} margin={{ top: 10, right: 20, bottom: 40, left: 10 }}>
              <CartesianGrid strokeDasharray="8 8" vertical={false} stroke={COLORS.GRID} />
              
              <XAxis 
                dataKey="label" 
                tick={{ fontSize: 13, fontWeight: '900', fill: '#64748b' }} 
                axisLine={false} 
                tickLine={false} 
                dy={15}
                height={60}
              />
              
              <YAxis 
                tick={{ fontSize: 16, fontWeight: '900', fill: COLORS.TEXT }} 
                axisLine={false} 
                tickLine={false} 
                width={80} 
                tickFormatter={(v) => formatNumber(v)}
              />
              
              <Legend 
                verticalAlign="top" 
                align="right" 
                height={80} 
                iconType="circle" 
                wrapperStyle={{ fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em', paddingBottom: '40px' }}
              />
              
              {/* METAS TODAS PUNTEADAS SEGÚN SOLICITUD */}
              <ReferenceLine y={metas.altas} stroke={COLORS.ALTAS} strokeDasharray="5 5" strokeWidth={2} />
              <ReferenceLine y={metas.bajas} stroke={COLORS.BAJAS} strokeDasharray="5 5" strokeWidth={2.5} />
              <ReferenceLine y={metas.vacantes} stroke={COLORS.VACANTES} strokeDasharray="5 5" strokeWidth={2.5} />

              <Line 
                type="monotone" 
                dataKey="altas" 
                stroke={COLORS.ALTAS} 
                strokeWidth={3} 
                name="Altas" 
                dot={{ r: 5, fill: COLORS.ALTAS, strokeWidth: 0 }} 
                isAnimationActive={false}
              />
              <Line 
                type="monotone" 
                dataKey="bajas" 
                stroke={COLORS.BAJAS} 
                strokeWidth={3} 
                name="Bajas" 
                dot={{ r: 5, fill: COLORS.BAJAS, strokeWidth: 0 }} 
                isAnimationActive={false}
              />
              <Line 
                type="monotone" 
                dataKey="vacantes" 
                stroke={COLORS.VACANTES} 
                strokeWidth={8} 
                name="Vacantes" 
                dot={{ r: 7, fill: '#fff', stroke: COLORS.VACANTES, strokeWidth: 4 }} 
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Visualizations;
