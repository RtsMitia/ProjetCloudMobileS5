# 🚀 Guide de Déploiement - Système de Notifications

## Vue d'ensemble

Ce guide décrit les étapes pour déployer le système de notifications transactionnel dans les environnements de développement, staging et production.

---

## 📋 Prérequis

### Outils requis
- [ ] Java 17+ (pour le backend)
- [ ] Node.js 18+ (pour les Cloud Functions)
- [ ] Firebase CLI (`npm install -g firebase-tools`)
- [ ] Ionic CLI (`npm install -g @ionic/cli`)
- [ ] Android Studio / Xcode (pour le build mobile)

### Comptes et accès
- [ ] Compte Firebase avec projet créé
- [ ] Accès Firebase Admin
- [ ] Clés API Firebase configurées
- [ ] Base de données PostgreSQL/MySQL accessible

---

## 1️⃣ Déploiement Backend Java

### 1.1 Configuration

Créer/Modifier `src/main/resources/application.properties`:

```properties
# Firebase
firebase.credentials.path=classpath:firebase-key.json
firebase.database.url=https://your-project.firebaseio.com

# Base de données
spring.datasource.url=jdbc:postgresql://localhost:5432/lalana
spring.datasource.username=postgres
spring.datasource.password=your-password

# Uploads
uploads.base-dir=uploads
```

### 1.2 Build

```bash
cd lalana
./gradlew clean build
```

### 1.3 Test local

```bash
./gradlew bootRun
```

**Vérifier:**
- API accessible sur `http://localhost:8080`
- Endpoint `/api/sync/full` répond
- Logs affichent `NotificationOutboxService` chargé

### 1.4 Déploiement production

#### Option A: JAR standalone

```bash
# Build
./gradlew bootJar

# Déployer
scp build/libs/lalana-*.jar user@server:/opt/lalana/
ssh user@server
cd /opt/lalana
java -jar lalana-*.jar
```

#### Option B: Docker

```bash
# Build image
docker build -t lalana-backend .

# Run
docker run -d \
  --name lalana-backend \
  -p 8080:8080 \
  -e SPRING_DATASOURCE_URL=jdbc:postgresql://db:5432/lalana \
  lalana-backend
```

#### Option C: Cloud Run / Heroku / etc.

Suivre la documentation spécifique de votre plateforme.

---

## 2️⃣ Déploiement Cloud Functions

### 2.1 Configuration Firebase

```bash
cd lalana-mobile/functions
firebase login
firebase use --add
# Sélectionner votre projet
```

### 2.2 Installation des dépendances

```bash
npm install
```

### 2.3 Configuration de la région

Modifier `firebase.json`:

```json
{
  "functions": {
    "source": "functions",
    "runtime": "nodejs18",
    "region": "europe-west1"
  }
}
```

### 2.4 Variables d'environnement

```bash
# Définir les variables
firebase functions:config:set \
  notification.max_retries=3 \
  notification.auto_dismiss_ms=5000

# Vérifier
firebase functions:config:get
```

### 2.5 Build TypeScript

```bash
npm run build
```

### 2.6 Déploiement

```bash
# Déployer toutes les functions
firebase deploy --only functions

# Ou spécifiquement la fonction de notifications
firebase deploy --only functions:processNotificationOutbox
```

**Vérifier:**

```bash
# Lister les functions déployées
firebase functions:list

# Voir les logs
firebase functions:log --limit 50
```

### 2.7 Test de la fonction

```bash
# Créer un document test dans notification_outbox
# via la console Firebase ou un script
```

---

## 3️⃣ Déploiement Frontend Mobile

### 3.1 Configuration Firebase

Créer `src/services/firebase/firebase.ts`:

```typescript
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
```

### 3.2 Configuration Capacitor

Modifier `capacitor.config.ts`:

```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.lalana.app',
  appName: 'Lalana',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
  },
};

export default config;
```

### 3.3 Build Web

```bash
cd lalana-mobile/lalana-app
npm install
npm run build
```

### 3.4 Build Android

```bash
# Synchroniser
ionic cap sync android

# Ouvrir Android Studio
ionic cap open android
```

**Dans Android Studio:**
1. Configurer les clés de signature
2. Build → Generate Signed Bundle / APK
3. Créer un APK/AAB de release

**Configuration google-services.json:**
- Télécharger depuis Firebase Console
- Placer dans `android/app/google-services.json`

### 3.5 Build iOS

```bash
# Synchroniser
ionic cap sync ios

# Ouvrir Xcode
ionic cap open ios
```

**Dans Xcode:**
1. Configurer les certificats
2. Activer Push Notifications capability
3. Archive → Distribute App

