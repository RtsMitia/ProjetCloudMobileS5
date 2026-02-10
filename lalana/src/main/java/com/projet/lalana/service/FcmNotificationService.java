package com.projet.lalana.service;

import com.google.cloud.firestore.DocumentSnapshot;
import com.google.cloud.firestore.Firestore;
import com.google.firebase.cloud.FirestoreClient;
import com.google.firebase.messaging.*;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ExecutionException;

/**
 * Service d'envoi direct de notifications FCM
 * 
 * Envoie les notifications push directement via Firebase Cloud Messaging
 * au moment de la synchronisation, sans passer par Cloud Functions.
 */
@Service
@RequiredArgsConstructor
public class FcmNotificationService {

        private static final Logger logger = LoggerFactory.getLogger(FcmNotificationService.class);

        /**
         * Vérifie si le document userTokens/{firebaseUid} existe dans Firestore.
         * Si non, le crée avec les infos de base (sans fcmToken car il sera rempli par
         * le mobile au login).
         * Cela prépare le document pour que le mobile puisse y écrire le token FCM.
         * 
         * @param firebaseUid Firebase UID de l'utilisateur
         * @param email       Email de l'utilisateur (optionnel)
         * @param localUserId ID local (PostgreSQL) de l'utilisateur
         */
        public void ensureUserTokenDocExists(String firebaseUid, String email, Integer localUserId) {
                if (firebaseUid == null || firebaseUid.isEmpty()) {
                        System.out.println("⚠️ [FCM] ensureUserTokenDocExists: firebaseUid est null/vide, skip");
                        return;
                }

                try {
                        Firestore db = FirestoreClient.getFirestore();

                        // D'abord chercher un fcmToken existant dans la collection users/{uid}
                        String existingFcmToken = null;
                        DocumentSnapshot userDoc = db.collection("users")
                                        .document(firebaseUid)
                                        .get()
                                        .get();
                        if (userDoc.exists() && userDoc.contains("fcmToken")) {
                                String token = userDoc.getString("fcmToken");
                                if (token != null && !token.isEmpty()) {
                                        existingFcmToken = token;
                                        System.out.println("🔍 [FCM] Token FCM trouvé dans users/" + firebaseUid + ": "
                                                        + token.substring(0, Math.min(20, token.length())) + "...");
                                }
                        }

                        DocumentSnapshot tokenDoc = db.collection("userTokens")
                                        .document(firebaseUid)
                                        .get()
                                        .get();

                        if (!tokenDoc.exists()) {
                                // Créer le document avec le fcmToken s'il existe déjà dans users/
                                System.out.println("📝 [FCM] Document userTokens/" + firebaseUid
                                                + " inexistant, création...");
                                Map<String, Object> data = new HashMap<>();
                                data.put("userId", firebaseUid);
                                data.put("localUserId", localUserId);
                                if (email != null)
                                        data.put("email", email);
                                data.put("fcmToken", existingFcmToken != null ? existingFcmToken : "");
                                data.put("platform", existingFcmToken != null ? "filled_from_users" : "unknown");
                                data.put("createdAt", com.google.cloud.firestore.FieldValue.serverTimestamp());
                                data.put("updatedAt", com.google.cloud.firestore.FieldValue.serverTimestamp());

                                db.collection("userTokens")
                                                .document(firebaseUid)
                                                .set(data)
                                                .get();

                                if (existingFcmToken != null) {
                                        System.out.println("✅ [FCM] Document userTokens/" + firebaseUid
                                                        + " créé avec token FCM copié depuis users/");
                                } else {
                                        System.out.println("✅ [FCM] Document userTokens/" + firebaseUid
                                                        + " créé (en attente du token FCM du mobile)");
                                }
                        } else {
                                // Le document existe déjà - vérifier si le fcmToken est vide et le remplir
                                String currentToken = tokenDoc.getString("fcmToken");
                                if (currentToken == null || currentToken.isEmpty()) {
                                        if (existingFcmToken != null) {
                                                // Remplir le fcmToken depuis users/
                                                System.out.println("🔄 [FCM] fcmToken vide dans userTokens/"
                                                                + firebaseUid + ", remplissage depuis users/...");
                                                Map<String, Object> update = new HashMap<>();
                                                update.put("fcmToken", existingFcmToken);
                                                update.put("updatedAt", com.google.cloud.firestore.FieldValue
                                                                .serverTimestamp());
                                                if (email != null)
                                                        update.put("email", email);
                                                if (localUserId != null)
                                                        update.put("localUserId", localUserId);

                                                db.collection("userTokens")
                                                                .document(firebaseUid)
                                                                .update(update)
                                                                .get();

                                                System.out.println("✅ [FCM] fcmToken rempli dans userTokens/"
                                                                + firebaseUid);
                                        } else {
                                                System.out.println("⚠️ [FCM] userTokens/" + firebaseUid
                                                                + " existe mais fcmToken vide (aucun token trouvé dans users/ non plus)");
                                        }
                                } else {
                                        System.out.println("✅ [FCM] userTokens/" + firebaseUid
                                                        + " OK (token FCM présent: "
                                                        + currentToken.substring(0, Math.min(20, currentToken.length()))
                                                        + "...)");
                                }
                        }
                } catch (InterruptedException | ExecutionException e) {
                        System.out.println("❌ [FCM] Erreur ensureUserTokenDocExists: " + e.getMessage());
                        e.printStackTrace();
                }
        }

