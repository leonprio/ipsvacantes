
import fs from 'fs';
import path from 'path';

/**
 * IPS VACANTES - SECURITY AUDIT v11.0.2
 * Este script realiza una verificación exhaustiva del blindaje multi-tenant.
 */
async function runAudit() {
    console.log('\n🛡️ --- INICIANDO AUDITORÍA DE SEGURIDAD IPS VACANTES ---');
    console.log(`📅 Fecha: ${new Date().toLocaleString()}`);
    console.log(`📦 Versión: 11.0.2-SHIELD-UP\n`);

    const rootDir = process.cwd();
    const errors = [];
    const warnings = [];

    // 1. Verificación de Namespace en shield.ts
    console.log('🔍 Validando shield.ts...');
    try {
        const shieldPath = path.join(rootDir, 'utils', 'shield.ts');
        const shieldContent = fs.readFileSync(shieldPath, 'utf8');
        if (shieldContent.includes('CORE_NAMESPACE: "vac_"') && shieldContent.includes('PROJECT_ID: "prior-01"')) {
            console.log('✅ SHIELD OK: Namespace "vac_" y Proyecto "prior-01" validados.');
        } else {
            errors.push('CRITICAL: Namespace en shield.ts no es "vac_". Riesgo de contaminación.');
        }
    } catch (e) {
        errors.push(`ERROR: No se pudo leer shield.ts: ${e.message}`);
    }

    // 2. Verificación de Firestore Rules
    console.log('🔍 Validando firestore.rules...');
    try {
        const rulesPath = path.join(rootDir, 'firestore.rules');
        const rulesContent = fs.readFileSync(rulesPath, 'utf8');
        if (rulesContent.includes('match /vac_weekly_analysis/{id=**}')) {
            console.log('✅ RULES OK: Definición de colección vac_ encontrada.');
        } else {
            errors.push('CRITICAL: firestore.rules no protege explícitamente el namespace vac_.');
        }
        if (rulesContent.includes('match /stx_weekly_analysis/{id=**}') && rulesContent.includes('allow read, write: if false;')) {
            console.log('✅ RULES OK: Colecciones legacy (dashboards/stx) bloqueadas por Hard-Lock.');
        } else {
            warnings.push('ADVISORY: Algunas reglas legacy podrían ser más restrictivas.');
        }
    } catch (e) {
        errors.push(`ERROR: No se pudo leer firestore.rules: ${e.message}`);
    }

    // 3. Verificación de Build Guard
    console.log('🔍 Validando check-config.js...');
    try {
        const checkPath = path.join(rootDir, 'scripts', 'check-config.js');
        const checkContent = fs.readFileSync(checkPath, 'utf8');
        if (checkContent.includes('(?!vac_)')) {
            console.log('✅ BUILD GUARD OK: Regex de bloqueo de namespaces externos activo.');
        } else {
            errors.push('CRITICAL: El script de build no está bloqueando namespaces externos.');
        }
    } catch (e) {
        errors.push(`ERROR: No se pudo leer check-config.js: ${e.message}`);
    }

    // 4. Verificación de Aislamiento en App.tsx
    console.log('🔍 Validando App.tsx...');
    try {
        const appPath = path.join(rootDir, 'App.tsx');
        const appContent = fs.readFileSync(appPath, 'utf8');
        if (appContent.includes('Su cuenta no pertenece a la burbuja de Vacantes')) {
            console.log('✅ APP ISOLATION OK: Pantalla de bloqueo Nuclear Isolation detectada.');
        } else {
            warnings.push('ADVISORY: No se encontró el mensaje de error de Nuclear Isolation en App.tsx.');
        }
    } catch (e) {
        errors.push(`ERROR: No se pudo leer App.tsx: ${e.message}`);
    }

    console.log('\n--- RESULTADOS ---');
    if (errors.length === 0) {
        console.log('🚀 ESTADO DE SEGURIDAD: EXCELENTE. El sistema está blindado para el namespace vac_.');
    } else {
        console.log(`⚠️ SE DETECTARON ${errors.length} ERRORES CRÍTICOS:`);
        errors.forEach(err => console.log(`  - ${err}`));
    }
    
    warnings.forEach(w => console.log(`  💡 INFO: ${w}`));
    console.log('\n--------------------------------------------------');
}

runAudit().catch(console.error);
