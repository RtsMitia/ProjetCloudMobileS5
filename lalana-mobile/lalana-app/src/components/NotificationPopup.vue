<template>
  <Transition name="slide-down">
    <div v-if="show && notification" class="notification-popup" @click="handleClick">
      <div class="notification-content">
        <div class="notification-icon" :style="{ color: iconColor }">
          <ion-icon :icon="icon" size="large"></ion-icon>
        </div>
        
        <div class="notification-body">
          <h3 class="notification-title">{{ notification.title }}</h3>
          <p class="notification-message">{{ notification.message }}</p>
          
          <div v-if="notification.description" class="notification-description">
            {{ truncateDescription(notification.description) }}
          </div>
          
          <div class="notification-meta">
            <span class="notification-type">{{ typeLabel }}</span>
            <span class="notification-time">{{ timeAgo }}</span>
          </div>
        </div>
        
        <button class="notification-close" @click.stop="handleClose">
          <ion-icon :icon="closeOutline"></ion-icon>
        </button>
      </div>
      
      <!-- Barre de progression pour auto-dismiss -->
      <div class="notification-progress">
        <div class="notification-progress-bar" :class="{ animate: show }"></div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { IonIcon } from '@ionic/vue';
import {
  closeOutline,
  checkmarkCircle,
  addCircle,
  construct,
  alertCircle,
} from 'ionicons/icons';
import type { UserNotification } from '@/composables/useUserNotifications';

interface Props {
  show: boolean;
  notification: UserNotification | null;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  close: [];
  click: [notification: UserNotification];
}>();

// Icône dynamique selon le type/action
const icon = computed(() => {
  if (!props.notification) return alertCircle;
  
  if (props.notification.action === 'RESOLVED') {
    return checkmarkCircle;
  }
  if (props.notification.action === 'CREATED') {
    return addCircle;
  }
  if (props.notification.type === 'PROBLEME') {
    return construct;
  }
  return alertCircle;
});

// Couleur dynamique
const iconColor = computed(() => {
  if (!props.notification) return '#666';
  
  if (props.notification.action === 'RESOLVED') {
    return '#4CAF50'; // Vert
  }
  if (props.notification.action === 'CREATED') {
    return '#2196F3'; // Bleu
  }
  if (props.notification.type === 'PROBLEME') {
    return '#FF9800'; // Orange
  }
  return '#666'; // Gris
});

// Label du type
const typeLabel = computed(() => {
  if (!props.notification) return '';
  
  if (props.notification.type === 'SIGNALEMENT') {
    return 'Signalement';
  }
  return 'Problème';
});

// Temps relatif
const timeAgo = computed(() => {
  if (!props.notification?.createdAt) return '';
  
  try {
    const now = Date.now();
    const timestamp = props.notification.createdAt.toDate ? 
      props.notification.createdAt.toDate().getTime() : 
      new Date(props.notification.createdAt).getTime();
    
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (seconds < 60) return 'À l\'instant';
    if (minutes < 60) return `Il y a ${minutes} min`;
    if (hours < 24) return `Il y a ${hours} h`;
    
    const days = Math.floor(hours / 24);
    return `Il y a ${days} j`;
  } catch (e) {
    return 'Récent';
  }
});

// Tronquer la description
function truncateDescription(text: string, maxLength = 80): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

// Handlers
function handleClick() {
  if (props.notification) {
    emit('click', props.notification);
  }
}

function handleClose() {
  emit('close');
}
</script>

<style scoped>
.notification-popup {
  position: fixed;
  top: 60px; /* Sous le header */
  left: 50%;
  transform: translateX(-50%);
  width: calc(100% - 32px);
  max-width: 500px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 10000;
  cursor: pointer;
  overflow: hidden;
}

.notification-content {
  display: flex;
  align-items: flex-start;
  padding: 16px;
  gap: 12px;
}

.notification-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
}

.notification-body {
  flex: 1;
  min-width: 0;
}

.notification-title {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  line-height: 1.3;
}

.notification-message {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #555;
  line-height: 1.4;
}

.notification-description {
  margin: 0 0 8px 0;
  font-size: 13px;
  color: #888;
  font-style: italic;
  line-height: 1.3;
}

.notification-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12px;
  color: #999;
}

.notification-type {
  font-weight: 500;
  color: #666;
}

.notification-time {
  font-size: 11px;
}

.notification-close {
  flex-shrink: 0;
  background: transparent;
  border: none;
  padding: 4px;
  cursor: pointer;
  color: #999;
  transition: color 0.2s;
  font-size: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.notification-close:hover {
  color: #333;
}

/* Barre de progression */
.notification-progress {
  height: 3px;
  background: #f0f0f0;
  overflow: hidden;
}

.notification-progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #2196F3, #4CAF50);
  width: 0;
  transition: width 0.1s linear;
}

.notification-progress-bar.animate {
  animation: progress 5s linear forwards;
}

@keyframes progress {
  from {
    width: 100%;
  }
  to {
    width: 0%;
  }
}

/* Animations d'entrée/sortie */
.slide-down-enter-active {
  animation: slideDown 0.3s ease-out;
}

.slide-down-leave-active {
  animation: slideUp 0.3s ease-in;
}

@keyframes slideDown {
  from {
    transform: translate(-50%, -120%);
    opacity: 0;
  }
  to {
    transform: translate(-50%, 0);
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    transform: translate(-50%, 0);
    opacity: 1;
  }
  to {
    transform: translate(-50%, -120%);
    opacity: 0;
  }
}

/* Responsive */
@media (max-width: 576px) {
  .notification-popup {
    top: 56px;
    width: calc(100% - 16px);
  }
  
  .notification-content {
    padding: 12px;
  }
  
  .notification-icon {
    width: 40px;
    height: 40px;
  }
  
  .notification-title {
    font-size: 15px;
  }
  
  .notification-message {
    font-size: 13px;
  }
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .notification-popup {
    background: #2c2c2c;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
  }
  
  .notification-title {
    color: #e0e0e0;
  }
  
  .notification-message {
    color: #b0b0b0;
  }
  
  .notification-description {
    color: #888;
  }
  
  .notification-type {
    color: #999;
  }
  
  .notification-progress {
    background: #1a1a1a;
  }
  
  .notification-close {
    color: #888;
  }
  
  .notification-close:hover {
    color: #e0e0e0;
  }
}
</style>