**Configuration GoogleService-Info.plist:**
- Télécharger depuis Firebase Console
- Placer dans `ios/App/GoogleService-Info.plist`

### 3.6 Test sur appareil

```bash
# Android
ionic cap run android --target=DEVICE_ID

# iOS
ionic cap run ios --target=DEVICE_ID
```

---

## 4️⃣ Configuration Firestore

### 4.1 Règles de sécurité

Modifier les règles Firestore:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // notification_outbox: Lecture seule pour le backend
    match /notification_outbox/{notificationId} {
      allow read: if false;  // Pas de lecture client
      allow write: if false; // Seulement via backend
    }
    
    // user_notifications: Lecture pour l'utilisateur propriétaire
    match /user_notifications/{userId}/notifications/{notificationId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if false; // Seulement via Cloud Function
    }
    
    // userTokens: Lecture/écriture pour l'utilisateur
    match /userTokens/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

Déployer:

```bash
firebase deploy --only firestore:rules
```

### 4.2 Index Firestore

Si nécessaire, créer des index:

```bash
# firestore.indexes.json
{
  "indexes": [
    {
      "collectionGroup": "notifications",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "read", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    }
  ]
}
```

Déployer:

```bash
firebase deploy --only firestore:indexes
```

---

## 5️⃣ Vérification Post-Déploiement

### Backend

```bash
# Health check
curl http://your-backend.com/actuator/health

# Test sync endpoint
curl -X POST http://your-backend.com/api/sync/full
```

### Cloud Functions

```bash
# Vérifier le déploiement
firebase functions:list

# Voir les logs récents
firebase functions:log --limit 20
```

### Mobile

1. Installer l'APK/IPA sur un appareil test
2. Se connecter
3. Vérifier que le token FCM est enregistré:
   - Console Firebase → Firestore → `userTokens/{userId}`
   - Doit contenir un champ `fcmToken`

4. Créer un signalement
5. Déclencher une synchronisation backend
6. Vérifier que le popup s'affiche

---

## 6️⃣ Monitoring et Logs

### Backend Java

```bash
# Logs applicatifs
tail -f /var/log/lalana/application.log

# Rechercher les logs de notification
grep "Notification intent" /var/log/lalana/application.log
```

### Cloud Functions

```bash
# Logs en temps réel
firebase functions:log --follow

# Filtrer par fonction
firebase functions:log --only processNotificationOutbox

# Exporter les logs vers BigQuery (optionnel)
# Console Firebase → Functions → Logs → Export to BigQuery
```

### Frontend Mobile

#### Android

```bash
# Logs Logcat
adb logcat | grep -i notification
```

#### iOS

```bash
# Logs console
xcrun simctl spawn booted log stream --predicate 'subsystem contains "com.lalana.app"'
```

---

## 7️⃣ Rollback

### Backend

```bash
# Redéployer la version précédente
git checkout previous-tag
./gradlew bootJar
# Redéployer
```

### Cloud Functions

```bash
# Voir les versions précédentes
firebase functions:config:get --instance previous-version

# Rollback vers une version
# (pas de commande directe, redéployer depuis le commit précédent)
git checkout previous-commit
cd lalana-mobile/functions
npm run build
firebase deploy --only functions
```

---

## 8️⃣ Checklist de Déploiement

### Pré-déploiement
- [ ] Tests unitaires passent
- [ ] Tests d'intégration passent
- [ ] Variables d'environnement configurées
- [ ] Clés Firebase à jour
- [ ] Base de données migrée

### Déploiement
- [ ] Backend déployé et accessible
- [ ] Cloud Functions déployées
- [ ] Règles Firestore déployées
- [ ] App mobile buildée
- [ ] Version tagguée dans Git

### Post-déploiement
- [ ] Health checks OK
- [ ] Logs sans erreur
- [ ] Test end-to-end passé
- [ ] Notifications reçues sur appareil test
- [ ] Documentation mise à jour

---

## 9️⃣ Contacts et Support

**Backend Java:**
- Responsable: [Nom]
- Email: [email]

**Cloud Functions:**
- Responsable: [Nom]
- Email: [email]

**Mobile:**
- Responsable: [Nom]
- Email: [email]

**Firebase:**
- Admin: [Nom]
- Email: [email]

---

## 🔗 Ressources

- [Firebase Console](https://console.firebase.google.com)
- [Google Cloud Console](https://console.cloud.google.com)
- [Documentation interne](./NOTIFICATION-SYSTEM.md)
- [Guide de test](./NOTIFICATION-TESTING-GUIDE.md)

---

**Bon déploiement ! 🚀**
