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
exports.onSignalementStatusChange = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
// Initialiser Firebase Admin
admin.initializeApp();
const db = admin.firestore();
const messaging = admin.messaging();
/**
 * Cloud Function déclenchée lors de la mise à jour d'un signalement
 * Envoie une notification push si le statusLibelle a changé
 */
exports.onSignalementStatusChange = functions
    .region('europe-west1')
    .firestore
    .document('signalements/{signalementId}')
    .onUpdate(async (change, context) => {
    const signalementId = context.params.signalementId;
    const beforeData = change.before.data();
    const afterData = change.after.data();
    // Vérifier si le statusLibelle a changé
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
        // Récupérer le token FCM de l'utilisateur
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
        // Construire le message de notification
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
        // Envoyer la notification
        const response = await messaging.send(message);
        console.log(`[${signalementId}] Notification envoyée avec succès: ${response}`);
        // Optionnel: Sauvegarder l'historique de notification
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
        // Gérer les tokens invalides
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