        /**
         * Récupère le vrai token FCM depuis Firestore
         * 
         * IMPORTANT: Le token FCM (pour notifications push) est différent de l'UID
         * Firebase (identifiant user)
         * Le token FCM est stocké dans Firestore: userTokens/{userId}/fcmToken
         * 
         * @param userId Firebase UID de l'utilisateur
         * @return Token FCM ou null si non trouvé
         */
        public String getFcmTokenFromFirestore(String userId) {
                System.out.println("🔍 [FCM] Récupération du token FCM depuis Firestore pour userId=" + userId);

                if (userId == null || userId.isEmpty()) {
                        System.out.println("❌ [FCM] userId est null ou vide");
                        return null;
                }

                try {
                        Firestore db = FirestoreClient.getFirestore();

                        // Essayer d'abord userTokens/{userId}
                        DocumentSnapshot tokenDoc = db.collection("userTokens")
                                        .document(userId)
                                        .get()
                                        .get();

                        if (tokenDoc.exists() && tokenDoc.contains("fcmToken")) {
                                String token = tokenDoc.getString("fcmToken");
                                System.out.println("✅ [FCM] Token FCM trouvé dans userTokens: " +
                                                (token != null ? token.substring(0, Math.min(20, token.length()))
                                                                + "..." : "null"));
                                return token;
                        }

                        // Sinon essayer users/{userId}
                        DocumentSnapshot userDoc = db.collection("users")
                                        .document(userId)
                                        .get()
                                        .get();

                        if (userDoc.exists() && userDoc.contains("fcmToken")) {
                                String token = userDoc.getString("fcmToken");
                                System.out.println("✅ [FCM] Token FCM trouvé dans users: " +
                                                (token != null ? token.substring(0, Math.min(20, token.length()))
                                                                + "..." : "null"));
                                return token;
                        }

                        System.out.println("⚠️ [FCM] Aucun token FCM trouvé dans Firestore pour userId=" + userId);
                        return null;

                } catch (InterruptedException | ExecutionException e) {
                        System.out.println("❌ [FCM] Erreur lors de la récupération du token FCM: " + e.getMessage());
                        e.printStackTrace();
                        return null;
                }
        }

