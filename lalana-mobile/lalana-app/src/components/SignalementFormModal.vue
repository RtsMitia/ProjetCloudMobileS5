<template>
  <ion-header>
    <ion-toolbar>
      <ion-title>Nouveau signalement</ion-title>
      <ion-buttons slot="end">
        <ion-button @click="cancel">Fermer</ion-button>
      </ion-buttons>
    </ion-toolbar>
  </ion-header>

  <ion-content class="ion-padding">
    <ion-item>
      <ion-label position="stacked">Description du problème *</ion-label>
      <ion-textarea
        v-model="description"
        placeholder="Décrivez le problème routier (nid-de-poule, route dégradée, etc.)"
        :rows="4"
        :auto-grow="true"
      />
    </ion-item>

    <ion-item>
      <ion-label position="stacked">Adresse / Lieu (optionnel)</ion-label>
      <ion-input v-model="localisation" placeholder="Adresse ou nom du lieu" />
    </ion-item>

    <!-- Composant AjoutPhoto -->
    <AjoutPhoto v-model="selectedPhotos" />

    <ion-button
      expand="block"
      class="submit-btn"
      :disabled="!description.trim() || isSubmitting"
      @click="submit"
    >
      <ion-spinner v-if="isSubmitting" name="crescent" slot="start" />
      {{ isSubmitting ? 'Envoi en cours...' : 'Envoyer le signalement' }}
    </ion-button>
  </ion-content>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import {
  IonHeader, IonToolbar, IonTitle, IonButtons, IonButton,
  IonContent, IonItem, IonLabel, IonTextarea, IonInput,
  IonSpinner, modalController
} from '@ionic/vue';
import AjoutPhoto from '@/components/AjoutPhoto.vue';
import type { UserPhoto } from '@/composables/usePhoto';

const description = ref('');
const localisation = ref('');
const selectedPhotos = ref<UserPhoto[]>([]);
const isSubmitting = ref(false);

async function submit() {
  if (!description.value.trim()) return;

  isSubmitting.value = true;
  try {
    await modalController.dismiss({
      description: description.value,
      localisation: localisation.value,
      photos: selectedPhotos.value,
    });
  } finally {
    isSubmitting.value = false;
  }
}

function cancel() {
  modalController.dismiss(null, 'cancel');
}
</script>

<style scoped>
.submit-btn {
  margin-top: 24px;
  --border-radius: 12px;
  font-weight: 600;
}
</style>
