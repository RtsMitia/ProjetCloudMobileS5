<template>
  <ion-header class="modern-header">
    <ion-toolbar class="modern-toolbar">
      <ion-buttons slot="start">
        <ion-button @click="$emit('toggleFilters')" class="modern-icon-button">
          <ion-icon :icon="filterOutline"></ion-icon>
        </ion-button>
      </ion-buttons>
      
      <ion-title class="modern-title">Carte des Signalements</ion-title>
      
      <ion-buttons slot="end">
        <ion-button v-if="isAuthenticated" @click="$emit('logout')" class="modern-icon-button">
          <ion-icon :icon="logOutOutline"></ion-icon>
        </ion-button>
        <ion-button v-else @click="$emit('goToLogin')" class="modern-icon-button">
          <ion-icon :icon="logInOutline"></ion-icon>
        </ion-button>
      </ion-buttons>
    </ion-toolbar>
    
    <slot name="filters"></slot>
  </ion-header>
</template>

<script setup lang="ts">
import { IonHeader, IonToolbar, IonButtons, IonButton, IonIcon, IonTitle } from '@ionic/vue';
import { filterOutline, logOutOutline, logInOutline } from 'ionicons/icons';

defineProps<{
  isAuthenticated: boolean;
}>();

defineEmits<{
  (e: 'toggleFilters'): void;
  (e: 'logout'): void;
  (e: 'goToLogin'): void;
}>();
</script>

<style scoped>
.modern-header {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.modern-toolbar {
  --background: white;
  --border-color: transparent;
  --min-height: 56px;
}

.modern-title {
  font-weight: 600;
  color: #1a1a1a;
  font-size: 1.1rem;
}

.modern-icon-button {
  --color: #1a1a1a;
  --color-activated: #000;
  --padding-start: 8px;
  --padding-end: 8px;
}

.modern-icon-button ion-icon {
  font-size: 1.4rem;
}
</style>