        /**
         * Envoie une notification de création de signalement
         * 
         * @param signalementId ID du signalement créé
         * @param userId        ID de l'utilisateur
         * @param fcmToken      Token FCM de l'appareil
         * @param description   Description du signalement
         * @return true si envoyé avec succès, false sinon
         */
        public boolean sendSignalementCreatedNotification(
                        Integer signalementId,
                        String userId,
                        String fcmToken,
                        String description) {

                System.out.println("🚀 [FCM] Tentative d'envoi notification SIGNALEMENT_CREATED");
                System.out.println("   ├─ signalementId: " + signalementId);
                System.out.println("   ├─ userId (Firebase UID): " + userId);
                System.out.println("   └─ fcmToken fourni: "
                                + (fcmToken != null ? fcmToken.substring(0, Math.min(20, fcmToken.length())) + "..."
                                                : "NULL"));

                // Si le token n'est pas fourni ou semble être un UID Firebase (court),
                // récupérer depuis Firestore
                if (fcmToken == null || fcmToken.isEmpty() || fcmToken.length() < 50) {
                        System.out.println(
                                        "⚠️ [FCM] Token semble invalide (probablement un Firebase UID au lieu d'un token FCM)");
                        System.out.println("🔄 [FCM] Tentative de récupération du vrai token FCM depuis Firestore...");
                        fcmToken = getFcmTokenFromFirestore(userId);

                        if (fcmToken == null || fcmToken.isEmpty()) {
                                System.out.println(
                                                "⚠️ [FCM] Pas de token FCM disponible, sauvegarde directe dans Firestore (fallback)");
                                return saveNotificationToFirestore(userId,
                                                "Nouveau signalement enregistré",
                                                "Votre signalement a été enregistré avec succès",
                                                "SIGNALEMENT", String.valueOf(signalementId), "CREATED", description);
                        }
                }

                try {
                        System.out.println("📝 [FCM] Construction du message FCM pour signalementId=" + signalementId);
                        // Construction du message FCM
                        Map<String, String> data = new HashMap<>();
                        data.put("type", "SIGNALEMENT");
                        data.put("entityId", String.valueOf(signalementId));
                        data.put("action", "CREATED");
                        data.put("userId", userId);
                        if (description != null) {
                                data.put("description", description);
                        }

                        Message message = Message.builder()
                                        .setToken(fcmToken)
                                        .setNotification(Notification.builder()
                                                        .setTitle("Nouveau signalement enregistré")
                                                        .setBody("Votre signalement a été enregistré avec succès")
                                                        .build())
                                        .putAllData(data)
                                        .setAndroidConfig(AndroidConfig.builder()
                                                        .setPriority(AndroidConfig.Priority.HIGH)
                                                        .setNotification(AndroidNotification.builder()
                                                                        .setChannelId("signalement_updates")
                                                                        .setIcon("ic_notification")
                                                                        .setColor("#2196F3")
                                                                        .setSound("default")
                                                                        .build())
                                                        .build())
                                        .setApnsConfig(ApnsConfig.builder()
                                                        .setAps(Aps.builder()
                                                                        .setBadge(1)
                                                                        .setSound("default")
                                                                        .build())
                                                        .putHeader("apns-priority", "10")
                                                        .build())
                                        .build();

                        // Envoi via FCM
                        System.out.println("📤 [FCM] Envoi du message FCM vers Firebase...");
                        String response = FirebaseMessaging.getInstance().send(message);
                        System.out.println("✅ [FCM] Notification SIGNALEMENT_CREATED envoyée avec succès!");
                        System.out.println("   ├─ signalementId: " + signalementId);
                        System.out.println("   ├─ userId: " + userId);
                        System.out.println("   ├─ FCM MessageId: " + response);
                        System.out.println("   └─ Titre: 'Nouveau signalement enregistré'");

                        return true;

                } catch (FirebaseMessagingException e) {
                        System.out.println(
                                        "❌ [FCM] Erreur FirebaseMessagingException lors de SIGNALEMENT_CREATED: signalementId="
                                                        + signalementId);
                        handleFcmError(e, signalementId, userId, fcmToken);
                        return false;
                } catch (Exception e) {
                        System.out.println("❌ [FCM] Erreur inattendue lors de l'envoi de notification: signalementId="
                                        + signalementId + ", userId=" + userId);
                        e.printStackTrace();
                        return false;
                }
        }

