import { PushNotifications, Token, PushNotificationSchema, ActionPerformed } from '@capacitor/push-notifications';
import { doc, setDoc, getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

/**
 * Service de gestion des notifications push pour mobile
 * Utilise Capacitor Push Notifications pour Android/iOS
 */
class NotificationService {
  private db = getFirestore();
  private auth = getAuth();
  private isInitialized = false;

  /**
   * Initialise le service de notifications
   * À appeler APRÈS le login de l'utilisateur
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('NotificationService déjà initialisé');
      return;
    }

    try {
      // Vérifier et demander les permissions
      const permStatus = await PushNotifications.checkPermissions();

      if (permStatus.receive === 'prompt') {
        const result = await PushNotifications.requestPermissions();
        if (result.receive !== 'granted') {
          console.warn('Permission de notifications refusée');
          return;
        }
      }

      if (permStatus.receive !== 'granted') {
        console.warn('Permission de notifications non accordée');
        return;
      }

      // Enregistrer les listeners MAINTENANT que l'utilisateur est connecté à Firebase
      this.registerListeners();

      // Enregistrer pour les notifications push
      await PushNotifications.register();

      // Attendre que le token soit reçu via l'événement 'registration'
      await this.waitForToken(5000); // Attendre 5 secondes max

      this.isInitialized = true;
      console.log('NotificationService initialisé avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'initialisation des notifications:', error);
    }
  }

  /**
   * Attend que le token soit reçu via l'événement 'registration'
   */
  private waitForToken(timeoutMs: number): Promise<void> {
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        console.warn(`Token non reçu après ${timeoutMs}ms`);
        resolve();
      }, timeoutMs);
    });
  }

  /**
   * Enregistre les différents listeners pour les événements de notifications
   */
  private registerListeners(): void {
    // Listener pour l'enregistrement réussi et récupération du token
    PushNotifications.addListener('registration', async (token: Token) => {
      console.log('✅ Token FCM reçu via événement registration:', token.value);
      // Sauvegarder dans Firestore
      await this.saveTokenToFirestore(token.value);
    });

    // Listener pour les erreurs d'enregistrement
    PushNotifications.addListener('registrationError', (error: any) => {
      console.error('Erreur d\'enregistrement FCM:', error);
    });

    // Listener pour les notifications reçues (app au premier plan)
    PushNotifications.addListener(
      'pushNotificationReceived',
      (notification: PushNotificationSchema) => {
        console.log('Notification reçue (foreground):', notification);
        this.handleNotificationReceived(notification);
      }
    );

    // Listener pour les actions sur les notifications (tap sur la notification)
    PushNotifications.addListener(
      'pushNotificationActionPerformed',
      (notification: ActionPerformed) => {
        console.log('Action sur notification:', notification);
        this.handleNotificationAction(notification);
      }
    );
  }

  /**
   * Sauvegarde le token FCM dans Firestore pour l'utilisateur connecté
   */
  private async saveTokenToFirestore(token: string): Promise<void> {
    try {
      const currentUser = this.auth.currentUser;

      if (!currentUser) {
        console.warn('Aucun utilisateur connecté, token non sauvegardé');
        return;
      }

      await setDoc(
        doc(this.db, 'userTokens', currentUser.uid),
        {
          fcmToken: token,
          userId: currentUser.uid,
          platform: 'mobile',
          updatedAt: new Date(),
        },
        { merge: true }
      );

      console.log('Token FCM sauvegardé dans Firestore pour l\'utilisateur:', currentUser.uid);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du token:', error);
    }
  }

  /**
   * Gère la réception d'une notification (app au premier plan)
   */
  private handleNotificationReceived(notification: PushNotificationSchema): void {
    console.log('Titre:', notification.title);
    console.log('Corps:', notification.body);
    console.log('Données:', notification.data);
  }

  /**
   * Gère l'action de l'utilisateur sur une notification
   */
  private handleNotificationAction(action: ActionPerformed): void {
    const notification = action.notification;

    console.log('Action ID:', action.actionId);
    console.log('Données de notification:', notification.data);

    if (notification.data?.reportId) {
      console.log('Navigation vers le signalement:', notification.data.reportId);
    }
  }

  /**
   * Obtient la liste des notifications livrées mais non ouvertes
   */
  async getDeliveredNotifications(): Promise<PushNotificationSchema[]> {
    const result = await PushNotifications.getDeliveredNotifications();
    return result.notifications;
  }

  /**
   * Supprime toutes les notifications livrées
   */
  async removeAllDeliveredNotifications(): Promise<void> {
    await PushNotifications.removeAllDeliveredNotifications();
  }
}

// Export d'une instance singleton
export const notificationService = new NotificationService();
