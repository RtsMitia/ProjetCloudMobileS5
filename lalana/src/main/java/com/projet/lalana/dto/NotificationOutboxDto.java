package com.projet.lalana.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashMap;
import java.util.Map;

/**
 * DTO représentant une intention de notification à écrire dans Firestore.
 * Cette classe modélise le pattern Transactional Outbox pour garantir
 * que chaque notification est une conséquence d'un commit métier réussi.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationOutboxDto {
    
    /**
     * Type de l'entité concernée par la notification
     */
    public enum EntityType {
        SIGNALEMENT,
        PROBLEME
    }
    
    /**
     * Action ayant déclenché la notification
     */
    public enum NotificationAction {
        CREATED,
        RESOLVED,
        STATUS_CHANGED
    }
    
    /**
     * Statut de traitement de la notification
     */
    public enum NotificationStatus {
        READY,    // Prête à être envoyée
        SENT,     // Envoyée avec succès
        ERROR     // Erreur lors de l'envoi (pour retry)
    }
    
    private String type;              // SIGNALEMENT ou PROBLEME
    private Integer entityId;         // ID de l'entité (signalement ou problème)
    private String action;            // CREATED, RESOLVED, STATUS_CHANGED
    private String message;           // Message de la notification
    private String title;             // Titre de la notification
    private String userToken;         // Token FCM de l'utilisateur
    private String userId;            // ID de l'utilisateur destinataire
    private String status;            // READY, SENT, ERROR
    private Boolean notificationSent; // false par défaut, true après envoi
    private String createdAt;         // Timestamp de création
    private String sentAt;            // Timestamp d'envoi (null si pas encore envoyé)
    private String errorMessage;      // Message d'erreur si échec
    private Integer retryCount;       // Nombre de tentatives d'envoi
    
    // Données supplémentaires pour enrichir la notification
    private String signalementDescription;
    private String oldStatus;
    private String newStatus;
    
    /**
     * Convertit le DTO en Map pour l'envoi à Firestore
     */
    public Map<String, Object> toFirestoreMap() {
        Map<String, Object> map = new HashMap<>();
        map.put("type", type);
        map.put("entityId", entityId);
        map.put("action", action);
        map.put("message", message);
        map.put("title", title);
        map.put("userToken", userToken);
        map.put("userId", userId);
        map.put("status", status != null ? status : NotificationStatus.READY.name());
        map.put("notificationSent", notificationSent != null ? notificationSent : false);
        map.put("createdAt", createdAt);
        map.put("sentAt", sentAt);
        map.put("errorMessage", errorMessage);
        map.put("retryCount", retryCount != null ? retryCount : 0);
        
        // Données optionnelles
        if (signalementDescription != null) {
            map.put("signalementDescription", signalementDescription);
        }
        if (oldStatus != null) {
            map.put("oldStatus", oldStatus);
        }
        if (newStatus != null) {
            map.put("newStatus", newStatus);
        }
        
        return map;
    }
    
    /**
     * Builder helper pour créer une notification de création de signalement
     */
    public static NotificationOutboxDto forSignalementCreated(
            Integer signalementId,
            String userId,
            String userToken,
            String description) {
        return NotificationOutboxDto.builder()
                .type(EntityType.SIGNALEMENT.name())
                .entityId(signalementId)
                .action(NotificationAction.CREATED.name())
                .title("Nouveau signalement enregistré")
                .message("Votre signalement a été enregistré avec succès")
                .userId(userId)
                .userToken(userToken)
                .signalementDescription(description)
                .status(NotificationStatus.READY.name())
                .notificationSent(false)
                .retryCount(0)
                .createdAt(java.time.Instant.now().toString())
                .build();
    }
    
    /**
     * Builder helper pour créer une notification de résolution de problème
     */
    public static NotificationOutboxDto forProblemeResolved(
            Integer problemeId,
            String userId,
            String userToken,
            String description) {
        return NotificationOutboxDto.builder()
                .type(EntityType.PROBLEME.name())
                .entityId(problemeId)
                .action(NotificationAction.RESOLVED.name())
                .title("Problème résolu")
                .message("Le problème que vous avez signalé a été résolu")
                .userId(userId)
                .userToken(userToken)
                .signalementDescription(description)
                .status(NotificationStatus.READY.name())
                .notificationSent(false)
                .retryCount(0)
                .createdAt(java.time.Instant.now().toString())
                .build();
    }
}
