
import React, { useState, useMemo } from 'react';
import { REGIONS, UNES } from '../constants';
import { WeeklyData, NationalMetrics } from '../types';
import { computeEntryData } from '../utils/calculations';

interface DataEntryModalProps {
    userRole: string;
    week: number;
    year: number;
    onSave: (data: WeeklyData) => void;
    onClose: () => void;
    nationalMetrics: NationalMetrics;
    existingEntries: WeeklyData[];
    unes: { id: string; name: string; regionId: string; }[];
    onCreateClient?: (newUne: { id: string; name: string; regionId: string; }, initialData: WeeklyData) => Promise<void>;
}

const DataEntryModal: React.FC<DataEntryModalProps> = ({ userRole, week, year, onSave, onClose, nationalMetrics, existingEntries, unes, onCreateClient }) => {
    // Definimos las UNES disponibles, inyectando la opción Nacional para ADM/EDITOR
    const availableUnes = useMemo(() => {
        const base = [...unes];
        if (userRole === 'admin' || userRole === 'editor') {
            if (!base.some(u => u.id === 'NATIONAL_DATA')) {
                base.unshift({ id: 'NATIONAL_DATA', name: 'NACIONAL (TOTAL C/ APOYOS)', regionId: 'R1' });
            }
        }
        return base;
    }, [unes, userRole]);

    const [selectedRegionId, setSelectedRegionId] = useState(REGIONS[0].id);
    const [selectedUneId, setSelectedUneId] = useState(() => {
        const initial = availableUnes.filter(u => u.regionId === REGIONS[0].id)[0];
        return initial ? initial.id : '';
    });

    const [formData, setFormData] = useState({
        edoFza: 0,
        altas: 0,
        bajas: 0,
        vacantesIniciales: 0,
        vacantesRealesFS: 0,
        comentarios: ''
    });

    const [isNewClient, setIsNewClient] = useState(false);
    const [newClientName, setNewClientName] = useState('');

    // Cargar datos existentes si hay para la UNE seleccionada
    React.useEffect(() => {
        const existing = existingEntries.find(e => e.uneId === selectedUneId && e.week === week && e.year === year);
        if (existing) {
            setFormData({
                edoFza: existing.edoFza || 0,
                altas: existing.altas || 0,
                bajas: existing.bajas || 0,
                vacantesIniciales: existing.vacantesIniciales || 0,
                vacantesRealesFS: existing.vacantesRealesFS || 0,
                comentarios: existing.comentarios || ''
            });
        } else {
            setFormData({
                edoFza: 0,
                altas: 0,
                bajas: 0,
                vacantesIniciales: 0,
                vacantesRealesFS: 0,
                comentarios: ''
            });
        }
    }, [selectedUneId, week, year, existingEntries]);

    const filteredUnes = useMemo(() => availableUnes.filter(u => u.regionId === selectedRegionId), [availableUnes, selectedRegionId]);

    const preview = useMemo(() => {
        const raw: WeeklyData = {
            uneId: selectedUneId,
            week,
            year,
            ...formData
        };
        return computeEntryData(raw, nationalMetrics);
    }, [selectedUneId, week, year, formData, nationalMetrics]);

    const handleSave = async () => {
        if (isNewClient && onCreateClient) {
            if (!newClientName.trim()) { alert("El nombre del cliente es requerido"); return; }
            if (formData.vacantesRealesFS === 0 && formData.vacantesIniciales === 0) {
                if (!confirm("¿Está seguro de guardar sin vacantes iniciales?")) return;
            }

            const newId = `CLIENT_${Date.now()}`;
            const newUne = { id: newId, name: newClientName.toUpperCase(), regionId: selectedRegionId };

            await onCreateClient(newUne, {
                uneId: newId,
                week,
                year,
                ...formData
            });
            onClose();
        } else {
            onSave({
                uneId: selectedUneId,
                week,
                year,
                ...formData
            });
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-[200] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 font-sans">
            <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-8 bg-slate-50 border-b border-slate-200 flex justify-between items-center text-slate-900">
                    <div>
                        <h2 className="text-2xl font-black uppercase tracking-tighter">Nueva Captura IPS S{week}</h2>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Ingreso manual de indicadores tácticos</p>
                    </div>
                    <button onClick={onClose} aria-label="Cerrar modal" className="p-3 hover:bg-slate-200 rounded-xl transition-all">
                        <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="p-8 space-y-6 text-slate-900">
                    <div className="grid grid-cols-2 gap-4">


                        <div className="col-span-2 bg-slate-100 p-4 rounded-xl space-y-4">
                            <div className="flex items-center justify-between">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Selección de Cliente / UNE</label>
                                <div className="flex items-center gap-2">
                                    <span className={`text-[9px] font-black uppercase ${!isNewClient ? 'text-blue-600' : 'text-slate-400'}`}>Existente</span>
                                    <button
                                        onClick={() => { setIsNewClient(!isNewClient); setNewClientName(''); }}
                                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${isNewClient ? 'bg-emerald-500' : 'bg-slate-300'}`}
                                    >
                                        <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${isNewClient ? 'translate-x-4.5' : 'translate-x-1'}`} />
                                    </button>
                                    <span className={`text-[9px] font-black uppercase ${isNewClient ? 'text-emerald-600' : 'text-slate-400'}`}>Nuevo</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Región</label>
                                    <select
                                        id="region-select"
                                        aria-label="Seleccionar Región"
                                        value={selectedRegionId}
                                        onChange={(e) => {
                                            const rid = e.target.value;
                                            setSelectedRegionId(rid);
                                            // Only update UNE if not adding new client
                                            if (!isNewClient) {
                                                const nextUne = availableUnes.filter(u => u.regionId === rid)[0];
                                                if (nextUne) setSelectedUneId(nextUne.id);
                                            }
                                        }}
                                        className="w-full bg-white border-2 border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-800 outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer"
                                    >
                                        {REGIONS.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-slate-400 uppercase ml-1">{isNewClient ? 'NOMBRE DEL NUEVO CLIENTE' : 'Unidad de Negocio'}</label>
                                    {isNewClient ? (
                                        <input
                                            autoFocus
                                            type="text"
                                            value={newClientName}
                                            onChange={(e) => setNewClientName(e.target.value.toUpperCase())}
                                            placeholder="EJ. NUEVO PROYECTO"
                                            className="w-full bg-emerald-50 border-2 border-emerald-200 rounded-xl px-4 py-3 font-black text-emerald-800 outline-none focus:border-emerald-500 transition-all placeholder:text-emerald-800/30"
                                        />
                                    ) : (
                                        <select
                                            id="une-select"
                                            aria-label="Seleccionar Unidad de Negocio"
                                            value={selectedUneId}
                                            onChange={(e) => setSelectedUneId(e.target.value)}
                                            className="w-full bg-white border-2 border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-800 outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer"
                                        >
                                            {filteredUnes.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                        </select>
                                    )}
                                </div>
                            </div>
                        </div>


                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        {[
                            { label: 'Edo. Fuerza', key: 'edoFza' },
                            { label: 'Altas', key: 'altas', color: 'text-emerald-600' },
                            { label: 'Bajas', key: 'bajas', color: 'text-rose-600' },
                            { label: 'Vac. Iniciales', key: 'vacantesIniciales' },
                            { label: isNewClient ? 'Vac. Actuales (Inicial)' : 'Vac. Reales FS', key: 'vacantesRealesFS', color: 'text-blue-600' },
                        ].map((field) => (
                            <div key={field.key} className="space-y-1.5">
                                <label className="text-[9px] font-black text-slate-400 uppercase ml-1">{field.label}</label>
                                <input
                                    type="number"
                                    id={`input-${field.key}`}
                                    aria-label={`Ingresar valor para ${field.label}`}
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
                            onChange={(e) => setFormData({ ...formData, comentarios: e.target.value })}
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
