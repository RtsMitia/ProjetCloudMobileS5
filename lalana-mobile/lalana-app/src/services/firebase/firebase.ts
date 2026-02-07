// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {

  apiKey: "AIzaSyAux1vRChlG_x_aOTY5sEvZ0zk4QXl7YYA",

  authDomain: "gestionroutiere-aaa53.firebaseapp.com",

  databaseURL: "https://gestionroutiere-aaa53-default-rtdb.firebaseio.com",

  projectId: "gestionroutiere-aaa53",

  storageBucket: "gestionroutiere-aaa53.firebasestorage.app",

  messagingSenderId: "997547144040",

  appId: "1:997547144040:web:3a8b8de80842c006435cdd",

  measurementId: "G-EHW0B3B9VF"

};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);    
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, app, db };