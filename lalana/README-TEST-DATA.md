# 📊 Données de Test Firestore - Lalana

Ce dossier contient des données de test pour l'application Lalana.

## 🗂️ Fichiers

- **`firebase-test-data.json`** : 10 signalements de test avec différents statuts
- **`import-test-data.js`** : Script d'import automatique dans Firestore

## 🚀 Import Automatique (Recommandé)

### 1. Prérequis

```bash
# Installer Firebase Admin SDK (si pas déjà fait)
npm install firebase-admin
```

### 2. Configuration

1. Aller sur [Firebase Console](https://console.firebase.google.com)
2. Sélectionner votre projet
3. Aller dans **Paramètres du projet** > **Comptes de service**
4. Cliquer sur **Générer une nouvelle clé privée**
5. Télécharger le fichier JSON
6. Renommer le fichier en `firebase-key.json`
7. Placer le fichier à la racine du projet `lalana/`

### 3. Lancer l'import

```bash
# Depuis le dossier lalana/
node import-test-data.js
```

Vous devriez voir :
```
🚀 Début de l'import des données de test...

✓ Préparé: Nid-de-poule important sur la route principale...
✓ Préparé: Route complètement dégradée après les pluies...
...

✅ 10 signalements importés avec succès dans Firestore !
```

## 📝 Import Manuel

Si vous préférez importer manuellement :

1. Ouvrir [Firebase Console](https://console.firebase.google.com)
2. Aller dans **Firestore Database**
3. Créer une collection `signalements` (si elle n'existe pas)
4. Pour chaque signalement dans `firebase-test-data.json` :
   - Cliquer sur **Ajouter un document**
   - Laisser Firebase générer l'ID automatiquement
   - Copier les champs suivants :

### Structure d'un document

```javascript
{
  userId: "string",
  description: "string",
  location: {
    x: number,        // Longitude
    y: number,        // Latitude
    localisation: "string"
  },
  status: {
    nom: "string",    // "En attente" | "En cours" | "Résolu"
    description: "string"
  },
  createdAt: timestamp  // Convertir la date ISO en timestamp
}
```

## 🗺️ Données de Test

Les 10 signalements couvrent la zone d'Antananarivo avec :

- **3 signalements "En attente"** ⏱ (Orange avec icône horloge)
- **4 signalements "En cours"** ⚙ (Bleu avec icône engrenage)
- **3 signalements "Résolu"** ✓ (Vert avec icône check)

### Localisation

Tous les signalements sont situés autour d'Antananarivo :
- Latitude : -18.87 à -18.89
- Longitude : 47.50 à 47.52

## 🎨 Nouvelles Icônes

Les marqueurs sur la carte utilisent maintenant des symboles graphiques :

| Statut | Symbole | Couleur | Description |
|--------|---------|---------|-------------|
| En attente | ⏱ | Orange (#f59e0b) | Horloge |
| En cours | ⚙ | Bleu (#3b82f6) | Engrenage |
| Résolu | ✓ | Vert (#10b981) | Check |
| Rejeté | ✕ | Rouge (#ef4444) | Croix |

## 🧹 Nettoyer les Données

Pour supprimer tous les signalements de test :

```bash
# Créer un script de nettoyage
node clean-test-data.js
```

Ou manuellement depuis Firebase Console :
1. Aller dans **Firestore Database**
2. Sélectionner la collection `signalements`
3. Supprimer les documents un par un ou utiliser l'API

## ⚠️ Important

- **Ne jamais committer `firebase-key.json`** dans Git (déjà dans `.gitignore`)
- Les données de test sont en lecture seule, vous pouvez les modifier selon vos besoins
- Assurez-vous d'avoir les permissions Firebase Admin pour l'import

## 📱 Vérification

Après l'import, ouvrez l'application mobile :

1. Les 10 signalements doivent apparaître sur la carte
2. Chaque marqueur a son symbole et sa couleur selon le statut
3. Cliquez sur un marqueur pour voir les détails dans le popup
4. Testez les filtres (En attente, En cours, Résolu)

## 🛠️ Troubleshooting

### Erreur "Cannot find module 'firebase-admin'"
```bash
npm install firebase-admin
```

### Erreur "serviceAccount is not valid"
- Vérifiez que `firebase-key.json` est bien dans le dossier `lalana/`
- Vérifiez que le fichier JSON est valide

### Les signalements n'apparaissent pas
- Vérifiez la connexion internet
- Vérifiez les règles de sécurité Firestore
- Regardez la console du navigateur pour les erreurs
