
import { describe, it, expect } from 'vitest';
import { computeEntryData, formatNumber } from '../utils/calculations';
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
        expect(SHIELD_CONFIG.VERSION).toBe('v7.8.0-PLATINUM-SHIELD-RECOVERED');
    });

    it('tiene el namespace correcto', () => {
        expect(SHIELD_CONFIG.CORE_NAMESPACE).toBe('vac_');
    });

    it('tiene exactamente 5 colecciones permitidas', () => {
        expect(SHIELD_CONFIG.ALLOWED_COLLECTIONS).toHaveLength(5);
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
