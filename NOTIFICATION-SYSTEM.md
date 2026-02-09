# Système de Notifications Transactionnel

## Architecture

Ce projet implémente un système de notifications basé sur le **pattern Transactional Outbox** garantissant que toute notification est une conséquence directe d'un commit métier réussi.

### Principe

```
┌─────────────────┐      ┌──────────────────┐      ┌─────────────────┐
│  Backend Java   │      │    Firestore     │      │  Client Mobile  │
│                 │      │                  │      │     (Ionic)     │
├─────────────────┤      ├──────────────────┤      ├─────────────────┤
│ 1. Transaction  │──────>│ notification_    │      │                 │
│    métier       │      │    outbox        │      │                 │
│                 │      │                  │      │                 │
│ 2. Si success:  │      │ 3. Cloud Func    │──────>│ 4. Affichage   │
│    Write intent │      │    (onCreate)    │ FCM  │    Popup       │
│                 │      │                  │      │                 │
│                 │      │ 5. Update:       │      │                 │
│                 │      │    status=SENT   │      │                 │
└─────────────────┘      └──────────────────┘      └─────────────────┘
```

### Flux détaillé

1. **Backend Java** (Synchronisation métier)
   - Synchronise un signalement ou résout un problème
   - **APRÈS commit réussi uniquement** → Écrit dans `notification_outbox`
   - Évite les notifications fantômes (si transaction échoue, pas de notification)

2. **Firestore** (`notification_outbox`)
   - Collection servant de journal événementiel
   - Champs: `type`, `entityId`, `action`, `message`, `userToken`, `status`, `notificationSent`
   - Trigger automatique de la Cloud Function lors de `onCreate`

3. **Cloud Function** (`processNotificationOutbox`)
   - Vérifie: `status === 'READY'` et `notificationSent === false`
   - Envoie la notification via Firebase Cloud Messaging (FCM)
   - Marque le document: `status=SENT`, `notificationSent=true`
   - En cas d'erreur: `status=ERROR` (avec retry possible)

4. **Client Mobile** (Ionic/Vue)
   - Écoute `user_notifications/{userId}/notifications` en temps réel
   - Affiche un popup élégant avec les nouvelles notifications
   - **Aucune logique décisionnelle** → Juste affichage et interaction utilisateur

---

## 📦 Composants

### Backend Java

#### 1. `NotificationOutboxDto.java`
DTO représentant une intention de notification.

```java
NotificationOutboxDto notification = NotificationOutboxDto.forSignalementCreated(
    signalementId,
    userId,
    userToken,
    description
);
```

**Enums importants:**
- `EntityType`: SIGNALEMENT, PROBLEME
- `NotificationAction`: CREATED, RESOLVED, STATUS_CHANGED
- `NotificationStatus`: READY, SENT, ERROR

#### 2. `NotificationOutboxService.java`
Service responsable d'écrire les intentions dans Firestore.

**Méthodes principales:**
- `writeNotificationIntent(notification)` - Écriture générique
- `notifySignalementCreated(...)` - Helper pour création de signalement
- `notifyProblemeResolved(...)` - Helper pour résolution de problème
- `notifyStatusChanged(...)` - Helper pour changement de statut

#### 3. Modifications `SyncService.java`
Intégration dans `syncSignalements()`:

```java
// Après commit Firestore réussi
if (dto.getUserToken() != null && dto.getUserId() != null) {
    notificationOutboxService.notifySignalementCreated(
        dto.getId(),
        dto.getUserId(),
        dto.getUserToken(),
        dto.getDescription()
    );
}
```

#### 4. Modifications `ProblemeService.java`
Intégration dans `resoudre()`:

```java
// Après résolution du problème
notificationOutboxService.notifyProblemeResolved(
    saved.getId(),
    userId,
    userToken,
    description
);
```

---

### Cloud Functions (TypeScript)

#### `processNotificationOutbox`
Fonction déclenchée sur `onCreate` de `notification_outbox/{notificationId}`.

**Logique:**
1. Vérification du statut (`READY` et non envoyé)
2. Construction du message FCM
3. Envoi via `admin.messaging().send()`
4. Mise à jour du statut:
   - Succès → `status=SENT`, `notificationSent=true`
   - Erreur → `status=ERROR` + retry ou définitif selon le type d'erreur
