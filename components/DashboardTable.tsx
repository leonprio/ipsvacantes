
import React, { useState, memo } from 'react';
import { Region, UNE, WeeklyData, NationalMetrics, ComputedData } from '../types';
import { computeEntryData, formatNumber } from '../utils/calculations';

const EditableCell = memo(({ value, onChange, colorClass = "text-slate-900", bgColor = "bg-blue-50/5", highlight = false, userRole, isLarge = false }: any) => {
  if (userRole === 'viewer') {
    return (
      <td className={`px-2 py-2 border-r border-slate-100 text-center ${bgColor} ${highlight ? 'bg-blue-50/60' : ''}`}>
        <span className={`font-black ${isLarge ? 'text-xl' : 'text-base'} ${colorClass}`}>{formatNumber(value)}</span>
      </td>
    );
  }

  return (
    <td className={`px-1 py-1 border-r border-slate-100 ${bgColor} ${highlight ? 'bg-blue-50/60 ring-1 ring-inset ring-blue-100' : ''}`}>
      <input
        type="number"
        inputMode="numeric"
        className={`w-full bg-transparent border-none text-center font-black ${isLarge ? 'text-xl md:text-2xl' : 'text-base md:text-lg'} rounded-lg p-2 ${colorClass} outline-none focus:bg-white focus:ring-2 focus:ring-blue-400 transition-all`}
        value={value}
        onFocus={(e) => e.target.select()}
        onChange={e => onChange(Number(e.target.value))}
      />
    </td>
  );
});

const DiffCell = ({ current, prev, inverse = false }: { current: number, prev: number, inverse?: boolean }) => {
  const diff = inverse ? prev - current : current - prev;
  let colorClass = "text-slate-400";
  if (diff > 0) colorClass = "text-emerald-600 font-black";
  if (diff < 0) colorClass = "text-rose-600 font-black";
  return (
    <td className={`px-2 py-4 text-center border-r border-slate-100 font-bold tabular-nums text-sm md:text-lg ${colorClass}`}>
      {diff > 0 ? `+${formatNumber(diff)}` : formatNumber(diff)}
    </td>
  );
};

