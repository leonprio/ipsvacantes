
/**
 * Estructura de usuario del sistema bajo arquitectura Platinum Shield.
 * Los usuarios se gestionan en la colección `vac_users`.
 * 
 * Roles:
 * - admin: Control total, gestión de usuarios y configuración.
 * - editor: Captura de datos operativos y edición nacional.
 * - viewer: Visualización de dashboards solamente.
 * - director: Visualización estratégica e informes detallados.
 */
export interface User {
  id: string; // Firebase Auth UID
  email: string;
  name: string;
  password?: string;
  role: 'admin' | 'editor' | 'viewer' | 'director';
  active?: boolean;
  canViewReports?: boolean; // Permiso específico para ver informes semanales (WeeklyAnalysis)
}

/**
 * Unidad Estratégica Independiente o Cliente gestionado.
 * Mapeable dentro de una Región.
 */
export interface UNE {
  id: string;
  name: string;
  regionId: string;
}

/**
 * Agrupación de Múltiples UNEs bajo una supervisión superior.
 */
export interface Region {
  id: string;
  name: string;
  editor: string;
}

/**
 * Datos semanales capturados por unidad estratégica (UNE).
 * 
 * NOTA DE BLINDAJE: El `uneId` con valor "NATIONAL_DATA" es una entrada virtual
 * que consolida o permite la captura del "Total c/ Apoyos" a nivel nacional.
 */
export interface WeeklyData {
  uneId: string; // ID de la UNE o "NATIONAL_DATA"
  week: number;
  year: number;
  edoFza: number;
  altas: number;
  bajas: number;
  vacantesIniciales: number;
  vacantesRealesFS: number;
  comentarios?: string;
}

export interface ComputedData extends WeeklyData {
  vacantesFinales: number;
  porcentajeVacantes: number;
  status: 'green' | 'yellow' | 'red';
}

/**
 * Métricas Nacionales y Globales del Dashboard.
 *
 * @interface NationalMetrics
 * @property {object} metas - Objetivos numéricos semanales.
 * @property {object} thresholds - Umbrales para cálculo de estado (verde/amarillo).
 * @property {object} globalPeriod - Sincronización de semana y año actual.
 */
export interface NationalMetrics {
  metas: {
    altas: number;
    bajas: number;
    vacantes: number;
    porcentaje: number;
    edoFza: number;
  };
  thresholds: {
    green: number;
    yellow: number;
  };
  globalPeriod: {
    week: number;
    year: number;
    syncEnabled: boolean;
  };
}

// ──────────────────────────────────────────────
// Módulo: Análisis Estratégico Semanal
// ──────────────────────────────────────────────

/**
 * Estado semáforo para indicadores clave.
 */
export type SemaforoStatus = 'verde' | 'amarillo' | 'rojo';

/**
 * Elemento individual del Termómetro Operativo.
 */
export interface TermometroItem {
  valorReal: number;
  meta: number;
  porcentaje: number;
  comentario: string;
}

/**
 * Sección Estado de Fuerza del Análisis.
 */
export interface EstadoFuerzaAnalisis {
  elementosActivos: number;
  metaEsperada: number;
  diferencia: number;
  descripcion: string;
}

/**
 * Sección Vacantes Críticas del Análisis.
 */
export interface VacantesCriticasAnalisis {
  valorReal: number;
  limite: number;
  diferencia: number;
  comentario: string;
}

/**
 * Sección % Vacantes (Semáforo) del Análisis.
 */
export interface SemaforoVacantesAnalisis {
  porcentajeActual: number;
  meta: number;
  status: SemaforoStatus;
}

/**
 * Item de alerta o recomendación dinámica.
 */
export interface DynamicListItem {
  id: string;
  texto: string;
}

/**
 * Análisis Estratégico Semanal (Executive Intelligence).
 * Proporciona una capa superior de inteligencia de negocio por encima de los datos brutos.
 * Almacenado en `vac_weekly_analysis`.
 */
export interface WeeklyAnalysis {
  id: string; // Formato robusto: ANALYSIS_YYYY_WX
  semana: number;
  año: number;
  fechaCierre: string; // Fecha en que se completó el análisis
  autor: string; // Usualmente "León Prior"
  creadoEn: string;
  actualizadoEn: string;

  estadoFuerza: EstadoFuerzaAnalisis;

  termometro: {
    altasNacionales: TermometroItem;
    bajasNacionales: TermometroItem;
    vacantesOperativas: TermometroItem;
  };

  vacantesCriticas: VacantesCriticasAnalisis;
  semaforoVacantes: SemaforoVacantesAnalisis;

  analisisEjecutivo: string; // Texto enriquecido/markdown con el análisis cualitativo
  alertas: DynamicListItem[]; // Lista de puntos de atención urgente
  recomendaciones: DynamicListItem[]; // Lista de acciones estratégicas sugeridas
}

/**
 * Vista activa de la app.
 */
export type AppView = 'dashboard' | 'analisis' | 'regiones' | 'config';
