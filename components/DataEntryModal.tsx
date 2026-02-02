
import React, { useState, useMemo } from 'react';
import { REGIONS, UNES } from '../constants';
import { WeeklyData, NationalMetrics } from '../types';
import { computeEntryData, formatNumber } from '../utils/calculations';

interface DataEntryModalProps {
  week: number;
  year: number;
  onSave: (data: WeeklyData) => void;
  onClose: () => void;
  nationalMetrics: NationalMetrics;
}

const DataEntryModal: React.FC<DataEntryModalProps> = ({ week, year, onSave, onClose, nationalMetrics }) => {
  const [selectedRegionId, setSelectedRegionId] = useState(REGIONS[0].id);
  const [selectedUneId, setSelectedUneId] = useState(UNES.filter(u => u.regionId === REGIONS[0].id)[0].id);
  
  const [formData, setFormData] = useState({
    edoFza: 0,
    altas: 0,
    bajas: 0,
    vacantesIniciales: 0,
    vacantesRealesFS: 0,
    comentarios: ''
  });

  const filteredUnes = useMemo(() => UNES.filter(u => u.regionId === selectedRegionId), [selectedRegionId]);

  const preview = useMemo(() => {
    const raw: WeeklyData = {
      uneId: selectedUneId,
      week,
      year,
      ...formData
    };
    return computeEntryData(raw, nationalMetrics);
  }, [selectedUneId, week, year, formData, nationalMetrics]);

  const handleSave = () => {
    onSave({
      uneId: selectedUneId,
      week,
      year,
      ...formData
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-8 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Captura Semanal S{week}</h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Ingreso manual de indicadores tácticos</p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-slate-200 rounded-xl transition-all">
            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <div className="p-8 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Región</label>
              <select 
                value={selectedRegionId} 
                onChange={(e) => {
                  const rid = e.target.value;
                  setSelectedRegionId(rid);
                  setSelectedUneId(UNES.filter(u => u.regionId === rid)[0].id);
                }}
                className="w-full bg-slate-100 border-2 border-slate-100 rounded-xl px-4 py-3 font-bold text-slate-800 outline-none focus:border-blue-500 transition-all"
              >
                {REGIONS.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Unidad de Negocio</label>
              <select 
                value={selectedUneId} 
                onChange={(e) => setSelectedUneId(e.target.value)}
                className="w-full bg-slate-100 border-2 border-slate-100 rounded-xl px-4 py-3 font-bold text-slate-800 outline-none focus:border-blue-500 transition-all"
              >
                {filteredUnes.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Edo. Fuerza', key: 'edoFza' },
              { label: 'Altas', key: 'altas', color: 'text-emerald-600' },
              { label: 'Bajas', key: 'bajas', color: 'text-rose-600' },
              { label: 'Vac. Iniciales', key: 'vacantesIniciales' },
              { label: 'Vac. Reales FS', key: 'vacantesRealesFS', color: 'text-blue-600' },
            ].map((field) => (
              <div key={field.key} className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase ml-1">{field.label}</label>
                <input 
                  type="number" 
                  value={(formData as any)[field.key]} 
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => setFormData({ ...formData, [field.key]: Number(e.target.value) })}
                  className={`w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 font-black text-lg outline-none focus:bg-white focus:border-blue-500 transition-all ${field.color || 'text-slate-900'}`}
                />
              </div>
            ))}
            <div className="bg-slate-900 rounded-xl p-4 flex flex-col justify-center items-center">
              <span className="text-[8px] font-black text-blue-400 uppercase mb-1">% VACANTES</span>
              <span className="text-2xl font-black text-white">{preview.porcentajeVacantes.toFixed(1)}%</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Observaciones</label>
            <textarea 
              value={formData.comentarios}
              onChange={(e) => setFormData({...formData, comentarios: e.target.value})}
              rows={2}
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 font-bold text-slate-800 outline-none focus:bg-white focus:border-blue-500 transition-all resize-none"
              placeholder="Notas tácticas sobre el comportamiento de la semana..."
            />
          </div>
        </div>

        <div className="p-8 bg-slate-50 border-t border-slate-200 flex gap-4">
          <button onClick={onClose} className="flex-1 py-4 bg-white border-2 border-slate-200 rounded-2xl font-black uppercase text-xs tracking-widest text-slate-500 hover:bg-slate-100 transition-all">Cancelar</button>
          <button onClick={handleSave} className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all">Guardar Captura</button>
        </div>
      </div>
    </div>
  );
};

export default DataEntryModal;
