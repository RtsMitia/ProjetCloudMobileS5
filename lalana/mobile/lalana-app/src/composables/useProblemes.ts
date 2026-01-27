import { ref, computed, onUnmounted } from 'vue';
import { problemeService } from '@/services/firebase/probleme.service';
import type { Probleme, ProblemeRequest } from '@/types/firestore';
import { useAuth } from './useAuth';

export function useProblemes() {
  const { currentUser, isAuthenticated } = useAuth();
  
  const problemes = ref<Probleme[]>([]);
  const filteredProblemes = ref<Probleme[]>([]);
  const isLoading = ref(false);
  const error = ref<string>('');
  
  const selectedStatus = ref<string>('all');
  const filterBySignalement = ref<number | null>(null);
  
  let unsubscribe: (() => void) | null = null;

  function subscribeToProblemes(): void {
    unsubscribe = problemeService.subscribeToProblemes((newProblemes) => {
      problemes.value = newProblemes;
      applyFilters();
    });
  }

  function subscribeToProblemesBySignalement(signalementId: number): void {
    unsubscribe = problemeService.subscribeToProblemesBySignalement(
      signalementId, 
      (newProblemes) => {
        problemes.value = newProblemes;
        applyFilters();
      }
    );
  }

  function unsubscribeFromProblemes(): void {
    if (unsubscribe) {
      unsubscribe();
      unsubscribe = null;
    }
  }

  function applyFilters(): void {
    let filtered = [...problemes.value];

    if (selectedStatus.value !== 'all') {
      filtered = filtered.filter(p => p.statusNom === selectedStatus.value);
    }

    if (filterBySignalement.value !== null) {
      filtered = filtered.filter(p => p.signalementId === filterBySignalement.value);
    }

    filteredProblemes.value = filtered;
  }

  async function createProbleme(data: ProblemeRequest): Promise<string> {
    isLoading.value = true;
    error.value = '';

    try {
      const id = await problemeService.createProbleme(data);
      console.log('✅ Problème créé:', id);
      return id;
    } catch (e: any) {
      error.value = 'Impossible de créer le problème';
      console.error('❌ Erreur:', e);
      throw e;
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchProblemesBySignalement(signalementId: number): Promise<Probleme[]> {
    isLoading.value = true;
    try {
      return await problemeService.getProblemesBySignalement(signalementId);
    } catch (e: any) {
      error.value = 'Impossible de récupérer les problèmes';
      throw e;
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchProblemesByUser(userId: number): Promise<Probleme[]> {
    isLoading.value = true;
    try {
      return await problemeService.getProblemesByUser(userId);
    } catch (e: any) {
      error.value = 'Impossible de récupérer les problèmes';
      throw e;
    } finally {
      isLoading.value = false;
    }
  }

  async function updateStatus(
    problemeId: string,
    statusId: number,
    statusNom: string,
    statusValeur: number,
    statusLibelle: string
  ): Promise<void> {
    isLoading.value = true;
    try {
      await problemeService.updateProblemeStatus(
        problemeId, 
        statusId, 
        statusNom, 
        statusValeur,
        statusLibelle
      );
      console.log('✅ Statut du problème mis à jour');
    } catch (e: any) {
      error.value = 'Impossible de mettre à jour le statut';
      throw e;
    } finally {
      isLoading.value = false;
    }
  }

  async function assignEntreprise(
    problemeId: string,
    entrepriseId: number,
    entrepriseName: string,
    entrepriseContact: string
  ): Promise<void> {
    isLoading.value = true;
    try {
      await problemeService.assignEntreprise(
        problemeId,
        entrepriseId,
        entrepriseName,
        entrepriseContact
      );
      console.log('✅ Entreprise assignée au problème');
    } catch (e: any) {
      error.value = 'Impossible d\'assigner l\'entreprise';
      throw e;
    } finally {
      isLoading.value = false;
    }
  }

  // Statistiques
  const stats = computed(() => ({
    total: problemes.value.length,
    filtered: filteredProblemes.value.length,
    byStatus: {
      ouvert: problemes.value.filter(p => p.statusNom === 'Ouvert').length,
      enCours: problemes.value.filter(p => p.statusNom === 'En cours').length,
      termine: problemes.value.filter(p => p.statusNom === 'Terminé').length,
    },
    averageBudget: problemes.value.length > 0
      ? problemes.value.reduce((sum, p) => sum + p.budgetEstime, 0) / problemes.value.length
      : 0,
    totalBudget: problemes.value.reduce((sum, p) => sum + p.budgetEstime, 0),
    totalSurface: problemes.value.reduce((sum, p) => sum + p.surface, 0),
  }));

  // Cleanup automatique
  onUnmounted(() => {
    unsubscribeFromProblemes();
  });

  return {
    // State
    problemes,
    filteredProblemes,
    isLoading,
    error,
    stats,
    
    // Filtres
    selectedStatus,
    filterBySignalement,
    
    // Actions
    subscribeToProblemes,
    subscribeToProblemesBySignalement,
    unsubscribeFromProblemes,
    applyFilters,
    createProbleme,
    fetchProblemesBySignalement,
    fetchProblemesByUser,
    updateStatus,
    assignEntreprise
  };
}
