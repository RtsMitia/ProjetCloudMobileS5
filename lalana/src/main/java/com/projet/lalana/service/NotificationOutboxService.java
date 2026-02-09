package com.projet.lalana.service;

import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.DocumentReference;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.WriteResult;
import com.google.firebase.cloud.FirestoreClient;
import com.projet.lalana.dto.NotificationOutboxDto;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.Map;

/**
 * Service responsable de la gestion du pattern Transactional Outbox pour les notifications.
 * 
 * Ce service garantit que chaque notification est une conséquence directe d'un commit métier réussi.
 * Il écrit les intentions de notification dans une collection Firestore dédiée (notification_outbox),
 * qui sera ensuite traitée par une Cloud Function pour l'envoi effectif via FCM.
 * 
 * Principe:
 * 1. Le backend écrit dans notification_outbox UNIQUEMENT après un commit DB réussi
 * 2. La Cloud Function écoute onCreate/onUpdate sur notification_outbox
 * 3. La Cloud Function envoie via FCM et marque le document comme SENT
 * 4. Le client mobile affiche la notification (pas de logique décisionnelle)
 */
@Service
@RequiredArgsConstructor
public class NotificationOutboxService {

    private static final Logger logger = LoggerFactory.getLogger(NotificationOutboxService.class);
    private static final String NOTIFICATION_OUTBOX_COLLECTION = "notification_outbox";

    /**
     * Enregistre une intention de notification dans Firestore.
     * Cette méthode doit être appelée UNIQUEMENT après qu'une opération métier ait réussi.
     * 
     * @param notification Le DTO contenant toutes les informations de la notification
     * @return true si l'enregistrement a réussi, false sinon
     */
    public boolean writeNotificationIntent(NotificationOutboxDto notification) {
        if (notification == null) {
            logger.warn("Tentative d'enregistrement d'une notification null");
            return false;
        }

        // Validation des champs obligatoires
        if (notification.getUserToken() == null || notification.getUserToken().isEmpty()) {
            logger.warn("Token utilisateur manquant pour la notification entityId={}", notification.getEntityId());
            return false;
        }

        if (notification.getUserId() == null || notification.getUserId().isEmpty()) {
            logger.warn("UserId manquant pour la notification entityId={}", notification.getEntityId());
            return false;
        }

        try {
            Firestore db = FirestoreClient.getFirestore();
            
            // Générer un ID unique pour la notification
            String notificationId = generateNotificationId(notification);
            DocumentReference docRef = db.collection(NOTIFICATION_OUTBOX_COLLECTION).document(notificationId);
            
            // Convertir le DTO en Map pour Firestore
            Map<String, Object> notificationData = notification.toFirestoreMap();
            
            // Écriture dans Firestore
            ApiFuture<WriteResult> future = docRef.set(notificationData);
            WriteResult result = future.get();
            
            logger.info("✅ Notification intent enregistrée: type={}, entityId={}, action={}, userId={}, timestamp={}",
                    notification.getType(),
                    notification.getEntityId(),
                    notification.getAction(),
                    notification.getUserId(),
                    result.getUpdateTime());
            
            return true;
            
        } catch (Exception e) {
            logger.error("❌ Erreur lors de l'enregistrement de l'intention de notification: type={}, entityId={}, action={}",
                    notification.getType(),
                    notification.getEntityId(),
                    notification.getAction(),
                    e);
            return false;
        }
    }

    /**
     * Génère un ID unique et déterministe pour la notification.
     * Format: {type}_{entityId}_{action}_{timestamp}
     * 
     * Cela évite les doublons et permet de retrouver facilement les notifications.
     */
    private String generateNotificationId(NotificationOutboxDto notification) {
        long timestamp = System.currentTimeMillis();
        return String.format("%s_%s_%s_%d",
                notification.getType(),
                notification.getEntityId(),
                notification.getAction(),
                timestamp);
    }

    /**
     * Enregistre une notification pour la création d'un signalement.
     * Cette méthode est un helper qui utilise le builder du DTO.
     * 
     * @param signalementId ID du signalement créé
     * @param userId ID de l'utilisateur
     * @param userToken Token FCM de l'utilisateur
     * @param description Description du signalement
     * @return true si l'enregistrement a réussi
     */
    public boolean notifySignalementCreated(
            Integer signalementId,
            String userId,
            String userToken,
            String description) {
        
        NotificationOutboxDto notification = NotificationOutboxDto.forSignalementCreated(
                signalementId,
                userId,
                userToken,
                description
        );
        
        return writeNotificationIntent(notification);
    }

    /**
     * Enregistre une notification pour la résolution d'un problème.
     * 
     * @param problemeId ID du problème résolu
     * @param userId ID de l'utilisateur qui a signalé
     * @param userToken Token FCM de l'utilisateur
     * @param description Description du problème
     * @return true si l'enregistrement a réussi
     */
    public boolean notifyProblemeResolved(
            Integer problemeId,
            String userId,
            String userToken,
            String description) {
        
        NotificationOutboxDto notification = NotificationOutboxDto.forProblemeResolved(
                problemeId,
                userId,
                userToken,
                description
        );
        
        return writeNotificationIntent(notification);
    }

    /**
     * Enregistre une notification pour un changement de statut.
     * 
     * @param type Type d'entité (SIGNALEMENT ou PROBLEME)
     * @param entityId ID de l'entité
     * @param userId ID de l'utilisateur
     * @param userToken Token FCM
     * @param oldStatus Ancien statut
     * @param newStatus Nouveau statut
     * @param description Description de l'entité
     * @return true si l'enregistrement a réussi
     */
    public boolean notifyStatusChanged(
            String type,
            Integer entityId,
            String userId,
            String userToken,
            String oldStatus,
            String newStatus,
            String description) {
        
        NotificationOutboxDto notification = NotificationOutboxDto.builder()
                .type(type)
                .entityId(entityId)
                .action(NotificationOutboxDto.NotificationAction.STATUS_CHANGED.name())
                .title("Mise à jour de statut")
                .message(String.format("Le statut est passé de '%s' à '%s'", oldStatus, newStatus))
                .userId(userId)
                .userToken(userToken)
                .signalementDescription(description)
                .oldStatus(oldStatus)
                .newStatus(newStatus)
                .status(NotificationOutboxDto.NotificationStatus.READY.name())
                .notificationSent(false)
                .retryCount(0)
                .createdAt(java.time.Instant.now().toString())
                .build();
        
        return writeNotificationIntent(notification);
    }
}
