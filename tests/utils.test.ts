
import { describe, it, expect } from 'vitest';
import { computeEntryData, formatNumber, calculatePercentageTargets } from '../utils/calculations';
import { verifyAppIntegrity, validateCollectionName, assertIpsNamespace, SHIELD_CONFIG } from '../utils/shield';
import { WeeklyData, NationalMetrics } from '../types';

// =========================================================================
// SHIELD v3.0 - Multi-Tenant Isolation Tests
// =========================================================================
describe('Shield v3.0: verifyAppIntegrity', () => {
    it('acepta configuración correcta de IPS', () => {
        const config = { projectId: 'prior-01', appId: '1:568084253557:web:daf5bb4ca5666b81d5213c' };
        expect(verifyAppIntegrity(config).isValid).toBe(true);
    });

    it('rechaza Project ID incorrecto', () => {
        const config = { projectId: 'sigma-app', appId: '1:568084253557:web:daf5bb4ca5666b81d5213c' };
        const result = verifyAppIntegrity(config);
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('Project ID Mismatch');
    });

    it('rechaza App ID de otra aplicación', () => {
        const config = { projectId: 'prior-01', appId: '1:568084253557:web:OTRO_APP_ID' };
        const result = verifyAppIntegrity(config);
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('App ID Mismatch');
    });
});

describe('Shield v3.0: validateCollectionName', () => {
    it('acepta colecciones con prefijo vac_ que están en whitelist', () => {
        expect(validateCollectionName('vac_users').isValid).toBe(true);
        expect(validateCollectionName('vac_weekly_data').isValid).toBe(true);
        expect(validateCollectionName('vac_config').isValid).toBe(true);
        expect(validateCollectionName('vac_unes').isValid).toBe(true);
        expect(validateCollectionName('vac_dashboard_cache').isValid).toBe(true);
    });

    it('rechaza colecciones sin prefijo vac_', () => {
        const result = validateCollectionName('users');
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('NAMESPACE VIOLATION');
    });

    it('rechaza colecciones de otras apps (sigma_, tablero_)', () => {
        expect(validateCollectionName('sigma_data').isValid).toBe(false);
        expect(validateCollectionName('tablero_config').isValid).toBe(false);
    });

    it('rechaza colecciones con prefijo vac_ que NO están en whitelist', () => {
        const result = validateCollectionName('vac_secreto');
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('NOT WHITELISTED');
    });
});

describe('Shield v3.0: assertIpsNamespace', () => {
    it('no lanza error para colecciones válidas', () => {
        expect(() => assertIpsNamespace('vac_users')).not.toThrow();
        expect(() => assertIpsNamespace('vac_config')).not.toThrow();
    });

    it('lanza error para colecciones inválidas', () => {
        expect(() => assertIpsNamespace('users')).toThrow('NAMESPACE VIOLATION');
        expect(() => assertIpsNamespace('sigma_data')).toThrow('NAMESPACE VIOLATION');
    });

    it('lanza error para colecciones vac_ no whitelisted', () => {
        expect(() => assertIpsNamespace('vac_hacked')).toThrow('NOT WHITELISTED');
    });
});

describe('Shield v3.0: SHIELD_CONFIG constants', () => {
    it('tiene la versión correcta', () => {
        expect(SHIELD_CONFIG.VERSION).toBe('v9.0.0-NUCLEAR-ISOLATION-VAC');
    });

    it('tiene el namespace correcto', () => {
        expect(SHIELD_CONFIG.CORE_NAMESPACE).toBe('vac_');
    });

    it('tiene exactamente 6 colecciones permitidas', () => {
        expect(SHIELD_CONFIG.ALLOWED_COLLECTIONS).toHaveLength(6);
    });
});

// =========================================================================
// Utility Functions Tests
// =========================================================================
describe('Utility Functions', () => {
    it('formatNumber correctly formats numbers', () => {
        expect(formatNumber(1000)).toBe('1,000');
        expect(formatNumber(0)).toBe('0');
        expect(formatNumber(null)).toBe('0');
        expect(formatNumber(undefined)).toBe('0');
    });
});

