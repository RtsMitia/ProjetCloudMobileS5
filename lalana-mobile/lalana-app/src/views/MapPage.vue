<template>
  <ion-page>
    <!-- Header avec filtres -->
    <MapHeader 
      :isAuthenticated="isAuthenticated"
      @toggleFilters="showFilters = !showFilters"
      @logout="handleLogout"
      @goToLogin="goToLogin"
    >
      <template #filters>
        <MapFilters
          :show="showFilters"
          :modelStatus="selectedStatus"
          :modelOnlyMine="showOnlyMySignalements"
          :isAuthenticated="isAuthenticated"
          @update:modelStatus="selectedStatus = $event"
          @update:modelOnlyMine="showOnlyMySignalements = $event"
          @filtersChanged="handleFiltersChanged"
        />
      </template>
    </MapHeader>

    <ion-content :fullscreen="true">
      <!-- Loader -->
      <MapLoader :isLoading="!isMapReady" message="Chargement de la carte..." />
      
      <!-- Carte Leaflet -->
      <div id="map" class="map-container"></div>
      
      <!-- Bouton de géolocalisation -->
      <UserLocationButton 
        :isTrackingLocation="isTrackingLocation" 
        @toggle-tracking="handleToggleTracking" 
      />
      
      <!-- Bouton d'ajout (seulement si connecté) -->
      <AddSignalementButton 
        :show="isAuthenticated" 
        @click="handleAddSignalement" 
      />
      <!-- Image viewer modal -->
      <SignalementImagesViewer v-if="imagesModalVisible" :images="modalImages" @close="imagesModalVisible = false" />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { IonPage, IonContent } from '@ionic/vue';
import { MapHeader, MapFilters, MapLoader, AddSignalementButton, UserLocationButton } from '@/components/map';
import { useAuth, useSignalements, useMap, useProblemes } from '@/composables';
import { alertService } from '@/services/alert.service';
import SignalementImagesViewer from '@/components/SignalementImagesViewer.vue';

// Composables
console.log('🟢 DEBUT Initialisation des composables MapPage.vue');
const { isAuthenticated, logout, goToLogin, currentUser } = useAuth();
const { 
  signalements,
  filteredSignalements,
  selectedStatus, 
  showOnlyMySignalements,
  subscribeToSignalements,
  unsubscribeFromSignalements,
  applyFilters,
  createSignalement
} = useSignalements();
console.log('🟢 useSignalements OK');

const {
  problemes,
  filteredProblemes,
  subscribeToProblemes,
  unsubscribeFromProblemes
} = useProblemes();
console.log('🟢 useProblemes OK, subscribeToProblemes:', typeof subscribeToProblemes);

const { 
  isMapReady,
  isTrackingLocation,
  userLocation,
  initMap, 
  destroyMap, 
  displaySignalements,
  displayProblemes,
  addTempMarker,
  removeTempMarker,
  startTrackingLocation,
  stopTrackingLocation,
  centerOnUserLocation
} = useMap();
console.log('🟢 useMap OK, displayProblemes:', typeof displayProblemes);

// State local
const showFilters = ref(false);
const isCreatingSignalement = ref(false);
// images modal
const imagesModalVisible = ref(false);
const modalImages = ref<any[]>([]);

// Lifecycle
onMounted(() => {
  console.log('🗺️ MapPage.vue mounted');
  setTimeout(() => {
    initMap(handleMapClick);
    subscribeToSignalements();
    console.log('🔧 Appel subscribeToProblemes...');
    subscribeToProblemes();
  }, 100);

  // listen to open-images events dispatched from map popups
  window.addEventListener('show-signalement-images', (e: any) => {
    try {
      const imgs = e?.detail?.images ?? [];
      modalImages.value = imgs;
      imagesModalVisible.value = true;
    } catch (err) {
      console.error('Failed to open images modal', err);
    }
  });
});

onUnmounted(() => {
  unsubscribeFromSignalements();
  unsubscribeFromProblemes();
  destroyMap();
  window.removeEventListener('show-signalement-images', () => {});
});

// Watchers
watch(filteredSignalements, (newSignalements) => {
  displaySignalements(newSignalements);
});

watch(problemes, (newProblemes) => {
  console.log(`🔧 Watcher problemes déclenché avec ${newProblemes.length} problèmes BRUTS`);
  displayProblemes(newProblemes);
}, { immediate: true });

// Handlers
function handleFiltersChanged() {
  applyFilters();
}

function handleToggleTracking() {
  if (isTrackingLocation.value) {
    stopTrackingLocation();
  } else {
    startTrackingLocation(true);
  }
}

async function handleLogout() {
  await logout();
}

async function handleAddSignalement() {
  // Demander le choix de position
  const choice = await alertService.showLocationChoice();
  
  if (!choice) return; // Annulé

  if (choice === 'current') {
    // Créer le signalement à la position actuelle
    await createSignalementAtCurrentLocation();
  } else {
    // Mode sélection sur la carte
    isCreatingSignalement.value = true;
    await alertService.showSignalementModeInfo();
  }
}

async function createSignalementAtCurrentLocation() {
  if (!userLocation.value) {
    await alertService.showError('Position non disponible. Veuillez activer la géolocalisation.');
    return;
  }

  const { lat, lng } = userLocation.value;
  
  addTempMarker(lat, lng);

  const formData = await alertService.showSignalementForm();

  if (formData) {
    try {
      await createSignalement(lat, lng, formData.description, formData.localisation || '', formData.photos || []);
      await alertService.showSuccess('Signalement créé avec succès !');
    } catch (error) {
      await alertService.showError('Impossible de créer le signalement. Vérifiez votre connexion.');
    }
  }

  removeTempMarker();
}

async function handleMapClick(lat: number, lng: number) {
  if (!isCreatingSignalement.value) return;
  addTempMarker(lat, lng);
  const formData = await alertService.showSignalementForm();

  if (formData) {
    try {      
      await createSignalement(lat, lng, formData.description, formData.localisation || '', formData.photos || []);
      await alertService.showSuccess('Signalement créé avec succès !');
    } catch (error) {
      await alertService.showError('Impossible de créer le signalement. Vérifiez votre connexion.');
    }
  }

  removeTempMarker();
  isCreatingSignalement.value = false;
}
</script>

<style scoped>
.map-container {
  height: 100%;
  width: 100%;
}

/* Fix pour les icônes Leaflet dans Ionic */
:deep(.leaflet-pane) {
  z-index: 400;
}

:deep(.leaflet-top),
:deep(.leaflet-bottom) {
  z-index: 400;
}

/* Optimisation du rendu des tuiles */
:deep(.leaflet-tile-container) {
  will-change: transform;
}

:deep(.leaflet-tile) {
  image-rendering: -webkit-optimize-contrast;
  image-rendering: crisp-edges;
}

/* Styles pour les marqueurs personnalisés */
:deep(.custom-marker) {
  background: transparent;
  border: none;
}

:deep(.leaflet-popup-content) {
  margin: 10px;
}

:deep(.leaflet-popup-content-wrapper) {
  border-radius: 8px;
}
</style>
