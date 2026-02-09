import { 
  PushNotifications, 
  Token, 
  PushNotificationSchema, 
  ActionPerformed,
  PermissionStatus
} from '@capacitor/push-notifications';
import { Capacitor, PluginListenerHandle } from '@capacitor/core';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from './firebase/firebase';

type NotificationPermission = 'granted' | 'denied' | 'prompt';

class NotificationService {
  private isInitialized = false;
  private currentToken: string | null = null;

  isSupported(): boolean {
    return Capacitor.isNativePlatform();
  }

  getToken(): string | null {
    return this.currentToken;
  }

  private mapPermission(status: PermissionStatus): NotificationPermission {
    const state = status.receive;
    if (state === 'granted') return 'granted';
    if (state === 'denied') return 'denied';
    return 'prompt';
  }

  async initialize(): Promise<boolean> {
    if (this.isInitialized) {
      return true;
    }

    if (!this.isSupported()) {
      console.log('Notifications non supportées sur cette plateforme');
      return false;
    }

    try {
      const permission = await this.requestPermission();
      
      if (permission !== 'granted') {
        console.warn('Permission notifications refusée');
        return false;
      }

      this.registerListeners();
      await PushNotifications.register();

      this.isInitialized = true;
      console.log('Notifications push initialisées');
      return true;
    } catch (error) {
      console.error('Erreur initialisation notifications:', error);
      return false;
    }
  }

  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) {
      return 'denied';
    }

    const result = await PushNotifications.requestPermissions();
    return this.mapPermission(result);
  }

  async checkPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) {
      return 'denied';
    }

    const result = await PushNotifications.checkPermissions();
    return this.mapPermission(result);
  }

  async addPushReceivedListener(
    callback: (notification: PushNotificationSchema) => void
  ): Promise<PluginListenerHandle> {
    return PushNotifications.addListener('pushNotificationReceived', callback);
  }

  private registerListeners(): void {
    PushNotifications.addListener('registration', async (token: Token) => {
      console.log('Token FCM reçu:', token.value);
      this.currentToken = token.value;
      await this.saveTokenToFirestore(token.value);
    });

    PushNotifications.addListener('registrationError', (error) => {
      console.error('Erreur enregistrement push:', error);
    });

    PushNotifications.addListener(
      'pushNotificationReceived',
      (notification: PushNotificationSchema) => {
        console.log('Notification reçue (foreground):', notification);
        this.handleForegroundNotification(notification);
      }
    );

    PushNotifications.addListener(
      'pushNotificationActionPerformed',
      (action: ActionPerformed) => {
        console.log('Action notification:', action);
        this.handleNotificationAction(action);
      }
    );
  }

  async saveTokenToFirestore(token: string): Promise<void> {
    const user = auth.currentUser;
    
    if (!user) {
      console.warn('Utilisateur non connecté, token non sauvegardé');
      return;
    }

    try {
      // 1. Sauvegarder dans userTokens (utilisé par la Cloud Function)
      const tokenDocRef = doc(db, 'userTokens', user.uid);
      await setDoc(tokenDocRef, {
        userId: user.uid,
        email: user.email,
        fcmToken: token,
        platform: Capacitor.getPlatform(),
        updatedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
      }, { merge: true });

      // 2. Mettre à jour le champ fcmToken dans users
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, {
        fcmToken: token,
        updatedAt: serverTimestamp(),
      }, { merge: true });

      console.log('Token FCM sauvegardé dans Firestore (users + userTokens)');
    } catch (error) {
      console.error('Erreur sauvegarde token:', error);
    }
  }

  private handleForegroundNotification(notification: PushNotificationSchema): void {
    const event = new CustomEvent('push-notification', {
      detail: {
        title: notification.title,
        body: notification.body,
        data: notification.data,
      }
    });
    window.dispatchEvent(event);
  }

  private handleNotificationAction(action: ActionPerformed): void {
    const data = action.notification.data;
    
    const event = new CustomEvent('push-notification-action', {
      detail: {
        actionId: action.actionId,
        data: data,
      }
    });
    window.dispatchEvent(event);
    if (data?.signalementId) {
      console.log('Navigation vers signalement:', data.signalementId);
    }
  }

  async removeAllListeners(): Promise<void> {
    await PushNotifications.removeAllListeners();
    this.isInitialized = false;
  }

  async getDeliveredNotifications() {
    if (!this.isSupported()) return { notifications: [] };
    return await PushNotifications.getDeliveredNotifications();
  }

  async removeAllDeliveredNotifications(): Promise<void> {
    if (!this.isSupported()) return;
    await PushNotifications.removeAllDeliveredNotifications();
  }
}

export const notificationService = new NotificationService();
