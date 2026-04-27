
import React, { useState } from 'react';
import { useWeeklyAnalysis } from '../../hooks/useWeeklyAnalysis';
import { WeeklyAnalysis } from '../../types';
import ReportViewerModal from './ReportViewerModal';

/**
 * Vista de Análisis Semanal con funcionalidad de visualización.
 */
const AnalisisListView: React.FC = () => {
    const { analyses, isLoading, addAnalysis, deleteAnalysis } = useWeeklyAnalysis();
    const [showPasteForm, setShowPasteForm] = useState(false);
    const [pasteCode, setPasteCode] = useState('');
    const [pasteAutor, setPasteAutor] = useState('');
    const [newSemana, setNewSemana] = useState(Math.ceil((new Date().getTime() - new Date(new Date().getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000)));
    const [newYear, setNewYear] = useState(new Date().getFullYear());
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
    const [pasteError, setPasteError] = useState('');
    const [viewingAnalysis, setViewingAnalysis] = useState<WeeklyAnalysis | null>(null);

    /** Pegar código del portapapeles automáticamente */
    const handlePasteFromClipboard = async () => {
        try {
            const text = await navigator.clipboard.readText();
            if (text.trim()) {
                setPasteCode(text.trim());
                setPasteError('');
            }
        } catch {
            setPasteError('Pega el código manualmente en el campo de abajo');
        }
    };

    /** Registrar informe con código pegado */
    const handleRegisterPasted = async () => {
        if (!pasteCode.trim()) {
            setPasteError('Debes pegar un código válido HTML');
            return;
        }
        const reportId = `ANALYSIS_${newYear}_W${newSemana}`;
        const result = await addAnalysis({
            id: reportId,
            semana: newSemana,
            año: newYear,
            fechaCierre: new Date().toISOString().split('T')[0],
            autor: pasteAutor.trim() || 'ADMIN',
            estadoFuerza: { elementosActivos: 0, metaEsperada: 0, diferencia: 0, descripcion: '' },
            termometro: {
                altasNacionales: { valorReal: 0, meta: 0, porcentaje: 0, comentario: '' },
                bajasNacionales: { valorReal: 0, meta: 0, porcentaje: 0, comentario: '' },
                vacantesOperativas: { valorReal: 0, meta: 0, porcentaje: 0, comentario: '' },
            },
            vacantesCriticas: { valorReal: 0, limite: 0, diferencia: 0, comentario: '' },
            semaforoVacantes: { porcentajeActual: 0, status: 'verde', meta: 5 },
            analisisEjecutivo: pasteCode.trim(),
            alertas: [],
            recomendaciones: [],
            creadoEn: new Date().toISOString(),
            actualizadoEn: new Date().toISOString(),
        });
        if (result.success) {
            setShowPasteForm(false);
            setPasteCode('');
            setPasteAutor('');
            setPasteError('');
            alert("INFORME VINCULADO CORRECTAMENTE");
        } else {
            setPasteError(`Error al guardar: ${result.errors[0]}`);
        }
    };

    const handleDelete = (id: string) => {
        deleteAnalysis(id);
        setConfirmDeleteId(null);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-24">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter">
                        Informes <span className="text-blue-500">Estratégicos</span>
                    </h2>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">
                        {analyses.length} vinculados • Gestión de inteligencia directa
                    </p>
                </div>
                <button
                    onClick={() => setShowPasteForm(true)}
                    className="px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-[11px] uppercase tracking-widest shadow-lg shadow-blue-600/30 active:scale-95 transition-all flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                    + Pegar/Vincular Código
                </button>
            </div>

            {/* Form para PEGAR código */}
            {showPasteForm && (
                <div className="fixed inset-0 z-[110] bg-slate-900/95 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-[#111827] w-full max-w-2xl rounded-[2.5rem] p-8 border border-blue-500/30 shadow-2xl ips-slide-in overflow-hidden">
                        <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-6">Vincular Reporte Externo</h3>

                        <div className="space-y-5">
                            <button
                                onClick={handlePasteFromClipboard}
                                className="w-full py-6 bg-blue-600/10 border-2 border-dashed border-blue-500/40 rounded-2xl text-blue-400 font-black text-xs uppercase tracking-widest hover:bg-blue-600/20 transition-all flex items-center justify-center gap-3"
                            >
                                📋 Pegar Contenido del Reporte
                            </button>

                            <div>
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-2 ml-1">Contenido HTML / Código del Informe</label>
                                <textarea
                                    rows={8}
                                    placeholder="Pega aquí el código HTML generado..."
                                    className="w-full bg-[#0d1525] border border-slate-700 rounded-2xl px-5 py-4 text-blue-300 font-mono text-xs outline-none focus:border-blue-500 transition-colors resize-none"
                                    value={pasteCode}
                                    onChange={e => { setPasteCode(e.target.value); setPasteError(''); }}
                                />
                            </div>

                            {pasteError && <p className="text-rose-400 text-[10px] font-black uppercase text-center">{pasteError}</p>}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-2 ml-1">Semana Fiscal</label>
                                    <input type="number" min={1} max={52} className="w-full bg-[#0d1525] border border-slate-700 rounded-xl px-4 py-3 text-white font-black text-center text-lg outline-none focus:border-blue-500" value={newSemana} onChange={e => setNewSemana(parseInt(e.target.value) || 1)} />
                                </div>
                                <div>
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-2 ml-1">Año</label>
                                    <input type="number" className="w-full bg-[#0d1525] border border-slate-700 rounded-xl px-4 py-3 text-white font-black text-center text-lg outline-none focus:border-blue-500" value={newYear} onChange={e => setNewYear(parseInt(e.target.value) || 2026)} />
                                </div>
                            </div>

                            <div>
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-2 ml-1">Responsable del Análisis</label>
                                <input type="text" placeholder="EJ: DIRECTOR OPERATIVO" className="w-full bg-[#0d1525] border border-slate-700 rounded-xl px-5 py-4 text-white font-bold outline-none focus:border-blue-500 transition-colors uppercase" value={pasteAutor} onChange={e => setPasteAutor(e.target.value)} />
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button onClick={() => setShowPasteForm(false)} className="flex-1 py-4 bg-slate-800 text-slate-400 rounded-2xl font-black text-xs uppercase tracking-widest active:scale-95 transition-all">Cancelar</button>
                                <button onClick={handleRegisterPasted} className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-600/30 active:scale-95 transition-all">Vincular Ahora</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Lista de informes en Cards Ultra Premium */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {analyses.length === 0 ? (
                    <div className="col-span-full py-20 bg-white/5 rounded-[3rem] border border-white/5 text-center flex flex-col items-center">
                        <div className="w-20 h-20 bg-blue-600/10 rounded-[2rem] flex items-center justify-center mb-6">
                            <svg className="w-10 h-10 text-blue-500 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        </div>
                        <h3 className="text-xl font-black text-white uppercase tracking-tighter">Sin Informes Disponibles</h3>
                        <p className="text-slate-500 text-sm mt-2 max-w-xs">Vincula un reporte externo pegando el código HTML generado desde la terminal.</p>
                    </div>
                ) : (
                    analyses.map(analysis => (
                        <div key={analysis.id} className="bg-[#111827] rounded-[2.5rem] border border-white/5 hover:border-blue-500/30 transition-all p-8 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-100 group-hover:scale-110 transition-all">
                                <div className="w-16 h-16 bg-blue-600 rounded-full blur-2xl"></div>
                            </div>

                            <div className="relative z-10 flex flex-col h-full">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="bg-gradient-to-br from-blue-500 to-blue-700 w-16 h-16 rounded-2xl flex flex-col items-center justify-center shadow-2xl shadow-blue-600/40">
                                        <span className="text-[9px] font-black text-white opacity-60 uppercase mb-0.5">S</span>
                                        <span className="text-2xl font-black text-white leading-none">{analysis.semana}</span>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">{analysis.año}</span>
                                        <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest mt-1">ID: {analysis.id.slice(0, 8)}</span>
                                    </div>
                                </div>

                                <div className="mb-8">
                                    <h4 className="text-lg font-black text-white uppercase tracking-tighter mb-1">Informe Semanal</h4>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">{analysis.autor}</p>
                                </div>

                                <div className="mt-auto flex items-center gap-3">
                                    <button
                                        onClick={() => setViewingAnalysis(analysis)}
                                        className="flex-1 py-4 bg-white text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:scale-105 transition-transform active:scale-95"
                                    >
                                        Visualizar Informe
                                    </button>
                                    <button
                                        onClick={() => setConfirmDeleteId(analysis.id)}
                                        className="w-12 h-12 flex items-center justify-center bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-2xl hover:bg-rose-500 hover:text-white transition-all"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* MODAL DE VISUALIZACIÓN - FULL HDR */}
            {viewingAnalysis && (
                <ReportViewerModal
                    analysis={viewingAnalysis}
                    onClose={() => setViewingAnalysis(null)}
                />
            )}

            {/* Confirmación eliminación */}
            {confirmDeleteId && (
                <div className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6">
                    <div className="bg-[#111827] p-10 rounded-[2.5rem] border border-rose-500/30 text-center max-w-sm">
                        <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-4">¿Eliminar Informe?</h3>
                        <p className="text-slate-400 text-xs mb-8">Esta acción es irreversible y el vínculo de inteligencia se perderá para siempre.</p>
                        <div className="flex gap-4">
                            <button onClick={() => setConfirmDeleteId(null)} className="flex-1 py-4 bg-slate-800 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest">Cancelar</button>
                            <button onClick={() => handleDelete(confirmDeleteId)} className="flex-1 py-4 bg-rose-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-rose-600/30">ELIMINAR</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AnalisisListView;
