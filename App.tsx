
import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { REGIONS as INITIAL_REGIONS, UNES as INITIAL_UNES } from './constants';
import { WeeklyData, Region, NationalMetrics, User, UNE, AppView } from './types';
import { computeEntryData } from './utils/calculations';
import DashboardTable from './components/DashboardTable';
import Visualizations from './components/Visualizations';
import NationalSummary from './components/NationalSummary';
import ConfigPanel from './components/ConfigPanel';
import UserManagementModal from './components/UserManagementModal';
import MappingModal from './components/MappingModal';
import DataEntryModal from './components/DataEntryModal';
import AnalisisListView from './components/weekly-analysis/AnalisisListView';
import ReportViewerModal from './components/weekly-analysis/ReportViewerModal';
import { useWeeklyAnalysis } from './hooks/useWeeklyAnalysis';

// Firebase Imports
import { auth, db, firebaseConfig, shieldStatus } from './firebase';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, User as FirebaseUser, getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, onSnapshot, setDoc, getDoc, collection, query, getDocs, deleteDoc, where, writeBatch } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';

const APP_VERSION = 'v11.1.0-VACIPS-CLOSURE-SHIELD';

const getCurrentISOWeek = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  // Ajuste para el jueves de la semana actual
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
};

const getTargetOpeningWeek = () => {
  const d = new Date();
  // Retrocedemos 7 días para obtener la semana anterior a la actual
  d.setDate(d.getDate() - 7);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  const week = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return { week, year: d.getFullYear() };
};

/**
 * Componente de Blindaje de Interfaz.
 */
const ShieldedLayout: React.FC<{ children: React.ReactNode, hasError: boolean, shieldError?: string }> = ({ children, hasError, shieldError }) => {
  if (hasError || shieldError) {
    const isShieldFail = !!shieldError;
    return (
      <div className="min-h-screen bg-[#001021] flex flex-col items-center justify-center p-12 text-center font-sans text-white">
        <div className={`bg-rose-500/10 border ${isShieldFail ? 'border-amber-500/50' : 'border-rose-500/30'} p-12 rounded-[3rem] max-w-lg shadow-2xl`}>
          <div className={`${isShieldFail ? 'bg-amber-500' : 'bg-rose-500'} w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg ${isShieldFail ? 'shadow-amber-500/20' : 'shadow-rose-500/20'} text-white`}>
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d={isShieldFail ? "M12 15v2m0-8V7m0 8h.01M4.93 4.93l.08.08a10 10 0 1114 0l.08-.08" : "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 17c-.77 1.333.192 3 1.732 3z"} />
            </svg>
          </div>
          <h2 className="text-3xl font-black uppercase tracking-tighter mb-4">{isShieldFail ? 'SHIELD VIOLATION' : 'CRITICAL SYSTEM ERROR'}</h2>
          <p className="text-rose-200/60 font-bold text-sm uppercase tracking-widest leading-relaxed mb-8">
            {isShieldFail
              ? `ACCESO RESTRINGIDO: ${shieldError}. Se ha activado el Hard-Lock de seguridad para IPS.`
              : 'Se ha detectado una corrupción en los datos locales. El sistema ha activado el protocolo de blindaje.'}
          </p>
          {!isShieldFail && (
            <button
              onClick={() => { window.location.reload(); }}
              className="w-full py-5 bg-rose-600 text-white font-black uppercase tracking-widest rounded-2xl hover:bg-rose-700 transition-all shadow-xl shadow-rose-500/20"
            >
              Reiniciar Interfaz
            </button>
          )}
        </div>
      </div>
    );
  }
  return <>{children}</>;
};

/**
 * Iconos SVG para la navbar inferior.
 */
const NavIcons = {
  dashboard: (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 13a1 1 0 011-1h4a1 1 0 011 1v6a1 1 0 01-1 1h-4a1 1 0 01-1-1v-6z" /></svg>
  ),
  analisis: (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
  ),
  regiones: (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
  ),
};

/**
 * Componente Raíz de IPS Análisis Estratégico v9.2.4
 */
