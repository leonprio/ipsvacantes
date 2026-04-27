import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, limit, query } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: 'AIzaSyCChhyWoODY73zTuOJhfX5vMbxyN-HwmV0',
    authDomain: 'prior-01.firebaseapp.com',
    projectId: 'prior-01'
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const collectionsToSearch = [
    'vac_weekly_analysis',
    'stx_weekly_analysis',
    'weekly_analysis',
    'analyses'
];

async function discover() {
    console.log('--- BUSCANDO ANÁLISIS EN DIFERENTES COLECCIONES ---');

    for (const colName of collectionsToSearch) {
        try {
            console.log(`\n🔍 Intentando leer colección: ${colName}...`);
            const snap = await getDocs(query(collection(db, colName), limit(50)));
            console.log(`✅ Colección: ${colName} | Documentos: ${snap.size}`);
            
            snap.docs.forEach(d => {
                const data = d.data();
                console.log(`   🔸 ID: ${d.id} | Semana: ${data.semana || data.week} | Año: ${data.año || data.year} | Autor: ${data.autor || data.author || '?'}`);
            });
        } catch (e) {
            console.log(`❌ Error leyendo ${colName}: ${e.message}`);
        }
    }

    process.exit(0);
}

discover().catch(console.error);