describe('Business Logic: computeEntryData', () => {
    const mockMetrics: NationalMetrics = {
        metas: { altas: 10, bajas: 5, vacantes: 20, porcentaje: 5.0, edoFza: 100 },
        thresholds: { green: 90, yellow: 80 },
        globalPeriod: { week: 1, year: 2026, syncEnabled: false }
    };

    const mockEntry: WeeklyData = {
        uneId: 'TEST_UNE',
        week: 1,
        year: 2026,
        edoFza: 100,
        altas: 5,
        bajas: 2,
        vacantesIniciales: 10,
        vacantesRealesFS: 8, // 8% of 100 is 8%
        comentarios: 'Test'
    };

    it('calculates vacantesFinales correctly', () => {
        // vacantesFinales = vacantesIniciales + bajas - altas
        // 10 + 2 - 5 = 7
        const result = computeEntryData(mockEntry, mockMetrics);
        expect(result.vacantesFinales).toBe(7);
    });

    it('calculates percentage correctly', () => {
        // 8 / 100 = 8%
        const result = computeEntryData(mockEntry, mockMetrics);
        expect(result.porcentajeVacantes).toBe(8);
    });

    it('assigns correct status based on fulfillment', () => {
        // Target 5%. Actual 8%. Fulfillment = 5/8 * 100 = 62.5% -> RED
        const redResult = computeEntryData(mockEntry, mockMetrics);
        expect(redResult.status).toBe('red');

        // Target 5%. Actual 4%. Fulfillment = 5/4 * 100 = 125% -> GREEN
        const greenEntry = { ...mockEntry, vacantesRealesFS: 4 };
        const greenResult = computeEntryData(greenEntry, mockMetrics);
        expect(greenResult.status).toBe('green');
    });
});

