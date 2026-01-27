/**
 * Script d'import des données de test dans Firestore
 * Version utilisant Firebase Client SDK (pas besoin de clé de service)
 * 
 * Prérequis:
 * 1. Installer Firebase: npm install firebase
 * 2. Être connecté à Firebase dans le navigateur
 * 
 * Utilisation:
 * npm run import-test-data
 * ou
 * node import-test-data-client.js
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, Timestamp } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration Firebase (même que dans l'app)
const firebaseConfig = {
    apiKey: "AIzaSyAl61XlAUcuspotTSFl35BLECsU959AEa8",
    authDomain: "cloud-lalana.firebaseapp.com",
    projectId: "cloud-lalana",
    storageBucket: "cloud-lalana.firebasestorage.app",
    messagingSenderId: "45207388578",
    appId: "1:45207388578:web:b7df253b27fd209ed232fb",
    measurementId: "G-0QQR8MX66D"
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Charger les données de test
const testData = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'firebase-test-data.json'), 'utf8')
);

async function importSignalements() {
    console.log('🚀 Début de l\'import des données de test...\n');

    let count = 0;
    let errors = 0;

    for (const signalement of testData.signalements) {
        try {
            // Convertir la date ISO en Timestamp Firestore
            const data = {
                userId: signalement.userId,
                description: signalement.description,
                location: signalement.location,
                status: signalement.status,
                createdAt: Timestamp.fromDate(new Date(signalement.createdAt))
            };

            const docRef = await addDoc(collection(db, 'signalements'), data);
            count++;

            console.log(`✓ Importé [${docRef.id}]: ${signalement.description.substring(0, 50)}...`);
        } catch (error) {
            errors++;
            console.error(`✗ Erreur: ${error.message}`);
        }
    }

    console.log(`\n📊 Résultat:`);
    console.log(`   ✅ Succès: ${count}`);
    console.log(`   ❌ Erreurs: ${errors}`);
    console.log(`\n${count > 0 ? '✅' : '❌'} Import terminé !`);

    process.exit(errors > 0 ? 1 : 0);
}

// Exécuter l'import
importSignalements().catch(error => {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
});
