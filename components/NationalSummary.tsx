
import React from 'react';
import { ComputedData, NationalMetrics } from '../types';
import { formatNumber } from '../utils/calculations';

interface NationalSummaryProps {
  data: ComputedData[];
  prevData: ComputedData[];
  metrics: NationalMetrics;
  week: number;
}

const NationalSummary: React.FC<NationalSummaryProps> = ({ data, prevData, metrics, week }) => {
  const prevWeek = week === 1 ? 52 : week - 1;

  const aggregate = (dataset: ComputedData[]) => dataset.reduce((acc, curr) => ({
    altas: acc.altas + curr.altas,
    bajas: acc.bajas + curr.bajas,
    vacantes: acc.vacantes + curr.vacantesRealesFS,
    edoFza: acc.edoFza + curr.edoFza
  }), { altas: 0, bajas: 0, vacantes: 0, edoFza: 0 });

  const totals = aggregate(data);
  const prevTotals = aggregate(prevData);

  const kpiReal = totals.edoFza > 0 ? (totals.vacantes / totals.edoFza) * 100 : 0;
  const prevKpiReal = prevTotals.edoFza > 0 ? (prevTotals.vacantes / prevTotals.edoFza) * 100 : 0;
  
  const metas = metrics.metas;
  const thresholds = metrics.thresholds;
  const fulfillmentKPI = kpiReal === 0 ? 100 : (metas.porcentaje / kpiReal) * 100;

  const getStatusColor = (fulfillment: number, isText: boolean = true) => {
    if (fulfillment >= thresholds.green) return isText ? 'text-emerald-600' : 'bg-emerald-500 shadow-lg';
    if (fulfillment >= thresholds.yellow) return isText ? 'text-amber-500' : 'bg-amber-500 shadow-lg';
    return isText ? 'text-rose-600' : 'bg-rose-500 shadow-lg';
  };

  const SummaryCard = ({ title, current, prev, meta, isMinimization = false, metaLabel = 'META', isEdoFza = false, prevWeekNum }: any) => {
    const diff = current - prev;
    const isSuccess = isMinimization ? diff <= 0 : diff >= 0;
    const fulfillment = isMinimization 
        ? (current === 0 ? 100 : (meta / current) * 100)
        : (meta === 0 ? 0 : (current / meta) * 100);

    return (
      <div className="bg-white p-5 rounded-[1.5rem] md:rounded-[2rem] border border-slate-100 shadow-sm flex flex-col hover:shadow-md transition-all">
        <div className="flex justify-between items-start mb-4">
          <div className="space-y-0.5">
            <h4 className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</h4>
            {!isEdoFza && <p className="text-[8px] font-bold text-slate-300 uppercase">{metaLabel}: {formatNumber(meta)}</p>}
          </div>
          {!isEdoFza && <div className={`px-2 py-1 rounded-full text-[9px] font-black text-white ${getStatusColor(fulfillment, false)}`}>{fulfillment.toFixed(0)}%</div>}
        </div>

        <div className="flex items-end justify-between">
          <span className={`text-2xl md:text-4xl font-black tabular-nums tracking-tighter ${isEdoFza ? (current >= prev ? 'text-emerald-600' : 'text-orange-500') : getStatusColor(fulfillment)}`}>
            {formatNumber(current)}
          </span>
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end">
              <span className="text-[7px] font-black text-slate-400 uppercase">S{prevWeekNum}</span>
              <span className="text-sm md:text-lg font-black text-slate-700 tabular-nums">{formatNumber(prev)}</span>
            </div>
            <div className={`flex flex-col items-end pl-3 border-l-2 ${isSuccess ? 'border-emerald-100' : 'border-rose-100'}`}>
              <span className="text-[7px] font-black text-slate-400 uppercase">DIF</span>
              <span className={`text-sm md:text-xl font-black tabular-nums ${isSuccess ? 'text-emerald-600' : 'text-rose-600'}`}>{diff > 0 ? `+${formatNumber(diff)}` : formatNumber(diff)}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4 mb-6 md:mb-10">
      {/* Principal Row: Workforce, Hires, and Terminations */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
        <SummaryCard title="Estado de Fuerza" current={totals.edoFza} prev={prevTotals.edoFza} isEdoFza={true} prevWeekNum={prevWeek} />
        <SummaryCard title="Altas Nacional" current={totals.altas} prev={prevTotals.altas} meta={metas.altas} metaLabel="OBJ" prevWeekNum={prevWeek} />
        <SummaryCard title="Bajas Nacional" current={totals.bajas} prev={prevTotals.bajas} meta={metas.bajas} metaLabel="LIM" isMinimization={true} prevWeekNum={prevWeek} />
      </div>

      {/* Secondary Row: Vacancies and KPI (Narrow density style) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-5">
        <div className="bg-white p-4 rounded-[1.5rem] md:rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between hover:shadow-md transition-all">
          <div className="flex flex-col">
            <h4 className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">Vacantes Operativas</h4>
            <p className="text-[8px] font-bold text-slate-300 uppercase">META: {formatNumber(metas.vacantes)}</p>
          </div>
          <div className="flex items-center gap-6">
            <span className={`text-2xl md:text-3xl font-black tabular-nums tracking-tighter ${getStatusColor(fulfillmentKPI)}`}>
              {formatNumber(totals.vacantes)}
            </span>
            <div className="flex gap-4 border-l pl-4 border-slate-100">
               <div className="flex flex-col items-end">
                  <span className="text-[7px] font-black text-slate-400 uppercase">DIF S{prevWeek}</span>
                  <span className={`text-sm md:text-base font-black ${(totals.vacantes - prevTotals.vacantes) <= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {(totals.vacantes - prevTotals.vacantes) > 0 ? `+${formatNumber(totals.vacantes - prevTotals.vacantes)}` : formatNumber(totals.vacantes - prevTotals.vacantes)}
                  </span>
               </div>
            </div>
          </div>
        </div>

        <div className="bg-[#0f172a] p-4 rounded-[1.5rem] md:rounded-[2rem] shadow-xl border border-blue-900/40 flex items-center justify-between">
          <div className="flex flex-col">
            <h4 className="text-[9px] md:text-[10px] font-black text-blue-400 uppercase tracking-widest">% VACANTES (SEMÁFORO)</h4>
            <span className="text-[8px] font-bold text-blue-900 uppercase">META: {metas.porcentaje}%</span>
          </div>
          <div className="flex items-center gap-6">
            <span className={`text-2xl md:text-3xl font-black tabular-nums tracking-tighter ${getStatusColor(fulfillmentKPI)}`}>
              {kpiReal.toFixed(1)}%
            </span>
            <div className="flex items-center gap-2">
               <div className={`w-3 h-3 rounded-full animate-pulse ${getStatusColor(fulfillmentKPI, false)}`}></div>
               <span className={`text-[10px] font-black uppercase tracking-widest ${getStatusColor(fulfillmentKPI)}`}>
                  {fulfillmentKPI >= thresholds.green ? 'SALUDABLE' : fulfillmentKPI >= thresholds.yellow ? 'EN ATENCIÓN' : 'CRÍTICO'}
               </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NationalSummary;
