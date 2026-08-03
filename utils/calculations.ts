
import { WeeklyData, ComputedData, NationalMetrics } from '../types';

/**
 * Formatea un número según el locale es-MX.
 * @param {number | undefined | null} num - El valor numérico a formatear.
 * @returns {string} Cadena formateada o '0' si el valor es inválido.
 */
export const formatNumber = (num: number | undefined | null): string => {
  if (num === null || num === undefined || isNaN(num)) return '0';
  return new Intl.NumberFormat('es-MX').format(num);
};

/**
 * Procesa y calcula métricas derivadas a partir de datos semanales sin procesar.
 * @param {WeeklyData} data - Datos de la semana capturada.
 * @param {NationalMetrics} metrics - Objetivos y umbrales configurados.
 * @returns {ComputedData} Datos procesados con cálculos de cumplimiento y estado.
 */
export const computeEntryData = (
  data: WeeklyData,
  metrics: NationalMetrics
): ComputedData => {
  // Blindaje contra objetos incompletos
  const safeData = {
    edoFza: Number(data.edoFza) || 0,
    altas: Number(data.altas) || 0,
    bajas: Number(data.bajas) || 0,
    vacantesIniciales: Number(data.vacantesIniciales) || 0,
    vacantesRealesFS: Number(data.vacantesRealesFS) || 0,
    ...data
  };

  const metaPorcentaje = metrics?.metas?.porcentaje ?? 5.0;
  const greenThreshold = metrics?.thresholds?.green ?? 90;
  const yellowThreshold = metrics?.thresholds?.yellow ?? 80;

  const vacantesFinales = safeData.vacantesIniciales + safeData.bajas - safeData.altas;
  const porcentajeVacantes = safeData.edoFza > 0 ? (safeData.vacantesRealesFS / safeData.edoFza) * 100 : 0;

  // Cálculo de cumplimiento basado en meta (Inversamente proporcional: menos vacantes = más cumplimiento)
  const fulfillment = porcentajeVacantes === 0 ? 100 : (metaPorcentaje / porcentajeVacantes) * 100;

  let status: 'green' | 'yellow' | 'red' = 'red';

  if (fulfillment >= greenThreshold) {
    status = 'green';
  } else if (fulfillment >= yellowThreshold) {
    status = 'yellow';
  } else {
    status = 'red';
  }

  return {
    ...safeData,
    vacantesFinales,
    porcentajeVacantes,
    status,
  };
};

/**
 * Calcula las metas absolutas de altas, bajas y vacantes basadas en la metodología porcentual
 * para una semana y año dados, a partir del estado de fuerza de la semana anterior.
 */
export const calculatePercentageTargets = (
  week: number,
  year: number,
  entries: WeeklyData[],
  metrics: NationalMetrics,
  weeklyAnalysisList?: any[]
) => {
  // La nueva metodología inicia exactamente en el Año 2026, Semana 29
  const isPercentageMethodology = year > 2026 || (year === 2026 && week >= 29);

  if (!isPercentageMethodology) {
    return {
      isPercentage: false,
      altasTargetAbsolute: metrics?.metas?.altas ?? 200,
      bajasLimitAbsolute: metrics?.metas?.bajas ?? 100,
      vacancyTargetAbsolute: metrics?.metas?.vacantes ?? 300,
      vacantesTargetAbsolute: metrics?.metas?.vacantes ?? 300,
      baseWorkforce: metrics?.metas?.edoFza ?? 5500,
      baseWeek: week === 1 ? 52 : week - 1,
      baseYear: week === 1 ? year - 1 : year,
      altasTargetPercentage: 0,
      bajasLimitPercentage: 0,
      isConfigured: true,
      isProvisional: false,
      methodology: "ABSOLUTE_FIXED"
    };
  }

  // 1. Verificar si hay un informe cerrado/publicado con snapshot inmutable
  const reportId = `ANALYSIS_${year}_W${week}`;
  const existingReport = (weeklyAnalysisList || []).find(r => r.id === reportId);

  if (existingReport && existingReport.methodologySnapshot) {
    const snap = existingReport.methodologySnapshot;
    const vacTarget = snap.vacancyTargetAbsolute ?? snap.vacantesTargetAbsolute ?? Math.floor(snap.baseWorkforce * (metrics?.metas?.porcentaje || 5.0) / 100);
    return {
      isPercentage: true,
      altasTargetAbsolute: snap.altasTargetAbsolute,
      bajasLimitAbsolute: snap.bajasLimitAbsolute,
      vacancyTargetAbsolute: vacTarget,
      vacantesTargetAbsolute: vacTarget,
      baseWorkforce: snap.baseWorkforce,
      baseWeek: snap.baseWeek,
      baseYear: snap.baseYear,
      altasTargetPercentage: snap.altasTargetPercentage,
      bajasLimitPercentage: snap.bajasLimitPercentage,
      isConfigured: true,
      isProvisional: false,
      methodology: snap.methodology
    };
  }

  // 2. Si la semana está abierta, cálculo dinámico (provisional) sobre semana anterior
  const prevWeekNum = week === 1 ? 52 : week - 1;
  const prevYearNum = week === 1 ? year - 1 : year;

  // Obtener el estado de fuerza nacional real (suma de todas las UNEs excluyendo NATIONAL_DATA) de la semana base anterior
  const prevWeekEntries = (entries || []).filter(
    e => e.uneId !== 'NATIONAL_DATA' && e.week === prevWeekNum && e.year === prevYearNum
  );
  const baseWorkforce = prevWeekEntries.reduce((acc, curr) => acc + (Number(curr.edoFza) || 0), 0);

  const altasPct = metrics?.altasTargetPercentage || 3;
  const bajasPct = metrics?.bajasLimitPercentage || 2;
  const vacPct = metrics?.metas?.porcentaje || 5;

  // Altas: redondeo hacia arriba (Math.ceil)
  const altasTargetAbsolute = Math.ceil(baseWorkforce * altasPct / 100);
  // Bajas: redondeo hacia abajo (Math.floor)
  const bajasLimitAbsolute = Math.floor(baseWorkforce * bajasPct / 100);
  // Vacantes: redondeo hacia abajo (Math.floor)
  const vacancyTargetAbsolute = Math.floor(baseWorkforce * vacPct / 100);

  return {
    isPercentage: true,
    altasTargetAbsolute,
    bajasLimitAbsolute,
    vacancyTargetAbsolute,
    vacantesTargetAbsolute: vacancyTargetAbsolute,
    baseWorkforce,
    baseWeek: prevWeekNum,
    baseYear: prevYearNum,
    altasTargetPercentage: altasPct,
    bajasLimitPercentage: bajasPct,
    isConfigured: true,
    isProvisional: true,
    methodology: "PERCENTAGE_PREVIOUS_WEEK_WORKFORCE"
  };
};
