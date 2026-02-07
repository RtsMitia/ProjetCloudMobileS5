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

    <!-- Boutons ajout photo -->
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
}

.photo-buttons ion-button {
  --border-radius: 8px;
}
</style>
