
import React, { useState } from 'react';
import { WeeklyData } from '../types';

interface MappingModalProps {
  rows: string[][];
  onCancel: () => void;
  onConfirm: (data: WeeklyData[]) => void;
  defaultWeek: number;
  defaultYear: number;
}

const FIELDS = [
  { key: 'uneId', label: 'ID Unidad (U1..)' },
  { key: 'week', label: 'Semana (1..52)' },
  { key: 'year', label: 'Año (2026..)' },
  { key: 'edoFza', label: 'Edo. Fuerza' },
  { key: 'altas', label: 'Altas' },
  { key: 'bajas', label: 'Bajas' },
  { key: 'vacantesIniciales', label: 'Vac. Iniciales' },
  { key: 'vacantesRealesFS', label: 'Vac. Reales FS' },
  { key: 'comentarios', label: 'Comentarios' },
];

const MappingModal: React.FC<MappingModalProps> = ({ rows, onCancel, onConfirm, defaultWeek, defaultYear }) => {
  const [mapping, setMapping] = useState<Record<string, number>>({
    uneId: 0,
    week: 1,
    year: 2,
    edoFza: 3,
    altas: 4,
    bajas: 5,
    vacantesIniciales: 6,
    vacantesRealesFS: 7,
    comentarios: 8,
  });

  // Función mejorada para limpiar strings (quita comillas, espacios, etc.)
  const cleanString = (val: string): string => {
    if (!val) return '';
    return val.replace(/"/g, '').trim();
  };

  // Función mejorada para parsear números que vienen con ruido
  const safeParseInt = (val: string): number => {
    if (!val) return 0;
    const clean = val.replace(/"/g, '').replace(/[^0-9.-]/g, '').trim();
    const parsed = parseInt(clean, 10);
    return isNaN(parsed) ? 0 : parsed;
  };

  const handleConfirm = () => {
    const finalEntries: WeeklyData[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (row.length < 1 || row.every(c => c === '')) continue;

      const uneId = mapping.uneId === -1 ? '' : cleanString(row[mapping.uneId]).toUpperCase();
      
      // Validamos que tenga al menos un ID de unidad
      if (!uneId) continue;

      finalEntries.push({
        uneId,
        week: mapping.week === -1 ? defaultWeek : safeParseInt(row[mapping.week]),
        year: mapping.year === -1 ? defaultYear : safeParseInt(row[mapping.year]),
        edoFza: mapping.edoFza === -1 ? 0 : safeParseInt(row[mapping.edoFza]),
        altas: mapping.altas === -1 ? 0 : safeParseInt(row[mapping.altas]),
        bajas: mapping.bajas === -1 ? 0 : safeParseInt(row[mapping.bajas]),
        vacantesIniciales: mapping.vacantesIniciales === -1 ? 0 : safeParseInt(row[mapping.vacantesIniciales]),
        vacantesRealesFS: mapping.vacantesRealesFS === -1 ? 0 : safeParseInt(row[mapping.vacantesRealesFS]),
        comentarios: mapping.comentarios === -1 ? '' : cleanString(row[mapping.comentarios])
      });
    }

    if (finalEntries.length === 0) {
      alert("No se detectaron datos válidos para importar. Revisa el formato de las columnas.");
      return;
    }

    onConfirm(finalEntries);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-xl flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-6xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-12 bg-slate-50 border-b border-slate-200">
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase mb-4">Mapeador Táctico CSV</h2>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">
            SISTEMA DE IMPORTACIÓN REFORZADO - LIMPIEZA AUTOMÁTICA DE COMILLAS Y ESPACIOS ACTIVADA.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-12 space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {FIELDS.map(field => (
              <div key={field.key} className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2">{field.label}</label>
                <select 
                  className="w-full bg-slate-100 border-2 border-slate-200 rounded-2xl px-6 py-4 font-black text-slate-700 focus:ring-4 focus:ring-blue-500/10 appearance-none cursor-pointer"
                  value={mapping[field.key]}
                  onChange={e => setMapping({ ...mapping, [field.key]: Number(e.target.value) })}
                >
                  <option value={-1}>IGNORAR (VALOR POR DEFECTO)</option>
                  {rows[0].map((_, idx) => (
                    <option key={idx} value={idx}>Columna {idx + 1}: {rows[0][idx] ? rows[0][idx].substring(0, 25) : `(Vacía)`}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          <div className="space-y-6">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Vista previa de datos brutos</h4>
            <div className="overflow-x-auto border border-slate-200 rounded-3xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    {rows[0].map((_, idx) => (
                      <th key={idx} className="px-6 py-4 font-black text-slate-400 border-r border-slate-200">Col {idx + 1}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.slice(0, 5).map((row, rIdx) => (
                    <tr key={rIdx} className="border-b border-slate-100 last:border-0">
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className="px-6 py-4 font-bold text-slate-600 border-r border-slate-100">{cell || '-'}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="p-12 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
          <button onClick={onCancel} className="px-10 py-5 bg-white text-slate-500 font-black uppercase tracking-widest rounded-2xl border-2 border-slate-200 hover:bg-slate-100 transition-all">Cancelar</button>
          <button onClick={handleConfirm} className="px-12 py-5 bg-blue-600 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-blue-500/30 hover:bg-blue-700 transition-all">Confirmar e Importar</button>
        </div>
      </div>
    </div>
  );
};

export default MappingModal;
