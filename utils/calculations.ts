
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
