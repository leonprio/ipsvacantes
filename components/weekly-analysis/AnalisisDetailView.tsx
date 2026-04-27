
import React from 'react';
import { WeeklyAnalysis, SemaforoStatus } from '../../types';
import { formatNumber } from '../../utils/calculations';

interface AnalisisDetailViewProps {
    analysis: WeeklyAnalysis;
    onClose: () => void;
}

const semaforoColor = (status: SemaforoStatus) => {
    if (status === 'verde') return { bg: 'bg-emerald-500', text: 'text-emerald-400', border: 'border-emerald-500/30', bgLight: 'bg-emerald-500/10' };
    if (status === 'amarillo') return { bg: 'bg-amber-500', text: 'text-amber-400', border: 'border-amber-500/30', bgLight: 'bg-amber-500/10' };
    return { bg: 'bg-rose-500', text: 'text-rose-400', border: 'border-rose-500/30', bgLight: 'bg-rose-500/10' };
};

const AnalisisDetailView: React.FC<AnalisisDetailViewProps> = ({ analysis, onClose }) => {
    const sc = semaforoColor(analysis.semaforoVacantes.status);

    const handleExportPDF = () => {
        window.print();
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-lg z-[200] flex items-start justify-center overflow-y-auto">
            <div className="w-full max-w-4xl mx-4 my-6 md:my-12 print:m-0 print:max-w-none" id="analisis-print">
                {/* Header Ejecutivo */}
                <div className="bg-gradient-to-r from-[#0f172a] to-[#1e293b] rounded-t-3xl p-8 border border-blue-900/40 border-b-0 print:rounded-none">
                    <div className="flex items-start justify-between mb-6 print:hidden">
                        <div className="flex gap-2">
                            <button onClick={handleExportPDF} className="px-4 py-2 bg-blue-600/20 text-blue-400 rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-blue-600/30 transition-colors flex items-center gap-2" aria-label="Exportar como PDF">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                Exportar PDF
                            </button>
                        </div>
                        <button onClick={onClose} className="w-10 h-10 bg-rose-500/20 rounded-xl flex items-center justify-center text-rose-400 hover:bg-rose-500/30 transition-colors" aria-label="Cerrar vista detalle">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>

                    <h1 className="text-2xl md:text-4xl font-black text-white uppercase tracking-tighter mb-2">
                        IPS: Análisis Estratégico de Vacantes
                    </h1>
                    <p className="text-blue-300/60 text-sm font-bold">
                        Análisis Ejecutivo: Cierre Semana {analysis.semana} • Por {analysis.autor}
                    </p>
                    <p className="text-blue-400/40 text-xs mt-1">
                        {new Date(analysis.fechaCierre).toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </div>

                <div className="bg-[#0A0F1E] border-x border-blue-900/40 space-y-6 p-6 md:p-8">

                    {/* Estado de Fuerza Nacional */}
                    <div className="bg-gradient-to-r from-[#1e3a5f] to-[#1e293b] rounded-2xl p-6 md:p-8 border border-blue-800/40 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                        <div className="relative z-10">
                            <h3 className="text-[10px] font-black text-blue-300/60 uppercase tracking-[0.3em] mb-4">Estado de Fuerza Nacional</h3>
                            <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
                                <div>
                                    <span className="text-5xl md:text-7xl font-black text-white tabular-nums tracking-tighter ips-count-up">
                                        {formatNumber(analysis.estadoFuerza.elementosActivos)}
                                    </span>
                                    <span className="text-blue-300/50 text-lg font-bold ml-3">elementos activos</span>
                                </div>
                                <div className="bg-[#0f172a] rounded-xl p-4 border border-blue-900/40 text-center min-w-[140px]">
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-1">Meta Esperada</span>
                                    <span className="text-2xl font-black text-white tabular-nums">{formatNumber(analysis.estadoFuerza.metaEsperada)}</span>
                                </div>
                            </div>
                            {analysis.estadoFuerza.descripcion && (
                                <p className="text-blue-200/40 text-sm leading-relaxed mt-5 border-t border-blue-800/30 pt-5">
                                    {analysis.estadoFuerza.descripcion}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Termómetro Operativo */}
                    <div>
                        <h2 className="text-lg font-black text-white uppercase tracking-tighter mb-1 flex items-center gap-3">
                            <span className="text-xl">📊</span>
                            Termómetro Operativo S{analysis.semana}
                        </h2>
                        <p className="text-slate-500 text-xs mb-5">
                            Desempeño frente a las metas establecidas para la Semana {analysis.semana}.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Altas */}
                            <div className="bg-[#111827] rounded-2xl p-5 border-l-4 border-blue-500 border-t border-r border-b border-blue-900/30">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">Altas Nacionales</h4>
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black text-white ${analysis.termometro.altasNacionales.porcentaje >= 90 ? 'bg-emerald-500' : analysis.termometro.altasNacionales.porcentaje >= 70 ? 'bg-amber-500' : 'bg-rose-500'}`}>
                                        {analysis.termometro.altasNacionales.porcentaje}% Meta
                                    </span>
                                </div>
                                <span className="text-3xl font-black text-blue-400 tabular-nums ips-count-up">{formatNumber(analysis.termometro.altasNacionales.valorReal)}</span>
                                <div className="mt-3 pt-3 border-t border-blue-900/30">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-slate-500">Meta (Obj):</span>
                                        <span className="text-white font-bold">{formatNumber(analysis.termometro.altasNacionales.meta)}</span>
                                    </div>
                                </div>
                                {analysis.termometro.altasNacionales.comentario && (
                                    <p className="text-slate-500 text-[11px] mt-3 leading-relaxed">{analysis.termometro.altasNacionales.comentario}</p>
                                )}
                            </div>

                            {/* Bajas */}
                            <div className="bg-[#111827] rounded-2xl p-5 border-l-4 border-rose-500 border-t border-r border-b border-blue-900/30">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">Bajas Nacionales</h4>
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black text-white ${analysis.termometro.bajasNacionales.porcentaje <= 100 ? 'bg-emerald-500' : 'bg-rose-500'}`}>
                                        +{Math.max(0, analysis.termometro.bajasNacionales.porcentaje - 100)}% Desvío
                                    </span>
                                </div>
                                <span className="text-3xl font-black text-rose-400 tabular-nums ips-count-up">{formatNumber(analysis.termometro.bajasNacionales.valorReal)}</span>
                                <div className="mt-3 pt-3 border-t border-blue-900/30">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-slate-500">Límite Máximo:</span>
                                        <span className="text-white font-bold">{formatNumber(analysis.termometro.bajasNacionales.meta)}</span>
                                    </div>
                                </div>
                                {analysis.termometro.bajasNacionales.comentario && (
                                    <p className="text-slate-500 text-[11px] mt-3 leading-relaxed">{analysis.termometro.bajasNacionales.comentario}</p>
                                )}
                            </div>

                            {/* Vacantes Operativas */}
                            <div className="bg-[#111827] rounded-2xl p-5 border-l-4 border-amber-500 border-t border-r border-b border-blue-900/30">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">Vacantes Operativas</h4>
                                    <span className="px-3 py-1 rounded-full text-[10px] font-black text-white bg-amber-500">
                                        {analysis.termometro.vacantesOperativas.valorReal > analysis.termometro.vacantesOperativas.meta ? '+' : ''}
                                        {analysis.termometro.vacantesOperativas.valorReal - analysis.termometro.vacantesOperativas.meta} vs Meta
                                    </span>
                                </div>
                                <span className="text-3xl font-black text-amber-400 tabular-nums ips-count-up">{formatNumber(analysis.termometro.vacantesOperativas.valorReal)}</span>
                                <div className="mt-3 pt-3 border-t border-blue-900/30">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-slate-500">Meta:</span>
                                        <span className="text-white font-bold">{formatNumber(analysis.termometro.vacantesOperativas.meta)}</span>
                                    </div>
                                </div>
                                {analysis.termometro.vacantesOperativas.comentario && (
                                    <p className="text-slate-500 text-[11px] mt-3 leading-relaxed">{analysis.termometro.vacantesOperativas.comentario}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Semáforo KPI */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className={`${sc.bgLight} rounded-2xl p-6 border ${sc.border} relative overflow-hidden`}>
                            <div className={`absolute top-0 right-0 w-24 h-24 ${sc.bg} opacity-10 rounded-full blur-3xl -mr-8 -mt-8`}></div>
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">% Vacantes (Semáforo)</h4>
                            <div className="flex items-end gap-3">
                                <span className={`text-5xl font-black tabular-nums ${sc.text}`}>{analysis.semaforoVacantes.porcentajeActual.toFixed(1)}%</span>
                                <span className={`px-3 py-1.5 rounded-full text-xs font-black text-white uppercase ${sc.bg}`}>{analysis.semaforoVacantes.status}</span>
                            </div>
                            <p className="text-slate-500 text-xs mt-2">Meta: {analysis.semaforoVacantes.meta}%</p>
                        </div>

                        <div className="bg-[#111827] rounded-2xl p-6 border border-blue-900/30">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Vacantes Críticas</h4>
                            <span className={`text-4xl font-black tabular-nums ${analysis.vacantesCriticas.diferencia > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                                {formatNumber(analysis.vacantesCriticas.valorReal)}
                            </span>
                            <div className="flex items-center gap-4 mt-2">
                                <span className="text-xs text-slate-500">Límite: {formatNumber(analysis.vacantesCriticas.limite)}</span>
                                <span className={`text-sm font-black ${analysis.vacantesCriticas.diferencia > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                                    {analysis.vacantesCriticas.diferencia > 0 ? '+' : ''}{formatNumber(analysis.vacantesCriticas.diferencia)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Análisis Ejecutivo */}
                    <div className="bg-[#111827] rounded-2xl p-6 md:p-8 border border-blue-900/30">
                        <h3 className="text-sm font-black text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            Análisis Ejecutivo
                        </h3>
                        <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{analysis.analisisEjecutivo}</p>
                    </div>

                    {/* Alertas */}
                    {analysis.alertas.length > 0 && (
                        <div className="bg-rose-500/5 rounded-2xl p-6 border border-rose-500/20">
                            <h3 className="text-sm font-black text-rose-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 17c-.77 1.333.192 3 1.732 3z" /></svg>
                                Alertas / Puntos Críticos
                            </h3>
                            <div className="space-y-3">
                                {analysis.alertas.map((alerta) => (
                                    <div key={alerta.id} className="flex items-start gap-3 bg-rose-500/5 rounded-xl p-3">
                                        <span className="text-rose-400 mt-0.5 flex-shrink-0">⚠️</span>
                                        <p className="text-slate-300 text-sm">{alerta.texto}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Recomendaciones */}
                    {analysis.recomendaciones.length > 0 && (
                        <div className="bg-emerald-500/5 rounded-2xl p-6 border border-emerald-500/20">
                            <h3 className="text-sm font-black text-emerald-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                Recomendaciones Estratégicas
                            </h3>
                            <div className="space-y-3">
                                {analysis.recomendaciones.map((rec) => (
                                    <div key={rec.id} className="flex items-start gap-3 bg-emerald-500/5 rounded-xl p-3">
                                        <span className="text-emerald-400 mt-0.5 flex-shrink-0">✅</span>
                                        <p className="text-slate-300 text-sm">{rec.texto}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="bg-[#0f172a] rounded-b-3xl p-6 border border-blue-900/40 border-t-0 print:hidden">
                    <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">
                            IPS Análisis Estratégico • Generado {new Date().toLocaleString('es-MX')}
                        </span>
                        <button onClick={onClose} className="px-5 py-2 bg-white/5 text-blue-300 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-white/10 transition-colors">
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalisisDetailView;