5. Ajout dans `user_notifications/{userId}/notifications` pour l'historique

**Gestion des erreurs:**
- Token invalide → Suppression du token, `status=ERROR` définitif
- Erreur temporaire → `retryCount++`, max 3 tentatives

---

### Frontend Mobile (Ionic/Vue)

#### 1. `useUserNotifications.ts`
Composable pour gérer les notifications en temps réel.

**État:**
- `notifications` - Liste des notifications
- `unreadCount` - Nombre de notifications non lues
- `latestNotification` - Dernière notification reçue
- `showPopup` - État d'affichage du popup

**Actions:**
- `subscribeToNotifications()` - S'abonner aux notifications de l'utilisateur
- `unsubscribeFromNotifications()` - Se désabonner
- `markAsRead(id)` - Marquer une notification comme lue
- `markAllAsRead()` - Marquer toutes comme lues
- `handleNotificationClick(notification)` - Gérer le clic

#### 2. `NotificationPopup.vue`
Composant d'affichage du popup de notification.

**Props:**
- `show` - Affichage du popup
- `notification` - Notification à afficher

**Features:**
- Animation slide-down élégante
- Auto-dismiss après 5 secondes
- Barre de progression visuelle
- Icône et couleur dynamiques selon le type
- Support dark mode
- Responsive

#### 3. Intégration dans `MapPageRefactored.vue`

```vue
<template>
  <NotificationPopup
    :show="showPopup && isAuthenticated"
    :notification="latestNotification"
    @close="closePopup"
    @click="handleNotificationClick"
  />
</template>

<script setup>
const {
  latestNotification,
  showPopup,
  subscribeToNotifications,
  closePopup,
  handleNotificationClick
} = useUserNotifications();

// S'abonner au montage si connecté
onMounted(() => {
  if (isAuthenticated.value) {
    subscribeToNotifications();
  }
});

// Réagir aux changements d'authentification
watch(isAuthenticated, (authenticated) => {
  if (authenticated) {
    subscribeToNotifications();
  } else {
    unsubscribeFromNotifications();
  }
});
</script>
```

---

## 🔥 Collections Firestore

### 1. `notification_outbox` (Outbox Pattern)
Collection servant de journal événementiel.

**Structure:**
```json
{
  "type": "SIGNALEMENT",
  "entityId": 123,
  "action": "CREATED",
  "title": "Nouveau signalement enregistré",
  "message": "Votre signalement a été enregistré avec succès",
  "userToken": "fcm-token-xyz...",
  "userId": "firebase-uid-abc",
  "status": "READY",
  "notificationSent": false,
  "createdAt": "2026-02-09T10:30:00Z",
  "sentAt": null,
  "errorMessage": null,
  "retryCount": 0,
  "signalementDescription": "Route endommagée",
  "oldStatus": null,
  "newStatus": null
}
```

### 2. `user_notifications/{userId}/notifications`
Sous-collection pour l'historique utilisateur (créée par la Cloud Function).

**Structure:**
```json
{
  "type": "SIGNALEMENT",
  "entityId": 123,
  "action": "CREATED",
  "title": "Nouveau signalement enregistré",
  "message": "Votre signalement a été enregistré avec succès",
  "description": "Route endommagée",
  "read": false,
  "createdAt": Timestamp,
  "fcmMessageId": "fcm-response-id"
}
```

---

## 🚀 Déploiement

### Backend Java

1. Vérifier les dépendances dans `build.gradle` ou `pom.xml`
2. Construire le projet: `./gradlew build`
3. Déployer l'API

### Cloud Functions

```bash
cd lalana-mobile/functions
npm install
firebase deploy --only functions
```

**Functions déployées:**
- `processNotificationOutbox` - Traitement des notifications
- `onSignalementStatusChange` - Rétrocompatibilité (ancien système)

### Frontend Mobile

```bash
cd lalana-mobile/lalana-app
npm install
ionic build
# Pour Android
ionic cap sync android
# Pour iOS
ionic cap sync ios
```

---

## 🧪 Test du système

### 1. Créer un signalement via l'API backend

