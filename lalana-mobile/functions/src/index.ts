import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

const db = admin.firestore();
const messaging = admin.messaging();

interface Signalement {
    userId: string;
    statusLibelle: string;
    description?: string;
    probleme?: string;
    createdAt?: admin.firestore.Timestamp;
    updatedAt?: admin.firestore.Timestamp;
}

interface UserToken {
    userId: string;
    email?: string;
    fcmToken: string;
    platform: string;
    updatedAt?: admin.firestore.Timestamp;
}

export const onSignalementStatusChange = functions
    .region('europe-west1')
    .firestore
    .document('signalements/{signalementId}')
    .onUpdate(async (change, context) => {
        const signalementId = context.params.signalementId;
        const beforeData = change.before.data() as Signalement;
        const afterData = change.after.data() as Signalement;

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

            const tokenData = tokenDoc.data() as UserToken;
            const fcmToken = tokenData.fcmToken;

            if (!fcmToken) {
                console.warn(`[${signalementId}] Token FCM vide pour l'utilisateur ${userId}`);
                return null;
            }

            const notificationTitle = 'Mise à jour de votre signalement';
            const notificationBody = `Le statut de votre signalement est passé à "${newStatus}"`;

            const message: admin.messaging.Message = {
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
        } catch (error) {
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
