"use strict";
/**
 * Configuration des notifications
 *
 * Ce fichier contient les constantes de configuration
 * pour le système de notifications transactionnel.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.FCM_ERROR_CODES = exports.NOTIFICATION_MESSAGES = exports.NOTIFICATION_CONFIG = void 0;
exports.validateNotificationOutbox = validateNotificationOutbox;
exports.NOTIFICATION_CONFIG = {
    // Collections Firestore
    COLLECTIONS: {
        NOTIFICATION_OUTBOX: 'notification_outbox',
        USER_NOTIFICATIONS: 'user_notifications',
        USER_TOKENS: 'userTokens',
    },
    // Statuts des notifications
    STATUS: {
        READY: 'READY',
        SENT: 'SENT',
        ERROR: 'ERROR',
    },
    // Types d'entités
    ENTITY_TYPES: {
        SIGNALEMENT: 'SIGNALEMENT',
        PROBLEME: 'PROBLEME',
    },
    // Actions
    ACTIONS: {
        CREATED: 'CREATED',
        RESOLVED: 'RESOLVED',
        STATUS_CHANGED: 'STATUS_CHANGED',
    },
    // Configuration retry
    RETRY: {
        MAX_ATTEMPTS: 3,
        BACKOFF_MS: [1000, 5000, 15000], // 1s, 5s, 15s
    },
    // Configuration FCM
    FCM: {
        // Canaux de notification Android
        CHANNELS: {
            SIGNALEMENT_UPDATES: 'signalement_updates',
            PROBLEME_UPDATES: 'probleme_updates',
            SIGNALEMENT_STATUS: 'signalement_status',
        },
        // Priorités
        PRIORITY: {
            HIGH: 'high',
            NORMAL: 'normal',
        },
        // Couleurs
        COLORS: {
            RESOLVED: '#4CAF50', // Vert
            CREATED: '#2196F3', // Bleu
            WARNING: '#FF9800', // Orange
        },
    },
    // Région Cloud Functions
    REGION: 'europe-west1',
    // Délai d'auto-dismiss du popup (ms)
    POPUP_AUTO_DISMISS_MS: 5000,
};
/**
 * Messages prédéfinis pour les notifications
 */
exports.NOTIFICATION_MESSAGES = {
    SIGNALEMENT: {
        CREATED: {
            title: 'Nouveau signalement enregistré',
            message: 'Votre signalement a été enregistré avec succès',
        },
        RESOLVED: {
            title: 'Signalement traité',
            message: 'Votre signalement a été traité',
        },
        STATUS_CHANGED: {
            title: 'Mise à jour de votre signalement',
            message: (oldStatus, newStatus) => `Le statut est passé de "${oldStatus}" à "${newStatus}"`,
        },
    },
    PROBLEME: {
        CREATED: {
            title: 'Nouveau problème enregistré',
            message: 'Le problème a été enregistré avec succès',
        },
        RESOLVED: {
            title: 'Problème résolu',
            message: 'Le problème que vous avez signalé a été résolu',
        },
        STATUS_CHANGED: {
            title: 'Mise à jour du problème',
            message: (oldStatus, newStatus) => `Le statut du problème est passé de "${oldStatus}" à "${newStatus}"`,
        },
    },
};
/**
 * Erreurs FCM connues et leur traitement
 */
exports.FCM_ERROR_CODES = {
    // Erreurs nécessitant suppression du token
    INVALID_TOKEN_ERRORS: [
        'messaging/invalid-registration-token',
        'messaging/registration-token-not-registered',
        'messaging/invalid-argument',
    ],
    // Erreurs temporaires permettant retry
    TEMPORARY_ERRORS: [
        'messaging/server-unavailable',
        'messaging/internal-error',
        'messaging/timeout',
    ],
    // Erreurs définitives (pas de retry)
    PERMANENT_ERRORS: [
        'messaging/payload-size-limit-exceeded',
        'messaging/invalid-data-payload-key',
    ],
};
/**
 * Validation des champs requis
 */
function validateNotificationOutbox(data) {
    const errors = [];
    if (!data.type)
        errors.push('type is required');
    if (!data.entityId)
        errors.push('entityId is required');
    if (!data.action)
        errors.push('action is required');
    if (!data.userToken)
        errors.push('userToken is required');
    if (!data.userId)
        errors.push('userId is required');
    if (!data.message)
        errors.push('message is required');
    if (!data.title)
        errors.push('title is required');
    return {
        valid: errors.length === 0,
        errors,
    };
}
//# sourceMappingURL=notification-config.js.map