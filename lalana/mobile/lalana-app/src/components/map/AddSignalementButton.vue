<template>
  <ion-fab v-if="show" vertical="bottom" horizontal="end" slot="fixed">
    <ion-fab-button @click="$emit('click')">
      <ion-icon :icon="addOutline"></ion-icon>
    </ion-fab-button>
  </ion-fab>
</template>

<script setup lang="ts">
import { IonFab, IonFabButton, IonIcon } from '@ionic/vue';
import { addOutline } from 'ionicons/icons';

defineProps<{
  show: boolean;
}>();

defineEmits<{
  (e: 'click'): void;
}>();
</script>