const TableRow = memo(({ une, curr, prev, status, handleInlineChange, userRole }: any) => {
  return (
    <tr className="hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0 group">
      <td className="sticky left-0 z-10 px-4 py-4 font-black text-slate-800 border-r border-slate-100 text-[11px] md:text-[14px] bg-white group-hover:bg-slate-50 shadow-[4px_0_12px_rgba(0,0,0,0.05)] min-w-[140px] md:min-w-[180px] truncate">{une.name}</td>
      <td className="px-2 text-center border-r text-xs md:text-[16px] font-bold text-slate-400 bg-slate-50/30">{formatNumber(prev?.edoFza || 0)}</td>
      <EditableCell value={curr?.edoFza || 0} onChange={(v: number) => handleInlineChange(une.id, 'edoFza', v)} userRole={userRole} highlight={true} isLarge={true} />
      <DiffCell current={curr?.edoFza || 0} prev={prev?.edoFza || 0} />
      <td className="px-2 text-center border-r text-xs md:text-[16px] font-bold text-slate-400 bg-slate-50/30">{formatNumber(prev?.altas || 0)}</td>
      <EditableCell value={curr?.altas || 0} onChange={(v: number) => handleInlineChange(une.id, 'altas', v)} colorClass="text-emerald-600" bgColor="bg-emerald-50/20" userRole={userRole} highlight={true} isLarge={true} />
      <DiffCell current={curr?.altas || 0} prev={prev?.altas || 0} />
      <td className="px-2 text-center border-r text-xs md:text-[16px] font-bold text-slate-400 bg-slate-50/30">{formatNumber(prev?.bajas || 0)}</td>
      <EditableCell value={curr?.bajas || 0} onChange={(v: number) => handleInlineChange(une.id, 'bajas', v)} colorClass="text-rose-600" bgColor="bg-rose-50/20" userRole={userRole} highlight={true} isLarge={true} />
      <DiffCell current={curr?.bajas || 0} prev={prev?.bajas || 0} inverse={true} />
      <td className="px-2 text-center border-r text-xs md:text-[16px] font-bold text-slate-400 bg-slate-50/30">{formatNumber(prev?.vacantesIniciales || 0)}</td>
      <EditableCell value={curr?.vacantesIniciales || 0} onChange={(v: number) => handleInlineChange(une.id, 'vacantesIniciales', v)} userRole={userRole} highlight={true} isLarge={true} />
      <DiffCell current={curr?.vacantesIniciales || 0} prev={prev?.vacantesIniciales || 0} inverse={true} />
      <EditableCell value={curr?.vacantesRealesFS || 0} onChange={(v: number) => handleInlineChange(une.id, 'vacantesRealesFS', v)} colorClass="text-blue-800" highlight={true} userRole={userRole} isLarge={true} bgColor="bg-blue-100/20" />
      <td className="px-2 py-4 text-center border-r border-slate-100">
        <div className="flex flex-col items-center gap-1">
          <span className={`inline-block px-2 py-1 rounded-lg text-[10px] md:text-[12px] font-black text-white shadow-sm ${status.bg}`}>
            {curr?.porcentajeVacantes?.toFixed(1) || '0.0'}%
          </span>
          <span className={`text-[8px] font-black uppercase tracking-tighter ${status.bg.replace('bg-', 'text-')}`}>
            {status.bg.includes('emerald') ? 'SALUDABLE' : status.bg.includes('amber') ? 'EN ATENCIÓN' : 'CRÍTICO'}
          </span>
        </div>
      </td>
      <td className="px-4 py-2 min-w-[250px]">
        {userRole !== 'viewer' && (
          <textarea
            className="w-full bg-slate-50/50 border border-slate-200/50 rounded-xl p-3 outline-none text-[10px] font-bold focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
            rows={1}
            placeholder="Comentarios tácticos..."
            value={curr?.comentarios || ''}
            onChange={e => handleInlineChange(une.id, 'comentarios', e.target.value)}
          />
        )}
      </td>
    </tr>
  );
});

interface DashboardTableProps {
  region: Region;
  unes: UNE[];
  allData: WeeklyData[];
  selectedWeek: number;
  selectedYear: number;
  onUpdateData: (data: WeeklyData) => void;
  isOpen: boolean;
  onToggle: () => void;
  nationalMetrics: NationalMetrics;
  userRole: string;
  onUpdateRegion: (id: string, name: string, editor: string) => void;
  onEditUne: (uneId: string) => void;
}

