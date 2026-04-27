const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query } = require('firebase/firestore');

const firebaseConfig = {
    projectId: 'prior-01'
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function check() {
    try {
        console.log('--- AUDITORÍA VACANTES (Namespace: vac_) ---');
        const q = collection(db, 'vac_weekly_analysis');
        const snap = await getDocs(q);
        console.log(`Informes encontrados en vac_weekly_analysis: ${snap.size}`);
        snap.docs.forEach(d => console.log(`- ID: ${d.id}`));
    } catch (e) {
        console.error('Error:', e.message);
    }
}

check();
