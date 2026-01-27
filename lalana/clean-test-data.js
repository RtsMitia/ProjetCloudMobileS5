/**
 * Script pour supprimer toutes les données de test de Firestore
 * 
 * ⚠️ ATTENTION: Ce script supprime TOUS les signalements !
 * 
 * Utilisation:
 * node clean-test-data.js
 */

const admin = require('firebase-admin');

// Initialiser Firebase Admin
const serviceAccount = require('./firebase-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function cleanSignalements() {
  console.log('⚠️  ATTENTION: Ce script va supprimer TOUS les signalements !');
  console.log('');
  
  // Attendre 3 secondes pour permettre l'annulation
  console.log('Annulation possible avec Ctrl+C dans 3 secondes...');
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  console.log('\n🗑️  Début de la suppression...\n');
  
  try {
    const snapshot = await db.collection('signalements').get();
    
    if (snapshot.empty) {
      console.log('ℹ️  Aucun signalement à supprimer.');
      process.exit(0);
    }
    
    const batch = db.batch();
    let count = 0;
    
    snapshot.forEach((doc) => {
      batch.delete(doc.ref);
      count++;
      console.log(`✓ Marqué pour suppression: ${doc.id}`);
    });
    
    await batch.commit();
    console.log(`\n✅ ${count} signalements supprimés avec succès !`);
    
  } catch (error) {
    console.error('❌ Erreur lors de la suppression:', error);
  }
  
  process.exit(0);
}

// Exécuter le nettoyage
cleanSignalements();
