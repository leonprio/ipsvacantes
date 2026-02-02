
import { WeeklyData, ComputedData, NationalMetrics } from '../types';

export const formatNumber = (num: number | undefined | null): string => {
  if (num === null || num === undefined || isNaN(num)) return '0';
  return new Intl.NumberFormat('es-MX').format(num);
};

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
