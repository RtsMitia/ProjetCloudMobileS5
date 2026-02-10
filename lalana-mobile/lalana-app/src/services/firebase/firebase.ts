// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAl61XlAUcuspotTSFl35BLECsU959AEa8",
  authDomain: "cloud-lalana.firebaseapp.com",
  projectId: "cloud-lalana",
  storageBucket: "cloud-lalana.firebasestorage.app",
  messagingSenderId: "45207388578",
  appId: "1:45207388578:web:b7df253b27fd209ed232fb",
  measurementId: "G-0QQR8MX66D"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Analytics ne fonctionne pas sur mobile natif (Capacitor)
let analytics: any = null;
try {
  if (typeof window !== 'undefined' && !(window as any).Capacitor?.isNativePlatform?.()) {
    import('firebase/analytics').then(({ getAnalytics }) => {
      analytics = getAnalytics(app);
    }).catch(() => { });
  }
} catch (e) {
  // Silencieux - analytics optionnel
}

const auth = getAuth(app);
const db = getFirestore(app);

export { auth, app, db };