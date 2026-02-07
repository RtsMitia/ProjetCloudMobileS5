<template>
  <div class="ajout-photo-container">
    <ion-label class="section-title">Photos</ion-label>

    <!-- Grille de photos sélectionnées -->
    <div v-if="photos.length > 0" class="photos-grid">
      <div v-for="(photo, index) in photos" :key="index" class="photo-thumb">
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

    <!-- Icônes ajout photo (action uniquement) -->
    <div class="photo-buttons action-card">
      <div class="icon-buttons">
        <ion-button
          fill="clear"
          class="icon-only action-btn"
          @click="handleTakePhoto"
          title="Prendre une photo"
          aria-label="Prendre une photo"
        >
          <ion-icon :icon="camera" />
        </ion-button>

        <ion-button
          fill="clear"
          class="icon-only action-btn"
          @click="handlePickFromGallery"
          title="Depuis la galerie"
          aria-label="Depuis la galerie"
        >
          <ion-icon :icon="images" />
        </ion-button>
      </div>
      <p class="action-text">Ajouter des photos</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { IonButton, IonIcon, IonLabel } from '@ionic/vue';
import { camera, images, closeCircle } from 'ionicons/icons';
import { usePhoto, type UserPhoto } from '@/composables/usePhoto';

// Props et emits
const props = defineProps<{
  modelValue?: UserPhoto[];
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', photos: UserPhoto[]): void;
}>();

// Composable photo
const { capturePhoto } = usePhoto();

// État local des photos
const photos = ref<UserPhoto[]>(props.modelValue || []);

// Sync avec v-model
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    photos.value = newVal;
  }
}, { deep: true });

watch(photos, (newPhotos) => {
  emit('update:modelValue', newPhotos);
}, { deep: true });

// Prendre une photo avec la caméra
async function handleTakePhoto() {
  const photo = await capturePhoto('camera');
  if (photo) {
    photos.value.push(photo);
  }
}

// Choisir depuis la galerie
async function handlePickFromGallery() {
  const photo = await capturePhoto('gallery');
  if (photo) {
    photos.value.push(photo);
  }
}

// Supprimer une photo
function removePhoto(index: number) {
  photos.value.splice(index, 1);
}

// Exposer les méthodes et données pour le parent si besoin
defineExpose({
  photos,
  handleTakePhoto,
  handlePickFromGallery,
  removePhoto,
});
</script>

<style scoped>
.ajout-photo-container {
  padding: 16px;
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
  align-items: center;
}

.action-card {
  background-color: var(--ion-color-light);
  border: 2px dashed var(--ion-color-medium-shade);
  border-radius: 12px;
  padding: 20px;
  margin-top: 8px;
  transition: background-color 0.2s;
}

.action-card:active {
  background-color: var(--ion-color-light-shade);
}

.action-text {
  margin: 8px 0 0;
  font-size: 14px;
  color: var(--ion-color-medium);
  font-weight: 500;
}

.photo-buttons ion-button {
  --border-radius: 8px;
}

.icon-buttons {
  display: flex;
  gap: 24px;
  align-items: center;
  justify-content: center;
}

.icon-only {
  --padding-start: 12px;
  --padding-end: 12px;
  --min-width: 64px;
  width: 64px;
  height: 64px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: white;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
  --color: var(--ion-color-primary);
  transition: transform 0.1s ease;
}

.icon-only:active {
  transform: scale(0.95);
}

.icon-only ion-icon {
  font-size: 32px;
}
</style>
