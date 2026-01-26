<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Gestion des Problèmes</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <div class="problems-container">
        <!-- Stats -->
        <div class="stats-grid">
          <div class="stat-card">
            <h3>{{ stats.total }}</h3>
            <p>Total Problèmes</p>
          </div>
          <div class="stat-card">
            <h3>{{ stats.byStatus.ouvert }}</h3>
            <p>Ouverts</p>
          </div>
          <div class="stat-card">
            <h3>{{ stats.byStatus.enCours }}</h3>
            <p>En cours</p>
          </div>
          <div class="stat-card">
            <h3>{{ formatCurrency(stats.totalBudget) }}</h3>
            <p>Budget Total</p>
          </div>
        </div>

        <!-- Filtres -->
        <div class="filters">
          <ion-select v-model="selectedStatus" placeholder="Filtrer par statut">
            <ion-select-option value="all">Tous</ion-select-option>
            <ion-select-option value="Ouvert">Ouvert</ion-select-option>
            <ion-select-option value="En cours">En cours</ion-select-option>
            <ion-select-option value="Terminé">Terminé</ion-select-option>
          </ion-select>
        </div>

        <!-- Liste des problèmes -->
        <div class="problems-list">
          <div 
            v-for="(probleme, index) in filteredProblemes" :key="probleme.id ?? `problem-${index}`" 
            class="problem-card"
          >
            <div class="problem-header">
              <h3>{{ probleme.description }}</h3>
              <span :class="['status-badge', getStatusClass(probleme.statusNom)]">
                {{ probleme.statusLibelle }}
              </span>
            </div>
            
            <div class="problem-details">
              <p><strong>📍</strong> {{ probleme.localisation }}</p>
              <p><strong>📏</strong> Surface: {{ probleme.surface }} m²</p>
              <p><strong>💰</strong> Budget: {{ formatCurrency(probleme.budgetEstime) }}</p>
              <p><strong>📊</strong> Progression: {{ probleme.statusValeur }}%</p>
              
              <div v-if="probleme.entrepriseName" class="entreprise-info">
                <p><strong>🏢</strong> {{ probleme.entrepriseName }}</p>
                <p><strong>📞</strong> {{ probleme.entrepriseContact }}</p>
              </div>
            </div>

            <div class="problem-actions">
              <ion-button size="small" @click="viewDetails(probleme)">
                Détails
              </ion-button>
              <ion-button size="small" color="secondary" @click="updateStatus(probleme)">
                Mettre à jour
              </ion-button>
            </div>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonSelect,
  IonSelectOption,
  IonButton
} from '@ionic/vue';
import { useProblemes } from '@/composables';
import type { Probleme } from '@/types/firestore';

const {
  problemes,
  filteredProblemes,
  stats,
  selectedStatus,
  subscribeToProblemes,
  unsubscribeFromProblemes,
  applyFilters
} = useProblemes();

onMounted(() => {
  subscribeToProblemes();
});

watch(selectedStatus, () => {
  applyFilters();
});

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-MG', {
    style: 'currency',
    currency: 'MGA'
  }).format(amount);
}

function getStatusClass(status: string): string {
  switch (status) {
    case 'Ouvert':
      return 'status-open';
    case 'En cours':
      return 'status-progress';
    case 'Terminé':
      return 'status-completed';
    default:
      return '';
  }
}

function viewDetails(probleme: Probleme): void {
  console.log('Voir détails du problème:', probleme);
}

function updateStatus(probleme: Probleme): void {
  console.log('Mettre à jour le statut:', probleme);
}
</script>

<style scoped>
.problems-container {
  padding: 16px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
  margin-bottom: 24px;
}

.stat-card {
  background: white;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.stat-card h3 {
  margin: 0;
  font-size: 24px;
  color: #3b82f6;
}

.stat-card p {
  margin: 8px 0 0 0;
  font-size: 12px;
  color: #6b7280;
}

.filters {
  margin-bottom: 16px;
}

.problems-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.problem-card {
  background: white;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.problem-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.problem-header h3 {
  margin: 0;
  font-size: 16px;
  color: #1a1a1a;
  flex: 1;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}

.status-open {
  background: #fef3c7;
  color: #92400e;
}

.status-progress {
  background: #dbeafe;
  color: #1e40af;
}

.status-completed {
  background: #d1fae5;
  color: #065f46;
}

.problem-details {
  margin-bottom: 12px;
}

.problem-details p {
  margin: 6px 0;
  font-size: 14px;
  color: #4b5563;
}

.entreprise-info {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #e5e7eb;
}

.problem-actions {
  display: flex;
  gap: 8px;
}
</style>
