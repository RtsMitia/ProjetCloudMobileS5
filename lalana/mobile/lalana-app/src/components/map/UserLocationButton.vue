<template>
  <div class="user-location-button">
    <ion-button
      :color="isTrackingLocation ? 'primary' : 'medium'"
      fill="solid"
      shape="round"
      size="default"
      @click="toggleTracking"
      class="location-btn"
    >
      <ion-icon 
        :icon="isTrackingLocation ? navigateCircle : navigateCircleOutline" 
        slot="icon-only"
      />
    </ion-button>
  </div>
</template>

<script setup lang="ts">
import { IonButton, IonIcon } from '@ionic/vue';
import { navigateCircle, navigateCircleOutline } from 'ionicons/icons';

interface Props {
  isTrackingLocation: boolean;
}

interface Emits {
  (e: 'toggle-tracking'): void;
}

defineProps<Props>();
const emit = defineEmits<Emits>();

function toggleTracking() {
  emit('toggle-tracking');
}
</script>

<style scoped>
.user-location-button {
  position: absolute;
  bottom: 120px;
  right: 16px;
  z-index: 1000;
}

.location-btn {
  --box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 48px;
  height: 48px;
}

.location-btn ion-icon {
  font-size: 24px;
}
</style>
