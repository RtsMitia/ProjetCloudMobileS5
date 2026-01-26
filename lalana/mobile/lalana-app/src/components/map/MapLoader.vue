<template>
  <div class="map-loader" v-if="isLoading">
    <ion-spinner name="crescent"></ion-spinner>
    <p>{{ message }}</p>
  </div>
</template>

<script setup lang="ts">
import { IonSpinner } from '@ionic/vue';

defineProps<{
  isLoading: boolean;
  message?: string;
}>();
</script>

<style scoped>
.map-loader {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  z-index: 1000;
}

.map-loader p {
  margin-top: 1rem;
  color: var(--ion-color-medium);
}
</style>
