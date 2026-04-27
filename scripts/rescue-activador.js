const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, setDoc, query, where } = require('firebase/firestore');

const firebaseConfig = {
    apiKey: 'AIzaSyCChhyWoODY73zTuOJhfX5vMbxyN-HwmV0',
    authDomain: 'prior-01.firebaseapp.com',
    projectId: 'prior-01'
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function rescue() {
    console.log('--- BUSCANDO USUARIO ADMIN ---');
    const q = query(collection(db, 'users'), where('email', '==', 'admin@iapriori.com'));
    const snap = await getDocs(q);

    if (snap.empty) {
        console.log('❌ No se encontró el usuario admin@iapriori.com en la colección "users"');
        process.exit(1);
    }

    const adminDoc = snap.docs[0];
    const adminId = adminDoc.id;
    console.log(`✅ Usuario encontrado con ID: ${adminId}`);

    const directions = [
        'Dirección Centro',
        'Dirección Centro Norte',
        'Dirección Sur',
        'Dirección Frontera Norte'
    ];

    const upgradeData = {
        role: 'admin',
        globalRole: 'Admin',
        clientId: 'IPS',
        directorTitle: 'DIRECCIÓN GENERAL',
        subGroups: directions,
        dashboardAccess: {}
    };

    await setDoc(doc(db, 'users', adminId), upgradeData, { merge: true });
    console.log('🚀 Perfil Actualizado con Direcciones IPS');

    // También verificamos el cliente IPS
    await setDoc(doc(db, 'managedClients', 'IPS'), {
        id: 'IPS',
        name: 'GRUPO IPS',
        active: true
    }, { merge: true });

    process.exit(0);
}

rescue().catch(console.error);
