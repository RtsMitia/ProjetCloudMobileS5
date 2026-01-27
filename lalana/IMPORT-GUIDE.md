# 📊 Import Données Test - Guide Rapide

## 🌟 Méthode Recommandée : Interface Web

### Étapes simples :

1. **Ouvrir** `import-data.html` dans votre navigateur (double-clic)
2. **Cliquer** sur "🚀 Importer les données"
3. **Attendre** quelques secondes
4. **Vérifier** dans votre application mobile !

✅ **C'est tout !** Aucune installation, aucune configuration nécessaire.

---

## 📋 Autres Méthodes

### Option 2 : Script Node.js

```bash
# Installer Firebase
npm install firebase

# Lancer l'import
node import-test-data-client.js
```

### Option 3 : Avec Firebase Admin (avancé)

Nécessite une clé de service Firebase (`firebase-key.json`)

```bash
npm install firebase-admin
node import-test-data.js
```

---

## 🗑️ Supprimer les données

- **Via l'interface web** : Utilisez le bouton "Supprimer" après l'import
- **Via script** : `node clean-test-data.js`
- **Manuellement** : Depuis Firebase Console > Firestore Database

---

## 📊 Données Importées

**10 signalements** autour d'Antananarivo :
- 4 × **En attente** ⏱ (Orange)
- 3 × **En cours** ⚙ (Bleu)
- 3 × **Résolu** ✓ (Vert)

---

## ⚠️ Problèmes Courants

### L'import ne fonctionne pas
- Vérifiez votre connexion Internet
- Vérifiez les règles Firestore (doivent autoriser l'écriture)
- Regardez la console du navigateur (F12)

### Les données n'apparaissent pas dans l'app
- Actualisez l'application
- Vérifiez que vous êtes sur la bonne région (Antananarivo)
- Zoom sur la carte pour voir les marqueurs

---

## 🎯 Next Steps

Après l'import :
1. Ouvrez votre application mobile
2. Les 10 marqueurs devraient apparaître sur la carte
3. Testez les filtres (En attente, En cours, Résolu)
4. Cliquez sur les marqueurs pour voir les popups avec symboles

Bon test ! 🚀