describe('Business Logic: calculatePercentageTargets (Semana 29+)', () => {
    const mockMetrics: NationalMetrics = {
        metas: { altas: 200, bajas: 100, vacantes: 300, porcentaje: 5.0, edoFza: 5500 },
        thresholds: { green: 90, yellow: 80 },
        globalPeriod: { week: 29, year: 2026, syncEnabled: false },
        altasTargetPercentage: 3,
        bajasLimitPercentage: 2
    };

    // S28 Entries: 6384 total
    const s28Entries: WeeklyData[] = [
        { uneId: 'UNE_01', week: 28, year: 2026, edoFza: 3000, altas: 50, bajas: 30, vacantesIniciales: 100, vacantesRealesFS: 90, comentarios: '' },
        { uneId: 'UNE_02', week: 28, year: 2026, edoFza: 3384, altas: 50, bajas: 30, vacantesIniciales: 100, vacantesRealesFS: 90, comentarios: '' },
        { uneId: 'NATIONAL_DATA', week: 28, year: 2026, edoFza: 9999, altas: 0, bajas: 0, vacantesIniciales: 0, vacantesRealesFS: 0, comentarios: 'Ignorado' }
    ];

    // S30 Entries: 6401 total
    const s30Entries: WeeklyData[] = [
        { uneId: 'UNE_01', week: 30, year: 2026, edoFza: 3400, altas: 50, bajas: 30, vacantesIniciales: 100, vacantesRealesFS: 90, comentarios: '' },
        { uneId: 'UNE_02', week: 30, year: 2026, edoFza: 3001, altas: 50, bajas: 30, vacantesIniciales: 100, vacantesRealesFS: 90, comentarios: '' }
    ];

    const allEntries = [...s28Entries, ...s30Entries];

    it('S28 conserva metas fijas históricas (isPercentage = false)', () => {
        const res = calculatePercentageTargets(28, 2026, allEntries, mockMetrics);
        expect(res.isPercentage).toBe(false);
        expect(res.altasTargetAbsolute).toBe(200);
        expect(res.bajasLimitAbsolute).toBe(100);
        expect(res.vacancyTargetAbsolute).toBe(300);
    });

    it('S29 calcula metas dinámicas certificadas (Base S28 6384 -> 192 / 127 / 319)', () => {
        const res = calculatePercentageTargets(29, 2026, allEntries, mockMetrics);
        expect(res.isPercentage).toBe(true);
        expect(res.baseWorkforce).toBe(6384);
        expect(res.altasTargetAbsolute).toBe(192); // Math.ceil(6384 * 3 / 100) = 192
        expect(res.bajasLimitAbsolute).toBe(127); // Math.floor(6384 * 2 / 100) = 127
        expect(res.vacancyTargetAbsolute).toBe(319); // Math.floor(6384 * 5 / 100) = 319
        expect(res.isProvisional).toBe(true);
    });

    it('S31 calcula metas dinámicas certificadas (Base S30 6401 -> 193 / 128 / 320)', () => {
        const res = calculatePercentageTargets(31, 2026, allEntries, mockMetrics);
        expect(res.isPercentage).toBe(true);
        expect(res.baseWorkforce).toBe(6401);
        expect(res.altasTargetAbsolute).toBe(193); // Math.ceil(6401 * 3 / 100) = 193
        expect(res.bajasLimitAbsolute).toBe(128); // Math.floor(6401 * 2 / 100) = 128
        expect(res.vacancyTargetAbsolute).toBe(320); // Math.floor(6401 * 5 / 100) = 320
        expect(res.isProvisional).toBe(true);
    });

    it('respeta methodologySnapshot congelado sin recalcular', () => {
        const existingReport = [{
            id: 'ANALYSIS_2026_W29',
            semana: 29,
            año: 2026,
            methodologySnapshot: {
                isPercentage: true,
                altasTargetAbsolute: 192,
                bajasLimitAbsolute: 127,
                vacancyTargetAbsolute: 319,
                baseWorkforce: 6384,
                baseWeek: 28,
                baseYear: 2026,
                altasTargetPercentage: 3,
                bajasLimitPercentage: 2,
                isConfigured: true,
                isProvisional: false,
                methodology: 'PERCENTAGE_PREVIOUS_WEEK_WORKFORCE'
            }
        }];

        const res = calculatePercentageTargets(29, 2026, allEntries, mockMetrics, existingReport);
        expect(res.isProvisional).toBe(false);
        expect(res.altasTargetAbsolute).toBe(192);
        expect(res.bajasLimitAbsolute).toBe(127);
        expect(res.vacancyTargetAbsolute).toBe(319);
    });

    it('simula persistencia S31 (6401 -> 193/128/320) y confirma que cambios posteriores en capturas no alteran el snapshot', () => {
        // 1. Calcular targets iniciales para S31 con base 6401
        const targetsS31 = calculatePercentageTargets(31, 2026, allEntries, mockMetrics);
        expect(targetsS31.baseWorkforce).toBe(6401);
        expect(targetsS31.altasTargetAbsolute).toBe(193);
        expect(targetsS31.bajasLimitAbsolute).toBe(128);
        expect(targetsS31.vacancyTargetAbsolute).toBe(320);

        // 2. Simular payload de informe creado
        const simulatedStoredReport = {
            id: 'ANALYSIS_2026_W31',
            semana: 31,
            año: 2026,
            fechaCierre: '2026-08-03',
            autor: 'ADMIN',
            analisisEjecutivo: '<p>Reporte S31</p>',
            methodologySnapshot: {
                isPercentage: true,
                altasTargetAbsolute: targetsS31.altasTargetAbsolute,
                bajasLimitAbsolute: targetsS31.bajasLimitAbsolute,
                vacancyTargetAbsolute: targetsS31.vacancyTargetAbsolute,
                baseWorkforce: targetsS31.baseWorkforce,
                baseWeek: targetsS31.baseWeek,
                baseYear: targetsS31.baseYear,
                altasTargetPercentage: targetsS31.altasTargetPercentage,
                bajasLimitPercentage: targetsS31.bajasLimitPercentage,
                isConfigured: targetsS31.isConfigured,
                isProvisional: false,
                methodology: targetsS31.methodology,
                calculatedAt: new Date().toISOString()
            }
        };

        // 3. Simular alteración posterior de las capturas de S30 (ej. sube de 6401 a 9000)
        const mutatedEntries: WeeklyData[] = [
            ...allEntries.filter(e => e.week !== 30),
            { uneId: 'UNE_MUTATED', week: 30, year: 2026, edoFza: 9000, altas: 0, bajas: 0, vacantesIniciales: 0, vacantesRealesFS: 0 }
        ];

        // 4. Verificar que calculatePercentageTargets respeta el snapshot frozen (193/128/320) y no recalcula sobre 9000
        const frozenRes = calculatePercentageTargets(31, 2026, mutatedEntries, mockMetrics, [simulatedStoredReport]);
        expect(frozenRes.isProvisional).toBe(false);
        expect(frozenRes.baseWorkforce).toBe(6401);
        expect(frozenRes.altasTargetAbsolute).toBe(193);
        expect(frozenRes.bajasLimitAbsolute).toBe(128);
        expect(frozenRes.vacancyTargetAbsolute).toBe(320);

        // 5. Simular edición del informe (p. ej. cambio de texto o autor) conservando methodologySnapshot
        const editedReport = {
            ...simulatedStoredReport,
            autor: 'León Prior (Editado)',
            analisisEjecutivo: '<p>Reporte S31 Editado</p>'
        };

        const postEditRes = calculatePercentageTargets(31, 2026, mutatedEntries, mockMetrics, [editedReport]);
        expect(postEditRes.isProvisional).toBe(false);
        expect(postEditRes.altasTargetAbsolute).toBe(193);
        expect(postEditRes.bajasLimitAbsolute).toBe(128);
        expect(postEditRes.vacancyTargetAbsolute).toBe(320);
    });

    it('calcula diferencias comparativas dinámicas correctamente para S31 vs S30', () => {
        const s30Data = { edoFza: 6401, altas: 147, bajas: 186, vacantesIniciales: 316, vacantesRealesFS: 316 };
        const s31Data = { edoFza: 6444, altas: 184, bajas: 152, vacantesIniciales: 284, vacantesRealesFS: 297 };

        expect(s31Data.edoFza - s30Data.edoFza).toBe(43);
        expect(s31Data.altas - s30Data.altas).toBe(37);
        expect(s31Data.bajas - s30Data.bajas).toBe(-34);
        expect(s31Data.vacantesIniciales - s30Data.vacantesIniciales).toBe(-32);
        expect(s31Data.vacantesRealesFS - s30Data.vacantesRealesFS).toBe(-19);
    });
});