        /**
         * Envoie une notification de changement de statut de signalement
         * 
         * @param signalementId ID du signalement
         * @param userId        ID de l'utilisateur
         * @param fcmToken      Token FCM
         * @param oldStatus     Ancien statut
         * @param newStatus     Nouveau statut
         * @return true si envoyé avec succès
         */
        public boolean sendSignalementStatusChangedNotification(
                        Integer signalementId,
                        String userId,
                        String fcmToken,
                        String oldStatus,
                        String newStatus) {

                System.out.println("🚀 [FCM] Tentative d'envoi notification STATUS_CHANGED");
                System.out.println("   ├─ signalementId: " + signalementId);
                System.out.println("   ├─ userId (Firebase UID): " + userId);
                System.out.println("   ├─ Changement: '" + oldStatus + "' -> '" + newStatus + "'");
                System.out.println("   └─ fcmToken fourni: "
                                + (fcmToken != null ? fcmToken.substring(0, Math.min(20, fcmToken.length())) + "..."
                                                : "NULL"));

                // Si le token n'est pas fourni ou semble être un UID Firebase (court),
                // récupérer depuis Firestore
                if (fcmToken == null || fcmToken.isEmpty() || fcmToken.length() < 50) {
                        System.out.println(
                                        "⚠️ [FCM] Token semble invalide (probablement un Firebase UID au lieu d'un token FCM)");
                        System.out.println("🔄 [FCM] Tentative de récupération du vrai token FCM depuis Firestore...");
                        fcmToken = getFcmTokenFromFirestore(userId);

                        if (fcmToken == null || fcmToken.isEmpty()) {
                                System.out.println(
                                                "⚠️ [FCM] Pas de token FCM disponible, sauvegarde directe dans Firestore (fallback)");
                                String body = String.format("Le statut est passé de \"%s\" à \"%s\"", oldStatus,
                                                newStatus);
                                return saveNotificationToFirestore(userId,
                                                "Mise à jour de votre signalement", body,
                                                "SIGNALEMENT", String.valueOf(signalementId), "STATUS_CHANGED", null);
                        }
                }

                try {
                        System.out.println("📝 [FCM] Construction du message FCM pour changement de statut");
                        Map<String, String> data = new HashMap<>();
                        data.put("type", "SIGNALEMENT");
                        data.put("entityId", String.valueOf(signalementId));
                        data.put("action", "STATUS_CHANGED");
                        data.put("userId", userId);
                        data.put("oldStatus", oldStatus);
                        data.put("newStatus", newStatus);

                        String notificationBody = String.format("Le statut est passé de \"%s\" à \"%s\"",
                                        oldStatus, newStatus);

                        Message message = Message.builder()
                                        .setToken(fcmToken)
                                        .setNotification(Notification.builder()
                                                        .setTitle("Mise à jour de votre signalement")
                                                        .setBody(notificationBody)
                                                        .build())
                                        .putAllData(data)
                                        .setAndroidConfig(AndroidConfig.builder()
                                                        .setPriority(AndroidConfig.Priority.HIGH)
                                                        .setNotification(AndroidNotification.builder()
                                                                        .setChannelId("signalement_status")
                                                                        .setIcon("ic_notification")
                                                                        .setColor("#FF9800")
                                                                        .setSound("default")
                                                                        .build())
                                                        .build())
                                        .setApnsConfig(ApnsConfig.builder()
                                                        .setAps(Aps.builder()
                                                                        .setBadge(1)
                                                                        .setSound("default")
                                                                        .build())
                                                        .putHeader("apns-priority", "10")
                                                        .build())
                                        .build();

                        System.out.println("📤 [FCM] Envoi du message FCM vers Firebase...");
                        String response = FirebaseMessaging.getInstance().send(message);
                        System.out.println("✅ [FCM] Notification STATUS_CHANGED envoyée avec succès!");
                        System.out.println("   ├─ signalementId: " + signalementId);
                        System.out.println("   ├─ userId: " + userId);
                        System.out.println("   ├─ FCM MessageId: " + response);
                        System.out.println("   └─ Changement: '" + oldStatus + "' -> '" + newStatus + "'");

                        return true;

                } catch (FirebaseMessagingException e) {
                        System.out.println(
                                        "❌ [FCM] Erreur FirebaseMessagingException lors du STATUS_CHANGED: signalementId="
                                                        + signalementId);
                        handleFcmError(e, signalementId, userId, fcmToken);
                        return false;
                } catch (Exception e) {
                        System.out.println("❌ [FCM] Erreur inattendue lors de l'envoi STATUS_CHANGED: signalementId="
                                        + signalementId + ", userId=" + userId);
                        e.printStackTrace();
                        return false;
                }
        }

