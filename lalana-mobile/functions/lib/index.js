"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.onSignalementStatusChange = exports.processNotificationOutbox = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
admin.initializeApp();
const db = admin.firestore();
const messaging = admin.messaging();
/**
 * Cloud Function principale pour le pattern Transactional Outbox
 *
 * Cette fonction écoute les créations dans notification_outbox et:
 * 1. Vérifie que status === 'READY' et notificationSent === false
 * 2. Envoie la notification via FCM
 * 3. Marque le document comme SENT (ou ERROR en cas d'échec)
 *
 * Principe: Toute notification est une conséquence d'un commit métier réussi
 */
exports.processNotificationOutbox = functions
    .region('europe-west1')
    .firestore
    .document('notification_outbox/{notificationId}')
    .onCreate(async (snapshot, context) => {
    const notificationId = context.params.notificationId;
    const data = snapshot.data();
    console.log(`[${notificationId}] 📥 Nouvelle intention de notification détectée:`, {
        type: data.type,
        entityId: data.entityId,
        action: data.action,
        userId: data.userId,
        status: data.status
    });
    // Vérifications de sécurité
    if (data.status !== 'READY') {
        console.log(`[${notificationId}] ⏭️ Status non READY (${data.status}), ignoré`);
        return null;
    }
    if (data.notificationSent === true) {
        console.log(`[${notificationId}] ✅ Notification déjà envoyée, ignoré`);
        return null;
    }
    if (!data.userToken) {
        console.error(`[${notificationId}] ❌ Token utilisateur manquant`);
        await snapshot.ref.update({
            status: 'ERROR',
            errorMessage: 'Token utilisateur manquant',
            sentAt: admin.firestore.FieldValue.serverTimestamp()
        });
        return null;
    }
    try {
        // Construire le message FCM
        const message = {
            token: data.userToken,
            notification: {
                title: data.title,
                body: data.message,
            },
            data: {
                type: data.type,
                entityId: String(data.entityId),
                action: data.action,
                notificationId: notificationId,
                ...(data.signalementDescription && { description: data.signalementDescription }),
                ...(data.oldStatus && { oldStatus: data.oldStatus }),
                ...(data.newStatus && { newStatus: data.newStatus }),
            },
            android: {
                priority: 'high',
                notification: {
                    channelId: data.type === 'SIGNALEMENT' ? 'signalement_updates' : 'probleme_updates',
                    icon: 'ic_notification',
                    color: data.action === 'RESOLVED' ? '#4CAF50' : '#2196F3',
                    sound: 'default',
                },
            },
            apns: {
                headers: {
                    'apns-priority': '10',
                },
                payload: {
                    aps: {
                        badge: 1,
                        sound: 'default',
                        alert: {
                            title: data.title,
                            body: data.message,
                        },
                    },
                },
            },
        };
        // Envoi via FCM
        const response = await messaging.send(message);
        console.log(`[${notificationId}] ✅ Notification envoyée avec succès: ${response}`);
        // Marquer comme SENT dans Firestore
        await snapshot.ref.update({
            status: 'SENT',
            notificationSent: true,
            sentAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        // Enregistrer dans l'historique pour consultation par l'utilisateur
        await db.collection('user_notifications').doc(data.userId).collection('notifications').add({
            type: data.type,
            entityId: data.entityId,
            action: data.action,
            title: data.title,
            message: data.message,
            description: data.signalementDescription,
            oldStatus: data.oldStatus,
            newStatus: data.newStatus,
            read: false,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            fcmMessageId: response,
        });
        console.log(`[${notificationId}] 💾 Notification ajoutée à l'historique utilisateur`);
        return { success: true, messageId: response };
    }
    catch (error) {
        console.error(`[${notificationId}] ❌ Erreur envoi notification:`, error);
        // Gestion des erreurs spécifiques
        const errorMessage = error.message || String(error);
        const isTokenInvalid = errorMessage.includes('not-registered') ||
            errorMessage.includes('invalid-registration-token') ||
            errorMessage.includes('invalid-argument');
        if (isTokenInvalid) {
            console.log(`[${notificationId}] 🗑️ Token invalide, suppression du token pour ${data.userId}`);
            // Supprimer le token invalide
            await db.collection('userTokens').doc(data.userId).delete().catch(e => console.warn('Impossible de supprimer userToken:', e));
            // Marquer comme ERROR définitif
            await snapshot.ref.update({
                status: 'ERROR',
                errorMessage: 'Token FCM invalide ou expiré',
                sentAt: admin.firestore.FieldValue.serverTimestamp(),
            });
        }
        else {
            // Erreur temporaire, permettre retry
            const retryCount = (data.retryCount || 0) + 1;
            const maxRetries = 3;
            if (retryCount >= maxRetries) {
                console.log(`[${notificationId}] 🔴 Nombre max de tentatives atteint (${maxRetries})`);
                await snapshot.ref.update({
                    status: 'ERROR',
                    errorMessage: `Échec après ${maxRetries} tentatives: ${errorMessage}`,
                    retryCount: retryCount,
                    sentAt: admin.firestore.FieldValue.serverTimestamp(),
                });
            }
            else {
                console.log(`[${notificationId}] 🔄 Tentative ${retryCount}/${maxRetries}, retry possible`);
                await snapshot.ref.update({
                    status: 'ERROR',
                    errorMessage: errorMessage,
                    retryCount: retryCount,
                    // Ne pas mettre notificationSent à true pour permettre retry manuel
                });
            }
        }
        return { success: false, error: errorMessage };
    }
});
/**
 * Fonction de compatibilité pour les anciens signalements
 * (conservée pour rétrocompatibilité)
 */
exports.onSignalementStatusChange = functions
    .region('europe-west1')
    .firestore
    .document('signalements/{signalementId}')
    .onUpdate(async (change, context) => {
    const signalementId = context.params.signalementId;
    const beforeData = change.before.data();
    const afterData = change.after.data();
    if (beforeData.statusLibelle === afterData.statusLibelle) {
        console.log(`[${signalementId}] Pas de changement de status, notification ignorée`);
        return null;
    }
    const oldStatus = beforeData.statusLibelle;
    const newStatus = afterData.statusLibelle;
    const userId = afterData.userId;
    console.log(`[${signalementId}] Status changé: "${oldStatus}" -> "${newStatus}" pour user ${userId}`);
    if (!userId) {
        console.error(`[${signalementId}] userId manquant, impossible d'envoyer la notification`);
        return null;
    }
    try {
        const tokenDoc = await db.collection('userTokens').doc(userId).get();
        if (!tokenDoc.exists) {
            console.warn(`[${signalementId}] Aucun token FCM trouvé pour l'utilisateur ${userId}`);
            return null;
        }
        const tokenData = tokenDoc.data();
        const fcmToken = tokenData.fcmToken;
        if (!fcmToken) {
            console.warn(`[${signalementId}] Token FCM vide pour l'utilisateur ${userId}`);
            return null;
        }
        const notificationTitle = 'Mise à jour de votre signalement';
        const notificationBody = `Le statut de votre signalement est passé à "${newStatus}"`;
        const message = {
            token: fcmToken,
            notification: {
                title: notificationTitle,
                body: notificationBody,
            },
            data: {
                signalementId: signalementId,
                oldStatus: oldStatus || '',
                newStatus: newStatus,
                type: 'STATUS_CHANGE',
                click_action: 'OPEN_SIGNALEMENT',
            },
            android: {
                priority: 'high',
                notification: {
                    channelId: 'signalement_status',
                    icon: 'ic_notification',
                    color: '#4CAF50',
                },
            },
            apns: {
                headers: {
                    'apns-priority': '10',
                },
                payload: {
                    aps: {
                        badge: 1,
                        sound: 'default',
                    },
                },
            },
        };
        const response = await messaging.send(message);
        console.log(`[${signalementId}] Notification envoyée avec succès: ${response}`);
        await db.collection('notificationHistory').add({
            userId: userId,
            signalementId: signalementId,
            title: notificationTitle,
            body: notificationBody,
            oldStatus: oldStatus,
            newStatus: newStatus,
            fcmResponse: response,
            sentAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        return { success: true, messageId: response };
    }
    catch (error) {
        console.error(`[${signalementId}] Erreur envoi notification:`, error);
        if (error instanceof Error &&
            (error.message.includes('not-registered') ||
                error.message.includes('invalid-registration-token'))) {
            console.log(`[${signalementId}] Token invalide, suppression du token pour ${userId}`);
            await db.collection('userTokens').doc(userId).delete();
        }
        return { success: false, error: String(error) };
    }
});
//# sourceMappingURL=index.js.map