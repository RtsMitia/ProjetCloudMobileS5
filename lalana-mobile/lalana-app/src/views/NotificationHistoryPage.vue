<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/"></ion-back-button>
        </ion-buttons>
        <ion-title>Mes notifications</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="refreshHistory" :disabled="loading">
            <ion-icon :icon="refreshOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <!-- Loading -->
      <div v-if="loading" class="loading-container">
        <ion-spinner></ion-spinner>
        <p>Chargement des notifications...</p>
      </div>

      <!-- Empty state -->
      <div v-else-if="notifications.length === 0" class="empty-state">
        <ion-icon :icon="notificationsOffOutline" size="large"></ion-icon>
        <h2>Aucune notification</h2>
        <p>Vous n'avez reçu aucune notification pour le moment.</p>
      </div>

      <!-- Notifications list -->
      <ion-list v-else>
        <ion-item-sliding v-for="notif in notifications" :key="notif.id">
          <ion-item @click="handleNotificationClick(notif)" button>
            <ion-icon 
              :icon="getNotificationIcon(notif.type)" 
              slot="start"
              :color="getNotificationColor(notif.type)"
            ></ion-icon>
            
            <ion-label>
              <h2>{{ notif.title }}</h2>
              <p>{{ notif.body }}</p>
              <p class="notification-time">
                {{ formatDate(notif.sentAt) }}
              </p>
              <ion-badge 
                v-if="notif.newStatus" 
                :color="getStatusColor(notif.newStatus)"
              >
                {{ notif.newStatus }}
              </ion-badge>
            </ion-label>
          </ion-item>

          <ion-item-options side="end">
            <ion-item-option color="danger" @click="deleteNotification(notif.id)">
              <ion-icon :icon="trashOutline"></ion-icon>
              Supprimer
            </ion-item-option>
          </ion-item-options>
        </ion-item-sliding>
      </ion-list>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonButton,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  IonLabel,
  IonIcon,
  IonSpinner,
  IonBadge,
} from '@ionic/vue';
import {
  notificationsOffOutline,
  refreshOutline,
  trashOutline,
  checkmarkCircleOutline,
  alertCircleOutline,
  informationCircleOutline,
} from 'ionicons/icons';
import { collection, query, where, orderBy, getDocs, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { db, auth } from '@/services/firebase/firebase';

interface NotificationHistory {
  id: string;
  userId: string;
  signalementId?: string;
  title: string;
  body: string;
  oldStatus?: string;
  newStatus?: string;
  type?: string;
  sentAt: Timestamp;
}

const router = useRouter();
const notifications = ref<NotificationHistory[]>([]);
const loading = ref(true);

onMounted(async () => {
  await loadNotificationHistory();
});

async function loadNotificationHistory() {
  loading.value = true;
  
  try {
    const user = auth.currentUser;
    if (!user) {
      console.warn('Utilisateur non connecté');
      return;
    }

    const notifQuery = query(
      collection(db, 'notificationHistory'),
      where('userId', '==', user.uid),
      orderBy('sentAt', 'desc')
    );

    const snapshot = await getDocs(notifQuery);
    notifications.value = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as NotificationHistory));

    console.log(`${notifications.value.length} notifications chargées`);
  } catch (error) {
    console.error('Erreur chargement historique:', error);
  } finally {
    loading.value = false;
  }
}

async function refreshHistory() {
  await loadNotificationHistory();
}

function handleNotificationClick(notif: NotificationHistory) {
  if (notif.signalementId) {
    router.push(`/mes-signalements`);
  }
}

async function deleteNotification(notifId: string) {
  try {
    await deleteDoc(doc(db, 'notificationHistory', notifId));
    notifications.value = notifications.value.filter(n => n.id !== notifId);
    console.log('Notification supprimée');
  } catch (error) {
    console.error('Erreur suppression notification:', error);
  }
}

function formatDate(timestamp: Timestamp): string {
  if (!timestamp) return '';
  
  const date = timestamp.toDate();
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'À l\'instant';
  if (diffMins < 60) return `Il y a ${diffMins} min`;
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  if (diffDays === 1) return 'Hier';
  if (diffDays < 7) return `Il y a ${diffDays} jours`;
  
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

function getNotificationIcon(type?: string): string {
  switch (type) {
    case 'STATUS_CHANGE':
      return checkmarkCircleOutline;
    case 'ERROR':
      return alertCircleOutline;
    default:
      return informationCircleOutline;
  }
}

function getNotificationColor(type?: string): string {
  switch (type) {
    case 'STATUS_CHANGE':
      return 'success';
    case 'ERROR':
      return 'danger';
    default:
      return 'primary';
  }
}

function getStatusColor(status: string): string {
  const statusLower = status.toLowerCase();
  if (statusLower.includes('résolu') || statusLower.includes('terminé')) return 'success';
  if (statusLower.includes('en cours')) return 'warning';
  if (statusLower.includes('rejeté')) return 'danger';
  return 'medium';
}
</script>

<style scoped>
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 16px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 24px;
  text-align: center;
  color: var(--ion-color-medium);
}

.empty-state ion-icon {
  font-size: 80px;
  margin-bottom: 16px;
}

.empty-state h2 {
  margin-top: 0;
  color: var(--ion-color-dark);
}

.notification-time {
  font-size: 12px;
  color: var(--ion-color-medium);
  margin-top: 4px;
}

ion-badge {
  margin-top: 8px;
}
</style>