const App: React.FC = () => {
  const [globalError, setGlobalError] = useState(false);

  // Auth State
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userRole, setUserRole] = useState<'admin' | 'editor' | 'viewer' | 'director'>('viewer');
  const [canViewReports, setCanViewReports] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });

  // View Mode State
  const [viewMode, setViewMode] = useState<'normal' | 'minimal' | 'presentation'>('normal');
  const [activeView, setActiveView] = useState<AppView>('dashboard');

  // App Data State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [reportTitle, setReportTitle] = useState('IPS ANÁLISIS ESTRATÉGICO DE VACANTES');
  const initialPeriod = getTargetOpeningWeek();
  const [selectedWeek, setSelectedWeek] = useState(initialPeriod.week);
  const [selectedYear, setSelectedYear] = useState(initialPeriod.year);
  const [entries, setEntries] = useState<WeeklyData[]>([]);
  const [regions, setRegions] = useState<Region[]>(INITIAL_REGIONS);
  const [unes, setUnes] = useState<UNE[]>(INITIAL_UNES);
  const [openRegionId, setOpenRegionId] = useState<string | null>(INITIAL_REGIONS[0].id);

  // Modals & Panels State
  const [isChartsOpen, setIsChartsOpen] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isUsersOpen, setIsUsersOpen] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [showMappingModal, setShowMappingModal] = useState(false);
  const [isCaptureModalOpen, setIsCaptureModalOpen] = useState(false);
  const [csvRows, setCsvRows] = useState<string[][]>([]);
  const [usersList, setUsersList] = useState<User[]>([]);

  // Metrics State
  const [nationalMetrics, setNationalMetrics] = useState<NationalMetrics>({
    metas: { altas: 200, bajas: 100, vacantes: 300, porcentaje: 5.0, edoFza: 5500 },
    thresholds: { green: 90, yellow: 80 },
    globalPeriod: { week: getCurrentISOWeek(), year: new Date().getFullYear(), syncEnabled: false }
  });

  const [saveStatus, setSaveStatus] = useState<'synced' | 'saving' | 'pending'>('synced');
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }));
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [viewingReport, setViewingReport] = useState<any>(null);

  // Analisis Semanal Hook
  const { analyses } = useWeeklyAnalysis();

  const currentReport = useMemo(() => {
    return (analyses || []).find(a => Number(a.semana) === Number(selectedWeek) && Number(a.año) === Number(selectedYear));
  }, [analyses, selectedWeek, selectedYear]);

  const hasReport = !!currentReport;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Authentication logic
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setAuthLoading(true);
        if (user) {
          setCurrentUser(user);
          try {
            const fetchUserProfile = async () => {
              const userDoc = await getDoc(doc(db, 'vac_users', user.uid));
              if (userDoc.exists()) {
                const data = userDoc.data();
                const role = String(data.role || 'viewer').trim().toLowerCase();
                setUserRole(role as any);
                setCanViewReports(!!data.canViewReports || role === 'admin');
                setAuthLoading(false);
              } else {
                // 🛡️ NUCLEAR ISOLATION (v11.0.0-VAC): BLOQUEO DE ACCESO CRUZADO
                console.error("🕵️ ALERTA DE SEGURIDAD: Intento de acceso desde otra burbuja.");
                setLoginError("Acceso Denegado: Su cuenta no pertenece a la burbuja de Vacantes.");
                setCurrentUser(null);
                setUserRole('viewer');
                setCanViewReports(false);
                setAuthLoading(false);
                setTimeout(() => signOut(auth), 3000);
              }
            };
            await fetchUserProfile();
          } catch (e) {
            console.error("Critical role fetch error:", e);
            setLoginError("Error de conexión con el escudo de seguridad.");
            setAuthLoading(false);
          }
        } else {
          setCurrentUser(null);
          setUserRole('viewer');
          setCanViewReports(false);
          setAuthLoading(false);
        }
      });
      return () => unsubscribe();
    }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setLoginError(null);
    try {
      await signInWithEmailAndPassword(auth, loginForm.email, loginForm.password);
    } catch (error: any) {
      console.error("Login error:", error);
      let msg = "ACCESO DENEGADO";
      if (error.code === 'auth/invalid-credential') msg = "CREDENCIALES INCORRECTAS";
      setLoginError(msg);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      setUserRole('viewer');
    } catch (e) {
      console.error("Logout error:", e);
      window.location.reload();
    }
  };

   /**
    * Sincronización en tiempo real con Firestore bajo arquitectura Platinum Shield.
    * Maneja: 
    * 1. Datos semanales (vac_weekly_data)
    * 2. Título del informe (vac_config/global)
    * 3. Métricas y periodo global (vac_config/metrics)
    * 4. Regiones y supervisores (vac_config/regions)
    * 5. Catálogo de UNEs (vac_unes)
    * 6. Lista de usuarios (vac_users) - Solo para Admins
    */
  useEffect(() => {
    if (!currentUser) return;

    const q = collection(db, 'vac_weekly_data');
    const unsubEntries = onSnapshot(q, (snapshot) => {
      const data: WeeklyData[] = [];
      snapshot.forEach(doc => data.push(doc.data() as WeeklyData));
      setEntries(data);
    });

    const unsubTitle = onSnapshot(doc(db, 'vac_config', 'global'), (doc) => {
      if (doc.exists() && doc.data().reportTitle) setReportTitle(doc.data().reportTitle);
    });

    const unsubMetrics = onSnapshot(doc(db, 'vac_config', 'metrics'), (doc) => {
      if (doc.exists()) {
        const metricsData = doc.data() as NationalMetrics;
        setNationalMetrics(metricsData);
        
        // 🔄 Lógica de Apertura: 
        // Se fuerza la apertura en la semana ANTERIOR a la actual si el sync está desfasado o inactivo.
        if (metricsData.globalPeriod?.syncEnabled) {
          const target = getTargetOpeningWeek();
          // Si la semana de Firestore es antigua comparada con la objetivo (S-1),
          // priorizamos la semana objetivo real.
          if (metricsData.globalPeriod.week < target.week && metricsData.globalPeriod.year <= target.year) {
             console.log("⚠️ Master Sync desfasado. Priorizando semana anterior calculada (Target S-1).");
             setSelectedWeek(target.week);
             setSelectedYear(target.year);
          } else {
             setSelectedWeek(metricsData.globalPeriod.week);
             setSelectedYear(metricsData.globalPeriod.year);
          }
        }
      }
    });

    const unsubRegions = onSnapshot(doc(db, 'vac_config', 'regions'), (doc) => {
      if (doc.exists() && doc.data().list) {
        const firestoreRegions = doc.data().list;
        let finalRegions = [...INITIAL_REGIONS];
        firestoreRegions.forEach((fr: Region) => {
          const idx = finalRegions.findIndex(r => r.id === fr.id);
          if (idx !== -1) finalRegions[idx] = fr;
        });
        setRegions(finalRegions);
      }
    });

    const qUnes = collection(db, 'vac_unes');
    const unsubUnes = onSnapshot(qUnes, (snapshot) => {
      const dynamicUnes: UNE[] = [];
      snapshot.forEach(doc => dynamicUnes.push(doc.data() as UNE));
      const allUnes = [...INITIAL_UNES];
      dynamicUnes.forEach(d => {
        if (!allUnes.some(u => u.id === d.id)) {
          allUnes.push(d);
        }
      });
      setUnes(allUnes);
    });

    let unsubUsers = () => { };
    if (userRole === 'admin') {
      const uq = collection(db, 'vac_users');
      unsubUsers = onSnapshot(uq, (snapshot) => {
        const usrs: User[] = [];
        snapshot.forEach(d => usrs.push({ id: d.id, ...d.data() } as User));
        setUsersList(usrs);
      });
    }

    return () => { unsubEntries(); unsubTitle(); unsubMetrics(); unsubRegions(); unsubUsers(); unsubUnes(); };
  }, [currentUser, userRole]);

  // Command handlers
  /**
   * Actualiza o crea datos semanales para una UNE específica.
   * Genera IDs deterministas (YYYY_WW_UNEID) para garantizar persistencia y evitar duplicados.
   * @param newData - Datos operativos capturados.
   */
  const handleUpdateData = useCallback(async (newData: WeeklyData) => {
    if (userRole === 'viewer') return;
    setSaveStatus('saving');
    const docId = `${newData.year}_${newData.week}_${newData.uneId}`;
    try {
      await setDoc(doc(db, 'vac_weekly_data', docId), newData);
      setSaveStatus('synced');
    } catch (e) {
      console.error("Error saving data:", e);
      setSaveStatus('pending');
    }
  }, [userRole]);

  const handleUpdateRegion = async (id: string, name: string, editor: string) => {
    if (userRole !== 'admin') return;
    const newRegions = regions.map(r => r.id === id ? { ...r, name, editor } : r);
    setSaveStatus('saving');
    await setDoc(doc(db, 'vac_config', 'regions'), { list: newRegions }, { merge: true });
    setSaveStatus('synced');
  };

  const saveTitle = async (newTitle: string) => {
    if (userRole !== 'admin') return;
    setSaveStatus('saving');
    await setDoc(doc(db, 'vac_config', 'global'), { reportTitle: newTitle }, { merge: true });
    setSaveStatus('synced');
  }

  const saveMetrics = async (newMetrics: NationalMetrics) => {
    if (userRole !== 'admin') return;
    setSaveStatus('saving');
    await setDoc(doc(db, 'vac_config', 'metrics'), newMetrics, { merge: true });
    setSaveStatus('synced');
  }

  const handleSaveUser = async (userToSave: User, password?: string) => {
    if (userRole !== 'admin') return;
    if (!userToSave.id || userToSave.id.length < 10) {
      const secondaryApp = initializeApp(firebaseConfig, "Secondary");
      const secondaryAuth = getAuth(secondaryApp);
      try {
        await signOut(secondaryAuth);
        const cred = await createUserWithEmailAndPassword(secondaryAuth, userToSave.email, password!);
        const newUser = { ...userToSave, id: cred.user.uid };
        await setDoc(doc(db, 'vac_users', cred.user.uid), newUser);
        await signOut(secondaryAuth);
      } catch (e: any) {
        console.error("Error creating user:", e);
        throw e;
      }
    } else {
      await setDoc(doc(db, 'vac_users', userToSave.id), userToSave, { merge: true });
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (userRole === 'admin') await deleteDoc(doc(db, 'vac_users', id));
  };

  const handleCreateUne = async (newUne: UNE, initialData: WeeklyData) => {
    try {
      await setDoc(doc(db, 'vac_unes', newUne.id), newUne);
      await handleUpdateData(initialData);
    } catch (e) {
      console.error("Error creating client:", e);
      alert("Error al crear cliente. Intente nuevamente.");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const firstLine = text.split('\n')[0];
      const delimiter = firstLine.includes(';') ? ';' : ',';
      const rows = text.split(/\r?\n/)
        .map(row => row.split(delimiter).map(cell => cell.trim().replace(/^"|"$/g, '')))
        .filter(row => row.length > 1 && row.some(cell => cell !== ''));
      if (rows.length === 0) return alert("ARCHIVO INVÁLIDO");
      setCsvRows(rows);
      setShowMappingModal(true);
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Computations
  const currentComputedEntries = useMemo(() => {
    return (entries || [])
      .filter(e => e.week === selectedWeek && e.year === selectedYear && e.uneId !== 'NATIONAL_DATA')
      .map(e => computeEntryData(e, nationalMetrics));
  }, [entries, selectedWeek, selectedYear, nationalMetrics]);

  const prevWeekNum = selectedWeek === 1 ? 52 : selectedWeek - 1;
  const prevYearNum = selectedWeek === 1 ? selectedYear - 1 : selectedYear;

  const prevComputedEntries = useMemo(() => {
    return (entries || [])
      .filter(e => e.week === prevWeekNum && e.year === prevYearNum && e.uneId !== 'NATIONAL_DATA')
      .map(e => computeEntryData(e, nationalMetrics));
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
    return Object.values(weeksMap)
      .filter(w => w.year < selectedYear || (w.year === selectedYear && w.week <= selectedWeek))
      .sort((a, b) => (a.year * 1000 + a.week) - (b.year * 1000 + b.week))
      .slice(-12);
  }, [entries, selectedWeek, selectedYear]);

  // ─── LOGIN SCREEN ───
  if (authLoading && !currentUser) {
    return <div className="min-h-screen bg-[#0A0F1E] flex items-center justify-center"><div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#0A0F1E] flex items-center justify-center p-6 font-sans relative overflow-hidden text-white">
        <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
        <div className="bg-[#111827] border border-blue-900/30 p-1 rounded-[2.5rem] shadow-[0_0_120px_rgba(0,0,0,0.8)] w-full max-w-md relative z-10 ips-slide-in">
          <form onSubmit={handleLogin} className="p-8 md:p-12 text-center">
            <div className="mb-10 flex justify-center">
              <div className="bg-gradient-to-b from-[#3b82f6] to-[#2563eb] px-10 py-3.5 rounded-xl font-black italic text-white shadow-[0_10px_25px_-5px_rgba(37,99,235,0.6)] tracking-widest text-base border border-blue-400/30 w-full uppercase">
                IAPRIORI CONSULTING
              </div>
            </div>
            <div className="mb-10 text-white">
              <h1 className="text-[36px] font-black uppercase tracking-tighter leading-none mb-3">ACCESO IPS</h1>
              <p className="text-blue-400/40 text-[10px] font-black uppercase tracking-[0.3em] leading-relaxed">SISTEMA ESTRATÉGICO</p>
            </div>
            <div className="space-y-6 text-left">
              {loginError && <div className="bg-rose-500/10 border border-rose-500/30 p-4 rounded-xl text-rose-500 text-[10px] font-black uppercase tracking-widest text-center">{loginError}</div>}
              <div>
                <label className="text-[10px] font-black text-blue-200/20 uppercase tracking-[0.2em] mb-3 block ml-1">USUARIO CORPORATIVO</label>
                <input required type="email" className="w-full bg-[#0d1525] border border-blue-900/40 rounded-xl px-6 py-4 text-white font-bold placeholder-white/10 outline-none transition-all text-center text-base focus:border-blue-500" value={loginForm.email} onChange={e => setLoginForm({ ...loginForm, email: e.target.value })} />
              </div>
              <div>
                <label className="text-[10px] font-black text-blue-200/20 uppercase tracking-[0.2em] mb-3 block ml-1">CONTRASEÑA SEGURA</label>
                <input required type="password" className="w-full bg-[#0d1525] border border-blue-900/40 rounded-xl px-6 py-4 text-white font-bold placeholder-white/10 outline-none transition-all text-center text-base focus:border-blue-500" value={loginForm.password} onChange={e => setLoginForm({ ...loginForm, password: e.target.value })} />
              </div>
              <button disabled={authLoading} type="submit" className="w-full py-5 bg-gradient-to-b from-[#3b82f6] to-[#2563eb] text-white font-black uppercase text-sm tracking-[0.2em] rounded-xl transition-all shadow-[0_15px_40px_-10px_rgba(37,99,235,0.6)] active:scale-[0.98] disabled:opacity-50 mt-2 border border-white/10">
                {authLoading ? 'AUTENTICANDO...' : 'INICIAR SESIÓN'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // ─── MAIN APP ───
  return (
    <ShieldedLayout hasError={globalError} shieldError={!shieldStatus.isValid ? shieldStatus.error : undefined}>
      <div className="min-h-screen bg-[#0A0F1E] pb-safe-nav font-sans text-slate-200 selection:bg-blue-900">

        {/* ═══ HEADER COMPACTO ═══ */}
        <header className="ips-header">
          <div className="max-w-[98%] mx-auto px-3 md:px-6 py-2.5 md:py-3.5 flex items-center justify-between gap-3">
            {/* Left: Logo + Title */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="bg-[#2563eb] px-3 py-1.5 md:px-5 md:py-2 rounded-lg md:rounded-xl font-black italic text-[10px] md:text-sm shadow-lg shadow-blue-600/20 tracking-[0.15em] border border-blue-400/30 uppercase flex-shrink-0">
                IAPRIORI
              </div>
              <div className="min-w-0 flex-1">
                {isEditingTitle && userRole === 'admin' ? (
                  <input autoFocus className="bg-white/5 border-b-2 border-blue-500 text-white font-black text-base md:text-xl uppercase tracking-tighter outline-none px-2 py-0.5 w-full" value={reportTitle} onChange={(e) => setReportTitle(e.target.value.toUpperCase())} onBlur={() => setIsEditingTitle(false)} onKeyDown={(e) => { if (e.key === 'Enter') { saveTitle(reportTitle); setIsEditingTitle(false); } }} />
                ) : (
                  <h1 onClick={() => userRole === 'admin' && setIsEditingTitle(true)} className={`font-black text-sm md:text-xl uppercase tracking-tighter text-white leading-none truncate ${userRole === 'admin' ? 'cursor-pointer hover:text-blue-300 transition-colors' : ''}`} title={reportTitle}>{reportTitle}</h1>
                )}
                <span className="text-[7px] md:text-[9px] font-black text-blue-400/40 tracking-[0.2em] mt-0.5 uppercase block">
                  SISTEMA ESTRATÉGICO - <span className="text-blue-500/60 font-mono-data">{APP_VERSION}</span>
                </span>
              </div>
            </div>

            {/* Center: Status Badge */}
            <div className="hidden md:flex items-center gap-2 bg-[#111827] px-4 py-2 rounded-xl border border-blue-900/30">
              <div className="w-2 h-2 rounded-full bg-emerald-400 ips-audit-dot flex-shrink-0"></div>
              <span className="text-[8px] font-black text-emerald-400 uppercase tracking-[0.15em] whitespace-nowrap">
                AUDITADO • {currentTime}
              </span>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Mobile Status */}
              <div className="flex md:hidden items-center gap-1.5 bg-emerald-500/10 px-2.5 py-1.5 rounded-lg border border-emerald-500/20">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 ips-audit-dot"></div>
                <span className="text-[7px] font-black text-emerald-400 uppercase tracking-wider">{currentTime}</span>
              </div>

              {/* Role Badge */}
              <div className={`hidden md:block px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border ${userRole === 'admin' ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' : (userRole === 'editor' || userRole === 'director') ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-slate-500/10 border-slate-500/30 text-slate-400'}`}>
                {userRole}
              </div>

              {/* View Mode Toggles (Desktop) */}
              <div className="hidden lg:flex bg-[#111827] rounded-lg p-0.5 border border-blue-900/30">
                {(['normal', 'minimal', 'presentation'] as const).map(mode => (
                  <button key={mode} onClick={() => setViewMode(mode)} aria-label={`Vista ${mode}`} className={`px-2.5 py-1.5 rounded-md text-[9px] font-black uppercase tracking-wider transition-all ${viewMode === mode ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:bg-white/5'}`}>
                    {mode === 'normal' ? 'Normal' : mode === 'minimal' ? 'Min' : 'Present'}
                  </button>
                ))}
              </div>

              {/* Desktop Actions */}
              {(userRole === 'admin' || userRole === 'editor' || userRole === 'director') && viewMode !== 'presentation' && activeView === 'dashboard' && (
                <div className="hidden md:flex items-center gap-2">
                  <button onClick={() => setIsCaptureModalOpen(true)} className="px-4 h-10 flex items-center gap-2 bg-emerald-600 rounded-lg border border-emerald-400/20 shadow-lg active:scale-95 transition-all text-[9px] font-black uppercase tracking-widest text-white" aria-label="Nueva captura">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
                    Captura
                  </button>
                  <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".csv" className="hidden" />
                  <button onClick={() => fileInputRef.current?.click()} className="w-10 h-10 flex items-center justify-center bg-[#111827] hover:bg-[#1e293b] text-blue-400 rounded-lg border border-blue-900/30 transition-all" title="Importar CSV" aria-label="Importar CSV">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                  </button>
                </div>
              )}

              {/* Week Selector (Desktop) */}
              {activeView === 'dashboard' && (
                <div className="hidden md:flex items-center bg-[#111827] rounded-lg p-0.5 border border-blue-900/30 h-10">
                  <button onClick={() => { if (selectedWeek <= 1) { setSelectedWeek(52); setSelectedYear(y => y - 1); } else { setSelectedWeek(w => w - 1); } }} className="h-9 w-9 flex items-center justify-center hover:bg-white/5 rounded-lg transition-all" aria-label="Semana anterior">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg>
                  </button>
                  <div className="flex items-center gap-1.5 px-3">
                    <span className="font-black text-xs tabular-nums uppercase tracking-widest text-center font-mono-data whitespace-nowrap">S{selectedWeek} • {selectedYear}</span>
                    {hasReport && (
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,1)] animate-pulse" title="INFORME DISPONIBLE"></div>
                    )}
                  </div>
                  <button onClick={() => { if (selectedWeek >= 52) { setSelectedWeek(1); setSelectedYear(y => y + 1); } else { setSelectedWeek(w => w + 1); } }} className="h-9 w-9 flex items-center justify-center hover:bg-white/5 rounded-lg transition-all" aria-label="Semana siguiente">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
                  </button>
                </div>
              )}

              {/* Admin buttons (desktop) */}
              {userRole === 'admin' && viewMode !== 'presentation' && (
                <div className="hidden md:flex items-center gap-1">
                  <button onClick={() => setIsUsersOpen(true)} className="w-10 h-10 flex items-center justify-center bg-[#111827] hover:bg-[#1e293b] text-blue-400 rounded-lg border border-blue-900/30 transition-all" aria-label="Gestión de usuarios">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                  </button>
                  <button onClick={() => setIsConfigOpen(true)} className="w-10 h-10 flex items-center justify-center bg-[#111827] hover:bg-[#1e293b] text-amber-500 rounded-lg border border-amber-500/20 transition-all" aria-label="Configuración">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><circle cx="12" cy="12" r="3" strokeWidth="2" /></svg>
                  </button>
                </div>
              )}

              {/* Logout */}
              <button onClick={handleLogout} className="w-10 h-10 bg-[#111827] hover:bg-rose-600/80 rounded-lg border border-blue-900/30 flex items-center justify-center transition-all group" aria-label="Cerrar sesión">
                <svg className="w-4 h-4 text-white group-hover:text-rose-100 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              </button>
            </div>
          </div>

          {/* Mobile Week Selector + Actions Bar */}
          {activeView === 'dashboard' && (
            <div className="md:hidden bg-[#0A0F1E]/80 backdrop-blur-md border-t border-blue-900/30 px-3 py-2 flex items-center gap-2">
              {/* Week Selector */}
              <div className="flex items-center bg-[#111827] rounded-lg p-0.5 border border-blue-900/30 flex-1 h-10">
                <button onClick={() => { if (selectedWeek <= 1) { setSelectedWeek(52); setSelectedYear(y => y - 1); } else { setSelectedWeek(w => w - 1); } }} className="h-9 w-9 flex items-center justify-center hover:bg-white/10 rounded-lg transition-all" aria-label="Semana anterior">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg>
                </button>
                <div className="flex-1 flex items-center justify-center gap-2">
                  <span className="font-black text-xs tabular-nums uppercase tracking-widest text-center font-mono-data">S{selectedWeek} • {selectedYear}</span>
                  {hasReport && (
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,1)] animate-pulse" title="INFORME DISPONIBLE"></div>
                  )}
                </div>
                <button onClick={() => { if (selectedWeek >= 52) { setSelectedWeek(1); setSelectedYear(y => y + 1); } else { setSelectedWeek(w => w + 1); } }} className="h-9 w-9 flex items-center justify-center hover:bg-white/10 rounded-lg transition-all" aria-label="Semana siguiente">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>

              {/* Mobile Action Buttons */}
              {(userRole === 'admin' || userRole === 'editor' || userRole === 'director') && (
                <div className="flex gap-2">
                  <button onClick={() => setIsCaptureModalOpen(true)} className="w-10 h-10 flex items-center justify-center bg-emerald-600 rounded-lg shadow-lg flex-shrink-0" aria-label="Nueva captura">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
                  </button>
                  {userRole === 'admin' && (
                    <button onClick={() => setIsConfigOpen(true)} className="w-10 h-10 flex items-center justify-center bg-amber-600 rounded-lg shadow-lg flex-shrink-0" aria-label="Configuración">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><circle cx="12" cy="12" r="3" strokeWidth="2" /></svg>
                    </button>
                  )}
                  <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".csv" className="hidden" />
                </div>
              )}
            </div>
          )}
        </header>

        {/* ═══ MAIN CONTENT ═══ */}
        <main className={`max-w-[98%] mx-auto px-3 md:px-6 py-4 md:py-8 space-y-4 md:space-y-8 ${activeView === 'dashboard' ? 'pt-[110px] md:pt-[72px]' : 'pt-[70px] md:pt-[72px]'}`}>

          {/* ─── DASHBOARD VIEW ─── */}
          {activeView === 'dashboard' && (
            <>
              <NationalSummary
                data={currentComputedEntries}
                prevData={prevComputedEntries}
                metrics={nationalMetrics}
                week={selectedWeek}
                userRole={userRole}
                nationalData={entries.find(e => e.uneId === 'NATIONAL_DATA' && e.week === selectedWeek && e.year === selectedYear)}
                prevNationalData={entries.find(e => e.uneId === 'NATIONAL_DATA' && e.week === prevWeekNum && e.year === prevYearNum)}
                onUpdate={(uneId, field, value) => {
                  const current = entries.find(e => e.uneId === uneId && e.week === selectedWeek && e.year === selectedYear) || {
                    uneId, week: selectedWeek, year: selectedYear, edoFza: 0, altas: 0, bajas: 0, vacantesIniciales: 0, vacantesRealesFS: 0, comentarios: ''
                  };
                  handleUpdateData({ ...current, [field]: value });
                }}
                hasReport={!!currentReport && canViewReports}
                onViewReport={() => setViewingReport(currentReport)}
              />

              <section className="bg-[#111827] rounded-2xl shadow-sm border border-blue-900/30 overflow-hidden">
                <button onClick={() => setIsChartsOpen(!isChartsOpen)} className="w-full p-4 md:p-6 flex justify-between items-center bg-[#111827] hover:bg-[#1e293b]/50 transition-all">
                  <div className="flex items-center gap-3 text-white">
                    <div className="bg-[#2563eb] p-3 rounded-xl shadow-xl shadow-blue-500/20">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18" /></svg>
                    </div>
                    <h3 className="text-base md:text-lg font-black uppercase tracking-tighter">Performance Estratégica Nacional</h3>
                  </div>
                  <svg className={`w-6 h-6 text-slate-500 transition-transform duration-500 ${isChartsOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
                </button>
                {isChartsOpen && (
                  <div className="p-6 md:p-8 border-t border-blue-900/30 bg-[#0f172a]">
                    <Visualizations trendData={historicalTrend} metas={nationalMetrics.metas} data={currentComputedEntries} />
                  </div>
                )}
              </section>
            </>
          )}

          {/* ─── REGIONES VIEW ─── */}
          {(activeView === 'dashboard' || activeView === 'regiones') && activeView === 'regiones' && (
            <div className="space-y-4 md:space-y-8">
              <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Regiones</h2>
              {regions.map(region => (
                <DashboardTable
                  key={region.id} region={region}
                  unes={unes.filter(u => u.regionId === region.id)}
                  allData={entries} selectedWeek={selectedWeek} selectedYear={selectedYear}
                  onUpdateData={handleUpdateData} isOpen={openRegionId === region.id}
                  onToggle={() => setOpenRegionId(openRegionId === region.id ? null : region.id)}
                  nationalMetrics={nationalMetrics} userRole={userRole}
                  onUpdateRegion={handleUpdateRegion} onEditUne={() => { }}
                  viewMode={viewMode}
                />
              ))}
            </div>
          )}

          {/* Dashboard: Regions inline */}
          {activeView === 'dashboard' && (
            <div className="space-y-4 md:space-y-8">
              {regions.map(region => (
                <DashboardTable
                  key={region.id} region={region}
                  unes={unes.filter(u => u.regionId === region.id)}
                  allData={entries} selectedWeek={selectedWeek} selectedYear={selectedYear}
                  onUpdateData={handleUpdateData} isOpen={openRegionId === region.id}
                  onToggle={() => setOpenRegionId(openRegionId === region.id ? null : region.id)}
                  nationalMetrics={nationalMetrics} userRole={userRole}
                  onUpdateRegion={handleUpdateRegion} onEditUne={() => { }}
                  viewMode={viewMode}
                />
              ))}
            </div>
          )}

          {/* ─── ANÁLISIS SEMANAL VIEW ─── */}
          {activeView === 'analisis' && (
            <AnalisisListView />
          )}

          {/* ─── CONFIG VIEW ─── */}
          {activeView === 'config' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Configuración</h2>
              <div className="bg-[#111827] rounded-2xl p-6 border border-blue-900/30 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-400">Versión del sistema</span>
                  <span className="text-sm font-black text-blue-400 font-mono-data">{APP_VERSION}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-400">Usuario</span>
                  <span className="text-sm font-black text-white truncate max-w-[200px]">{currentUser?.email}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-400">Rol</span>
                  <span className={`px-3 py-1 rounded-lg text-xs font-black uppercase ${userRole === 'admin' ? 'bg-blue-500/10 text-blue-400' : 'bg-emerald-500/10 text-emerald-400'}`}>{userRole}</span>
                </div>
              </div>
              {userRole === 'admin' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button onClick={() => setIsConfigOpen(true)} className="bg-[#111827] rounded-2xl p-6 border border-blue-900/30 hover:border-blue-600/50 transition-all text-left">
                    <h3 className="text-sm font-black text-amber-400 uppercase tracking-wider mb-2">⚙️ Metas y Umbrales</h3>
                    <p className="text-xs text-slate-500">Configurar metas nacionales, objetivos y semáforos</p>
                  </button>
                  <button onClick={() => setIsUsersOpen(true)} className="bg-[#111827] rounded-2xl p-6 border border-blue-900/30 hover:border-blue-600/50 transition-all text-left">
                    <h3 className="text-sm font-black text-blue-400 uppercase tracking-wider mb-2">👥 Usuarios</h3>
                    <p className="text-xs text-slate-500">Gestionar usuarios, roles y permisos</p>
                  </button>
                </div>
              )}
            </div>
          )}
        </main>

        {/* ═══ BOTTOM NAVIGATION BAR ═══ */}
        <nav className="ips-bottom-nav" role="navigation" aria-label="Navegación principal">
          <div className="ips-bottom-nav-inner">
            {[
              { id: 'dashboard' as AppView, label: 'Dashboard', icon: NavIcons.dashboard, show: true },
              { id: 'analisis' as AppView, label: 'Análisis', icon: NavIcons.analisis, show: canViewReports },
              { id: 'regiones' as AppView, label: 'Regiones', icon: NavIcons.regiones, show: true },
            ].filter(i => i.show).map(item => (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`ips-nav-item ${activeView === item.id ? 'active' : ''}`}
                aria-label={item.label}
                aria-current={activeView === item.id ? 'page' : undefined}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* ═══ MODALS & BLINDAJE FUNCIONAL (NO REMOVER PROPS DE ROL) ═══ */}
        {isConfigOpen && userRole === 'admin' && <ConfigPanel config={nationalMetrics} onSave={(c) => { saveMetrics(c); setIsConfigOpen(false); }} onClose={() => setIsConfigOpen(false)} />}
        {isUsersOpen && userRole === 'admin' && <UserManagementModal users={usersList} onSave={handleSaveUser} onDelete={handleDeleteUser} onClose={() => setIsUsersOpen(false)} />}
        {showMappingModal && <MappingModal rows={csvRows} onCancel={() => setShowMappingModal(false)} onConfirm={(ne) => { ne.forEach(n => handleUpdateData(n)); setShowMappingModal(false); }} defaultWeek={selectedWeek} defaultYear={selectedYear} />}
        {isCaptureModalOpen && <DataEntryModal userRole={userRole} week={selectedWeek} year={selectedYear} nationalMetrics={nationalMetrics} onSave={handleUpdateData} existingEntries={entries} onClose={() => setIsCaptureModalOpen(false)} unes={unes} onCreateClient={handleCreateUne} />}
        {viewingReport && <ReportViewerModal analysis={viewingReport} onClose={() => setViewingReport(null)} />}
      </div>
    </ShieldedLayout>
  );
};

export default App;
