
import React, { useEffect, useState, useRef } from 'react';
import { ComputedData, NationalMetrics, WeeklyData } from '../types';
import { formatNumber } from '../utils/calculations';

interface NationalSummaryProps {
  userRole: string;
  data: ComputedData[];
  prevData: ComputedData[];
  metrics: NationalMetrics;
  week: number;
  nationalData?: WeeklyData;
  prevNationalData?: WeeklyData;
  onUpdate?: (uneId: string, field: keyof WeeklyData, value: number) => void;
  onViewReport?: () => void;
  hasReport?: boolean;
}

/** Hook de animación: como un odómetro girando hasta el valor correcto */
const useCountUp = (target: number, duration: number = 800): number => {
  const [value, setValue] = useState(target); // Empezar en target para evitar saltos innecesarios si no cambia
  const prevTarget = useRef(target);

  useEffect(() => {
    if (prevTarget.current === target) return;
    const startValue = value;
    prevTarget.current = target;
    const start = performance.now();
    const animate = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(startValue + (target - startValue) * eased));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [target, duration]);
  return value;
};

/** Formatea number con coma de miles MX */
const fmtMiles = (n: number) => n.toLocaleString('es-MX');

const NationalSummary: React.FC<NationalSummaryProps> = ({
  userRole,
  data,
  prevData,
  metrics,
  week,
  nationalData,
  prevNationalData,
  onUpdate,
  onViewReport,
  hasReport
}) => {
  const prevWeek = week === 1 ? 52 : week - 1;

  const aggregate = (dataset: ComputedData[]) => dataset.reduce((acc, curr) => ({
    altas: acc.altas + curr.altas,
    bajas: acc.bajas + curr.bajas,
    vacantes: acc.vacantes + curr.vacantesRealesFS,
    edoFza: acc.edoFza + curr.edoFza,
    vacantesIniciales: (acc.vacantesIniciales || 0) + curr.vacantesIniciales
  }), { altas: 0, bajas: 0, vacantes: 0, edoFza: 0, vacantesIniciales: 0 });

  const totals = aggregate(data);
  const prevTotals = aggregate(prevData);

  const kpiReal = totals.edoFza > 0 ? (totals.vacantes / totals.edoFza) * 100 : 0;
  const metas = metrics.metas;
  const thresholds = metrics.thresholds;

  // ═══ SEMÁFORO: fulfillment = (meta / real) * 100 ═══
  // Usa umbrales de configuración (green=90, yellow=80 por defecto)
  const fulfillmentKPI = kpiReal === 0 ? 100 : (metas.porcentaje / kpiReal) * 100;

  const getStatus = (fulfillment: number) => {
    if (fulfillment >= thresholds.green) return { text: 'text-emerald-400', bg: 'bg-emerald-500', glow: 'shadow-emerald-500/30', label: 'META CUMPLIDA', dotClass: 'bg-emerald-400' };
    if (fulfillment >= thresholds.yellow) return { text: 'text-amber-400', bg: 'bg-amber-500', glow: 'shadow-amber-500/30', label: 'PRECAUCIÓN', dotClass: 'bg-amber-400' };
    return { text: 'text-rose-400', bg: 'bg-rose-500', glow: 'shadow-rose-500/30', label: 'CRÍTICO', dotClass: 'bg-rose-400' };
  };

  const animEdoFza = useCountUp(totals.edoFza);
  const animAltas = useCountUp(totals.altas);
  const animBajas = useCountUp(totals.bajas);
  const animVacCrit = useCountUp(totals.vacantesIniciales);
  const animVacOps = useCountUp(totals.vacantes);

  const altasFulfillment = metas.altas === 0 ? 0 : (totals.altas / metas.altas) * 100;
  const bajasFulfillment = totals.bajas === 0 ? 100 : (metas.bajas / totals.bajas) * 100;
  const vacFulfillment = totals.vacantesIniciales === 0 ? 100 : (metas.vacantes / totals.vacantesIniciales) * 100;

  const semaforoStyle = getStatus(fulfillmentKPI);

  // Total c/ Apoyos
  const totalConApoyos = nationalData?.edoFza || 0;
  const prevConApoyos = prevNationalData?.edoFza || 0;

  const handleEditTotalApoyos = () => {
    if (!onUpdate) return;
    const newVal = prompt("Ingrese el Total con Apoyos (Edo. Fuerza Nacional):", totalConApoyos.toString());
    if (newVal !== null && !isNaN(Number(newVal))) {
      onUpdate('NATIONAL_DATA', 'edoFza', Number(newVal));
    }
  };

  /** Badge de diferencia con semana anterior */
  const Diff = ({ curr, prev, inv = false }: { curr: number; prev: number; inv?: boolean }) => {
    const diff = curr - prev;
    const isGood = inv ? diff <= 0 : diff >= 0;
    return (
      <span className={`text-[12px] md:text-[14px] font-black tabular-nums font-mono-data ${isGood ? 'text-emerald-400' : 'text-rose-400'} ${!isGood ? 'ips-critical-blink' : ''}`}>
        S{prevWeek} {fmtMiles(prev)} <span className="text-[10px] md:text-[12px] opacity-80">{diff > 0 ? `+${fmtMiles(diff)}` : fmtMiles(diff)}</span>
      </span>
    );
  };

  const isEditable = userRole === 'admin' || userRole === 'editor';

  return (
    <div className="mb-4 md:mb-6">
      {/* ═══ UNA SOLA FILA: 6 columnas desktop, 3x2 tablet, scroll móvil ═══ */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-2 md:gap-3">

        {/* 1) Estado de Fuerza + Total c/Apoyos */}
        <div className="ips-metric-card ips-card-animate group">
          <div className="flex justify-between items-start">
            <h4 className="text-[8px] md:text-[10px] font-black text-slate-500 uppercase tracking-wider mb-0.5">Estado de Fuerza</h4>
          </div>
          <span className={`text-2xl md:text-4xl font-black tabular-nums tracking-tighter font-mono-data ips-count-up leading-none ${totals.edoFza >= prevTotals.edoFza ? 'text-white' : 'text-orange-400'}`}>
            {fmtMiles(animEdoFza)}
          </span>
          <Diff curr={totals.edoFza} prev={prevTotals.edoFza} />

          {/* Total c/ Apoyos */}
          <div className={`border-t border-blue-900/30 mt-2 pt-2 relative ${isEditable ? 'cursor-pointer' : ''}`} onClick={isEditable ? handleEditTotalApoyos : undefined}>
            <div className="flex justify-between items-center group/title">
              <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest block">Total c/ Apoyos</span>
              {isEditable && (
                <svg className="w-3 h-3 text-blue-500 opacity-0 group-hover/title:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              )}
            </div>
            <span className="text-xl md:text-3xl font-black text-blue-300 font-mono-data tabular-nums block leading-tight">{fmtMiles(totalConApoyos)}</span>
            <Diff curr={totalConApoyos} prev={prevConApoyos} />
            {isEditable && !nationalData && (
              <span className="text-[8px] font-black text-amber-500 uppercase animate-pulse mt-1 block">Captura Pendiente</span>
            )}
          </div>
        </div>

        {/* 2) Altas Nacional */}
        <div className="ips-metric-card ips-card-animate">
          <div className="flex items-start justify-between mb-1">
            <h4 className="text-[8px] md:text-[11px] font-black text-slate-500 uppercase tracking-wider">Altas Nacional</h4>
            <span className={`px-2 py-0.5 rounded-lg text-[9px] md:text-[11px] font-black text-white shadow-lg ${getStatus(altasFulfillment).bg}`}>{altasFulfillment.toFixed(0)}%</span>
          </div>
          <span className="text-[9px] font-black text-slate-600 uppercase font-mono-data block mb-1">OBJ: {fmtMiles(metas.altas)}</span>
          <span className={`text-2xl md:text-4xl font-black tabular-nums tracking-tighter font-mono-data ips-count-up leading-none ${getStatus(altasFulfillment).text}`}>
            {fmtMiles(animAltas)}
          </span>
          <Diff curr={totals.altas} prev={prevTotals.altas} />
        </div>

        {/* 3) Bajas Nacional */}
        <div className="ips-metric-card ips-card-animate">
          <div className="flex items-start justify-between mb-1">
            <h4 className="text-[8px] md:text-[11px] font-black text-slate-500 uppercase tracking-wider">Bajas Nacional</h4>
            <span className={`px-2 py-0.5 rounded-lg text-[9px] md:text-[11px] font-black text-white shadow-lg ${getStatus(bajasFulfillment).bg}`}>{bajasFulfillment.toFixed(0)}%</span>
          </div>
          <span className="text-[9px] font-black text-slate-600 uppercase font-mono-data block mb-1">LIM: {fmtMiles(metas.bajas)}</span>
          <span className={`text-2xl md:text-4xl font-black tabular-nums tracking-tighter font-mono-data ips-count-up leading-none ${getStatus(bajasFulfillment).text}`}>
            {fmtMiles(animBajas)}
          </span>
          <Diff curr={totals.bajas} prev={prevTotals.bajas} inv={true} />
        </div>

        {/* 4) Vacantes Críticas */}
        <div className="ips-metric-card ips-card-animate">
          <div className="flex items-start justify-between mb-1">
            <h4 className="text-[8px] md:text-[11px] font-black text-slate-500 uppercase tracking-wider">Vac. Críticas</h4>
            <span className={`px-2 py-0.5 rounded-lg text-[9px] md:text-[11px] font-black text-white shadow-lg ${getStatus(vacFulfillment).bg}`}>{vacFulfillment.toFixed(0)}%</span>
          </div>
          <span className="text-[9px] font-black text-slate-600 uppercase font-mono-data block mb-1">LIM: {fmtMiles(metas.vacantes)}</span>
          <span className={`text-2xl md:text-4xl font-black tabular-nums tracking-tighter font-mono-data ips-count-up leading-none ${getStatus(vacFulfillment).text}`}>
            {fmtMiles(animVacCrit)}
          </span>
          <Diff curr={totals.vacantesIniciales} prev={prevTotals.vacantes} inv={true} />
        </div>

        {/* 5) Vacantes Operativas */}
        <div className="ips-metric-card ips-card-animate">
          <div className="flex items-start justify-between mb-1">
            <h4 className="text-[8px] md:text-[11px] font-black text-slate-500 uppercase tracking-wider">Vac. Operativas</h4>
            <span className={`text-[11px] md:text-[13px] font-black font-mono-data ${(totals.vacantes - prevTotals.vacantes) <= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {(totals.vacantes - prevTotals.vacantes) > 0 ? `+${fmtMiles(totals.vacantes - prevTotals.vacantes)}` : fmtMiles(totals.vacantes - prevTotals.vacantes)}
            </span>
          </div>
          <span className="text-[9px] font-black text-slate-600 uppercase font-mono-data block mb-1">META: {fmtMiles(metas.vacantes)}</span>
          <span className={`text-2xl md:text-4xl font-black tabular-nums tracking-tighter font-mono-data ips-count-up leading-none ${getStatus(fulfillmentKPI).text}`}>
            {fmtMiles(animVacOps)}
          </span>
          <Diff curr={totals.vacantes} prev={prevTotals.vacantes} inv={true} />
        </div>

        {/* 6) SEMÁFORO % Vacantes — Prominente */}
        <div className="ips-metric-card ips-metric-card--semaforo ips-card-animate relative overflow-hidden flex flex-col justify-between">
          <div className={`absolute inset-0 opacity-[0.08] ${semaforoStyle.bg}`}></div>
          <div className="relative z-10 flex flex-col h-full justify-between gap-2">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-[10px] md:text-[13px] font-black text-blue-400 uppercase tracking-wider leading-tight">% Vacantes<br />(Semáforo)</h4>
                <span className="text-[9px] md:text-[11px] font-black text-blue-800 uppercase font-mono-data">META: {metas.porcentaje}%</span>
              </div>
              <div className={`w-5 h-5 md:w-8 md:h-8 rounded-full ${semaforoStyle.dotClass} shadow-xl ${semaforoStyle.glow} ips-semaforo-pulse`}></div>
            </div>

            <div className="flex flex-col">
              <span className={`text-4xl md:text-6xl font-black tabular-nums tracking-tighter font-mono-data ips-count-up ${semaforoStyle.text} leading-none`}>
                {kpiReal.toFixed(1)}%
              </span>
              <span className={`text-[9px] md:text-[11px] font-black uppercase tracking-widest ${semaforoStyle.text} opacity-80 mt-1`}>
                {semaforoStyle.label}
              </span>
            </div>

            <span className={`inline-block self-end px-3 py-1 rounded-lg text-[11px] md:text-[14px] font-black text-white ${semaforoStyle.bg} shadow-lg ${semaforoStyle.glow} mt-auto`}>
              {fulfillmentKPI.toFixed(0)}%
            </span>
          </div>
        </div>

      </div>

      {/* ═══ BOTÓN DE ACCESO ESTRATÉGICO (PREMIUM UX) ═══ */}
      {hasReport && onViewReport && (
        <div className="mt-4 md:mt-6 ips-card-animate">
          <button
            onClick={onViewReport}
            className="w-full relative overflow-hidden group rounded-2xl md:rounded-[2rem] p-4 md:p-6 transition-all active:scale-[0.98] shadow-2xl border border-blue-500/30"
          >
            {/* Fondo dinámico HDR */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 opacity-90 group-hover:scale-105 transition-transform duration-700"></div>
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
            <div className="absolute -inset-[100%] bg-gradient-to-r from-transparent via-blue-400/10 to-transparent group-hover:animate-shimmer pointer-events-none"></div>

            <div className="relative z-10 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 md:gap-6">
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.5)] flex items-center justify-center flex-shrink-0 animate-pulse">
                  <svg className="w-6 h-6 md:w-8 md:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <div className="text-left">
                  <h3 className="text-lg md:text-2xl font-black text-white uppercase tracking-tighter leading-none">IPS: Análisis Estratégico de Vacantes S{week}</h3>
                  <p className="text-blue-200/60 text-[9px] md:text-[11px] font-black uppercase tracking-[0.25em] mt-1 md:mt-2">Análisis Ejecutivo por León Prior</p>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full border border-white/10">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">Informe Listo</span>
                </div>
              </div>
            </div>
          </button>
        </div>
      )}
    </div>
  );
};

export default NationalSummary;
