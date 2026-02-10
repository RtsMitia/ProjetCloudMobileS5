import { ref, onUnmounted, Ref } from 'vue';
import { collection, query, orderBy, limit, onSnapshot, updateDoc, doc, Unsubscribe } from 'firebase/firestore';
import { db, auth } from '@/services/firebase/firebase';
import { toastController } from '@ionic/vue';

export interface UserNotification {
  id: string;
  type: 'SIGNALEMENT' | 'PROBLEME';
  entityId: number;
  action: 'CREATED' | 'RESOLVED' | 'STATUS_CHANGED';
  title: string;
  message: string;
  description?: string;
  oldStatus?: string;
  newStatus?: string;
  read: boolean;
  createdAt: any; // Timestamp Firestore
  fcmMessageId?: string;
}

/**
 * Composable pour gérer les notifications utilisateur en temps réel
 * 
 * Principe:
 * - Écoute la collection user_notifications/{userId}/notifications
 * - Affiche les nouvelles notifications dans un popup
 * - Gère le marquage comme lu
 * - Compte les notifications non lues
 * 
 * Note: Aucune logique décisionnelle, juste de l'affichage et de la gestion d'état
 */
export function useUserNotifications() {
  const notifications = ref<UserNotification[]>([]) as Ref<UserNotification[]>;
  const unreadCount = ref(0);
  const latestNotification = ref<UserNotification | null>(null);
  const showPopup = ref(false);

  let unsubscribe: Unsubscribe | null = null;

  /**
   * S'abonner aux notifications de l'utilisateur connecté
   */
  function subscribeToNotifications() {
    const user = auth.currentUser;

    if (!user) {
      console.warn('Utilisateur non connecté, impossible de s\'abonner aux notifications');
      return;
    }

    try {
      const notificationsRef = collection(db, 'user_notifications', user.uid, 'notifications');
      const q = query(
        notificationsRef,
        orderBy('createdAt', 'desc'),
        limit(50) // Limiter à 50 dernières notifications
      );

      unsubscribe = onSnapshot(q, (snapshot) => {
        const newNotifications: UserNotification[] = [];
        let unreadCounter = 0;

        snapshot.forEach((doc) => {
          const data = doc.data();
          const notification: UserNotification = {
            id: doc.id,
            type: data.type,
            entityId: data.entityId,
            action: data.action,
            title: data.title,
            message: data.message,
            description: data.description,
            oldStatus: data.oldStatus,
            newStatus: data.newStatus,
            read: data.read || false,
            createdAt: data.createdAt,
            fcmMessageId: data.fcmMessageId,
          };

          newNotifications.push(notification);

          if (!notification.read) {
            unreadCounter++;
          }
        });

        // Détecter les nouvelles notifications
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const data = change.doc.data();
            const newNotif: UserNotification = {
              id: change.doc.id,
              type: data.type,
              entityId: data.entityId,
              action: data.action,
              title: data.title,
              message: data.message,
              description: data.description,
              oldStatus: data.oldStatus,
              newStatus: data.newStatus,
              read: data.read || false,
              createdAt: data.createdAt,
              fcmMessageId: data.fcmMessageId,
            };

            // Afficher un toast pour les nouvelles notifications non lues
            // (Seulement si ce n'est pas le premier chargement)
            if (!newNotif.read && notifications.value.length > 0) {
              latestNotification.value = newNotif;
              showToast(newNotif);
            }
          }
        });

        notifications.value = newNotifications;
        unreadCount.value = unreadCounter;

        console.log(`📬 Notifications chargées: ${newNotifications.length} total, ${unreadCounter} non lues`);
      }, (error) => {
        console.error('Erreur lors de l\'écoute des notifications:', error);
      });

    } catch (error) {
      console.error('Erreur lors de la souscription aux notifications:', error);
    }
  }

  /**
   * Se désabonner des notifications
   */
  function unsubscribeFromNotifications() {
    if (unsubscribe) {
      unsubscribe();
      unsubscribe = null;
      console.log('🔕 Désabonnement des notifications');
    }
  }

  /**
   * Marquer une notification comme lue
   */
  async function markAsRead(notificationId: string) {
    const user = auth.currentUser;

    if (!user) return;

    try {
      const notifRef = doc(db, 'user_notifications', user.uid, 'notifications', notificationId);
      await updateDoc(notifRef, {
        read: true,
      });

      console.log(`✅ Notification ${notificationId} marquée comme lue`);
    } catch (error) {
      console.error('Erreur lors du marquage comme lu:', error);
    }
  }

  /**
   * Marquer toutes les notifications comme lues
   */
  async function markAllAsRead() {
    const user = auth.currentUser;

    if (!user) return;

    try {
      const unreadNotifications = notifications.value.filter(n => !n.read);

      const promises = unreadNotifications.map(notification => {
        const notifRef = doc(db, 'user_notifications', user.uid, 'notifications', notification.id);
        return updateDoc(notifRef, { read: true });
      });

      await Promise.all(promises);

      console.log(`✅ ${unreadNotifications.length} notifications marquées comme lues`);
    } catch (error) {
      console.error('Erreur lors du marquage de toutes les notifications:', error);
    }
  }

  /**
   * Afficher un toast pour une notification
   */
  async function showToast(notification: UserNotification) {
    const color = getToastColor(notification);
    const icon = getNotificationIcon(notification);

    const toast = await toastController.create({
      header: notification.title,
      message: notification.message,
      duration: 5000,
      position: 'top',
      color: color,
      icon: icon,
      buttons: [
        {
          text: 'Voir',
          role: 'info',
          handler: () => {
            handleNotificationClick(notification);
          }
        },
        {
          text: 'Fermer',
          role: 'cancel'
        }
      ],
      cssClass: 'notification-toast'
    });

    await toast.present();
  }

  /**
   * Obtenir la couleur du toast selon le type et l'action
   */
  function getToastColor(notification: UserNotification): string {
    if (notification.action === 'RESOLVED') {
      return 'success';
    }
    if (notification.action === 'CREATED') {
      return 'primary';
    }
    if (notification.action === 'STATUS_CHANGED') {
      return 'warning';
    }
    return 'medium';
  }

  /**
   * Fermer le popup de notification
   */
  function closePopup() {
    showPopup.value = false;
  }

  /**
   * Gérer le clic sur une notification
   */
  async function handleNotificationClick(notification: UserNotification) {
    // Marquer comme lue
    if (!notification.read) {
      await markAsRead(notification.id);
    }

    // Fermer le popup
    closePopup();

    // Retourner les infos pour navigation
    return {
      type: notification.type,
      entityId: notification.entityId,
      action: notification.action,
    };
  }

  /**
   * Obtenir l'icône selon le type et l'action
   */
  function getNotificationIcon(notification: UserNotification): string {
    if (notification.action === 'RESOLVED') {
      return 'checkmark-circle';
    }
    if (notification.action === 'CREATED') {
      return 'add-circle';
    }
    if (notification.type === 'PROBLEME') {
      return 'construct';
    }
    return 'alert-circle';
  }

  /**
   * Obtenir la couleur selon le type et l'action
   */
  function getNotificationColor(notification: UserNotification): string {
    if (notification.action === 'RESOLVED') {
      return 'success';
    }
    if (notification.action === 'CREATED') {
      return 'primary';
    }
    if (notification.type === 'PROBLEME') {
      return 'warning';
    }
    return 'medium';
  }

  // Cleanup lors du démontage
  onUnmounted(() => {
    unsubscribeFromNotifications();
  });

  return {
    // État
    notifications,
    unreadCount,
    latestNotification,
    showPopup,

    // Actions
    subscribeToNotifications,
    unsubscribeFromNotifications,
    markAsRead,
    markAllAsRead,
    closePopup,
    handleNotificationClick,
    showToast,

    // Helpers
    getNotificationIcon,
    getNotificationColor,
  };
}
