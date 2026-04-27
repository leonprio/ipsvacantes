const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, limit, query } = require('firebase/firestore');

const firebaseConfig = {
    apiKey: 'AIzaSyCChhyWoODY73zTuOJhfX5vMbxyN-HwmV0',
    authDomain: 'prior-01.firebaseapp.com',
    projectId: 'prior-01'
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function runAudit() {
    console.log('--- INICIANDO AUDITORÍA DE DATOS ACTIVADOR ---');

    // 1. Muestra de weekly_data
    const weeklySnap = await getDocs(query(collection(db, 'weekly_data'), limit(10)));
    console.log('\n📍 Muestra de weekly_data (Información de semanas):');
    weeklySnap.docs.forEach(d => {
        const data = d.data();
        console.log(`Documento: ${d.id} | dashboardId: ${data.dashboardId} | weekNum: ${data.weekNum} | clientId: ${data.clientId}`);
    });

    // 2. Muestra de dashboards
    const dashSnap = await getDocs(query(collection(db, 'dashboards'), limit(5)));
    console.log('\n📊 Muestra de dashboards (Tableros/Direcciones):');
    dashSnap.docs.forEach(d => {
        const data = d.data();
        console.log(`ID: ${d.id} | Title: ${data.title} | Group: ${data.group} | clientId: ${data.clientId}`);
    });

    process.exit(0);
}

runAudit().catch(err => {
    console.error('Error en auditoría:', err);
    process.exit(1);
});
