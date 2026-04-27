const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query } = require('firebase/firestore');

const firebaseConfig = {
    projectId: 'prior-01'
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function check() {
    const cols = ['vac_weekly_analysis', 'weekly_analysis', 'analyses', 'stx_weekly_analysis'];
    console.log('--- BUSCANDO ANALISIS ---');
    for (const col of cols) {
        try {
            const snap = await getDocs(collection(db, col));
            console.log(`Colección: ${col} | Documentos: ${snap.size}`);
        } catch (e) {
            console.log(`Colección: ${col} | Error: ${e.message}`);
        }
    }
}

check();
