import { describe, it, expect } from 'vitest';
import { computeEntryData, formatNumber } from '../utils/calculations';
import { WeeklyData, NationalMetrics } from '../types';

describe('Vacantes Operativas Comparativo & Totales', () => {
    const mockMetrics: NationalMetrics = {
        metas: { altas: 10, bajas: 5, vacantes: 20, porcentaje: 5.0, edoFza: 100 },
        thresholds: { green: 90, yellow: 80 },
        globalPeriod: { week: 2, year: 2026, syncEnabled: false }
    };

    const mockPrevEntry: WeeklyData = {
        uneId: 'UNE_1',
        week: 1,
        year: 2026,
        edoFza: 100,
        altas: 5,
        bajas: 2,
        vacantesIniciales: 10,
        vacantesRealesFS: 12,
        comentarios: 'Semana 1'
    };

    const mockCurrEntry: WeeklyData = {
        uneId: 'UNE_1',
        week: 2,
        year: 2026,
        edoFza: 100,
        altas: 6,
        bajas: 3,
        vacantesIniciales: 9,
        vacantesRealesFS: 8,
        comentarios: 'Semana 2 con mejora en vacantes'
    };

    it('calcula correctamente el comparativo y diferencia de Vacantes Operativas cuando existe semana previa', () => {
        const prev = computeEntryData(mockPrevEntry, mockMetrics);
        const curr = computeEntryData(mockCurrEntry, mockMetrics);

        const diff = curr.vacantesRealesFS - prev.vacantesRealesFS;
        expect(prev.vacantesRealesFS).toBe(12);
        expect(curr.vacantesRealesFS).toBe(8);
        expect(diff).toBe(-4); // Reducción de 4 vacantes = comportamiento positivo/deseado
    });

    it('maneja correctamente cero real como un valor válido y no como ausencia de dato', () => {
        const zeroPrevEntry = { ...mockPrevEntry, vacantesRealesFS: 0 };
        const prev = computeEntryData(zeroPrevEntry, mockMetrics);
        const curr = computeEntryData(mockCurrEntry, mockMetrics);

        const diff = curr.vacantesRealesFS - prev.vacantesRealesFS;
        expect(prev.vacantesRealesFS).toBe(0);
        expect(diff).toBe(8); // Aumento de 0 a 8 vacantes
    });

    it('distingue ausencia histórica (sin registro previo) de valor cero', () => {
        const getRowData = (uneId: string, week: number, allData: WeeklyData[]) => {
            const raw = allData.find(d => d.uneId === uneId && d.week === week);
            if (!raw) return null;
            return computeEntryData(raw, mockMetrics);
        };

        const allData = [mockCurrEntry]; // Solo existe la semana actual
        const prev = getRowData('UNE_1', 1, allData);
        const curr = getRowData('UNE_1', 2, allData);

        expect(prev).toBeNull();
        expect(curr).not.toBeNull();
        const hasPrevData = prev !== null && prev.vacantesRealesFS !== undefined;
        expect(hasPrevData).toBe(false);
    });

    it('suma correctamente el TOTAL REGIONAL de vacantes operativas previas y actuales', () => {
        const uneList: WeeklyData[] = [
            { uneId: 'U1', week: 2, year: 2026, edoFza: 100, altas: 2, bajas: 1, vacantesIniciales: 5, vacantesRealesFS: 6 },
            { uneId: 'U2', week: 2, year: 2026, edoFza: 150, altas: 4, bajas: 2, vacantesIniciales: 8, vacantesRealesFS: 10 }
        ];

        const prevList: WeeklyData[] = [
            { uneId: 'U1', week: 1, year: 2026, edoFza: 100, altas: 1, bajas: 2, vacantesIniciales: 6, vacantesRealesFS: 8 },
            { uneId: 'U2', week: 1, year: 2026, edoFza: 150, altas: 3, bajas: 1, vacantesIniciales: 9, vacantesRealesFS: 11 }
        ];

        const totalCurrRealesFS = uneList.reduce((acc, u) => acc + u.vacantesRealesFS, 0);
        const totalPrevRealesFS = prevList.reduce((acc, u) => acc + u.vacantesRealesFS, 0);
        const totalDiff = totalCurrRealesFS - totalPrevRealesFS;

        expect(totalCurrRealesFS).toBe(16); // 6 + 10
        expect(totalPrevRealesFS).toBe(19); // 8 + 11
        expect(totalDiff).toBe(-3); // Disminución regional de 3 vacantes
    });
});
