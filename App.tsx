
import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { REGIONS as INITIAL_REGIONS, UNES as INITIAL_UNES } from './constants';
import { WeeklyData, Region, NationalMetrics, User } from './types';
import { computeEntryData } from './utils/calculations';
import DashboardTable from './components/DashboardTable';
import Visualizations from './components/Visualizations';
import NationalSummary from './components/NationalSummary';
import ConfigPanel from './components/ConfigPanel';
import UserManagementModal from './components/UserManagementModal';
import MappingModal from './components/MappingModal';
import DataEntryModal from './components/DataEntryModal';

const DATA_KEY = 'ips_v6_data_shielded';
const METRICS_KEY = 'ips_v6_metrics_shielded';
const USERS_KEY = 'ips_v6_users_shielded';
const TITLE_KEY = 'ips_v6_title_shielded';
const REGIONS_KEY = 'ips_v6_regions_shielded';

const getCurrentISOWeek = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
};

const ErrorShield: React.FC<{children: React.ReactNode}> = ({children}) => {
  const [hasError, setHasError] = useState(false);
  useEffect(() => {
    const handleError = (e: ErrorEvent) => {
      console.error("Shield detected breach:", e.error);
      if (e.message.includes("localStorage")) setHasError(true);
    };
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (hasError) {
    return (
      <div className="min-h-screen bg-[#001021] flex flex-col items-center justify-center p-8 text-center">
        <div className="bg-rose-500/10 border border-rose-500/30 p-10 rounded-[2.5rem] max-w-lg shadow-2xl">
          <h2 className="text-white text-2xl font-black uppercase mb-4 tracking-tighter">ERROR DE INTEGRIDAD</h2>
          <p className="text-rose-200/60 font-bold text-xs uppercase mb-8">Base de datos local comprometida. Se requiere reinicio del sistema.</p>
          <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="w-full py-4 bg-rose-600 text-white font-black uppercase tracking-widest rounded-2xl">RESTABLECER</button>
        </div>
      </div>
    );
  }
  return <>{children}</>;
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [reportTitle, setReportTitle] = useState('IPS Análisis Estratégico de Vacantes');
  const [selectedWeek, setSelectedWeek] = useState(getCurrentISOWeek());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [entries, setEntries] = useState<WeeklyData[]>([]);
  const [regions, setRegions] = useState<Region[]>(INITIAL_REGIONS);
  const [openRegionId, setOpenRegionId] = useState<string | null>(INITIAL_REGIONS[0].id);
  
  const [isChartsOpen, setIsChartsOpen] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isUsersOpen, setIsUsersOpen] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [showMappingModal, setShowMappingModal] = useState(false);
  const [isCaptureModalOpen, setIsCaptureModalOpen] = useState(false);
  const [csvRows, setCsvRows] = useState<string[][]>([]);
  
  const [nationalMetrics, setNationalMetrics] = useState<NationalMetrics>({
    metas: { altas: 200, bajas: 100, vacantes: 300, porcentaje: 5.0, edoFza: 5500 },
    thresholds: { green: 90, yellow: 80 }
  });

  const [saveStatus, setSaveStatus] = useState<'synced' | 'saving' | 'pending'>('synced');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const savedEntries = localStorage.getItem(DATA_KEY);
      const savedMetrics = localStorage.getItem(METRICS_KEY);
      const savedUsers = localStorage.getItem(USERS_KEY);
      const savedTitle = localStorage.getItem(TITLE_KEY);
      const savedRegions = localStorage.getItem(REGIONS_KEY);

      if (savedTitle) setReportTitle(savedTitle);
      if (savedMetrics) setNationalMetrics(JSON.parse(savedMetrics));
      
      let finalRegions = INITIAL_REGIONS;
      if (savedRegions) {
        const parsed: Region[] = JSON.parse(savedRegions);
        const merged = [...parsed];
        INITIAL_REGIONS.forEach(ir => {
          if (!merged.find(r => r.id === ir.id)) merged.push(ir);
        });
        finalRegions = merged;
      }
      setRegions(finalRegions);
      
      const masterUsers: User[] = [{ id: '1', email: 'admin@iapriori.com', name: 'ADMINISTRADOR MAESTRO', role: 'admin', password: 'admin' }];
      let finalUsers: User[] = [...masterUsers];
      if (savedUsers) {
        const parsed: User[] = JSON.parse(savedUsers);
        parsed.forEach(pu => {
          if (!finalUsers.find(mu => mu.email.toLowerCase() === pu.email.toLowerCase())) finalUsers.push({ ...pu });
        });
      }
      setUsers(finalUsers);
      if (savedEntries) setEntries(JSON.parse(savedEntries));
    } catch (e) {
      console.error("Hydration failed");
    }
  }, []);

  const saveAllData = useCallback(() => {
    if (!user) return;
    setSaveStatus('saving');
    try {
      localStorage.setItem(DATA_KEY, JSON.stringify(entries));
      localStorage.setItem(METRICS_KEY, JSON.stringify(nationalMetrics));
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
      localStorage.setItem(TITLE_KEY, reportTitle);
      localStorage.setItem(REGIONS_KEY, JSON.stringify(regions));
      setTimeout(() => setSaveStatus('synced'), 600);
    } catch (error) {
      setSaveStatus('pending');
    }
  }, [entries, nationalMetrics, users, reportTitle, regions, user]);

  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!user) return;
    if (saveStatus === 'synced') setSaveStatus('pending');
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => saveAllData(), 800);
    return () => { if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current); };
  }, [entries, nationalMetrics, users, reportTitle, regions, saveAllData, user]);

  const currentComputedEntries = useMemo(() => {
    return (entries || []).filter(e => e.week === selectedWeek && e.year === selectedYear).map(e => computeEntryData(e, nationalMetrics));
  }, [entries, selectedWeek, selectedYear, nationalMetrics]);

  const prevWeekNum = selectedWeek === 1 ? 52 : selectedWeek - 1;
  const prevYearNum = selectedWeek === 1 ? selectedYear - 1 : selectedYear;
  const prevComputedEntries = useMemo(() => {
    return (entries || []).filter(e => e.week === prevWeekNum && e.year === prevYearNum).map(e => computeEntryData(e, nationalMetrics));
  }, [entries, prevWeekNum, prevYearNum, nationalMetrics]);

  const historicalTrend = useMemo(() => {
    const weeksMap: Record<string, any> = {};
    (entries || []).forEach(e => {
      const key = `${e.year}-W${e.week}`;
      if (!weeksMap[key]) weeksMap[key] = { label: `S${e.week}`, altas: 0, bajas: 0, vacantes: 0, edoFza: 0, week: e.week, year: e.year };
      weeksMap[key].altas += (Number(e.altas) || 0);
      weeksMap[key].bajas += (Number(e.bajas) || 0);
      weeksMap[key].vacantes += (Number(e.vacantesRealesFS) || 0);
      weeksMap[key].edoFza += (Number(e.edoFza) || 0);
    });
    return Object.values(weeksMap).sort((a, b) => (a.year * 1000 + a.week) - (b.year * 1000 + b.week)).slice(-12);
  }, [entries]);

  const handleUpdateData = useCallback((newData: WeeklyData) => {
    if (user?.role === 'viewer') return;
    setEntries(prev => {
      const index = prev.findIndex(e => e.uneId === newData.uneId && e.week === newData.week && e.year === newData.year);
      if (index !== -1) {
        const next = [...prev];
        next[index] = newData;
        return next;
      }
      return [...prev, newData];
    });
  }, [user]);

  const handleUpdateRegion = useCallback((id: string, name: string, editor: string) => {
    setRegions(prev => prev.map(r => r.id === id ? { ...r, name, editor } : r));
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const rows = text.split('\n').filter(r => r.trim()).map(row => row.split(',').map(cell => cell.trim().replace(/^"|"$/g, '')));
      setCsvRows(rows);
      setShowMappingModal(true);
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#000b18] flex items-center justify-center p-6 font-sans relative overflow-hidden">
        {/* Background Accents */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/20 blur-[120px] rounded-full"></div>
        
        <div className="bg-[#001529]/80 backdrop-blur-xl border border-blue-900/30 p-1.5 rounded-[2.5rem] shadow-2xl w-full max-w-md relative z-10 animate-in fade-in zoom-in-95 duration-500">
          <form onSubmit={(e) => {
            e.preventDefault();
            setAuthLoading(true);
            setTimeout(() => {
              const u = users.find(u => u.email.toLowerCase() === loginForm.email.toLowerCase() && u.password === loginForm.password);
              if (u) setUser(u); else setAuthError("ACCESO DENEGADO - VERIFIQUE CREDENCIALES");
              setAuthLoading(false);
            }, 800);
          }} className="p-10 md:p-12 text-center bg-[#001a33] rounded-[2.3rem]">
            <div className="mb-12 inline-block bg-[#2563eb] px-8 py-3 rounded-2xl font-black italic text-white tracking-[0.2em] text-lg border border-blue-400/30 uppercase shadow-lg shadow-blue-500/20">IAPRIORI</div>
            
            <h1 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">ACCESO IPS</h1>
            <p className="text-blue-400/40 text-[9px] font-black uppercase tracking-[0.3em] mb-12">SISTEMA ESTRATÉGICO AUDITADO</p>
            
            <div className="space-y-5 text-left">
              {authError && (
                <div className="bg-rose-500/10 border border-rose-500/30 p-4 rounded-xl text-rose-500 text-[10px] font-black uppercase text-center animate-pulse">
                  {authError}
                </div>
              )}
              
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-blue-400/40 uppercase tracking-widest ml-4">Credenciales</label>
                <input 
                  required 
                  type="email" 
                  placeholder="EMAIL CORPORATIVO" 
                  className="w-full bg-[#000b18] border border-blue-900/50 rounded-2xl px-6 py-4 text-white font-bold outline-none text-center focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-blue-900/50" 
                  value={loginForm.email} 
                  onChange={e => setLoginForm({...loginForm, email: e.target.value})}
                />
              </div>

              <input 
                required 
                type="password" 
                placeholder="CONTRASEÑA" 
                className="w-full bg-[#000b18] border border-blue-900/50 rounded-2xl px-6 py-4 text-white font-bold outline-none text-center focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-blue-900/50" 
                value={loginForm.password} 
                onChange={e => setLoginForm({...loginForm, password: e.target.value})}
              />
              
              <div className="pt-4">
                <button 
                  disabled={authLoading} 
                  type="submit" 
                  className="w-full py-5 bg-blue-600 text-white font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-blue-500/20 active:scale-[0.98] hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {authLoading ? 'AUTENTICANDO...' : 'INICIAR SESIÓN'}
                </button>
              </div>
            </div>
            
            <p className="mt-10 text-[8px] font-black text-blue-900/40 uppercase tracking-[0.2em]">© 2026 IAPRIORI CONSULTING • V6.9.0</p>
          </form>
        </div>
      </div>
    );
  }

  return (
    <ErrorShield>
      <div className="min-h-screen bg-[#f1f5f9] pb-24 font-sans text-slate-900 overflow-x-hidden">
        <header className="bg-[#001a33] text-white sticky top-0 z-[100] shadow-xl border-b border-blue-900/60">
          <div className="max-w-[98%] mx-auto px-4 md:px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="w-full md:w-auto flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="bg-[#2563eb] px-5 py-2.5 rounded-xl font-black italic text-sm tracking-widest border border-blue-400/40 uppercase shadow-lg shadow-blue-500/20">IAPRIORI</div>
                <div className="hidden lg:flex flex-col">
                   {isEditingTitle && user.role === 'admin' ? (
                     <input autoFocus className="bg-white/5 border-b-2 border-blue-500 text-white font-black text-xl lg:text-2xl tracking-tighter outline-none px-2 py-1 min-w-[450px]" value={reportTitle} onChange={(e) => setReportTitle(e.target.value)} onBlur={() => setIsEditingTitle(false)} onKeyDown={(e) => e.key === 'Enter' && setIsEditingTitle(false)} />
                   ) : (
                     <h1 onClick={() => user.role === 'admin' && setIsEditingTitle(true)} className={`font-black text-xl lg:text-2xl tracking-tighter text-white leading-none truncate max-w-[500px] ${user.role === 'admin' ? 'cursor-pointer hover:text-blue-300' : ''}`}>
                       {reportTitle}
                     </h1>
                   )}
                   {user.role === 'admin' && <span className="text-[8px] font-black text-blue-400/60 tracking-[0.3em] mt-1 uppercase">SISTEMA BLINDADO v6.9 [TSP+ OK]</span>}
                </div>
              </div>
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden p-3 bg-blue-900/40 rounded-xl active:bg-blue-800 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"}/></svg>
              </button>
            </div>

            <div className={`${isMobileMenuOpen ? 'flex' : 'hidden md:flex'} flex-col md:flex-row items-center w-full md:w-auto gap-4 md:gap-6`}>
              <div className="flex items-center bg-[#002a4d] rounded-xl p-1 border border-white/10 w-full md:w-auto justify-between shadow-inner">
                <button onClick={() => setSelectedWeek(w => w <= 1 ? 52 : w - 1)} className="p-3 hover:bg-white/10 rounded-lg active:scale-90 transition-all"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M15 19l-7-7 7-7"/></svg></button>
                <span className="px-5 font-black text-xs tabular-nums uppercase tracking-widest text-center min-w-[120px]">S{selectedWeek} • {selectedYear}</span>
                <button onClick={() => setSelectedWeek(w => w >= 52 ? 1 : w + 1)} className="p-3 hover:bg-white/10 rounded-lg active:scale-90 transition-all"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M9 5l7 7-7 7"/></svg></button>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto justify-center">
                {user.role !== 'viewer' && (
                  <>
                    <button onClick={() => setIsCaptureModalOpen(true)} className="px-6 h-12 flex items-center gap-2 bg-emerald-600 rounded-xl border border-emerald-400/20 shadow-lg active:scale-95 transition-all text-[10px] font-black uppercase tracking-widest text-white">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4"/></svg>
                      Nueva Captura
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".csv" className="hidden" />
                    <button onClick={() => fileInputRef.current?.click()} className="w-12 h-12 flex items-center justify-center bg-blue-600 rounded-xl border border-blue-400/20 shadow-lg active:scale-95 transition-all" title="Importar CSV Estratégico">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
                    </button>
                  </>
                )}
                {user.role === 'admin' && (
                  <>
                    <button onClick={() => setIsUsersOpen(true)} className="w-12 h-12 flex items-center justify-center bg-[#002a4d] rounded-xl border border-blue-500/20 shadow-lg active:scale-95 transition-all" title="Gestionar Usuarios"><svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg></button>
                    <button onClick={() => setIsConfigOpen(true)} className="w-12 h-12 flex items-center justify-center bg-[#002a4d] rounded-xl border border-amber-500/20 shadow-lg active:scale-95 transition-all" title="Ajustes de Sistema"><svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066-1.543.94-3.31-.826-2.37-2.37-1.724 1.724 0 00-1.065-2.572-1.756-.426-1.756-2.924 0-3.35 1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><circle cx="12" cy="12" r="3" strokeWidth="2.5"/></svg></button>
                  </>
                )}
                <button onClick={() => setUser(null)} className="w-12 h-12 flex items-center justify-center bg-rose-600/20 hover:bg-rose-600/30 rounded-xl border border-rose-500/20 ml-2 transition-all active:scale-95 shadow-lg" title="Cerrar Sesión"><svg className="w-5 h-5 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg></button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-[98%] mx-auto px-4 md:px-6 py-6 md:py-10 space-y-8 md:space-y-12">
          <NationalSummary data={currentComputedEntries} prevData={prevComputedEntries} metrics={nationalMetrics} week={selectedWeek} />
          
          <section className="bg-white rounded-[2rem] md:rounded-[3.5rem] shadow-sm border border-slate-200 overflow-hidden">
            <button onClick={() => setIsChartsOpen(!isChartsOpen)} className="w-full p-6 md:p-8 flex justify-between items-center bg-slate-50/80 hover:bg-slate-50 transition-all group">
              <div className="flex items-center gap-4">
                <div className="bg-[#2563eb] p-3 rounded-xl shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform"><svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4"/></svg></div>
                <h3 className="text-lg md:text-2xl font-black text-slate-900 uppercase tracking-tighter">Performance de Estrategia</h3>
              </div>
              <svg className={`w-6 h-6 text-slate-400 transition-transform duration-500 ${isChartsOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M19 9l-7 7-7-7"/></svg>
            </button>
            {isChartsOpen && (
              <div className="p-4 md:p-10 border-t border-slate-100 bg-white overflow-hidden animate-in fade-in slide-in-from-top-4">
                <Visualizations trendData={historicalTrend} metas={nationalMetrics.metas} data={currentComputedEntries} />
              </div>
            )}
          </section>

          <div className="space-y-8 md:space-y-12 pb-12">
            {regions.map(region => (
              <DashboardTable 
                key={region.id} region={region}
                unes={INITIAL_UNES.filter(u => u.regionId === region.id)}
                allData={entries} selectedWeek={selectedWeek} selectedYear={selectedYear}
                onUpdateData={handleUpdateData} isOpen={openRegionId === region.id}
                onToggle={() => setOpenRegionId(openRegionId === region.id ? null : region.id)}
                nationalMetrics={nationalMetrics} userRole={user.role}
                onUpdateRegion={handleUpdateRegion} onEditUne={() => {}} 
              />
            ))}
          </div>
        </main>

        <footer className="max-w-[98%] mx-auto px-6 py-10 flex flex-col md:flex-row justify-between items-center gap-6 border-t border-slate-200">
          <div className="flex flex-col items-center md:items-start gap-4">
             <div className="bg-[#2563eb] px-4 py-2 rounded-xl text-white font-black italic text-[10px] tracking-widest uppercase shadow-md shadow-blue-500/20">IAPRIORI</div>
            <span className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] text-center md:text-left">DESARROLLADO POR IAPRIORI CONSULTING • © 2026</span>
          </div>
          <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">SISTEMA BLINDADO v6.9 [TSP+ OK]</span>
          </div>
        </footer>

        {isConfigOpen && <ConfigPanel config={nationalMetrics} onSave={(c) => { setNationalMetrics(c); setIsConfigOpen(false); }} onClose={() => setIsConfigOpen(false)} />}
        {isUsersOpen && <UserManagementModal users={users} onUpdateUsers={(u) => { setUsers(u); localStorage.setItem(USERS_KEY, JSON.stringify(u)); }} onClose={() => setIsUsersOpen(false)} />}
        {showMappingModal && <MappingModal rows={csvRows} onCancel={() => setShowMappingModal(false)} onConfirm={(ne) => { setEntries(prev => { const next = [...prev]; ne.forEach(n => { const idx = next.findIndex(e => e.uneId === n.uneId && e.week === n.week && e.year === n.year); if(idx !== -1) next[idx] = {...next[idx], ...n}; else next.push(n); }); return next; }); setShowMappingModal(false); }} defaultWeek={selectedWeek} defaultYear={selectedYear} />}
        {isCaptureModalOpen && <DataEntryModal week={selectedWeek} year={selectedYear} nationalMetrics={nationalMetrics} onSave={handleUpdateData} onClose={() => setIsCaptureModalOpen(false)} />}
      </div>
    </ErrorShield>
  );
};

export default App;
