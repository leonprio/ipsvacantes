
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
    <div className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-xl flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col">
        <div className="p-10 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">Configuración Táctica</h2>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-2">Ajuste de Metas Nacionales y Umbrales de Semáforo</p>
          </div>
          <button onClick={onClose} className="p-4 hover:bg-slate-200 rounded-2xl transition-all">
            <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <div className="p-12 space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <h3 className="text-xs font-black text-blue-600 uppercase tracking-[0.2em] border-b border-blue-100 pb-3">Objetivos Nacionales</h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Meta Altas</label>
                  <input type="number" value={localConfig.metas.altas} onChange={e => handleUpdate('metas.altas', Number(e.target.value))} className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl p-4 font-black text-slate-800 focus:border-blue-500 outline-none" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Meta Bajas</label>
                  <input type="number" value={localConfig.metas.bajas} onChange={e => handleUpdate('metas.bajas', Number(e.target.value))} className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl p-4 font-black text-slate-800 focus:border-blue-500 outline-none" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Meta Vacantes</label>
                  <input type="number" value={localConfig.metas.vacantes} onChange={e => handleUpdate('metas.vacantes', Number(e.target.value))} className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl p-4 font-black text-slate-800 focus:border-blue-500 outline-none" />
                </div>
                <div className="col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">% VACANTES VS EDO FZA (META)</label>
                  <input type="number" step="0.1" value={localConfig.metas.porcentaje} onChange={e => handleUpdate('metas.porcentaje', Number(e.target.value))} className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl p-4 font-black text-slate-800 focus:border-blue-500 outline-none" />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-xs font-black text-emerald-600 uppercase tracking-[0.2em] border-b border-emerald-100 pb-3">Umbrales Semáforo (CUMPLIMIENTO %)</h3>
              <div className="space-y-6">
                <div className="flex items-center gap-6 p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
                  <div className="w-4 h-4 rounded-full bg-emerald-500"></div>
                  <div className="flex-1">
                    <label className="text-[10px] font-black text-emerald-800 uppercase tracking-widest mb-1 block">Logro Óptimo (Verde)</label>
                    <p className="text-[9px] text-emerald-600/60 font-bold uppercase mb-3">Si el cumplimiento es ≥ 90%</p>
                    <input type="number" step="0.1" value={localConfig.thresholds.green} onChange={e => handleUpdate('thresholds.green', Number(e.target.value))} className="w-full bg-white border-2 border-emerald-200 rounded-xl p-3 font-black text-emerald-900 focus:border-emerald-500 outline-none" />
                  </div>
                </div>
                <div className="flex items-center gap-6 p-6 bg-amber-50 rounded-2xl border border-amber-100">
                  <div className="w-4 h-4 rounded-full bg-amber-500"></div>
                  <div className="flex-1">
                    <label className="text-[10px] font-black text-amber-800 uppercase tracking-widest mb-1 block">Logro en Alerta (Amarillo)</label>
                    <p className="text-[9px] text-amber-600/60 font-bold uppercase mb-3">Si el cumplimiento es ≥ 80%</p>
                    <input type="number" step="0.1" value={localConfig.thresholds.yellow} onChange={e => handleUpdate('thresholds.yellow', Number(e.target.value))} className="w-full bg-white border-2 border-amber-200 rounded-xl p-3 font-black text-amber-900 focus:border-amber-500 outline-none" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-10 bg-slate-50 border-t border-slate-200 flex justify-end gap-4">
          <button onClick={onClose} className="px-8 py-4 bg-white text-slate-500 font-black uppercase tracking-widest rounded-2xl border-2 border-slate-200 hover:bg-slate-100 transition-all">Cancelar</button>
          <button onClick={() => onSave(localConfig)} className="px-10 py-4 bg-blue-600 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-blue-500/30 hover:bg-blue-700 transition-all">Guardar Cambios</button>
        </div>
      </div>
    </div>
  );
};

export default ConfigPanel;
