/**
 * Script d'import des données de test dans Firestore
 * 
 * Prérequis:
 * 1. Installer Firebase Admin SDK: npm install firebase-admin
 * 2. Télécharger la clé de service depuis Firebase Console
 * 3. Placer firebase-key.json à la racine du projet
 * 
 * Utilisation:
 * node import-test-data.js
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialiser Firebase Admin
const serviceAccount = require('./firebase-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Charger les données de test
const testData = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'firebase-test-data.json'), 'utf8')
);

async function importSignalements() {
  console.log('🚀 Début de l\'import des données de test...\n');
  
  const batch = db.batch();
  let count = 0;

  for (const signalement of testData.signalementListe) {
    const docRef = db.collection('signalementListe').doc();
    
    // Convertir la date ISO en Timestamp Firestore
    const data = {
      ...signalement,
      createdAt: admin.firestore.Timestamp.fromDate(new Date(signalement.createdAt))
    };
    
    batch.set(docRef, data);
    count++;
    
    console.log(`✓ Préparé: ${signalement.description.substring(0, 50)}...`);
  }

  try {
    await batch.commit();
    console.log(`\n✅ ${count} signalements importés avec succès dans Firestore !`);
  } catch (error) {
    console.error('❌ Erreur lors de l\'import:', error);
  }

  process.exit(0);
}

// Exécuter l'import
importSignalements();
