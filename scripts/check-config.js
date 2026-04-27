import fs from 'fs';
import path from 'path';

const FIREBASE_CONFIG_PATH = path.resolve('firebase.ts');
const EXPECTED_APP_ID = '1:568084253557:web:daf5bb4ca5666b81d5213c';
const EXPECTED_PROJECT_ID = 'prior-01';
const FORBIDDEN_COLLECTIONS = ['sigma_', 'tablero_'];
const REQUIRED_NAMESPACE = 'stx_';

console.log('🛡️  IPS BUILD GUARD v3.2: Verificando integridad multi-tenant y Funcionalidad Nacional (NATIONAL_BRIDGE)...\n');

let hasErrors = false;

try {
    const content = fs.readFileSync(FIREBASE_CONFIG_PATH, 'utf8');

    // 1. Verificar App ID
    if (!content.includes(EXPECTED_APP_ID)) {
        console.error('❌ FALLO: Configuración de Firebase incorrecta o cruzada.');
        console.error(`   Se esperaba el App ID de IPS Vacantes en ${FIREBASE_CONFIG_PATH}.`);
        hasErrors = true;
    } else {
        console.log('✅ App ID correcto (IPS Vacantes)');
    }

    // 2. Verificar Project ID
    if (!content.includes(EXPECTED_PROJECT_ID)) {
        console.error('❌ FALLO: Project ID incorrecto.');
        hasErrors = true;
    } else {
        console.log('✅ Project ID correcto (prior-01)');
    }

    // 3. Verificar que no haya referencias a colecciones de otras apps
    for (const forbidden of FORBIDDEN_COLLECTIONS) {
        if (content.includes(`'${forbidden}`) || content.includes(`"${forbidden}`)) {
            console.error(`❌ FALLO: Se encontró referencia a colección prohibida: "${forbidden}"`);
            hasErrors = true;
        }
    }
    console.log('✅ Sin referencias a colecciones de otras apps');

    // 4. Verificar que no haya colecciones sin namespace (excepto imports/keywords)
    const appTsxPath = path.resolve('App.tsx');
    if (fs.existsSync(appTsxPath)) {
        const appContent = fs.readFileSync(appTsxPath, 'utf8');
        
        // --- BLINDAJE MULTI-TENANT ---
        const docPattern = /doc\(db,\s*['"](?!vac_)(\w+)['"]/g;
        let match;
        while ((match = docPattern.exec(appContent)) !== null) {
            console.error(`❌ FALLO (HARD LOCK): Colección sin namespace VAC detectada: "${match[1]}" en App.tsx. Uso de doc()`);
            hasErrors = true;
        }

        const collPattern = /collection\(db,\s*['"](?!vac_)(\w+)['"]/g;
        while ((match = collPattern.exec(appContent)) !== null) {
            console.error(`❌ FALLO (HARD LOCK): Colección sin namespace VAC detectada: "${match[1]}" en App.tsx. Uso de collection()`);
            hasErrors = true;
        }

        // --- BLINDAJE FUNCIONAL: NATIONAL DATA BRIDGE ---
        console.log('🔍 Verificando Blindaje Funcional: National Data Bridge...');
        
        if (!appContent.includes('userRole={userRole}') || !appContent.includes('<NationalSummary')) {
            console.error('❌ FALLO FUNCIONAL: NationalSummary no está recibiendo userRole. Edición de Total c/ Apoyos rota.');
            hasErrors = true;
        }
        
        if (!appContent.includes('userRole={userRole}') || !appContent.includes('<DataEntryModal')) {
            console.error('❌ FALLO FUNCIONAL: DataEntryModal no está recibiendo userRole. Captura Nacional rota.');
            hasErrors = true;
        }

        if (!hasErrors) {
            console.log('✅ Todas las colecciones y props críticos en App.tsx están íntegros');
        }
    }

    // 5. Verificar integridad en DataEntryModal
    const dataEntryPath = path.resolve('components/DataEntryModal.tsx');
    if (fs.existsSync(dataEntryPath)) {
        const dataContent = fs.readFileSync(dataEntryPath, 'utf8');
        if (!dataContent.includes('NATIONAL_DATA')) {
            console.error('❌ FALLO FUNCIONAL: NATIONAL_DATA ha sido removido de DataEntryModal.tsx. Restauración necesaria.');
            hasErrors = true;
        } else {
            console.log('✅ Lógica de NATIONAL_DATA presente en Modal de Captura');
        }
    }

    // 6. Verificar carpeta components (recursivo multi-tenant)
    const componentsDir = path.resolve('components');
    if (fs.existsSync(componentsDir)) {
        const files = fs.readdirSync(componentsDir).filter(f => f.endsWith('.tsx') || f.endsWith('.ts'));
        for (const file of files) {
            const filePath = path.join(componentsDir, file);
            const compContent = fs.readFileSync(filePath, 'utf8');

            const docPattern = /doc\(db,\s*['"](?!vac_)(\w+)['"]/g;
            let match;
            while ((match = docPattern.exec(compContent)) !== null) {
                console.error(`❌ FALLO (HARD LOCK): Colección sin namespace VAC detectada: "${match[1]}" en components/${file}. Uso de doc()`);
                hasErrors = true;
            }

            const collPattern = /collection\(db,\s*['"](?!vac_)(\w+)['"]/g;
            while ((match = collPattern.exec(compContent)) !== null) {
                console.error(`❌ FALLO (HARD LOCK): Colección sin namespace VAC detectada: "${match[1]}" en components/${file}. Uso de collection()`);
                hasErrors = true;
            }
        }
    }
} catch (err) {
    console.error('❌ Error al leer archivos:', err.message);
    process.exit(1);
}

// 7. Verificar Blindaje de Hosting (firebase.json)
try {
    const firebaseJson = JSON.parse(fs.readFileSync(path.resolve('firebase.json'), 'utf8'));
    if (firebaseJson.hosting?.target !== 'ipsvac') {
        console.error('❌ FALLO DE BLINDAJE: El target de hosting en firebase.json debe ser "ipsvac".');
        hasErrors = true;
    } else {
        console.log('✅ firebase.json: Target correcto (ipsvac)');
    }
} catch (err) {
    console.error('❌ Error al leer firebase.json:', err.message);
    hasErrors = true;
}

// 8. Verificar Blindaje de Alias (.firebaserc)
try {
    const firebaseRc = JSON.parse(fs.readFileSync(path.resolve('.firebaserc'), 'utf8'));
    const targetSite = firebaseRc.targets?.['prior-01']?.hosting?.ipsvac?.[0];
    if (targetSite !== 'vacips') {
        console.error('❌ FALLO DE BLINDAJE: El alias "ipsvac" en .firebaserc debe apuntar al sitio "vacips".');
        hasErrors = true;
    } else {
        console.log('✅ .firebaserc: Alias correcto (ipsvac -> vacips)');
    }
} catch (err) {
    console.error('❌ Error al leer .firebaserc:', err.message);
    hasErrors = true;
}

// 9. Verificar Ruta de Directorio (Protección contra confusión de carpetas)
const currentPath = process.cwd().toLowerCase();
if (currentPath.includes('activador') || currentPath.includes('gobernanza') || currentPath.includes('tablero')) {
    console.error('❌ ALERTA DE SEGURIDAD CRÍTICA: Se detectó que intentas hacer build desde una carpeta de otra aplicación.');
    console.error('   Ruta actual:', process.cwd());
    hasErrors = true;
}

if (hasErrors) {
    console.error('\n🚨 SECURITY & FUNCTIONAL ALERT: Se encontraron violaciones críticas de blindaje.');
    console.error('   Abortando construcción para proteger la integridad y funcionalidad del sistema.\n');
    process.exit(1);
} else {
    console.log('\n✅ Blindaje total confirmado. Procediendo con el build.\n');
}
