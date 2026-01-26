<template>
  <div v-if="show" class="map-legend">
    <div class="legend-header">
      <span class="legend-title">Légende</span>
      <button @click="$emit('close')" class="legend-close">×</button>
    </div>
    <div class="legend-items">
      <div class="legend-item">
        <span class="legend-icon" style="border-color: #f59e0b; color: #f59e0b;">⏱</span>
        <span class="legend-text">En attente</span>
      </div>
      <div class="legend-item">
        <span class="legend-icon" style="border-color: #3b82f6; color: #3b82f6;">⚙</span>
        <span class="legend-text">En cours</span>
      </div>
      <div class="legend-item">
        <span class="legend-icon" style="border-color: #10b981; color: #10b981;">✓</span>
        <span class="legend-text">Résolu</span>
      </div>
      <div class="legend-item">
        <span class="legend-icon" style="border-color: #ef4444; color: #ef4444;">✕</span>
        <span class="legend-text">Rejeté</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  show: boolean;
}>();

defineEmits<{
  (e: 'close'): void;
}>();
</script>

<style scoped>
.map-legend {
  position: fixed;
  bottom: 80px;
  right: 16px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 12px;
  min-width: 180px;
  z-index: 1000;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.legend-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 2px solid #f0f0f0;
}

.legend-title {
  font-weight: 600;
  font-size: 0.95rem;
  color: #1a1a1a;
}

.legend-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #666;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background 0.2s;
}

.legend-close:hover {
  background: #f5f5f5;
}

.legend-items {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.legend-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2.5px solid;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: bold;
  flex-shrink: 0;
}

.legend-text {
  font-size: 0.9rem;
  color: #4b5563;
  font-weight: 500;
}
</style>