```bash
POST /api/signalements
{
  "x": -18.9087,
  "y": 47.5375,
  "localisation": "Analakely",
  "description": "Route endommagée"
}
```

### 2. Lancer la synchronisation

```bash
POST /api/sync/full
```

### 3. Vérifier dans Firestore

- Collection `notification_outbox` → Doit contenir un nouveau document avec `status=READY`
- Après quelques secondes → `status=SENT`, `notificationSent=true`
- Collection `user_notifications/{userId}/notifications` → Nouvelle notification

### 4. Vérifier dans l'app mobile

- Ouvrir l'app
- Se connecter avec l'utilisateur concerné
- Le popup de notification doit s'afficher automatiquement

---

## 📊 Monitoring

### Logs Backend Java

```bash
# Rechercher les logs de notification
grep "Intention de notification enregistrée" logs/app.log
grep "Notification intent enregistrée" logs/app.log
```

### Logs Cloud Functions

```bash
firebase functions:log
# Filtrer par fonction
firebase functions:log --only processNotificationOutbox
```

**Messages clés:**
- `📥 Nouvelle intention de notification détectée`
- `✅ Notification envoyée avec succès`
- `❌ Erreur envoi notification`
- `🗑️ Token invalide, suppression`
- `🔄 Tentative X/3, retry possible`

### Logs Frontend

Dans la console du navigateur/app:
- `📬 Notifications chargées: X total, Y non lues`
- `✅ Notification X marquée comme lue`
- `🔕 Désabonnement des notifications`

---

## ⚠️ Points d'attention

### Backend

1. **Toujours écrire APRÈS commit réussi**
   ```java
   // ✅ BON
   Signalement saved = repository.save(signalement);
   notificationOutboxService.notifySignalementCreated(...);
   
   // ❌ MAUVAIS
   notificationOutboxService.notifySignalementCreated(...);
   Signalement saved = repository.save(signalement); // Peut échouer
   ```

2. **Vérifier la présence du token**
   ```java
   if (dto.getUserToken() != null && !dto.getUserToken().isEmpty()) {
       // Enregistrer la notification
   }
   ```

### Cloud Function

1. **Gestion des tokens invalides** → Suppression automatique
2. **Retry limité à 3 tentatives** → Éviter les boucles infinies
3. **Logs détaillés** → Facilite le debugging

### Frontend

1. **S'abonner uniquement si connecté**
2. **Se désabonner lors du logout** → Éviter les fuites mémoire
3. **Pas de logique décisionnelle** → Juste affichage

---

## 📝 Évolutions possibles

1. **Priorité des notifications** → Ajouter un champ `priority` (HIGH, MEDIUM, LOW)
2. **Notifications groupées** → Grouper les notifications similaires
3. **Actions personnalisées** → Boutons d'action dans la notification
4. **Historique avec pagination** → Limiter le nombre de notifications chargées
5. **Filtres de notifications** → Par type, action, date
6. **Sons personnalisés** → Selon le type de notification
7. **Statistiques** → Taux d'ouverture, temps de lecture, etc.

---

## 🐛 Troubleshooting

### "Notification non reçue"

1. Vérifier le token FCM dans `userTokens`
2. Vérifier `notification_outbox` → `status` doit être `SENT`
3. Vérifier les logs Cloud Functions
4. Vérifier les permissions de l'app mobile

### "Popup ne s'affiche pas"

1. Vérifier que l'utilisateur est connecté
2. Vérifier `user_notifications/{userId}/notifications`
3. Vérifier la console du navigateur pour les erreurs
4. Vérifier que `subscribeToNotifications()` est bien appelé

### "Token invalide"

1. Réinstaller l'app
2. Se déconnecter/reconnecter
3. Vérifier les permissions de notifications dans les paramètres du téléphone

---

## 📚 Ressources

- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)
- [Firestore Triggers](https://firebase.google.com/docs/functions/firestore-events)
- [Transactional Outbox Pattern](https://microservices.io/patterns/data/transactional-outbox.html)
- [Capacitor Push Notifications](https://capacitorjs.com/docs/apis/push-notifications)

---

**Date de création:** 9 février 2026  
**Version:** 1.0.0  
**Auteur:** Équipe ProjetCloudMobileS5
