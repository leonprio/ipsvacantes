import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { verifyAppIntegrity } from "./utils/shield";

export const firebaseConfig = {
    apiKey: "AIzaSyCChhyWoODY73zTuOJhfX5vMbxyN-HwmV0",
    authDomain: "prior-01.firebaseapp.com",
    projectId: "prior-01",
    storageBucket: "prior-01.firebasestorage.app",
    messagingSenderId: "568084253557",
    appId: "1:568084253557:web:daf5bb4ca5666b81d5213c",
    measurementId: "G-DT84SH9W1Q"
};

// Hard Lock - Verificar integridad antes de proceder
export const shieldStatus = verifyAppIntegrity(firebaseConfig);

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
