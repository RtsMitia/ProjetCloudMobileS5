// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
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
const analytics = getAnalytics(app);