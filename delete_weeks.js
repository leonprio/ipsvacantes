
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, deleteDoc, getDoc } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: 'AIzaSyCChhyWoODY73zTuOJhfX5vMbxyN-HwmV0',
    authDomain: 'prior-01.firebaseapp.com',
    projectId: 'prior-01'
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const year = 2026;
const reportsToDelete = [9, 10];

async function deleteReports() {
    console.log(`--- [IPS-VACANTES] ELIMINANDO INFORMES SEMANAS 9 Y 10 ---`);

    for (const week of reportsToDelete) {
        const docId = `ANALYSIS_${year}_W${week}`;
        const docRef = doc(db, 'vac_weekly_analysis', docId);

        try {
            console.log(`🔍 Buscando ${docId} en vac_weekly_analysis...`);
            const snap = await getDoc(docRef);
            if (snap.exists()) {
                console.log(`✅ Documento encontrado. Eliminando...`);
                await deleteDoc(docRef);
                console.log(`⚠️ Documento ${docId} ELIMINADO CORRECTAMENTE.`);
            } else {
                console.log(`🔸 El documento ${docId} no existe. Nada que eliminar.`);
            }
        } catch (e) {
            console.error(`❌ Error en operación [${docId}]:`, e.message);
        }
    }
    console.log('🏁 Proceso finalizado.');
    process.exit(0);
}

deleteReports().catch(err => {
    console.error('CRITICAL ERROR:', err);
    process.exit(1);
});
