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
      
      <!-- Bouton d'ajout (seulement si connecté) -->
      <AddSignalementButton 
        :show="isAuthenticated" 
        @click="handleAddSignalement" 
      />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { IonPage, IonContent } from '@ionic/vue';
import { MapHeader, MapFilters, MapLoader, AddSignalementButton } from '@/components/map';
import { useAuth, useSignalements, useMap } from '@/composables';
import { alertService } from '@/services/alert.service';

// Composables
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
const { 
  isMapReady, 
  initMap, 
  destroyMap, 
  displaySignalements,
  addTempMarker,
  removeTempMarker
} = useMap();

// State local
const showFilters = ref(false);
const isCreatingSignalement = ref(false);

// Lifecycle
onMounted(() => {
  setTimeout(() => {
    initMap(handleMapClick);
    subscribeToSignalements();
  }, 100);
});

onUnmounted(() => {
  unsubscribeFromSignalements();
  destroyMap();
});

// Watchers
watch(filteredSignalements, (newSignalements) => {
  displaySignalements(newSignalements);
});

// Handlers
function handleFiltersChanged() {
  applyFilters();
}

async function handleLogout() {
  await logout();
}

async function handleAddSignalement() {
  isCreatingSignalement.value = true;
  await alertService.showSignalementModeInfo();
}

async function handleMapClick(lat: number, lng: number) {
  if (!isCreatingSignalement.value) return;

  // Ajouter marqueur temporaire
  addTempMarker(lat, lng);

  // Afficher le formulaire
  const formData = await alertService.showSignalementForm();

  if (formData) {
    try {
      await createSignalement(lat, lng, formData.description, formData.localisation || null);
      await alertService.showSuccess('Signalement créé avec succès !');
    } catch (error) {
      await alertService.showError('Impossible de créer le signalement. Vérifiez votre connexion.');
    }
  }

  // Cleanup
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