        /**
         * Envoie une notification de résolution de signalement
         */
        public boolean sendSignalementResolvedNotification(
                        Integer signalementId,
                        String userId,
                        String fcmToken) {

                System.out.println("🚀 [FCM] Tentative d'envoi notification SIGNALEMENT_RESOLVED");
                System.out.println("   ├─ signalementId: " + signalementId);
                System.out.println("   ├─ userId (Firebase UID): " + userId);
                System.out.println("   └─ fcmToken fourni: "
                                + (fcmToken != null ? fcmToken.substring(0, Math.min(20, fcmToken.length())) + "..."
                                                : "NULL"));

                // Si le token n'est pas fourni ou semble être un UID Firebase (court),
                // récupérer depuis Firestore
                if (fcmToken == null || fcmToken.isEmpty() || fcmToken.length() < 50) {
                        System.out.println(
                                        "⚠️ [FCM] Token semble invalide (probablement un Firebase UID au lieu d'un token FCM)");
                        System.out.println("🔄 [FCM] Tentative de récupération du vrai token FCM depuis Firestore...");
                        fcmToken = getFcmTokenFromFirestore(userId);

                        if (fcmToken == null || fcmToken.isEmpty()) {
                                System.out.println(
                                                "⚠️ [FCM] Pas de token FCM disponible, sauvegarde directe dans Firestore (fallback)");
                                return saveNotificationToFirestore(userId,
                                                "Signalement traité",
                                                "Votre signalement a été traité",
                                                "SIGNALEMENT", String.valueOf(signalementId), "RESOLVED", null);
                        }
                }

                try {
                        System.out.println("📝 [FCM] Construction du message FCM pour signalement résolu");
                        Map<String, String> data = new HashMap<>();
                        data.put("type", "SIGNALEMENT");
                        data.put("entityId", String.valueOf(signalementId));
                        data.put("action", "RESOLVED");
                        data.put("userId", userId);

                        Message message = Message.builder()
                                        .setToken(fcmToken)
                                        .setNotification(Notification.builder()
                                                        .setTitle("Signalement traité")
                                                        .setBody("Votre signalement a été traité")
                                                        .build())
                                        .putAllData(data)
                                        .setAndroidConfig(AndroidConfig.builder()
                                                        .setPriority(AndroidConfig.Priority.HIGH)
                                                        .setNotification(AndroidNotification.builder()
                                                                        .setChannelId("signalement_updates")
                                                                        .setIcon("ic_notification")
                                                                        .setColor("#4CAF50")
                                                                        .setSound("default")
                                                                        .build())
                                                        .build())
                                        .setApnsConfig(ApnsConfig.builder()
                                                        .setAps(Aps.builder()
                                                                        .setBadge(1)
                                                                        .setSound("default")
                                                                        .build())
                                                        .putHeader("apns-priority", "10")
                                                        .build())
                                        .build();

                        System.out.println("📤 [FCM] Envoi du message FCM vers Firebase...");
                        String response = FirebaseMessaging.getInstance().send(message);
                        System.out.println("✅ [FCM] Notification SIGNALEMENT_RESOLVED envoyée avec succès!");
                        System.out.println("   ├─ signalementId: " + signalementId);
                        System.out.println("   ├─ userId: " + userId);
                        System.out.println("   └─ FCM MessageId: " + response);

                        return true;

                } catch (FirebaseMessagingException e) {
                        System.out.println(
                                        "❌ [FCM] Erreur FirebaseMessagingException lors de SIGNALEMENT_RESOLVED: signalementId="
                                                        + signalementId);
                        handleFcmError(e, signalementId, userId, fcmToken);
                        e.printStackTrace();
                        return false;
                } catch (Exception e) {
                        System.out.println(
                                        "❌ [FCM] Erreur inattendue lors de l'envoi SIGNALEMENT_RESOLVED: signalementId="
                                                        + signalementId + ", userId=" + userId);
                        e.printStackTrace();
                        return false;
                }
        }

