
import React, { useState } from 'react';
import { NationalMetrics } from '../types';

interface ConfigPanelProps {
  config: NationalMetrics;
  onSave: (config: NationalMetrics) => void;
  onClose: () => void;
}

const ConfigPanel: React.FC<ConfigPanelProps> = ({ config, onSave, onClose }) => {
  const [localConfig, setLocalConfig] = useState(config);

  const handleUpdate = (path: string, val: number) => {
    const keys = path.split('.');
    const next = { ...localConfig };
    (next as any)[keys[0]][keys[1]] = val;
    setLocalConfig(next);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-xl flex items-start md:items-center justify-center p-3 md:p-6 overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-2xl md:rounded-[2rem] shadow-2xl overflow-hidden flex flex-col my-4">
        {/* Header compacto */}
        <div className="px-6 py-5 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
          <div>
            <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tighter uppercase leading-none">Configuración Táctica</h2>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[9px] mt-1">Metas Nacionales y Umbrales de Semáforo</p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-slate-200 rounded-xl transition-all" aria-label="Cerrar configuración">
            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Content compacto */}
        <div className="px-6 py-6 space-y-8 max-h-[70vh] overflow-y-auto">
          {/* SECCIÓN 1: OBJETIVOS */}
          <section className="space-y-4">
            <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-[0.25em] flex items-center gap-2">
              <span className="w-8 h-1 bg-blue-600 rounded-full"></span>
              Objetivos Nacionales de Operación
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Meta Mensual de Altas</label>
                <div className="relative">
                  <input type="number" value={localConfig.metas.altas} onChange={e => handleUpdate('metas.altas', Number(e.target.value))} className="w-full bg-white border-2 border-slate-100 rounded-xl p-3 font-black text-slate-900 focus:border-blue-500 outline-none text-xl transition-all" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400">ALTAS</span>
                </div>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Límite Máximo de Bajas</label>
                <div className="relative">
                  <input type="number" value={localConfig.metas.bajas} onChange={e => handleUpdate('metas.bajas', Number(e.target.value))} className="w-full bg-white border-2 border-slate-100 rounded-xl p-3 font-black text-slate-900 focus:border-blue-500 outline-none text-xl transition-all" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400">BAJAS</span>
                </div>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Límite de Vacantes Totales</label>
                <div className="relative">
                  <input type="number" value={localConfig.metas.vacantes} onChange={e => handleUpdate('metas.vacantes', Number(e.target.value))} className="w-full bg-white border-2 border-slate-100 rounded-xl p-3 font-black text-slate-900 focus:border-blue-500 outline-none text-xl transition-all" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400">POS</span>
                </div>
              </div>
              <div className="bg-blue-600/5 p-4 rounded-2xl border-2 border-blue-100">
                <label className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-2 block">% Vacantes Permitido (Meta)</label>
                <div className="relative">
                  <input type="number" step="0.1" value={localConfig.metas.porcentaje} onChange={e => handleUpdate('metas.porcentaje', Number(e.target.value))} className="w-full bg-white border-2 border-blue-200 rounded-xl p-3 font-black text-blue-900 focus:border-blue-600 outline-none text-xl transition-all" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-blue-600">% KPI</span>
                </div>
              </div>
            </div>
          </section>

          {/* SECCIÓN 2: SEMÁFOROS */}
          <section className="space-y-4">
            <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-[0.25em] flex items-center gap-2">
              <span className="w-8 h-1 bg-emerald-500 rounded-full"></span>
              Umbrales de Cumplimiento (Semáforo)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-4 p-4 bg-emerald-50 rounded-2xl border-2 border-emerald-100 group transition-all hover:bg-emerald-100">
                <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                </div>
                <div className="flex-1">
                  <label className="text-[9px] font-black text-emerald-800 uppercase tracking-widest block">Verde (Cumplimiento ≥)</label>
                  <input type="number" step="0.1" value={localConfig.thresholds.green} onChange={e => handleUpdate('thresholds.green', Number(e.target.value))} className="w-full bg-white border-2 border-emerald-200 rounded-lg p-2 font-black text-emerald-900 focus:border-emerald-500 outline-none text-xl mt-1" />
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-amber-50 rounded-2xl border-2 border-amber-100 lg:group transition-all hover:bg-amber-100">
                <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                </div>
                <div className="flex-1">
                  <label className="text-[9px] font-black text-amber-800 uppercase tracking-widest block">Amarillo (Preventivo ≥)</label>
                  <input type="number" step="0.1" value={localConfig.thresholds.yellow} onChange={e => handleUpdate('thresholds.yellow', Number(e.target.value))} className="w-full bg-white border-2 border-amber-200 rounded-lg p-2 font-black text-amber-900 focus:border-amber-500 outline-none text-xl mt-1" />
                </div>
              </div>
            </div>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest text-center mt-2 px-6">
              * El estado <span className="text-rose-600 font-black">Rojo (Crítico)</span> se activa automáticamente si no se alcanza el nivel preventivo.
            </p>
          </section>

          {/* SECCIÓN 3: PERIODOS - HD PREMIUN */}
          <section className="bg-slate-900 p-6 rounded-[2rem] border-2 border-blue-500/30 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[60px] rounded-full"></div>

            <div className="flex items-center justify-between mb-6 relative z-10">
              <div className="flex items-center gap-4">
                <div className="bg-blue-600 w-12 h-12 rounded-2xl shadow-xl flex items-center justify-center">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
                <div>
                  <h3 className="text-lg font-black text-white uppercase tracking-tighter">Sincronización Master</h3>
                  <p className="text-blue-400/60 text-[9px] font-black uppercase tracking-[0.2em] mt-0.5">Control de Visibilidad Global</p>
                </div>
              </div>

              <button
                onClick={() => {
                  const next = { ...localConfig };
                  next.globalPeriod.syncEnabled = !next.globalPeriod.syncEnabled;
                  setLocalConfig(next);
                }}
                className={`relative inline-flex h-8 w-16 items-center rounded-full transition-all duration-500 focus:outline-none ${localConfig.globalPeriod.syncEnabled ? 'bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.5)]' : 'bg-slate-700'}`}
              >
                <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-all duration-500 shadow-md ${localConfig.globalPeriod.syncEnabled ? 'translate-x-9' : 'translate-x-1'}`} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6 relative z-10">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest pl-1">Semana Fiscal</label>
                <div className="flex items-center gap-3">
                  <input type="number" min="1" max="52" value={localConfig.globalPeriod.week} onChange={e => { const n = { ...localConfig }; n.globalPeriod.week = Number(e.target.value); setLocalConfig(n); }} className="w-full bg-white/10 border-2 border-white/5 rounded-2xl p-4 text-2xl font-black text-white focus:border-blue-500 outline-none transition-all placeholder-white/20" />
                  <div className="flex flex-col gap-2">
                    <button onClick={() => { const n = { ...localConfig }; n.globalPeriod.week = Math.min(52, n.globalPeriod.week + 1); setLocalConfig(n); }} className="w-10 h-10 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl flex items-center justify-center text-white transition-all"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 15l7-7 7 7" /></svg></button>
                    <button onClick={() => { const n = { ...localConfig }; n.globalPeriod.week = Math.max(1, n.globalPeriod.week - 1); setLocalConfig(n); }} className="w-10 h-10 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl flex items-center justify-center text-white transition-all"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M19 9l-7 7-7-7" /></svg></button>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest pl-1">Año de Gestión</label>
                <input type="number" value={localConfig.globalPeriod.year} onChange={e => { const n = { ...localConfig }; n.globalPeriod.year = Number(e.target.value); setLocalConfig(n); }} className="w-full bg-white/10 border-2 border-white/5 rounded-2xl p-4 text-2xl font-black text-white focus:border-blue-500 outline-none transition-all" />
              </div>
            </div>

            {localConfig.globalPeriod.syncEnabled && (
              <div className="mt-6 p-4 bg-emerald-500/10 border-2 border-emerald-500/30 rounded-2xl animate-pulse">
                <p className="text-emerald-400 text-[10px] font-black uppercase tracking-widest text-center flex items-center justify-center gap-2">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
                  Sincronización Activa: Semana {localConfig.globalPeriod.week} Force-Sync
                </p>
              </div>
            )}
          </section>
        </div>

        {/* Footer compacto */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
          <button onClick={onClose} className="px-6 py-3 bg-white text-slate-500 font-black uppercase tracking-widest text-xs rounded-xl border-2 border-slate-200 hover:bg-slate-100 transition-all" aria-label="Cancelar cambios">Cancelar</button>
          <button onClick={() => onSave(localConfig)} className="px-8 py-3 bg-blue-600 text-white font-black uppercase tracking-widest text-xs rounded-xl shadow-xl shadow-blue-500/30 hover:bg-blue-700 transition-all" aria-label="Guardar cambios">Guardar</button>
        </div>
      </div>
    </div>
  );
};

export default ConfigPanel;
