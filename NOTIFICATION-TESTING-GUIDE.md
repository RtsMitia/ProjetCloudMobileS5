# Guide de Test - Système de Notifications

## 🎯 Objectif

Tester le flux complet de notification depuis la création d'un signalement jusqu'à l'affichage dans l'app mobile.

---

## 📋 Prérequis

### Backend
- [ ] Backend Java démarré
- [ ] Firebase Admin SDK configuré
- [ ] Base de données accessible

### Cloud Functions
- [ ] Functions déployées (`firebase deploy --only functions`)
- [ ] Région: `europe-west1`

### Mobile
- [ ] App mobile installée sur un appareil physique (pas d'émulateur pour les notifications)
- [ ] Utilisateur enregistré et connecté
- [ ] Permissions de notification accordées

---

## 🧪 Scénario 1: Notification de création de signalement

### Étape 1: Créer un signalement via l'app mobile

1. Ouvrir l'app mobile
2. Se connecter avec un compte utilisateur
3. Cliquer sur le bouton **+**
4. Créer un nouveau signalement

**Résultat attendu:**
- Signalement créé dans la base de données
- Marqueur affiché sur la carte

### Étape 2: Lancer la synchronisation backend

```bash
# Via API REST
curl -X POST http://localhost:8080/api/sync/full

# Ou via l'interface admin
```

**Résultat attendu dans les logs backend:**
```
✅ Notification intent enregistrée: type=SIGNALEMENT, entityId=123, action=CREATED
```

### Étape 3: Vérifier Firestore

1. Ouvrir la console Firebase
2. Aller dans Firestore Database
3. Vérifier la collection `notification_outbox`

**Résultat attendu:**
```json
{
  "type": "SIGNALEMENT",
  "entityId": 123,
  "action": "CREATED",
  "status": "READY",
  "notificationSent": false,
  "userToken": "fcm-token-...",
  "userId": "user-id-...",
  "createdAt": "2026-02-09T..."
}
```

### Étape 4: Vérifier les logs Cloud Functions

```bash
firebase functions:log --only processNotificationOutbox
```

**Résultat attendu:**
```
📥 Nouvelle intention de notification détectée: type=SIGNALEMENT
✅ Notification envoyée avec succès: projects/.../messages/...
💾 Notification ajoutée à l'historique utilisateur
```

### Étape 5: Vérifier la mise à jour du statut

Retourner dans Firestore → `notification_outbox`

**Résultat attendu:**
```json
{
  "status": "SENT",
  "notificationSent": true,
  "sentAt": Timestamp
}
```

### Étape 6: Vérifier l'historique utilisateur

Firestore → `user_notifications/{userId}/notifications`

**Résultat attendu:**
- Nouveau document créé
- Champs: `type`, `title`, `message`, `read=false`, etc.

### Étape 7: Vérifier l'affichage mobile

**Sur l'appareil:**
1. Le popup de notification doit s'afficher automatiquement
2. Titre: "Nouveau signalement enregistré"
3. Message: "Votre signalement a été enregistré avec succès"
4. Icône bleue (add-circle)
5. Auto-dismiss après 5 secondes

**Si l'app est en arrière-plan:**
- Notification système Android/iOS reçue
- Cliquer dessus ouvre l'app

---

## 🧪 Scénario 2: Notification de résolution de problème

### Étape 1: Marquer un problème comme résolu (backend)

```bash
# Via API REST
curl -X PUT http://localhost:8080/api/problemes/456/resoudre
```

**Résultat attendu dans les logs:**
```
📧 Intention de notification enregistrée pour problème résolu id=456
```

### Étape 2: Vérifier Firestore

`notification_outbox`:
```json
{
  "type": "PROBLEME",
  "entityId": 456,
  "action": "RESOLVED",
  "status": "READY",
  "title": "Problème résolu",
  "message": "Le problème que vous avez signalé a été résolu"
}
```

### Étape 3: Vérifier l'envoi

Cloud Function → Logs:
```
✅ Notification envoyée avec succès
```

### Étape 4: Vérifier l'app mobile

**Popup affiché:**
- Titre: "Problème résolu"
- Message: "Le problème que vous avez signalé a été résolu"
- Icône verte (checkmark-circle)

---

## 🧪 Scénario 3: Gestion des erreurs

### Test token invalide

1. Modifier manuellement un token dans `notification_outbox`
2. Mettre un token invalide: `"invalid-token-123"`

**Résultat attendu:**
```
❌ Erreur envoi notification: invalid-registration-token
🗑️ Token invalide, suppression du token pour user-id
status=ERROR
errorMessage="Token FCM invalide ou expiré"
```

### Test retry

1. Couper temporairement la connexion Firebase
2. Créer une notification

**Résultat attendu:**
```
🔄 Tentative 1/3, retry possible
status=ERROR
retryCount=1
```

---

## 🧪 Scénario 4: Test du popup en temps réel

### Étape 1: Ouvrir l'app et rester sur la page carte

### Étape 2: Via un autre utilisateur ou backend, créer un signalement pour cet utilisateur

### Étape 3: Lancer la synchronisation

**Résultat attendu:**
- Le popup s'affiche en temps réel (sans rechargement)
- Animation slide-down élégante
- Barre de progression de 5 secondes

### Étape 4: Cliquer sur le popup

**Résultat attendu:**
- Popup se ferme
- Notification marquée comme lue
- Console affiche: `Navigation vers: { type: 'SIGNALEMENT', entityId: 123, action: 'CREATED' }`

---

## 📊 Checklist de validation complète

### Backend Java
- [ ] `NotificationOutboxDto` compilé sans erreur
- [ ] `NotificationOutboxService` enregistre correctement dans Firestore
- [ ] `SyncService.syncSignalements()` enregistre les notifications
- [ ] `ProblemeService.resoudre()` enregistre les notifications
- [ ] Logs affichent `📧 Intention de notification enregistrée`

### Cloud Functions
- [ ] Fonction `processNotificationOutbox` déployée
- [ ] Logs affichent `📥 Nouvelle intention détectée`
- [ ] Logs affichent `✅ Notification envoyée avec succès`
- [ ] Statut passe de `READY` à `SENT`
- [ ] Historique créé dans `user_notifications`

### Frontend Mobile
- [ ] `useUserNotifications` importé sans erreur
- [ ] `NotificationPopup` affiché correctement
- [ ] Abonnement aux notifications au montage
- [ ] Désabonnement au démontage
- [ ] Popup s'affiche pour les nouvelles notifications
- [ ] Clic sur le popup marque comme lu
- [ ] Animation slide-down/up fonctionne
- [ ] Auto-dismiss après 5 secondes
- [ ] Support dark mode

---

## 🐛 Debugging

### Notification non reçue

```javascript
// Console navigateur
const user = auth.currentUser;
console.log('User ID:', user?.uid);

const notifRef = collection(db, 'user_notifications', user.uid, 'notifications');
const q = query(notifRef, orderBy('createdAt', 'desc'), limit(10));
getDocs(q).then(snap => {
  console.log('Notifications:', snap.docs.map(d => d.data()));
});
```

### Token FCM non enregistré

```javascript
// Console navigateur
const tokenDoc = await getDoc(doc(db, 'userTokens', user.uid));
console.log('Token FCM:', tokenDoc.data()?.fcmToken);
```

### Cloud Function ne se déclenche pas

```bash
# Vérifier les logs
firebase functions:log --limit 50

# Vérifier le déploiement
firebase functions:list
```

---

## 📈 Métriques de succès

- ✅ Notification reçue en < 2 secondes après synchronisation
- ✅ 100% des notifications avec `status=SENT`
- ✅ 0% de tokens invalides après cleanup
- ✅ Popup s'affiche dans 100% des cas (utilisateur connecté)
- ✅ Animation fluide (60 FPS)

---

## 🔄 Workflow complet (résumé)

```
1. Backend: Transaction métier ✅
   ↓
2. Backend: Write notification_outbox (status=READY)
   ↓
3. Firestore: Trigger onCreate
   ↓
4. Cloud Function: Vérification + Envoi FCM
   ↓
5. Cloud Function: Update status=SENT
   ↓
6. Cloud Function: Write user_notifications
   ↓
7. Frontend: onSnapshot détecte nouveau doc
   ↓
8. Frontend: Affiche popup
   ↓
9. Utilisateur: Voit la notification 🎉
```

---

**Bon test ! 🚀**