        /**
         * Envoie une notification de résolution de problème
         * 
         * @param problemeId  ID du problème résolu
         * @param userId      ID de l'utilisateur
         * @param fcmToken    Token FCM
         * @param description Description du problème
         * @return true si envoyé avec succès
         */
        public boolean sendProblemeResolvedNotification(
                        Integer problemeId,
                        String userId,
                        String fcmToken,
                        String description) {

                System.out.println("🚀 [FCM] Tentative d'envoi notification PROBLEME_RESOLVED");
                System.out.println("   ├─ problemeId: " + problemeId);
                System.out.println("   ├─ userId (Firebase UID): " + userId);
                System.out.println("   └─ fcmToken fourni: "
                                + (fcmToken != null ? fcmToken.substring(0, Math.min(20, fcmToken.length())) + "..."
                                                : "NULL"));

                // Si le token n'est pas fourni ou semble être un UID Firebase (court),
                // récupérer depuis Firestore
                if (fcmToken == null || fcmToken.isEmpty() || fcmToken.length() < 50) {
                        System.out.println(
                                        "⚠️ [FCM] Token semble invalide (probablement un Firebase UID au lieu d'un token FCM)");
                        System.out.println("🔄 [FCM] Tentative de récupération du vrai token FCM depuis Firestore...");
                        fcmToken = getFcmTokenFromFirestore(userId);

                        if (fcmToken == null || fcmToken.isEmpty()) {
                                System.out.println(
                                                "⚠️ [FCM] Pas de token FCM disponible, sauvegarde directe dans Firestore (fallback)");
                                return saveNotificationToFirestore(userId,
                                                "Problème résolu",
                                                "Le problème que vous avez signalé a été résolu",
                                                "PROBLEME", String.valueOf(problemeId), "RESOLVED", description);
                        }
                }

                try {
                        System.out.println("📝 [FCM] Construction du message FCM pour problème résolu");
                        Map<String, String> data = new HashMap<>();
                        data.put("type", "PROBLEME");
                        data.put("entityId", String.valueOf(problemeId));
                        data.put("action", "RESOLVED");
                        data.put("userId", userId);
                        if (description != null) {
                                data.put("description", description);
                        }

                        Message message = Message.builder()
                                        .setToken(fcmToken)
                                        .setNotification(Notification.builder()
                                                        .setTitle("Problème résolu")
                                                        .setBody("Le problème que vous avez signalé a été résolu")
                                                        .build())
                                        .putAllData(data)
                                        .setAndroidConfig(AndroidConfig.builder()
                                                        .setPriority(AndroidConfig.Priority.HIGH)
                                                        .setNotification(AndroidNotification.builder()
                                                                        .setChannelId("probleme_updates")
                                                                        .setIcon("ic_notification")
                                                                        .setColor("#4CAF50")
                                                                        .setSound("default")
                                                                        .build())
                                                        .build())
                                        .setApnsConfig(ApnsConfig.builder()
                                                        .setAps(Aps.builder()
                                                                        .setBadge(1)
                                                                        .setSound("default")
                                                                        .build())
                                                        .putHeader("apns-priority", "10")
                                                        .build())
                                        .build();

                        System.out.println("📤 [FCM] Envoi du message FCM vers Firebase...");
                        String response = FirebaseMessaging.getInstance().send(message);
                        System.out.println("✅ [FCM] Notification PROBLEME_RESOLVED envoyée avec succès!");
                        System.out.println("   ├─ problemeId: " + problemeId);
                        System.out.println("   ├─ userId: " + userId);
                        System.out.println("   ├─ FCM MessageId: " + response);
                        System.out.println(
                                        "   └─ Description: "
                                                        + (description != null
                                                                        ? description.substring(0,
                                                                                        Math.min(50, description
                                                                                                        .length()))
                                                                        : "N/A"));

                        return true;

                } catch (FirebaseMessagingException e) {
                        System.out.println(
                                        "❌ [FCM] Erreur FirebaseMessagingException lors du PROBLEME_RESOLVED: problemeId="
                                                        + problemeId);
                        handleFcmError(e, problemeId, userId, fcmToken);
                        return false;
                } catch (Exception e) {
                        System.out.println("❌ [FCM] Erreur inattendue lors de l'envoi PROBLEME_RESOLVED: problemeId="
                                        + problemeId + ", userId=" + userId);
                        e.printStackTrace();
                        return false;
                }
        }