const DashboardTable: React.FC<DashboardTableProps> = ({ region, unes, allData, selectedWeek, selectedYear, isOpen, onToggle, nationalMetrics, userRole, onUpdateRegion, onUpdateData }) => {
  const [isEditingHeader, setIsEditingHeader] = useState(false);
  const [localRegion, setLocalRegion] = useState({ name: region.name, editor: region.editor });

  const prevWeekNum = selectedWeek === 1 ? 52 : selectedWeek - 1;
  const prevYearNum = selectedWeek === 1 ? selectedYear - 1 : selectedYear;

  const getRowData = (uneId: string, week: number, year: number) => {
    const raw = allData.find(d => d.uneId === uneId && d.week === week && d.year === year);
    return computeEntryData(raw || { uneId, week, year, edoFza: 0, altas: 0, bajas: 0, vacantesIniciales: 0, vacantesRealesFS: 0, comentarios: '' }, nationalMetrics);
  };

  const handleInlineChange = (uneId: string, field: keyof WeeklyData, value: any) => {
    if (userRole === 'viewer') return;
    const raw = allData.find(d => d.uneId === uneId && d.week === selectedWeek && d.year === selectedYear) || { uneId, week: selectedWeek, year: selectedYear, edoFza: 0, altas: 0, bajas: 0, vacantesIniciales: 0, vacantesRealesFS: 0, comentarios: '' };
    onUpdateData({ ...raw, [field]: value });
  };

  const handleSaveHeader = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    onUpdateRegion(region.id, localRegion.name, localRegion.editor);
    setIsEditingHeader(false);
  };

  const summary = (unes || []).reduce((acc, une) => {
    const curr = getRowData(une.id, selectedWeek, selectedYear);
    const prev = getRowData(une.id, prevWeekNum, prevYearNum);
    return {
      currEdo: acc.currEdo + curr.edoFza, prevEdo: acc.prevEdo + prev.edoFza,
      currAltas: acc.currAltas + curr.altas, prevAltas: acc.prevAltas + prev.altas,
      currBajas: acc.currBajas + curr.bajas, prevBajas: acc.prevBajas + prev.bajas,
      currVac: acc.currVac + curr.vacantesIniciales, prevVac: acc.prevVac + prev.vacantesIniciales,
      realesFS: acc.realesFS + curr.vacantesRealesFS,
    };
  }, { currEdo: 0, prevEdo: 0, currAltas: 0, prevAltas: 0, currBajas: 0, prevBajas: 0, currVac: 0, prevVac: 0, realesFS: 0 });

  const totalPerc = summary.currEdo > 0 ? (summary.realesFS / summary.currEdo) * 100 : 0;

  const getStatusColor = (perc: number) => {
    const target = nationalMetrics.metas.porcentaje;
    const fulfillment = perc === 0 ? 100 : (target / perc) * 100;
    if (fulfillment >= nationalMetrics.thresholds.green) return 'text-emerald-600 bg-emerald-500';
    if (fulfillment >= nationalMetrics.thresholds.yellow) return 'text-amber-600 bg-amber-500';
    return 'text-rose-600 bg-rose-500';
  };

  return (
    <div className="bg-white rounded-[1.5rem] md:rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden transition-all hover:shadow-lg">
      <div className={`p-5 md:p-8 flex flex-col md:flex-row justify-between items-center gap-4 cursor-pointer transition-all ${isOpen ? 'bg-slate-50 border-b border-slate-200' : 'bg-white hover:bg-slate-50'}`} onClick={onToggle}>
        <div className="flex items-center gap-5 w-full md:w-auto">
          <div className={`p-3 rounded-xl transition-all shadow-sm ${isOpen ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
            <svg className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M9 5l7 7-7 7" /></svg>
          </div>
          <div className="flex flex-col flex-1">
            {isEditingHeader && userRole === 'admin' ? (
              <div className="space-y-3 bg-white p-4 rounded-2xl border border-blue-200 shadow-xl" onClick={e => e.stopPropagation()}>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-blue-500 uppercase tracking-widest">Región</label>
                  <input autoFocus className="bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-2 text-lg font-black text-slate-900 w-full outline-none focus:border-blue-500" value={localRegion.name} onChange={e => setLocalRegion({ ...localRegion, name: e.target.value })} onKeyDown={e => e.key === 'Enter' && handleSaveHeader(e)} />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Responsable</label>
                  <input className="bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-2 text-xs font-black text-slate-500 w-full outline-none focus:border-blue-500" value={localRegion.editor} onChange={e => setLocalRegion({ ...localRegion, editor: e.target.value })} onKeyDown={e => e.key === 'Enter' && handleSaveHeader(e)} />
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={handleSaveHeader} className="flex-1 bg-blue-600 text-white text-[10px] font-black uppercase py-3 rounded-xl shadow-lg">Guardar</button>
                  <button onClick={(e) => { e.stopPropagation(); setIsEditingHeader(false); }} className="flex-1 bg-slate-200 text-slate-600 text-[10px] font-black uppercase py-3 rounded-xl">Cancelar</button>
                </div>
              </div>
            ) : (
              <div className="group relative pr-10">
                <span className="font-black text-xl md:text-[28px] uppercase tracking-tighter text-slate-900 leading-none block">{region.name}</span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1.5 block">{region.editor}</span>
                {userRole === 'admin' && (
                  <button onClick={(e) => { e.stopPropagation(); setIsEditingHeader(true); }} className="absolute -right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-2.5 bg-blue-50 text-blue-600 rounded-xl border border-blue-100 transition-all hover:bg-blue-600 hover:text-white">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                  </button>
                )}
              </div>
            )}
          </div>
          <div className="md:hidden text-right">
            <span className={`text-2xl font-black ${getStatusColor(totalPerc).split(' ')[0]}`}>{totalPerc.toFixed(1)}%</span>
          </div>
        </div>
        <div className="hidden md:block text-right">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">% VACANTES REGIONAL</span>
          <span className={`text-4xl font-black tabular-nums tracking-tighter ${getStatusColor(totalPerc).split(' ')[0]}`}>{totalPerc.toFixed(1)}%</span>
        </div>
      </div>

      {isOpen && (
        <div className="overflow-x-auto relative scrollbar-hide border-t border-slate-100">
          <table className="w-full text-left border-collapse min-w-[1400px]">
            <thead>
              <tr className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em]">
                <th className="sticky left-0 z-20 w-[200px] px-6 py-7 bg-slate-800 text-left border-r border-white/5">UNIDAD DE NEGOCIO</th>
                <th colSpan={3} className="px-2 py-4 text-center border-r border-white/5">ESTADO DE FUERZA</th>
                <th colSpan={3} className="px-2 py-4 text-center border-r border-white/5 bg-emerald-900/40 text-emerald-400">FLUJO DE ALTAS</th>
                <th colSpan={3} className="px-2 py-4 text-center border-r border-white/5 bg-rose-900/40 text-rose-400">FLUJO DE BAJAS</th>
                <th colSpan={3} className="px-2 py-4 text-center border-r border-white/5 bg-blue-900/40 text-blue-400">REPORTE VACANTES</th>
                <th className="px-2 py-4 text-center bg-blue-600 text-white">REALES FS</th>
                <th className="px-4 py-4 text-center">% KP</th>
                <th className="px-5 py-4 text-left">OBSERVACIONES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {unes.map(une => (
                <TableRow key={une.id} une={une} curr={getRowData(une.id, selectedWeek, selectedYear)} prev={getRowData(une.id, prevWeekNum, prevYearNum)} status={{ bg: getStatusColor(getRowData(une.id, selectedWeek, selectedYear).porcentajeVacantes).split(' ')[1] }} handleInlineChange={handleInlineChange} userRole={userRole} />
              ))}
            </tbody>
            <tfoot className="bg-slate-900 text-white font-black text-center sticky bottom-0 z-30">
              <tr className="border-t border-white/20">
                <td className="sticky left-0 z-40 px-6 py-5 bg-slate-800 text-left uppercase text-blue-400 text-[12px] tracking-tight border-r border-white/5">TOTAL REGIONAL</td>
                <td className="px-1 text-slate-500 font-bold">S{prevWeekNum}</td>
                <td className="px-1 text-xl text-blue-400">{formatNumber(summary.currEdo)}</td>
                <td className="px-1 text-slate-400">{formatNumber(summary.currEdo - summary.prevEdo)}</td>
                <td className="px-1 text-slate-500 font-bold">S{prevWeekNum}</td>
                <td className="px-1 text-xl text-emerald-400">{formatNumber(summary.currAltas)}</td>
                <td className="px-1 text-slate-400">{formatNumber(summary.currAltas - summary.prevAltas)}</td>
                <td className="px-1 text-slate-500 font-bold">S{prevWeekNum}</td>
                <td className="px-1 text-xl text-rose-400">{formatNumber(summary.currBajas)}</td>
                <td className="px-1 text-slate-400">{formatNumber(summary.currBajas - summary.prevBajas)}</td>
                <td className="px-1 text-slate-500 font-bold">S{prevWeekNum}</td>
                <td className="px-1 text-xl text-white">{formatNumber(summary.currVac)}</td>
                <td className="px-1 text-slate-400">{formatNumber(summary.currVac - summary.prevVac)}</td>
                <td className="px-1 text-2xl text-blue-400">{formatNumber(summary.realesFS)}</td>
                <td className="px-2"><span className={`px-3 py-1 rounded-lg text-xs shadow-lg ${getStatusColor(totalPerc).split(' ')[1]}`}>{totalPerc.toFixed(1)}%</span></td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
};

export default memo(DashboardTable);
