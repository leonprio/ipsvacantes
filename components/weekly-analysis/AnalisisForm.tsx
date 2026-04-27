
import React, { useState } from 'react';
import { WeeklyAnalysis, DynamicListItem, SemaforoStatus } from '../../types';
import { createEmptyAnalysis, calcularSemaforo } from '../../hooks/useWeeklyAnalysis';

interface AnalisisFormProps {
    initialData?: WeeklyAnalysis;
    onSave: (analysis: WeeklyAnalysis) => { success: boolean; errors: string[] };
    onCancel: () => void;
}

const AnalisisForm: React.FC<AnalisisFormProps> = ({ initialData, onSave, onCancel }) => {
    const [form, setForm] = useState<WeeklyAnalysis>(initialData || createEmptyAnalysis(
        new Date().getMonth() * 4 + 1, // Estimación simple de semana
        new Date().getFullYear()
    ));
    const [errors, setErrors] = useState<string[]>([]);
    const [activeSection, setActiveSection] = useState(0);

    const updateField = <K extends keyof WeeklyAnalysis>(key: K, value: WeeklyAnalysis[K]) => {
        setForm(prev => ({ ...prev, [key]: value }));
    };

    const updateEstadoFuerza = (field: string, value: any) => {
        setForm(prev => {
            const ef = { ...prev.estadoFuerza, [field]: value };
            ef.diferencia = ef.elementosActivos - ef.metaEsperada;
            return { ...prev, estadoFuerza: ef };
        });
    };

    const updateTermometro = (section: 'altasNacionales' | 'bajasNacionales' | 'vacantesOperativas', field: string, value: any) => {
        setForm(prev => {
            const item = { ...prev.termometro[section], [field]: value };
            if (field === 'valorReal' || field === 'meta') {
                item.porcentaje = item.meta > 0 ? Math.round((item.valorReal / item.meta) * 100) : 0;
            }
            return { ...prev, termometro: { ...prev.termometro, [section]: item } };
        });
    };

    const updateVacantesCriticas = (field: string, value: any) => {
        setForm(prev => {
            const vc = { ...prev.vacantesCriticas, [field]: value };
            vc.diferencia = vc.valorReal - vc.limite;
            return { ...prev, vacantesCriticas: vc };
        });
    };

    const updateSemaforo = (field: string, value: number) => {
        setForm(prev => {
            const sv = { ...prev.semaforoVacantes, [field]: value };
            sv.status = calcularSemaforo(sv.porcentajeActual);
            return { ...prev, semaforoVacantes: sv };
        });
    };

    const addDynamicItem = (key: 'alertas' | 'recomendaciones') => {
        const newItem: DynamicListItem = {
            id: `${key}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            texto: '',
        };
        setForm(prev => ({ ...prev, [key]: [...prev[key], newItem] }));
    };

    const updateDynamicItem = (key: 'alertas' | 'recomendaciones', id: string, texto: string) => {
        setForm(prev => ({
            ...prev,
            [key]: prev[key].map((item: DynamicListItem) => item.id === id ? { ...item, texto } : item),
        }));
    };

    const removeDynamicItem = (key: 'alertas' | 'recomendaciones', id: string) => {
        setForm(prev => ({
            ...prev,
            [key]: prev[key].filter((item: DynamicListItem) => item.id !== id),
        }));
    };

    const handleSubmit = () => {
        const result = onSave(form);
        if (!result.success) {
            setErrors(result.errors);
        }
    };

    const semaforoColor = (status: SemaforoStatus) => {
        if (status === 'verde') return 'bg-emerald-500';
        if (status === 'amarillo') return 'bg-amber-500';
        return 'bg-rose-500';
    };

    const sections = [
        'Información General',
        'Estado de Fuerza',
        'Termómetro Operativo',
        'Vacantes',
        'Análisis y Acciones',
    ];

    const inputClass = "w-full bg-[#0d1525] border border-blue-900/40 rounded-xl px-4 py-3 text-white font-semibold placeholder-white/20 outline-none focus:border-blue-500 transition-colors text-sm";
    const labelClass = "text-[10px] font-black text-blue-400/70 uppercase tracking-[0.15em] mb-2 block";
    const cardClass = "bg-[#111827] rounded-2xl p-5 border border-blue-900/30 space-y-4";

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-lg z-[200] flex items-start justify-center overflow-y-auto">
            <div className="w-full max-w-2xl mx-4 my-6 md:my-12">
                {/* Header */}
                <div className="bg-gradient-to-r from-[#0A0F1E] to-[#111827] rounded-t-3xl p-6 border border-blue-900/40 border-b-0">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-black text-white uppercase tracking-tighter">
                            {initialData ? 'Editar Análisis' : 'Nuevo Análisis Semanal'}
                        </h2>
                        <button onClick={onCancel} className="w-10 h-10 bg-rose-500/20 rounded-xl flex items-center justify-center text-rose-400 hover:bg-rose-500/30 transition-colors" aria-label="Cerrar formulario">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>

                    {/* Section Tabs */}
                    <div className="flex gap-1 overflow-x-auto scrollbar-hide pb-1">
                        {sections.map((s, i) => (
                            <button key={i} onClick={() => setActiveSection(i)} className={`px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider whitespace-nowrap transition-all ${activeSection === i ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'bg-white/5 text-blue-300/60 hover:bg-white/10'}`}>
                                {s}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Error Banner */}
                {errors.length > 0 && (
                    <div className="bg-rose-500/10 border-x border-rose-500/30 p-4">
                        {errors.map((e, i) => (
                            <p key={i} className="text-rose-400 text-xs font-bold flex items-center gap-2">
                                <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                {e}
                            </p>
                        ))}
                    </div>
                )}

                {/* Body */}
                <div className="bg-[#0A0F1E] border-x border-blue-900/40 p-6 space-y-6 min-h-[400px]">

                    {/* Sección 0: Info General */}
                    {activeSection === 0 && (
                        <div className="space-y-5">
                            <div className={cardClass}>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className={labelClass}>Semana</label>
                                        <div className="flex items-center gap-2">
                                            <span className="text-blue-400 font-black text-lg">S</span>
                                            <input type="number" min={1} max={52} className={inputClass} value={form.semana} onChange={e => updateField('semana', parseInt(e.target.value) || 1)} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className={labelClass}>Año</label>
                                        <input type="number" className={inputClass} value={form.año} onChange={e => updateField('año', parseInt(e.target.value) || 2026)} />
                                    </div>
                                </div>
                                <div>
                                    <label className={labelClass}>Fecha de Cierre</label>
                                    <input type="date" className={inputClass} value={form.fechaCierre} onChange={e => updateField('fechaCierre', e.target.value)} />
                                </div>
                                <div>
                                    <label className={labelClass}>Autor / Analista</label>
                                    <input type="text" className={inputClass} placeholder="Nombre del analista..." value={form.autor} onChange={e => updateField('autor', e.target.value)} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Sección 1: Estado de Fuerza */}
                    {activeSection === 1 && (
                        <div className="space-y-5">
                            <div className={cardClass}>
                                <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                    Estado de Fuerza Nacional
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className={labelClass}>Elementos Activos</label>
                                        <input type="number" className={inputClass} value={form.estadoFuerza.elementosActivos || ''} onChange={e => updateEstadoFuerza('elementosActivos', parseInt(e.target.value) || 0)} />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Meta Esperada</label>
                                        <input type="number" className={inputClass} value={form.estadoFuerza.metaEsperada || ''} onChange={e => updateEstadoFuerza('metaEsperada', parseInt(e.target.value) || 0)} />
                                    </div>
                                </div>
                                <div className="bg-[#0d1525] rounded-xl p-3 flex items-center justify-between">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Diferencia Auto-Calculada</span>
                                    <span className={`text-lg font-black ${form.estadoFuerza.diferencia >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                        {form.estadoFuerza.diferencia > 0 ? '+' : ''}{form.estadoFuerza.diferencia.toLocaleString('es-MX')}
                                    </span>
                                </div>
                                <div>
                                    <label className={labelClass}>Descripción Narrativa</label>
                                    <textarea rows={4} className={`${inputClass} resize-none`} placeholder="Describe la situación actual del estado de fuerza..." value={form.estadoFuerza.descripcion} onChange={e => updateEstadoFuerza('descripcion', e.target.value)} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Sección 2: Termómetro Operativo */}
                    {activeSection === 2 && (
                        <div className="space-y-5">
                            {(['altasNacionales', 'bajasNacionales', 'vacantesOperativas'] as const).map((key) => {
                                const labels = {
                                    altasNacionales: { title: 'Altas Nacionales', metaLabel: 'Meta' },
                                    bajasNacionales: { title: 'Bajas Nacionales', metaLabel: 'Límite Máximo' },
                                    vacantesOperativas: { title: 'Vacantes Operativas', metaLabel: 'Meta' },
                                };
                                const item = form.termometro[key];
                                return (
                                    <div key={key} className={cardClass}>
                                        <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                                            <span className={`w-2 h-2 rounded-full ${key === 'bajasNacionales' ? 'bg-rose-500' : key === 'altasNacionales' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                                            {labels[key].title}
                                        </h3>
                                        <div className="grid grid-cols-3 gap-3">
                                            <div>
                                                <label className={labelClass}>Valor Real</label>
                                                <input type="number" className={inputClass} value={item.valorReal || ''} onChange={e => updateTermometro(key, 'valorReal', parseInt(e.target.value) || 0)} />
                                            </div>
                                            <div>
                                                <label className={labelClass}>{labels[key].metaLabel}</label>
                                                <input type="number" className={inputClass} value={item.meta || ''} onChange={e => updateTermometro(key, 'meta', parseInt(e.target.value) || 0)} />
                                            </div>
                                            <div>
                                                <label className={labelClass}>% Cumplimiento</label>
                                                <div className="bg-[#0d1525] rounded-xl px-4 py-3 text-center">
                                                    <span className={`text-lg font-black ${item.porcentaje >= 90 ? 'text-emerald-400' : item.porcentaje >= 70 ? 'text-amber-400' : 'text-rose-400'}`}>{item.porcentaje}%</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <label className={labelClass}>Comentario</label>
                                            <textarea rows={2} className={`${inputClass} resize-none`} placeholder="Comentario breve..." value={item.comentario} onChange={e => updateTermometro(key, 'comentario', e.target.value)} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Sección 3: Vacantes */}
                    {activeSection === 3 && (
                        <div className="space-y-5">
                            <div className={cardClass}>
                                <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                                    <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                                    Vacantes Críticas
                                </h3>
                                <div className="grid grid-cols-3 gap-3">
                                    <div>
                                        <label className={labelClass}>Valor Real</label>
                                        <input type="number" className={inputClass} value={form.vacantesCriticas.valorReal || ''} onChange={e => updateVacantesCriticas('valorReal', parseInt(e.target.value) || 0)} />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Límite</label>
                                        <input type="number" className={inputClass} value={form.vacantesCriticas.limite || ''} onChange={e => updateVacantesCriticas('limite', parseInt(e.target.value) || 0)} />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Diferencia</label>
                                        <div className="bg-[#0d1525] rounded-xl px-4 py-3 text-center">
                                            <span className={`text-lg font-black ${form.vacantesCriticas.diferencia <= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                {form.vacantesCriticas.diferencia > 0 ? '+' : ''}{form.vacantesCriticas.diferencia}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className={labelClass}>Comentario</label>
                                    <textarea rows={2} className={`${inputClass} resize-none`} placeholder="Comentario sobre vacantes críticas..." value={form.vacantesCriticas.comentario} onChange={e => updateVacantesCriticas('comentario', e.target.value)} />
                                </div>
                            </div>

                            {/* Semáforo */}
                            <div className={`${cardClass} relative overflow-hidden`}>
                                <div className={`absolute inset-0 opacity-10 ${semaforoColor(form.semaforoVacantes.status)}`}></div>
                                <div className="relative z-10">
                                    <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                                        <span className={`w-3 h-3 rounded-full animate-pulse ${semaforoColor(form.semaforoVacantes.status)}`}></span>
                                        % Vacantes (Semáforo)
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4 mt-4">
                                        <div>
                                            <label className={labelClass}>Porcentaje Actual (%)</label>
                                            <input type="number" step="0.1" className={inputClass} value={form.semaforoVacantes.porcentajeActual || ''} onChange={e => updateSemaforo('porcentajeActual', parseFloat(e.target.value) || 0)} />
                                        </div>
                                        <div>
                                            <label className={labelClass}>Meta (%)</label>
                                            <input type="number" step="0.1" className={inputClass} value={form.semaforoVacantes.meta || ''} onChange={e => updateSemaforo('meta', parseFloat(e.target.value) || 0)} />
                                        </div>
                                    </div>
                                    <div className="mt-4 flex items-center gap-3">
                                        <span className="text-xs font-black text-slate-400 uppercase">Estado:</span>
                                        <span className={`px-4 py-1.5 rounded-full text-xs font-black text-white uppercase tracking-wider ${semaforoColor(form.semaforoVacantes.status)}`}>
                                            {form.semaforoVacantes.status}
                                        </span>
                                        <span className="text-xs text-slate-500">(&lt;5% Verde • 5-7% Amarillo • &gt;7% Rojo)</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Sección 4: Análisis y Acciones */}
                    {activeSection === 4 && (
                        <div className="space-y-5">
                            <div className={cardClass}>
                                <h3 className="text-sm font-black text-white uppercase tracking-wider">Análisis Ejecutivo</h3>
                                <textarea
                                    rows={8}
                                    className={`${inputClass} resize-none`}
                                    placeholder="Escriba el análisis ejecutivo detallado (mínimo 200 caracteres)..."
                                    value={form.analisisEjecutivo}
                                    onChange={e => updateField('analisisEjecutivo', e.target.value)}
                                />
                                <div className="flex justify-between">
                                    <span className={`text-[10px] font-bold ${form.analisisEjecutivo.length >= 200 ? 'text-emerald-400' : 'text-amber-400'}`}>
                                        {form.analisisEjecutivo.length} / 200 caracteres mínimo
                                    </span>
                                </div>
                            </div>

                            {/* Alertas */}
                            <div className={cardClass}>
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                                        <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 17c-.77 1.333.192 3 1.732 3z" /></svg>
                                        Alertas / Puntos Críticos
                                    </h3>
                                    <button onClick={() => addDynamicItem('alertas')} className="px-3 py-1.5 bg-amber-500/20 text-amber-400 rounded-lg text-[10px] font-black uppercase tracking-wider hover:bg-amber-500/30 transition-colors" aria-label="Agregar nueva alerta">
                                        + Agregar
                                    </button>
                                </div>
                                {form.alertas.map((item) => (
                                    <div key={item.id} className="flex gap-2 items-start">
                                        <input type="text" className={`${inputClass} flex-1`} placeholder="Describe la alerta..." value={item.texto} onChange={e => updateDynamicItem('alertas', item.id, e.target.value)} />
                                        <button onClick={() => removeDynamicItem('alertas', item.id)} className="w-10 h-10 bg-rose-500/10 rounded-xl flex items-center justify-center text-rose-400 hover:bg-rose-500/20 flex-shrink-0 mt-0.5" aria-label="Eliminar alerta">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        </button>
                                    </div>
                                ))}
                                {form.alertas.length === 0 && <p className="text-slate-500 text-xs italic text-center py-3">Sin alertas registradas</p>}
                            </div>

                            {/* Recomendaciones */}
                            <div className={cardClass}>
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                                        <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        Recomendaciones Estratégicas
                                    </h3>
                                    <button onClick={() => addDynamicItem('recomendaciones')} className="px-3 py-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg text-[10px] font-black uppercase tracking-wider hover:bg-emerald-500/30 transition-colors" aria-label="Agregar nueva recomendación">
                                        + Agregar
                                    </button>
                                </div>
                                {form.recomendaciones.map((item) => (
                                    <div key={item.id} className="flex gap-2 items-start">
                                        <input type="text" className={`${inputClass} flex-1`} placeholder="Describe la recomendación..." value={item.texto} onChange={e => updateDynamicItem('recomendaciones', item.id, e.target.value)} />
                                        <button onClick={() => removeDynamicItem('recomendaciones', item.id)} className="w-10 h-10 bg-rose-500/10 rounded-xl flex items-center justify-center text-rose-400 hover:bg-rose-500/20 flex-shrink-0 mt-0.5" aria-label="Eliminar recomendación">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        </button>
                                    </div>
                                ))}
                                {form.recomendaciones.length === 0 && <p className="text-slate-500 text-xs italic text-center py-3">Sin recomendaciones registradas</p>}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="bg-[#0A0F1E] rounded-b-3xl p-6 border border-blue-900/40 border-t-0 flex items-center justify-between gap-4">
                    <div className="flex gap-2">
                        {activeSection > 0 && (
                            <button onClick={() => setActiveSection(activeSection - 1)} className="px-5 py-3 bg-white/5 text-blue-300 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-white/10 transition-colors">
                                ← Anterior
                            </button>
                        )}
                    </div>
                    <div className="flex gap-2">
                        {activeSection < sections.length - 1 ? (
                            <button onClick={() => setActiveSection(activeSection + 1)} className="px-6 py-3 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-lg shadow-blue-600/30 hover:bg-blue-500 transition-colors">
                                Siguiente →
                            </button>
                        ) : (
                            <button onClick={handleSubmit} className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-[0.2em] shadow-lg shadow-emerald-600/30 hover:from-emerald-500 hover:to-emerald-400 transition-all">
                                💾 Guardar Análisis
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalisisForm;
