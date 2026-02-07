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

    <div class="photos-section">
      <ion-label class="section-title">Photos</ion-label>

      <div v-if="selectedPhotos.length > 0" class="photos-grid">
        <div v-for="(photo, index) in selectedPhotos" :key="index" class="photo-thumb">
          <img :src="photo.webviewPath" alt="Photo sélectionnée" />
          <ion-button
            fill="clear"
            size="small"
            color="danger"
            class="remove-photo-btn"
            @click="removePhoto(index)"
          >
            <ion-icon :icon="closeCircle" />
          </ion-button>
        </div>
      </div>

      <div class="photo-buttons">
        <ion-button expand="block" fill="outline" @click="handleTakePhoto">
          <ion-icon :icon="camera" slot="start" />
          Prendre une photo
        </ion-button>
        <ion-button expand="block" fill="outline" @click="handlePickFromGallery">
          <ion-icon :icon="images" slot="start" />
          Depuis la galerie
        </ion-button>
      </div>
    </div>

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
  IonIcon, IonSpinner, modalController
} from '@ionic/vue';
import { camera, images, closeCircle } from 'ionicons/icons';
import { usePhoto, type UserPhoto } from '@/composables/usePhoto';

const { capturePhoto } = usePhoto();

const description = ref('');
const localisation = ref('');
const selectedPhotos = ref<UserPhoto[]>([]);
const isSubmitting = ref(false);

async function handleTakePhoto() {
  const photo = await capturePhoto('camera');
  if (photo) {
    selectedPhotos.value.push(photo);
  }
}

async function handlePickFromGallery() {
  const photo = await capturePhoto('gallery');
  if (photo) {
    selectedPhotos.value.push(photo);
  }
}

function removePhoto(index: number) {
  selectedPhotos.value.splice(index, 1);
}

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
.photos-section {
  margin-top: 20px;
  padding: 0 16px;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--ion-color-medium);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 12px;
  display: block;
}

.photos-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 16px;
}

.photo-thumb {
  position: relative;
  width: 90px;
  height: 90px;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid var(--ion-color-light-shade);
}

.photo-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-photo-btn {
  position: absolute;
  top: -4px;
  right: -4px;
  --padding-start: 0;
  --padding-end: 0;
  font-size: 22px;
}

.photo-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.photo-buttons ion-button {
  --border-radius: 8px;
}

.submit-btn {
  margin-top: 24px;
  --border-radius: 12px;
  font-weight: 600;
}
</style>