        /**
         * Gestion des erreurs FCM spécifiques
         */
        private void handleFcmError(FirebaseMessagingException e, Integer signalementId, String userId,
                        String fcmToken) {
                MessagingErrorCode errorCode = e.getMessagingErrorCode();

                if (errorCode == null) {
                        System.out.println("❌ Erreur FCM sans code: signalementId=" + signalementId + ", userId="
                                        + userId + ", message=" + e.getMessage());
                        return;
                }

                switch (errorCode) {
                        case UNREGISTERED:
                        case INVALID_ARGUMENT:
                                System.out.println("⚠️ Token FCM invalide ou expiré pour userId=" + userId + ", token="
                                                + fcmToken);
                                break;

                        case QUOTA_EXCEEDED:
                                System.out.println("❌ Quota FCM dépassé pour signalementId=" + signalementId);
                                break;

                        case UNAVAILABLE:
                        case INTERNAL:
                                System.out.println("❌ Service FCM temporairement indisponible pour signalementId="
                                                + signalementId);
                                break;

                        default:
                                System.out.println("❌ Erreur FCM: code=" + errorCode + ", signalementId="
                                                + signalementId + ", userId=" + userId + ", message=" + e.getMessage());
                }
        }

        /**
         * Sauvegarde une notification directement dans Firestore
         * (user_notifications/{userId}/notifications)
         * pour que le frontend la récupère via le listener onSnapshot.
         * 
         * Utilisé comme FALLBACK quand le token FCM n'est pas disponible
         * (l'utilisateur ne s'est pas encore connecté sur mobile).
         */
        public boolean saveNotificationToFirestore(String firebaseUid, String title, String body,
                        String type, String entityId, String action, String description) {
                System.out.println(
                                "💾 [FCM-FALLBACK] Sauvegarde notification dans Firestore pour userId=" + firebaseUid);

                if (firebaseUid == null || firebaseUid.isEmpty()) {
                        System.out.println("❌ [FCM-FALLBACK] firebaseUid est null/vide");
                        return false;
                }

                try {
                        Firestore db = FirestoreClient.getFirestore();

                        Map<String, Object> notif = new HashMap<>();
                        notif.put("title", title);
                        notif.put("body", body);
                        notif.put("type", type);
                        notif.put("entityId", entityId);
                        notif.put("action", action);
                        notif.put("userId", firebaseUid);
                        notif.put("read", false);
                        notif.put("status", "sent");
                        notif.put("createdAt", com.google.cloud.firestore.FieldValue.serverTimestamp());
                        if (description != null) {
                                notif.put("description", description);
                        }

                        db.collection("user_notifications")
                                        .document(firebaseUid)
                                        .collection("notifications")
                                        .add(notif)
                                        .get();

                        System.out.println(
                                        "✅ [FCM-FALLBACK] Notification sauvegardée dans Firestore: user_notifications/"
                                                        + firebaseUid + "/notifications");
                        System.out.println("   ├─ Titre: " + title);
                        System.out.println("   ├─ Type: " + type + " / " + action);
                        System.out.println("   └─ Le frontend la récupérera via onSnapshot");
                        return true;

                } catch (InterruptedException | ExecutionException e) {
                        System.out.println("❌ [FCM-FALLBACK] Erreur sauvegarde Firestore: " + e.getMessage());
                        e.printStackTrace();
                        return false;
                }
        }
}
