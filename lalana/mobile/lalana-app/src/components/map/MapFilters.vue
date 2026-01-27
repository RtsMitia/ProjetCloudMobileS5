<template>
  <ion-toolbar v-if="show" class="filters-toolbar">
    <div class="filters-container">
      <!-- Filtre par statut -->
      <div class="filter-section">
        <label class="filter-label">Statut</label>
        <ion-segment :value="modelStatus" @ionChange="onStatusChange" class="modern-segment">
          <ion-segment-button value="all" class="modern-segment-button">
            <ion-label>Tous</ion-label>
          </ion-segment-button>
          <ion-segment-button value="En attente" class="modern-segment-button">
            <ion-label>En attente</ion-label>
          </ion-segment-button>
          <ion-segment-button value="En cours" class="modern-segment-button">
            <ion-label>En cours</ion-label>
          </ion-segment-button>
          <ion-segment-button value="Résolu" class="modern-segment-button">
            <ion-label>Résolu</ion-label>
          </ion-segment-button>
        </ion-segment>
      </div>
      
      <!-- Option "Mes signalements" si connecté -->
      <div v-if="isAuthenticated" class="filter-section">
        <label class="checkbox-container">
          <ion-checkbox 
            :checked="modelOnlyMine" 
            @ionChange="onOnlyMineChange"
            class="modern-checkbox"
          >
          </ion-checkbox>
          <span class="checkbox-label">Mes signalements uniquement</span>
        </label>
      </div>
    </div>
  </ion-toolbar>
</template>

<script setup lang="ts">
import { 
  IonToolbar, 
  IonSegment, 
  IonSegmentButton, 
  IonLabel, 
  IonCheckbox 
} from '@ionic/vue';

const props = defineProps<{
  show: boolean;
  modelStatus: string;
  modelOnlyMine: boolean;
  isAuthenticated: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelStatus', value: string): void;
  (e: 'update:modelOnlyMine', value: boolean): void;
  (e: 'filtersChanged'): void;
}>();

function onStatusChange(event: CustomEvent) {
  emit('update:modelStatus', event.detail.value);
  emit('filtersChanged');
}

function onOnlyMineChange(event: CustomEvent) {
  emit('update:modelOnlyMine', event.detail.checked);
  emit('filtersChanged');
}
</script>

<style scoped>
.filters-toolbar {
  --background: #f8f9fa;
  --border-color: #e5e7eb;
  border-bottom: 1px solid #e5e7eb;
}

.filters-container {
  padding: 16px;
  background: white;
  margin: 8px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.filter-section {
  margin-bottom: 16px;
}

.filter-section:last-child {
  margin-bottom: 0;
}

.filter-label {
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 10px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.modern-segment {
  --background: #f5f5f5;
  border-radius: 8px;
  padding: 4px;
}

.modern-segment-button {
  --color: #666;
  --color-checked: #1a1a1a;
  --background-checked: white;
  --indicator-height: 0;
  min-height: 36px;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.modern-segment-button::part(native) {
  transition: all 0.2s ease;
}

.modern-segment-button.segment-button-checked {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.checkbox-container {
  display: flex;
  align-items: center;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.checkbox-container:hover {
  background: #f0f1f3;
}

.modern-checkbox {
  --size: 20px;
  --checkbox-background-checked: #1a1a1a;
  --border-color-checked: #1a1a1a;
  --checkmark-color: white;
  margin: 0;
}

.checkbox-label {
  margin-left: 12px;
  font-size: 0.95rem;
  color: #1a1a1a;
  font-weight: 500;
  flex: 1;
}
</style>
